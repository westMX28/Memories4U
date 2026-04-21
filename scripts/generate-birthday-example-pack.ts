import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { createMemoryJobRecord, getJobForInternalUse, unlockMemoryJob } from '@/lib/memories/service';
import { loadMemoriesRuntimeEnv } from '@/lib/memories/runtime-env';

type CandidateDefinition = {
  exampleId: string;
  scenarioFamily: string;
  sourceImageShape: string;
  relationshipType: string;
  greetingMode: 'named' | 'generic';
  recipientName?: string;
  memoryPromptSummary: string;
  intendedEmotionalOutcome: string;
  storyPrompt: string;
  sourceImages: Array<{ url: string; label: string }>;
  technicalReviewNotes: string[];
};

type CandidateResult = CandidateDefinition & {
  jobId: string;
  accessToken: string;
  status: string;
  pipelineVersion: string;
  outputAssetLocation?: string;
  previewAssetLocation?: string;
  qualityStatus: 'pending_product_review';
  websiteClearance: 'pending_product_review';
  homepageEligible: false;
  examplesPageEligible: false;
  evaluationNotes: string[];
  error?: string;
};

const pipelineVersion =
  'memories-live-scenario-4076359-upgraded-by-wes-401-gpt-image-1.5-input_fidelity-high-quality-high-jpeg-1536x1024';

