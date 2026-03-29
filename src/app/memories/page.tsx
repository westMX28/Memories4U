import Link from 'next/link';

const TALLY_BASE = 'https://tally.so/r/Y50qMJ';

function buildTallyUrl() {
  const params = new URLSearchParams({ Job_id: `m4u_${Date.now()}` });
  return `${TALLY_BASE}?${params.toString()}`;
}

export default function MemoriesPage() {
  const tallyUrl = buildTallyUrl();

  return (
    <main className="section">
      <div className="container grid grid-2">
        <div>
          <div className="eyebrow">produkt</div>
          <h1 className="h2">Verwandle eure Fotos in eine Szene, die wirklich verbindet.</h1>
          <p className="lead">
            Du lädst zwei Bilder hoch, beschreibst kurz den gemeinsamen Moment — und daraus entsteht ein persönliches digitales Geschenk, perfekt zum Verschicken.
          </p>
          <div className="list">
            <div>• Bilder hochladen in unter 60 Sekunden</div>
            <div>• gemeinsame Szene kurz beschreiben</div>
            <div>• Standardvariante für 1,99 €</div>
            <div>• Ergebnis digital und sofort teilbar</div>
          </div>
          <div className="btn-row">
            <a className="btn btn-primary" href={tallyUrl}>Geschenk jetzt starten</a>
            <Link className="btn btn-secondary" href="/how-it-works">So funktioniert's</Link>
          </div>
        </div>
        <div className="card">
          <div className="eyebrow">aktueller flow</div>
          <h3>Schon mit deinem bestehenden Setup verdrahtet</h3>
          <p className="copy">
            Formular über Tally, Zahlung über Stripe, Verarbeitung über Make, Status in Google Sheets, Ergebnis über Cloudinary und Auslieferung per E-Mail.
          </p>
          <p className="copy">
            Diese neue Seite dient jetzt als steuerbares Frontend über dem bestehenden Maschinenraum.
          </p>
        </div>
      </div>
    </main>
  );
}
