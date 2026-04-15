import { createHash, randomBytes, randomUUID } from 'node:crypto';

import { getMemoriesConfig } from '@/lib/memories/config';
import { HttpError } from '@/lib/memories/errors';
import { dispatchGenerationHandoff, isMakeConfigured } from '@/lib/memories/make-client';
import { resolveCloudinaryJobFolder, stageSourceImageUpload } from '@/lib/memories/source-image-staging';
import { findJobByClientRequestId, getJob, createJob, requireJob, updateJob } from '@/lib/memories/store';
import { assertStripeConfigured, getStripeClient } from '@/lib/memories/stripe';

import type {
  CheckoutSessionResponse,
  CreateMemoryJobInput,
  CreateMemoryJobResponse,
  DeliveryCommand,
  LegacyMakeJobStateResponse,
  MakeUpdateEvent,
  MediaCommand,
  MemoryJob,
  MemoryStatusResponse,
  OperatorOrderState,
  OperatorOrderStatusResponse,
  SourceImage,
  SupportedSourceImageMimeType,
  UnlockJobInput,
} from '@/lib/memories/contracts';

function nowIso() {
  return new Date().toISOString();
}

function randomToken() {
  return randomBytes(24).toString('hex');
}

function assertNonEmptyString(value: unknown, field: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new HttpError(400, `${field} is required.`);
  }

  return value.trim();
}

function assertEmail(value: unknown, field: string) {
  const email = assertNonEmptyString(value, field);
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    throw new HttpError(400, `${field} must be a valid email address.`);
  }

  return email;
}

function assertHttpUrl(value: unknown, field: string) {
  const candidate = assertNonEmptyString(value, field);

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new HttpError(400, `${field} must be a valid URL.`);
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new HttpError(400, `${field} must use http or https.`);
  }

  return parsed.toString();
}

function optionalTrimmedString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function assertSourceImageCount(images: unknown[]) {
  if (images.length === 0) {
    throw new HttpError(400, 'sourceImages must contain at least one image.');
  }

  if (images.length > 2) {
    throw new HttpError(400, 'sourceImages accepts at most two images.');
  }
}

function assertSourceImages(images: unknown): SourceImage[] {
  if (!Array.isArray(images)) {
    throw new HttpError(400, 'sourceImages must contain at least one image.');
  }

  assertSourceImageCount(images);

  return images.map((image, index) => {
    if (!image || typeof image !== 'object') {
      throw new HttpError(400, `sourceImages[${index}] must be an object.`);
    }

    const candidate = image as Record<string, unknown>;
    return {
      storage: 'remote_url',
      url: assertHttpUrl(candidate.url, `sourceImages[${index}].url`),
      ...(optionalTrimmedString(candidate.label)
        ? { label: optionalTrimmedString(candidate.label) }
        : {}),
    };
  });
}

function assertRecord(value: unknown, field: string) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new HttpError(400, `${field} must be an object.`);
  }

  return value as Record<string, unknown>;
}

function getFormField(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === 'string' ? value : undefined;
}

function getOptionalFormField(formData: FormData, name: string) {
  return optionalTrimmedString(getFormField(formData, name));
}

function getOptionalClientRequestId(value: unknown) {
  return optionalTrimmedString(value);
}

function getOptionalFormFile(formData: FormData, names: string[]) {
  for (const name of names) {
    const value = formData.get(name);
    if (value instanceof File) {
      return value;
    }
  }

  return null;
}

function parseMetadataRecord(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }

  const normalized = Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([, entry]) => typeof entry === 'string' && entry.trim())
      .map(([key, entry]) => [key, String(entry).trim()]),
  );

  return Object.keys(normalized).length > 0 ? normalized : undefined;
}

function parseFormMetadata(formData: FormData) {
  const metadataField = getOptionalFormField(formData, 'metadata');
  const occasion = getOptionalFormField(formData, 'occasion');
  const metadata = metadataField
    ? (() => {
        try {
          return parseMetadataRecord(JSON.parse(metadataField));
        } catch {
          throw new HttpError(400, 'metadata must be valid JSON when provided.');
        }
      })()
    : undefined;

  if (!occasion) {
    return metadata;
  }

  return {
    ...(metadata || {}),
    occasion,
  };
}

function normalizeUploadedMimeType(
  mimeType: string,
  field: string,
): SupportedSourceImageMimeType {
  if (mimeType === 'image/png' || mimeType === 'image/jpeg') {
    return mimeType;
  }

  throw new HttpError(400, `${field} must be a PNG or JPG image.`);
}

