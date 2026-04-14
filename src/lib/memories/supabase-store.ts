import { getMemoriesConfig } from '@/lib/memories/config';
import { HttpError } from '@/lib/memories/errors';
import { memoryStatuses, supportedSourceImageMimeTypes } from '@/lib/memories/contracts';

import type {
  DeliveryRecord,
  MemoryAsset,
  MemoryJob,
  MemoryStatus,
  SourceImage,
  SupportedSourceImageMimeType,
} from '@/lib/memories/contracts';

type OrderRow = {
  id: string;
  access_token: string;
  email: string;
  client_request_id?: string | null;
  customer_name?: string | null;
  story_prompt: string;
  source_images: unknown;
  cloudinary_folder?: string | null;
  status: MemoryStatus;
  unlocked: boolean;
  payment_reference?: string | null;
  payment_provider?: 'stripe' | 'manual' | null;
  preview_asset?: unknown;
  final_asset?: unknown;
  delivery?: unknown;
  cloudinary_cloud_name?: string | null;
  last_error?: string | null;
  metadata?: unknown;
  created_at: string;
  updated_at: string;
};

type GenerationJobRow = {
  order_id: string;
  status: MemoryStatus;
  provider: 'make' | 'manual';
  payment_reference?: string | null;
  last_error?: string | null;
  queued_at?: string | null;
  processing_at?: string | null;
  preview_ready_at?: string | null;
  completed_at?: string | null;
  delivered_at?: string | null;
  failed_at?: string | null;
  created_at: string;
  updated_at: string;
};

type GeneratedAssetRow = {
  order_id: string;
  kind: 'preview' | 'final';
  provider: 'cloudinary' | 'make' | 'manual';
  url: string;
  public_id?: string | null;
  format?: string | null;
  width?: number | null;
  height?: number | null;
  created_at: string;
  updated_at: string;
};

type EventLogRow = {
  order_id: string;
  event_type: string;
  status: MemoryStatus;
  payload: Record<string, unknown>;
  created_at: string;
};

const transientStatusCodes = new Set([408, 409, 425, 429, 500, 502, 503, 504]);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function asOptionalString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function asIsoTimestamp(value: unknown, field: string) {
  if (typeof value !== 'string' || !value.trim() || Number.isNaN(Date.parse(value))) {
    throw new HttpError(502, `Supabase row did not include a valid ${field}.`);
  }

  return value;
}

function asMemoryStatus(value: unknown) {
  if (typeof value !== 'string' || !memoryStatuses.includes(value as MemoryStatus)) {
    throw new HttpError(502, 'Supabase row did not include a valid job status.');
  }

  return value as MemoryStatus;
}

function asSourceImage(value: unknown, index: number): SourceImage {
  if (!isRecord(value)) {
    throw new HttpError(502, `Supabase row did not include a valid source_images[${index}] item.`);
  }

  const storage = value.storage === 'inline_data_url' ? 'inline_data_url' : 'remote_url';
  const mimeType =
    typeof value.mimeType === 'string' &&
    supportedSourceImageMimeTypes.includes(value.mimeType as SupportedSourceImageMimeType)
      ? (value.mimeType as SupportedSourceImageMimeType)
      : undefined;

  return {
    storage,
    url: asOptionalString(value.url),
    dataUrl: asOptionalString(value.dataUrl),
    mimeType,
    filename: asOptionalString(value.filename),
    sizeBytes: typeof value.sizeBytes === 'number' ? value.sizeBytes : undefined,
    sha256: asOptionalString(value.sha256),
    label: asOptionalString(value.label),
  };
}

function asMemoryAsset(value: unknown, field: string): MemoryAsset | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  if (typeof value.url !== 'string' || !value.url.trim()) {
    throw new HttpError(502, `Supabase row did not include a valid ${field}.url.`);
  }

  const provider =
    value.provider === 'cloudinary' || value.provider === 'make' || value.provider === 'manual'
      ? value.provider
      : 'manual';

  return {
    provider,
    url: value.url,
    publicId: asOptionalString(value.publicId),
    format: asOptionalString(value.format),
    width: typeof value.width === 'number' ? value.width : undefined,
    height: typeof value.height === 'number' ? value.height : undefined,
  };
}

function asDelivery(value: unknown): DeliveryRecord | undefined {
  if (!isRecord(value) || value.channel !== 'email' || typeof value.recipient !== 'string') {
    return undefined;
  }

  return {
    channel: 'email',
    provider: value.provider === 'make' || value.provider === 'manual' ? value.provider : 'manual',
    recipient: value.recipient,
    deliveryId: asOptionalString(value.deliveryId),
    deliveredAt: asIsoTimestamp(value.deliveredAt, 'delivery.deliveredAt'),
  };
}

function asMetadata(value: unknown) {
  if (!isRecord(value)) {
    return undefined;
  }

  const normalized = Object.fromEntries(
    Object.entries(value)
      .filter(([, entry]) => typeof entry === 'string' && entry.trim())
      .map(([key, entry]) => [key, String(entry)]),
  );

  return Object.keys(normalized).length > 0 ? normalized : undefined;
}

