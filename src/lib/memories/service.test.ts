import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { HttpError } from '@/lib/memories/errors';
import { setStripeClientForTests } from '@/lib/memories/stripe';
import {
  applyMediaCommand,
  createMemoryJobId,
  createCheckoutSession,
  createMemoryJobRecord,
  finalizeStripeCheckout,
  getMemoryJobStatus,
  getOperatorOrderStatus,
  parseCreateMemoryJobFormData,
  parseCreateMemoryJobInput,
  parseMediaCommand,
  recordDelivery,
  unlockMemoryJob,
} from '@/lib/memories/service';

let tempRoot = '';
const originalFetch = global.fetch;

beforeEach(async () => {
  if (tempRoot) {
    await rm(tempRoot, { recursive: true, force: true });
  }

  tempRoot = await mkdtemp(path.join(os.tmpdir(), 'memories-service-'));
  process.env.MEMORIES_DATA_FILE = path.join(tempRoot, 'jobs.json');
  process.env.MEMORIES_APP_URL = 'http://localhost:3000';
  process.env.MEMORIES_SUPABASE_URL = '';
  process.env.MEMORIES_SUPABASE_SERVICE_ROLE_KEY = '';
  process.env.MEMORIES_SUPABASE_TIMEOUT_MS = '';
  process.env.STRIPE_SECRET_KEY = '';
  process.env.STRIPE_WEBHOOK_SECRET = '';
  process.env.STRIPE_PRICE_ID = '';
  process.env.MEMORIES_MAKE_WEBHOOK_URL = '';
  process.env.MEMORIES_MAKE_READ_WEBHOOK_URL = '';
  process.env.MEMORIES_MAKE_WRITE_WEBHOOK_URL = '';
  process.env.MEMORIES_MAKE_API_KEY = '';
  process.env.MEMORIES_CLOUDINARY_CLOUD_NAME = '';
  process.env.MEMORIES_CLOUDINARY_API_KEY = '';
  process.env.MEMORIES_CLOUDINARY_API_SECRET = '';
  process.env.MEMORIES_CLOUDINARY_UPLOAD_FOLDER = 'Memories';
  global.fetch = originalFetch;
  setStripeClientForTests(null);
});

test('creates and progresses a memory job through delivery', async () => {
  const created = await createMemoryJobRecord({
    email: 'customer@example.com',
    customerName: 'Casey',
    storyPrompt: 'A warm birthday memory.',
    sourceImages: [{ storage: 'remote_url', url: 'https://example.com/a.jpg' }],
    metadata: { occasion: 'birthday' },
  });

  const initial = await getMemoryJobStatus(created.jobId, created.accessToken);
  assert.equal(initial.status, 'created');
  assert.equal(initial.unlocked, false);

  const unlocked = await unlockMemoryJob(created.jobId, { paymentReference: 'pay_123' });
  assert.equal(unlocked.status, 'unlocked');
  assert.equal(unlocked.unlocked, true);

  const queued = await applyMediaCommand(created.jobId, {
    command: 'request_generation',
    provider: 'manual',
  });
  assert.equal(queued.status, 'queued');

  const processing = await applyMediaCommand(created.jobId, {
    command: 'mark_processing',
    provider: 'manual',
  });
  assert.equal(processing.status, 'processing');

  const preview = await applyMediaCommand(created.jobId, {
    command: 'mark_preview_ready',
    provider: 'manual',
    asset: {
      provider: 'manual',
      url: 'https://example.com/preview.jpg',
      width: 1024,
      height: 1024,
    },
  });
  assert.equal(preview.status, 'preview_ready');
  assert.equal(preview.previewAsset?.url, 'https://example.com/preview.jpg');

  const completed = await applyMediaCommand(created.jobId, {
    command: 'mark_completed',
    provider: 'manual',
    asset: {
      provider: 'manual',
      url: 'https://example.com/final.jpg',
      publicId: 'final-asset',
      format: 'jpg',
    },
  });
  assert.equal(completed.status, 'completed');
  assert.equal(completed.finalAsset?.publicId, 'final-asset');

  const delivered = await recordDelivery(created.jobId, {
    channel: 'email',
    provider: 'manual',
    recipient: 'customer@example.com',
  });
  assert.equal(delivered.status, 'delivered');
  assert.equal(delivered.delivery?.recipient, 'customer@example.com');
});

