import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const steps = [
  {
    step: '01',
    title: 'Du waehlst ein oder zwei starke Bilder',
    copy: 'Keine Galerie, kein Upload-Marathon. Es reichen die Fotos, die den Menschen oder den gemeinsamen Moment sofort treffen.',
  },
  {
    step: '02',
    title: 'Du beschreibst kurz, worauf es emotional ankommt',
    copy: 'Ein Satz zu Stimmung, Erinnerung oder Anlass hilft uns mehr als eine lange Anleitung.',
  },
  {
    step: '03',
    title: 'Du schliesst die Bestellung direkt ab',
    copy: 'Nach dem Briefing geht es ohne Umweg in die Bezahlung, damit der Auftrag sicher angelegt ist.',
  },
  {
    step: '04',
    title: 'Du verfolgst den Auftrag bis zur Auslieferung',
    copy: 'Status, Vorschau und finale Bereitstellung bleiben ueber denselben Link wieder erreichbar.',
  },
];

export default function HowItWorksPage() {
  return (
    <main className="section page-shell">
      <div className="container">
        <div className="section-heading">
          <Badge className="w-fit">so funktioniert&apos;s</Badge>
          <h1 className="h2">Von der Erinnerung bis zur Geburtstagsueberraschung in vier klaren Schritten.</h1>
          <p className="lead">
            Memories4U ist absichtlich kein grosser Konfigurator. Der Ablauf ist so gebaut, dass du schnell starten und spaeter trotzdem alles wiederfinden kannst.
          </p>
        </div>

        <div className="timeline">
          {steps.map((item) => (
            <article className="timeline-card" key={item.step}>
              <div className="timeline-step">{item.step}</div>
              <div>
                <h3>{item.title}</h3>
                <p className="copy">{item.copy}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="grid grid-2 section-top">
          <Card className="border-white/90 bg-white/78">
            <CardContent className="p-6">
              <div className="eyebrow">was du wissen solltest</div>
              <ul className="feature-list">
                <li>Kein Live-Editor vor dem Checkout</li>
                <li>Das Briefing soll schnell gehen und nicht erschlagen</li>
                <li>Der aktuelle Stand bleibt spaeter jederzeit abrufbar</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="border-white/90 bg-white/78">
            <CardContent className="p-6">
              <div className="eyebrow">wenn du bereit bist</div>
              <p className="copy">
                Wenn der Anlass klar ist und du die passenden Bilder hast, ist der Rest nur noch ein kurzer Auftrag.
              </p>
              <div className="btn-row">
                <Button asChild>
                  <Link href="/memories">Jetzt starten</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/status">Bestehenden Status oeffnen</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
