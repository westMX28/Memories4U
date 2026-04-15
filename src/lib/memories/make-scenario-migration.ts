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

function createHttpJsonGetModule(input: {
  id: number;
  designer?: Record<string, unknown>;
  url: string;
  internalSecret: string;
}) {
  return {
    id: input.id,
    module: 'http:ActionSendData',
    version: 3,
    mapper: {
      ca: '',
      qs: [],
      url: input.url,
      data: '',
      gzip: true,
      method: 'get',
      headers: [
        {
          name: 'Authorization',
          value: `Bearer ${input.internalSecret}`,
        },
      ],
      timeout: '',
      authPass: '',
      authUser: '',
      bodyType: 'raw',
      contentType: 'application/json',
      shareCookies: false,
      parseResponse: false,
      followRedirect: true,
      useQuerystring: false,
      rejectUnauthorized: true,
    },
    metadata: {
      designer: input.designer || { x: 0, y: 0 },
    },
    parameters: {
      handleErrors: false,
    },
  };
}

function createHttpJsonPostModule(input: {
  id: number;
  designer?: Record<string, unknown>;
  url: string;
  internalSecret: string;
  body: string;
}) {
  return {
    id: input.id,
    module: 'http:ActionSendData',
    version: 3,
    mapper: {
      ca: '',
      qs: [],
      url: input.url,
      data: input.body,
      gzip: true,
      method: 'post',
      headers: [
        {
          name: 'Authorization',
          value: `Bearer ${input.internalSecret}`,
        },
        {
          name: 'Content-Type',
          value: 'application/json',
        },
      ],
      timeout: '',
      authPass: '',
      authUser: '',
      bodyType: 'raw',
      contentType: 'application/json',
      shareCookies: false,
      parseResponse: false,
      followRedirect: true,
      useQuerystring: false,
      rejectUnauthorized: true,
    },
    metadata: {
      designer: input.designer || { x: 0, y: 0 },
    },
    parameters: {
      handleErrors: false,
    },
  };
}

export function buildCheckoutBlueprint(
  currentBlueprint: Record<string, unknown>,
  appBaseUrl: string,
  internalSecret: string,
) {
  const flow = requireFlow(currentBlueprint);
  const trigger = cloneModule(requireModule(flow, 3, 'Checkout'));
  const parseJson = cloneModule(requireModule(flow, 12, 'Checkout'));
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
  const legacyUrl =
    `${normalizeBaseUrl(appBaseUrl)}/api/memories/` +
    `{{ifempty(3.object.metadata.jobId; 3.object.client_reference_id)}}/legacy-state`;
  const deliveryUrl =
    `${normalizeBaseUrl(appBaseUrl)}/api/memories/` +
    `{{ifempty(12.jobId; ifempty(3.object.metadata.jobId; 3.object.client_reference_id))}}/delivery`;

  return {
    ...cloneModule(currentBlueprint),
    flow: [
      trigger,
      createHttpJsonGetModule({
        id: 8,
        designer: oldLookupDesigner || { x: 0, y: 0 },
        url: legacyUrl,
        internalSecret,
      }),
      {
        ...parseJson,
        mapper: {
          json: '{{8.data}}',
        },
      },
      email,
      createHttpJsonPostModule({
        id: 14,
        designer:
          oldLookupDesigner
            ? {
                ...oldLookupDesigner,
                x: typeof oldLookupDesigner.x === 'number' ? oldLookupDesigner.x + 1100 : 1160,
                y: typeof oldLookupDesigner.y === 'number' ? oldLookupDesigner.y : 0,
              }
            : { x: 1160, y: 0 },
        url: deliveryUrl,
        internalSecret,
        body:
          '{\n' +
          '  "channel": "email",\n' +
          '  "provider": "make",\n' +
          '  "recipient": "{{ifempty(12.deliveryEmail; ifempty(12.email; 3.object.customer_details.email))}}"\n' +
          '}',
      }),
    ],
  };
}