function assertSupportedUploadExtension(filename: string, field: string) {
  const normalized = filename.trim().toLowerCase();
  if (normalized.endsWith('.png') || normalized.endsWith('.jpg') || normalized.endsWith('.jpeg')) {
    return;
  }

  throw new HttpError(400, `${field} must use a .png, .jpg, or .jpeg filename.`);
}

async function fileToSourceImage(
  file: File,
  field: string,
  label: string,
  jobId: string,
): Promise<SourceImage> {
  const { maxSourceImageBytes } = getMemoriesConfig();

  if (!file.size) {
    throw new HttpError(400, `${field} is required.`);
  }

  if (file.size > maxSourceImageBytes) {
    throw new HttpError(
      413,
      `${field} exceeds the ${Math.max(1, Math.floor(maxSourceImageBytes / 1_000_000))}MB upload limit for v1.`,
    );
  }

  const filename = file.name.trim() || `${field}.upload`;
  const mimeType = normalizeUploadedMimeType(file.type, field);
  assertSupportedUploadExtension(filename, field);

  const buffer = Buffer.from(await file.arrayBuffer());
  const normalizedFile = new File([buffer], filename, { type: mimeType });
  const staged = await stageSourceImageUpload(normalizedFile, mimeType, field, label, jobId);

  return {
    ...staged,
    sha256: createHash('sha256').update(buffer).digest('hex'),
  };
}

export function parseCreateMemoryJobInput(input: unknown): CreateMemoryJobInput {
  const record = assertRecord(input, 'body');
  const metadata = (() => {
    const parsed = parseMetadataRecord(record.metadata);
    const occasion = optionalTrimmedString(record.occasion);

    if (!occasion) {
      return parsed;
    }

    return {
      ...(parsed || {}),
      occasion,
    };
  })();

  return {
    email: assertEmail(record.email, 'email'),
    clientRequestId:
      getOptionalClientRequestId(record.clientRequestId) || getOptionalClientRequestId(metadata?.clientRequestId),
    customerName: optionalTrimmedString(record.customerName),
    storyPrompt: assertNonEmptyString(record.storyPrompt, 'storyPrompt'),
    sourceImages: assertSourceImages(record.sourceImages),
    metadata,
  };
}

export function createMemoryJobId() {
  return randomUUID();
}

export async function parseCreateMemoryJobFormData(
  formData: FormData,
  jobId = createMemoryJobId(),
): Promise<CreateMemoryJobInput> {
  const metadata = parseFormMetadata(formData);
  const image1 = getOptionalFormFile(formData, ['image1', 'sourceImage1', 'file1']);
  const image2 = getOptionalFormFile(formData, ['image2', 'sourceImage2', 'file2']);

  if (!image1) {
    throw new HttpError(400, 'image1 is required.');
  }

  const sourceImages = [await fileToSourceImage(image1, 'image1', 'customer', jobId)];
  if (image2) {
    sourceImages.push(await fileToSourceImage(image2, 'image2', 'recipient', jobId));
  }

  return {
    email: assertEmail(getFormField(formData, 'email'), 'email'),
    clientRequestId:
      getOptionalFormField(formData, 'clientRequestId') || getOptionalClientRequestId(metadata?.clientRequestId),
    customerName: getOptionalFormField(formData, 'customerName'),
    storyPrompt: assertNonEmptyString(getFormField(formData, 'storyPrompt'), 'storyPrompt'),
    sourceImages,
    metadata,
  };
}

export function getCreateMemoryJobIdempotencyKeyFromFormData(formData: FormData) {
  const emailValue = getFormField(formData, 'email');
  const metadata = parseFormMetadata(formData);
  const clientRequestId =
    getOptionalFormField(formData, 'clientRequestId') || getOptionalClientRequestId(metadata?.clientRequestId);

  if (!emailValue || !clientRequestId) {
    return undefined;
  }

  return {
    email: assertEmail(emailValue, 'email'),
    clientRequestId,
  };
}

export function parseUnlockJobInput(input: unknown): UnlockJobInput {
  const record = assertRecord(input, 'body');

  return {
    paymentReference: assertNonEmptyString(record.paymentReference, 'paymentReference'),
    provider:
      record.provider === 'stripe' || record.provider === 'manual'
        ? record.provider
        : 'manual',
  };
}

