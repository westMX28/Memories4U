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
  getStatusAssetActionPresentation,
  getStatusInfoNote,
} from '@/lib/memories/status-presentation';
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
  key: 'received' | 'paid' | 'in-progress' | 'ready';
  title: string;
  description: string;
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
    badge: 'Zahlung offen',
    title: 'Dein Auftrag ist gespeichert, aber die Zahlung ist noch offen.',
    detail: 'Deine Auftragsdaten sind sicher gespeichert. Die Produktion startet, sobald die Zahlung abgeschlossen ist.',
    nextStepTitle: 'Schließe die Zahlung ab, wenn du bereit bist.',
    nextStepDetail: 'Öffne den Checkout erneut, um mit genau diesem Auftrag weiterzumachen. Du musst nicht neu beginnen.',
    infoNote: 'Dein privater Link bleibt gültig, solange die Zahlung noch offen ist.',
  },
  unlocked: {
    badge: 'Bezahlt',
    title: 'Dein Auftrag ist bezahlt.',
    detail: 'Die Zahlung ist bestätigt, und der Auftrag ist für die Bearbeitung freigegeben.',
    nextStepTitle: 'Im Moment brauchst du nichts weiter zu tun.',
    nextStepDetail: 'Wir haben alles, was wir brauchen, und halten diese Seite aktuell, während der Auftrag in die Bearbeitung übergeht.',
    infoNote: 'Die Zahlung wurde erfolgreich bestätigt, und die Produktion kann normal weitergehen.',
  },
  queued: {
    badge: 'In Bearbeitung',
    title: 'Dein Auftrag ist in Bearbeitung.',
    detail: 'Alles Nötige für die Story ist vorhanden. Der Auftrag ist bezahlt und wartet auf seinen Produktionsslot.',
    nextStepTitle: 'Im Moment brauchst du nichts weiter zu tun.',
    nextStepDetail: 'Diese Seite aktualisiert sich, solange der Auftrag noch unterwegs ist.',
    infoNote: 'Dein Auftrag ist bezahlt und wartet auf die Erstellung der Story.',
  },
  processing: {
    badge: 'In Bearbeitung',
    title: 'Deine Story wird gerade erstellt.',
    detail: 'Die Story befindet sich aktiv in der Produktion. Diese Seite aktualisiert sich weiter, solange daran gearbeitet wird.',
    nextStepTitle: 'Im Moment brauchst du nichts weiter zu tun.',
    nextStepDetail: 'Du kannst jederzeit hierher zurückkehren, während die Story entsteht.',
    infoNote: 'Der Auftrag befindet sich aktiv in der Produktion.',
  },
  preview_ready: {
    badge: 'In Bearbeitung',
    title: 'Dein Auftrag ist weiter in Bearbeitung.',
    detail: 'Die Story ist fast fertig. Eine Vorschau kann bereits sichtbar sein, ohne dass dies eine eigene Kernphase darstellt.',
    nextStepTitle: 'Im Moment brauchst du nichts weiter zu tun.',
    nextStepDetail: 'Wenn bereits eine Vorschau existiert, kannst du sie unten als Zwischenstand ansehen. Die finale Story folgt separat.',
    infoNote: 'Der Auftrag ist in Bearbeitung. Eine Vorschau kann bereits verfügbar sein.',
  },
  completed: {
    badge: 'Fertig',
    title: 'Deine finale Story ist bereit.',
    detail: 'Die fertige Story kann schon verfügbar sein, bevor eine Zustellbestätigung erfasst wurde.',
    nextStepTitle: 'Der finale Zugriff erscheint hier, sobald der Asset-Link vorliegt.',
    nextStepDetail: 'Direkter Zugriff und E-Mail-Zustellung werden getrennt erfasst, daher kann diese Seite das finale Asset schon zeigen, bevor ein Zustellereignis erscheint.',
    infoNote: 'Das finale Asset ist bereit, auch wenn die Zustellbestätigung noch nicht verbucht wurde.',
  },
  delivered: {
    badge: 'Fertig',
    title: 'Deine finale Story ist bereit.',
    detail: 'Die Zustellung ist erfasst, und das finale Asset bleibt über diese private Seite erreichbar.',
    nextStepTitle: 'Nutze den finalen Asset-Link unten, sobald er verfügbar ist.',
    nextStepDetail: 'Wenn nötig, kannst du hier direkt auf das Asset zugreifen, statt dein Postfach zu durchsuchen.',
    infoNote: 'Die Zustellung wurde für das hinterlegte Ziel erfasst.',
  },
  failed: {
    badge: 'Braucht Aufmerksamkeit',
    title: 'Dein Auftrag braucht Aufmerksamkeit.',
    detail: 'Etwas hat die Produktion unterbrochen. Bitte lege keinen doppelten Auftrag an, während wir das prüfen.',
    nextStepTitle: 'Bewahre diesen privaten Statuslink auf und warte auf die Prüfung des Auftrags.',
    nextStepDetail: 'Wenn sich dieser Status längere Zeit nicht ändert, nutze diesen privaten Link für den Support statt neu zu bestellen.',
    infoNote: 'Der Auftrag ist zur Prüfung pausiert. Ein doppelter Auftrag würde Verwirrung schaffen, nicht Tempo.',
  },
};

