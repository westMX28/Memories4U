import Link from 'next/link';
import { StatusLookup } from '@/components/StatusLookup';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { isMemoriesOrderingAvailable } from '@/lib/memories/public-flow';

export default async function StatusPage({
  searchParams,
}: {
  searchParams: Promise<{ jobId?: string; accessToken?: string; checkout?: string }>;
}) {
  const params = await searchParams;
  const orderingAvailable = isMemoriesOrderingAvailable();

  return (
    <main className="section page-shell">
      <div className="container">
        <div className="page-hero status-hero">
          <div className="page-hero-grid">
            <div className="section-heading">
              <Badge className="w-fit">status</Badge>
              <h1 className="h2">Hier siehst du, wie weit deine Geburtstags-Story gerade ist.</h1>
              <p className="lead">
                Wenn du vom Checkout oder von der Erfolgsseite kommst, ist alles schon vorausgefuellt. Sonst kannst du hier deine privaten Zugangsdaten eingeben.
              </p>
              {params.checkout === 'cancelled' ? (
                <p className="copy">
                  Die Zahlung wurde nicht abgeschlossen. Dein Auftrag bleibt gespeichert und kann von hier aus erneut zur Bezahlung geoeffnet werden.
                </p>
              ) : null}
            </div>
            <Card className="page-side-card border-white/90 bg-white/78">
              <CardContent className="p-6">
                <div className="eyebrow">dein privater pfad</div>
                <h3>Ein Ort fuer Zahlung, Fortschritt und spaetere Zustellung.</h3>
                <p className="copy">
                  Diese Seite ist nicht nur ein Lookup. Sie ist der stabile Rueckweg, wenn du spaeter erneut nachsehen oder eine offene Zahlung fortsetzen willst.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <StatusLookup
          initialJobId={params.jobId}
          initialAccessToken={params.accessToken}
        />

        <div className="grid grid-2 section-top">
          <Card className="border-white/90 bg-white/78">
            <CardContent className="p-6">
              <div className="eyebrow">gut zu wissen</div>
              <p className="copy">
                Diese Seite ist dafuer da, dir Orientierung zu geben. Dein Auftrag selbst wird hierdurch nicht veraendert.
              </p>
            </CardContent>
          </Card>
          <Card className="border-white/90 bg-white/78">
            <CardContent className="p-6">
              <div className="eyebrow">schnellzugriff</div>
              <div className="btn-row">
                <Button asChild>
                  <Link href="/memories">
                    {orderingAvailable ? 'Neuen Auftrag starten' : 'Bestellpause ansehen'}
                  </Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/">Zur Startseite</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
