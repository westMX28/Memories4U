import { HttpError } from '@/lib/memories/errors';

function assertRecord(value: unknown, message: string) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new HttpError(500, message);
  }

  return value as Record<string, unknown>;
}

function asFlowModule(value: unknown, message: string) {
  return assertRecord(value, message);
}

function requireFlow(blueprint: Record<string, unknown>) {
  if (!Array.isArray(blueprint.flow)) {
    throw new HttpError(500, 'Make blueprint is missing flow.');
  }

  return blueprint.flow.map((entry, index) =>
    asFlowModule(entry, `Make blueprint flow[${index}] was not an object.`),
  );
}

function requireModule(flow: Array<Record<string, unknown>>, id: number, scenarioName: string) {
  const match = flow.find((entry) => entry.id === id);
  if (!match) {
    throw new HttpError(500, `${scenarioName} blueprint did not include module ${id}.`);
  }

  return match;
}

function cloneModule<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function normalizeBaseUrl(raw: string) {
  return raw.replace(/\/$/, '');
}

function createSupabaseApiCallModule(
  template: Record<string, unknown>,
  input: {
    id: number;
    designer?: Record<string, unknown>;
    url: string;
    method: 'get' | 'post' | 'patch';
    body?: string;
    headers?: Array<Record<string, string>>;
  },
) {
  return {
    ...cloneModule(template),
    id: input.id,
    module: 'supabase:makeAnApiCall',
    mapper: {
      qs: [],
      url: input.url,
      body: input.body || '',
      method: input.method,
      headers: input.headers || [],
    },
    metadata: {
      ...assertRecord(template.metadata, 'Supabase template metadata was not an object.'),
      designer: input.designer || { x: 0, y: 0 },
    },
    parameters: cloneModule(
      assertRecord(template.parameters, 'Supabase template parameters were not an object.'),
    ),
  };
}

function createSupabasePatchModule(
  template: Record<string, unknown>,
  input: {
    id: number;
    designer?: Record<string, unknown>;
    url: string;
    body: string;
  },
) {
  return createSupabaseApiCallModule(template, {
    ...input,
    method: 'patch',
  });
}

function createSupabasePostModule(
  template: Record<string, unknown>,
  input: {
    id: number;
    designer?: Record<string, unknown>;
    url: string;
    body: string;
  },
) {
  return createSupabaseApiCallModule(template, {
    ...input,
    method: 'post',
  });
}

function createJsonParseModule(input: {
  id: number;
  designer?: Record<string, unknown>;
  source: string;
}) {
  return {
    id: input.id,
    module: 'json:ParseJSON',
    version: 1,
    mapper: {
      json: input.source,
    },
    metadata: {
      designer: input.designer || { x: 0, y: 0 },
      parameters: [
        {
          name: 'type',
          type: 'udt',
          label: 'Data structure',
        },
      ],
    },
    parameters: {
      type: '',
    },
  };
}

