import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  supabaseValidationSelections,
  validateSupabaseRestAccess,
} from '@/lib/memories/supabase-validation';

beforeEach(() => {
  delete process.env.MEMORIES_SUPABASE_URL;
  delete process.env.MEMORIES_SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.MEMORIES_SUPABASE_TIMEOUT_MS;
});

test('supabase validation requires configured canonical store env vars', async () => {
  await assert.rejects(validateSupabaseRestAccess(async () => new Response('[]') as never), (error: unknown) => {
    assert.ok(error instanceof Error);
    assert.match(error.message, /MEMORIES_SUPABASE_URL/i);
    return true;
  });
});

test('supabase validation probes the expected canonical tables and columns', async () => {
  process.env.MEMORIES_SUPABASE_URL = 'https://demo-project.supabase.co';
  process.env.MEMORIES_SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
  process.env.MEMORIES_SUPABASE_TIMEOUT_MS = '1234';

  const requestedUrls: string[] = [];
  const summary = await validateSupabaseRestAccess(async (input, init) => {
    requestedUrls.push(String(input));
    assert.equal(init?.method, 'GET');
    assert.equal(
      (init?.headers as Record<string, string>).authorization,
      'Bearer service-role-key',
    );

    return new Response('[]', {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  });

  assert.equal(summary.ok, true);
  assert.deepEqual(summary.checkedTables, Object.keys(supabaseValidationSelections));
  assert.equal(requestedUrls.length, Object.keys(supabaseValidationSelections).length);
  assert.ok(
    requestedUrls.some((url) =>
      url.includes('/orders?select=id%2Cclient_request_id%2Cstatus%2Cupdated_at&limit=1'),
    ),
  );
  assert.ok(
    requestedUrls.some((url) =>
      url.includes('/generation_jobs?select=order_id%2Cstatus%2Cupdated_at&limit=1'),
    ),
  );
  assert.ok(
    requestedUrls.some((url) =>
      url.includes('/generated_assets?select=order_id%2Ckind%2Curl&limit=1'),
    ),
  );
  assert.ok(
    requestedUrls.some((url) =>
      url.includes('/event_log?select=id%2Corder_id%2Cstatus%2Ccreated_at&limit=1'),
    ),
  );
});
