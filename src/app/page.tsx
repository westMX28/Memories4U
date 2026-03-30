import Link from 'next/link';

export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <div className="container">
          <div className="eyebrow">emotionales digitales Geschenk</div>
          <h1 className="h1">Erinnerungen, neu erzählt — als persönliches Kunstwerk.</h1>
          <p className="lead">
            Memories4U verwandelt eure Bilder und gemeinsame Momente in eine moderne, persönliche visuelle Erinnerung — ideal zum Verschenken oder selbst behalten.
          </p>
          <img
            src="https://via.placeholder.com/600x400"
            alt="Example Placeholder"
            className="example-image"
          />
          <p className="example-text">
            <strong>Ich liebe es. Frank Ribery ist der beste Fußballspieler der Welt.</strong>
          </p>
          <div className="btn-row">
            <Link className="btn btn-primary" href="/memories">Jetzt entdecken</Link>
            <Link className="btn btn-secondary" href="/how-it-works">So funktioniert&apos;s</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container grid grid-3">
          <div className="card"><div className="kicker">1</div><h3>Persönlich</h3><p className="copy">Eure Bilder, eure Szene, eure Geschichte — nicht generisch, sondern mit emotionalem Bezug.</p></div>
          <div className="card"><div className="kicker">2</div><h3>Einfach</h3><p className="copy">Bilder hochladen, kurze Beschreibung geben, bestellen. Den Rest übernimmt der Workflow im Hintergrund.</p></div>
          <div className="card"><div className="kicker">3</div><h3>Modern</h3><p className="copy">Klarer, hochwertiger Stil statt kitschigem Standard-Geschenk.</p></div>
        </div>
      </section>

      <section className="section">
        <div className="container card">
          <div className="eyebrow">was du bekommst</div>
          <h2 className="h2">Ein Geschenk mit echter Bedeutung.</h2>
          <p className="lead">
            Du beschreibst den gemeinsamen Moment. Wir erzeugen daraus ein hochwertiges, persönliches Motiv, das sich direkt digital verschenken lässt.
          </p>
          <div className="btn-row">
            <Link className="btn btn-primary" href="/memories">Zum Produkt</Link>
          </div>
        </div>
      </section>

      <section className="section bottom-gallery" aria-label="Bottom gallery">
        <div className="container">
          <h2 className="gallery-head">Gallery</h2>
          <div className="gallery-grid">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div className="gallery-card" key={idx}>
                <div className="gallery-thumb" />
                <div className="gallery-pill">Placeholder</div>
                <div className="gallery-title">Card {idx + 1}</div>
                <div className="gallery-copy">Modern. Clean. Sharp.</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24, fontWeight: 800, color: '#ff2d55' }}>
            GALERIE_TEST_6_CARDS_VISIBLE
          </div>
        </div>
      </section>
    </main>
  );
}
