export default function HowItWorksPage() {
  return (
    <main className="section">
      <div className="container">
        <div className="eyebrow">so funktioniert&apos;s</div>
        <h1 className="h2">In vier einfachen Schritten.</h1>
        <div className="grid grid-2">
          <div className="card"><h3>1. Fotos hochladen</h3><p className="copy">Du gibst die Bilder an, auf denen die Personen klar zu erkennen sind.</p></div>
          <div className="card"><h3>2. Szene beschreiben</h3><p className="copy">Du beschreibst kurz den gemeinsamen Moment oder die Stimmung, die erinnert werden soll.</p></div>
          <div className="card"><h3>3. Bestellung abschließen</h3><p className="copy">Die Bezahlung läuft über Stripe, danach startet die Verarbeitung automatisch.</p></div>
          <div className="card"><h3>4. Ergebnis erhalten</h3><p className="copy">Du bekommst das fertige Motiv digital ausgeliefert und kannst es direkt verschenken.</p></div>
        </div>
      </div>
    </main>
  );
}
