import Link from 'next/link';
import { Clock3, RefreshCcw, ShieldCheck } from 'lucide-react';
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
        <Card className="overflow-hidden border-white/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(234,244,255,0.9))]">
          <CardContent className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:p-8">
            <div className="space-y-4">
              <Badge className="w-fit accent-chip">Privater Auftragsstatus</Badge>
              <h1 className="h2 max-w-[14ch]">Ein ruhiger Ort zum Bezahlen, Warten, Ansehen oder Herunterladen.</h1>
              <p className="lead max-w-[56ch]">
                Diese Seite bleibt eng am bestehenden Backend-Vertrag und macht die sichtbare Bedeutung jedes Auftragsstatus klarer und ehrlicher.
              </p>
              {checkoutCancelled ? (
                <div className="rounded-[24px] border border-amber-200 bg-amber-50/90 px-5 py-4 text-sm leading-7 text-amber-950">
                  Der Checkout wurde nicht abgeschlossen. Der Auftrag ist weiterhin gespeichert und kann von hier aus fortgesetzt werden.
                </div>
              ) : null}
            </div>

            <div className="grid gap-4">
              <Card className="border-white/90 bg-white/84">
                <CardContent className="flex gap-4 p-5">
                  <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                    <ShieldCheck className="size-5" />
                  </span>
                  <div>
                    <h3 className="mt-1 text-2xl">Privater Zugriff</h3>
                    <p className="copy mb-0 mt-2">
                      Auftrags-ID und Zugriffstoken machen den Auftrag nachvollziehbar, ohne ein Konto zu erzwingen.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-white/90 bg-white/84">
                <CardContent className="flex gap-4 p-5">
                  <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                    <RefreshCcw className="size-5" />
                  </span>
                  <div>
                    <h3 className="mt-1 text-2xl">Live-Aktualisierung</h3>
                    <p className="copy mb-0 mt-2">
                      Die Seite aktualisiert sich automatisch, solange der Auftrag noch in Bewegung ist.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-white/90 bg-white/84">
                <CardContent className="flex gap-4 p-5">
                  <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                    <Clock3 className="size-5" />
                  </span>
                  <div>
                    <h3 className="mt-1 text-2xl">Schneller Wiedereinstieg</h3>
                    <p className="copy mb-0 mt-2">
                      Wenn die Zahlung unterbrochen wurde, ist das hier derselbe Weg für einen sauberen Wiedereinstieg.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <StatusLookup
          initialJobId={params.jobId}
          initialAccessToken={params.accessToken}
          checkoutCancelled={checkoutCancelled}
        />

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-white/90 bg-white/82">
            <CardHeader>
              <Badge className="w-fit" variant="secondary">
                Gut zu wissen
              </Badge>
              <CardTitle>Diese Ansicht berichtet den Auftrag ehrlich. Sie erfindet keine Zustände.</CardTitle>
              <CardDescription>
                Zahlung, Asset-Verfügbarkeit und Zustellereignisse kommen weiterhin aus dem Backend. Das Frontend übersetzt diesen Ablauf nur in eine klarere Kundensicht.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-white/90 bg-white/82">
            <CardContent className="flex h-full flex-col justify-between gap-4 p-6">
              <div>
                <div className="mini-kicker">Direktlinks</div>
                <p className="mb-0 text-sm leading-7 text-slate-600">
                  Starte einen neuen Auftrag oder gehe zurück zur Startseite, ohne den aktuellen Statuspfad aus dem Blick zu verlieren.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/memories">
                    {orderingAvailable ? 'Neuen Auftrag starten' : 'Bestellpause'}
                  </Link>
                </Button>
                <Button asChild variant="secondary">
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
