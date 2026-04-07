import { Badge } from '@/components/ui/badge';

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <Badge className="mb-4">white + light blue pass</Badge>
          <div className="footer-title">Memories4U</div>
          <p className="footer-copy">
            Fuer Geburtstage, bei denen ein normales Geschenk zu beliebig waere: aus euren Fotos, einem kurzen Moment und viel Gefuehl gebaut.
          </p>
        </div>
        <div className="footer-meta">
          <span>Persoenlich statt generisch. Digital statt last-minute Stress. Schnell genug fuer enge Deadlines.</span>
          <span>Start, Bestellung und Status sind bewusst einfach gehalten, damit der Anlass im Vordergrund bleibt.</span>
        </div>
      </div>
    </footer>
  );
}
