import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { POST as createRoute } from '@/app/api/memories/create/route';
import { POST as checkoutRoute } from '@/app/api/memories/[jobId]/checkout/route';
import { POST as deliveryRoute } from '@/app/api/memories/[jobId]/delivery/route';
import { GET as legacyStateRoute } from '@/app/api/memories/[jobId]/legacy-state/route';
import { POST as mediaRoute } from '@/app/api/memories/[jobId]/media/route';
import { GET as operatorStatusRoute } from '@/app/api/memories/[jobId]/operator-status/route';
import { POST as unlockRoute } from '@/app/api/memories/[jobId]/unlock/route';
import { POST as makeJobUpdateRoute } from '@/app/api/integrations/make/job-update/route';
import { POST as stripeWebhookRoute } from '@/app/api/integrations/stripe/webhook/route';
import type { ErrorResponse } from '@/lib/memories/contracts';
import { createMemoryJobRecord, getMemoryJobStatus } from '@/lib/memories/service';
import { setStripeClientForTests } from '@/lib/memories/stripe';

let tempRoot = '';
const originalFetch = global.fetch;

beforeEach(async () => {
  if (tempRoot) {
    await rm(tempRoot, { recursive: true, force: true });
  }

  tempRoot = await mkdtemp(path.join(os.tmpdir(), 'memories-routes-'));
  process.env.MEMORIES_ALLOW_LOCAL_FILE_STORE = '1';
  process.env.MEMORIES_DATA_FILE = path.join(tempRoot, 'jobs.json');
  process.env.MEMORIES_APP_URL = 'http://localhost:3000';
  process.env.MEMORIES_INTERNAL_API_SECRET = 'internal-secret';
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

test('create route falls back to the request origin when MEMORIES_APP_URL is unset', async () => {
  process.env.MEMORIES_APP_URL = '';

  const response = await createRoute(
    new Request('http://127.0.0.1:3001/api/memories/create', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        email: 'customer@example.com',
        storyPrompt: 'A memory.',
        sourceImages: [{ storage: 'remote_url', url: 'https://example.com/a.jpg' }],
      }),
    }),
  );

  assert.equal(response.status, 201);
  const body = (await response.json()) as {
    jobId: string;
    accessToken: string;
    status: string;
    statusUrl: string;
    sourceImages: Array<{ storage: string }>;
  };
  assert.equal(
    body.statusUrl,
    `http://127.0.0.1:3001/api/memories/${body.jobId}/status?accessToken=${body.accessToken}`,
  );
  assert.equal(body.sourceImages[0]?.storage, 'remote_url');
});

test('create route reuses an existing job for the same JSON clientRequestId', async () => {
  const firstResponse = await createRoute(
    new Request('http://localhost/api/memories/create', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        email: 'customer@example.com',
        clientRequestId: 'json-client-request-123',
        storyPrompt: 'A memory.',
        sourceImages: [{ storage: 'remote_url', url: 'https://example.com/a.jpg' }],
      }),
    }),
  );

  const duplicateResponse = await createRoute(
    new Request('http://localhost/api/memories/create', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        email: 'customer@example.com',
        clientRequestId: 'json-client-request-123',
        storyPrompt: 'A duplicate submit.',
        sourceImages: [{ storage: 'remote_url', url: 'https://example.com/b.jpg' }],
      }),
    }),
  );

  assert.equal(firstResponse.status, 201);
  assert.equal(duplicateResponse.status, 201);
  const firstBody = (await firstResponse.json()) as { jobId: string; accessToken: string };
  const duplicateBody = (await duplicateResponse.json()) as { jobId: string; accessToken: string };
  assert.equal(duplicateBody.jobId, firstBody.jobId);
  assert.equal(duplicateBody.accessToken, firstBody.accessToken);
});

