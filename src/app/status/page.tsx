import Link from 'next/link';
import { StatusLookup } from '@/components/StatusLookup';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default async function StatusPage({
  searchParams,
}: {
  searchParams: Promise<{ jobId?: string; accessToken?: string; checkout?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="section page-shell">
      <div className="container">
        <div className="section-heading">
          <Badge className="w-fit">status</Badge>
          <h1 className="h2">Hier siehst du, wie weit deine Geburtstags-Story gerade ist.</h1>
          <p className="lead">
            Wenn du von der Erfolgsseite kommst, ist alles schon vorausgefuellt. Sonst kannst du deine Bestellnummer und deinen Zugriffscode hier direkt eingeben.
          </p>
          {params.checkout === 'cancelled' ? (
            <p className="copy">
              Die Zahlung wurde abgebrochen. Dein Auftrag ist weiterhin gespeichert und kann von hier aus erneut abgeschlossen werden.
            </p>
          ) : null}
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
                  <Link href="/memories">Neuen Auftrag starten</Link>
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
