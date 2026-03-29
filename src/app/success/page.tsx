import Link from 'next/link';

export default function SuccessPage() {
  return (
    <main className="section">
      <div className="container card">
        <div className="eyebrow">zahlung erfolgreich</div>
        <h1 className="h2">Dein Bild wird gerade erstellt.</h1>
        <p className="lead">
          Die Verarbeitung läuft jetzt im Hintergrund. In Kürze wird das Ergebnis per E-Mail zugestellt.
        </p>
        <div className="btn-row">
          <Link className="btn btn-primary" href="/status">Bearbeitungsstatus ansehen</Link>
          <Link className="btn btn-secondary" href="/">Zur Startseite</Link>
        </div>
      </div>
    </main>
  );
}
