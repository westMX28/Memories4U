'use client';

import { useEffect, useState, useTransition } from 'react';
import {
  ArrowDownToLine,
  CheckCircle2,
  Clock3,
  CreditCard,
  ExternalLink,
  Eye,
  ShieldCheck,
} from 'lucide-react';
import { MemoryAssetPreview } from '@/components/MemoryAssetPreview';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { MemoryStatus, MemoryStatusResponse } from '@/lib/memories/contracts';
import {
  readRecentJobs,
  storeRecentJob,
  type RecentMemoryJob,
} from '@/lib/memories/recent-jobs';

type StatusLookupProps = {
  initialJobId?: string;
  initialAccessToken?: string;
  checkoutCancelled?: boolean;
};

type StageDefinition = {
  title: string;
  description: string;
  matches: MemoryStatus[];
};

type StatusContent = {
  badge: string;
  title: string;
  detail: string;
  nextStepTitle: string;
  nextStepDetail: string;
  infoNote: string;
};

type ActionPanel = {
  badge: string;
  title: string;
  detail: string;
  primaryLabel: string;
  primaryHref?: string;
  primaryOnClick?: () => void;
  primaryDownload?: boolean;
  primaryIcon: typeof Eye;
  secondaryLabel?: string;
  secondaryHref?: string;
  secondaryDownload?: boolean;
  secondaryIcon?: typeof Eye;
};

const statusContent: Record<MemoryStatus, StatusContent> = {
  created: {
    badge: 'Zahlung erforderlich',
    title: 'Dein Auftrag ist gespeichert. Zahlung vollendet es.',
    detail: 'Alles, was du erzählt hast, ist sicher hier. Wenn du bereit bist zu zahlen, wird deine Story sofort in Produktion gehen.',
    nextStepTitle: 'Zahlung abschließen.',
    nextStepDetail: 'Kehre zum Checkout zurück und bezahle mit diesem privaten Link. Dein Auftrag wartet genau dort, wo du ihn verlassen hast.',
    infoNote: 'Dieser Link bleibt gültig, bis du die Zahlung abschließt.',
  },
  unlocked: {
    badge: 'Zahlung bestätigt',
    title: 'Bezahlt. Deine Story wird jetzt erstellt.',
    detail: 'Die Zahlung ist erfolgreich, und dein Auftrag ist jetzt in Produktion.',
    nextStepTitle: 'Vertrau dem Prozess.',
    nextStepDetail: 'Diese Seite wird sich von selbst aktualisieren, während deine Story entsteht. Du musst nichts weiter tun—nur hierher zurückkehren, um Fortschritt zu sehen.',
    infoNote: 'Dein privater Link bleibt dein permanenter Zugang.',
  },
  queued: {
    badge: 'In der Warteschlange',
    title: 'Dein Auftrag steht in der Schlange. Er wird bald bearbeitet.',
    detail: 'Alle deine Bilder und Notizen sind da. Jetzt wartet dein Auftrag auf seinen Produktionsslot.',
    nextStepTitle: 'Es geht weiter. Komm einfach bald wieder vorbei.',
    nextStepDetail: 'Diese Seite zeigt dir den Moment, in dem deine Story in Produktion geht. Lesezeichen speichern, um zurückzukommen.',
    infoNote: 'Die Story-Erstellung beginnt bald. Diese Seite aktualisiert sich laufend.',
  },
  processing: {
    badge: 'In Erstellung',
    title: 'Deine Story entsteht gerade jetzt.',
    detail: 'Aktiv in Produktion. Diese Seite aktualisiert sich von allein, während wir daran arbeiten.',
    nextStepTitle: 'Schau vorbei und verfolge den Fortschritt.',
    nextStepDetail: 'Die Seite wird sich aktualisieren, während die Story entsteht. Kein Grund, ständig zu refreshen—wir kümmern uns um den Rest.',
    infoNote: 'Die Story wird gerade aktiv erstellt.',
  },
  preview_ready: {
    badge: 'Fast fertig',
    title: 'Deine Story nimmt Form an. Eine Vorschau wartet.',
    detail: 'Die Story ist unterwegs zur Finalisierung. Wenn eine Vorschau verfügbar ist, kannst du sie hier schon sehen.',
    nextStepTitle: 'Schau dir die Vorschau an, wenn sie verfügbar ist.',
    nextStepDetail: 'Die Vorschau gibt dir das Gefühl, dass es funktioniert. Die finale Version wird gleich danach folgen.',
    infoNote: 'Wenn eine Vorschau verfügbar ist, wird sie unten angezeigt.',
  },
  completed: {
    badge: 'Fertig',
    title: 'Deine Story ist fertig.',
    detail: 'Das finale Asset ist bereit. Es wartet auf dieser privaten Seite auf dich.',
    nextStepTitle: 'Dein Asset ist bereit zum Herunterladen oder Anschauen.',
    nextStepDetail: 'Du kannst es jederzeit von hier aus abrufen. Kein Durchsuchen von E-Mails nötig—es bleibt hier, privat und zugänglich.',
    infoNote: 'Das finale Asset wird unten angezeigt und bleibt über diesen Link verfügbar.',
  },
  delivered: {
    badge: 'Zugestellt',
    title: 'Deine Story ist zugestellt. Sie bleibt hier bei dir.',
    detail: 'Die Zustellung ist erfasst. Das finale Asset bleibt über diese private Seite erreichbar.',
    nextStepTitle: 'Nutze das Asset hier oben oder über deine E-Mail.',
    nextStepDetail: 'Egal wie du es brauchst—hier auf dieser Seite oder in deiner E-Mail. Es gibt mehrere Wege, es zu bekommen.',
    infoNote: 'Das finale Asset ist verfügbar und bleibt auf dieser Seite erreichbar.',
  },
  failed: {
    badge: 'Benötigt Unterstützung',
    title: 'Etwas in der Produktion braucht Aufmerksamkeit.',
    detail: 'Bitte lege keinen neuen Auftrag an. Wir schauen uns das an.',
    nextStepTitle: 'Behalte diesen Link. Er ist dein Zugang für den Support.',
    nextStepDetail: 'Nutze diesen privaten Link, wenn du mit uns Kontakt aufnimmst. So können wir deinen Auftrag genau sehen und helfen.',
    infoNote: 'Dein Auftrag wartet auf Prüfung. Dieser Link bleibt dein Kanal zum Team.',
  },
};

