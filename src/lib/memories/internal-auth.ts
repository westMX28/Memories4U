import { HttpError } from '@/lib/memories/errors';

import { getMemoriesConfig } from '@/lib/memories/config';

function extractToken(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice('Bearer '.length).trim();
  }

  return request.headers.get('x-memories-internal-secret')?.trim() || '';
}

export function assertInternalRequest(request: Request) {
  const { internalApiSecret } = getMemoriesConfig();
  const token = extractToken(request);

  if (!internalApiSecret) {
    throw new HttpError(503, 'MEMORIES_INTERNAL_API_SECRET is not configured.');
  }

  if (!token || token !== internalApiSecret) {
    throw new HttpError(401, 'Internal authorization failed.');
  }
}
