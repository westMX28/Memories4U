import Link from 'next/link';

export default function SuccessPage() {
  return (
    <main className="section page-shell">
      <div className="container">
        <div className="success-shell">
          <div className="success-badge">Zahlung erfolgreich</div>
          <h1 className="h2">Die Geburtstags-Story ist jetzt in Arbeit.</h1>
          <p className="lead">
            Dein Briefing wurde uebergeben. Von hier an laeuft die Verarbeitung im Hintergrund, bis das Ergebnis digital ausgeliefert wird.
          </p>
          <div className="grid grid-3 success-grid">
            <div className="card">
              <h3>Was schon passiert ist</h3>
              <p className="copy">Checkout und Uebergabe an den bestehenden Ablauf wurden angestossen.</p>
            </div>
            <div className="card">
              <h3>Was als Naechstes kommt</h3>
              <p className="copy">Die Szene wird erstellt und anschliessend per E-Mail verschickt.</p>
            </div>
            <div className="card">
              <h3>Was noch Platzhalter ist</h3>
              <p className="copy">Die Statusseite zeigt heute nur UI-Zustaende, keine live abgefragten Backend-Daten.</p>
            </div>
          </div>
          <div className="btn-row">
            <Link className="btn btn-primary" href="/status">
              Bearbeitungsstatus ansehen
            </Link>
            <Link className="btn btn-secondary" href="/">
              Zur Startseite
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
