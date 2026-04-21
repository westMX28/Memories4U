import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { getMemoriesConfig } from '@/lib/memories/config';
import { HttpError } from '@/lib/memories/errors';
import {
  getSupabaseJob,
  isSupabaseConfigured,
  upsertSupabaseJob,
} from '@/lib/memories/supabase-store';

import type { MemoryJob } from '@/lib/memories/contracts';

type StoreShape = {
  jobs: Record<string, MemoryJob>;
};

const initialStore: StoreShape = { jobs: {} };

let writeQueue = Promise.resolve();

async function ensureStoreFile(filePath: string) {
  await mkdir(path.dirname(filePath), { recursive: true });

  try {
    await readFile(filePath, 'utf8');
  } catch {
    await writeFile(filePath, JSON.stringify(initialStore, null, 2), 'utf8');
  }
}

async function readStore(): Promise<StoreShape> {
  const { dataFile } = getMemoriesConfig();
  await ensureStoreFile(dataFile);

  const raw = await readFile(dataFile, 'utf8');
  if (!raw.trim()) {
    return initialStore;
  }

  return JSON.parse(raw) as StoreShape;
}

async function writeStore(store: StoreShape) {
  const { dataFile } = getMemoriesConfig();
  await ensureStoreFile(dataFile);

  const tempFile = `${dataFile}.tmp`;
  await writeFile(tempFile, JSON.stringify(store, null, 2), 'utf8');
  await rename(tempFile, dataFile);
}

async function queueWrite<T>(operation: () => Promise<T>) {
  const next = writeQueue.then(operation, operation);
  writeQueue = next.then(
    () => undefined,
    () => undefined,
  );

  return next;
}

function assertFileStoreAllowed() {
  const { allowLocalFileStore } = getMemoriesConfig();
  if (!allowLocalFileStore) {
    throw new HttpError(
      503,
      'Supabase is required for the canonical Memories store. Set MEMORIES_ALLOW_LOCAL_FILE_STORE=1 only for local development or tests.',
    );
  }
}

export async function createJob(job: MemoryJob) {
  if (isSupabaseConfigured()) {
    return upsertSupabaseJob(job);
  }

  assertFileStoreAllowed();
  return queueWrite(async () => {
    const store = await readStore();
    store.jobs[job.id] = job;
    await writeStore(store);
    return job;
  });
}

export async function getJob(jobId: string) {
  if (isSupabaseConfigured()) {
    return getSupabaseJob(jobId);
  }

  assertFileStoreAllowed();
  const store = await readStore();
  return store.jobs[jobId];
}

export async function findJobByClientRequestId(email: string, clientRequestId: string) {
  if (isSupabaseConfigured()) {
    const { findSupabaseJobByClientRequestId } = await import('@/lib/memories/supabase-store');
    return findSupabaseJobByClientRequestId(email, clientRequestId);
  }

  assertFileStoreAllowed();
  const store = await readStore();
  return Object.values(store.jobs).find(
    (job) => job.email === email && job.clientRequestId === clientRequestId,
  );
}

export async function requireJob(jobId: string) {
  const job = await getJob(jobId);
  if (!job) {
    throw new HttpError(404, `Memory job ${jobId} was not found.`);
  }

  return job;
}

export async function updateJob(jobId: string, updater: (job: MemoryJob) => MemoryJob) {
  if (isSupabaseConfigured()) {
    const existing = await getSupabaseJob(jobId);

    if (!existing) {
      throw new HttpError(404, `Memory job ${jobId} was not found.`);
    }

    const updated = updater(existing);
    return upsertSupabaseJob(updated);
  }

  assertFileStoreAllowed();
  return queueWrite(async () => {
    const store = await readStore();
    const existing = store.jobs[jobId];

    if (!existing) {
      throw new HttpError(404, `Memory job ${jobId} was not found.`);
    }

    const updated = updater(existing);
    store.jobs[jobId] = updated;
    await writeStore(store);
    return updated;
  });
}