export function buildCheckoutBlueprint(
  currentBlueprint: Record<string, unknown>,
  appBaseUrl: string,
  memoriesBlueprint: Record<string, unknown>,
) {
  const flow = requireFlow(currentBlueprint);
  const memoriesFlow = requireFlow(memoriesBlueprint);
  const trigger = cloneModule(requireModule(flow, 3, 'Checkout'));
  const email = cloneModule(requireModule(flow, 10, 'Checkout'));
  const oldLookup = requireModule(flow, 8, 'Checkout');
  const oldLookupMetadata = assertRecord(
    oldLookup.metadata,
    'Checkout module 8 metadata was not an object.',
  );
  const oldLookupDesigner =
    oldLookupMetadata.designer && typeof oldLookupMetadata.designer === 'object'
      ? (oldLookupMetadata.designer as Record<string, unknown>)
      : null;
  const supabaseTemplate = memoriesFlow.find(
    (entry) => entry.module === 'supabase:makeAnApiCall',
  );

  if (!supabaseTemplate) {
    throw new HttpError(
      500,
      'Memories blueprint did not include a native Supabase module to clone.',
    );
  }

  const normalizedAppBaseUrl = normalizeBaseUrl(appBaseUrl);
  if (!normalizedAppBaseUrl) {
    throw new HttpError(500, 'Checkout blueprint rewrite requires a non-empty app base URL.');
  }
  const orderLookupKey = '{{ifempty(3.object.metadata.jobId; 3.object.client_reference_id)}}';
  const paymentReferenceFallback = '{{ifempty(3.object.payment_intent; 3.object.id)}}';
  const orderPath = '9';
  const lookupUrl =
    '/rest/v1/orders' +
    `?or=(id.eq.${orderLookupKey},payment_reference.eq.${paymentReferenceFallback})` +
    '&select=id,access_token,email,delivery,payment_reference,payment_provider,preview_asset,final_asset,unlocked,last_error,updated_at' +
    '&limit=1';
  const deliveryRecipient =
    `{{ifempty(${orderPath}.delivery.recipient; ifempty(${orderPath}.email; 3.object.customer_details.email))}}`;
  const statusUrl =
    `${normalizedAppBaseUrl}/status?jobId={{${orderPath}.id}}&accessToken={{${orderPath}.access_token}}`;

  return {
    ...cloneModule(currentBlueprint),
    flow: [
      trigger,
      createSupabaseApiCallModule(supabaseTemplate, {
        id: 8,
        designer: oldLookupDesigner || { x: 0, y: 0 },
        url: lookupUrl,
        method: 'get',
        headers: [
          {
            name: 'Accept',
            value: 'application/vnd.pgrst.object+json',
          },
        ],
      }),
      createJsonParseModule({
        id: 9,
        designer:
          oldLookupDesigner
            ? {
                ...oldLookupDesigner,
                x: typeof oldLookupDesigner.x === 'number' ? oldLookupDesigner.x + 260 : 320,
                y: typeof oldLookupDesigner.y === 'number' ? oldLookupDesigner.y : 0,
              }
            : { x: 320, y: 0 },
        source: '{{8.body}}',
      }),
      {
        ...email,
        mapper: {
          ...assertRecord(email.mapper, 'Checkout email mapper was not an object.'),
          to: [deliveryRecipient],
          html:
            'Hallo,\n\n' +
            'dein persoenlicher Geburtstagsgruss ist in Arbeit.\n\n' +
            `Statusseite: ${statusUrl}\n\n` +
            'Dort siehst du den aktuellen Fortschritt und automatisch den finalen Download, sobald das Bild fertig ist.\n\n' +
            'Herzliche Gruesse\n' +
            'Dein Memories-Team',
        },
      },
    ],
  };
}