test('duplicate unlock does not regress an in-flight job', async () => {
  const created = await createMemoryJobRecord({
    email: 'customer@example.com',
    storyPrompt: 'A memory.',
    sourceImages: [{ storage: 'remote_url', url: 'https://example.com/a.jpg' }],
  });

  await unlockMemoryJob(created.jobId, { paymentReference: 'pay_123' });
  await applyMediaCommand(created.jobId, {
    command: 'request_generation',
    provider: 'manual',
  });

  const duplicateUnlock = await unlockMemoryJob(created.jobId, { paymentReference: 'pay_456' });

  assert.equal(duplicateUnlock.status, 'queued');
  assert.equal(duplicateUnlock.unlocked, true);
});

test('reuses an existing job when create is retried with the same clientRequestId', async () => {
  const first = await createMemoryJobRecord({
    email: 'customer@example.com',
    clientRequestId: 'client-request-123',
    storyPrompt: 'A memory.',
    sourceImages: [{ storage: 'remote_url', url: 'https://example.com/a.jpg' }],
  });

  const duplicate = await createMemoryJobRecord({
    email: 'customer@example.com',
    clientRequestId: 'client-request-123',
    storyPrompt: 'A memory that should not create a second job.',
    sourceImages: [{ storage: 'remote_url', url: 'https://example.com/b.jpg' }],
  });

  assert.equal(duplicate.jobId, first.jobId);
  assert.equal(duplicate.accessToken, first.accessToken);
  assert.deepEqual(duplicate.sourceImages, first.sourceImages);
});

test('returns an honest operator order status without fabricating history', async () => {
  const created = await createMemoryJobRecord({
    email: 'customer@example.com',
    storyPrompt: 'A memory.',
    sourceImages: [{ storage: 'remote_url', url: 'https://example.com/a.jpg' }],
  });

  await unlockMemoryJob(created.jobId, {
    paymentReference: 'pi_123',
    provider: 'stripe',
  });

  await applyMediaCommand(created.jobId, {
    command: 'request_generation',
    provider: 'manual',
  });

  await applyMediaCommand(created.jobId, {
    command: 'mark_completed',
    provider: 'manual',
    asset: {
      provider: 'manual',
      url: 'https://example.com/final.jpg',
      format: 'jpg',
    },
  });

  const operatorStatus = await getOperatorOrderStatus(created.jobId);

  assert.equal(operatorStatus.summary.orderId, created.jobId);
  assert.equal(operatorStatus.summary.customerEmail, 'customer@example.com');
  assert.equal(operatorStatus.summary.orderState, 'ready');
  assert.equal(operatorStatus.payment.status, 'paid');
  assert.equal(operatorStatus.payment.provider, 'stripe');
  assert.equal(operatorStatus.payment.reference, 'pi_123');
  assert.equal(operatorStatus.generation.status, 'completed');
  assert.equal(operatorStatus.assets.preview.present, false);
  assert.equal(operatorStatus.assets.final.present, true);
  assert.equal(operatorStatus.assets.final.asset?.url, 'https://example.com/final.jpg');
  assert.equal(operatorStatus.delivery.delivered, false);
  assert.equal(operatorStatus.history.mode, 'current_state_only');
  assert.match(operatorStatus.history.note, /No event timeline is persisted yet/i);
  assert.equal(operatorStatus.history.timestamps.createdAt, operatorStatus.summary.createdAt);
  assert.equal(operatorStatus.history.references.paymentReference, 'pi_123');
  assert.equal(operatorStatus.history.references.finalAssetUrl, 'https://example.com/final.jpg');
  assert.equal('paidAt' in operatorStatus.history.timestamps, false);
});

