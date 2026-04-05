import Link from 'next/link';

export function Header() {
  return (
    <header className="header">
      <div className="container nav">
        <Link href="/" className="brand">
          <span className="brand-mark">M</span>
          <span>Memories4U</span>
        </Link>
        <nav className="nav-links">
          <Link href="/memories">Starten</Link>
          <Link href="/how-it-works">So funktioniert&apos;s</Link>
          <Link href="/status">Status</Link>
        </nav>
        <Link href="/memories" className="nav-cta">
          Geburtstag vorbereiten
        </Link>
      </div>
    </header>
  );
}
