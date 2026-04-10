import { createHash, randomUUID } from 'node:crypto';

import { getMemoriesConfig } from '@/lib/memories/config';
import { HttpError } from '@/lib/memories/errors';

import type { SourceImage, SupportedSourceImageMimeType } from '@/lib/memories/contracts';

function assertHttpUrl(value: unknown, field: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new HttpError(502, `Cloudinary upload did not return a valid ${field}.`);
  }

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new HttpError(502, `Cloudinary upload did not return a valid ${field}.`);
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new HttpError(502, `Cloudinary upload did not return a valid ${field}.`);
  }

  return parsed.toString();
}

export function isSourceImageUploadConfigured() {
  const { cloudinaryCloudName, cloudinaryApiKey, cloudinaryApiSecret } = getMemoriesConfig();
  return Boolean(cloudinaryCloudName && cloudinaryApiKey && cloudinaryApiSecret);
}

export function assertSourceImageUploadConfigured() {
  if (isSourceImageUploadConfigured()) {
    return;
  }

  throw new HttpError(
    503,
    'Direct image upload is unavailable in this environment.',
    'UPLOAD_UNAVAILABLE',
  );
}

function createCloudinarySignature(params: Record<string, string>, apiSecret: string) {
  const serialized = Object.entries(params)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  return createHash('sha1')
    .update(`${serialized}${apiSecret}`)
    .digest('hex');
}

function normalizeCloudinaryError(message: string | undefined, status: number) {
  if (status >= 400 && status < 500) {
    return 'Source image staging was rejected by Cloudinary.';
  }

  if (message && message.trim()) {
    return message.trim();
  }

  return 'Source image staging failed.';
}

export async function stageSourceImageUpload(
  file: File,
  mimeType: SupportedSourceImageMimeType,
  field: string,
  label: string,
): Promise<SourceImage> {
  assertSourceImageUploadConfigured();

  const { cloudinaryCloudName, cloudinaryApiKey, cloudinaryApiSecret, cloudinaryUploadFolder } =
    getMemoriesConfig();
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const publicId = `${field}-${randomUUID()}`;
  const signature = createCloudinarySignature(
    {
      folder: cloudinaryUploadFolder,
      public_id: publicId,
      timestamp,
    },
    cloudinaryApiSecret,
  );

  const formData = new FormData();
  formData.set('file', file);
  formData.set('api_key', cloudinaryApiKey);
  formData.set('timestamp', timestamp);
  formData.set('signature', signature);
  formData.set('folder', cloudinaryUploadFolder);
  formData.set('public_id', publicId);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      payload &&
      typeof payload === 'object' &&
      'error' in payload &&
      payload.error &&
      typeof payload.error === 'object' &&
      'message' in payload.error &&
      typeof payload.error.message === 'string'
        ? payload.error.message
        : undefined;

    throw new HttpError(502, normalizeCloudinaryError(message, response.status));
  }

  const secureUrl =
    payload && typeof payload === 'object' && 'secure_url' in payload
      ? assertHttpUrl(payload.secure_url, 'secure_url')
      : null;

  if (!secureUrl) {
    throw new HttpError(502, 'Cloudinary upload did not return a hosted source image URL.');
  }

  return {
    storage: 'remote_url',
    url: secureUrl,
    mimeType,
    filename: file.name.trim() || undefined,
    sizeBytes: file.size || undefined,
    label,
  };
}