test('create route accepts multipart image uploads', async () => {
  process.env.MEMORIES_CLOUDINARY_CLOUD_NAME = 'demo-cloud';
  process.env.MEMORIES_CLOUDINARY_API_KEY = 'api-key';
  process.env.MEMORIES_CLOUDINARY_API_SECRET = 'api-secret';

  global.fetch = async (_input, init) => {
    assert.ok(init?.body instanceof FormData);
    const folder = init.body.get('folder');
    assert.ok(typeof folder === 'string');
    assert.match(folder, /^Memories\/[0-9a-f-]+$/);

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
  formData.set('storyPrompt', 'A memory.');
  formData.set('occasion', 'birthday');
  formData.set('image1', new File([Buffer.from('png-data')], 'portrait.png', { type: 'image/png' }));

  const response = await createRoute(
    new Request('http://localhost/api/memories/create', {
      method: 'POST',
      body: formData,
    }),
  );

  assert.equal(response.status, 201);
  const body = (await response.json()) as {
    sourceImages: Array<{ storage: string; mimeType?: string; url?: string }>;
  };
  assert.equal(body.sourceImages.length, 1);
  assert.equal(body.sourceImages[0]?.storage, 'remote_url');
  assert.equal(body.sourceImages[0]?.mimeType, 'image/png');
  assert.equal(
    body.sourceImages[0]?.url,
    'https://res.cloudinary.com/demo-cloud/image/upload/v1/source-image.png',
  );
});

test('create route reuses an existing job for the same clientRequestId without restaging multipart uploads', async () => {
  process.env.MEMORIES_CLOUDINARY_CLOUD_NAME = 'demo-cloud';
  process.env.MEMORIES_CLOUDINARY_API_KEY = 'api-key';
  process.env.MEMORIES_CLOUDINARY_API_SECRET = 'api-secret';

  let uploadCalls = 0;
  global.fetch = async () => {
    uploadCalls += 1;
    return new Response(
      JSON.stringify({
        secure_url: 'https://res.cloudinary.com/demo-cloud/image/upload/v1/source-image.png',
      }),
      {
        headers: { 'content-type': 'application/json' },
      },
    );
  };

  const firstFormData = new FormData();
  firstFormData.set('email', 'customer@example.com');
  firstFormData.set('clientRequestId', 'client-request-789');
  firstFormData.set('storyPrompt', 'A memory.');
  firstFormData.set('image1', new File([Buffer.from('png-data')], 'portrait.png', { type: 'image/png' }));

  const firstResponse = await createRoute(
    new Request('http://localhost/api/memories/create', {
      method: 'POST',
      body: firstFormData,
    }),
  );

  const firstBody = (await firstResponse.json()) as { jobId: string; accessToken: string };

  const duplicateFormData = new FormData();
  duplicateFormData.set('email', 'customer@example.com');
  duplicateFormData.set('clientRequestId', 'client-request-789');
  duplicateFormData.set('storyPrompt', 'A duplicate submit.');
  duplicateFormData.set('image1', new File([Buffer.from('new-png-data')], 'portrait.png', { type: 'image/png' }));

  const duplicateResponse = await createRoute(
    new Request('http://localhost/api/memories/create', {
      method: 'POST',
      body: duplicateFormData,
    }),
  );

  assert.equal(firstResponse.status, 201);
  assert.equal(duplicateResponse.status, 201);
  const duplicateBody = (await duplicateResponse.json()) as { jobId: string; accessToken: string };
  assert.equal(duplicateBody.jobId, firstBody.jobId);
  assert.equal(duplicateBody.accessToken, firstBody.accessToken);
  assert.equal(uploadCalls, 1);
});

test('create route honors metadata.clientRequestId for multipart idempotency without restaging uploads', async () => {
  process.env.MEMORIES_CLOUDINARY_CLOUD_NAME = 'demo-cloud';
  process.env.MEMORIES_CLOUDINARY_API_KEY = 'api-key';
  process.env.MEMORIES_CLOUDINARY_API_SECRET = 'api-secret';

  let uploadCalls = 0;
  global.fetch = async () => {
    uploadCalls += 1;
    return new Response(
      JSON.stringify({
        secure_url: 'https://res.cloudinary.com/demo-cloud/image/upload/v1/source-image.png',
      }),
      {
        headers: { 'content-type': 'application/json' },
      },
    );
  };

  const firstFormData = new FormData();
  firstFormData.set('email', 'customer@example.com');
  firstFormData.set('storyPrompt', 'A memory.');
  firstFormData.set('metadata', JSON.stringify({ clientRequestId: 'metadata-client-request-123' }));
  firstFormData.set('image1', new File([Buffer.from('png-data')], 'portrait.png', { type: 'image/png' }));

  const firstResponse = await createRoute(
    new Request('http://localhost/api/memories/create', {
      method: 'POST',
      body: firstFormData,
    }),
  );

  const duplicateFormData = new FormData();
  duplicateFormData.set('email', 'customer@example.com');
  duplicateFormData.set('storyPrompt', 'A duplicate submit.');
  duplicateFormData.set('metadata', JSON.stringify({ clientRequestId: 'metadata-client-request-123' }));
  duplicateFormData.set('image1', new File([Buffer.from('new-png-data')], 'portrait.png', { type: 'image/png' }));

  const duplicateResponse = await createRoute(
    new Request('http://localhost/api/memories/create', {
      method: 'POST',
      body: duplicateFormData,
    }),
  );

  assert.equal(firstResponse.status, 201);
  assert.equal(duplicateResponse.status, 201);
  const firstBody = (await firstResponse.json()) as { jobId: string; accessToken: string };
  const duplicateBody = (await duplicateResponse.json()) as { jobId: string; accessToken: string };
  assert.equal(duplicateBody.jobId, firstBody.jobId);
  assert.equal(duplicateBody.accessToken, firstBody.accessToken);
  assert.equal(uploadCalls, 1);
});

test('create route rejects unsupported multipart image uploads', async () => {
  const formData = new FormData();
  formData.set('email', 'customer@example.com');
  formData.set('storyPrompt', 'A memory.');
  formData.set('image1', new File([Buffer.from('gif-data')], 'portrait.gif', { type: 'image/gif' }));

  const response = await createRoute(
    new Request('http://localhost/api/memories/create', {
      method: 'POST',
      body: formData,
    }),
  );

  assert.equal(response.status, 400);
  assert.deepEqual((await response.json()) as ErrorResponse, {
    error: 'image1 must be a PNG or JPG image.',
  });
});

test('create route returns a machine-readable upload-unavailable error', async () => {
  const formData = new FormData();
  formData.set('email', 'customer@example.com');
  formData.set('storyPrompt', 'A memory.');
  formData.set('image1', new File([Buffer.from('png-data')], 'portrait.png', { type: 'image/png' }));

  const response = await createRoute(
    new Request('http://localhost/api/memories/create', {
      method: 'POST',
      body: formData,
    }),
  );

  assert.equal(response.status, 503);
  assert.deepEqual((await response.json()) as ErrorResponse, {
    error: 'Direct image upload is unavailable in this environment.',
    code: 'UPLOAD_UNAVAILABLE',
  });
});

test('rejects public unlock attempts that only present the customer access token', async () => {
  const created = await createMemoryJobRecord({
    email: 'customer@example.com',
    storyPrompt: 'A memory.',
    sourceImages: [{ storage: 'remote_url', url: 'https://example.com/a.jpg' }],
  });

  const response = await unlockRoute(
    new Request(`http://localhost/api/memories/${created.jobId}/unlock`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-memories-access-token': created.accessToken,
      },
      body: JSON.stringify({
        paymentReference: 'pay_123',
      }),
    }),
    { params: Promise.resolve({ jobId: created.jobId }) },
  );

  assert.equal(response.status, 401);
  assert.deepEqual((await response.json()) as ErrorResponse, {
    error: 'Internal authorization is required for payment confirmation.',
  });

  const status = await getMemoryJobStatus(created.jobId, created.accessToken);
  assert.equal(status.status, 'created');
  assert.equal(status.unlocked, false);
});

