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
        <div className="flex items-center gap-4">
          <Link href="/" className="brand">
            <span className="brand-mark" aria-hidden="true">
              <span className="brand-mark-core" />
              <span className="brand-mark-spark brand-mark-spark-top" />
              <span className="brand-mark-spark brand-mark-spark-bottom" />
            </span>
            <span className="brand-copy">
              <span className="brand-name">Memories4U</span>
              <span className="brand-tagline">premium birthday stories</span>
            </span>
          </Link>
          <Badge className="hidden xl:inline-flex accent-chip" variant="secondary">
            calm, premium, direct
          </Badge>
        </div>

        <nav className="nav-links">
          <Link href="/">Home</Link>
          <Link href="/memories">
            {orderingAvailable ? 'Order' : 'Ordering pause'}
          </Link>
          <Link href="/how-it-works">How it works</Link>
          <Link href="/status">Private status</Link>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <div className="flex items-center gap-3 rounded-full border border-white/80 bg-white/78 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 shadow-[0_18px_44px_rgba(148,163,184,0.16)]">
            {orderingAvailable ? <Gift className="size-3.5 text-sky-700" /> : <Clock3 className="size-3.5 text-amber-700" />}
            <span>{orderingAvailable ? 'birthday-first flow' : 'ordering pause'}</span>
            <span>{orderingAvailable ? 'starting price visible upfront' : 'status still available'}</span>
            <Separator orientation="vertical" className="h-4 bg-slate-200/80" />
            <span className={orderingAvailable ? 'text-sky-800' : 'text-amber-800'}>
              {orderingAvailable ? 'checkout and status stay linked' : 'existing orders still reachable'}
            </span>
          </div>

          <Button asChild size="sm" className="nav-cta border-0 px-4">
            <Link href={orderingAvailable ? '/memories' : '/status'}>
              {orderingAvailable ? 'Start the gift' : 'Track order'}
              {orderingAvailable ? <Sparkles /> : <ArrowUpRight />}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
