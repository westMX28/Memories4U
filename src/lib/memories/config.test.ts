import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { getMemoriesConfig } from '@/lib/memories/config';

beforeEach(() => {
  delete process.env.MEMORIES_SUPABASE_URL;
  delete process.env.MEMORIES_SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.MEMORIES_SUPABASE_TIMEOUT_MS;
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_API;
  delete process.env.MEMORIES_MAKE_WEBHOOK_URL;
  delete process.env.MEMORIES_MAKE_READ_WEBHOOK_URL;
  delete process.env.MEMORIES_MAKE_WRITE_WEBHOOK_URL;
  delete process.env.MEMORIES_MAKE_API_KEY;
  delete process.env.MEMORIES_MAKE_API_BASE_URL;
  delete process.env.MEMORIES_MAKE_ORGANIZATION_ID;
  delete process.env.MEMORIES_MAKE_TEAM_ID;
  delete process.env.MEMORIES_MAKE_TIMEOUT_MS;
  delete process.env.MEMORIES_MAX_SOURCE_IMAGE_BYTES;
  delete process.env.MEMORIES_CLOUDINARY_CLOUD_NAME;
  delete process.env.MEMORIES_CLOUDINARY_API_KEY;
  delete process.env.MEMORIES_CLOUDINARY_API_SECRET;
  delete process.env.MEMORIES_CLOUDINARY_UPLOAD_FOLDER;
  delete process.env.MAKE_WEBHOOK_URL;
  delete process.env.MAKE_READ_WEBHOOK_URL;
  delete process.env.MAKE_WRITE_WEBHOOK_URL;
  delete process.env.MAKE_API;
  delete process.env.MAKE_API_BASE_URL;
  delete process.env.MAKE_URL;
  delete process.env.MAKE_ORGANIZATION_ID;
  delete process.env.MAKE_ORG_ID;
  delete process.env.MAKE_TEAM_ID;
  delete process.env.CLOUDINARY_API;
  delete process.env.CLOUDINARY_SECRET;
});

test('falls back to defaults when numeric memories env vars are invalid', () => {
  process.env.MEMORIES_MAKE_TIMEOUT_MS = 'not-a-number';
  process.env.MEMORIES_SUPABASE_TIMEOUT_MS = 'not-a-number';
  process.env.MEMORIES_MAX_SOURCE_IMAGE_BYTES = '-10';

  const config = getMemoriesConfig();

  assert.equal(config.makeTimeoutMs, 8000);
  assert.equal(config.supabaseTimeoutMs, 8000);
  assert.equal(config.maxSourceImageBytes, 4_000_000);
  assert.equal(config.cloudinaryUploadFolder, 'Memories');
});

test('accepts positive integer overrides for numeric memories env vars', () => {
  process.env.MEMORIES_MAKE_TIMEOUT_MS = '12000';
  process.env.MEMORIES_SUPABASE_TIMEOUT_MS = '15000';
  process.env.MEMORIES_MAX_SOURCE_IMAGE_BYTES = '5000000';

  const config = getMemoriesConfig();

  assert.equal(config.makeTimeoutMs, 12_000);
  assert.equal(config.supabaseTimeoutMs, 15_000);
  assert.equal(config.maxSourceImageBytes, 5_000_000);
});

test('exposes Supabase persistence env vars', () => {
  process.env.MEMORIES_SUPABASE_URL = 'https://demo-project.supabase.co';
  process.env.MEMORIES_SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';

  const config = getMemoriesConfig();

  assert.equal(config.supabaseUrl, 'https://demo-project.supabase.co');
  assert.equal(config.supabaseServiceRoleKey, 'service-role-key');
});

test('accepts SUPABASE_API as the server-side Supabase secret alias', () => {
  process.env.MEMORIES_SUPABASE_URL = 'https://demo-project.supabase.co';
  process.env.SUPABASE_API = 'supabase-api-secret';

  const config = getMemoriesConfig();

  assert.equal(config.supabaseUrl, 'https://demo-project.supabase.co');
  assert.equal(config.supabaseServiceRoleKey, 'supabase-api-secret');
});

