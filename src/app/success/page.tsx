import Link from 'next/link';
import { ArrowDownToLine, ExternalLink } from 'lucide-react';
import { getMemoryJobStatus } from '@/lib/memories/service';
import { MemoryAssetPreview } from '@/components/MemoryAssetPreview';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ jobId?: string; accessToken?: string; email?: string; checkout?: string }>;
}) {
  const params = await searchParams;
  const paymentConfirmed = params.checkout === 'success';
  const liveStatus =
    params.jobId && params.accessToken
      ? await getMemoryJobStatus(params.jobId, params.accessToken).catch(() => null)
      : null;
  const deliveryAsset = liveStatus?.finalAsset || liveStatus?.previewAsset;
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
                ? 'Dein Story-Auftrag ist bestätigt und mit der Statusverfolgung verbunden.'
                : 'Dein Auftrag ist gespeichert und bereit zum Fortsetzen.'}
            </h1>
            <p className="lead mx-auto max-w-[46ch]">
              {paymentConfirmed
                ? liveStatus?.finalAsset
                  ? 'Die Zahlung ist bestätigt, und die fertige Story ist bereits auf dieser Seite und über die verknüpfte Statusroute verfügbar.'
                  : liveStatus?.previewAsset
                    ? 'Die Zahlung ist bestätigt, und eine Vorschau ist bereits verfügbar, während die finale Zustellung weiterläuft.'
                    : 'Diese Seite bestätigt die erfolgreiche Übergabe. Von hier an ist die Statusroute der zentrale Ort für Fortschritt und finale Zustellung.'
                : 'Das Briefing ist gespeichert. Wenn die Zahlung nicht abgeschlossen wurde, kannst du denselben Auftrag über die Statusseite wieder öffnen, ohne neu zu beginnen.'}
            </p>

            {params.email ? (
              <div className="success-meta mx-auto max-w-3xl">
                <div>
                  <strong>Zustell-E-Mail</strong>
                  <span>{params.email}</span>
                </div>
              </div>
            ) : null}

            {deliveryAsset ? (
              <Card className="mx-auto mt-8 max-w-4xl border-sky-200 bg-[linear-gradient(180deg,rgba(239,247,255,0.96),rgba(223,239,255,0.92))] text-left shadow-[0_28px_80px_rgba(96,174,252,0.18)]">
                <CardContent className="space-y-5 p-6 sm:p-7">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-3">
                      <Badge className="w-fit accent-chip" variant="secondary">
                        {liveStatus?.finalAsset ? 'Zustellung bereit' : 'Vorschau bereit'}
                      </Badge>
                      <div>
                        <h2 className="mb-3 text-3xl">
                          {liveStatus?.finalAsset
                            ? 'Deine Story ist jetzt zum Öffnen oder Herunterladen bereit.'
                            : 'Eine Vorschau ist bereits verfügbar.'}
                        </h2>
                        <p className="copy mb-0 max-w-[52ch]">
                          {liveStatus?.delivery
                            ? `Das Asset wurde zusätzlich an ${liveStatus.delivery.recipient} gesendet.`
                            : liveStatus?.finalAsset
                              ? 'Du musst nicht auf eine separate Zustell-E-Mail warten, um auf das fertige Asset zuzugreifen.'
                              : 'Die finale Zustellung läuft noch, aber das aktuelle Asset ist bereits über denselben privaten Auftragspfad verfügbar.'}
                        </p>
                      </div>
                    </div>

                    <div className="btn-row mt-0">
                      <Button asChild size="lg">
                        <a
                          href={deliveryAsset.url}
                          target="_blank"
                          rel="noreferrer"
                          download={liveStatus?.finalAsset ? '' : undefined}
                        >
                          <ArrowDownToLine />
                          {liveStatus?.finalAsset ? 'Story herunterladen' : 'Vorschau öffnen'}
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
                    asset={deliveryAsset}
                    variant={liveStatus?.finalAsset ? 'final' : 'preview'}
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
                    {paymentConfirmed
                      ? deliveryAsset
                        ? 'Sobald Fulfillment-Daten vorliegen, ist hier eine direkte Asset-Aktion verfügbar.'
                        : 'Produktion und finale Zustellung laufen außerhalb dieser Seite weiter.'
                      : 'Der Checkout kann später über die Statusroute erneut geöffnet werden.'}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-white/90 bg-white/82">
                <CardContent className="p-6">
                  <div className="mini-kicker">Rückkehrpunkt</div>
                  <p className="mb-0 text-sm leading-7 text-slate-700">
                    Die Statusseite ist der feste Rückkehrpunkt für Updates und finale Assets.
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
