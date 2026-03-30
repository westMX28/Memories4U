import Link from 'next/link';

const bottomGallery = [
  {
    pill: 'Personalisiert',
    title: 'Dein Moment, dein Stil',
    copy: 'Bilder + Beschreibung → ein Motiv, das sich nach euch anfühlt.',
    img: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=800&q=80',
  },
  {
    pill: 'Design',
    title: 'Modern & hochwertig',
    copy: 'Klarer Look, starke Typo und sanfte Schatten für echte Geschenk-Wirkung.',
    img: 'https://images.unsplash.com/photo-1526481280695-3c687fd5432c?auto=format&fit=crop&w=800&q=80',
  },
  {
    pill: 'Einfach',
    title: 'Weniger Aufwand',
    copy: 'Upload erledigen. Wir kümmern uns um den Rest im Hintergrund.',
    img: 'https://images.unsplash.com/photo-1520975682038-b5d8a0e3c0a6?auto=format&fit=crop&w=800&q=80',
  },
  {
    pill: 'Qualität',
    title: 'Scharf bis ins Detail',
    copy: 'Farben, Kontrast und Komposition — damit es richtig gut aussieht.',
    img: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=800&q=80',
  },
  {
    pill: 'Geschenk',
    title: 'Direkt zum Verschenken',
    copy: 'Digital, schnell geteilt und perfekt, um Danke zu sagen.',
    img: 'https://images.unsplash.com/photo-1520975682038-8a2b3e8b5a65?auto=format&fit=crop&w=800&q=80',
  },
  {
    pill: 'Erinnerungen',
    title: 'Mehr als nur ein Foto',
    copy: 'Eine Geschichte, die bleibt — emotional, klar und modern.',
    img: 'https://images.unsplash.com/photo-1520975916090-6d0a2a5f7b9a?auto=format&fit=crop&w=800&q=80',
  },
];

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
          <img src="https://via.placeholder.com/600x400" alt="Example Placeholder" className="example-image" />
          <p className="example-text">
            <strong>Ich liebe es. Frank Ribery ist der beste Fußballspieler der Welt.</strong>
          </p>
          <div className="btn-row">
            <Link className="btn btn-primary" href="/memories">
              Jetzt entdecken
            </Link>
            <Link className="btn btn-secondary" href="/how-it-works">
              So funktioniert&apos;s
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container grid grid-3">
          <div className="card">
            <div className="kicker">1</div>
            <h3>Persönlich</h3>
            <p className="copy">Eure Bilder, eure Szene, eure Geschichte — nicht generisch, sondern mit emotionalem Bezug.</p>
          </div>
          <div className="card">
            <div className="kicker">2</div>
            <h3>Einfach</h3>
            <p className="copy">Bilder hochladen, kurze Beschreibung geben, bestellen. Den Rest übernimmt der Workflow im Hintergrund.</p>
          </div>
          <div className="card">
            <div className="kicker">3</div>
            <h3>Modern</h3>
            <p className="copy">Klarer, hochwertiger Stil statt kitschigem Standard-Geschenk.</p>
          </div>
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
            <Link className="btn btn-primary" href="/memories">
              Zum Produkt
            </Link>
          </div>
        </div>
      </section>

      <section className="section bottom-gallery" aria-label="Bottom gallery">
        <div className="container">
          <div className="gallery-header">
            <div className="eyebrow gallery-eyebrow">inspiration</div>
            <h2 className="h2 gallery-head">Gallery</h2>
            <p className="lead gallery-subhead">Sechs moderne Beispiele — mit echten Thumbnails und klarer Karten-Optik.</p>
          </div>

          <div className="gallery-grid">
            {bottomGallery.map((card, idx) => (
              <article className="gallery-card" key={idx}>
                <div className="gallery-media" aria-hidden="true">
                  <img className="gallery-thumb" src={card.img} alt="" loading="lazy" />
                  <div className="gallery-mediaOverlay" />
                </div>

                <div className="gallery-pill">{card.pill}</div>
                <h3 className="gallery-title">{card.title}</h3>
                <p className="gallery-copy">{card.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
