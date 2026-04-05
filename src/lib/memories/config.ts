import path from 'node:path';

const defaultDataFile = path.join(process.cwd(), '.data', 'memories-jobs.json');

export function getMemoriesConfig() {
  const configuredDataFile = process.env.MEMORIES_DATA_FILE
    ? path.resolve(/* turbopackIgnore: true */ process.cwd(), process.env.MEMORIES_DATA_FILE)
    : defaultDataFile;

  return {
    appUrl: process.env.MEMORIES_APP_URL || 'http://localhost:3000',
    dataFile: configuredDataFile,
    internalApiSecret: process.env.MEMORIES_INTERNAL_API_SECRET || '',
    makeWebhookUrl: process.env.MEMORIES_MAKE_WEBHOOK_URL || '',
    makeApiKey: process.env.MEMORIES_MAKE_API_KEY || '',
    makeTimeoutMs: Number(process.env.MEMORIES_MAKE_TIMEOUT_MS || 8000),
    cloudinaryCloudName: process.env.MEMORIES_CLOUDINARY_CLOUD_NAME || '',
  };
}