const candidates: CandidateDefinition[] = [
  {
    exampleId: 'family-warmth-01',
    scenarioFamily: 'Parent and child, current-photo warmth',
    sourceImageShape: 'two separate portrait references, one older adult and one younger-looking adult proxy',
    relationshipType: 'parent-child proxy pair',
    greetingMode: 'named',
    recipientName: 'Mila',
    memoryPromptSummary:
      'Garden birthday hug between a mother and child with cake, candles, and natural daylight warmth.',
    intendedEmotionalOutcome: 'Tender present-day warmth that feels intimate without becoming glossy or staged.',
    storyPrompt:
      'Create a premium birthday memory image of a loving parent and child in a sunlit garden at a small birthday celebration, leaning close with a cake, soft flowers, and candid warmth. Keep the faces recognizable, preserve age difference clearly, and avoid studio stiffness.',
    sourceImages: [
      { url: 'https://randomuser.me/api/portraits/women/44.jpg', label: 'parent proxy' },
      { url: 'https://randomuser.me/api/portraits/men/12.jpg', label: 'child proxy' },
    ],
    technicalReviewNotes: [
      'Proxy pair uses publicly available portrait references rather than real parent-child source photos.',
      'Primary review focus is warmth, age separation, and whether the upgraded prompt path avoids plastic skin.',
    ],
  },
  {
    exampleId: 'couple-celebration-01',
    scenarioFamily: 'Couple, shared memory and celebration tone',
    sourceImageShape: 'two clean portrait references',
    relationshipType: 'couple',
    greetingMode: 'named',
    recipientName: 'Maxi',
    memoryPromptSummary:
      'Rooftop evening birthday dinner with gentle romance, city lights, and shared celebration energy.',
    intendedEmotionalOutcome: 'Believable intimacy, elevated mood, and premium finish without over-stylization.',
    storyPrompt:
      'Create a premium birthday memory image of a couple sharing a rooftop dinner at blue hour with candles, skyline lights, elegant outfits, and warm romantic body language. Keep both faces clearly recognizable and the atmosphere tasteful rather than dramatic.',
    sourceImages: [
      { url: 'https://randomuser.me/api/portraits/women/44.jpg', label: 'partner one' },
      { url: 'https://randomuser.me/api/portraits/men/32.jpg', label: 'partner two' },
    ],
    technicalReviewNotes: [
      'This scenario is closest to the prior QA pair and should provide a clean continuity checkpoint.',
      'Watch for facial drift asymmetry between the two faces and overly formal posing.',
    ],
  },
  {
    exampleId: 'friends-candid-01',
    scenarioFamily: 'Adult siblings or close friends, casual candid energy',
    sourceImageShape: 'two separate portrait references',
    relationshipType: 'close friends',
    greetingMode: 'generic',
    memoryPromptSummary:
      'Playful birthday moment at a casual outdoor table with laughter, movement, and candid familiarity.',
    intendedEmotionalOutcome: 'Light, spontaneous, familiar energy instead of portrait stiffness.',
    storyPrompt:
      'Create a birthday memory image of two close friends laughing mid-conversation at an outdoor cafe table with cake slices, confetti, and a candid documentary feel. Keep the faces recognizable and natural, with relaxed posture and no formal portrait posing.',
    sourceImages: [
      { url: 'https://randomuser.me/api/portraits/women/65.jpg', label: 'friend one' },
      { url: 'https://randomuser.me/api/portraits/men/41.jpg', label: 'friend two' },
    ],
    technicalReviewNotes: [
      'This run is meant to test whether the pipeline can keep realism while loosening pose formality.',
      'Background continuity and limb stability matter more here than polish alone.',
    ],
  },
  {
    exampleId: 'multi-gen-bond-01',
    scenarioFamily: 'Multi-generation family bond',
    sourceImageShape: 'two portrait references with visible age difference',
    relationshipType: 'grandparent and adult child proxy pair',
    greetingMode: 'named',
    recipientName: 'Tobi',
    memoryPromptSummary:
      'Birthday embrace between older and younger family members in a home setting with layered family warmth.',
    intendedEmotionalOutcome: 'Emotionally rich family connection with visible age contrast and no face homogenization.',
    storyPrompt:
      'Create a heartfelt birthday memory image of two family members from different generations sharing a quiet embrace in a warmly lit home, with flowers, framed family details, and a celebratory table nearby. Preserve clear age difference, natural anatomy, and believable skin texture.',
    sourceImages: [
      { url: 'https://randomuser.me/api/portraits/women/79.jpg', label: 'older generation proxy' },
      { url: 'https://randomuser.me/api/portraits/men/32.jpg', label: 'younger generation proxy' },
    ],
    technicalReviewNotes: [
      'This is the strongest age-preservation stress test in the starter pack.',
      'A pass here requires age difference to remain visible without degrading either face.',
    ],
  },
  {
    exampleId: 'memory-bridge-01',
    scenarioFamily: 'Childhood memory recreation or memory-bridge scene',
    sourceImageShape: 'two portrait references used for a present-day memory callback',
    relationshipType: 'adult siblings memory callback proxy pair',
    greetingMode: 'generic',
    memoryPromptSummary:
      'Present-day birthday recreation of a childhood beach memory with soft nostalgic cues.',
    intendedEmotionalOutcome: 'Memory specificity and gentle nostalgia without generic sepia or costume-theater vibes.',
    storyPrompt:
      'Create a premium birthday memory image that feels like two adults recreating a cherished childhood beach memory at sunset, with windswept warmth, subtle birthday details, and emotional realism. Keep both faces recognizable and avoid generic vintage nostalgia cliches or heavy filters.',
    sourceImages: [
      { url: 'https://randomuser.me/api/portraits/women/50.jpg', label: 'sibling one' },
      { url: 'https://randomuser.me/api/portraits/men/48.jpg', label: 'sibling two' },
    ],
    technicalReviewNotes: [
      'This run checks whether the pipeline can imply memory depth without defaulting to artificial nostalgia styling.',
      'Scene coherence matters more than literal childhood-age reconstruction because the live flow has only current-photo inputs.',
    ],
  },
  {
    exampleId: 'distance-reunion-01',
    scenarioFamily: 'Distance / reunion / long-gap connection',
    sourceImageShape: 'two clean portrait references',
    relationshipType: 'long-distance loved ones',
    greetingMode: 'named',
    recipientName: 'Noah',
    memoryPromptSummary:
      'Birthday reunion at a train platform arrival with relief, connection, and emotional clarity.',
    intendedEmotionalOutcome: 'Readable reunion emotion with balanced identity preservation and no uncanny compositing.',
    storyPrompt:
      'Create an emotional birthday reunion image of two loved ones meeting after a long time apart at a train station arrival, with travel details, warm evening light, and relieved affectionate body language. Keep both identities balanced and the scene grounded rather than cinematic fantasy.',
    sourceImages: [
      { url: 'https://randomuser.me/api/portraits/women/36.jpg', label: 'traveler' },
      { url: 'https://randomuser.me/api/portraits/men/59.jpg', label: 'waiting loved one' },
    ],
    technicalReviewNotes: [
      'This scenario stresses compositing coherence because the emotional story depends on believable contact and positioning.',
      'Balanced identity preservation across both people matters more than backdrop detail density.',
    ],
  },
];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toSafeSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function writeJson(filePath: string, value: unknown) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function downloadAsset(url: string, targetPath: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Asset download failed with ${response.status} for ${url}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  await writeFile(targetPath, Buffer.from(arrayBuffer));
}