test('accepts SUPABASE_URL as the Supabase URL alias', () => {
  process.env.SUPABASE_URL = 'https://alias-project.supabase.co';
  process.env.SUPABASE_API = 'supabase-api-secret';

  const config = getMemoriesConfig();

  assert.equal(config.supabaseUrl, 'https://alias-project.supabase.co');
  assert.equal(config.supabaseServiceRoleKey, 'supabase-api-secret');
});

test('exposes Cloudinary source-image staging env vars', () => {
  process.env.MEMORIES_CLOUDINARY_CLOUD_NAME = 'demo-cloud';
  process.env.MEMORIES_CLOUDINARY_API_KEY = 'api-key';
  process.env.MEMORIES_CLOUDINARY_API_SECRET = 'api-secret';
  process.env.MEMORIES_CLOUDINARY_UPLOAD_FOLDER = 'memories/test-folder';

  const config = getMemoriesConfig();

  assert.equal(config.cloudinaryCloudName, 'demo-cloud');
  assert.equal(config.cloudinaryApiKey, 'api-key');
  assert.equal(config.cloudinaryApiSecret, 'api-secret');
  assert.equal(config.cloudinaryUploadFolder, 'memories/test-folder');
});

test('accepts Cloudinary credential aliases when canonical memories env vars are absent', () => {
  process.env.MEMORIES_CLOUDINARY_CLOUD_NAME = 'demo-cloud';
  delete process.env.MEMORIES_CLOUDINARY_API_KEY;
  delete process.env.MEMORIES_CLOUDINARY_API_SECRET;
  process.env.CLOUDINARY_API = 'alias-api-key';
  process.env.CLOUDINARY_SECRET = 'alias-api-secret';

  const config = getMemoriesConfig();

  assert.equal(config.cloudinaryApiKey, 'alias-api-key');
  assert.equal(config.cloudinaryApiSecret, 'alias-api-secret');
});

test('accepts legacy Make aliases when canonical memories env vars are absent', () => {
  process.env.MAKE_API = 'legacy-make-token';
  process.env.MAKE_URL = 'https://eu1.make.com/organization/6210072/dashboard';
  process.env.MAKE_TEAM_ID = '794440';
  process.env.MAKE_READ_WEBHOOK_URL = 'https://example.com/make/read';
  process.env.MAKE_WRITE_WEBHOOK_URL = 'https://example.com/make/write';

  const config = getMemoriesConfig();

  assert.equal(config.makeApiKey, 'legacy-make-token');
  assert.equal(config.makeApiBaseUrl, 'https://eu1.make.com/api/v2');
  assert.equal(config.makeOrganizationId, '6210072');
  assert.equal(config.makeTeamId, '794440');
  assert.equal(config.makeReadWebhookUrl, 'https://example.com/make/read');
  assert.equal(config.makeWriteWebhookUrl, 'https://example.com/make/write');
});

test('explicit blank canonical Make env vars disable legacy alias fallback', () => {
  process.env.MEMORIES_MAKE_WEBHOOK_URL = '';
  process.env.MEMORIES_MAKE_READ_WEBHOOK_URL = '';
  process.env.MEMORIES_MAKE_WRITE_WEBHOOK_URL = '';
  process.env.MEMORIES_MAKE_API_KEY = '';
  process.env.MEMORIES_MAKE_TEAM_ID = '';
  process.env.MAKE_API = 'legacy-make-token';
  process.env.MAKE_TEAM_ID = '794440';
  process.env.MAKE_READ_WEBHOOK_URL = 'https://example.com/make/read';
  process.env.MAKE_WRITE_WEBHOOK_URL = 'https://example.com/make/write';
  process.env.MAKE_WEBHOOK_URL = 'https://example.com/make/all';

  const config = getMemoriesConfig();

  assert.equal(config.makeApiKey, '');
  assert.equal(config.makeTeamId, '');
  assert.equal(config.makeWebhookUrl, '');
  assert.equal(config.makeReadWebhookUrl, '');
  assert.equal(config.makeWriteWebhookUrl, '');
});