test('checkout route exposes a machine-readable payment-unavailable error', async () => {
  const created = await createMemoryJobRecord({
    email: 'customer@example.com',
    storyPrompt: 'A memory.',
    sourceImages: [{ storage: 'remote_url', url: 'https://example.com/a.jpg' }],
  });

  const response = await checkoutRoute(
    new Request(`http://localhost/api/memories/${created.jobId}/checkout`, {
      method: 'POST',
      headers: {
        'x-memories-access-token': created.accessToken,
      },
    }),
    { params: Promise.resolve({ jobId: created.jobId }) },
  );

  assert.equal(response.status, 503);
  assert.deepEqual((await response.json()) as ErrorResponse, {
    error: 'Payment checkout is unavailable in this environment.',
    code: 'PAYMENT_UNAVAILABLE',
  });
});

test('stripe webhook route finalizes checkout.session.completed events', async () => {
  process.env.STRIPE_SECRET_KEY = 'sk_test_123';
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_123';

  const created = await createMemoryJobRecord({
    email: 'customer@example.com',
    storyPrompt: 'A memory.',
    sourceImages: [{ storage: 'remote_url', url: 'https://example.com/a.jpg' }],
  });

  setStripeClientForTests({
    webhooks: {
      constructEvent: (
        payload: string,
        signature: string,
        secret: string,
      ) => {
        assert.equal(payload, '{"type":"checkout.session.completed"}');
        assert.equal(signature, 'sig_test_123');
        assert.equal(secret, 'whsec_test_123');

        return {
          type: 'checkout.session.completed',
          data: {
            object: {
              id: 'cs_test_123',
              payment_status: 'paid',
              payment_intent: 'pi_test_123',
              metadata: {
                jobId: created.jobId,
              },
            },
          },
        };
      },
    },
  } as never);

  const response = await stripeWebhookRoute(
    new Request('http://localhost/api/integrations/stripe/webhook', {
      method: 'POST',
      headers: {
        'stripe-signature': 'sig_test_123',
      },
      body: '{"type":"checkout.session.completed"}',
    }),
  );

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { received: true });

  const status = await getMemoryJobStatus(created.jobId, created.accessToken);
  assert.equal(status.status, 'unlocked');
  assert.equal(status.unlocked, true);
});

