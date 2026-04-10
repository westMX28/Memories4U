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
  { badge: string; title: string; detail: string; nextStep: string }
> = {
  created: {
    badge: 'zahlung offen',
    title: 'Dein Auftrag ist gespeichert, aber noch nicht bezahlt.',
    detail: 'Die Bearbeitung startet erst, sobald die Zahlung erfolgreich abgeschlossen wurde.',
    nextStep: 'Wenn du die Bestellung fortsetzen willst, oeffne den Checkout erneut.',
  },
  unlocked: {
    badge: 'bezahlt',
    title: 'Die Zahlung ist bestaetigt.',
    detail: 'Dein Auftrag ist freigegeben und wird jetzt fuer die Bearbeitung vorbereitet.',
    nextStep: 'Im Moment musst du nichts tun.',
  },
  queued: {
    badge: 'eingeplant',
    title: 'Dein Auftrag ist in der Warteschlange.',
    detail: 'Wir haben alles, was wir brauchen, und nehmen deine Story als Naechstes in die Bearbeitung.',
    nextStep: 'Du musst aktuell nichts nachreichen.',
  },
  processing: {
    badge: 'in bearbeitung',
    title: 'Deine Story wird gerade erstellt.',
    detail: 'Die persoenliche Ausarbeitung laeuft. Sobald sie fertig ist, aktualisiert sich diese Seite automatisch.',
    nextStep: 'Im Moment musst du nichts tun.',
  },
  preview_ready: {
    badge: 'endspurt',
    title: 'Deine Story ist im finalen Check.',
    detail: 'Die Bearbeitung ist fast abgeschlossen und wir bereiten die finale Version fuer die Zustellung vor.',
    nextStep: 'Du musst aktuell nichts tun.',
  },
  completed: {
    badge: 'fertig',
    title: 'Die finale Story ist fertig.',
    detail: 'Die Zustellung ist als naechster Schritt vorgesehen. Wenn dein Link bereits aktiv ist, kannst du die finale Version hier oeffnen.',
    nextStep: 'Pruefe spaeter noch einmal den Zustellstatus, falls noch keine E-Mail angekommen ist.',
  },
  delivered: {
    badge: 'zugestellt',
    title: 'Deine Story wurde zugestellt.',
    detail: 'Die finale Version wurde an die hinterlegte E-Mail gesendet.',
    nextStep: 'Wenn du sie dort nicht findest, pruefe Spam oder oeffne die finale Version hier erneut.',
  },
  failed: {
    badge: 'verzoegert',
    title: 'Die Bearbeitung ist gerade unterbrochen.',
    detail: 'Etwas ist in der Verarbeitung fehlgeschlagen. Wir muessen die Story erneut anstossen oder pruefen.',
    nextStep: 'Im Moment musst du nichts neu bestellen. Wenn der Status laenger stehen bleibt, melde dich mit deinem privaten Statuslink.',
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

function formatRecentJobLabel(job: RecentMemoryJob) {
  if (job.email) {
    return job.email;
  }

  return `Zuletzt aktualisiert ${new Date(job.updatedAt).toLocaleString('de-DE')}`;
}

function getStoredJobEmail(jobId: string) {
  return readRecentJobs().find((job) => job.jobId === jobId)?.email;
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
      email: getStoredJobEmail(data.jobId),
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
                <span>Private Auftragsnummer</span>
                <Input
                  required
                  value={jobId}
                  onChange={(event) => setJobId(event.target.value)}
                  placeholder="uuid..."
                />
              </label>

              <label className="field">
                <span>Privater Zugriffscode</span>
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
                    <p>{formatRecentJobLabel(recentJob)}</p>
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
                {activeStatus?.badge}
              </Badge>
            </div>

            <div className="status-board">
              <div className={`status-stage ${result.status === 'created' ? 'status-stage-active' : ''}`}>
                <span className="status-dot" />
                <div>
                  <strong>Auftrag gespeichert</strong>
                  <p>Dein Briefing liegt vor und kann jederzeit wieder geoeffnet werden.</p>
                </div>
              </div>
              <div
                className={`status-stage ${['unlocked', 'queued', 'processing', 'preview_ready', 'completed', 'delivered'].includes(result.status) ? 'status-stage-active' : ''}`}
              >
                <span className="status-dot" />
                <div>
                  <strong>Zahlung und Freigabe</strong>
                  <p>{result.unlocked ? 'Die Zahlung ist bestaetigt und der Auftrag darf weiterlaufen.' : 'Wir warten noch auf eine erfolgreiche Zahlung.'}</p>
                </div>
              </div>
              <div
                className={`status-stage ${['preview_ready', 'completed', 'delivered'].includes(result.status) ? 'status-stage-active' : ''}`}
              >
                <span className="status-dot" />
                <div>
                  <strong>Bearbeitung abgeschlossen</strong>
                  <p>{result.finalAsset ? 'Die finale Version liegt bereits bereit.' : 'Hier erscheint der Abschluss, sobald die Story fertig ist.'}</p>
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
                  <div className="eyebrow">naechster schritt</div>
                  <p className="copy">{activeStatus?.nextStep}</p>
                  {result.finalAsset ? (
                    <div className="btn-row">
                      <Button asChild variant="secondary">
                        <a href={result.finalAsset.url} target="_blank" rel="noreferrer">
                          Finale Story oeffnen
                        </a>
                      </Button>
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              <Card className="inset-card">
                <CardContent className="p-6">
                  <div className="eyebrow">aktuelle info</div>
                  <p className="copy">Zuletzt aktualisiert: {new Date(result.updatedAt).toLocaleString('de-DE')}</p>
                  <p className="copy">
                    Hinweis: {result.lastError || (result.delivery ? `Zustellung an ${result.delivery.recipient}.` : 'Im Moment gibt es nichts Weiteres fuer dich zu tun.')}
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
