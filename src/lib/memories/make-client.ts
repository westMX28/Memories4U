import { getMemoriesConfig } from '@/lib/memories/config';
import { HttpError } from '@/lib/memories/errors';

import type { DeliveryRecord, MemoryAsset, MemoryJob, MemoryStatus } from '@/lib/memories/contracts';

type MakeAction = 'create' | 'status' | 'unlock' | 'update';

type MemoryJobRow = {
  jobId: string;
  accessToken: string;
  email: string;
  customerName?: string;
  storyPrompt: string;
  sourceImage1Url?: string;
  sourceImage2Url?: string;
  status: MemoryStatus;
  paymentState?: string;
  paymentReference?: string;
  paymentProvider?: 'stripe' | 'manual';
  previewAssetUrl?: string;
  finalAssetUrl?: string;
  deliveryEmail?: string;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
  previewAsset?: MemoryAsset;
  finalAsset?: MemoryAsset;
  delivery?: DeliveryRecord;
  metadata?: Record<string, string>;
};

type MakeRequest =
  | {
      action: 'create';
      jobId: string;
      status: MemoryStatus;
      payload: string;
    }
  | {
      action: 'status';
      jobId: string;
    }
  | {
      action: 'unlock';
      jobId: string;
      status: MemoryStatus;
      payload: string;
    }
  | {
      action: 'update';
      jobId: string;
      status: MemoryStatus;
      payload: string;
    };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function asOptionalString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function asMemoryAsset(value: unknown): MemoryAsset | undefined {
  if (!isRecord(value) || typeof value.url !== 'string') {
    return undefined;
  }

  const provider =
    value.provider === 'cloudinary' || value.provider === 'make' || value.provider === 'manual'
      ? value.provider
      : 'make';

  return {
    provider,
    url: value.url,
    publicId: asOptionalString(value.publicId),
    format: asOptionalString(value.format),
    width: typeof value.width === 'number' ? value.width : undefined,
    height: typeof value.height === 'number' ? value.height : undefined,
  };
}

function asDeliveryRecord(value: unknown): DeliveryRecord | undefined {
  if (!isRecord(value) || value.channel !== 'email' || typeof value.recipient !== 'string') {
    return undefined;
  }

  return {
    channel: 'email',
    provider: value.provider === 'make' || value.provider === 'manual' ? value.provider : 'make',
    recipient: value.recipient,
    deliveryId: asOptionalString(value.deliveryId),
    deliveredAt:
      typeof value.deliveredAt === 'string' && value.deliveredAt
        ? value.deliveredAt
        : new Date().toISOString(),
  };
}

function extractRow(payload: unknown): MemoryJobRow {
  if (!isRecord(payload)) {
    throw new HttpError(502, 'Make response was not valid JSON.');
  }

  const raw = isRecord(payload.job)
    ? payload.job
    : isRecord(payload.row)
      ? payload.row
      : payload;

  if (
    typeof raw.jobId !== 'string' ||
    typeof raw.accessToken !== 'string' ||
    typeof raw.email !== 'string' ||
    typeof raw.storyPrompt !== 'string' ||
    typeof raw.status !== 'string' ||
    typeof raw.createdAt !== 'string' ||
    typeof raw.updatedAt !== 'string'
  ) {
    throw new HttpError(502, 'Make response did not include a valid job row.');
  }

  return {
    jobId: raw.jobId,
    accessToken: raw.accessToken,
    email: raw.email,
    customerName: asOptionalString(raw.customerName),
    storyPrompt: raw.storyPrompt,
    sourceImage1Url: asOptionalString(raw.sourceImage1Url),
    sourceImage2Url: asOptionalString(raw.sourceImage2Url),
    status: raw.status as MemoryStatus,
    paymentState: asOptionalString(raw.paymentState),
    paymentReference: asOptionalString(raw.paymentReference),
    paymentProvider: raw.paymentProvider === 'stripe' || raw.paymentProvider === 'manual' ? raw.paymentProvider : undefined,
    previewAssetUrl: asOptionalString(raw.previewAssetUrl),
    finalAssetUrl: asOptionalString(raw.finalAssetUrl),
    deliveryEmail: asOptionalString(raw.deliveryEmail),
    lastError: asOptionalString(raw.lastError),
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    previewAsset: asMemoryAsset(raw.previewAsset),
    finalAsset: asMemoryAsset(raw.finalAsset),
    delivery: asDeliveryRecord(raw.delivery),
    metadata: isRecord(raw.metadata)
      ? (Object.fromEntries(
          Object.entries(raw.metadata)
            .filter(([, value]) => typeof value === 'string' && value.trim())
            .map(([key, value]) => [key, String(value)]),
        ) as Record<string, string>)
      : undefined,
  };
}

function jobToRow(job: MemoryJob): MemoryJobRow {
  return {
    jobId: job.id,
    accessToken: job.accessToken,
    email: job.email,
    customerName: job.customerName,
    storyPrompt: job.storyPrompt,
    sourceImage1Url: job.sourceImages[0]?.url,
    sourceImage2Url: job.sourceImages[1]?.url,
    status: job.status,
    paymentState: job.unlocked ? 'paid' : 'pending',
    paymentReference: job.paymentReference,
    paymentProvider: job.paymentProvider,
    previewAssetUrl: job.previewAsset?.url,
    finalAssetUrl: job.finalAsset?.url,
    deliveryEmail: job.delivery?.recipient,
    lastError: job.lastError,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    previewAsset: job.previewAsset,
    finalAsset: job.finalAsset,
    delivery: job.delivery,
    metadata: job.metadata,
  };
}

