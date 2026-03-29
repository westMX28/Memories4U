import Link from 'next/link';

export default function SuccessPage() {
  return (
    <main className="section">
      <div className="container card">
        <div className="eyebrow">danke</div>
        <h1 className="h2">Deine Bestellung ist eingegangen.</h1>
        <p className="lead">Die Verarbeitung läuft jetzt im Hintergrund. Über die Statusseite kann später der Fortschritt geprüft werden.</p>
        <div className="btn-row">
          <Link className="btn btn-primary" href="/status">Zum Status</Link>
          <Link className="btn btn-secondary" href="/">Zur Startseite</Link>
        </div>
      </div>
    </main>
  );
}
