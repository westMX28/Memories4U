import { createMemoryJobRecord, parseCreateMemoryJobInput } from '@/lib/memories/service';
import { jsonError, jsonOk, readJson } from '@/lib/memories/http';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await readJson<unknown>(request);
    const result = await createMemoryJobRecord(parseCreateMemoryJobInput(body));
    return jsonOk(result, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