test('rejects invalid lifecycle transitions', async () => {
  const created = await createMemoryJobRecord({
    email: 'customer@example.com',
    storyPrompt: 'A memory.',
    sourceImages: [{ storage: 'remote_url', url: 'https://example.com/a.jpg' }],
  });

  await assert.rejects(
    applyMediaCommand(created.jobId, {
      command: 'mark_processing',
      provider: 'manual',
    }),
    (error: unknown) => {
      assert.ok(error instanceof HttpError);
      assert.equal(error.status, 409);
      return true;
    },
  );

  await unlockMemoryJob(created.jobId, { paymentReference: 'pay_123' });

  await assert.rejects(
    recordDelivery(created.jobId, {
      channel: 'email',
      provider: 'manual',
      recipient: 'customer@example.com',
    }),
    (error: unknown) => {
      assert.ok(error instanceof HttpError);
      assert.equal(error.status, 409);
      return true;
    },
  );
});

test('rejects malformed customer and asset inputs', async () => {
  assert.throws(
    () =>
      parseCreateMemoryJobInput({
        email: 'not-an-email',
        storyPrompt: 'A memory.',
        sourceImages: [{ storage: 'remote_url', url: 'https://example.com/a.jpg' }],
      }),
    (error: unknown) => {
      assert.ok(error instanceof HttpError);
      assert.equal(error.status, 400);
      assert.match(error.message, /email/i);
      return true;
    },
  );

  assert.throws(
    () =>
      parseCreateMemoryJobInput({
        email: 'customer@example.com',
        storyPrompt: 'A memory.',
        sourceImages: [{ storage: 'remote_url', url: 'ftp://example.com/a.jpg' }],
      }),
    (error: unknown) => {
      assert.ok(error instanceof HttpError);
      assert.equal(error.status, 400);
      assert.match(error.message, /sourceImages\[0\]\.url/i);
      return true;
    },
  );

  assert.throws(
    () =>
      parseMediaCommand({
        command: 'mark_completed',
        provider: 'manual',
        asset: {
          url: 'not-a-url',
        },
      }),
    (error: unknown) => {
      assert.ok(error instanceof HttpError);
      assert.equal(error.status, 400);
      assert.match(error.message, /asset\.url/i);
      return true;
    },
  );
});

test('parseCreateMemoryJobInput preserves top-level occasion inside metadata', () => {
  const parsed = parseCreateMemoryJobInput({
    email: 'customer@example.com',
    storyPrompt: 'A memory.',
    occasion: 'birthday',
    sourceImages: [{ storage: 'remote_url', url: 'https://example.com/a.jpg' }],
  });

  assert.equal(parsed.metadata?.occasion, 'birthday');
});

test('stages multipart uploads into hosted source image records', async () => {
  process.env.MEMORIES_CLOUDINARY_CLOUD_NAME = 'demo-cloud';
  process.env.MEMORIES_CLOUDINARY_API_KEY = 'api-key';
  process.env.MEMORIES_CLOUDINARY_API_SECRET = 'api-secret';
  process.env.MEMORIES_CLOUDINARY_UPLOAD_FOLDER = 'Memories';

  global.fetch = async (input, init) => {
    assert.equal(String(input), 'https://api.cloudinary.com/v1_1/demo-cloud/image/upload');
    assert.equal(init?.method, 'POST');
    assert.ok(init?.body instanceof FormData);
    assert.equal(init.body.get('folder'), 'Memories/11111111-1111-1111-1111-111111111111');

    return new Response(
      JSON.stringify({
        secure_url: 'https://res.cloudinary.com/demo-cloud/image/upload/v1/source-image.png',
      }),
      {
        headers: { 'content-type': 'application/json' },
      },
    );
  };

  const formData = new FormData();
  formData.set('email', 'customer@example.com');
  formData.set('customerName', 'Casey');
  formData.set('storyPrompt', 'A warm birthday memory.');
  formData.set('occasion', 'birthday');
  formData.set('image1', new File([Buffer.from('png-data')], 'portrait.png', { type: 'image/png' }));

  const parsed = await parseCreateMemoryJobFormData(
    formData,
    '11111111-1111-1111-1111-111111111111',
  );

  assert.equal(parsed.sourceImages.length, 1);
  assert.equal(parsed.sourceImages[0]?.storage, 'remote_url');
  assert.equal(parsed.sourceImages[0]?.mimeType, 'image/png');
  assert.equal(
    parsed.sourceImages[0]?.url,
    'https://res.cloudinary.com/demo-cloud/image/upload/v1/source-image.png',
  );
  assert.equal(parsed.metadata?.occasion, 'birthday');
});

