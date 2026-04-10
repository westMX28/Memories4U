import test from 'node:test';
import assert from 'node:assert/strict';

import { getMemoriesConfig } from '@/lib/memories/config';

test('falls back to defaults when numeric memories env vars are invalid', () => {
  process.env.MEMORIES_MAKE_TIMEOUT_MS = 'not-a-number';
  process.env.MEMORIES_MAX_SOURCE_IMAGE_BYTES = '-10';

  const config = getMemoriesConfig();

  assert.equal(config.makeTimeoutMs, 8000);
  assert.equal(config.maxSourceImageBytes, 4_000_000);
});

test('accepts positive integer overrides for numeric memories env vars', () => {
  process.env.MEMORIES_MAKE_TIMEOUT_MS = '12000';
  process.env.MEMORIES_MAX_SOURCE_IMAGE_BYTES = '5000000';

  const config = getMemoriesConfig();

  assert.equal(config.makeTimeoutMs, 12_000);
  assert.equal(config.maxSourceImageBytes, 5_000_000);
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
