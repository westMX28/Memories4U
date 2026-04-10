'use client';

import { useEffect, useState, useTransition } from 'react';
import { CheckCircle2, Clock3, CreditCard, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

const statusStages = [
  {
    title: 'Auftrag gespeichert',
    description: 'Dein Briefing liegt vor und kann jederzeit wieder geoeffnet werden.',
    matches: ['created', 'unlocked', 'queued', 'processing', 'preview_ready', 'completed', 'delivered'],
  },
  {
    title: 'Zahlung und Freigabe',
    description: 'Die Zahlung bestaetigt den Auftrag und erlaubt die weitere Verarbeitung.',
    matches: ['unlocked', 'queued', 'processing', 'preview_ready', 'completed', 'delivered'],
  },
  {
    title: 'Bearbeitung',
    description: 'Die Story wird erstellt und fuer die finale Ausgabe vorbereitet.',
    matches: ['queued', 'processing', 'preview_ready', 'completed', 'delivered'],
  },
  {
    title: 'Finale Auslieferung',
    description: 'Sobald das Asset bereit ist, erscheint hier die finale Bereitstellung oder Zustellung.',
    matches: ['completed', 'delivered'],
  },
];

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
        <CardHeader className="space-y-4">
          <Badge className="w-fit">status lookup</Badge>
          <div className="space-y-2">
            <CardTitle className="max-w-[15ch] text-[clamp(2rem,4vw,3rem)]">Return to an existing order in seconds.</CardTitle>
            <CardDescription className="max-w-[48ch] text-base">
              A clearer shell around the same contract: job id, access token, status refresh, and checkout recovery when payment is still open.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form className="intake-form" onSubmit={handleSubmit}>
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

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[24px] border border-sky-100 bg-sky-50/70 p-4 text-sm leading-6 text-slate-700">
              <ShieldCheck className="mb-3 size-4 text-sky-700" />
              private identifiers only
            </div>
            <div className="rounded-[24px] border border-sky-100 bg-white p-4 text-sm leading-6 text-slate-700">
              <Clock3 className="mb-3 size-4 text-sky-700" />
              auto-refresh during active processing
            </div>
            <div className="rounded-[24px] border border-sky-100 bg-white p-4 text-sm leading-6 text-slate-700">
              <CreditCard className="mb-3 size-4 text-sky-700" />
              checkout recovery when payment is open
            </div>
          </div>
        </CardContent>
      </Card>

      {recentJobs.length > 0 ? (
        <Card className="recent-jobs-card border-white/90 bg-white/82">
          <CardHeader>
            <Badge className="w-fit" variant="secondary">recent orders</Badge>
            <CardTitle>You can reopen a recent order directly.</CardTitle>
          </CardHeader>
          <CardContent className="recent-jobs-list">
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
          </CardContent>
        </Card>
      ) : null}

      {result ? (
        <Card className="status-detail border-white/90 bg-white/82">
          <CardContent className="space-y-6 p-6 sm:p-8">
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

            <div className="grid gap-4 lg:grid-cols-2">
              {statusStages.map((stage) => {
                const active = stage.matches.includes(result.status);
                return (
                  <div
                    key={stage.title}
                    className={`rounded-[26px] border p-5 shadow-[0_16px_38px_rgba(148,163,184,0.12)] ${
                      active
                        ? 'border-sky-200 bg-[linear-gradient(180deg,rgba(241,248,255,0.96),rgba(230,241,255,0.92))]'
                        : 'border-white/90 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`mt-1 inline-flex size-8 items-center justify-center rounded-full ${active ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <CheckCircle2 className="size-4" />
                      </span>
                      <div>
                        <strong className="text-slate-900">{stage.title}</strong>
                        <p className="mb-0 mt-2 text-sm leading-7 text-slate-600">
                          {stage.title === 'Zahlung und Freigabe'
                            ? result.unlocked
                              ? 'Die Zahlung ist bestaetigt und der Auftrag darf weiterlaufen.'
                              : 'Wir warten noch auf eine erfolgreiche Zahlung.'
                            : stage.title === 'Finale Auslieferung'
                              ? result.delivery
                                ? `An ${result.delivery.recipient} gesendet.`
                                : stage.description
                              : stage.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="inset-card">
                <CardHeader>
                  <Badge className="w-fit" variant="secondary">next step</Badge>
                  <CardTitle>{activeStatus?.nextStep}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {result.finalAsset ? (
                    <div className="btn-row mt-0">
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
                <CardHeader>
                  <Badge className="w-fit" variant="secondary">current info</Badge>
                  <CardTitle>Zuletzt aktualisiert</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="copy">{new Date(result.updatedAt).toLocaleString('de-DE')}</p>
                  <p className="copy mb-0">
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
