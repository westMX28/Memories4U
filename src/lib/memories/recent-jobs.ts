'use client';

import type { MemoryStatus } from '@/lib/memories/contracts';

export type RecentMemoryJob = {
  jobId: string;
  accessToken: string;
  email?: string;
  status?: MemoryStatus;
  updatedAt: string;
};

const STORAGE_KEY = 'memories-recent-jobs';
const MAX_JOBS = 3;

function isRecentMemoryJob(value: unknown): value is RecentMemoryJob {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.jobId === 'string' &&
    typeof candidate.accessToken === 'string' &&
    typeof candidate.updatedAt === 'string' &&
    (candidate.email === undefined || typeof candidate.email === 'string') &&
    (candidate.status === undefined || typeof candidate.status === 'string')
  );
}

export function readRecentJobs(): RecentMemoryJob[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isRecentMemoryJob).slice(0, MAX_JOBS);
  } catch {
    return [];
  }
}

export function storeRecentJob(job: RecentMemoryJob) {
  if (typeof window === 'undefined') {
    return;
  }

  const nextJobs = [
    job,
    ...readRecentJobs().filter((entry) => entry.jobId !== job.jobId),
  ].slice(0, MAX_JOBS);

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextJobs));
}