export function parseMediaCommand(input: unknown): MediaCommand {
  const record = assertRecord(input, 'body');
  const command = assertNonEmptyString(record.command, 'command');

  if (command === 'request_generation' || command === 'mark_processing') {
    if (record.provider !== 'make' && record.provider !== 'manual') {
      throw new HttpError(400, 'provider must be make or manual.');
    }

    return { command, provider: record.provider };
  }

  if (command === 'mark_preview_ready' || command === 'mark_completed') {
    if (record.provider !== 'cloudinary' && record.provider !== 'make' && record.provider !== 'manual') {
      throw new HttpError(400, 'provider must be cloudinary, make, or manual.');
    }

    const asset = assertRecord(record.asset, 'asset');
    return {
      command,
      provider: record.provider,
      asset: {
        provider: record.provider,
        url: assertHttpUrl(asset.url, 'asset.url'),
        publicId: typeof asset.publicId === 'string' ? asset.publicId : undefined,
        format: typeof asset.format === 'string' ? asset.format : undefined,
        width: typeof asset.width === 'number' ? asset.width : undefined,
        height: typeof asset.height === 'number' ? asset.height : undefined,
      },
    };
  }

  if (command === 'mark_failed') {
    if (record.provider !== 'make' && record.provider !== 'manual') {
      throw new HttpError(400, 'provider must be make or manual.');
    }

    return {
      command,
      provider: record.provider,
      error: assertNonEmptyString(record.error, 'error'),
    };
  }

  throw new HttpError(400, `Unsupported command ${command}.`);
}

export function parseDeliveryCommand(input: unknown): DeliveryCommand {
  const record = assertRecord(input, 'body');

  if (record.channel !== 'email') {
    throw new HttpError(400, 'channel must be email.');
  }

  if (record.provider !== 'make' && record.provider !== 'manual') {
    throw new HttpError(400, 'provider must be make or manual.');
  }

  return {
    channel: 'email',
    provider: record.provider,
    recipient: assertNonEmptyString(record.recipient, 'recipient'),
    deliveryId: typeof record.deliveryId === 'string' ? record.deliveryId : undefined,
  };
}

export function parseMakeUpdateEvent(input: unknown): MakeUpdateEvent {
  const record = assertRecord(input, 'body');
  const event = assertNonEmptyString(record.event, 'event');
  const jobId = assertNonEmptyString(record.jobId, 'jobId');

  if (event === 'queued' || event === 'processing') {
    return { event, jobId };
  }

  if (event === 'preview_ready' || event === 'completed') {
    const media = parseMediaCommand({
      command: event === 'preview_ready' ? 'mark_preview_ready' : 'mark_completed',
      provider: record.provider || 'make',
      asset: record.asset,
    });

    if (!('asset' in media)) {
      throw new HttpError(400, `Make event ${event} requires an asset.`);
    }

    return { event, jobId, asset: media.asset };
  }

  if (event === 'failed') {
    return {
      event,
      jobId,
      error: assertNonEmptyString(record.error, 'error'),
    };
  }

  if (event === 'delivered') {
    return {
      event,
      jobId,
      delivery: parseDeliveryCommand(record.delivery),
    };
  }

  throw new HttpError(400, `Unsupported Make event ${event}.`);
}

function jobToStatusResponse(job: MemoryJob): MemoryStatusResponse {
  return {
    jobId: job.id,
    status: job.status,
    unlocked: job.unlocked,
    previewAsset: job.previewAsset,
    finalAsset: job.finalAsset,
    delivery: job.delivery,
    lastError: job.lastError,
    updatedAt: job.updatedAt,
  };
}

function deriveOperatorOrderState(job: MemoryJob): OperatorOrderState {
  if (job.status === 'failed') {
    return 'needs_attention';
  }

  if (job.status === 'delivered') {
    return 'delivered';
  }

  if (job.status === 'completed') {
    return 'ready';
  }

  if (job.unlocked) {
    if (job.status === 'unlocked') {
      return 'paid';
    }

    return 'in_progress';
  }

  return 'payment_pending';
}

