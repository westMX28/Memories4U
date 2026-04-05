import { randomBytes, randomUUID } from 'node:crypto';

import { getMemoriesConfig } from '@/lib/memories/config';
import { HttpError } from '@/lib/memories/errors';
import { getJob, createJob, requireJob, updateJob } from '@/lib/memories/store';
import { isMakeConfigured, notifyMake } from '@/lib/memories/make-client';

import type {
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
      url: assertNonEmptyString(candidate.url, `sourceImages[${index}].url`),
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
    email: assertNonEmptyString(record.email, 'email'),
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
        url: assertNonEmptyString(asset.url, 'asset.url'),
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

async function verifyAccess(jobId: string, accessToken?: string) {
  const job = await requireJob(jobId);
  if (!accessToken || accessToken !== job.accessToken) {
    throw new HttpError(401, 'Access token is invalid for this job.');
  }

  return job;
}

function makePayloadFromJob(job: MemoryJob) {
  return {
    jobId: job.id,
    email: job.email,
    customerName: job.customerName,
    storyPrompt: job.storyPrompt,
    sourceImages: job.sourceImages,
    paymentReference: job.paymentReference,
    metadata: job.metadata,
  };
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

  await createJob(job);

  let warning: string | undefined;
  if (isMakeConfigured()) {
    try {
      await notifyMake({
        action: 'create',
        ...makePayloadFromJob(job),
      });
    } catch (error) {
      warning = error instanceof Error ? error.message : 'Make create dispatch failed.';
    }
  }

  return {
    jobId: job.id,
    accessToken: job.accessToken,
    status: job.status,
    statusUrl: `${appUrl.replace(/\/$/, '')}/api/memories/${job.id}/status?accessToken=${job.accessToken}`,
    warning,
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

  const updated = await updateJob(jobId, (job) => ({
    ...job,
    unlocked: true,
    paymentReference: input.paymentReference,
    status: isMakeConfigured() ? 'queued' : 'unlocked',
    lastError: undefined,
    updatedAt: nowIso(),
  }));

  if (isMakeConfigured()) {
    try {
      await notifyMake({
        action: 'unlock',
        ...makePayloadFromJob(updated),
      });
    } catch (error) {
      return updateJob(jobId, (job) => ({
        ...job,
        status: 'unlocked',
        lastError: error instanceof Error ? error.message : 'Make unlock dispatch failed.',
        updatedAt: nowIso(),
      })).then(jobToStatusResponse);
    }
  }

  return jobToStatusResponse(updated);
}

export async function applyMediaCommand(jobId: string, command: MediaCommand) {
  const updated = await updateJob(jobId, (job) => {
    if (!job.unlocked && command.command === 'request_generation') {
      throw new HttpError(409, 'Job must be unlocked before generation starts.');
    }

    if (command.command === 'request_generation') {
      return {
        ...job,
        status: 'queued',
        lastError: undefined,
        updatedAt: nowIso(),
      };
    }

    if (command.command === 'mark_processing') {
      return {
        ...job,
        status: 'processing',
        lastError: undefined,
        updatedAt: nowIso(),
      };
    }

    if (command.command === 'mark_preview_ready') {
      return {
        ...job,
        status: 'preview_ready',
        previewAsset: command.asset,
        lastError: undefined,
        updatedAt: nowIso(),
      };
    }

    if (command.command === 'mark_completed') {
      return {
        ...job,
        status: 'completed',
        finalAsset: command.asset,
        lastError: undefined,
        updatedAt: nowIso(),
      };
    }

    return {
      ...job,
      status: 'failed',
      lastError: command.error,
      updatedAt: nowIso(),
    };
  });

  if (command.command === 'request_generation' && command.provider === 'make' && isMakeConfigured()) {
    try {
      await notifyMake({
        action: 'generate',
        ...makePayloadFromJob(updated),
      });
    } catch (error) {
      return updateJob(jobId, (job) => ({
        ...job,
        status: 'unlocked',
        lastError: error instanceof Error ? error.message : 'Make generation dispatch failed.',
        updatedAt: nowIso(),
      })).then(jobToStatusResponse);
    }
  }

  return jobToStatusResponse(updated);
}

export async function recordDelivery(jobId: string, command: DeliveryCommand) {
  const updated = await updateJob(jobId, (job) => ({
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