function toMarkdown(results: CandidateResult[], outputDir: string) {
  const lines = [
    '# Memories Birthday Example Candidate Pack',
    '',
    `Date: ${new Date().toISOString()}`,
    '',
    '## Run summary',
    '',
    `- Output directory: \`${outputDir}\``,
    `- Pipeline version: \`${pipelineVersion}\``,
    `- Candidate count: ${results.length}`,
    `- Completed assets: ${results.filter((result) => result.outputAssetLocation).length}`,
    '',
    '## Candidate sets',
    '',
  ];

  for (const result of results) {
    lines.push(`### ${result.exampleId}`);
    lines.push('');
    lines.push(`- Scenario family: ${result.scenarioFamily}`);
    lines.push(`- Relationship type: ${result.relationshipType}`);
    lines.push(`- Greeting mode: ${result.greetingMode}`);
    lines.push(`- Recipient name: ${result.recipientName || 'generic fallback'}`);
    lines.push(`- Source image shape: ${result.sourceImageShape}`);
    lines.push(`- Intended emotional outcome: ${result.intendedEmotionalOutcome}`);
    lines.push(`- Pipeline version: \`${result.pipelineVersion}\``);
    lines.push(`- Job id: \`${result.jobId}\``);
    lines.push(`- Final asset: ${result.outputAssetLocation ? `\`${result.outputAssetLocation}\`` : 'not completed'}`);
    lines.push(
      `- Review state: quality=\`${result.qualityStatus}\`, website_clearance=\`${result.websiteClearance}\`, homepage_eligible=\`${result.homepageEligible}\`, examples_page_eligible=\`${result.examplesPageEligible}\``,
    );
    lines.push(`- Notes: ${result.evaluationNotes.join(' ')}`);
    if (result.error) {
      lines.push(`- Error: ${result.error}`);
    }
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}

async function runCandidate(definition: CandidateDefinition) {
  const created = await createMemoryJobRecord({
    email: 'cto+wes404@memories4u.local',
    clientRequestId: `wes-404-${definition.exampleId}`,
    customerName: definition.recipientName,
    storyPrompt: definition.storyPrompt,
    sourceImages: definition.sourceImages.map((image) => ({
      storage: 'remote_url' as const,
      url: image.url,
      label: image.label,
    })),
    metadata: {
      issue: 'WES-404',
      exampleId: definition.exampleId,
      scenarioFamily: definition.scenarioFamily,
      greetingMode: definition.greetingMode,
      ...(definition.recipientName ? { recipientName: definition.recipientName } : {}),
    },
  });

  await unlockMemoryJob(created.jobId, {
    paymentReference: `wes-404-${definition.exampleId}`,
    provider: 'manual',
  });

  return created;
}

async function waitForCompletion(jobId: string, timeoutMs: number, pollMs: number) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const job = await getJobForInternalUse(jobId);
    if (job.status === 'completed' || job.status === 'delivered' || job.status === 'failed') {
      return job;
    }

    await sleep(pollMs);
  }

  return getJobForInternalUse(jobId);
}

async function main() {
  loadMemoriesRuntimeEnv();

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputDir = path.join(process.cwd(), 'tmp', `wes-404-example-pack-${timestamp}`);
  await mkdir(outputDir, { recursive: true });

  const createdJobs = await Promise.all(
    candidates.map(async (candidate) => ({
      candidate,
      created: await runCandidate(candidate),
    })),
  );

  const completedJobs = await Promise.all(
    createdJobs.map(async ({ candidate, created }) => ({
      candidate,
      created,
      job: await waitForCompletion(created.jobId, 8 * 60 * 1000, 5000),
    })),
  );

  const results: CandidateResult[] = [];

  for (const { candidate, created, job } of completedJobs) {
    const localFilename = `${toSafeSlug(candidate.exampleId)}.jpg`;
    const localPath = path.join(outputDir, localFilename);
    const finalAssetUrl = job.finalAsset?.url;

    if (finalAssetUrl) {
      await downloadAsset(finalAssetUrl, localPath);
    }

    results.push({
      ...candidate,
      jobId: created.jobId,
      accessToken: created.accessToken,
      status: job.status,
      pipelineVersion,
      outputAssetLocation: finalAssetUrl ? localPath : undefined,
      previewAssetLocation: job.previewAsset?.url,
      qualityStatus: 'pending_product_review',
      websiteClearance: 'pending_product_review',
      homepageEligible: false,
      examplesPageEligible: false,
      evaluationNotes: [
        candidate.greetingMode === 'named'
          ? `Run uses named greeting coverage for ${candidate.recipientName}.`
          : 'Run uses generic birthday greeting fallback coverage with no recipient name.',
        ...candidate.technicalReviewNotes,
        finalAssetUrl
          ? 'Final asset completed and downloaded for product/QA review.'
          : 'Final asset did not complete within the script timeout and needs rerun or operator follow-up.',
      ],
      ...(job.lastError ? { error: job.lastError } : {}),
    });
  }

  await writeJson(path.join(outputDir, 'results.json'), {
    generatedAt: new Date().toISOString(),
    pipelineVersion,
    results,
  });

  await writeFile(
    path.join(outputDir, 'README.md'),
    toMarkdown(results, outputDir),
    'utf8',
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        outputDir,
        pipelineVersion,
        completed: results.filter((result) => result.outputAssetLocation).length,
        total: results.length,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(message);
  process.exit(1);
});
