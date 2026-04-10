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
  const paymentConfirmed = params.checkout === 'success';
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
              {paymentConfirmed ? 'Bezahlung bestaetigt' : 'Auftrag gespeichert'}
            </Badge>
            <h1 className="h2">
              {paymentConfirmed ? 'Dein Auftrag ist bestaetigt und sicher gespeichert.' : 'Dein Auftrag ist gespeichert.'}
            </h1>
            <p className="lead">
              {paymentConfirmed
                ? 'Dein Briefing und deine Zahlung sind eingegangen. Die Erfolgsseite bestaetigt nur den Auftrag. Fuer jeden weiteren Fortschritt wechselst du von hier aus in den Status.'
                : 'Dein Briefing ist gespeichert. Wechsle zum Status, um die Bestellung spaeter wieder aufzurufen oder eine offene Zahlung fortzusetzen.'}
            </p>
            <div className="success-ribbon" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            {params.email ? (
              <div className="success-meta">
                <div>
                  <strong>E-Mail fuer die Zustellung</strong>
                  <span>{params.email}</span>
                </div>
              </div>
            ) : null}
            <div className="grid grid-3 success-grid">
              <Card className="border-white/90 bg-white/76">
                <CardContent className="p-6">
                  <h3>Was schon erledigt ist</h3>
                  <p className="copy">
                    {paymentConfirmed
                      ? 'Dein Auftrag ist bezahlt, bestaetigt und direkt mit der Statusseite verbunden.'
                      : 'Dein Auftrag wurde angelegt und bleibt ueber die Statusseite wieder auffindbar.'}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-white/90 bg-white/76">
                <CardContent className="p-6">
                  <h3>Was als Naechstes passiert</h3>
                  <p className="copy">
                    {paymentConfirmed
                      ? 'Als Naechstes folgen Freigabe, Bearbeitung und spaeter die Zustellung per E-Mail. Diese Seite selbst ist noch keine Lieferbestaetigung.'
                      : 'Sobald die Zahlung bestaetigt ist, startet die Bearbeitung und endet mit der finalen Zustellung per E-Mail.'}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-white/90 bg-white/76">
                <CardContent className="p-6">
                  <h3>Was du spaeter wiederfindest</h3>
                  <p className="copy">
                    Auf demselben Statuspfad kannst du Fortschritt abrufen, eine offene Zahlung neu starten oder die finale Story oeffnen, sobald sie bereit ist.
                  </p>
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
