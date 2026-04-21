import Link from 'next/link';
import { ArrowDownToLine, ExternalLink } from 'lucide-react';
import { getMemoryJobStatus, reconcileStripeCheckoutSuccess } from '@/lib/memories/service';
import { MemoryAssetPreview } from '@/components/MemoryAssetPreview';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  getSuccessAssetPresentation,
  getSuccessLeadCopy,
  getSuccessNextStepCopy,
} from '@/lib/memories/status-presentation';

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    jobId?: string;
    accessToken?: string;
    email?: string;
    checkout?: string;
    session_id?: string;
  }>;
}) {
  const params = await searchParams;
  const paymentConfirmed = params.checkout === 'success';
  const liveStatus =
    params.jobId && params.accessToken
      ? await (
          paymentConfirmed && params.session_id
            ? reconcileStripeCheckoutSuccess(params.jobId, params.accessToken, params.session_id)
            : getMemoryJobStatus(params.jobId, params.accessToken)
        ).catch(() => null)
      : null;
  const assetPresentation = getSuccessAssetPresentation(liveStatus);
  const statusHref =
    params.jobId && params.accessToken
      ? `/status?jobId=${encodeURIComponent(params.jobId)}&accessToken=${encodeURIComponent(params.accessToken)}`
      : '/status';

  return (
    <main className="section page-shell">
      <div className="container">
        <Card className="success-shell overflow-hidden border-white/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(231,243,255,0.92))]">
          <CardContent className="p-8 text-center sm:p-10">
            <Badge className="success-badge mx-auto w-fit">
              {paymentConfirmed ? 'Zahlung bestätigt' : 'Auftrag gespeichert'}
            </Badge>
            <h1 className="h2 max-w-[14ch] mx-auto">
              {paymentConfirmed
                ? 'Dein Story-Auftrag ist bestätigt und läuft jetzt in einem klaren Vier-Schritt-Status weiter.'
                : 'Dein Auftrag ist gespeichert und bereit zum Fortsetzen.'}
            </h1>
            <p className="lead mx-auto max-w-[46ch]">
              {getSuccessLeadCopy(paymentConfirmed, liveStatus)}
            </p>

            {params.email ? (
              <div className="success-meta mx-auto max-w-3xl">
                <div>
                  <strong>Zustell-E-Mail</strong>
                  <span>{params.email}</span>
                </div>
              </div>
            ) : null}

            {assetPresentation ? (
              <Card className="mx-auto mt-8 max-w-4xl border-sky-200 bg-[linear-gradient(180deg,rgba(239,247,255,0.96),rgba(223,239,255,0.92))] text-left shadow-[0_28px_80px_rgba(96,174,252,0.18)]">
                <CardContent className="space-y-5 p-6 sm:p-7">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-3">
                      <Badge className="w-fit accent-chip" variant="secondary">{assetPresentation.badge}</Badge>
                      <div>
                        <h2 className="mb-3 text-3xl">{assetPresentation.title}</h2>
                        <p className="copy mb-0 max-w-[52ch]">{assetPresentation.detail}</p>
                      </div>
                    </div>

                    <div className="btn-row mt-0">
                      <Button asChild size="lg">
                        <a
                          href={assetPresentation.asset.url}
                          target="_blank"
                          rel="noreferrer"
                          download={assetPresentation.download ? '' : undefined}
                        >
                          <ArrowDownToLine />
                          {assetPresentation.ctaLabel}
                        </a>
                      </Button>
                      <Button asChild size="lg" variant="secondary">
                        <Link href={statusHref}>
                          <ExternalLink />
                          Live-Status öffnen
                        </Link>
                      </Button>
                    </div>
                  </div>

                  <MemoryAssetPreview
                    asset={assetPresentation.asset}
                    variant={assetPresentation.variant}
                  />
                </CardContent>
              </Card>
            ) : null}

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <Card className="border-white/90 bg-white/82">
                <CardContent className="p-6">
                  <div className="mini-kicker">gespeichert</div>
                  <p className="mb-0 text-sm leading-7 text-slate-700">
                    Der Auftrag bleibt an eine private Auftrags-ID und ein Zugriffstoken gebunden.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-white/90 bg-white/82">
                <CardContent className="p-6">
                  <div className="mini-kicker">als Nächstes</div>
                  <p className="mb-0 text-sm leading-7 text-slate-700">
                    {getSuccessNextStepCopy(paymentConfirmed, liveStatus)}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-white/90 bg-white/82">
                <CardContent className="p-6">
                  <div className="mini-kicker">Statusmodell</div>
                  <p className="mb-0 text-sm leading-7 text-slate-700">
                    Die Statusseite bündelt den Auftrag in vier klaren Schritten: eingegangen, bezahlt, in Bearbeitung, fertig.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="btn-row justify-center">
              <Button asChild>
                <Link href={statusHref}>Auftragsstatus öffnen</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/">Zur Startseite</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
