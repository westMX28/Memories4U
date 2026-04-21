import { getMemoriesConfig } from '@/lib/memories/config';
import { HttpError } from '@/lib/memories/errors';

import type { MemoryJob, MemoryStatus } from '@/lib/memories/contracts';

type GenerationWebhookPayload = {
  action: 'generate';
  jobId: string;
  status: MemoryStatus;
  accessToken: string;
  email: string;
  customerName?: string;
  storyPrompt: string;
  sourceImage1Url: string;
  sourceImage2Url: string;
  paymentReference?: string;
  paymentProvider?: 'stripe' | 'manual';
  createdAt: string;
  updatedAt: string;
};

function sanitizeGenerationText(value: string | undefined) {
  if (!value) {
    return '';
  }

  return value.replace(/["\\\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function buildGenerationWebhookPayload(job: MemoryJob): GenerationWebhookPayload {
  const sourceImage1Url = job.sourceImages[0]?.url || '';
  const sourceImage2Url = job.sourceImages[1]?.url || sourceImage1Url;

  if (!sourceImage1Url) {
    throw new HttpError(500, 'Generation handoff requires at least one source image URL.');
  }

  return {
    action: 'generate',
    jobId: job.id,
    status: job.status,
    accessToken: job.accessToken,
    email: job.email,
    customerName: sanitizeGenerationText(job.customerName),
    storyPrompt: sanitizeGenerationText(job.storyPrompt),
    sourceImage1Url,
    sourceImage2Url,
    paymentReference: job.paymentReference,
    paymentProvider: job.paymentProvider,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  };
}

function getGenerationWebhookUrl() {
  const { makeWriteWebhookUrl, makeWebhookUrl } = getMemoriesConfig();
  return makeWebhookUrl || makeWriteWebhookUrl;
}

export function isMakeConfigured() {
  return Boolean(getGenerationWebhookUrl());
}

export async function dispatchGenerationHandoff(job: MemoryJob) {
  const { makeApiKey, makeTimeoutMs } = getMemoriesConfig();
  const generationWebhookUrl = getGenerationWebhookUrl();

  if (!generationWebhookUrl) {
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), makeTimeoutMs);

  try {
    const response = await fetch(generationWebhookUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(makeApiKey ? { authorization: `Bearer ${makeApiKey}` } : {}),
      },
      body: JSON.stringify(buildGenerationWebhookPayload(job)),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new HttpError(response.status, 'Generation webhook rejected the unlock handoff.');
    }
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(502, 'Generation webhook failed during unlock handoff.');
  } finally {
    clearTimeout(timeout);
  }
}
