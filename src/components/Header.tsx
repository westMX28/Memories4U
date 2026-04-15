import Link from 'next/link';
import { ArrowUpRight, Clock3, Gift, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { isMemoriesOrderingAvailable } from '@/lib/memories/public-flow';

export function Header() {
  const orderingAvailable = isMemoriesOrderingAvailable();

  return (
    <header className="header">
      <div className="container nav">
        <Link href="/" className="header-brand">
          <div className="header-logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect width="32" height="32" rx="8" fill="url(#gradient)" />
              <path d="M16 8C11.6 8 8 11.6 8 16C8 20.4 11.6 24 16 24C20.4 24 24 20.4 24 16C24 11.6 20.4 8 16 8ZM14 20L10 16L11.4 14.6L14 17.2L20.6 10.6L22 12L14 20Z" fill="white" />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#449cfa" />
                  <stop offset="100%" stopColor="#0058bc" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="header-branding">
            <span className="header-name">Memories4U</span>
            <span className="header-tagline">Premium birthday gifts</span>
          </div>
        </Link>

        <nav className="header-nav">
          <Link href="/how-it-works" className="header-nav-link">How it works</Link>
          <Link href="/memories" className="header-nav-link">
            {orderingAvailable ? 'Create' : 'Ordering pause'}
          </Link>
        </nav>

        <div className="header-cta">
          {orderingAvailable && (
            <Button asChild size="sm" className="header-btn">
              <Link href="/memories">
                Start crerating
                <Sparkles className="size-4" />
              </Link>
            </Button>
          )}
          <Button asChild size="sm" className="header-btn">
            <Link href={orderingAvailable ? '/memories' : '/status'}>
              {orderingAvailable ? 'Start gifting' : 'Check order'}
              {orderingAvailable ? <Sparkles className="size-4" /> : <ArrowUpRight className="size-4" />}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
