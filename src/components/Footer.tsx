import Link from 'next/link';
import { isMemoriesOrderingAvailable } from '@/lib/memories/public-flow';

export function Footer() {
  const orderingAvailable = isMemoriesOrderingAvailable();

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="footer-title">Memories4U</div>
          <div className="footer-kicker">Digital birthday gifting with emotional weight</div>
          <p className="footer-copy">
            Fuer Geburtstage, bei denen ein normales Geschenk zu beliebig waere: aus euren Bildern, einem kurzen Moment und viel Gefuehl gebaut.
          </p>
        </div>
        <div className="footer-meta">
          <span>Persoenlich statt generisch. Digital statt last-minute Stress. Schnell genug fuer enge Deadlines.</span>
          <span>
            {orderingAvailable
              ? 'Start, Bestellung und Status bleiben bewusst klar, damit der Anlass im Vordergrund steht.'
              : 'Startseite und Status bleiben erreichbar, bis neue Bestellungen in dieser Umgebung wieder freigeschaltet sind.'}
          </span>
        </div>
        <div className="footer-links" aria-label="Schnellzugriff">
          <Link href="/">Startseite</Link>
          <Link href="/memories">
            {orderingAvailable ? 'Briefing starten' : 'Bestellpause'}
          </Link>
          <Link href="/status">Auftragsstatus</Link>
        </div>
      </div>
    </footer>
  );
}
