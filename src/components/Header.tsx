import Link from 'next/link';

export function Header() {
  return (
    <header className="header">
      <div className="container nav">
        <Link href="/" className="brand">Memories4U</Link>
        <nav className="nav-links">
          <Link href="/memories">Produkt</Link>
          <Link href="/how-it-works">So funktioniert&apos;s</Link>
          <Link href="/status">Status</Link>
        </nav>
      </div>
    </header>
  );
}