export function rowToJob(row: MemoryJobRow): MemoryJob {
  return {
    id: row.jobId,
    accessToken: row.accessToken,
    email: row.email,
    customerName: row.customerName,
    storyPrompt: row.storyPrompt,
    sourceImages: [row.sourceImage1Url, row.sourceImage2Url]
      .filter((value): value is string => typeof value === 'string' && value.length > 0)
      .map((url) => ({ url })),
    status: row.status,
    unlocked: row.paymentState === 'paid' || row.status !== 'created',
    paymentReference: row.paymentReference,
    paymentProvider: row.paymentProvider,
    previewAsset:
      row.previewAsset ||
      (row.previewAssetUrl
        ? {
            provider: 'make',
            url: row.previewAssetUrl,
          }
        : undefined),
    finalAsset:
      row.finalAsset ||
      (row.finalAssetUrl
        ? {
            provider: 'make',
            url: row.finalAssetUrl,
          }
        : undefined),
    delivery:
      row.delivery ||
      (row.deliveryEmail
        ? {
            channel: 'email',
            provider: 'make',
            recipient: row.deliveryEmail,
            deliveredAt: row.updatedAt,
          }
        : undefined),
    lastError: row.lastError,
    metadata: row.metadata,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function isMakeConfigured() {
  const { makeReadWebhookUrl, makeWriteWebhookUrl } = getMemoriesConfig();
  return Boolean(makeReadWebhookUrl && makeWriteWebhookUrl);
}

function isEmptyObject(value: unknown) {
  return isRecord(value) && Object.keys(value).length === 0;
}

async function parseMakeResponse(response: Response) {
  const raw = await response.text();
  if (!raw.trim()) {
    return null;
  }

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    throw new HttpError(502, 'Make response was not valid JSON.');
  }
}

async function callMake(request: MakeRequest) {
  const { makeReadWebhookUrl, makeWriteWebhookUrl, makeApiKey, makeTimeoutMs } = getMemoriesConfig();
  const makeWebhookUrl = request.action === 'status' ? makeReadWebhookUrl : makeWriteWebhookUrl;

  if (!makeWebhookUrl) {
    throw new HttpError(
      503,
      request.action === 'status'
        ? 'MEMORIES_MAKE_READ_WEBHOOK_URL is not configured.'
        : 'MEMORIES_MAKE_WRITE_WEBHOOK_URL is not configured.',
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), makeTimeoutMs);

  try {
    const response = await fetch(makeWebhookUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(makeApiKey ? { authorization: `Bearer ${makeApiKey}` } : {}),
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    if (response.status === 404 && request.action === 'status') {
      return null;
    }

    if (!response.ok) {
      throw new HttpError(response.status, `Make webhook rejected ${request.action}.`);
    }

    if (response.status === 204) {
      return null;
    }

    const payload = await parseMakeResponse(response);
    if (request.action === 'status' && (payload === null || isEmptyObject(payload))) {
      return null;
    }

    return extractRow(payload);
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(502, `Make webhook failed during ${request.action}.`);
  } finally {
    clearTimeout(timeout);
  }
}

export async function createRemoteJob(job: MemoryJob) {
  const rowData = jobToRow(job);
  const row = await callMake({
    action: 'create',
    jobId: rowData.jobId,
    status: rowData.status,
    payload: JSON.stringify(rowData),
  });
  return rowToJob(row ?? jobToRow(job));
}

export async function getRemoteJob(jobId: string) {
  const row = await callMake({ action: 'status', jobId });
  return row ? rowToJob(row) : undefined;
}

export async function unlockRemoteJob(job: MemoryJob, paymentReference: string, updatedAt: string) {
  const nextJob = jobToRow({
    ...job,
    unlocked: true,
    paymentReference,
    status: 'queued',
    updatedAt,
  });

  const row = await callMake({
    action: 'unlock',
    jobId: nextJob.jobId,
    status: nextJob.status,
    payload: JSON.stringify(nextJob),
  });

  return row ? rowToJob(row) : undefined;
}

export async function updateRemoteJob(jobId: string, patch: Partial<MemoryJob>) {
  const row = jobToRow({
    id: jobId,
    accessToken: patch.accessToken || '',
    email: patch.email || '',
    storyPrompt: patch.storyPrompt || '',
    sourceImages: patch.sourceImages || [],
    status: patch.status || 'created',
    unlocked: patch.unlocked || false,
    customerName: patch.customerName,
    paymentReference: patch.paymentReference,
    paymentProvider: patch.paymentProvider,
    previewAsset: patch.previewAsset,
    finalAsset: patch.finalAsset,
    delivery: patch.delivery,
    lastError: patch.lastError,
    metadata: patch.metadata,
    createdAt: patch.createdAt || '',
    updatedAt: patch.updatedAt || '',
  });

  const updated = await callMake({
    action: 'update',
    jobId: row.jobId,
    status: row.status,
    payload: JSON.stringify(row),
  });

  return updated ? rowToJob(updated) : undefined;
}
