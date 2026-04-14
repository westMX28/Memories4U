import path from 'node:path';

const defaultDataFile = path.join(process.cwd(), '.data', 'memories-jobs.json');
const defaultMakeTimeoutMs = 8000;
const defaultSupabaseTimeoutMs = 8000;
const defaultMaxSourceImageBytes = 4_000_000;
const defaultMakeApiBaseUrl = 'https://eu1.make.com/api/v2';

function readPositiveIntegerEnv(value: string | undefined, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

function readEnv(name: string) {
  return Object.prototype.hasOwnProperty.call(process.env, name) ? process.env[name] || '' : undefined;
}

function firstDefined(...values: Array<string | undefined>) {
  return values.find((value) => value !== undefined);
}

function firstNonEmpty(...values: Array<string | undefined>) {
  return values.find((value) => typeof value === 'string' && value.trim()) || '';
}

function parseLegacyMakeUrl() {
  const raw = process.env.MAKE_URL || '';
  if (!raw) {
    return { apiBaseUrl: '', organizationId: '' };
  }

  try {
    const parsed = new URL(raw);
    const organizationMatch = parsed.pathname.match(/\/organization\/(\d+)/);

    return {
      apiBaseUrl: `${parsed.origin}/api/v2`,
      organizationId: organizationMatch?.[1] || '',
    };
  } catch {
    return { apiBaseUrl: '', organizationId: '' };
  }
}

export function getMemoriesConfig() {
  const configuredDataFile = process.env.MEMORIES_DATA_FILE
    ? path.resolve(/* turbopackIgnore: true */ process.cwd(), process.env.MEMORIES_DATA_FILE)
    : defaultDataFile;
  const legacyMakeUrl = parseLegacyMakeUrl();

  return {
    appUrl: process.env.MEMORIES_APP_URL || '',
    dataFile: configuredDataFile,
    internalApiSecret: process.env.MEMORIES_INTERNAL_API_SECRET || '',
    supabaseUrl: firstDefined(readEnv('MEMORIES_SUPABASE_URL'), readEnv('SUPABASE_URL')) || '',
    supabaseServiceRoleKey:
      firstDefined(readEnv('MEMORIES_SUPABASE_SERVICE_ROLE_KEY'), readEnv('SUPABASE_API')) || '',
    supabaseTimeoutMs: readPositiveIntegerEnv(
      process.env.MEMORIES_SUPABASE_TIMEOUT_MS,
      defaultSupabaseTimeoutMs,
    ),
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || process.env.STRIPE_API_KEY || '',
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    stripePriceId: process.env.STRIPE_PRICE_ID || '',
    makeWebhookUrl:
      firstDefined(readEnv('MEMORIES_MAKE_WEBHOOK_URL'), readEnv('MAKE_WEBHOOK_URL')) || '',
    makeReadWebhookUrl:
      firstDefined(
        readEnv('MEMORIES_MAKE_READ_WEBHOOK_URL'),
        readEnv('MAKE_READ_WEBHOOK_URL'),
        readEnv('MEMORIES_MAKE_WEBHOOK_URL'),
        readEnv('MAKE_WEBHOOK_URL'),
      ) || '',
    makeWriteWebhookUrl:
      firstDefined(
        readEnv('MEMORIES_MAKE_WRITE_WEBHOOK_URL'),
        readEnv('MAKE_WRITE_WEBHOOK_URL'),
        readEnv('MEMORIES_MAKE_WEBHOOK_URL'),
        readEnv('MAKE_WEBHOOK_URL'),
      ) || '',
    makeApiKey: firstDefined(readEnv('MEMORIES_MAKE_API_KEY'), readEnv('MAKE_API')) || '',
    makeApiBaseUrl: firstNonEmpty(
      readEnv('MEMORIES_MAKE_API_BASE_URL'),
      readEnv('MAKE_API_BASE_URL'),
      legacyMakeUrl.apiBaseUrl,
      defaultMakeApiBaseUrl,
    ),
    makeOrganizationId: firstNonEmpty(
      readEnv('MEMORIES_MAKE_ORGANIZATION_ID'),
      readEnv('MAKE_ORGANIZATION_ID'),
      readEnv('MAKE_ORG_ID'),
      legacyMakeUrl.organizationId,
    ),
    makeTeamId: firstDefined(readEnv('MEMORIES_MAKE_TEAM_ID'), readEnv('MAKE_TEAM_ID')) || '',
    makeTimeoutMs: readPositiveIntegerEnv(
      process.env.MEMORIES_MAKE_TIMEOUT_MS,
      defaultMakeTimeoutMs,
    ),
    maxSourceImageBytes: readPositiveIntegerEnv(
      process.env.MEMORIES_MAX_SOURCE_IMAGE_BYTES,
      defaultMaxSourceImageBytes,
    ),
    cloudinaryCloudName: process.env.MEMORIES_CLOUDINARY_CLOUD_NAME || '',
    cloudinaryApiKey: firstDefined(readEnv('MEMORIES_CLOUDINARY_API_KEY'), readEnv('CLOUDINARY_API')) || '',
    cloudinaryApiSecret:
      firstDefined(readEnv('MEMORIES_CLOUDINARY_API_SECRET'), readEnv('CLOUDINARY_SECRET')) || '',
    cloudinaryUploadFolder: process.env.MEMORIES_CLOUDINARY_UPLOAD_FOLDER || 'Memories',
  };
}