const statusStages: StageDefinition[] = [
  {
    title: 'Auftrag gespeichert',
    description: 'Deine Auftragsdaten sind gespeichert und können über diese private Seite fortgesetzt werden.',
    matches: ['created', 'unlocked', 'queued', 'processing', 'preview_ready', 'completed', 'delivered', 'failed'],
  },
  {
    title: 'Bezahlt und freigegeben',
    description: 'Die Zahlung ist bestätigt und der Auftrag kann in die Produktion übergehen.',
    matches: ['unlocked', 'queued', 'processing', 'preview_ready', 'completed', 'delivered', 'failed'],
  },
  {
    title: 'Story-Erstellung',
    description: 'Die Story ist in der Warteschlange oder in Produktion, mit Vorschau sobald verfügbar.',
    matches: ['queued', 'processing', 'preview_ready', 'completed', 'delivered', 'failed'],
  },
  {
    title: 'Bereit und zugestellt',
    description: 'Die finale Story wird zuerst bereit, danach wird die Zustellung erfasst.',
    matches: ['completed', 'delivered'],
  },
];

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

  return `Aktualisiert ${new Date(job.updatedAt).toLocaleString('de-DE')}`;
}

function getStoredJobEmail(jobId: string) {
  return readRecentJobs().find((job) => job.jobId === jobId)?.email;
}

