import { resolvePublicAppUrl } from '@/lib/memories/public-flow';
import {
  createMemoryJobId,
  createMemoryJobRecord,
  getCreateMemoryJobIdempotencyKeyFromFormData,
  getExistingMemoryJobForCreateInput,
  parseCreateMemoryJobFormData,
  parseCreateMemoryJobInput,
  toCreateMemoryJobResponse,
} from '@/lib/memories/service';
import { jsonError, jsonOk, readJson } from '@/lib/memories/http';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    const isMultipart = contentType.includes('multipart/form-data');
    const multipartJobId = isMultipart ? createMemoryJobId() : undefined;
    let parsedInput;

    if (isMultipart) {
      const formData = await request.formData();
      const idempotencyKey = getCreateMemoryJobIdempotencyKeyFromFormData(formData);
      if (idempotencyKey) {
        const existing = await getExistingMemoryJobForCreateInput(idempotencyKey);
        if (existing) {
          return jsonOk(toCreateMemoryJobResponse(existing, resolvePublicAppUrl(request)), { status: 201 });
        }
      }

      parsedInput = await parseCreateMemoryJobFormData(formData, multipartJobId);
    } else {
      parsedInput = parseCreateMemoryJobInput(await readJson<unknown>(request));
    }

    const result = await createMemoryJobRecord(parsedInput, multipartJobId);
    const response = toCreateMemoryJobResponse(result, resolvePublicAppUrl(request));
    return jsonOk(response, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
