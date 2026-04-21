import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { HttpError } from '@/lib/memories/errors';
import {
  getMakeScenario,
  getMakeScenarioBlueprint,
  listMakeScenarios,
  updateMakeScenario,
} from '@/lib/memories/make-management';
import { buildMemoriesBirthdayIdentityBlueprint } from '@/lib/memories/make-scenario-migration';
import { loadMemoriesRuntimeEnv } from '@/lib/memories/runtime-env';

type ScenarioSnapshot = {
  id: number;
  name: string;
  description: string;
  usedPackages?: string[];
  blueprint: Record<string, unknown>;
};

async function writeSnapshot(root: string, name: string, snapshot: ScenarioSnapshot) {
  const filePath = path.join(root, name);
  await writeFile(filePath, JSON.stringify(snapshot, null, 2), 'utf8');
}

async function main() {
  loadMemoriesRuntimeEnv();

  const scenarios = await listMakeScenarios();
  const memories = scenarios.find((scenario) => scenario.name === 'Memories');

  if (!memories) {
    throw new HttpError(500, 'Live Memories scenario was not found in Make.');
  }

  const [details, blueprint] = await Promise.all([
    getMakeScenario(memories.id),
    getMakeScenarioBlueprint(memories.id),
  ]);

  const before = {
    id: memories.id,
    name: memories.name,
    description: memories.description,
    usedPackages: (details as { usedPackages?: string[] }).usedPackages,
    blueprint,
  } satisfies ScenarioSnapshot;

  const upgradedBlueprint = buildMemoriesBirthdayIdentityBlueprint(before.blueprint);
  const backupRoot = path.join(process.cwd(), 'tmp', 'make-backups', `wes-401-${Date.now()}`);
  await mkdir(backupRoot, { recursive: true });
  await writeSnapshot(backupRoot, `scenario-${memories.id}-memories-before.json`, before);

  await updateMakeScenario(memories.id, {
    description:
      'Birthday generation pipeline upgraded for stronger likeness preservation: structured prompt-builder stage, explicit identity-drift constraints, and high-fidelity GPT Image edit settings.',
    blueprint: upgradedBlueprint,
  });

  const after = await getMakeScenarioBlueprint(memories.id);
  await writeSnapshot(backupRoot, `scenario-${memories.id}-memories-after.json`, {
    ...before,
    blueprint: after,
    description:
      'Birthday generation pipeline upgraded for stronger likeness preservation: structured prompt-builder stage, explicit identity-drift constraints, and high-fidelity GPT Image edit settings.',
  });

  console.log(
    JSON.stringify(
      {
        ok: true,
        scenarioId: memories.id,
        scenarioName: memories.name,
        backupRoot,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  const status = error instanceof HttpError ? error.status : 1;
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(message);
  process.exit(status >= 400 ? 1 : status);
});