function getStageDescription(stage: StageDefinition, result: MemoryStatusResponse) {
  switch (stage.title) {
    case 'Auftrag gespeichert':
      return 'Deine Erinnerungen und Gedanken sind gespeichert. Sie warten hier, privat und sicher.';
    case 'Bezahlt und freigegeben':
      return result.unlocked
        ? 'Zahlung erfolgreich. Die Story ist jetzt in Produktion.'
        : 'Zahlung ausstehend. Sobald bezahlt, geht alles in Produktion.';
    case 'Story-Erstellung':
      if (result.status === 'queued') {
        return 'Dein Auftrag wartet auf seinen Produktionsslot. Es geht bald los.';
      }

      if (result.status === 'processing') {
        return 'Die Story wird gerade erstellt. Sie nimmt Gestalt an.';
      }

      if (result.status === 'preview_ready') {
        return 'Fast fertig. Die Vorschau ist verfügbar, die finale Version kommt in Kürze.';
      }

      if (result.status === 'failed') {
        return 'Etwas braucht Aufmerksamkeit. Wir schauen uns das an.';
      }

      return stage.description;
    case 'Bereit und zugestellt':
      if (result.status === 'completed') {
        return 'Die Story ist bereit. Sie wartet auf dieser privaten Seite auf dich.';
      }

      if (result.status === 'delivered') {
        return result.delivery
          ? `Zugestellt an ${result.delivery.recipient}. Auch hier verfügbar.`
          : 'Zugestellt. Die Story bleibt auf dieser privaten Seite erreichbar.';
      }

      return 'Diese Phase wird erreicht, sobald die Story fertig ist.';
    default:
      return stage.description;
  }
}

function getActionPanel(
  result: MemoryStatusResponse,
  onCheckout: () => void,
): ActionPanel | null {
  const content = statusContent[result.status];

  if (result.status === 'created') {
    return {
      badge: 'Zahlung erforderlich',
      title: 'Zahle jetzt, um deine Story zu starten.',
      detail: 'Dein Auftrag ist gespeichert und wartet. Die Zahlung beginnt die Produktion sofort.',
      primaryLabel: 'Zum Zahlen',
      primaryOnClick: onCheckout,
      primaryIcon: CreditCard,
    };
  }

  if (result.status === 'preview_ready' && result.previewAsset) {
    return {
      badge: 'Vorschau bereit',
      title: 'Deine Story nimmt Gestalt an. Schau dir die Vorschau an.',
      detail: 'Die Vorschau ist verfügbar, während die finale Version finalisiert wird. Das sollte bald folgen.',
      primaryLabel: 'Vorschau ansehen',
      primaryHref: result.previewAsset.url,
      primaryIcon: Eye,
    };
  }

  if ((result.status === 'completed' || result.status === 'delivered') && result.finalAsset) {
    return {
      badge: result.status === 'delivered' ? 'Zugestellt' : 'Fertig',
      title: 'Deine Story ist bereit.',
      detail:
        result.status === 'delivered' && result.delivery
          ? `Zugestellt an ${result.delivery.recipient}. Nutze den Link unten, um deine Story jederzeit zu öffnen oder herunterzuladen.`
          : 'Die finale Story ist bereit zum Herunterladen oder Anschauen.',
      primaryLabel: 'Herunterladen',
      primaryHref: result.finalAsset.url,
      primaryDownload: true,
      primaryIcon: ArrowDownToLine,
      secondaryLabel: 'Öffnen',
      secondaryHref: result.finalAsset.url,
      secondaryDownload: false,
      secondaryIcon: ExternalLink,
    };
  }

  return null;
}

function getCurrentInfoNote(result: MemoryStatusResponse) {
  if (result.status === 'delivered' && result.delivery) {
    return `Zugestellt an ${result.delivery.recipient} am ${new Date(result.delivery.deliveredAt).toLocaleString('de-DE')}.`;
  }

  if ((result.status === 'completed' || result.status === 'delivered') && result.finalAsset) {
    return 'Das finale Asset ist über diese Seite verfügbar.';
  }

  if (result.status === 'preview_ready' && result.previewAsset) {
    return 'Eine Vorschau ist verfügbar, während die finale Version noch finalisiert wird.';
  }

  return statusContent[result.status].infoNote;
}

