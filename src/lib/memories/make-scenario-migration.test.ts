import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import {
  buildCheckoutBlueprint,
  buildMemoriesBirthdayIdentityBlueprint,
  buildPreviewLoopBlueprint,
} from '@/lib/memories/make-scenario-migration';

test('buildCheckoutBlueprint rewrites Checkout to email status access without claiming delivery on payment', async () => {
  const [checkoutRaw, memoriesRaw] = await Promise.all([
    readFile('tmp/make-backups/wes-338-1776208758686/scenario-4080869-checkout.json', 'utf8'),
    readFile('tmp/make-backups/wes-338-1776292701236/scenario-4076359-memories.json', 'utf8'),
  ]);
  const checkoutSnapshot = JSON.parse(checkoutRaw) as {
    blueprint: Record<string, unknown> & {
      flow: Array<Record<string, unknown>>;
    };
  };
  const memoriesSnapshot = JSON.parse(memoriesRaw) as {
    blueprint: Record<string, unknown> & {
      flow: Array<Record<string, unknown>>;
    };
  };

  const rewritten = buildCheckoutBlueprint(
    checkoutSnapshot.blueprint,
    'https://memories4-u.vercel.app',
    memoriesSnapshot.blueprint,
  ) as {
    flow: Array<Record<string, unknown>>;
  };

  assert.deepEqual(
    rewritten.flow.map((module) => module.id),
    [3, 8, 9, 10],
  );

  const lookupModule = rewritten.flow[1] as {
    module: string;
    mapper: {
      method: string;
      url: string;
      headers: Array<{ name: string; value: string }>;
    };
    parameters: {
      __IMTCONN__: number;
    };
  };
  assert.equal(lookupModule.module, 'supabase:makeAnApiCall');
  assert.equal(lookupModule.mapper.method, 'get');
  assert.equal(
    lookupModule.mapper.url,
    '/rest/v1/orders?or=(id.eq.{{ifempty(3.object.metadata.jobId; 3.object.client_reference_id)}},payment_reference.eq.{{ifempty(3.object.payment_intent; 3.object.id)}})&select=id,access_token,email,delivery,payment_reference,payment_provider,preview_asset,final_asset,unlocked,last_error,updated_at&limit=1',
  );
  assert.deepEqual(lookupModule.mapper.headers, [
    { name: 'Accept', value: 'application/vnd.pgrst.object+json' },
  ]);
  assert.equal(lookupModule.parameters.__IMTCONN__, 6664304);
  assert.match(lookupModule.mapper.url, /payment_reference\.eq\.\{\{ifempty\(3\.object\.payment_intent; 3\.object\.id\)\}\}/);

  const parseModule = rewritten.flow[2] as {
    module: string;
    mapper: {
      json: string;
    };
  };
  assert.equal(parseModule.module, 'json:ParseJSON');
  assert.equal(parseModule.mapper.json, '{{8.body}}');

  const emailModule = rewritten.flow[3] as {
    mapper: {
      to: string[];
      html: string;
    };
  };
  assert.deepEqual(emailModule.mapper.to, [
    '{{ifempty(9.delivery.recipient; ifempty(9.email; 3.object.customer_details.email))}}',
  ]);
  assert.match(emailModule.mapper.html, /dein persoenlicher Geburtstagsgruss ist in Arbeit/);
  assert.match(emailModule.mapper.html, /Statusseite:/);
  assert.match(emailModule.mapper.html, /9\.access_token/);
});

test('buildPreviewLoopBlueprint rewrites Preview Loop to query Supabase directly', async () => {
  const [previewRaw, memoriesRaw] = await Promise.all([
    readFile('tmp/make-backups/wes-338-1776208758686/scenario-4974841-preview-loop.json', 'utf8'),
    readFile('tmp/make-backups/wes-338-1776292701236/scenario-4076359-memories.json', 'utf8'),
  ]);
  const previewSnapshot = JSON.parse(previewRaw) as {
    blueprint: Record<string, unknown> & {
      flow: Array<Record<string, unknown>>;
    };
  };
  const memoriesSnapshot = JSON.parse(memoriesRaw) as {
    blueprint: Record<string, unknown> & {
      flow: Array<Record<string, unknown>>;
    };
  };

  const rewritten = buildPreviewLoopBlueprint(
    previewSnapshot.blueprint,
    memoriesSnapshot.blueprint,
  ) as {
    flow: Array<Record<string, unknown>>;
  };

  assert.deepEqual(
    rewritten.flow.map((module) => module.id),
    [1, 5, 4],
  );

  const lookupModule = rewritten.flow[1] as {
    module: string;
    mapper: {
      method: string;
      url: string;
      headers: Array<{ name: string; value: string }>;
    };
    parameters: {
      __IMTCONN__: number;
    };
  };
  assert.equal(lookupModule.module, 'supabase:makeAnApiCall');
  assert.equal(lookupModule.mapper.method, 'get');
  assert.match(lookupModule.mapper.url, /^\/rest\/v1\/orders\?id=eq\.\{\{ifempty\(1\.jobId; ifempty\(1\.id; 1\.job_id\)\)\}\}/);
  assert.match(lookupModule.mapper.url, /jobId:id/);
  assert.match(lookupModule.mapper.url, /accessToken:access_token/);
  assert.match(lookupModule.mapper.url, /sourceImage1Url:source_images->0->>url/);
  assert.match(lookupModule.mapper.url, /finalAssetUrl:final_asset->>url/);
  assert.deepEqual(lookupModule.mapper.headers, [
    { name: 'Accept', value: 'application/vnd.pgrst.object+json' },
  ]);
  assert.equal(lookupModule.parameters.__IMTCONN__, 6664304);

  const responseModule = rewritten.flow[2] as {
    mapper: {
      body: string;
      status: string;
    };
  };
  assert.equal(responseModule.mapper.body, '{{5.body}}');
  assert.equal(responseModule.mapper.status, '200');
});