function orderRowToJob(row: OrderRow): MemoryJob {
  if (
    typeof row.id !== 'string' ||
    typeof row.access_token !== 'string' ||
    typeof row.email !== 'string' ||
    typeof row.story_prompt !== 'string'
  ) {
    throw new HttpError(502, 'Supabase row did not include a valid orders record.');
  }

  const sourceImages = Array.isArray(row.source_images)
    ? row.source_images.map((value, index) => asSourceImage(value, index))
    : [];

  return {
    id: row.id,
    accessToken: row.access_token,
    email: row.email,
    clientRequestId: asOptionalString(row.client_request_id),
    customerName: asOptionalString(row.customer_name),
    storyPrompt: row.story_prompt,
    sourceImages,
    cloudinaryFolder: asOptionalString(row.cloudinary_folder),
    status: asMemoryStatus(row.status),
    unlocked: Boolean(row.unlocked),
    paymentReference: asOptionalString(row.payment_reference),
    paymentProvider:
      row.payment_provider === 'stripe' || row.payment_provider === 'manual'
        ? row.payment_provider
        : undefined,
    previewAsset: asMemoryAsset(row.preview_asset, 'preview_asset'),
    finalAsset: asMemoryAsset(row.final_asset, 'final_asset'),
    delivery: asDelivery(row.delivery),
    cloudinaryCloudName: asOptionalString(row.cloudinary_cloud_name),
    lastError: asOptionalString(row.last_error),
    metadata: asMetadata(row.metadata),
    createdAt: asIsoTimestamp(row.created_at, 'created_at'),
    updatedAt: asIsoTimestamp(row.updated_at, 'updated_at'),
  };
}

function jobToOrderRow(job: MemoryJob): OrderRow {
  return {
    id: job.id,
    access_token: job.accessToken,
    email: job.email,
    client_request_id: job.clientRequestId || null,
    customer_name: job.customerName || null,
    story_prompt: job.storyPrompt,
    source_images: job.sourceImages,
    cloudinary_folder: job.cloudinaryFolder || null,
    status: job.status,
    unlocked: job.unlocked,
    payment_reference: job.paymentReference || null,
    payment_provider: job.paymentProvider || null,
    preview_asset: job.previewAsset || null,
    final_asset: job.finalAsset || null,
    delivery: job.delivery || null,
    cloudinary_cloud_name: job.cloudinaryCloudName || null,
    last_error: job.lastError || null,
    metadata: job.metadata || null,
    created_at: job.createdAt,
    updated_at: job.updatedAt,
  };
}

function jobToGenerationJobRow(job: MemoryJob): GenerationJobRow {
  const lifecycleTimestamps: Partial<Record<MemoryStatus, string>> = {
    queued: job.updatedAt,
    processing: job.updatedAt,
    preview_ready: job.updatedAt,
    completed: job.updatedAt,
    delivered: job.updatedAt,
    failed: job.updatedAt,
  };

  return {
    order_id: job.id,
    status: job.status,
    provider: job.status === 'created' || job.status === 'unlocked' ? 'manual' : 'make',
    payment_reference: job.paymentReference || null,
    last_error: job.lastError || null,
    queued_at: lifecycleTimestamps.queued || null,
    processing_at: lifecycleTimestamps.processing || null,
    preview_ready_at: lifecycleTimestamps.preview_ready || null,
    completed_at: lifecycleTimestamps.completed || null,
    delivered_at: lifecycleTimestamps.delivered || job.delivery?.deliveredAt || null,
    failed_at: lifecycleTimestamps.failed || null,
    created_at: job.createdAt,
    updated_at: job.updatedAt,
  };
}

function jobToGeneratedAssetRows(job: MemoryJob): GeneratedAssetRow[] {
  const rows: GeneratedAssetRow[] = [];

  if (job.previewAsset) {
    rows.push({
      order_id: job.id,
      kind: 'preview',
      provider: job.previewAsset.provider,
      url: job.previewAsset.url,
      public_id: job.previewAsset.publicId || null,
      format: job.previewAsset.format || null,
      width: job.previewAsset.width ?? null,
      height: job.previewAsset.height ?? null,
      created_at: job.updatedAt,
      updated_at: job.updatedAt,
    });
  }

  if (job.finalAsset) {
    rows.push({
      order_id: job.id,
      kind: 'final',
      provider: job.finalAsset.provider,
      url: job.finalAsset.url,
      public_id: job.finalAsset.publicId || null,
      format: job.finalAsset.format || null,
      width: job.finalAsset.width ?? null,
      height: job.finalAsset.height ?? null,
      created_at: job.updatedAt,
      updated_at: job.updatedAt,
    });
  }

  return rows;
}

