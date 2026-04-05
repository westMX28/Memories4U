import { jsonError, jsonOk, readJson } from '@/lib/memories/http';
import { assertInternalRequest } from '@/lib/memories/internal-auth';
import { applyMakeUpdate, parseMakeUpdateEvent } from '@/lib/memories/service';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    assertInternalRequest(request);

    const body = await readJson<unknown>(request);
    return jsonOk(await applyMakeUpdate(parseMakeUpdateEvent(body)));
  } catch (error) {
    return jsonError(error);
  }
}
