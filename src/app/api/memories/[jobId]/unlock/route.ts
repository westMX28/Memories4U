import { HttpError } from '@/lib/memories/errors';
import { jsonError, jsonOk, readJson } from '@/lib/memories/http';
import { assertInternalRequest } from '@/lib/memories/internal-auth';
import { parseUnlockJobInput, unlockMemoryJob } from '@/lib/memories/service';

export const runtime = 'nodejs';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    const { jobId } = await params;
    if (!request.headers.get('authorization') && !request.headers.get('x-memories-internal-secret')) {
      throw new HttpError(401, 'Internal authorization is required for payment confirmation.');
    }

    assertInternalRequest(request);

    const body = await readJson<unknown>(request);
    return jsonOk(await unlockMemoryJob(jobId, parseUnlockJobInput(body)));
  } catch (error) {
    return jsonError(error);
  }
}
