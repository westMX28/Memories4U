import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { getMemoriesConfig } from '@/lib/memories/config';
import { HttpError } from '@/lib/memories/errors';
import {
  createRemoteJob,
  getRemoteJob,
  isMakeConfigured,
  unlockRemoteJob,
  updateRemoteJob,
} from '@/lib/memories/make-client';

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

export async function createJob(job: MemoryJob) {
  if (isMakeConfigured()) {
    return createRemoteJob(job);
  }

  return queueWrite(async () => {
    const store = await readStore();
    store.jobs[job.id] = job;
    await writeStore(store);
    return job;
  });
}

export async function getJob(jobId: string) {
  if (isMakeConfigured()) {
    return getRemoteJob(jobId);
  }

  const store = await readStore();
  return store.jobs[jobId];
}

export async function requireJob(jobId: string) {
  const job = await getJob(jobId);
  if (!job) {
    throw new HttpError(404, `Memory job ${jobId} was not found.`);
  }

  return job;
}

export async function updateJob(jobId: string, updater: (job: MemoryJob) => MemoryJob) {
  if (isMakeConfigured()) {
    const existing = await getRemoteJob(jobId);

    if (!existing) {
      throw new HttpError(404, `Memory job ${jobId} was not found.`);
    }

    const updated = updater(existing);

    if (!existing.unlocked && updated.unlocked) {
      return (
        (await unlockRemoteJob(updated, updated.paymentReference || '', updated.updatedAt)) || updated
      );
    }

    return (await updateRemoteJob(jobId, updated)) || updated;
  }

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
