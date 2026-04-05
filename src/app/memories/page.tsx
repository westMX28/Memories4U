import Link from 'next/link';

const TALLY_BASE = 'https://tally.so/r/Y50qMJ';

function buildTallyUrl() {
  const params = new URLSearchParams({ Job_id: `m4u_${Date.now()}` });
  return `${TALLY_BASE}?${params.toString()}`;
}

export default function MemoriesPage() {
  const tallyUrl = buildTallyUrl();

  return (
    <main className="section page-shell">
      <div className="container grid grid-2 page-grid">
        <div className="page-intro">
          <div className="eyebrow">produkt</div>
          <h1 className="h2">Starte die Geburtstags-Story mit genau den Infos, die der MVP heute verarbeiten kann.</h1>
          <p className="lead">
            Zwei Fotos, eine kurze Beschreibung, ein Anlass. Mehr braucht es nicht, um den bestehenden Tally- und Zahlungsflow sinnvoll zu fuettern.
          </p>
          <div className="list">
            <div>Start in unter drei Minuten</div>
            <div>MVP-Preis fuer die Standardvariante: 1,99 EUR</div>
            <div>Digitale Zustellung per E-Mail nach Verarbeitung</div>
            <div>Kein neuer Account und kein App-Download noetig</div>
          </div>
          <div className="btn-row">
            <a className="btn btn-primary" href={tallyUrl}>
              Geschenk jetzt starten
            </a>
            <Link className="btn btn-secondary" href="/how-it-works">
              Ablauf vorher lesen
            </Link>
          </div>
        </div>

        <div className="stack">
          <div className="card">
            <div className="eyebrow">was du vorbereiten solltest</div>
            <h3>Kurzes Briefing statt langem Fragebogen</h3>
            <ul className="feature-list">
              <li>Ein Bild von dir oder euch</li>
              <li>Ein Bild der Person mit Geburtstag</li>
              <li>Ein Satz zur gemeinsamen Erinnerung oder Stimmung</li>
              <li>Optional eine Widmung, die im Ergebnis mitschwingen soll</li>
            </ul>
          </div>

          <div className="card">
            <div className="eyebrow">bestehender backend-pfad</div>
            <h3>Diese Seite erfindet keine neue Infrastruktur.</h3>
            <p className="copy">
              Das Frontend fuehrt in den bereits vorhandenen Tally-, Stripe- und Make-Flow. Live-Statusabfragen oder neue API-Vertraege sind in diesem Slice bewusst nicht enthalten.
            </p>
          </div>
        </div>
      </div>

      <div className="container section-top">
        <div className="section-heading">
          <div className="eyebrow">vor dem klick</div>
          <h2 className="h2">Wann dieses Angebot besonders gut passt.</h2>
        </div>
        <div className="grid grid-3">
          <div className="card">
            <h3>Last-Minute Geburtstage</h3>
            <p className="copy">Wenn ein physisches Geschenk zu spaet kommt, aber persoenliche Wirkung trotzdem zaehlt.</p>
          </div>
          <div className="card">
            <h3>Fernbeziehungen und Distanz</h3>
            <p className="copy">Wenn das Geschenk digital ankommen soll, ohne kalt oder austauschbar zu wirken.</p>
          </div>
          <div className="card">
            <h3>Menschen mit gemeinsamer Geschichte</h3>
            <p className="copy">Je konkreter eure Erinnerung, desto staerker wirkt die Szene im finalen Ergebnis.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
