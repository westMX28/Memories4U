'use client';

import { useEffect, useState, useTransition } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { MemoryStatusResponse } from '@/lib/memories/contracts';
import {
  readRecentJobs,
  storeRecentJob,
  type RecentMemoryJob,
} from '@/lib/memories/recent-jobs';

const statusCopy: Record<
  MemoryStatusResponse['status'],
  { title: string; detail: string }
> = {
  created: {
    title: 'Bestellung eingegangen',
    detail: 'Alles ist gespeichert und wartet nur noch auf den naechsten Schritt.',
  },
  unlocked: {
    title: 'Bezahlt und freigegeben',
    detail: 'Deine Story darf jetzt in die eigentliche Gestaltung gehen.',
  },
  queued: {
    title: 'In Vorbereitung',
    detail: 'Deine Bestellung ist eingeplant und kommt als Naechstes an die Reihe.',
  },
  processing: {
    title: 'In Gestaltung',
    detail: 'Wir setzen den Moment gerade in deine Story um.',
  },
  preview_ready: {
    title: 'Fast fertig',
    detail: 'Es gibt bereits eine Vorschau und die finale Version ist nicht mehr weit.',
  },
  completed: {
    title: 'Bereit zur Zustellung',
    detail: 'Die finale Version ist fertig und wartet nur noch auf die Auslieferung.',
  },
  delivered: {
    title: 'Verschickt',
    detail: 'Deine Story wurde an die hinterlegte E-Mail gesendet.',
  },
  failed: {
    title: 'Wir schauen noch einmal drauf',
    detail: 'Etwas ist nicht sauber durchgelaufen. Wir muessen die Story noch einmal pruefen.',
  },
};

type StatusLookupProps = {
  initialJobId?: string;
  initialAccessToken?: string;
};

function isMemoryStatusResponse(value: unknown): value is MemoryStatusResponse {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.jobId === 'string' &&
    typeof candidate.status === 'string' &&
    typeof candidate.unlocked === 'boolean' &&
    typeof candidate.updatedAt === 'string'
  );
}

