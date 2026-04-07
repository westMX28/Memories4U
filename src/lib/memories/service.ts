import { randomBytes, randomUUID } from 'node:crypto';

import { getMemoriesConfig } from '@/lib/memories/config';
import { HttpError } from '@/lib/memories/errors';
import { getJob, createJob, requireJob, updateJob } from '@/lib/memories/store';
import { isMakeConfigured } from '@/lib/memories/make-client';
import { assertStripeConfigured, getStripeClient } from '@/lib/memories/stripe';

import type {
  CheckoutSessionResponse,
  CreateMemoryJobInput,
  DeliveryCommand,
  MakeUpdateEvent,
  MediaCommand,
  MemoryJob,
  MemoryStatusResponse,
  SourceImage,
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

function assertSourceImages(images: unknown): SourceImage[] {
  if (!Array.isArray(images) || images.length === 0) {
    throw new HttpError(400, 'sourceImages must contain at least one image.');
  }

  return images.map((image, index) => {
    if (!image || typeof image !== 'object') {
      throw new HttpError(400, `sourceImages[${index}] must be an object.`);
    }

    const candidate = image as Record<string, unknown>;
    return {
      url: assertHttpUrl(candidate.url, `sourceImages[${index}].url`),
      ...(typeof candidate.label === 'string' && candidate.label.trim()
        ? { label: candidate.label.trim() }
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

export function parseCreateMemoryJobInput(input: unknown): CreateMemoryJobInput {
  const record = assertRecord(input, 'body');

  return {
    email: assertEmail(record.email, 'email'),
    customerName:
      typeof record.customerName === 'string' && record.customerName.trim()
        ? record.customerName.trim()
        : undefined,
    storyPrompt: assertNonEmptyString(record.storyPrompt, 'storyPrompt'),
    sourceImages: assertSourceImages(record.sourceImages),
    metadata:
      record.metadata && typeof record.metadata === 'object' && !Array.isArray(record.metadata)
        ? Object.fromEntries(
            Object.entries(record.metadata as Record<string, unknown>)
              .filter(([, value]) => typeof value === 'string' && value.trim())
              .map(([key, value]) => [key, String(value).trim()]),
          )
        : undefined,
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

export async function createMemoryJobRecord(input: CreateMemoryJobInput) {
  const { appUrl, cloudinaryCloudName } = getMemoriesConfig();
  const timestamp = nowIso();
  const job: MemoryJob = {
    id: randomUUID(),
    accessToken: randomToken(),
    email: input.email,
    customerName: input.customerName,
    storyPrompt: input.storyPrompt,
    sourceImages: input.sourceImages,
    status: 'created',
    unlocked: false,
    metadata: input.metadata,
    cloudinaryCloudName: cloudinaryCloudName || undefined,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const created = await createJob(job);

  return {
    jobId: created.id,
    accessToken: created.accessToken,
    status: created.status,
    statusUrl: `${appUrl.replace(/\/$/, '')}/api/memories/${created.id}/status?accessToken=${created.accessToken}`,
  };
}

export async function getMemoryJobStatus(jobId: string, accessToken?: string) {
  const job = await verifyAccess(jobId, accessToken);
  return jobToStatusResponse(job);
}

export async function unlockMemoryJob(jobId: string, input: UnlockJobInput, accessToken?: string) {
  if (accessToken) {
    await verifyAccess(jobId, accessToken);
  }

  await requireJob(jobId);

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

  return jobToStatusResponse(updated);
}

export async function applyMediaCommand(jobId: string, command: MediaCommand) {
  const updated = await updateJob(jobId, (job) => {
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
        previewAsset: command.asset,
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
        finalAsset: command.asset,
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
  const baseUrl = appUrl.replace(/\/$/, '');
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
    metadata?: Record<string, string> | null;
  },
) {
  const jobId = session.metadata?.jobId;

  if (!jobId) {
    throw new HttpError(400, 'Stripe checkout session metadata.jobId is required.');
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
