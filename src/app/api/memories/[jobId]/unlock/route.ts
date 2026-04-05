import { HttpError } from '@/lib/memories/errors';
import { jsonError, jsonOk, readJson } from '@/lib/memories/http';
import { assertInternalRequest } from '@/lib/memories/internal-auth';
import { parseUnlockJobInput, unlockMemoryJob } from '@/lib/memories/service';

export const runtime = 'nodejs';

function hasInternalAuth(request: Request) {
  return Boolean(
    request.headers.get('authorization') || request.headers.get('x-memories-internal-secret'),
  );
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    const { jobId } = await params;
    const accessToken = request.headers.get('x-memories-access-token') || undefined;

    if (hasInternalAuth(request)) {
      assertInternalRequest(request);
    } else {
      if (!accessToken) {
        throw new HttpError(401, 'Internal auth or x-memories-access-token is required.');
      }
    }

    const body = await readJson<unknown>(request);
    return jsonOk(await unlockMemoryJob(jobId, parseUnlockJobInput(body), accessToken));
  } catch (error) {
    return jsonError(error);
  }
}