function jobToOperatorOrderStatus(job: MemoryJob): OperatorOrderStatusResponse {
  return {
    summary: {
      orderId: job.id,
      jobId: job.id,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      customerEmail: job.email,
      orderState: deriveOperatorOrderState(job),
    },
    payment: {
      status: job.unlocked ? 'paid' : 'pending',
      provider: job.paymentProvider,
      reference: job.paymentReference,
    },
    generation: {
      status: job.status,
      unlocked: job.unlocked,
      lastError: job.lastError,
    },
    assets: {
      preview: {
        present: Boolean(job.previewAsset),
        asset: job.previewAsset,
      },
      final: {
        present: Boolean(job.finalAsset),
        asset: job.finalAsset,
      },
    },
    delivery: {
      delivered: Boolean(job.delivery),
      provider: job.delivery?.provider,
      recipient: job.delivery?.recipient,
      deliveryId: job.delivery?.deliveryId,
      deliveredAt: job.delivery?.deliveredAt,
    },
    history: {
      mode: 'current_state_only',
      note: 'No event timeline is persisted yet. This payload only exposes current-state timestamps and references present on the canonical order.',
      timestamps: {
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        deliveredAt: job.delivery?.deliveredAt,
      },
      references: {
        paymentReference: job.paymentReference,
        previewAssetUrl: job.previewAsset?.url,
        finalAssetUrl: job.finalAsset?.url,
        deliveryId: job.delivery?.deliveryId,
      },
    },
  };
}

function jobToLegacyMakeState(job: MemoryJob): LegacyMakeJobStateResponse {
  return {
    id: job.id,
    jobId: job.id,
    accessToken: job.accessToken,
    status: job.status,
    unlocked: job.unlocked,
    email: job.email,
    deliveryEmail: job.delivery?.recipient || job.email,
    customerName: job.customerName,
    storyPrompt: job.storyPrompt,
    sourceImage1Url: job.sourceImages[0]?.url,
    sourceImage2Url: job.sourceImages[1]?.url || job.sourceImages[0]?.url,
    paymentReference: job.paymentReference,
    paymentProvider: job.paymentProvider,
    previewAssetUrl: job.previewAsset?.url,
    finalAssetUrl: job.finalAsset?.url,
    previewAsset: job.previewAsset,
    finalAsset: job.finalAsset,
    delivery: job.delivery,
    lastError: job.lastError,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  };
}

function assertJobUnlocked(job: MemoryJob, action: string) {
  if (!job.unlocked) {
    throw new HttpError(409, `Job must be unlocked before ${action}.`);
  }
}

function assertStatusIn(job: MemoryJob, allowed: MemoryJob['status'][], action: string) {
  if (!allowed.includes(job.status)) {
    throw new HttpError(409, `Cannot ${action} while job is ${job.status}.`);
  }
}

async function verifyAccess(jobId: string, accessToken?: string) {
  const job = await requireJob(jobId);
  if (!accessToken || accessToken !== job.accessToken) {
    throw new HttpError(401, 'Access token is invalid for this job.');
  }

  return job;
}

function normalizeCloudinaryAssetPublicId(cloudinaryFolder: string | undefined, publicId: string | undefined) {
  if (!cloudinaryFolder || !publicId) {
    return publicId;
  }

  const normalizedPublicId = publicId.replace(/^\/+/, '');
  if (normalizedPublicId.startsWith(`${cloudinaryFolder}/`)) {
    return normalizedPublicId;
  }

  if (normalizedPublicId.includes('/')) {
    return normalizedPublicId;
  }

  return `${cloudinaryFolder}/${normalizedPublicId}`;
}

export async function getExistingMemoryJobForCreateInput(input: {
  email: string;
  clientRequestId: string;
}) {
  const existing = await findJobByClientRequestId(input.email, input.clientRequestId);
  if (!existing) {
    return undefined;
  }

  return {
    jobId: existing.id,
    accessToken: existing.accessToken,
    status: existing.status,
    sourceImages: existing.sourceImages,
  };
}

export async function createMemoryJobRecord(input: CreateMemoryJobInput, jobId = createMemoryJobId()) {
  const { cloudinaryCloudName } = getMemoriesConfig();
  if (input.clientRequestId) {
    const existing = await getExistingMemoryJobForCreateInput({
      email: input.email,
      clientRequestId: input.clientRequestId,
    });
    if (existing) {
      return existing;
    }
  }

  const timestamp = nowIso();
  const job: MemoryJob = {
    id: jobId,
    accessToken: randomToken(),
    email: input.email,
    clientRequestId: input.clientRequestId,
    customerName: input.customerName,
    storyPrompt: input.storyPrompt,
    sourceImages: input.sourceImages,
    cloudinaryFolder: resolveCloudinaryJobFolder(jobId),
    status: 'created',
    unlocked: false,
    metadata: input.metadata,
    cloudinaryCloudName: cloudinaryCloudName || undefined,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  let created: Awaited<ReturnType<typeof createJob>>;
  try {
    created = await createJob(job);
  } catch (error) {
    if (input.clientRequestId && error instanceof HttpError && error.status === 409) {
      const existing = await getExistingMemoryJobForCreateInput({
        email: input.email,
        clientRequestId: input.clientRequestId,
      });

      if (existing) {
        return existing;
      }
    }

    throw error;
  }

  return {
    jobId: created.id,
    accessToken: created.accessToken,
    status: created.status,
    sourceImages: created.sourceImages,
  };
}

export function toCreateMemoryJobResponse(
  job: Awaited<ReturnType<typeof createMemoryJobRecord>>,
  baseUrl: string,
): CreateMemoryJobResponse {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '');
  return {
    ...job,
    statusUrl: `${normalizedBaseUrl}/api/memories/${job.jobId}/status?accessToken=${job.accessToken}`,
  };
}

