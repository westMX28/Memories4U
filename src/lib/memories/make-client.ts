import { getMemoriesConfig } from '@/lib/memories/config';
import { HttpError } from '@/lib/memories/errors';

type MakeAction = 'create' | 'unlock' | 'generate';

type MakePayload = {
  action: MakeAction;
  jobId: string;
  email: string;
  customerName?: string;
  storyPrompt: string;
  sourceImages: { url: string; label?: string }[];
  paymentReference?: string;
  metadata?: Record<string, string>;
};

export function isMakeConfigured() {
  const { makeWebhookUrl } = getMemoriesConfig();
  return Boolean(makeWebhookUrl);
}

export async function notifyMake(payload: MakePayload) {
  const { makeWebhookUrl, makeApiKey, makeTimeoutMs } = getMemoriesConfig();

  if (!makeWebhookUrl) {
    return;
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
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new HttpError(response.status, `Make webhook rejected the ${payload.action} event.`);
    }
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(502, `Make webhook failed during ${payload.action}.`);
  } finally {
    clearTimeout(timeout);
  }
}
