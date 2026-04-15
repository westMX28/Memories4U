import Link from 'next/link';
import { Lock, RefreshCcw, Zap } from 'lucide-react';
import { StatusLookup } from '@/components/StatusLookup';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { isMemoriesOrderingAvailable } from '@/lib/memories/public-flow';

export default async function StatusPage({
  searchParams,
}: {
  searchParams: Promise<{ jobId?: string; accessToken?: string; checkout?: string }>;
}) {
  const params = await searchParams;
  const orderingAvailable = isMemoriesOrderingAvailable();
  const checkoutCancelled = params.checkout === 'cancelled';

  return (
    <main className="section page-shell">
      <div className="container space-y-8">
        {/* Hero Section */}
        <Card className="overflow-hidden card-hero">
          <CardContent className="grid gap-8 p-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:p-10">
            <div className="space-y-6">
              <Badge className="w-fit accent-chip">Dein privater Auftragsraum</Badge>
              <div className="space-y-4">
                <h1 className="h2 max-w-[14ch]">Dein Auftrag. Dein Raum. Dein Weg.</h1>
                <p className="lead max-w-[60ch]">
                  Ein ruhiger Ort zum Verfolgen des Fortschritts, zum Bezahlen, wenn du bereit bist, oder zum Herunterladen deiner Story. Alles über einen privaten Link. Für immer.
                </p>
              </div>

              {checkoutCancelled ? (
                <div className="rounded-[24px] border border-amber-200 bg-amber-50/90 px-6 py-4 text-sm leading-7 text-amber-900">
                  <p className="mb-0 font-semibold">Der Checkout wurde unterbrochen.</p>
                  <p className="mb-0 mt-1">Dein Auftrag wartet. Zahle unten ab, um ihn zu vollenden.</p>
                </div>
              ) : null}
            </div>

            {/* Info Cards */}
            <div className="grid gap-4">
              <Card className="card-neutral">
                <CardHeader>
                  <Badge className="w-fit accent-chip" variant="secondary">Wie das funktioniert</Badge>
                  <CardTitle className="text-lg">Kein Konto. Kein Login. Nur dein Link.</CardTitle>
                  <CardDescription className="text-sm">
                    Speichere diese Seite. Teile sie, wenn nötig. Sie bleibt für immer dein.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="card-subtle">
                <CardContent className="flex gap-4 p-5">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Lock className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-base leading-tight font-semibold">Privat und sicher</h3>
                    <p className="text-sm text-slate-600 mb-0 mt-1">
                      Deine Auftrags-ID und dein Token sind dein Zugang. Keine Datenverfolgung.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-subtle">
                <CardContent className="flex gap-4 p-5">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <RefreshCcw className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-base leading-tight font-semibold">Echtzeit-Aktualisierungen</h3>
                    <p className="text-sm text-slate-600 mb-0 mt-1">
                      Diese Seite zeigt dir den Fortschritt live, während deine Story entsteht.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-subtle">
                <CardContent className="flex gap-4 p-5">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Zap className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-base leading-tight font-semibold">Jederzeit fortfahren</h3>
                    <p className="text-sm text-slate-600 mb-0 mt-1">
                      Zahlung unterbrochen? Kehre mit diesem Link zurück, wenn du bereit bist.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Status Lookup Component */}
        <StatusLookup
          initialJobId={params.jobId}
          initialAccessToken={params.accessToken}
          checkoutCancelled={checkoutCancelled}
        />

        {/* Bottom Info */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="card-subtle">
            <CardHeader>
              <Badge className="w-fit accent-chip" variant="secondary">Ehrlichkeit</Badge>
              <CardTitle>Status, wie er ist.</CardTitle>
              <CardDescription>
                Keine erfundenen Fortschrittsstufen. Was du siehst, ist echt: gespeichert, bezahlt, in Erstellung, zugestellt. Nichts mehr, nichts weniger.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="card-subtle">
            <CardContent className="flex h-full flex-col justify-between gap-6 p-8">
              <div>
                <div className="mini-kicker">Nächste Schritte</div>
                <p className="text-sm leading-7 text-slate-700 mt-2">
                  Ein weiteres Geschenk bestellen oder nach Hause zurückkehren. Dein aktueller Auftrag bleibt sicher und immer erreichbar.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="sm">
                  <Link href="/memories">
                    {orderingAvailable ? 'Neuen Auftrag erstellen' : 'Bestellungen pausiert'}
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="sm">
                  <Link href="/">Startseite</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
