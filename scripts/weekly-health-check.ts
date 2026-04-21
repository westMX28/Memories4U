import { getMemoriesConfig } from '@/lib/memories/config';
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
import { loadMemoriesRuntimeEnv } from '@/lib/memories/runtime-env';
import { getStripeClient, getStripeConfigurationStatus } from '@/lib/memories/stripe';
import { validateSupabaseRestAccess } from '@/lib/memories/supabase-validation';

type HealthCheckResult = {
  name: string;
  ok: boolean;
  details: Record<string, unknown>;
};

function normalizeBaseUrl(value: string) {
  return value.replace(/\/$/, '');
}

async function probeUrl(
  url: string,
  expectedStatuses: number[],
  headers?: Record<string, string>,
) {
  const response = await fetch(url, {
    method: 'GET',
    headers,
    redirect: 'manual',
  });

  const body = await response.text();
  const ok = expectedStatuses.includes(response.status);

  return {
    ok,
    status: response.status,
    url,
    detail: ok ? 'reachable' : body.trim().slice(0, 240) || 'unexpected response',
  };
}

async function runCheck(
  name: string,
  work: () => Promise<Record<string, unknown>>,
): Promise<HealthCheckResult> {
  try {
    return {
      name,
      ok: true,
      details: await work(),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      name,
      ok: false,
      details: { error: message },
    };
  }
}

async function validatePublicRoutes() {
  const { appUrl } = getMemoriesConfig();
  if (!appUrl) {
    throw new Error('MEMORIES_APP_URL is not configured.');
  }

  const baseUrl = normalizeBaseUrl(appUrl);
  const checks = await Promise.all([
    probeUrl(`${baseUrl}/`, [200]),
    probeUrl(`${baseUrl}/status`, [200]),
    probeUrl(`${baseUrl}/operator/orders`, [200]),
  ]);

  const failed = checks.find((check) => !check.ok);
  if (failed) {
    throw new Error(`${failed.url} returned ${failed.status}: ${failed.detail}`);
  }

  return {
    appUrl: baseUrl,
    checks,
  };
}

async function validateInternalRoute() {
  const { appUrl, internalApiSecret } = getMemoriesConfig();
  if (!appUrl) {
    throw new Error('MEMORIES_APP_URL is not configured.');
  }

  if (!internalApiSecret) {
    throw new Error('MEMORIES_INTERNAL_API_SECRET is not configured.');
  }

  const url = `${normalizeBaseUrl(appUrl)}/api/memories/weekly-health-check/operator-status`;
  const probe = await probeUrl(url, [404], {
    authorization: `Bearer ${internalApiSecret}`,
  });

  if (!probe.ok) {
    throw new Error(`${probe.url} returned ${probe.status}: ${probe.detail}`);
  }

  return {
    probe,
  };
}

async function validateStripeRuntime() {
  const config = getMemoriesConfig();
  const configuration = getStripeConfigurationStatus();

  if (!configuration.available) {
    throw new Error(configuration.reason);
  }

  if (!config.stripeWebhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured.');
  }

  const stripe = getStripeClient();
  const price = await stripe.prices.retrieve(config.stripePriceId);

  return {
    priceId: price.id,
    active: price.active,
    currency: price.currency,
    unitAmount: price.unit_amount,
    webhookSecretConfigured: true,
  };
}

async function validateMakeMutationPath() {
  const summary = await validateMakeManagementAccess();
  const folderName = `WES-389 weekly health ${Date.now()}`;
  const folder = await createMakeScenarioFolder(folderName);

  let scenarioId: number | null = null;

  try {
    const scenario = await createMakeScenario({
      name: 'WES-389 weekly health validation scenario',
      teamId: summary.team.id,
      folderId: folder.id,
      blueprint: createValidationBlueprint('WES-389 weekly health validation scenario'),
      scheduling: createValidationScheduling(900),
      description: 'Temporary validation scenario for the weekly technical health check.',
    });
    scenarioId = scenario.id;

    const updated = await updateMakeScenario(scenario.id, {
      name: 'WES-389 weekly health validation scenario patched',
      description: 'Temporary scenario patched by the weekly technical health check.',
      scheduling: createValidationScheduling(1800),
    });

    await deleteMakeScenario(updated.id);
    scenarioId = null;
    await deleteMakeScenarioFolder(folder.id);

    return {
      organization: summary.organization,
      team: summary.team,
      scenarioCount: summary.scenarios.length,
      validatedMutationPath: true,
    };
  } catch (error) {
    if (scenarioId) {
      await deleteMakeScenario(scenarioId).catch(() => undefined);
    }

    await deleteMakeScenarioFolder(folder.id).catch(() => undefined);
    throw error;
  }
}

async function main() {
  loadMemoriesRuntimeEnv();

  const config = getMemoriesConfig();
  const checks = await Promise.all([
    runCheck('runtime-config', async () => ({
      appUrl: config.appUrl || null,
      internalApiSecretConfigured: Boolean(config.internalApiSecret),
      supabaseConfigured: Boolean(config.supabaseUrl && config.supabaseServiceRoleKey),
      stripeConfigured: getStripeConfigurationStatus().available,
      stripeWebhookSecretConfigured: Boolean(config.stripeWebhookSecret),
      makeManagementConfigured: Boolean(
        config.makeApiKey && config.makeOrganizationId && config.makeTeamId,
      ),
    })),
    runCheck('public-routes', validatePublicRoutes),
    runCheck('internal-route', validateInternalRoute),
    runCheck('supabase-rest', validateSupabaseRestAccess),
    runCheck('stripe-runtime', validateStripeRuntime),
    runCheck('make-mutation-path', validateMakeMutationPath),
  ]);

  const result = {
    ok: checks.every((check) => check.ok),
    checkedAt: new Date().toISOString(),
    checks,
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.ok) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