function jobToEventLogRow(job: MemoryJob): EventLogRow {
  return {
    order_id: job.id,
    event_type: job.status === 'created' ? 'job_created' : `job_${job.status}`,
    status: job.status,
    payload: {
      unlocked: job.unlocked,
      paymentReference: job.paymentReference || null,
      paymentProvider: job.paymentProvider || null,
      previewAsset: job.previewAsset || null,
      finalAsset: job.finalAsset || null,
      delivery: job.delivery || null,
      lastError: job.lastError || null,
      updatedAt: job.updatedAt,
    },
    created_at: job.updatedAt,
  };
}

function isTransientError(error: unknown) {
  return error instanceof HttpError && transientStatusCodes.has(error.status);
}

function supabaseRestUrl(pathname: string) {
  const { supabaseUrl } = getMemoriesConfig();
  return `${supabaseUrl.replace(/\/$/, '')}/rest/v1/${pathname.replace(/^\//, '')}`;
}

function getSupabaseHeaders(prefer?: string) {
  const { supabaseServiceRoleKey } = getMemoriesConfig();

  return {
    apikey: supabaseServiceRoleKey,
    authorization: `Bearer ${supabaseServiceRoleKey}`,
    'content-type': 'application/json',
    ...(prefer ? { Prefer: prefer } : {}),
  };
}

async function requestSupabase<T>(pathname: string, init: RequestInit = {}, attempt = 0): Promise<T> {
  const { supabaseTimeoutMs, supabaseUrl, supabaseServiceRoleKey } = getMemoriesConfig();

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new HttpError(
      503,
      'Supabase persistence is unavailable in this environment.',
      'PERSISTENCE_UNAVAILABLE',
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), supabaseTimeoutMs);

  try {
    const response = await fetch(supabaseRestUrl(pathname), {
      ...init,
      headers: {
        ...getSupabaseHeaders(),
        ...(init.headers || {}),
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      const message = await response.text();
      throw new HttpError(
        response.status,
        message.trim() || `Supabase request failed for ${pathname}.`,
      );
    }

    if (response.status === 204) {
      return null as T;
    }

    const responseText = await response.text();
    if (!responseText.trim()) {
      return null as T;
    }

    return JSON.parse(responseText) as T;
  } catch (error) {
    if (attempt < 2 && (error instanceof TypeError || isTransientError(error))) {
      await sleep((attempt + 1) * 200);
      return requestSupabase(pathname, init, attempt + 1);
    }

    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(502, `Supabase request failed for ${pathname}.`);
  } finally {
    clearTimeout(timeout);
  }
}

export function isSupabaseConfigured() {
  const { supabaseUrl, supabaseServiceRoleKey } = getMemoriesConfig();
  return Boolean(supabaseUrl && supabaseServiceRoleKey);
}

export async function getSupabaseJob(jobId: string) {
  const rows = await requestSupabase<OrderRow[]>(
    `orders?id=eq.${encodeURIComponent(jobId)}&select=*`,
    {
      method: 'GET',
      headers: getSupabaseHeaders('return=representation'),
    },
  );

  return rows[0] ? orderRowToJob(rows[0]) : undefined;
}

export async function findSupabaseJobByClientRequestId(email: string, clientRequestId: string) {
  const rows = await requestSupabase<OrderRow[]>(
    `orders?email=eq.${encodeURIComponent(email)}&client_request_id=eq.${encodeURIComponent(clientRequestId)}&select=*`,
    {
      method: 'GET',
      headers: getSupabaseHeaders('return=representation'),
    },
  );

  return rows[0] ? orderRowToJob(rows[0]) : undefined;
}

export async function upsertSupabaseJob(job: MemoryJob) {
  const orderRows = await requestSupabase<OrderRow[]>(
    'orders?on_conflict=id',
    {
      method: 'POST',
      headers: getSupabaseHeaders('resolution=merge-duplicates,return=representation'),
      body: JSON.stringify(jobToOrderRow(job)),
    },
  );

  await requestSupabase<GenerationJobRow[]>(
    'generation_jobs?on_conflict=order_id',
    {
      method: 'POST',
      headers: getSupabaseHeaders('resolution=merge-duplicates,return=minimal'),
      body: JSON.stringify(jobToGenerationJobRow(job)),
    },
  );

  await requestSupabase<null>(
    `generated_assets?order_id=eq.${encodeURIComponent(job.id)}`,
    {
      method: 'DELETE',
      headers: getSupabaseHeaders('return=minimal'),
    },
  );

  const assetRows = jobToGeneratedAssetRows(job);
  if (assetRows.length > 0) {
    await requestSupabase<GeneratedAssetRow[]>(
      'generated_assets?on_conflict=order_id,kind',
      {
        method: 'POST',
        headers: getSupabaseHeaders('resolution=merge-duplicates,return=minimal'),
        body: JSON.stringify(assetRows),
      },
    );
  }

  await requestSupabase<EventLogRow[]>(
    'event_log',
    {
      method: 'POST',
      headers: getSupabaseHeaders('return=minimal'),
      body: JSON.stringify(jobToEventLogRow(job)),
    },
  );

  return orderRowToJob(orderRows[0] || jobToOrderRow(job));
}
