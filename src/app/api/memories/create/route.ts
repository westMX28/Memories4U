import { resolvePublicAppUrl } from '@/lib/memories/public-flow';
import {
  createMemoryJobRecord,
  parseCreateMemoryJobFormData,
  parseCreateMemoryJobInput,
  toCreateMemoryJobResponse,
} from '@/lib/memories/service';
import { jsonError, jsonOk, readJson } from '@/lib/memories/http';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    const parsedInput = contentType.includes('multipart/form-data')
      ? await parseCreateMemoryJobFormData(await request.formData())
      : parseCreateMemoryJobInput(await readJson<unknown>(request));
    const result = await createMemoryJobRecord(parsedInput);
    const response = toCreateMemoryJobResponse(result, resolvePublicAppUrl(request));
    return jsonOk(response, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
