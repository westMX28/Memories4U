import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { getMemoriesConfig } from '@/lib/memories/config';
import { HttpError } from '@/lib/memories/errors';
import {
  getMakeScenario,
  getMakeScenarioBlueprint,
  listMakeScenarios,
  updateMakeScenario,
} from '@/lib/memories/make-management';
import {
  buildCheckoutBlueprint,
  buildPreviewLoopBlueprint,
} from '@/lib/memories/make-scenario-migration';
import { loadMemoriesRuntimeEnv } from '@/lib/memories/runtime-env';

type ScenarioSnapshot = {
  id: number;
  name: string;
  description: string;
  usedPackages?: string[];
  blueprint: Record<string, unknown>;
};

type ScenarioTarget = {
  expectedName: string;
  scenarioId: number;
  blueprint: Record<string, unknown>;
  description?: string;
};

const activeScenarioNames = ['Checkout', 'Memories', 'Memories Store Write', 'Preview Loop'] as const;

function assertRecord(value: unknown, message: string) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new HttpError(500, message);
  }

  return value as Record<string, unknown>;
}

function asFlowModule(value: unknown, message: string) {
  return assertRecord(value, message);
}

function requireFlow(blueprint: Record<string, unknown>) {
  if (!Array.isArray(blueprint.flow)) {
    throw new HttpError(500, 'Make blueprint is missing flow.');
  }

  return blueprint.flow.map((entry, index) =>
    asFlowModule(entry, `Make blueprint flow[${index}] was not an object.`),
  );
}

function requireModule(
  flow: Array<Record<string, unknown>>,
  id: number,
  scenarioName: string,
) {
  const match = flow.find((entry) => entry.id === id);
  if (!match) {
    throw new HttpError(500, `${scenarioName} blueprint did not include module ${id}.`);
  }

  return match;
}

function cloneModule<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function normalizeBaseUrl(raw: string) {
  return raw.replace(/\/$/, '');
}

function deriveAppBaseUrl(
  blueprint: Record<string, unknown>,
  scenarioName: string,
) {
  const flow = requireFlow(blueprint);
  const callbackModule = flow.find(
    (entry) => entry.module === 'http:ActionSendData' && entry.mapper && typeof entry.mapper === 'object',
  );

  if (!callbackModule) {
    throw new HttpError(500, `${scenarioName} blueprint did not include the canonical app callback module.`);
  }

  const mapper = assertRecord(callbackModule.mapper, 'Memories callback mapper was not an object.');
  if (typeof mapper.url !== 'string' || !mapper.url.includes('/api/')) {
    throw new HttpError(500, 'Memories callback mapper did not include a usable app callback URL.');
  }

  return mapper.url.split('/api/')[0] || '';
}

function resolveAppBaseUrl(
  snapshots: ScenarioSnapshot[],
  configuredAppUrl: string,
) {
  const candidates = ['Memories', 'Preview Loop', 'Checkout'] as const;

  for (const name of candidates) {
    const snapshot = snapshots.find((scenario) => scenario.name === name);
    if (!snapshot) {
      continue;
    }

    try {
      return deriveAppBaseUrl(snapshot.blueprint, name);
    } catch {
      continue;
    }
  }

  if (configuredAppUrl.trim()) {
    return normalizeBaseUrl(configuredAppUrl);
  }

  throw new HttpError(
    500,
    'Could not derive the Memories app base URL from the live Make blueprints, and MEMORIES_APP_URL is not configured.',
  );
}

function buildDeprecatedStoreWriteBlueprint(currentBlueprint: Record<string, unknown>) {
  const flow = requireFlow(currentBlueprint);
  const trigger = cloneModule(requireModule(flow, 1, 'Memories Store Write'));
  const response = cloneModule(requireModule(flow, 3, 'Memories Store Write'));

  return {
    ...cloneModule(currentBlueprint),
    flow: [
      trigger,
      {
        ...response,
        mapper: {
          body: '{"accepted":false,"deprecated":true,"reason":"write_webhook_retired_use_direct_memories_generation_webhook"}',
          status: '410',
          headers: [
            {
              key: 'Content-Type',
              value: 'application/json',
            },
          ],
        },
      },
    ],
  };
}