test('stripe webhook route falls back to client_reference_id when metadata.jobId is absent', async () => {
  process.env.STRIPE_SECRET_KEY = 'sk_test_123';
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_123';

  const created = await createMemoryJobRecord({
    email: 'customer@example.com',
    storyPrompt: 'A memory.',
    sourceImages: [{ storage: 'remote_url', url: 'https://example.com/a.jpg' }],
  });

  setStripeClientForTests({
    webhooks: {
      constructEvent: (
        payload: string,
        signature: string,
        secret: string,
      ) => {
        assert.equal(payload, '{"type":"checkout.session.completed"}');
        assert.equal(signature, 'sig_test_456');
        assert.equal(secret, 'whsec_test_123');

        return {
          type: 'checkout.session.completed',
          data: {
            object: {
              id: 'cs_test_456',
              client_reference_id: created.jobId,
              payment_status: 'paid',
              payment_intent: 'pi_test_456',
              metadata: {},
            },
          },
        };
      },
    },
  } as never);

  const response = await stripeWebhookRoute(
    new Request('http://localhost/api/integrations/stripe/webhook', {
      method: 'POST',
      headers: {
        'stripe-signature': 'sig_test_456',
      },
      body: '{"type":"checkout.session.completed"}',
    }),
  );

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { received: true });

  const status = await getMemoryJobStatus(created.jobId, created.accessToken);
  assert.equal(status.status, 'unlocked');
  assert.equal(status.unlocked, true);
});

test('stripe webhook route requires stripe-signature', async () => {
  const response = await stripeWebhookRoute(
    new Request('http://localhost/api/integrations/stripe/webhook', {
      method: 'POST',
      body: '{}',
    }),
  );

  assert.equal(response.status, 400);
  assert.deepEqual((await response.json()) as ErrorResponse, {
    error: 'stripe-signature header is required.',
  });
});

test('make job-update route applies trusted lifecycle updates', async () => {
  const created = await createMemoryJobRecord({
    email: 'customer@example.com',
    storyPrompt: 'A memory.',
    sourceImages: [{ storage: 'remote_url', url: 'https://example.com/a.jpg' }],
  });

  await unlockRoute(
    new Request(`http://localhost/api/memories/${created.jobId}/unlock`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer internal-secret',
      },
      body: JSON.stringify({
        paymentReference: 'pay_123',
        provider: 'manual',
      }),
    }),
    { params: Promise.resolve({ jobId: created.jobId }) },
  );

  const queueResponse = await makeJobUpdateRoute(
    new Request('http://localhost/api/integrations/make/job-update', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer internal-secret',
      },
      body: JSON.stringify({
        event: 'queued',
        jobId: created.jobId,
      }),
    }),
  );

  assert.equal(queueResponse.status, 200);

  const response = await makeJobUpdateRoute(
    new Request('http://localhost/api/integrations/make/job-update', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer internal-secret',
      },
      body: JSON.stringify({
        event: 'completed',
        jobId: created.jobId,
        asset: {
          url: 'https://example.com/final.jpg',
          provider: 'make',
        },
      }),
    }),
  );

  assert.equal(response.status, 200);
  const body = (await response.json()) as {
    status: string;
    finalAsset?: { url: string };
  };
  assert.equal(body.status, 'completed');
  assert.equal(body.finalAsset?.url, 'https://example.com/final.jpg');
});

