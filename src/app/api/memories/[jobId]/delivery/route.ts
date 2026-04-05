import { jsonError, jsonOk, readJson } from '@/lib/memories/http';
import { assertInternalRequest } from '@/lib/memories/internal-auth';
import { parseDeliveryCommand, recordDelivery } from '@/lib/memories/service';

export const runtime = 'nodejs';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    assertInternalRequest(request);

    const { jobId } = await params;
    const body = await readJson<unknown>(request);
    return jsonOk(await recordDelivery(jobId, parseDeliveryCommand(body)));
  } catch (error) {
    return jsonError(error);
  }
}
