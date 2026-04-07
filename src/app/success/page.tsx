import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ jobId?: string; accessToken?: string; email?: string; checkout?: string }>;
}) {
  const params = await searchParams;
  const statusHref =
    params.jobId && params.accessToken
      ? `/status?jobId=${encodeURIComponent(params.jobId)}&accessToken=${encodeURIComponent(params.accessToken)}`
      : '/status';

  return (
    <main className="section page-shell">
      <div className="container">
        <Card className="success-shell border-white/90 bg-white/82">
          <CardContent className="p-8 text-center sm:p-10">
            <Badge className="success-badge mx-auto w-fit">
              {params.checkout === 'success' ? 'Bezahlung bestaetigt' : 'Auftrag erfolgreich angelegt'}
            </Badge>
            <h1 className="h2">Dein Auftrag ist gesichert.</h1>
            <p className="lead">
              Dein Briefing ist gespeichert. Von hier aus kannst du jederzeit zum Status wechseln und nachsehen, wie weit die Story ist.
            </p>
            {params.jobId ? (
              <div className="success-meta">
                <div>
                  <strong>Bestellnummer</strong>
                  <span>{params.jobId}</span>
                </div>
                <div>
                  <strong>E-Mail fuer die Zustellung</strong>
                  <span>{params.email || 'nicht uebergeben'}</span>
                </div>
              </div>
            ) : null}
            <div className="grid grid-3 success-grid">
              <Card className="border-white/90 bg-white/76">
                <CardContent className="p-6">
                  <h3>Was schon erledigt ist</h3>
                  <p className="copy">Dein Auftrag wurde angelegt und ist direkt mit der Statusseite verbunden.</p>
                </CardContent>
              </Card>
              <Card className="border-white/90 bg-white/76">
                <CardContent className="p-6">
                  <h3>Was als Naechstes passiert</h3>
                  <p className="copy">Nach der Bezahlung laeuft die Bearbeitung weiter, bis deine Story fuer die Auslieferung bereit ist.</p>
                </CardContent>
              </Card>
              <Card className="border-white/90 bg-white/76">
                <CardContent className="p-6">
                  <h3>Was du spaeter wiederfindest</h3>
                  <p className="copy">Du kannst denselben Auftrag spaeter erneut oeffnen, Status abrufen und eine offene Zahlung neu starten.</p>
                </CardContent>
              </Card>
            </div>
            <div className="btn-row">
              <Button asChild>
                <Link href={statusHref}>Zum Bearbeitungsstatus</Link>
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
