import { HttpError } from '@/lib/memories/errors';
import { assertInternalRequest } from '@/lib/memories/internal-auth';
import { jsonError, jsonOk } from '@/lib/memories/http';
import { getLegacyMakeJobState } from '@/lib/memories/service';

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    assertInternalRequest(request);

    const { jobId } = await params;
    return jsonOk(await getLegacyMakeJobState(jobId));
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      return jsonOk({});
    }

    return jsonError(error);
  }
}
