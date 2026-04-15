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
import { buildCheckoutBlueprint } from '@/lib/memories/make-scenario-migration';
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

function escapeJsonString(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function deriveAppBaseUrl(memoriesBlueprint: Record<string, unknown>) {
  const flow = requireFlow(memoriesBlueprint);
  const callbackModule = flow.find(
    (entry) => entry.module === 'http:ActionSendData' && entry.mapper && typeof entry.mapper === 'object',
  );

  if (!callbackModule) {
    throw new HttpError(500, 'Memories blueprint did not include the canonical app callback module.');
  }

  const mapper = assertRecord(callbackModule.mapper, 'Memories callback mapper was not an object.');
  if (typeof mapper.url !== 'string' || !mapper.url.includes('/api/')) {
    throw new HttpError(500, 'Memories callback mapper did not include a usable app callback URL.');
  }

  return mapper.url.split('/api/')[0] || '';
}

function createHttpJsonGetModule(input: {
  id: number;
  designer?: Record<string, unknown>;
  url: string;
  internalSecret: string;
}) {
  return {
    id: input.id,
    module: 'http:ActionSendData',
    version: 3,
    mapper: {
      ca: '',
      qs: [],
      url: input.url,
      data: '',
      gzip: true,
      method: 'get',
      headers: [
        {
          name: 'Authorization',
          value: `Bearer ${input.internalSecret}`,
        },
      ],
      timeout: '',
      authPass: '',
      authUser: '',
      bodyType: 'raw',
      contentType: 'application/json',
      shareCookies: false,
      parseResponse: false,
      followRedirect: true,
      useQuerystring: false,
      rejectUnauthorized: true,
    },
    metadata: {
      designer: input.designer || { x: 0, y: 0 },
    },
    parameters: {
      handleErrors: false,
    },
  };
}

function createWebhookRespondModule(input: {
  id: number;
  designer?: Record<string, unknown>;
  body: string;
}) {
  return {
    id: input.id,
    module: 'gateway:WebhookRespond',
    version: 1,
    mapper: {
      body: input.body,
      status: '200',
      headers: [
        {
          key: 'Content-Type',
          value: 'application/json',
        },
      ],
    },
    metadata: {
      designer: input.designer || { x: 0, y: 0 },
    },
    parameters: {},
  };
}

function createJsonParseModule(input: {
  id: number;
  designer?: Record<string, unknown>;
  source: string;
}) {
  return {
    id: input.id,
    module: 'json:ParseJSON',
    version: 1,
    mapper: {
      json: input.source,
    },
    metadata: {
      designer: input.designer || { x: 0, y: 0 },
      parameters: [
        {
          name: 'type',
          type: 'udt',
          label: 'Data structure',
        },
      ],
    },
    parameters: {
      type: '',
    },
  };
}

function buildPreviewLoopBlueprint(
  currentBlueprint: Record<string, unknown>,
  appBaseUrl: string,
  internalSecret: string,
) {
  const flow = requireFlow(currentBlueprint);
  const trigger = cloneModule(requireModule(flow, 1, 'Preview Loop'));
  const oldLookup = requireModule(flow, 5, 'Preview Loop');
  const router = requireModule(flow, 6, 'Preview Loop');
  const routes = Array.isArray(router.routes) ? router.routes : [];
  const successRoute = routes[0];
  const successFlow = successRoute && typeof successRoute === 'object' && Array.isArray((successRoute as { flow?: unknown[] }).flow)
    ? (successRoute as { flow: unknown[] }).flow
    : [];
  const responseModule = successFlow[0]
    ? asFlowModule(successFlow[0], 'Preview Loop success response module was not an object.')
    : null;

  const legacyUrl =
    `${normalizeBaseUrl(appBaseUrl)}/api/memories/{{ifempty(1.jobId; ifempty(1.id; 1.job_id))}}/legacy-state`;

  return {
    ...cloneModule(currentBlueprint),
    flow: [
      trigger,
      createHttpJsonGetModule({
        id: 5,
        designer: assertRecord(oldLookup.metadata, 'Preview Loop module 5 metadata was not an object.')
          .designer as Record<string, unknown>,
        url: legacyUrl,
        internalSecret,
      }),
      createWebhookRespondModule({
        id: responseModule?.id && typeof responseModule.id === 'number' ? responseModule.id : 4,
        designer:
          responseModule && responseModule.metadata && typeof responseModule.metadata === 'object'
            ? (assertRecord(responseModule.metadata, 'Preview Loop response metadata was not an object.')
                .designer as Record<string, unknown>)
            : { x: 586, y: 1 },
        body: '{{5.data}}',
      }),
    ],
  };
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
  if (!config.internalApiSecret) {
    throw new HttpError(503, 'MEMORIES_INTERNAL_API_SECRET is required for the Make migration.');
  }

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

  const appBaseUrl = deriveAppBaseUrl(memories.blueprint);
  const targets: ScenarioTarget[] = [
    {
      expectedName: 'Checkout',
      scenarioId: byName.Checkout.id,
      blueprint: buildCheckoutBlueprint(
        before.find((scenario) => scenario.name === 'Checkout')!.blueprint,
        appBaseUrl,
        config.internalApiSecret,
      ),
      description:
        'Canonical checkout follow-up: Stripe event -> app-owned legacy state lookup -> delivery email -> delivered callback. Google Sheets removed from this path.',
    },
    {
      expectedName: 'Preview Loop',
      scenarioId: byName['Preview Loop'].id,
      blueprint: buildPreviewLoopBlueprint(
        before.find((scenario) => scenario.name === 'Preview Loop')!.blueprint,
        appBaseUrl,
        config.internalApiSecret,
      ),
      description:
        'Canonical preview/status compatibility loop backed by app-owned job state. Google Sheets removed from this path.',
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
