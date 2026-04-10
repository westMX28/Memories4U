import { HttpError } from '@/lib/memories/errors';
import { resolvePublicAppUrl } from '@/lib/memories/public-flow';
import { createCheckoutSession } from '@/lib/memories/service';
import { jsonError, jsonOk } from '@/lib/memories/http';

export const runtime = 'nodejs';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    const { jobId } = await params;
    const accessToken = request.headers.get('x-memories-access-token') || undefined;

    if (!accessToken) {
      throw new HttpError(401, 'x-memories-access-token is required.');
    }

    return jsonOk(await createCheckoutSession(jobId, accessToken, resolvePublicAppUrl(request)), {
      status: 201,
    });
  } catch (error) {
    return jsonError(error);
  }
}