test('buildMemoriesBirthdayIdentityBlueprint strengthens the birthday image pipeline without changing downstream persistence', async () => {
  const raw = await readFile(
    'tmp/make-backups/wes-388-1776464286/scenario-4076359-memories-blueprint-live-before.json',
    'utf8',
  );
  const snapshot = JSON.parse(raw) as {
    response: {
      blueprint: Record<string, unknown> & {
        flow: Array<Record<string, unknown>>;
      };
    };
  };

  const rewritten = buildMemoriesBirthdayIdentityBlueprint(
    snapshot.response.blueprint,
  ) as {
    flow: Array<Record<string, unknown>>;
  };

  assert.deepEqual(
    rewritten.flow.map((module) => module.id),
    [10, 11, 22, 24, 18, 19, 25, 30, 28, 31, 32, 33],
  );

  const birthdayLine = rewritten.flow[4] as {
    module: string;
    mapper: {
      model: string;
      temperature: string;
      messages: Array<{ role: string; content: string }>;
    };
  };
  assert.equal(birthdayLine.module, 'openai-gpt-3:CreateCompletion');
  assert.equal(birthdayLine.mapper.model, 'gpt-5.4-mini');
  assert.equal(birthdayLine.mapper.temperature, '0.7');
  assert.match(birthdayLine.mapper.messages[0]!.content, /Recipient name, if available: \{\{ifempty\(10\.customerName; ""\)\}\}/);
  assert.match(birthdayLine.mapper.messages[0]!.content, /3 to 7 words/);
  assert.match(birthdayLine.mapper.messages[0]!.content, /if a clean recipient first name is available, you may use it once in the greeting/);
  assert.match(birthdayLine.mapper.messages[0]!.content, /if no reliable name is available, use a generic birthday line/);
  assert.match(birthdayLine.mapper.messages[0]!.content, /never invent a name/);
  assert.match(
    birthdayLine.mapper.messages[0]!.content,
    /do not mention QA, test, operator, internal, preview, sandbox, or demo wording/,
  );

  const promptBuilder = rewritten.flow[5] as {
    module: string;
    mapper: {
      model: string;
      temperature: string;
      response_format: string;
      messages: Array<{ role: string; content: string }>;
    };
  };
  assert.equal(promptBuilder.module, 'openai-gpt-3:CreateCompletion');
  assert.equal(promptBuilder.mapper.model, 'gpt-5.4-mini');
  assert.equal(promptBuilder.mapper.temperature, '0.3');
  assert.equal(promptBuilder.mapper.response_format, 'text');
  assert.match(promptBuilder.mapper.messages[0]!.content, /Identity preservation is the top priority/);
  assert.match(promptBuilder.mapper.messages[1]!.content, /Preserve the real identities from both source photos with high fidelity/);
  assert.match(promptBuilder.mapper.messages[1]!.content, /Avoid age shifts, body distortion, extra fingers/);
  assert.match(
    promptBuilder.mapper.messages[1]!.content,
    /If the requested relationship depends on age hierarchy.*make that hierarchy unmistakable in the final scene/,
  );
  assert.match(
    promptBuilder.mapper.messages[1]!.content,
    /Keep the older person visibly older and the younger person visibly younger/,
  );
  assert.match(
    promptBuilder.mapper.messages[1]!.content,
    /Do not flatten parent-child, grandparent-child, or multi-generation family scenes into a same-age adult pair/,
  );
  assert.match(
    promptBuilder.mapper.messages[1]!.content,
    /Use family-appropriate body language and staging, not romantic or couple-coded posing/,
  );
  assert.match(promptBuilder.mapper.messages[1]!.content, /Overlay line supplied separately: \{\{18\.result\}\}/);
  assert.match(
    promptBuilder.mapper.messages[1]!.content,
    /If the supplied overlay line already includes a recipient name, preserve it exactly once and do not add another/,
  );
  assert.match(
    promptBuilder.mapper.messages[1]!.content,
    /Do not add a second text line or any operator\/test\/internal wording/,
  );
  assert.doesNotMatch(promptBuilder.mapper.messages[1]!.content, /Alles Gute/);

  const imageEdit = rewritten.flow[6] as {
    module: string;
    mapper: {
      model: string;
      quality: string;
      size: string;
      background: string;
      output_format: string;
      input_fidelity: string;
      prompt: string;
    };
  };
  assert.equal(imageEdit.module, 'openai-gpt-3:editImage');
  assert.equal(imageEdit.mapper.model, 'gpt-image-1.5');
  assert.equal(imageEdit.mapper.quality, 'high');
  assert.equal(imageEdit.mapper.size, '1536x1024');
  assert.equal(imageEdit.mapper.background, 'opaque');
  assert.equal(imageEdit.mapper.output_format, 'jpeg');
  assert.equal(imageEdit.mapper.input_fidelity, 'high');
  assert.match(imageEdit.mapper.prompt, /\{\{19\.result\}\}/);
  assert.match(imageEdit.mapper.prompt, /\{\{18\.result\}\}/);
  assert.match(imageEdit.mapper.prompt, /Include only this short line subtly in the image/);
  assert.match(
    imageEdit.mapper.prompt,
    /If that supplied line contains a recipient name, preserve that exact name once and do not add another/,
  );
  assert.match(imageEdit.mapper.prompt, /Do not include any second line or any QA\/operator\/internal wording/);
  assert.doesNotMatch(imageEdit.mapper.prompt, /Alles Gute/);
});
