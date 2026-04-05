import Link from 'next/link';

const storyProof = [
  {
    label: '01',
    title: 'Aus zwei Fotos wird ein gemeinsamer Geburtstagsmoment',
    copy: 'Kein Collagen-Kitsch. Sondern eine aufbereitete Szene mit emotionalem Fokus und persoenlichem Text.',
  },
  {
    label: '02',
    title: 'Schnell genug fuer Last-Minute, gut genug fuer echte Wirkung',
    copy: 'Der MVP fuehrt direkt in den bestehenden Checkout und die automatisierte Auslieferung per E-Mail.',
  },
  {
    label: '03',
    title: 'Der Ablauf fuehlt sich wie ein Produkt an, nicht wie ein Formularrest',
    copy: 'Homepage, Produktseite, Erklaerung, Erfolg und Status sprechen jetzt dieselbe Sprache.',
  },
];

export default function HomePage() {
  return (
    <main>
      <section className="hero hero-home">
        <div className="container">
          <div className="hero-grid">
            <div>
              <div className="eyebrow">birthday-story mvp</div>
              <h1 className="h1">Mach aus euren Erinnerungen ein Geburtstagsgeschenk mit Rueckgrat.</h1>
              <p className="lead">
                Memories4U formt Fotos, Anlass und Stimmung zu einer digitalen Story, die persoenlich wirkt, sofort verschickt werden kann und nicht wie ein Standard-Gutschein endet.
              </p>
              <div className="hero-note">
                <span className="hero-note-label">Ideal fuer</span>
                Partner:innen, beste Freund:innen, Geschwister und alle, bei denen ein normales Bild zu wenig waere.
              </div>
              <div className="btn-row">
                <Link className="btn btn-primary" href="/memories">
                  Geburtstag jetzt vorbereiten
                </Link>
                <Link className="btn btn-secondary" href="/how-it-works">
                  Ablauf ansehen
                </Link>
              </div>
            </div>

            <div className="story-panel">
              <div className="story-panel-top">
                <span className="story-chip">Geburtstag</span>
                <span className="story-chip">Digital geliefert</span>
              </div>
              <div className="story-canvas">
                <div className="story-orbit story-orbit-left" />
                <div className="story-orbit story-orbit-right" />
                <div className="story-card story-card-main">
                  <div className="story-card-label">Fuer Lena, 29</div>
                  <h2>Weil sie jedes Jahr denselben Wunsch hat: etwas mit Bedeutung.</h2>
                  <p>
                    Strandfoto plus Konzertfoto rein. Daraus wird eine gemeinsame Szene mit Geburtstagsstimmung und einer persoenlichen Widmung.
                  </p>
                </div>
                <div className="story-card story-card-side">
                  <span className="mini-kicker">Was der MVP heute kann</span>
                  <ul className="feature-list">
                    <li>Zwei Fotos und kurze Szene erfassen</li>
                    <li>Bestehenden Tally-Flow direkt nutzen</li>
                    <li>Ergebnis digital per E-Mail versenden</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container">
          <div className="section-heading">
            <div className="eyebrow">warum das funktioniert</div>
            <h2 className="h2">Ein kleines MVP, aber mit klarer Geschenklogik.</h2>
          </div>
          <div className="grid grid-3">
            <div className="card">
              <div className="kicker">1</div>
              <h3>Persoenlicher Startpunkt</h3>
              <p className="copy">Die Story beginnt bei euren echten Bildern und einem konkreten Anlass, nicht bei Templates ohne Kontext.</p>
            </div>
            <div className="card">
              <div className="kicker">2</div>
              <h3>Radikal einfacher Ablauf</h3>
              <p className="copy">Der Funnel fuehrt direkt vom Geschenkversprechen in den bestehenden Intake, ohne Umwege oder neue Datenanforderungen.</p>
            </div>
            <div className="card">
              <div className="kicker">3</div>
              <h3>Fuer digitale Uebergabe gebaut</h3>
              <p className="copy">Das Endergebnis ist sofort teilbar und passt zu spontanen oder entfernten Geburtstagsmomenten.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container spotlight">
          <div className="spotlight-copy">
            <div className="eyebrow">was du verschenkst</div>
            <h2 className="h2">Nicht nur ein Bild, sondern ein sauber gefuehrter Moment.</h2>
            <p className="lead">
              Die Story ist fuer den Geburtstag gerahmt: kurze Widmung, emotionale Szene, moderne Aufbereitung und eine Lieferung, die auch in letzter Minute noch funktioniert.
            </p>
          </div>
          <div className="spotlight-metrics">
            <div className="metric-card">
              <span className="metric-value">2</span>
              <span className="metric-label">Fotos reichen fuer den Start</span>
            </div>
            <div className="metric-card">
              <span className="metric-value">&lt; 3 Min</span>
              <span className="metric-label">bis zum abgeschickten Briefing</span>
            </div>
            <div className="metric-card">
              <span className="metric-value">1,99 EUR</span>
              <span className="metric-label">MVP-Preis fuer die Standardvariante</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section" aria-label="Produktbeweise">
        <div className="container">
          <div className="section-heading">
            <div className="eyebrow">mvp jetzt</div>
            <h2 className="h2">Die neue Frontend-Schicht macht drei Dinge klar.</h2>
            <p className="lead">Sie verkauft den Anlass, setzt Erwartungshaltung sauber und laesst genug Raum fuer die bestehende Backend-Automation.</p>
          </div>
          <div className="proof-grid">
            {storyProof.map((item) => (
              <article className="proof-card" key={item.label}>
                <span className="proof-label">{item.label}</span>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container cta-band">
          <div>
            <div className="eyebrow">bereit zum testen</div>
            <h2 className="h2">Wenn der Geburtstag nah ist, sollte der erste Klick eindeutig sein.</h2>
          </div>
          <div className="btn-row">
            <Link className="btn btn-primary" href="/memories">
              Geschenk starten
            </Link>
            <Link className="btn btn-secondary" href="/status">
              Statusseite ansehen
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
