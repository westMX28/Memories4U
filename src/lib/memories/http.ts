import { NextResponse } from 'next/server';

import { HttpError } from '@/lib/memories/errors';

export async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new HttpError(400, 'Request body must be valid JSON.');
  }
}

export function jsonOk(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, init);
}

export function jsonError(error: unknown) {
  if (error instanceof HttpError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  console.error(error);
  return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
}
