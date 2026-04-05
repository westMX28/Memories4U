import { jsonError, jsonOk, readJson } from '@/lib/memories/http';
import { assertInternalRequest } from '@/lib/memories/internal-auth';
import { applyMediaCommand, parseMediaCommand } from '@/lib/memories/service';

export const runtime = 'nodejs';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    assertInternalRequest(request);

    const { jobId } = await params;
    const body = await readJson<unknown>(request);
    return jsonOk(await applyMediaCommand(jobId, parseMediaCommand(body)));
  } catch (error) {
    return jsonError(error);
  }
}
