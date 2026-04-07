import { loadMemoriesRuntimeEnv } from '@/lib/memories/runtime-env';
import {
  createMakeScenario,
  createMakeScenarioFolder,
  createValidationBlueprint,
  createValidationScheduling,
  deleteMakeScenario,
  deleteMakeScenarioFolder,
  updateMakeScenario,
  validateMakeManagementAccess,
} from '@/lib/memories/make-management';

loadMemoriesRuntimeEnv();

async function main() {
  const summary = await validateMakeManagementAccess();
  const folderName = `WES-89 validation ${Date.now()}`;
  const folder = await createMakeScenarioFolder(folderName);

  let scenarioId: number | null = null;

  try {
    const scenario = await createMakeScenario({
      name: 'WES-89 validation scenario',
      teamId: summary.team.id,
      folderId: folder.id,
      blueprint: createValidationBlueprint('WES-89 validation scenario'),
      scheduling: createValidationScheduling(900),
      description: 'Temporary validation scenario for automated Make access checks.',
    });
    scenarioId = scenario.id;

    const updated = await updateMakeScenario(scenario.id, {
      name: 'WES-89 validation scenario patched',
      description: 'Temporary validation scenario patched by the local Make validation script.',
      scheduling: createValidationScheduling(1800),
    });

    await deleteMakeScenario(updated.id);
    scenarioId = null;
    await deleteMakeScenarioFolder(folder.id);

    console.log(
      JSON.stringify(
        {
          ok: true,
          user: summary.user,
          organization: summary.organization,
          team: summary.team,
          scenarioCount: summary.scenarios.length,
          validatedMutationPath: true,
        },
        null,
        2,
      ),
    );
  } catch (error) {
    if (scenarioId) {
      await deleteMakeScenario(scenarioId).catch(() => undefined);
    }

    await deleteMakeScenarioFolder(folder.id).catch(() => undefined);
    throw error;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