test('stores generated Cloudinary asset public ids under the job folder', async () => {
  const created = await createMemoryJobRecord({
    email: 'customer@example.com',
    storyPrompt: 'A memory.',
    sourceImages: [{ storage: 'remote_url', url: 'https://example.com/a.jpg' }],
  });

  await unlockMemoryJob(created.jobId, { paymentReference: 'pay_123' });
  await applyMediaCommand(created.jobId, {
    command: 'request_generation',
    provider: 'manual',
  });
  await applyMediaCommand(created.jobId, {
    command: 'mark_processing',
    provider: 'manual',
  });

  const completed = await applyMediaCommand(created.jobId, {
    command: 'mark_completed',
    provider: 'cloudinary',
    asset: {
      provider: 'cloudinary',
      url: 'https://res.cloudinary.com/demo/image/upload/v1/final.jpg',
      publicId: 'final-image',
    },
  });

  assert.equal(completed.finalAsset?.publicId, `Memories/${created.jobId}/final-image`);
});

test('rejects multipart uploads when hosted source-image staging is not configured', async () => {
  const formData = new FormData();
  formData.set('email', 'customer@example.com');
  formData.set('storyPrompt', 'A warm birthday memory.');
  formData.set('image1', new File([Buffer.from('png-data')], 'portrait.png', { type: 'image/png' }));

  await assert.rejects(parseCreateMemoryJobFormData(formData), (error: unknown) => {
    assert.ok(error instanceof HttpError);
    assert.equal(error.status, 503);
    assert.equal(error.code, 'UPLOAD_UNAVAILABLE');
    return true;
  });
});

test('rejects unsupported multipart file types', async () => {
  const formData = new FormData();
  formData.set('email', 'customer@example.com');
  formData.set('storyPrompt', 'A warm birthday memory.');
  formData.set('image1', new File([Buffer.from('gif-data')], 'portrait.gif', { type: 'image/gif' }));

  await assert.rejects(parseCreateMemoryJobFormData(formData), (error: unknown) => {
    assert.ok(error instanceof HttpError);
    assert.equal(error.status, 400);
    assert.match(error.message, /PNG or JPG/i);
    return true;
  });
});

test('creates a Stripe checkout session for a created job', async () => {
  process.env.STRIPE_SECRET_KEY = 'sk_test_123';
  process.env.STRIPE_PRICE_ID = 'price_123';

  const created = await createMemoryJobRecord({
    email: 'customer@example.com',
    storyPrompt: 'A memory.',
    sourceImages: [{ storage: 'remote_url', url: 'https://example.com/a.jpg' }],
  });

  const createdSessions: Array<Record<string, unknown>> = [];
  setStripeClientForTests({
    checkout: {
      sessions: {
        create: async (payload: Record<string, unknown>) => {
          createdSessions.push(payload);

          return {
            id: 'cs_test_123',
            url: 'https://checkout.stripe.com/c/pay/cs_test_123',
          };
        },
      },
    },
  } as never);

  const session = await createCheckoutSession(created.jobId, created.accessToken);
  assert.equal(session.sessionId, 'cs_test_123');
  assert.equal(session.checkoutUrl, 'https://checkout.stripe.com/c/pay/cs_test_123');
  assert.equal(createdSessions[0]?.client_reference_id, created.jobId);
  assert.equal((createdSessions[0]?.metadata as Record<string, string>).jobId, created.jobId);
  assert.equal(createdSessions[0]?.customer_email, 'customer@example.com');
});

test('returns a stable payment-unavailable error when Stripe is not configured', async () => {
  const created = await createMemoryJobRecord({
    email: 'customer@example.com',
    storyPrompt: 'A memory.',
    sourceImages: [{ storage: 'remote_url', url: 'https://example.com/a.jpg' }],
  });

  await assert.rejects(createCheckoutSession(created.jobId, created.accessToken), (error: unknown) => {
    assert.ok(error instanceof HttpError);
    assert.equal(error.status, 503);
    assert.equal(error.code, 'PAYMENT_UNAVAILABLE');
    assert.match(error.message, /Payment checkout is unavailable/i);
    return true;
  });
});

