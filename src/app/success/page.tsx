import Link from 'next/link';
import { ArrowDownToLine, ExternalLink, CheckCircle, Sparkles, Lock, Clock } from 'lucide-react';
import { getMemoryJobStatus } from '@/lib/memories/service';
import { MemoryAssetPreview } from '@/components/MemoryAssetPreview';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
      <div className="container space-y-8">
        <Card className="success-shell overflow-hidden border-white/70 bg-gradient-to-br from-white/95 via-white/92 to-blue-50/85">
          <CardContent className="p-10 text-center sm:p-12">
            <div className="inline-flex mb-6">
              <Badge className="success-badge flex items-center gap-2">
                <CheckCircle className="size-5" />
                {paymentConfirmed ? 'Die Reise beginnt' : 'Auftrag gespeichert'}
              </Badge>
            </div>

            <h1 className="h2 max-w-[18ch] mx-auto">
              {paymentConfirmed
                ? 'Deine Story wird gerade erstellt.'
                : 'Dein Auftrag ist sicher. Zahle ab, wenn du bereit bist.'}
            </h1>

            <p className="lead mx-auto max-w-[60ch] mt-6">
              {paymentConfirmed
                ? liveStatus?.finalAsset
                  ? 'Die fertige Story wartet. Lade sie herunter und feiere diesen Menschen.'
                  : liveStatus?.previewAsset
                    ? 'Eine Vorschau ist schon verfügbar. Die finale Version wird gerade finalisiert.'
                    : 'Die Erstellung hat begonnen. Du bekommst Updates, während wir daran arbeiten. Kehre jederzeit zu deiner Statusseite zurück.'
                : 'Deine Informationen sind sicher gespeichert. Kehre auf diese private Seite zurück, wenn du bereit zum Zahlen bist.'}
            </p>

            {params.email ? (
              <div className="success-meta mx-auto max-w-3xl mt-8">
                <div className="rounded-[24px] bg-white/85 border border-sky-100 p-5">
                  <div className="text-sm uppercase tracking-widest text-blue-700 font-semibold">Zustelladresse</div>
                  <p className="mb-0 text-base mt-2 text-slate-700">{params.email}</p>
                </div>
              </div>
            ) : null}

            {deliveryAsset ? (
              <Card className="mx-auto mt-12 max-w-4xl border-white/70 bg-white/82 text-left shadow-[0_32px_96px_rgba(96,174,252,0.12)]">
                <CardContent className="space-y-6 p-8 sm:p-10">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-4">
                      <Badge className="w-fit accent-chip" variant="secondary">
                        {liveStatus?.finalAsset ? 'Bereit' : 'Vorschau verfügbar'}
                      </Badge>
                      <div>
                        <h2 className="text-3xl leading-tight font-display mb-3">
                          {liveStatus?.finalAsset
                            ? 'Deine Story ist fertig.'
                            : 'Eine Vorschau ist schon sichtbar.'}
                        </h2>
                        <p className="text-slate-700 mb-0 max-w-[56ch] leading-relaxed">
                          {liveStatus?.delivery
                            ? `Das Geschenk ist fertig für ${liveStatus.delivery.recipient}.`
                            : liveStatus?.finalAsset
                              ? 'Lade es herunter und teile es. Feiere diesen Menschen mit dem, was du zusammen erschaffen hast.'
                              : 'Die finale Version wird gerade perfektioniert. Du kannst die Vorschau jetzt ansehen oder auf die fertige Version warten.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 flex-shrink-0">
                      <Button asChild size="lg">
                        <a
                          href={deliveryAsset.url}
                          target="_blank"
                          rel="noreferrer"
                          download={liveStatus?.finalAsset ? '' : undefined}
                          className="flex items-center gap-2"
                        >
                          <ArrowDownToLine className="size-5" />
                          {liveStatus?.finalAsset ? 'Herunterladen' : 'Vorschau ansehen'}
                        </a>
                      </Button>
                      <Button asChild size="lg" variant="secondary">
                        <Link href={statusHref} className="flex items-center gap-2">
                          <Clock className="size-4" />
                          Fortschritt
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

            {/* Continuation & Status Path Reassurance */}
            <Card className="mx-auto mt-12 max-w-3xl border-white/80 bg-blue-50/60">
              <CardContent className="p-8 sm:p-10">
                <div className="space-y-4">
                  <h2 className="text-xl font-display font-semibold text-slate-900">Die Reise geht weiter.</h2>
                  <p className="text-slate-700 leading-relaxed mb-0">
                    {paymentConfirmed
                      ? 'Dein Auftrag ist jetzt in Produktion. Kehre jederzeit zu deiner privaten Statusseite zurück, um den Fortschritt zu verfolgen, die Vorschau anzuschauen oder die fertige Story herunterzuladen. Alles bleibt über denselben Link erreichbar.'
                      : 'Dein Auftrag wartet sicher auf dich. Wenn du bereit zum Bezahlen bist, kannst du sofort von deiner privaten Statusseite aus zum Checkout zurückkehren. Kein Neubeginn, keine verlorenen Informationen.'}
                  </p>
                  {paymentConfirmed && (
                    <div className="mt-6 flex items-start gap-4 p-4 rounded-[24px] bg-white/70 border border-blue-200">
                      <div className="text-blue-600 mt-1 flex-shrink-0">
                        <Clock className="size-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 mb-1">Live-Verfolgung</p>
                        <p className="text-sm text-slate-700 mb-0">Deine Statusseite aktualisiert sich alle 10 Sekunden mit den neuesten Informationen.</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="mt-12 grid gap-4 md:grid-cols-3">
              <Card className="border-white/70 bg-white/76">
                <CardContent className="flex gap-4 p-6">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mt-1">
                    <Lock className="size-5" />
                  </span>
                  <div>
                    <div className="mini-kicker">Dein Auftrag</div>
                    <p className="mb-0 text-sm leading-6 text-slate-700">
                      Privat gespeichert und vollständig sicher. Dein alleiniger Zugang.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-white/70 bg-white/76">
                <CardContent className="flex gap-4 p-6">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mt-1">
                    <Sparkles className="size-5" />
                  </span>
                  <div>
                    <div className="mini-kicker">Was jetzt geschieht</div>
                    <p className="mb-0 text-sm leading-6 text-slate-700">
                      {paymentConfirmed
                        ? 'Die Story wird erstellt. Du bekommst Live-Updates auf deiner Seite.'
                        : 'Zahle ab, wann immer du bereit bist. Dein Auftrag wartet sicher.'}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-white/70 bg-white/76">
                <CardContent className="flex gap-4 p-6">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mt-1">
                    <Clock className="size-5" />
                  </span>
                  <div>
                    <div className="mini-kicker">Dein Weg zur Story</div>
                    <p className="mb-0 text-sm leading-6 text-slate-700">
                      Eine private Seite für alles: Fortschritt, Updates, und die fertige Story.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-wrap gap-3 justify-center mt-12">
              <Button asChild size="lg">
                <Link href={statusHref} className="flex items-center gap-2">
                  <Clock className="size-4" />
                  Zum Fortschritt
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/">Zur Startseite</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
