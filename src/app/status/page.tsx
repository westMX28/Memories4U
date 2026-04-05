import Link from 'next/link';

export default function StatusPage() {
  return (
    <main className="section page-shell">
      <div className="container">
        <div className="section-heading">
          <div className="eyebrow">status</div>
          <h1 className="h2">Diese Seite ist die ruhige Zwischenstation nach dem Checkout.</h1>
          <p className="lead">
            Fuer den MVP kommuniziert sie Fortschritt und Erwartungshaltung. Eine echte Live-Abfrage ist hier noch nicht angebunden.
          </p>
        </div>

        <div className="status-board">
          <div className="status-stage status-stage-active">
            <span className="status-dot" />
            <div>
              <strong>Briefing eingegangen</strong>
              <p>Deine Fotos und Angaben wurden in den bestehenden Verarbeitungsfluss uebergeben.</p>
            </div>
          </div>
          <div className="status-stage">
            <span className="status-dot" />
            <div>
              <strong>Szene wird erstellt</strong>
              <p>Die eigentliche Bild- und Story-Erzeugung passiert ausserhalb dieser Frontend-Schicht.</p>
            </div>
          </div>
          <div className="status-stage">
            <span className="status-dot" />
            <div>
              <strong>Digitale Zustellung</strong>
              <p>Das finale Ergebnis wird per E-Mail ausgeliefert, sobald der bestehende Automationspfad fertig ist.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-2 section-top">
          <div className="card">
            <div className="eyebrow">wichtiger hinweis</div>
            <p className="copy">
              Die Statusanzeige ist derzeit bewusst statisch. Wenn spaeter eine Backend- oder Sheet-Abfrage freigegeben wird, kann diese Seite darauf aufbauen.
            </p>
          </div>
          <div className="card">
            <div className="eyebrow">naechster schritt</div>
            <div className="btn-row">
              <Link className="btn btn-primary" href="/success">
                Erfolgsseite ansehen
              </Link>
              <Link className="btn btn-secondary" href="/">
                Zur Startseite
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