test('make job-update route rejects unauthenticated requests', async () => {
  const response = await makeJobUpdateRoute(
    new Request('http://localhost/api/integrations/make/job-update', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        event: 'processing',
        jobId: 'job_123',
      }),
    }),
  );

  assert.equal(response.status, 401);
  assert.deepEqual((await response.json()) as ErrorResponse, {
    error: 'Internal authorization failed.',
  });
});

test('media route applies trusted asset completion updates', async () => {
  const created = await createMemoryJobRecord({
    email: 'customer@example.com',
    storyPrompt: 'A memory.',
    sourceImages: [{ storage: 'remote_url', url: 'https://example.com/a.jpg' }],
  });

  await unlockRoute(
    new Request(`http://localhost/api/memories/${created.jobId}/unlock`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer internal-secret',
      },
      body: JSON.stringify({
        paymentReference: 'pay_123',
      }),
    }),
    { params: Promise.resolve({ jobId: created.jobId }) },
  );

  await mediaRoute(
    new Request(`http://localhost/api/memories/${created.jobId}/media`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer internal-secret',
      },
      body: JSON.stringify({
        command: 'request_generation',
        provider: 'manual',
      }),
    }),
    { params: Promise.resolve({ jobId: created.jobId }) },
  );

  await mediaRoute(
    new Request(`http://localhost/api/memories/${created.jobId}/media`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer internal-secret',
      },
      body: JSON.stringify({
        command: 'mark_processing',
        provider: 'manual',
      }),
    }),
    { params: Promise.resolve({ jobId: created.jobId }) },
  );

  await mediaRoute(
    new Request(`http://localhost/api/memories/${created.jobId}/media`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer internal-secret',
      },
      body: JSON.stringify({
        command: 'request_generation',
        provider: 'manual',
      }),
    }),
    { params: Promise.resolve({ jobId: created.jobId }) },
  );

  await mediaRoute(
    new Request(`http://localhost/api/memories/${created.jobId}/media`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer internal-secret',
      },
      body: JSON.stringify({
        command: 'mark_processing',
        provider: 'manual',
      }),
    }),
    { params: Promise.resolve({ jobId: created.jobId }) },
  );

  await mediaRoute(
    new Request(`http://localhost/api/memories/${created.jobId}/media`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer internal-secret',
      },
      body: JSON.stringify({
        command: 'request_generation',
        provider: 'manual',
      }),
    }),
    { params: Promise.resolve({ jobId: created.jobId }) },
  );

  await mediaRoute(
    new Request(`http://localhost/api/memories/${created.jobId}/media`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer internal-secret',
      },
      body: JSON.stringify({
        command: 'mark_processing',
        provider: 'manual',
      }),
    }),
    { params: Promise.resolve({ jobId: created.jobId }) },
  );

  await mediaRoute(
    new Request(`http://localhost/api/memories/${created.jobId}/media`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer internal-secret',
      },
      body: JSON.stringify({
        command: 'request_generation',
        provider: 'manual',
      }),
    }),
    { params: Promise.resolve({ jobId: created.jobId }) },
  );

  await mediaRoute(
    new Request(`http://localhost/api/memories/${created.jobId}/media`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer internal-secret',
      },
      body: JSON.stringify({
        command: 'mark_processing',
        provider: 'manual',
      }),
    }),
    { params: Promise.resolve({ jobId: created.jobId }) },
  );

  const response = await mediaRoute(
    new Request(`http://localhost/api/memories/${created.jobId}/media`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer internal-secret',
      },
      body: JSON.stringify({
        command: 'mark_completed',
        provider: 'manual',
        asset: {
          url: 'https://example.com/final.jpg',
        },
      }),
    }),
    { params: Promise.resolve({ jobId: created.jobId }) },
  );

  assert.equal(response.status, 200);
  const body = (await response.json()) as {
    status: string;
    finalAsset?: { url: string };
  };
  assert.equal(body.status, 'completed');
  assert.equal(body.finalAsset?.url, 'https://example.com/final.jpg');
});

