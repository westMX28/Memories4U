import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { buildCheckoutBlueprint } from '@/lib/memories/make-scenario-migration';

test('buildCheckoutBlueprint appends canonical delivery callback after email send', async () => {
  const raw = await readFile(
    'tmp/make-backups/wes-338-1776208758686/scenario-4080869-checkout.json',
    'utf8',
  );
  const snapshot = JSON.parse(raw) as {
    blueprint: Record<string, unknown> & {
      flow: Array<Record<string, unknown>>;
    };
  };

  const rewritten = buildCheckoutBlueprint(
    snapshot.blueprint,
    'https://memories4-u.vercel.app',
    'internal-secret',
  ) as {
    flow: Array<Record<string, unknown>>;
  };

  assert.deepEqual(
    rewritten.flow.map((module) => module.id),
    [3, 8, 12, 10, 14],
  );

  const deliveryModule = rewritten.flow[4] as {
    module: string;
    mapper: {
      method: string;
      url: string;
      data: string;
      headers: Array<{ name: string; value: string }>;
    };
  };

  assert.equal(deliveryModule.module, 'http:ActionSendData');
  assert.equal(deliveryModule.mapper.method, 'post');
  assert.equal(
    deliveryModule.mapper.url,
    'https://memories4-u.vercel.app/api/memories/{{ifempty(12.jobId; ifempty(3.object.metadata.jobId; 3.object.client_reference_id))}}/delivery',
  );
  assert.match(deliveryModule.mapper.data, /"channel": "email"/);
  assert.match(deliveryModule.mapper.data, /"provider": "make"/);
  assert.match(deliveryModule.mapper.data, /deliveryEmail/);
  assert.deepEqual(deliveryModule.mapper.headers, [
    { name: 'Authorization', value: 'Bearer internal-secret' },
    { name: 'Content-Type', value: 'application/json' },
  ]);
});
