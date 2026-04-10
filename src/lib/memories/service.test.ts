import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { HttpError } from '@/lib/memories/errors';
import { setStripeClientForTests } from '@/lib/memories/stripe';
import {
  applyMediaCommand,
  createCheckoutSession,
  createMemoryJobRecord,
  finalizeStripeCheckout,
  getMemoryJobStatus,
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
  process.env.MEMORIES_CLOUDINARY_UPLOAD_FOLDER = 'memories/source-images';
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

test('stages multipart uploads into hosted source image records', async () => {
  process.env.MEMORIES_CLOUDINARY_CLOUD_NAME = 'demo-cloud';
  process.env.MEMORIES_CLOUDINARY_API_KEY = 'api-key';
  process.env.MEMORIES_CLOUDINARY_API_SECRET = 'api-secret';
  process.env.MEMORIES_CLOUDINARY_UPLOAD_FOLDER = 'memories/test-folder';

  global.fetch = async (input, init) => {
    assert.equal(String(input), 'https://api.cloudinary.com/v1_1/demo-cloud/image/upload');
    assert.equal(init?.method, 'POST');

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

  const parsed = await parseCreateMemoryJobFormData(formData);

  assert.equal(parsed.sourceImages.length, 1);
  assert.equal(parsed.sourceImages[0]?.storage, 'remote_url');
  assert.equal(parsed.sourceImages[0]?.mimeType, 'image/png');
  assert.equal(
    parsed.sourceImages[0]?.url,
    'https://res.cloudinary.com/demo-cloud/image/upload/v1/source-image.png',
  );
  assert.equal(parsed.metadata?.occasion, 'birthday');
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

test('uses the Make-backed canonical store when configured', async () => {
  process.env.MEMORIES_MAKE_READ_WEBHOOK_URL = 'https://example.com/make/read';
  process.env.MEMORIES_MAKE_WRITE_WEBHOOK_URL = 'https://example.com/make/write';
  process.env.MEMORIES_MAKE_API_KEY = 'test-key';

  const rows = new Map<string, Record<string, unknown>>();

  global.fetch = async (input, init) => {
    const url = String(input);
    assert.equal(init?.method, 'POST');
    assert.equal(
      (init?.headers as Record<string, string>).authorization,
      'Bearer test-key',
    );

    const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
    const action = body.action;

    if (url === 'https://example.com/make/write' && action === 'create') {
      const row = JSON.parse(String(body.payload)) as Record<string, unknown>;
      assert.equal(body.jobId, row.jobId);
      assert.equal(body.status, row.status);
      rows.set(String(row.jobId), row);
      return new Response(JSON.stringify(row), {
        headers: { 'content-type': 'application/json' },
      });
    }

    if (url === 'https://example.com/make/read' && action === 'status') {
      const row = rows.get(String(body.jobId));
      return row
        ? new Response(JSON.stringify(row), {
            headers: { 'content-type': 'application/json' },
          })
        : new Response(null, {
            status: 404,
          });
    }

    if (url === 'https://example.com/make/write' && action === 'unlock') {
      const row = JSON.parse(String(body.payload)) as Record<string, unknown>;
      assert.equal(body.jobId, row.jobId);
      assert.equal(body.status, row.status);
      rows.set(String(row.jobId), row);
      return new Response(JSON.stringify(row), {
        headers: { 'content-type': 'application/json' },
      });
    }

    if (url === 'https://example.com/make/write' && action === 'update') {
      const row = JSON.parse(String(body.payload)) as Record<string, unknown>;
      assert.equal(body.jobId, row.jobId);
      assert.equal(body.status, row.status);
      rows.set(String(row.jobId), row);
      return new Response(JSON.stringify(row), {
        headers: { 'content-type': 'application/json' },
      });
    }

    throw new Error(`Unexpected Make request ${url} ${String(action)}.`);
  };

  const created = await createMemoryJobRecord({
    email: 'customer@example.com',
    customerName: 'Casey',
    storyPrompt: 'A warm birthday memory.',
    sourceImages: [{ storage: 'remote_url', url: 'https://example.com/a.jpg' }],
  });

  assert.equal(rows.size, 1);

  const status = await getMemoryJobStatus(created.jobId, created.accessToken);
  assert.equal(status.status, 'created');
  assert.equal(status.unlocked, false);

  const unlocked = await unlockMemoryJob(created.jobId, { paymentReference: 'pay_remote_123' });
  assert.equal(unlocked.status, 'queued');
  assert.equal(unlocked.unlocked, true);

  const preview = await applyMediaCommand(created.jobId, {
    command: 'mark_preview_ready',
    provider: 'make',
    asset: {
      provider: 'make',
      url: 'https://example.com/preview.jpg',
    },
  });
  assert.equal(preview.status, 'preview_ready');
  assert.equal(preview.previewAsset?.url, 'https://example.com/preview.jpg');

  const completed = await applyMediaCommand(created.jobId, {
    command: 'mark_completed',
    provider: 'make',
    asset: {
      provider: 'make',
      url: 'https://example.com/final.jpg',
    },
  });
  assert.equal(completed.status, 'completed');
  assert.equal(completed.finalAsset?.url, 'https://example.com/final.jpg');

  const delivered = await recordDelivery(created.jobId, {
    channel: 'email',
    provider: 'make',
    recipient: 'customer@example.com',
  });
  assert.equal(delivered.status, 'delivered');
  assert.equal(delivered.delivery?.recipient, 'customer@example.com');
});

test('serializes inline upload metadata into the Make-backed canonical row', async () => {
  process.env.MEMORIES_MAKE_READ_WEBHOOK_URL = 'https://example.com/make/read';
  process.env.MEMORIES_MAKE_WRITE_WEBHOOK_URL = 'https://example.com/make/write';
  process.env.MEMORIES_MAKE_API_KEY = 'test-key';

  let createdRow: Record<string, unknown> | null = null;

  global.fetch = async (_input, init) => {
    const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
    const action = body.action;

    if (action === 'create') {
      createdRow = JSON.parse(String(body.payload)) as Record<string, unknown>;
      return new Response(JSON.stringify(createdRow), {
        headers: { 'content-type': 'application/json' },
      });
    }

    if (action === 'status') {
      return new Response(JSON.stringify(createdRow), {
        headers: { 'content-type': 'application/json' },
      });
    }

    throw new Error(`Unexpected Make request ${String(action)}.`);
  };

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

  assert.ok(createdRow);
  const row = createdRow as Record<string, unknown>;
  assert.equal(row.sourceImage1DataUrl, 'data:image/png;base64,cG5n');
  assert.equal(row.sourceImage1MimeType, 'image/png');
  assert.equal(row.sourceImage1Filename, 'portrait.png');
  assert.equal(row.sourceImage1Sha256, 'abc123');
  assert.equal(created.sourceImages[0]?.storage, 'inline_data_url');
});

test('rejects invalid Make-backed canonical status rows', async () => {
  process.env.MEMORIES_MAKE_READ_WEBHOOK_URL = 'https://example.com/make/read';
  process.env.MEMORIES_MAKE_WRITE_WEBHOOK_URL = 'https://example.com/make/write';

  global.fetch = async (_input, init) => {
    const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
    const action = body.action;

    if (action === 'create') {
      const row = JSON.parse(String(body.payload)) as Record<string, unknown>;
      return new Response(
        JSON.stringify({
          ...row,
          status: 'bogus_status',
        }),
        {
          headers: { 'content-type': 'application/json' },
        },
      );
    }

    throw new Error(`Unexpected Make request ${String(action)}.`);
  };

  await assert.rejects(
    createMemoryJobRecord({
      email: 'customer@example.com',
      storyPrompt: 'A memory.',
      sourceImages: [{ storage: 'remote_url', url: 'https://example.com/a.jpg' }],
    }),
    (error: unknown) => {
      assert.ok(error instanceof HttpError);
      assert.equal(error.status, 502);
      assert.match(error.message, /valid job status/i);
      return true;
    },
  );
});

test('rejects empty Make canonical rows for write actions', async () => {
  process.env.MEMORIES_MAKE_READ_WEBHOOK_URL = 'https://example.com/make/read';
  process.env.MEMORIES_MAKE_WRITE_WEBHOOK_URL = 'https://example.com/make/write';

  global.fetch = async (_input, init) => {
    const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
    const action = body.action;

    if (action === 'create') {
      return new Response(null, { status: 204 });
    }

    throw new Error(`Unexpected Make request ${String(action)}.`);
  };

  await assert.rejects(
    createMemoryJobRecord({
      email: 'customer@example.com',
      storyPrompt: 'A memory.',
      sourceImages: [{ storage: 'remote_url', url: 'https://example.com/a.jpg' }],
    }),
    (error: unknown) => {
      assert.ok(error instanceof HttpError);
      assert.equal(error.status, 502);
      assert.match(error.message, /canonical row for create/i);
      return true;
    },
  );
});

test('rejects invalid Make-backed canonical timestamps', async () => {
  process.env.MEMORIES_MAKE_READ_WEBHOOK_URL = 'https://example.com/make/read';
  process.env.MEMORIES_MAKE_WRITE_WEBHOOK_URL = 'https://example.com/make/write';

  global.fetch = async (_input, init) => {
    const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
    const action = body.action;

    if (action === 'create') {
      const row = JSON.parse(String(body.payload)) as Record<string, unknown>;
      return new Response(
        JSON.stringify({
          ...row,
          updatedAt: 'not-a-timestamp',
        }),
        {
          headers: { 'content-type': 'application/json' },
        },
      );
    }

    throw new Error(`Unexpected Make request ${String(action)}.`);
  };

  await assert.rejects(
    createMemoryJobRecord({
      email: 'customer@example.com',
      storyPrompt: 'A memory.',
      sourceImages: [{ storage: 'remote_url', url: 'https://example.com/a.jpg' }],
    }),
    (error: unknown) => {
      assert.ok(error instanceof HttpError);
      assert.equal(error.status, 502);
      assert.match(error.message, /valid updatedAt/i);
      return true;
    },
  );
});

test('rejects invalid Make-backed source image mime types', async () => {
  process.env.MEMORIES_MAKE_READ_WEBHOOK_URL = 'https://example.com/make/read';
  process.env.MEMORIES_MAKE_WRITE_WEBHOOK_URL = 'https://example.com/make/write';

  global.fetch = async (_input, init) => {
    const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
    const action = body.action;

    if (action === 'create') {
      const row = JSON.parse(String(body.payload)) as Record<string, unknown>;
      return new Response(
        JSON.stringify({
          ...row,
          sourceImage1MimeType: 'image/gif',
        }),
        {
          headers: { 'content-type': 'application/json' },
        },
      );
    }

    throw new Error(`Unexpected Make request ${String(action)}.`);
  };

  await assert.rejects(
    createMemoryJobRecord({
      email: 'customer@example.com',
      storyPrompt: 'A memory.',
      sourceImages: [
        {
          storage: 'inline_data_url',
          dataUrl: 'data:image/png;base64,cG5n',
          mimeType: 'image/png',
          filename: 'portrait.png',
        },
      ],
    }),
    (error: unknown) => {
      assert.ok(error instanceof HttpError);
      assert.equal(error.status, 502);
      assert.match(error.message, /valid sourceImage1MimeType/i);
      return true;
    },
  );
});

test('rejects invalid Make-backed asset urls', async () => {
  process.env.MEMORIES_MAKE_READ_WEBHOOK_URL = 'https://example.com/make/read';
  process.env.MEMORIES_MAKE_WRITE_WEBHOOK_URL = 'https://example.com/make/write';

  global.fetch = async (_input, init) => {
    const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
    const action = body.action;

    if (action === 'create') {
      const row = JSON.parse(String(body.payload)) as Record<string, unknown>;
      return new Response(
        JSON.stringify({
          ...row,
          previewAsset: {
            provider: 'make',
            url: 'javascript:alert(1)',
          },
        }),
        {
          headers: { 'content-type': 'application/json' },
        },
      );
    }

    throw new Error(`Unexpected Make request ${String(action)}.`);
  };

  await assert.rejects(
    createMemoryJobRecord({
      email: 'customer@example.com',
      storyPrompt: 'A memory.',
      sourceImages: [{ storage: 'remote_url', url: 'https://example.com/a.jpg' }],
    }),
    (error: unknown) => {
      assert.ok(error instanceof HttpError);
      assert.equal(error.status, 502);
      assert.match(error.message, /valid asset\.url/i);
      return true;
    },
  );
});

test('rejects invalid Make-backed delivery timestamps', async () => {
  process.env.MEMORIES_MAKE_READ_WEBHOOK_URL = 'https://example.com/make/read';
  process.env.MEMORIES_MAKE_WRITE_WEBHOOK_URL = 'https://example.com/make/write';

  global.fetch = async (_input, init) => {
    const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
    const action = body.action;

    if (action === 'create') {
      const row = JSON.parse(String(body.payload)) as Record<string, unknown>;
      return new Response(
        JSON.stringify({
          ...row,
          delivery: {
            channel: 'email',
            provider: 'make',
            recipient: 'customer@example.com',
            deliveredAt: 'not-a-timestamp',
          },
        }),
        {
          headers: { 'content-type': 'application/json' },
        },
      );
    }

    throw new Error(`Unexpected Make request ${String(action)}.`);
  };

  await assert.rejects(
    createMemoryJobRecord({
      email: 'customer@example.com',
      storyPrompt: 'A memory.',
      sourceImages: [{ storage: 'remote_url', url: 'https://example.com/a.jpg' }],
    }),
    (error: unknown) => {
      assert.ok(error instanceof HttpError);
      assert.equal(error.status, 502);
      assert.match(error.message, /valid delivery\.deliveredAt/i);
      return true;
    },
  );
});