export function buildPreviewLoopBlueprint(
  currentBlueprint: Record<string, unknown>,
  memoriesBlueprint: Record<string, unknown>,
) {
  const flow = requireFlow(currentBlueprint);
  const memoriesFlow = requireFlow(memoriesBlueprint);
  const trigger = cloneModule(requireModule(flow, 1, 'Preview Loop'));
  const oldLookup = requireModule(flow, 5, 'Preview Loop');
  const router = flow.find((entry) => entry.id === 6);
  const routes = router && Array.isArray(router.routes) ? router.routes : [];
  const successRoute = routes[0];
  const successFlow =
    successRoute &&
    typeof successRoute === 'object' &&
    Array.isArray((successRoute as { flow?: unknown[] }).flow)
      ? (successRoute as { flow: unknown[] }).flow
      : [];
  const routedResponseModule = successFlow[0]
    ? asFlowModule(successFlow[0], 'Preview Loop success response module was not an object.')
    : null;
  const directResponseModule = flow.find((entry) => entry.id === 4);
  const responseModule = cloneModule(routedResponseModule || directResponseModule || requireModule(flow, 4, 'Preview Loop'));
  const supabaseTemplate = memoriesFlow.find((entry) => entry.module === 'supabase:makeAnApiCall');

  if (!supabaseTemplate) {
    throw new HttpError(
      500,
      'Memories blueprint did not include a native Supabase module to clone.',
    );
  }

  const oldLookupMetadata = assertRecord(
    oldLookup.metadata,
    'Preview Loop module 5 metadata was not an object.',
  );
  const oldLookupDesigner =
    oldLookupMetadata.designer && typeof oldLookupMetadata.designer === 'object'
      ? (oldLookupMetadata.designer as Record<string, unknown>)
      : null;

  const lookupUrl =
    '/rest/v1/orders' +
    '?id=eq.{{ifempty(1.jobId; ifempty(1.id; 1.job_id))}}' +
    '&select=' +
    [
      'id',
      'jobId:id',
      'accessToken:access_token',
      'status',
      'unlocked',
      'email',
      'deliveryEmail:delivery->>recipient',
      'customerName:customer_name',
      'storyPrompt:story_prompt',
      'sourceImage1Url:source_images->0->>url',
      'sourceImage2Url:source_images->1->>url',
      'paymentReference:payment_reference',
      'paymentProvider:payment_provider',
      'previewAssetUrl:preview_asset->>url',
      'finalAssetUrl:final_asset->>url',
      'previewAsset:preview_asset',
      'finalAsset:final_asset',
      'delivery',
      'lastError:last_error',
      'createdAt:created_at',
      'updatedAt:updated_at',
    ].join(',') +
    '&limit=1';

  return {
    ...cloneModule(currentBlueprint),
    flow: [
      trigger,
      createSupabaseApiCallModule(supabaseTemplate, {
        id: 5,
        designer: oldLookupDesigner || { x: 300, y: 0 },
        url: lookupUrl,
        method: 'get',
        headers: [
          {
            name: 'Accept',
            value: 'application/vnd.pgrst.object+json',
          },
        ],
      }),
      {
        ...responseModule,
        mapper: {
          body: '{{5.body}}',
          status: '200',
          headers: [
            {
              key: 'Content-Type',
              value: 'application/json',
            },
          ],
        },
      },
    ],
  };
}