export async function getMemoryJobStatus(jobId: string, accessToken?: string) {
  const job = await verifyAccess(jobId, accessToken);
  return jobToStatusResponse(job);
}

export async function getOperatorOrderStatus(jobId: string) {
  const job = await requireJob(jobId);
  return jobToOperatorOrderStatus(job);
}

export async function getLegacyMakeJobState(jobId: string) {
  const job = await requireJob(jobId);
  return jobToLegacyMakeState(job);
}

export async function unlockMemoryJob(jobId: string, input: UnlockJobInput) {
  const existing = await requireJob(jobId);

  const updated = await updateJob(jobId, (job) => ({
    ...(() => {
      if (job.unlocked) {
        return {
          ...job,
          paymentReference: job.paymentReference || input.paymentReference,
          paymentProvider: job.paymentProvider || input.provider || 'manual',
          updatedAt: nowIso(),
        };
      }

      if (job.status !== 'created') {
        throw new HttpError(409, `Cannot unlock job while it is ${job.status}.`);
      }

      return {
        ...job,
        unlocked: true,
        paymentReference: input.paymentReference,
        paymentProvider: input.provider || 'manual',
        status: isMakeConfigured() ? 'queued' : 'unlocked',
        lastError: undefined,
        updatedAt: nowIso(),
      };
    })(),
  }));

  if (!existing.unlocked && updated.unlocked && isMakeConfigured()) {
    await dispatchGenerationHandoff(updated);
  }

  return jobToStatusResponse(updated);
}

export async function applyMediaCommand(jobId: string, command: MediaCommand) {
  const updated = await updateJob(jobId, (job) => {
    const assetWithFolder =
      'asset' in command
        ? {
            ...command.asset,
            publicId:
              command.asset.provider === 'cloudinary'
                ? normalizeCloudinaryAssetPublicId(job.cloudinaryFolder, command.asset.publicId)
                : command.asset.publicId,
          }
        : undefined;

    if (command.command === 'request_generation') {
      assertJobUnlocked(job, 'generation starts');
      assertStatusIn(job, ['unlocked', 'failed'], 'queue generation');

      return {
        ...job,
        status: 'queued',
        lastError: undefined,
        updatedAt: nowIso(),
      };
    }

    if (command.command === 'mark_processing') {
      assertJobUnlocked(job, 'processing starts');
      assertStatusIn(job, ['queued', 'processing'], 'mark job as processing');

      return {
        ...job,
        status: 'processing',
        lastError: undefined,
        updatedAt: nowIso(),
      };
    }

    if (command.command === 'mark_preview_ready') {
      assertJobUnlocked(job, 'preview delivery');
      assertStatusIn(job, ['queued', 'processing', 'preview_ready'], 'mark preview ready');

      return {
        ...job,
        status: 'preview_ready',
        previewAsset: assetWithFolder,
        lastError: undefined,
        updatedAt: nowIso(),
      };
    }

    if (command.command === 'mark_completed') {
      assertJobUnlocked(job, 'completion');
      assertStatusIn(job, ['queued', 'processing', 'preview_ready', 'completed'], 'mark completed');

      return {
        ...job,
        status: 'completed',
        finalAsset: assetWithFolder,
        lastError: undefined,
        updatedAt: nowIso(),
      };
    }

    assertJobUnlocked(job, 'failure updates');
    assertStatusIn(job, ['queued', 'processing', 'preview_ready', 'failed'], 'mark failed');

    return {
      ...job,
      status: 'failed',
      lastError: command.error,
      updatedAt: nowIso(),
    };
  });

  return jobToStatusResponse(updated);
}