test('finalizes Stripe checkout through the existing unlock flow', async () => {
  const created = await createMemoryJobRecord({
    email: 'customer@example.com',
    storyPrompt: 'A memory.',
    sourceImages: [{ storage: 'remote_url', url: 'https://example.com/a.jpg' }],
  });

  const unlocked = await finalizeStripeCheckout({
    id: 'cs_test_123',
    payment_status: 'paid',
    payment_intent: 'pi_123',
    metadata: {
      jobId: created.jobId,
    },
  });

  assert.equal(unlocked?.status, 'unlocked');
  assert.equal(unlocked?.unlocked, true);

  const duplicate = await finalizeStripeCheckout({
    id: 'cs_test_123',
    payment_status: 'paid',
    payment_intent: 'pi_123',
    metadata: {
      jobId: created.jobId,
    },
  });

  assert.equal(duplicate?.status, 'unlocked');

  const status = await getMemoryJobStatus(created.jobId, created.accessToken);
  assert.equal(status.unlocked, true);
});

test('finalizes Stripe checkout through client_reference_id when metadata.jobId is absent', async () => {
  const created = await createMemoryJobRecord({
    email: 'customer@example.com',
    storyPrompt: 'A memory.',
    sourceImages: [{ storage: 'remote_url', url: 'https://example.com/a.jpg' }],
  });

  const unlocked = await finalizeStripeCheckout({
    id: 'cs_test_456',
    client_reference_id: created.jobId,
    payment_status: 'paid',
    payment_intent: 'pi_456',
    metadata: {},
  });

  assert.equal(unlocked?.status, 'unlocked');
  assert.equal(unlocked?.unlocked, true);
  assert.equal(unlocked?.jobId, created.jobId);
});

function installSupabaseMock(options?: { minimalMutationResponses?: boolean }) {
  const orders = new Map<string, Record<string, unknown>>();
  const generationJobs = new Map<string, Record<string, unknown>>();
  const generatedAssets = new Map<string, Array<Record<string, unknown>>>();
  const eventLog: Array<Record<string, unknown>> = [];
  const generationCalls: Array<{ url: string; body: Record<string, unknown> }> = [];

  global.fetch = async (input, init) => {
    const url = new URL(String(input));

    if (url.origin === 'https://demo-project.supabase.co') {
      const pathname = url.pathname.replace('/rest/v1/', '');

      if (pathname === 'orders' && init?.method === 'GET') {
        const email = url.searchParams.get('email')?.replace(/^eq\./, '') || '';
        const clientRequestId = url.searchParams.get('client_request_id')?.replace(/^eq\./, '') || '';
        if (email && clientRequestId) {
          const matched = [...orders.values()].find(
            (row) => row.email === email && row.client_request_id === clientRequestId,
          );
          return new Response(JSON.stringify(matched ? [matched] : []), {
            headers: { 'content-type': 'application/json' },
          });
        }

        const jobId = url.searchParams.get('id')?.replace(/^eq\./, '') || '';
        const row = orders.get(jobId);
        return new Response(JSON.stringify(row ? [row] : []), {
          headers: { 'content-type': 'application/json' },
        });
      }

      if (pathname === 'orders' && init?.method === 'POST') {
        const row = JSON.parse(String(init.body)) as Record<string, unknown>;
        orders.set(String(row.id), row);
        return new Response(JSON.stringify([row]), {
          headers: { 'content-type': 'application/json' },
        });
      }

      if (pathname === 'generation_jobs' && init?.method === 'POST') {
        const row = JSON.parse(String(init.body)) as Record<string, unknown>;
        generationJobs.set(String(row.order_id), row);
        return options?.minimalMutationResponses
          ? new Response(null, { status: 201 })
          : new Response(JSON.stringify([row]), {
              headers: { 'content-type': 'application/json' },
            });
      }

      if (pathname === 'generated_assets' && init?.method === 'DELETE') {
        const orderId = url.searchParams.get('order_id')?.replace(/^eq\./, '') || '';
        generatedAssets.delete(orderId);
        return new Response(null, { status: 204 });
      }

      if (pathname === 'generated_assets' && init?.method === 'POST') {
        const rows = JSON.parse(String(init.body)) as Array<Record<string, unknown>>;
        const orderId = String(rows[0]?.order_id || '');
        generatedAssets.set(orderId, rows);
        return options?.minimalMutationResponses
          ? new Response(null, { status: 201 })
          : new Response(JSON.stringify(rows), {
              headers: { 'content-type': 'application/json' },
            });
      }

      if (pathname === 'event_log' && init?.method === 'POST') {
        const row = JSON.parse(String(init.body)) as Record<string, unknown>;
        eventLog.push(row);
        return options?.minimalMutationResponses
          ? new Response(null, { status: 201 })
          : new Response(JSON.stringify([row]), {
              headers: { 'content-type': 'application/json' },
            });
      }
    }

    if (
      url.href === 'https://example.com/make/generate' ||
      url.href === 'https://example.com/make/generic' ||
      url.href === 'https://example.com/make/write'
    ) {
      const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
      generationCalls.push({ url: url.href, body });
      return new Response(JSON.stringify({ accepted: true }), {
        headers: { 'content-type': 'application/json' },
      });
    }

    throw new Error(`Unexpected fetch ${url.href}.`);
  };

  return { orders, generationJobs, generatedAssets, eventLog, generationCalls };
}

