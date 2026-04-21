import test from 'node:test';
import assert from 'node:assert/strict';

import type { MemoryStatusResponse } from '@/lib/memories/contracts';
import {
  getStatusAssetActionPresentation,
  getStatusInfoNote,
  getSuccessAssetPresentation,
  getSuccessLeadCopy,
  getSuccessNextStepCopy,
} from '@/lib/memories/status-presentation';

function makeStatusResponse(
  overrides: Partial<MemoryStatusResponse>,
): MemoryStatusResponse {
  return {
    jobId: 'job_123',
    status: 'queued',
    unlocked: true,
    updatedAt: '2026-04-13T20:00:00.000Z',
    ...overrides,
  };
}

test('success presentation shows preview as in-progress rather than delivered', () => {
  const previewReady = makeStatusResponse({
    status: 'preview_ready',
    previewAsset: {
      provider: 'manual',
      url: 'https://example.com/preview.jpg',
    },
  });

  const lead = getSuccessLeadCopy(true, previewReady);
  const asset = getSuccessAssetPresentation(previewReady);
  const nextStep = getSuccessNextStepCopy(true, previewReady);

  assert.match(lead, /in Bearbeitung/i);
  assert.doesNotMatch(lead, /zugestellt/i);
  assert.equal(asset?.variant, 'preview');
  assert.equal(asset?.ctaLabel, 'Vorschau öffnen');
  assert.equal(asset?.badge, 'In Bearbeitung');
  assert.match(asset?.detail ?? '', /Zwischenstand|Bearbeitung/i);
  assert.match(nextStep, /Bearbeitung/i);
  assert.doesNotMatch(nextStep, /zugestellt/i);
});

test('success presentation keeps completed distinct from delivered', () => {
  const completed = makeStatusResponse({
    status: 'completed',
    finalAsset: {
      provider: 'manual',
      url: 'https://example.com/final.jpg',
    },
  });

  const lead = getSuccessLeadCopy(true, completed);
  const asset = getSuccessAssetPresentation(completed);
  const nextStep = getSuccessNextStepCopy(true, completed);

  assert.match(lead, /finale Story.*verfügbar/i);
  assert.doesNotMatch(lead, /zugestellt/i);
  assert.equal(asset?.variant, 'final');
  assert.equal(asset?.badge, 'Fertig');
  assert.match(asset?.detail ?? '', /Zustellbestätigung.*noch nicht/i);
  assert.match(nextStep, /Zustellbestätigung.*nachlaufen/i);
});

test('success presentation shows delivered only when delivery is recorded', () => {
  const delivered = makeStatusResponse({
    status: 'delivered',
    finalAsset: {
      provider: 'manual',
      url: 'https://example.com/final.jpg',
    },
    delivery: {
      channel: 'email',
      provider: 'manual',
      recipient: 'customer@example.com',
      deliveredAt: '2026-04-13T20:10:00.000Z',
    },
  });

  const lead = getSuccessLeadCopy(true, delivered);
  const asset = getSuccessAssetPresentation(delivered);
  const nextStep = getSuccessNextStepCopy(true, delivered);

  assert.match(lead, /verfügbar/i);
  assert.match(lead, /Zustellung.*erfasst/i);
  assert.equal(asset?.badge, 'Fertig');
  assert.match(asset?.detail ?? '', /customer@example.com/);
  assert.match(nextStep, /zugestellt/i);
});

test('status action presentation only exposes final download for completed or delivered', () => {
  const previewReady = getStatusAssetActionPresentation(
    makeStatusResponse({
      status: 'preview_ready',
      previewAsset: {
        provider: 'manual',
        url: 'https://example.com/preview.jpg',
      },
    }),
  );
  const completed = getStatusAssetActionPresentation(
    makeStatusResponse({
      status: 'completed',
      finalAsset: {
        provider: 'manual',
        url: 'https://example.com/final.jpg',
      },
    }),
  );
  const delivered = getStatusAssetActionPresentation(
    makeStatusResponse({
      status: 'delivered',
      finalAsset: {
        provider: 'manual',
        url: 'https://example.com/final.jpg',
      },
      delivery: {
        channel: 'email',
        provider: 'manual',
        recipient: 'customer@example.com',
        deliveredAt: '2026-04-13T20:10:00.000Z',
      },
    }),
  );

  assert.equal(previewReady?.primaryKind, 'preview');
  assert.equal(previewReady?.primaryDownload, false);
  assert.equal(previewReady?.badge, 'In Bearbeitung');
  assert.equal(completed?.primaryKind, 'final-download');
  assert.equal(completed?.badge, 'Fertig');
  assert.match(completed?.detail ?? '', /getrennt erfasst/i);
  assert.equal(delivered?.badge, 'Fertig');
  assert.match(delivered?.detail ?? '', /customer@example.com/);
});

test('status info note keeps completed and delivered separate', () => {
  const completedNote = getStatusInfoNote(
    makeStatusResponse({
      status: 'completed',
      finalAsset: {
        provider: 'manual',
        url: 'https://example.com/final.jpg',
      },
    }),
  );
  const deliveredNote = getStatusInfoNote(
    makeStatusResponse({
      status: 'delivered',
      finalAsset: {
        provider: 'manual',
        url: 'https://example.com/final.jpg',
      },
      delivery: {
        channel: 'email',
        provider: 'manual',
        recipient: 'customer@example.com',
        deliveredAt: '2026-04-13T20:10:00.000Z',
      },
    }),
  );

  assert.match(completedNote ?? '', /noch nicht erfasst/i);
  assert.match(deliveredNote ?? '', /Zugestellt an customer@example.com/i);
});
