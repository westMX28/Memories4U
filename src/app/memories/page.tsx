import Link from 'next/link';
import { MemoriesIntakeForm } from '@/components/MemoriesIntakeForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function MemoriesPage() {
  return (
    <main className="section page-shell">
      <div className="container grid grid-2 page-grid">
        <div className="page-intro">
          <Badge className="w-fit">dein auftrag</Badge>
          <h1 className="h2">Schick uns nur das, was den Menschen und den Moment wirklich beschreibt.</h1>
          <p className="lead">
            Das Briefing ist bewusst kurz gehalten. Ein bis zwei Bild-Links, eine E-Mail und ein Satz zur Erinnerung reichen, damit aus dem Anlass eine persoenliche Story werden kann.
          </p>
          <div className="list">
            <div>In wenigen Minuten vorbereitet</div>
            <div>Kein Account noetig</div>
            <div>Der Auftrag bleibt spaeter nachvollziehbar</div>
            <div>Direkter Wechsel in die Bezahlung</div>
          </div>
          <div className="btn-row">
            <Button asChild>
              <a href="#intake-form">Jetzt Auftrag anlegen</a>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/how-it-works">Ablauf vorher ansehen</Link>
            </Button>
          </div>
        </div>

        <div className="stack">
          <Card className="border-white/90 bg-white/78">
            <CardContent className="p-6">
              <div className="eyebrow">kurzes briefing</div>
              <h3>Weniger Felder, damit die Energie im Geschenk bleibt.</h3>
              <ul className="feature-list">
                <li>Mindestens ein gueltiger Bild-Link</li>
                <li>Eine E-Mail fuer spaetere Zustellung</li>
                <li>Ein Satz zu Stimmung, Anlass oder Erinnerung</li>
                <li>Optional ein zweites Bild</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-white/90 bg-white/78">
            <CardContent className="p-6">
              <div className="eyebrow">danach</div>
              <h3>Erst sichern wir den Auftrag. Danach bleibt alles ueber dieselbe Bestellspur auffindbar.</h3>
              <p className="copy">
                Deine Angaben bleiben erhalten, die Bezahlung startet direkt danach und du kannst spaeter jederzeit wieder nachsehen, wie weit die Story ist.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="container section-top" id="intake-form">
        <MemoriesIntakeForm />
      </div>

      <div className="container section-top">
        <div className="section-heading">
          <div className="eyebrow">warum dieser screen so reduziert ist</div>
          <h2 className="h2">Du sollst hier nicht gestalten. Du sollst nur den richtigen Startpunkt liefern.</h2>
        </div>
        <div className="grid grid-3">
          <Card className="border-white/90 bg-white/76">
            <CardContent className="p-6">
              <h3>Schneller Start</h3>
              <p className="copy">Niemand sollte sich durch einen langen Konfigurator arbeiten muessen, nur um etwas Persoenliches zu verschenken.</p>
            </CardContent>
          </Card>
          <Card className="border-white/90 bg-white/76">
            <CardContent className="p-6">
              <h3>Klarer Statuspfad</h3>
              <p className="copy">Dein Auftrag bleibt wiederfindbar, falls du spaeter noch einmal nachsehen oder eine offene Zahlung neu starten willst.</p>
            </CardContent>
          </Card>
          <Card className="border-white/90 bg-white/76">
            <CardContent className="p-6">
              <h3>Ehrliche Erwartung</h3>
              <p className="copy">Die Seite verspricht keinen Showroom, sondern einen klaren Weg von Erinnerung zu Geschenkauftrag.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