const statusStages: StageDefinition[] = [
  {
    key: 'received',
    title: 'Auftrag eingegangen',
    description: 'Deine Auftragsdaten sind gespeichert und können über diese private Seite fortgesetzt werden.',
  },
  {
    key: 'paid',
    title: 'Bezahlt',
    description: 'Die Zahlung ist bestätigt und der Auftrag kann in die Produktion übergehen.',
  },
  {
    key: 'in-progress',
    title: 'In Bearbeitung',
    description: 'Die Story ist in der Warteschlange oder in Produktion. Vorschauen erscheinen nur als optionaler Zwischenstand.',
  },
  {
    key: 'ready',
    title: 'Fertig, Download verfügbar',
    description: 'Die finale Story ist bereit. Eine Zustellung kann zusätzlich separat erfasst werden.',
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

function isStageActive(stage: StageDefinition, result: MemoryStatusResponse) {
  switch (stage.key) {
    case 'received':
      return true;
    case 'paid':
      return result.unlocked;
    case 'in-progress':
      return ['queued', 'processing', 'preview_ready', 'completed', 'delivered'].includes(
        result.status,
      );
    case 'ready':
      return result.status === 'completed' || result.status === 'delivered';
    default:
      return false;
  }
}

function getStageDescription(stage: StageDefinition, result: MemoryStatusResponse) {
  switch (stage.key) {
    case 'paid':
      return result.unlocked
        ? 'Die Zahlung ist bestätigt und der Auftrag kann weiterlaufen.'
        : 'Die Zahlung ist noch offen, daher hat die Produktion noch nicht begonnen.';
    case 'in-progress':
      if (result.status === 'queued') {
        return 'Der Auftrag ist bezahlt und wartet in der Produktionsschlange.';
      }

      if (result.status === 'processing') {
        return 'Die Story wird gerade aktiv erstellt.';
      }

      if (result.status === 'preview_ready') {
        return 'Die Erstellung ist fast abgeschlossen. Eine Vorschau kann bereits verfügbar sein.';
      }

      if (result.status === 'failed') {
        return 'Die Produktion wurde unterbrochen und wartet auf Prüfung.';
      }

      if (result.status === 'completed' || result.status === 'delivered') {
        return 'Die Bearbeitung ist abgeschlossen.';
      }

      return result.unlocked
        ? 'Die Bearbeitung startet, sobald der Auftrag in die Produktionsphase wechselt.'
        : 'Diese Phase beginnt nach bestätigter Zahlung.';
    case 'ready':
      if (result.status === 'completed') {
        return 'Die finale Story ist bereit, auch wenn die Zustellbestätigung noch aussteht.';
      }

      if (result.status === 'delivered') {
        return result.delivery
          ? `Die Zustellung wurde an ${result.delivery.recipient} erfasst.`
          : 'Die Zustellung wurde für diesen Auftrag erfasst.';
      }

      return 'Diese Phase wird erst erreicht, wenn die finale Story bereit ist.';
    case 'received':
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
      badge: 'Aktion verfügbar',
      title: content.nextStepTitle,
      detail: content.nextStepDetail,
      primaryLabel: 'Checkout fortsetzen',
      primaryOnClick: onCheckout,
      primaryIcon: CreditCard,
    };
  }

  const assetAction = getStatusAssetActionPresentation(result);
  if (assetAction) {
    return {
      badge: assetAction.badge,
      title: assetAction.title,
      detail: assetAction.detail,
      primaryLabel: assetAction.primaryLabel,
      primaryHref: assetAction.primaryHref,
      primaryDownload: assetAction.primaryDownload,
      primaryIcon:
        assetAction.primaryKind === 'preview' ? Eye : ArrowDownToLine,
      secondaryLabel: assetAction.secondaryLabel,
      secondaryHref: assetAction.secondaryHref,
      secondaryDownload: assetAction.secondaryDownload,
      secondaryIcon: ExternalLink,
    };
  }

  return null;
}

function getCurrentInfoNote(result: MemoryStatusResponse) {
  const presentationNote = getStatusInfoNote(result);
  if (presentationNote) {
    return presentationNote;
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
          <Badge className="w-fit accent-chip">Statuszugriff</Badge>
          <div className="space-y-2">
            <CardTitle className="max-w-[16ch] text-[clamp(2rem,4vw,3rem)]">
              Privaten Auftrag wieder öffnen, ohne neu zu beginnen.
            </CardTitle>
            <CardDescription className="max-w-[48ch] text-base">
              Gib Auftrags-ID und Zugriffstoken aus deiner ursprünglichen Bestätigung ein, um Zahlung, Fortschritt und Asset-Verfügbarkeit an einem Ort zu sehen.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {checkoutCancelled ? (
            <div className="rounded-[24px] border border-amber-200 bg-amber-50/90 px-5 py-4 text-sm leading-7 text-amber-950">
              Der Checkout wurde nicht abgeschlossen. Dein Auftrag ist hier weiterhin gespeichert und kann ohne neue Bestellung fortgesetzt werden.
            </div>
          ) : null}

          <form className="intake-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label className="field">
                <span>Private Auftrags-ID</span>
                <Input
                  required
                  value={jobId}
                  onChange={(event) => setJobId(event.target.value)}
                  placeholder="uuid..."
                />
              </label>

              <label className="field">
                <span>Privates Zugriffstoken</span>
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
              nur private Zugangsdaten
            </div>
            <div className="rounded-[24px] border border-sky-100 bg-white p-4 text-sm leading-6 text-slate-700">
              <Clock3 className="mb-3 size-4 text-sky-700" />
              automatische Aktualisierung während des Auftrags
            </div>
            <div className="rounded-[24px] border border-sky-100 bg-white p-4 text-sm leading-6 text-slate-700 accent-chip">
              <CreditCard className="mb-3 size-4 text-sky-700" />
              Checkout-Wiedereinstieg nur bei offener Zahlung
            </div>
          </div>
        </CardContent>
      </Card>

      {recentJobs.length > 0 ? (
        <Card className="recent-jobs-card border-white/90 bg-white/82">
          <CardHeader>
            <Badge className="w-fit" variant="secondary">
              letzte Aufträge
            </Badge>
            <CardTitle>Kürzlich genutzten privaten Auftrag direkt öffnen.</CardTitle>
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
                <div className="eyebrow">aktueller Status</div>
                <h3>{activeStatus?.title}</h3>
                <p className="copy">{activeStatus?.detail}</p>
              </div>
              <Badge className="status-badge justify-center rounded-full px-5 py-3 tracking-[0.18em]">
                {activeStatus?.badge}
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="eyebrow">Fortschritt</div>
              <div className="grid gap-4 lg:grid-cols-2">
                {statusStages.map((stage) => {
                  const active = isStageActive(stage, result);
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
                    {actionPanel ? actionPanel.badge : 'Nächster Schritt'}
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
                <div className="eyebrow">Sichtbare Assets</div>
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