test('uses Supabase as the canonical store and Make only for generation handoff', async () => {
  process.env.MEMORIES_SUPABASE_URL = 'https://demo-project.supabase.co';
  process.env.MEMORIES_SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
  process.env.MEMORIES_MAKE_WEBHOOK_URL = 'https://example.com/make/generate';
  process.env.MEMORIES_MAKE_API_KEY = 'test-key';

  const mock = installSupabaseMock();

  const created = await createMemoryJobRecord({
    email: 'customer@example.com',
    customerName: 'Casey',
    storyPrompt: 'A warm birthday memory.',
    sourceImages: [{ storage: 'remote_url', url: 'https://example.com/a.jpg' }],
  });

  assert.equal(mock.orders.size, 1);
  assert.equal(mock.generationCalls.length, 0);

  const status = await getMemoryJobStatus(created.jobId, created.accessToken);
  assert.equal(status.status, 'created');
  assert.equal(status.unlocked, false);

  const unlocked = await unlockMemoryJob(created.jobId, { paymentReference: 'pay_remote_123' });
  assert.equal(unlocked.status, 'queued');
  assert.equal(unlocked.unlocked, true);
  assert.equal(mock.generationCalls.length, 1);
  assert.equal(mock.generationCalls[0]?.url, 'https://example.com/make/generate');
  assert.equal(mock.generationCalls[0]?.body.jobId, created.jobId);
  assert.equal(mock.generationCalls[0]?.body.status, 'queued');

  const preview = await applyMediaCommand(created.jobId, {
    command: 'mark_preview_ready',
    provider: 'make',
    asset: {
      provider: 'make',
      url: 'https://example.com/preview.jpg',
    },
  });
  assert.equal(preview.status, 'preview_ready');

  const completed = await applyMediaCommand(created.jobId, {
    command: 'mark_completed',
    provider: 'make',
    asset: {
      provider: 'make',
      url: 'https://example.com/final.jpg',
    },
  });
  assert.equal(completed.status, 'completed');

  const delivered = await recordDelivery(created.jobId, {
    channel: 'email',
    provider: 'make',
    recipient: 'customer@example.com',
  });
  assert.equal(delivered.status, 'delivered');
  assert.equal(mock.generationJobs.get(created.jobId)?.status, 'delivered');
  assert.equal(mock.generatedAssets.get(created.jobId)?.length, 2);
  assert.ok(mock.eventLog.length >= 4);
});

