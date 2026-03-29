import Link from 'next/link';

export default function MemoriesPage() {
  return (
    <main className="section">
      <div className="container grid grid-2">
        <div>
          <div className="eyebrow">produkt</div>
          <h1 className="h2">Memories4U</h1>
          <p className="lead">
            Aus euren Fotos und eurer gemeinsamen Szene entsteht ein individuelles digitales Motiv mit emotionalem Charakter.
          </p>
          <div className="list">
            <div>• 2 Bilder hochladen</div>
            <div>• kurze Szene oder Erinnerung beschreiben</div>
            <div>• bezahlen und Ergebnis digital erhalten</div>
          </div>
          <div className="btn-row">
            <a className="btn btn-primary" href="#">Formular starten</a>
            <Link className="btn btn-secondary" href="/how-it-works">Ablauf ansehen</Link>
          </div>
        </div>
        <div className="card">
          <div className="eyebrow">v1 setup</div>
          <h3>Aktueller Ablauf</h3>
          <p className="copy">
            Das Frontend wird an Tally, Stripe, Make, Google Sheets und Cloudinary angedockt. Das bestehende Backend bleibt zunächst erhalten.
          </p>
          <p className="copy"><span className="highlight">Preis / CTA / Formular-Link</span> werden im nächsten Schritt live verdrahtet.</p>
        </div>
      </div>
    </main>
  );
}