export function StatusLookup({
  initialJobId = '',
  initialAccessToken = '',
}: StatusLookupProps) {
  const [jobId, setJobId] = useState(initialJobId);
  const [accessToken, setAccessToken] = useState(initialAccessToken);
  const [recentJobs, setRecentJobs] = useState<RecentMemoryJob[]>([]);
  const [result, setResult] = useState<MemoryStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isCheckoutPending, startCheckoutTransition] = useTransition();

  async function loadStatus(nextJobId: string, nextAccessToken: string) {
    setError(null);

    const query = new URLSearchParams({ accessToken: nextAccessToken });
    const response = await fetch(`/api/memories/${encodeURIComponent(nextJobId)}/status?${query.toString()}`, {
      headers: {
        'x-memories-access-token': nextAccessToken,
      },
      cache: 'no-store',
    });

    const data = (await response.json()) as unknown;
    if (!response.ok) {
      const message =
        data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
          ? data.error
          : 'Status request failed.';
      throw new Error(message);
    }

    if (!isMemoryStatusResponse(data)) {
      throw new Error('Status response was malformed.');
    }

    storeRecentJob({
      jobId: data.jobId,
      accessToken: nextAccessToken,
      status: data.status,
      updatedAt: data.updatedAt,
    });
    setRecentJobs(readRecentJobs());
    setResult(data);
  }

  function refresh(nextJobId = jobId, nextAccessToken = accessToken) {
    startTransition(async () => {
      try {
        await loadStatus(nextJobId, nextAccessToken);
      } catch (statusError) {
        setResult(null);
        setError(statusError instanceof Error ? statusError.message : 'Status request failed.');
      }
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    refresh();
  }

  function handleCheckout() {
    setCheckoutError(null);

    startCheckoutTransition(async () => {
      try {
        const response = await fetch(`/api/memories/${encodeURIComponent(jobId)}/checkout`, {
          method: 'POST',
          headers: {
            'x-memories-access-token': accessToken,
          },
        });

        const data = (await response.json()) as unknown;
        if (!response.ok) {
          const message =
            data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
              ? data.error
              : 'Checkout request failed.';
          throw new Error(message);
        }

        if (
          !data ||
          typeof data !== 'object' ||
          !('checkoutUrl' in data) ||
          typeof data.checkoutUrl !== 'string'
        ) {
          throw new Error('Checkout response was missing redirect data.');
        }

        window.location.assign(data.checkoutUrl);
      } catch (checkoutRequestError) {
        setCheckoutError(
          checkoutRequestError instanceof Error
            ? checkoutRequestError.message
            : 'Checkout request failed.',
        );
      }
    });
  }

  useEffect(() => {
    setRecentJobs(readRecentJobs());
  }, []);

  useEffect(() => {
    if (!initialJobId || !initialAccessToken) {
      return;
    }

    refresh(initialJobId, initialAccessToken);
  }, [initialAccessToken, initialJobId]);

  useEffect(() => {
    if (!result || result.status === 'delivered' || result.status === 'failed') {
      return;
    }

    const intervalId = window.setInterval(() => {
      refresh();
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, [result, jobId, accessToken]);

  const activeStatus = result ? statusCopy[result.status] : null;

  function loadRecentJob(job: RecentMemoryJob) {
    setJobId(job.jobId);
    setAccessToken(job.accessToken);
    refresh(job.jobId, job.accessToken);
  }

  return (
    <div className="stack">
      <Card className="border-white/90 bg-white/82">
        <CardContent className="p-6 sm:p-8">
          <form className="intake-form" onSubmit={handleSubmit}>
            <div className="eyebrow">bestellung finden</div>
            <h3>Finde deine Bestellung in wenigen Sekunden wieder.</h3>
            <p className="copy">
              Nach erfolgreichem Laden aktualisiert sich der Fortschritt automatisch im Hintergrund.
            </p>

            <div className="form-grid">
              <label className="field">
                <span>Bestellnummer</span>
                <Input
                  required
                  value={jobId}
                  onChange={(event) => setJobId(event.target.value)}
                  placeholder="uuid..."
                />
              </label>

              <label className="field">
                <span>Zugriffscode</span>
                <Input
                  type="password"
                  required
                  value={accessToken}
                  onChange={(event) => setAccessToken(event.target.value)}
                  placeholder="token..."
                />
              </label>
            </div>

            {error ? <p className="form-error">{error}</p> : null}
            {checkoutError ? <p className="form-error">{checkoutError}</p> : null}

            <div className="btn-row">
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Aktualisiere...' : 'Status laden'}
              </Button>
              {result?.status === 'created' ? (
                <Button
                  variant="secondary"
                  type="button"
                  disabled={isCheckoutPending}
                  onClick={handleCheckout}
                >
                  {isCheckoutPending ? 'Checkout wird geoeffnet...' : 'Bezahlung abschliessen'}
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      {recentJobs.length > 0 ? (
        <Card className="recent-jobs-card border-white/90 bg-white/78">
          <CardContent className="p-6">
            <div className="recent-jobs-head">
              <div>
                <div className="eyebrow">letzte bestellungen</div>
                <h3>Du kannst eine kuerzlich gestartete Bestellung direkt wieder aufrufen.</h3>
              </div>
            </div>

            <div className="recent-jobs-list">
              {recentJobs.map((recentJob) => (
                <button
                  key={recentJob.jobId}
                  className="recent-job"
                  type="button"
                  onClick={() => loadRecentJob(recentJob)}
                >
                  <div>
                    <strong>{statusCopy[recentJob.status || 'created'].title}</strong>
                    <p>Bestellnummer {recentJob.jobId}</p>
                  </div>
                  <span>{new Date(recentJob.updatedAt).toLocaleString('de-DE')}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {result ? (
        <Card className="status-detail border-white/90 bg-white/82">
          <CardContent className="p-6 sm:p-8">
            <div className="status-detail-head">
              <div>
                <div className="eyebrow">aktueller stand</div>
                <h3>{activeStatus?.title}</h3>
                <p className="copy">{activeStatus?.detail}</p>
              </div>
              <Badge className="status-badge justify-center rounded-full px-5 py-3 tracking-[0.18em]">
                {result.status}
              </Badge>
            </div>

            <div className="status-board">
              <div className={`status-stage ${result.status === 'created' ? 'status-stage-active' : ''}`}>
                <span className="status-dot" />
                <div>
                  <strong>Bestellung gesichert</strong>
                  <p>Bestellnummer {result.jobId}</p>
                </div>
              </div>
              <div
                className={`status-stage ${['unlocked', 'queued', 'processing', 'preview_ready', 'completed', 'delivered'].includes(result.status) ? 'status-stage-active' : ''}`}
              >
                <span className="status-dot" />
                <div>
                  <strong>Gestaltung freigegeben</strong>
                  <p>{result.unlocked ? 'Die Bearbeitung darf jetzt starten.' : 'Wir warten noch auf die Freigabe.'}</p>
                </div>
              </div>
              <div
                className={`status-stage ${['preview_ready', 'completed', 'delivered'].includes(result.status) ? 'status-stage-active' : ''}`}
              >
                <span className="status-dot" />
                <div>
                  <strong>Story fast oder ganz fertig</strong>
                  <p>{result.finalAsset ? 'Deine finale Version liegt bereits vor.' : result.previewAsset ? 'Es gibt schon eine Vorschau deiner Story.' : 'Hier erscheint spaeter der naechste sichtbare Fortschritt.'}</p>
                </div>
              </div>
              <div className={`status-stage ${result.status === 'delivered' ? 'status-stage-active' : ''}`}>
                <span className="status-dot" />
                <div>
                  <strong>Auslieferung</strong>
                  <p>{result.delivery ? `An ${result.delivery.recipient} gesendet.` : 'Noch nicht zugestellt.'}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-2 section-top">
              <Card className="inset-card">
                <CardContent className="p-6">
                  <div className="eyebrow">deine story</div>
                  <p className="copy">
                    Vorschau: {result.previewAsset?.url || 'noch nicht vorhanden'}
                  </p>
                  <p className="copy">
                    Finale Version: {result.finalAsset?.url || 'noch nicht vorhanden'}
                  </p>
                </CardContent>
              </Card>

              <Card className="inset-card">
                <CardContent className="p-6">
                  <div className="eyebrow">aktuelle info</div>
                  <p className="copy">Zuletzt aktualisiert: {new Date(result.updatedAt).toLocaleString('de-DE')}</p>
                  <p className="copy">Hinweis: {result.lastError || 'Im Moment gibt es nichts Weiteres fuer dich zu tun.'}</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