test('prefers the write-specific Make webhook for unlock handoff when both aliases are configured', async () => {
  process.env.MEMORIES_SUPABASE_URL = 'https://demo-project.supabase.co';
  process.env.MEMORIES_SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
  delete process.env.MEMORIES_MAKE_WEBHOOK_URL;
  delete process.env.MEMORIES_MAKE_WRITE_WEBHOOK_URL;
  process.env.MAKE_WEBHOOK_URL = 'https://example.com/make/generic';
  process.env.MAKE_WRITE_WEBHOOK_URL = 'https://example.com/make/write';

  const mock = installSupabaseMock();

  const created = await createMemoryJobRecord({
    email: 'customer@example.com',
    storyPrompt: 'A warm birthday memory.',
    sourceImages: [{ storage: 'remote_url', url: 'https://example.com/a.jpg' }],
  });

  const unlocked = await unlockMemoryJob(created.jobId, { paymentReference: 'pay_remote_456' });

  assert.equal(unlocked.status, 'queued');
  assert.equal(mock.generationCalls.length, 1);
  assert.equal(mock.generationCalls[0]?.url, 'https://example.com/make/write');
  assert.equal(mock.generationCalls[0]?.body.jobId, created.jobId);
  assert.equal(mock.generationCalls[0]?.body.status, 'queued');
});

test('accepts empty-body 201 responses from Supabase return=minimal mutations', async () => {
  process.env.MEMORIES_SUPABASE_URL = 'https://demo-project.supabase.co';
  process.env.MEMORIES_SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';

  const mock = installSupabaseMock({ minimalMutationResponses: true });

  const created = await createMemoryJobRecord({
    email: 'customer@example.com',
    storyPrompt: 'A warm birthday memory.',
    sourceImages: [{ storage: 'remote_url', url: 'https://example.com/a.jpg' }],
  });

  assert.equal(created.status, 'created');
  assert.equal(mock.orders.size, 1);
  assert.equal(mock.generationJobs.get(created.jobId)?.status, 'created');
  assert.equal(mock.eventLog.length, 1);
});

test('reuses an existing Supabase-backed job when create is retried with the same clientRequestId', async () => {
  process.env.MEMORIES_SUPABASE_URL = 'https://demo-project.supabase.co';
  process.env.MEMORIES_SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';

  const mock = installSupabaseMock();

  const first = await createMemoryJobRecord({
    email: 'customer@example.com',
    clientRequestId: 'client-request-456',
    storyPrompt: 'A memory.',
    sourceImages: [{ storage: 'remote_url', url: 'https://example.com/a.jpg' }],
  });

  const duplicate = await createMemoryJobRecord({
    email: 'customer@example.com',
    clientRequestId: 'client-request-456',
    storyPrompt: 'A different prompt.',
    sourceImages: [{ storage: 'remote_url', url: 'https://example.com/b.jpg' }],
  });

  assert.equal(mock.orders.size, 1);
  assert.equal(duplicate.jobId, first.jobId);
  assert.equal(duplicate.accessToken, first.accessToken);
});

test('reuses the canonical job when a Supabase create hits a clientRequestId uniqueness race', async () => {
  process.env.MEMORIES_SUPABASE_URL = 'https://demo-project.supabase.co';
  process.env.MEMORIES_SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';

  const orders = new Map<string, Record<string, unknown>>();
  let duplicateLookupCount = 0;

  global.fetch = async (input, init) => {
    const url = new URL(String(input));
    const pathname = url.pathname.replace('/rest/v1/', '');

    if (url.origin !== 'https://demo-project.supabase.co') {
      throw new Error(`Unexpected fetch ${url.href}.`);
    }

    if (pathname === 'orders' && init?.method === 'GET') {
      const email = url.searchParams.get('email')?.replace(/^eq\./, '') || '';
      const clientRequestId = url.searchParams.get('client_request_id')?.replace(/^eq\./, '') || '';

      if (email && clientRequestId) {
        duplicateLookupCount += 1;
        const matched = [...orders.values()].find(
          (row) => row.email === email && row.client_request_id === clientRequestId,
        );
        return new Response(JSON.stringify(matched ? [matched] : []), {
          headers: { 'content-type': 'application/json' },
        });
      }

      const jobId = url.searchParams.get('id')?.replace(/^eq\./, '') || '';
      const row = orders.get(jobId);
      return new Response(JSON.stringify(row ? [row] : []), {
        headers: { 'content-type': 'application/json' },
      });
    }

    if (pathname === 'orders' && init?.method === 'POST') {
      const incoming = JSON.parse(String(init.body)) as Record<string, unknown>;
      const existing = {
        ...incoming,
        id: 'job_race_winner',
        access_token: 'race-access-token',
      };
      orders.set(String(existing.id), existing);

      return new Response('duplicate key value violates unique constraint', {
        status: 409,
      });
    }

    throw new Error(`Unexpected fetch ${url.href}.`);
  };

  const created = await createMemoryJobRecord({
    email: 'customer@example.com',
    clientRequestId: 'client-request-race',
    storyPrompt: 'A memory.',
    sourceImages: [{ storage: 'remote_url', url: 'https://example.com/a.jpg' }],
  });

  assert.equal(created.jobId, 'job_race_winner');
  assert.equal(created.accessToken, 'race-access-token');
  assert.equal(duplicateLookupCount, 2);
});

