import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

type QaRun = {
  slug: string;
  customerName: string;
  storyPrompt: string;
};

const sourceImages = [
  {
    storage: 'remote_url' as const,
    url: 'https://randomuser.me/api/portraits/women/44.jpg',
    mimeType: 'image/jpeg' as const,
    filename: 'woman-44.jpg',
  },
  {
    storage: 'remote_url' as const,
    url: 'https://randomuser.me/api/portraits/men/32.jpg',
    mimeType: 'image/jpeg' as const,
    filename: 'man-32.jpg',
  },
];

const runs: QaRun[] = [
  {
    slug: 'garden-party-short-copy',
    customerName: 'QA Garden',
    storyPrompt:
      'A warm golden-hour garden birthday dinner with a small cake, soft candles, refined flowers, and a calm premium editorial mood.',
  },
  {
    slug: 'beach-sunset-short-copy',
    customerName: 'QA Beach',
    storyPrompt:
      'A premium beach birthday moment at sunset with elegant balloons, soft wind, warm light, and a cinematic but natural feeling.',
  },
];

function requireMemoriesWebhookUrl() {
  const hookUrl = process.env.MEMORIES_MAKE_WRITE_WEBHOOK_URL || process.env.MEMORIES_MAKE_WEBHOOK_URL;

  if (!hookUrl) {
    throw new Error(
      'MEMORIES_MAKE_WRITE_WEBHOOK_URL or MEMORIES_MAKE_WEBHOOK_URL is required to run overlay QA.',
    );
  }

  return hookUrl;
}

async function waitForFinalAsset(
  jobId: string,
  slug: string,
  getOperatorOrderStatus: (jobId: string) => ReturnType<typeof import('@/lib/memories/service').getOperatorOrderStatus>,
) {
  const startedAt = Date.now();

  for (;;) {
    const operatorStatus = await getOperatorOrderStatus(jobId);
    const generationStatus = operatorStatus.generation.status;
    const finalUrl = operatorStatus.assets.final.asset?.url;
    console.log(`[${slug}] poll status=${generationStatus} final=${finalUrl ? 'yes' : 'no'}`);

    if (generationStatus === 'completed' && finalUrl) {
      return {
        generationStatus,
        finalUrl,
        elapsedSeconds: Math.round((Date.now() - startedAt) / 1000),
      };
    }

    if (Date.now() - startedAt > 8 * 60 * 1000) {
      throw new Error(`Timed out waiting for final asset for ${slug}.`);
    }

    await new Promise((resolve) => setTimeout(resolve, 10_000));
  }
}

async function downloadImage(url: string, destination: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Asset download failed with status ${response.status} for ${url}.`);
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  await writeFile(destination, bytes);
}

async function main() {
  const runtimeEnvModule = await import('@/lib/memories/runtime-env');
  const serviceModule = await import('@/lib/memories/service');
  const storeModule = await import('@/lib/memories/store');
  const runtimeEnv = runtimeEnvModule as typeof import('@/lib/memories/runtime-env');
  const service = serviceModule as typeof import('@/lib/memories/service');
  const store = storeModule as typeof import('@/lib/memories/store');

  runtimeEnv.loadMemoriesRuntimeEnv();

  const hookUrl = requireMemoriesWebhookUrl();
  const outputDir = path.join(process.cwd(), 'tmp', 'wes-406-qa');
  await mkdir(outputDir, { recursive: true });

  const results: Array<Record<string, unknown>> = [];

  for (const [index, run] of runs.entries()) {
    const created = await service.createMemoryJobRecord({
      email: `qa+w406-${run.slug}@example.com`,
      customerName: run.customerName,
      storyPrompt: run.storyPrompt,
      sourceImages,
      metadata: { occasion: 'birthday', qaRun: 'wes-406' },
    });

    const unlocked = await service.unlockMemoryJob(created.jobId, {
      paymentReference: `pay_wes_406_${index + 1}`,
      provider: 'manual',
    });

    const job = await store.requireJob(created.jobId);
    const payload = {
      action: 'generate' as const,
      jobId: job.id,
      status: unlocked.status,
      accessToken: job.accessToken,
      email: job.email,
      customerName: job.customerName,
      storyPrompt: job.storyPrompt,
      sourceImage1Url: job.sourceImages[0]?.url,
      sourceImage2Url: job.sourceImages[1]?.url || job.sourceImages[0]?.url,
      paymentReference: job.paymentReference,
      paymentProvider: job.paymentProvider,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    };

    const response = await fetch(hookUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const body = await response.text();
    if (!response.ok) {
      throw new Error(`Webhook failed for ${run.slug}: ${response.status} ${body}`);
    }

    console.log(`[${run.slug}] webhook accepted: ${body}`);

    const completion = await waitForFinalAsset(created.jobId, run.slug, service.getOperatorOrderStatus);
    const imagePath = path.join(outputDir, `${run.slug}.jpg`);
    await downloadImage(completion.finalUrl, imagePath);

    results.push({
      slug: run.slug,
      jobId: created.jobId,
      customerName: run.customerName,
      generationStatus: completion.generationStatus,
      finalUrl: completion.finalUrl,
      imagePath,
      elapsedSeconds: completion.elapsedSeconds,
    });
  }

  const resultPath = path.join(outputDir, 'results.json');
  await writeFile(resultPath, `${JSON.stringify(results, null, 2)}\n`, 'utf8');

  console.log(
    JSON.stringify(
      {
        ok: true,
        resultPath,
        results,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : 'Unknown overlay QA failure.';
  console.error(message);
  process.exit(1);
});