export async function recordDelivery(jobId: string, command: DeliveryCommand) {
  const updated = await updateJob(jobId, (job) => ({
    ...(() => {
      assertJobUnlocked(job, 'delivery');
      assertStatusIn(job, ['completed', 'delivered'], 'record delivery');
      if (!job.finalAsset) {
        throw new HttpError(409, 'Cannot record delivery before finalAsset exists on the canonical job.');
      }

      return {
        ...job,
        status: 'delivered',
        delivery: {
          channel: command.channel,
          provider: command.provider,
          recipient: command.recipient,
          deliveryId: command.deliveryId,
          deliveredAt: nowIso(),
        },
        updatedAt: nowIso(),
      };
    })(),
  }));

  return jobToStatusResponse(updated);
}

export async function applyMakeUpdate(event: MakeUpdateEvent) {
  if (event.event === 'queued') {
    return applyMediaCommand(event.jobId, { command: 'request_generation', provider: 'manual' });
  }

  if (event.event === 'processing') {
    return applyMediaCommand(event.jobId, { command: 'mark_processing', provider: 'manual' });
  }

  if (event.event === 'preview_ready') {
    return applyMediaCommand(event.jobId, {
      command: 'mark_preview_ready',
      provider: event.asset.provider,
      asset: event.asset,
    });
  }

  if (event.event === 'completed') {
    return applyMediaCommand(event.jobId, {
      command: 'mark_completed',
      provider: event.asset.provider,
      asset: event.asset,
    });
  }

  if (event.event === 'failed') {
    return applyMediaCommand(event.jobId, {
      command: 'mark_failed',
      provider: 'manual',
      error: event.error,
    });
  }

  if (event.event === 'delivered') {
    return recordDelivery(event.jobId, event.delivery);
  }

  throw new HttpError(400, `Unhandled Make event ${(event as { event: string }).event}.`);
}

export async function getJobForInternalUse(jobId: string) {
  return requireJob(jobId);
}

export async function hasJob(jobId: string) {
  return Boolean(await getJob(jobId));
}

export async function createCheckoutSession(
  jobId: string,
  accessToken?: string,
  baseUrlOverride?: string,
): Promise<CheckoutSessionResponse> {
  assertStripeConfigured();

  const job = await verifyAccess(jobId, accessToken);
  if (job.unlocked) {
    throw new HttpError(409, 'Job is already paid and unlocked.');
  }

  if (job.status !== 'created') {
    throw new HttpError(409, `Cannot start checkout while job is ${job.status}.`);
  }

  const stripe = getStripeClient();
  const { appUrl, stripePriceId } = getMemoriesConfig();
  const baseUrl = (baseUrlOverride || appUrl).replace(/\/$/, '');
  const statusUrl = new URL('/status', baseUrl);
  statusUrl.searchParams.set('jobId', job.id);
  statusUrl.searchParams.set('accessToken', job.accessToken);
  statusUrl.searchParams.set('checkout', 'cancelled');

  const successUrl = new URL('/success', baseUrl);
  successUrl.searchParams.set('jobId', job.id);
  successUrl.searchParams.set('accessToken', job.accessToken);
  successUrl.searchParams.set('email', job.email);
  successUrl.searchParams.set('checkout', 'success');

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    success_url: successUrl.toString(),
    cancel_url: statusUrl.toString(),
    line_items: [
      {
        price: stripePriceId,
        quantity: 1,
      },
    ],
    customer_email: job.email,
    client_reference_id: job.id,
    metadata: {
      jobId: job.id,
    },
  });

  if (!session.url) {
    throw new HttpError(502, 'Stripe checkout session did not include a redirect URL.');
  }

  return {
    checkoutUrl: session.url,
    sessionId: session.id,
  };
}

export async function finalizeStripeCheckout(
  session: {
    id: string;
    payment_status?: string | null;
    payment_intent?: string | { id?: string | null } | null;
    client_reference_id?: string | null;
    metadata?: Record<string, string> | null;
  },
) {
  const jobId = session.metadata?.jobId || session.client_reference_id;

  if (!jobId) {
    throw new HttpError(
      400,
      'Stripe checkout session metadata.jobId or client_reference_id is required.',
    );
  }

  if (session.payment_status && session.payment_status !== 'paid') {
    return null;
  }

  const paymentReference =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id || session.id;

  return unlockMemoryJob(jobId, {
    paymentReference,
    provider: 'stripe',
  });
}