test('operator-status route exposes the internal order contract for one job', async () => {
  const created = await createMemoryJobRecord({
    email: 'customer@example.com',
    storyPrompt: 'A memory.',
    sourceImages: [{ storage: 'remote_url', url: 'https://example.com/a.jpg' }],
  });

  await unlockRoute(
    new Request(`http://localhost/api/memories/${created.jobId}/unlock`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer internal-secret',
      },
      body: JSON.stringify({
        paymentReference: 'pi_123',
        provider: 'stripe',
      }),
    }),
    { params: Promise.resolve({ jobId: created.jobId }) },
  );

  const response = await operatorStatusRoute(
    new Request(`http://localhost/api/memories/${created.jobId}/operator-status`, {
      method: 'GET',
      headers: {
        authorization: 'Bearer internal-secret',
      },
    }),
    { params: Promise.resolve({ jobId: created.jobId }) },
  );

  assert.equal(response.status, 200);
  const body = (await response.json()) as {
    summary: { orderId: string; customerEmail: string; orderState: string };
    payment: { status: string; provider?: string; reference?: string };
    generation: { status: string };
    history: { mode: string; timestamps: { createdAt: string; updatedAt: string } };
  };
  assert.equal(body.summary.orderId, created.jobId);
  assert.equal(body.summary.customerEmail, 'customer@example.com');
  assert.equal(body.summary.orderState, 'paid');
  assert.equal(body.payment.status, 'paid');
  assert.equal(body.payment.provider, 'stripe');
  assert.equal(body.payment.reference, 'pi_123');
  assert.equal(body.generation.status, 'unlocked');
  assert.equal(body.history.mode, 'current_state_only');
  assert.ok(body.history.timestamps.createdAt);
  assert.ok(body.history.timestamps.updatedAt);
});

test('legacy-state route exposes the canonical job payload for Make compatibility', async () => {
  const created = await createMemoryJobRecord({
    email: 'customer@example.com',
    customerName: 'Max',
    storyPrompt: 'A joyful birthday memory.',
    sourceImages: [{ storage: 'remote_url', url: 'https://example.com/original.jpg' }],
  });

  await unlockRoute(
    new Request(`http://localhost/api/memories/${created.jobId}/unlock`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer internal-secret',
      },
      body: JSON.stringify({
        paymentReference: 'pi_123',
        provider: 'stripe',
      }),
    }),
    { params: Promise.resolve({ jobId: created.jobId }) },
  );

  await mediaRoute(
    new Request(`http://localhost/api/memories/${created.jobId}/media`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer internal-secret',
      },
      body: JSON.stringify({
        command: 'request_generation',
        provider: 'manual',
      }),
    }),
    { params: Promise.resolve({ jobId: created.jobId }) },
  );

  await mediaRoute(
    new Request(`http://localhost/api/memories/${created.jobId}/media`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer internal-secret',
      },
      body: JSON.stringify({
        command: 'mark_processing',
        provider: 'manual',
      }),
    }),
    { params: Promise.resolve({ jobId: created.jobId }) },
  );

  await mediaRoute(
    new Request(`http://localhost/api/memories/${created.jobId}/media`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer internal-secret',
      },
      body: JSON.stringify({
        command: 'mark_completed',
        provider: 'cloudinary',
        asset: {
          url: 'https://cdn.example.com/final.png',
          publicId: 'Memories/final',
          format: 'png',
          width: 1200,
          height: 1200,
        },
      }),
    }),
    { params: Promise.resolve({ jobId: created.jobId }) },
  );

  const response = await legacyStateRoute(
    new Request(`http://localhost/api/memories/${created.jobId}/legacy-state`, {
      method: 'GET',
      headers: {
        authorization: 'Bearer internal-secret',
      },
    }),
    { params: Promise.resolve({ jobId: created.jobId }) },
  );

  assert.equal(response.status, 200);
  const body = (await response.json()) as {
    jobId: string;
    deliveryEmail: string;
    finalAssetUrl?: string;
    accessToken: string;
    sourceImage1Url?: string;
    sourceImage2Url?: string;
    unlocked: boolean;
    customerName?: string;
  };
  assert.equal(body.jobId, created.jobId);
  assert.equal(body.deliveryEmail, 'customer@example.com');
  assert.equal(body.finalAssetUrl, 'https://cdn.example.com/final.png');
  assert.equal(typeof body.accessToken, 'string');
  assert.equal(body.sourceImage1Url, 'https://example.com/original.jpg');
  assert.equal(body.sourceImage2Url, 'https://example.com/original.jpg');
  assert.equal(body.unlocked, true);
  assert.equal(body.customerName, 'Max');
});

