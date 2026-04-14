import { assertInternalRequest } from '@/lib/memories/internal-auth';
import { jsonError, jsonOk } from '@/lib/memories/http';
import { getOperatorOrderStatus } from '@/lib/memories/service';

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    assertInternalRequest(request);

    const { jobId } = await params;
    return jsonOk(await getOperatorOrderStatus(jobId));
  } catch (error) {
    return jsonError(error);
  }
}
