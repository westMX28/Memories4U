import { HttpError } from '@/lib/memories/errors';
import { getMemoryJobStatus } from '@/lib/memories/service';
import { jsonError, jsonOk } from '@/lib/memories/http';

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    const { jobId } = await params;
    const url = new URL(request.url);
    const accessToken =
      url.searchParams.get('accessToken') ||
      request.headers.get('x-memories-access-token') ||
      undefined;

    if (!accessToken) {
      throw new HttpError(401, 'accessToken is required.');
    }

    return jsonOk(await getMemoryJobStatus(jobId, accessToken));
  } catch (error) {
    return jsonError(error);
  }
}