function renderActionButton(actionPanel: ActionPanel, isCheckoutPending: boolean) {
  if (actionPanel.primaryOnClick) {
    return (
      <Button type="button" onClick={actionPanel.primaryOnClick} disabled={isCheckoutPending}>
        <actionPanel.primaryIcon className="size-4" />
        {isCheckoutPending ? 'Checkout wird geöffnet...' : actionPanel.primaryLabel}
      </Button>
    );
  }

  if (actionPanel.primaryHref) {
    return (
      <Button asChild>
        <a
          href={actionPanel.primaryHref}
          target="_blank"
          rel="noreferrer"
          download={actionPanel.primaryDownload ? '' : undefined}
        >
          <actionPanel.primaryIcon className="size-4" />
          {actionPanel.primaryLabel}
        </a>
      </Button>
    );
  }

  return null;
}

export function StatusLookup({
  initialJobId = '',
  initialAccessToken = '',
  checkoutCancelled = false,
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
    const response = await fetch(
      `/api/memories/${encodeURIComponent(nextJobId)}/status?${query.toString()}`,
      {
        headers: {
          'x-memories-access-token': nextAccessToken,
        },
        cache: 'no-store',
      },
    );

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

  const activeStatus = result ? statusContent[result.status] : null;
  const actionPanel = result ? getActionPanel(result, handleCheckout) : null;
  const previewAssetVisible = Boolean(result?.previewAsset);
  const finalAssetVisible = Boolean(
    result?.finalAsset && (result.status === 'completed' || result.status === 'delivered'),
  );

  function loadRecentJob(job: RecentMemoryJob) {
    setJobId(job.jobId);
    setAccessToken(job.accessToken);
    refresh(job.jobId, job.accessToken);
  }

  return (
    <div className="stack">
      <Card className="border-white/90 bg-white/82">
        <CardHeader className="space-y-4">
          <Badge className="w-fit accent-chip">Dein privater Raum</Badge>
          <div className="space-y-2">
            <CardTitle className="max-w-[16ch] text-[clamp(2rem,4vw,3rem)]">
              Kehre zu deinem Auftrag zurück, ohne neu zu beginnen.
            </CardTitle>
            <CardDescription className="max-w-[48ch] text-base">
              Nutze deine Auftrags-ID und dein Zugriffstoken, um alles zu sehen: Zahlung, Fortschritt, Assets. Alles an einem Ort.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {checkoutCancelled ? (
            <div className="rounded-[24px] border border-amber-200 bg-amber-50/90 px-5 py-4 text-sm leading-7 text-amber-950">
              Der Checkout wurde nicht abgeschlossen. Dein Auftrag wartet noch. Zahle jetzt ab, um ihn zu vollenden.
            </div>
          ) : null}

          <form className="intake-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label className="field">
                <span>Deine Auftrags-ID</span>
                <Input
                  required
                  value={jobId}
                  onChange={(event) => setJobId(event.target.value)}
                  placeholder="z.B. a1b2c3d4..."
                />
              </label>

              <label className="field">
                <span>Dein Zugriffstoken</span>
                <Input
                  type="password"
                  required
                  value={accessToken}
                  onChange={(event) => setAccessToken(event.target.value)}
                  placeholder="aus deiner Bestätigung..."
                />
              </label>
            </div>

            {error ? <p className="form-error">{error}</p> : null}
            {checkoutError ? <p className="form-error">{checkoutError}</p> : null}

            <div className="btn-row">
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Status wird geladen...' : 'Status laden'}
              </Button>
              {result?.status === 'created' ? (
                <Button
                  variant="secondary"
                  type="button"
                  disabled={isCheckoutPending}
                  onClick={handleCheckout}
                >
                  {isCheckoutPending ? 'Checkout wird geöffnet...' : 'Checkout fortsetzen'}
                </Button>
              ) : null}
            </div>
          </form>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[24px] border border-sky-100 bg-sky-50/70 p-4 text-sm leading-6 text-slate-700">
              <ShieldCheck className="mb-3 size-4 text-sky-700" />
              Nur dein Link. Keine Konten.
            </div>
            <div className="rounded-[24px] border border-sky-100 bg-white p-4 text-sm leading-6 text-slate-700">
              <Clock3 className="mb-3 size-4 text-sky-700" />
              Aktualisiert sich von selbst alle 10 Sekunden
            </div>
            <div className="rounded-[24px] border border-sky-100 bg-white p-4 text-sm leading-6 text-slate-700 accent-chip">
              <CreditCard className="mb-3 size-4 text-sky-700" />
              Zahlung fortsetzen, wenn nötig
            </div>
          </div>
        </CardContent>
      </Card>

      {recentJobs.length > 0 ? (
        <Card className="recent-jobs-card border-white/90 bg-white/82">
          <CardHeader>
            <Badge className="w-fit" variant="secondary">
              Deine Aufträge
            </Badge>
            <CardTitle>Komm schnell zu einem früheren Auftrag zurück.</CardTitle>
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
                  <strong>{statusContent[recentJob.status || 'created'].title}</strong>
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
                <div className="eyebrow">Hier steht dein Auftrag</div>
                <h3>{activeStatus?.title}</h3>
                <p className="copy">{activeStatus?.detail}</p>
              </div>
              <Badge className="status-badge justify-center rounded-full px-5 py-3 tracking-[0.18em]">
                {activeStatus?.badge}
              </Badge>
            </div>

            <div className="space-y-3">
                <div className="eyebrow">Dein Weg durch den Prozess</div>
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
                        <span
                          className={`mt-1 inline-flex size-8 items-center justify-center rounded-full ${
                            active ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <CheckCircle2 className="size-4" />
                        </span>
                        <div>
                          <strong className="text-slate-900">{stage.title}</strong>
                          <p className="mb-0 mt-2 text-sm leading-7 text-slate-600">
                            {getStageDescription(stage, result)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="inset-card">
                <CardHeader>
                  <Badge className="w-fit" variant="secondary">
                    {actionPanel ? actionPanel.badge : 'Was jetzt?'}
                  </Badge>
                  <CardTitle>
                    {actionPanel ? actionPanel.title : activeStatus?.nextStepTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="copy">{actionPanel ? actionPanel.detail : activeStatus?.nextStepDetail}</p>

                  {actionPanel ? (
                    <div className="btn-row mt-0">
                      {renderActionButton(actionPanel, isCheckoutPending)}
                      {actionPanel.secondaryHref && actionPanel.secondaryIcon ? (
                        <Button asChild variant="secondary">
                          <a
                            href={actionPanel.secondaryHref}
                            target="_blank"
                            rel="noreferrer"
                            download={actionPanel.secondaryDownload ? '' : undefined}
                          >
                            <actionPanel.secondaryIcon className="size-4" />
                            {actionPanel.secondaryLabel}
                          </a>
                        </Button>
                      ) : null}
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              <Card className="inset-card">
                <CardHeader>
                  <Badge className="w-fit" variant="secondary">
                    aktuelle Info
                  </Badge>
                  <CardTitle>Letztes Auftrags-Update</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="copy">{new Date(result.updatedAt).toLocaleString('de-DE')}</p>
                  <p className="copy mb-0">{getCurrentInfoNote(result)}</p>
                </CardContent>
              </Card>
            </div>

            {previewAssetVisible || finalAssetVisible ? (
              <div className="space-y-3">
                <div className="eyebrow">Deine Story</div>
                <div className="grid gap-4 lg:grid-cols-2">
                  {previewAssetVisible ? (
                    <MemoryAssetPreview asset={result.previewAsset!} variant="preview" />
                  ) : null}
                  {finalAssetVisible ? (
                    <MemoryAssetPreview asset={result.finalAsset!} variant="final" />
                  ) : null}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