async function writeSnapshot(root: string, snapshot: ScenarioSnapshot) {
  const filePath = path.join(root, `scenario-${snapshot.id}-${snapshot.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`);
  await writeFile(
    filePath,
    JSON.stringify(snapshot, null, 2),
    'utf8',
  );
}

async function main() {
  loadMemoriesRuntimeEnv();

  const config = getMemoriesConfig();
  const scenarios = await listMakeScenarios();
  const activeScenarios = scenarios.filter((scenario) =>
    activeScenarioNames.includes(scenario.name as (typeof activeScenarioNames)[number]),
  );

  if (activeScenarios.length !== activeScenarioNames.length) {
    throw new HttpError(
      500,
      `Expected ${activeScenarioNames.length} active Memories scenarios, found ${activeScenarios.length}.`,
    );
  }

  const byName = Object.fromEntries(activeScenarios.map((scenario) => [scenario.name, scenario]));
  const before = await Promise.all(
    activeScenarioNames.map(async (name) => {
      const scenario = byName[name];
      const blueprint = await getMakeScenarioBlueprint(scenario.id);
      return {
        id: scenario.id,
        name: scenario.name,
        description: scenario.description,
        usedPackages: (await getMakeScenario(scenario.id) as { usedPackages?: string[] }).usedPackages,
        blueprint,
      } satisfies ScenarioSnapshot;
    }),
  );

  const backupRoot = path.join(process.cwd(), 'tmp', 'make-backups', `wes-338-${Date.now()}`);
  await mkdir(backupRoot, { recursive: true });
  await Promise.all(before.map((snapshot) => writeSnapshot(backupRoot, snapshot)));

  const memories = before.find((scenario) => scenario.name === 'Memories');
  if (!memories) {
    throw new HttpError(500, 'Memories scenario was missing from the live inventory.');
  }

  const appBaseUrl = resolveAppBaseUrl(before, config.appUrl);
  const targets: ScenarioTarget[] = [
    {
      expectedName: 'Checkout',
      scenarioId: byName.Checkout.id,
      blueprint: buildCheckoutBlueprint(
        before.find((scenario) => scenario.name === 'Checkout')!.blueprint,
        appBaseUrl,
        memories.blueprint,
      ),
      description:
        'Canonical checkout follow-up: Stripe event -> native Supabase order lookup -> status email only. App-owned checkout creation and Stripe webhook payment confirmation stay upstream; final delivery remains owned by downstream completion truth.',
    },
    {
      expectedName: 'Preview Loop',
      scenarioId: byName['Preview Loop'].id,
      blueprint: buildPreviewLoopBlueprint(
        before.find((scenario) => scenario.name === 'Preview Loop')!.blueprint,
        memories.blueprint,
      ),
      description:
        'Canonical preview/status compatibility loop backed directly by native Supabase order state. App-owned legacy-state route removed from this path.',
    },
    {
      expectedName: 'Memories Store Write',
      scenarioId: byName['Memories Store Write'].id,
      blueprint: buildDeprecatedStoreWriteBlueprint(
        before.find((scenario) => scenario.name === 'Memories Store Write')!.blueprint,
      ),
      description:
        'Retired legacy write-webhook sheet sink after direct Memories generation webhook cutover. Responds with explicit deprecation instead of persisting Google Sheets state.',
    },
  ];

  for (const target of targets) {
    await updateMakeScenario(target.scenarioId, {
      description: target.description,
      blueprint: target.blueprint,
    });
  }

  const after = await Promise.all(
    activeScenarioNames.map(async (name) => {
      const scenario = await getMakeScenario(byName[name].id);
      return {
        id: scenario.id,
        name: scenario.name,
        description: scenario.description,
        usedPackages: (scenario as { usedPackages?: string[] }).usedPackages || [],
      };
    }),
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        backupRoot,
        appBaseUrl,
        before: before.map((scenario) => ({
          id: scenario.id,
          name: scenario.name,
          usedPackages: scenario.usedPackages || [],
        })),
        after,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
