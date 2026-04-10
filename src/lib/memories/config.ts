import path from 'node:path';

const defaultDataFile = path.join(process.cwd(), '.data', 'memories-jobs.json');
const defaultMakeTimeoutMs = 8000;
const defaultMaxSourceImageBytes = 4_000_000;

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

export function getMemoriesConfig() {
  const configuredDataFile = process.env.MEMORIES_DATA_FILE
    ? path.resolve(/* turbopackIgnore: true */ process.cwd(), process.env.MEMORIES_DATA_FILE)
    : defaultDataFile;

  return {
    appUrl: process.env.MEMORIES_APP_URL || '',
    dataFile: configuredDataFile,
    internalApiSecret: process.env.MEMORIES_INTERNAL_API_SECRET || '',
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || process.env.STRIPE_API_KEY || '',
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    stripePriceId: process.env.STRIPE_PRICE_ID || '',
    makeWebhookUrl: process.env.MEMORIES_MAKE_WEBHOOK_URL || '',
    makeReadWebhookUrl:
      process.env.MEMORIES_MAKE_READ_WEBHOOK_URL ||
      process.env.MEMORIES_MAKE_WEBHOOK_URL ||
      '',
    makeWriteWebhookUrl:
      process.env.MEMORIES_MAKE_WRITE_WEBHOOK_URL ||
      process.env.MEMORIES_MAKE_WEBHOOK_URL ||
      '',
    makeApiKey: process.env.MEMORIES_MAKE_API_KEY || '',
    makeApiBaseUrl: process.env.MEMORIES_MAKE_API_BASE_URL || 'https://eu1.make.com/api/v2',
    makeOrganizationId: process.env.MEMORIES_MAKE_ORGANIZATION_ID || '',
    makeTeamId: process.env.MEMORIES_MAKE_TEAM_ID || '',
    makeTimeoutMs: readPositiveIntegerEnv(
      process.env.MEMORIES_MAKE_TIMEOUT_MS,
      defaultMakeTimeoutMs,
    ),
    maxSourceImageBytes: readPositiveIntegerEnv(
      process.env.MEMORIES_MAX_SOURCE_IMAGE_BYTES,
      defaultMaxSourceImageBytes,
    ),
    cloudinaryCloudName: process.env.MEMORIES_CLOUDINARY_CLOUD_NAME || '',
    cloudinaryApiKey: process.env.MEMORIES_CLOUDINARY_API_KEY || '',
    cloudinaryApiSecret: process.env.MEMORIES_CLOUDINARY_API_SECRET || '',
    cloudinaryUploadFolder:
      process.env.MEMORIES_CLOUDINARY_UPLOAD_FOLDER || 'memories/source-images',
  };
}