export function buildMemoriesBirthdayIdentityBlueprint(
  currentBlueprint: Record<string, unknown>,
) {
  const flow = requireFlow(currentBlueprint);
  const trigger = cloneModule(requireModule(flow, 10, 'Memories'));
  const acknowledge = cloneModule(requireModule(flow, 11, 'Memories'));
  const sourceImageOne = cloneModule(requireModule(flow, 22, 'Memories'));
  const sourceImageTwo = cloneModule(requireModule(flow, 24, 'Memories'));
  const birthdayLine = cloneModule(requireModule(flow, 18, 'Memories'));
  const imageEdit = cloneModule(requireModule(flow, 25, 'Memories'));
  const upload = cloneModule(requireModule(flow, 30, 'Memories'));
  const orderPatch = cloneModule(requireModule(flow, 28, 'Memories'));
  const generationPatch = cloneModule(requireModule(flow, 31, 'Memories'));
  const assetInsert = cloneModule(requireModule(flow, 32, 'Memories'));
  const eventInsert = cloneModule(requireModule(flow, 33, 'Memories'));

  const birthdayLineMetadata = assertRecord(
    birthdayLine.metadata,
    'Memories birthday-line module metadata was not an object.',
  );
  const birthdayLineDesigner =
    birthdayLineMetadata.designer && typeof birthdayLineMetadata.designer === 'object'
      ? (birthdayLineMetadata.designer as Record<string, unknown>)
      : { x: 763, y: 13 };

  const birthdayLineMapper = assertRecord(
    birthdayLine.mapper,
    'Memories birthday-line module mapper was not an object.',
  );
  const imageEditMapper = assertRecord(
    imageEdit.mapper,
    'Memories image-edit module mapper was not an object.',
  );

  return {
    ...cloneModule(currentBlueprint),
    flow: [
      trigger,
      acknowledge,
      sourceImageOne,
      sourceImageTwo,
      {
        ...birthdayLine,
        mapper: {
          ...birthdayLineMapper,
          model: 'gpt-5.4-mini',
          temperature: '0.7',
          messages: [
            {
              role: 'user',
              content:
                'Create ONE short premium birthday line for an image overlay based on this scene: {{10.storyPrompt}}.\n' +
                'Recipient name, if available: {{ifempty(10.customerName; "")}}\n' +
                'Rules:\n' +
                '- 3 to 7 words\n' +
                '- warm, modern, emotionally grounded\n' +
                '- lightly playful at most\n' +
                '- if a clean recipient first name is available, you may use it once in the greeting\n' +
                '- if no reliable name is available, use a generic birthday line\n' +
                '- never invent a name\n' +
                '- keep the line editorial and premium, not novelty-card loud\n' +
                '- do not mention QA, test, operator, internal, preview, sandbox, or demo wording\n' +
                '- no emojis\n' +
                '- no quotation marks\n' +
                '- output only the line',
            },
          ],
        },
      },
      {
        ...cloneModule(birthdayLine),
        id: 19,
        mapper: {
          ...birthdayLineMapper,
          model: 'gpt-5.4-mini',
          temperature: '0.3',
          response_format: 'text',
          messages: [
            {
              role: 'system',
              content:
                'You write image-edit prompts for high-fidelity birthday portraits using real reference photos. ' +
                'Identity preservation is the top priority. Return only the final prompt text.',
            },
            {
              role: 'user',
              content:
                'Write the final prompt for an image edit model using two real reference photos as the visual source.\n\n' +
                'Scene request: {{10.storyPrompt}}\n' +
                'Overlay line supplied separately: {{18.result}}\n\n' +
                'Requirements:\n' +
                '- Preserve the real identities from both source photos with high fidelity.\n' +
                '- Keep facial structure, age, skin tone, hair color, hair texture, and overall likeness stable.\n' +
                '- If the requested relationship depends on age hierarchy or family roles, make that hierarchy unmistakable in the final scene.\n' +
                '- Keep the older person visibly older and the younger person visibly younger while preserving their real likenesses.\n' +
                '- Do not flatten parent-child, grandparent-child, or multi-generation family scenes into a same-age adult pair.\n' +
                '- Use family-appropriate body language and staging, not romantic or couple-coded posing.\n' +
                '- Do not merge the people into a new face or drift into generic AI beauty standards.\n' +
                '- Avoid age shifts, body distortion, extra fingers, warped eyes, uncanny skin smoothing, plastic texture, or over-stylized features.\n' +
                '- Keep the result premium, cinematic, and emotionally warm, but lightly stylized only.\n' +
                '- Use a believable photographic birthday scene with natural lighting and grounded composition.\n' +
                '- Leave clear negative guidance against identity drift and distorted anatomy.\n' +
                '- Reserve subtle space for one short celebratory overlay line only.\n' +
                '- If the supplied overlay line already includes a recipient name, preserve it exactly once and do not add another.\n' +
                '- Do not add a second text line or any operator/test/internal wording.',
            },
          ],
        },
        metadata: {
          ...birthdayLineMetadata,
          designer: {
            ...(birthdayLineDesigner || {}),
            x:
              typeof birthdayLineDesigner.x === 'number'
                ? birthdayLineDesigner.x + 150
                : 913,
            y:
              typeof birthdayLineDesigner.y === 'number'
                ? birthdayLineDesigner.y + 170
                : 183,
          },
        },
      },
      {
        ...imageEdit,
        mapper: {
          ...imageEditMapper,
          model: 'gpt-image-1.5',
          quality: 'high',
          size: '1536x1024',
          background: 'opaque',
          output_format: 'jpeg',
          input_fidelity: 'high',
          prompt:
            '{{19.result}}\n\n' +
            'Include only this short line subtly in the image: "{{18.result}}".\n' +
            'If that supplied line contains a recipient name, preserve that exact name once and do not add another.\n' +
            'Do not include any second line or any QA/operator/internal wording.',
        },
      },
      upload,
      orderPatch,
      generationPatch,
      assetInsert,
      eventInsert,
    ],
  };
}