test('rejects delivery when the Supabase canonical row is completed without finalAsset', async () => {
  process.env.MEMORIES_SUPABASE_URL = 'https://demo-project.supabase.co';
  process.env.MEMORIES_SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';

  const mock = installSupabaseMock();

  const created = await createMemoryJobRecord({
    email: 'customer@example.com',
    storyPrompt: 'A memory.',
    sourceImages: [{ storage: 'remote_url', url: 'https://example.com/a.jpg' }],
  });

  const stored = mock.orders.get(created.jobId);
  assert.ok(stored);
  mock.orders.set(created.jobId, {
    ...stored,
    status: 'completed',
    unlocked: true,
    final_asset: null,
  });

  await assert.rejects(
    recordDelivery(created.jobId, {
      channel: 'email',
      provider: 'make',
      recipient: 'customer@example.com',
    }),
    (error: unknown) => {
      assert.ok(error instanceof HttpError);
      assert.equal(error.status, 409);
      assert.match(error.message, /finalAsset exists on the canonical job/i);
      return true;
    },
  );
});

test('serializes inline upload metadata into the Supabase canonical row', async () => {
  process.env.MEMORIES_SUPABASE_URL = 'https://demo-project.supabase.co';
  process.env.MEMORIES_SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';

  const mock = installSupabaseMock();

  const created = await createMemoryJobRecord({
    email: 'customer@example.com',
    storyPrompt: 'A memory.',
    sourceImages: [
      {
        storage: 'inline_data_url',
        dataUrl: 'data:image/png;base64,cG5n',
        mimeType: 'image/png',
        filename: 'portrait.png',
        sizeBytes: 3,
        sha256: 'abc123',
        label: 'customer',
      },
    ],
  });

  const row = mock.orders.get(created.jobId);
  assert.ok(row);
  assert.equal(row.cloudinary_folder, `Memories/${created.jobId}`);
  assert.deepEqual(row.source_images, [
    {
      storage: 'inline_data_url',
      dataUrl: 'data:image/png;base64,cG5n',
      mimeType: 'image/png',
      filename: 'portrait.png',
      sizeBytes: 3,
      sha256: 'abc123',
      label: 'customer',
    },
  ]);
  assert.equal(created.sourceImages[0]?.storage, 'inline_data_url');
});

test('rejects invalid Supabase canonical status rows', async () => {
  process.env.MEMORIES_SUPABASE_URL = 'https://demo-project.supabase.co';
  process.env.MEMORIES_SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';

  const mock = installSupabaseMock();

  const created = await createMemoryJobRecord({
    email: 'customer@example.com',
    storyPrompt: 'A memory.',
    sourceImages: [{ storage: 'remote_url', url: 'https://example.com/a.jpg' }],
  });

  const stored = mock.orders.get(created.jobId);
  assert.ok(stored);
  mock.orders.set(created.jobId, {
    ...stored,
    status: 'bogus_status',
  });

  await assert.rejects(
    getMemoryJobStatus(created.jobId, created.accessToken),
    (error: unknown) => {
      assert.ok(error instanceof HttpError);
      assert.equal(error.status, 502);
      assert.match(error.message, /valid job status/i);
      return true;
    },
  );
});
