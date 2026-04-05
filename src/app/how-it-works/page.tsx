import Link from 'next/link';

const steps = [
  {
    step: '01',
    title: 'Fotos auswaehlen',
    copy: 'Du laedst die Bilder hoch, auf denen die beteiligten Personen klar erkennbar sind. Das ist der Rohstoff fuer die Story.',
  },
  {
    step: '02',
    title: 'Gemeinsamen Moment beschreiben',
    copy: 'Ein kurzer Satz zu Stimmung, Ort oder Erinnerung reicht. Der MVP braucht keine lange Historie, sondern einen klaren emotionalen Anker.',
  },
  {
    step: '03',
    title: 'Checkout abschliessen',
    copy: 'Die Bezahlung laeuft ueber den bestehenden Flow. Danach startet die Verarbeitung im Hintergrund ohne weitere manuelle Schritte im Frontend.',
  },
  {
    step: '04',
    title: 'Digital erhalten und verschenken',
    copy: 'Das Ergebnis wird per E-Mail ausgeliefert und kann direkt weitergeschickt oder in eine Geburtstagsnachricht eingebettet werden.',
  },
];

export default function HowItWorksPage() {
  return (
    <main className="section page-shell">
      <div className="container">
        <div className="section-heading">
          <div className="eyebrow">so funktioniert&apos;s</div>
          <h1 className="h2">Der Flow ist klein gehalten, damit der Anlass im Vordergrund bleibt.</h1>
          <p className="lead">
            Diese Route erklaert den aktuellen MVP ehrlich: schneller Intake, bestehende Automationen im Hintergrund, digitale Lieferung am Ende.
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
          <div className="card">
            <div className="eyebrow">was der flow heute nicht verspricht</div>
            <ul className="feature-list">
              <li>Kein Live-Preview vor dem Checkout</li>
              <li>Keine selbstbediente Bearbeitung nach dem Absenden</li>
              <li>Kein verifiziertes Live-Tracking im Frontend</li>
            </ul>
          </div>
          <div className="card">
            <div className="eyebrow">trotzdem klar genug fuer launch</div>
            <p className="copy">
              Die Seiten setzen Erwartungshaltung sauber und lassen den bestehenden Maschinenraum unangetastet. Genau das macht den Slice schnell lieferbar.
            </p>
            <div className="btn-row">
              <Link className="btn btn-primary" href="/memories">
                Zum Produkt
              </Link>
              <Link className="btn btn-secondary" href="/status">
                Statusseite ansehen
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
