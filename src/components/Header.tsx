import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="header">
      <div className="container nav">
        <div className="flex items-center gap-3">
          <Link href="/" className="brand">
            <span className="brand-mark">M</span>
            <span>Memories4U</span>
          </Link>
          <Badge className="hidden lg:inline-flex">digital gifting</Badge>
        </div>
        <nav className="nav-links">
          <Link href="/">Start</Link>
          <Link href="/memories">Bestellen</Link>
          <Link href="/how-it-works">Ablauf</Link>
          <Link href="/status">Status</Link>
        </nav>
        <Button asChild size="sm" className="nav-cta border-0 px-4">
          <Link href="/memories">Jetzt ueberraschen</Link>
        </Button>
      </div>
    </header>
  );
}
