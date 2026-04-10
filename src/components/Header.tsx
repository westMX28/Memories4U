import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { isMemoriesOrderingAvailable } from '@/lib/memories/public-flow';

export function Header() {
  const orderingAvailable = isMemoriesOrderingAvailable();

  return (
    <header className="header">
      <div className="container nav">
        <div className="flex items-center gap-3">
          <Link href="/" className="brand">
            <span className="brand-mark" aria-hidden="true">
              <span className="brand-mark-core" />
              <span className="brand-mark-spark brand-mark-spark-top" />
              <span className="brand-mark-spark brand-mark-spark-bottom" />
            </span>
            <span className="brand-copy">
              <span className="brand-name">Memories4U</span>
              <span className="brand-tagline">birthday stories that feel personal</span>
            </span>
          </Link>
          <Badge className="hidden xl:inline-flex" variant="secondary">
            made for meaningful birthdays
          </Badge>
        </div>
        <nav className="nav-links">
          <Link href="/">Start</Link>
          <Link href="/memories">
            {orderingAvailable ? 'Bestellen' : 'Bestellpause'}
          </Link>
          <Link href="/how-it-works">Ablauf</Link>
          <Link href="/status">Status</Link>
        </nav>
        <Button asChild size="sm" className="nav-cta border-0 px-4">
          <Link href={orderingAvailable ? '/memories' : '/status'}>
            {orderingAvailable ? 'Jetzt ueberraschen' : 'Auftrag verfolgen'}
          </Link>
        </Button>
      </div>
    </header>
  );
}