test('delivery route records trusted delivery updates', async () => {
  const created = await createMemoryJobRecord({
    email: 'customer@example.com',
    storyPrompt: 'A memory.',
    sourceImages: [{ storage: 'remote_url', url: 'https://example.com/a.jpg' }],
  });

  await unlockRoute(
    new Request(`http://localhost/api/memories/${created.jobId}/unlock`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer internal-secret',
      },
      body: JSON.stringify({
        paymentReference: 'pay_123',
      }),
    }),
    { params: Promise.resolve({ jobId: created.jobId }) },
  );

  await mediaRoute(
    new Request(`http://localhost/api/memories/${created.jobId}/media`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer internal-secret',
      },
      body: JSON.stringify({
        command: 'request_generation',
        provider: 'manual',
      }),
    }),
    { params: Promise.resolve({ jobId: created.jobId }) },
  );

  await mediaRoute(
    new Request(`http://localhost/api/memories/${created.jobId}/media`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer internal-secret',
      },
      body: JSON.stringify({
        command: 'mark_processing',
        provider: 'manual',
      }),
    }),
    { params: Promise.resolve({ jobId: created.jobId }) },
  );

  await mediaRoute(
    new Request(`http://localhost/api/memories/${created.jobId}/media`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer internal-secret',
      },
      body: JSON.stringify({
        command: 'mark_completed',
        provider: 'manual',
        asset: {
          url: 'https://example.com/final.jpg',
        },
      }),
    }),
    { params: Promise.resolve({ jobId: created.jobId }) },
  );

  const response = await deliveryRoute(
    new Request(`http://localhost/api/memories/${created.jobId}/delivery`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer internal-secret',
      },
      body: JSON.stringify({
        channel: 'email',
        provider: 'manual',
        recipient: 'customer@example.com',
      }),
    }),
    { params: Promise.resolve({ jobId: created.jobId }) },
  );

  assert.equal(response.status, 200);
  const body = (await response.json()) as {
    status: string;
    delivery?: { recipient: string };
  };
  assert.equal(body.status, 'delivered');
  assert.equal(body.delivery?.recipient, 'customer@example.com');
});

test('media route rejects unauthenticated requests', async () => {
  const response = await mediaRoute(
    new Request('http://localhost/api/memories/job_123/media', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        command: 'mark_processing',
        provider: 'manual',
      }),
    }),
    { params: Promise.resolve({ jobId: 'job_123' }) },
  );

  assert.equal(response.status, 401);
  assert.deepEqual((await response.json()) as ErrorResponse, {
    error: 'Internal authorization failed.',
  });
});

test('delivery route rejects unauthenticated requests', async () => {
  const response = await deliveryRoute(
    new Request('http://localhost/api/memories/job_123/delivery', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        channel: 'email',
        provider: 'manual',
        recipient: 'customer@example.com',
      }),
    }),
    { params: Promise.resolve({ jobId: 'job_123' }) },
  );

  assert.equal(response.status, 401);
  assert.deepEqual((await response.json()) as ErrorResponse, {
    error: 'Internal authorization failed.',
  });
});

test('operator-status route rejects unauthenticated requests', async () => {
  const response = await operatorStatusRoute(
    new Request('http://localhost/api/memories/job_123/operator-status', {
      method: 'GET',
    }),
    { params: Promise.resolve({ jobId: 'job_123' }) },
  );

  assert.equal(response.status, 401);
  assert.deepEqual((await response.json()) as ErrorResponse, {
    error: 'Internal authorization failed.',
  });
});

test('legacy-state route rejects unauthenticated requests', async () => {
  const response = await legacyStateRoute(
    new Request('http://localhost/api/memories/job_123/legacy-state', {
      method: 'GET',
    }),
    { params: Promise.resolve({ jobId: 'job_123' }) },
  );

  assert.equal(response.status, 401);
  assert.deepEqual((await response.json()) as ErrorResponse, {
    error: 'Internal authorization failed.',
  });
});
