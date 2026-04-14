import Link from 'next/link';
import { ArrowUpRight, LockKeyhole, MailCheck, WandSparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { isMemoriesOrderingAvailable } from '@/lib/memories/public-flow';

export function Footer() {
  const orderingAvailable = isMemoriesOrderingAvailable();

  return (
    <footer className="footer">
      <div className="container space-y-6">
        <Card className="overflow-hidden border-white/90 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(232,243,255,0.9))]">
          <CardContent className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:p-8">
            <div className="space-y-4">
              <Badge className="w-fit accent-chip" variant="secondary">Premium birthday gifting</Badge>
              <div className="space-y-3">
                <div className="footer-title">Memories4U</div>
                <p className="max-w-[44ch] text-base leading-7 text-slate-600">
                  For birthdays that deserve more than a generic gift: a calm digital flow from
                  memory cue to finished story, with a private path that stays with the order.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/80 px-4 py-2">
                  <WandSparkles className="size-4 text-sky-700" />
                  emotional, not generic
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/80 px-4 py-2 accent-chip">
                  <LockKeyhole className="size-4 text-sky-700" />
                  private status path
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/80 px-4 py-2">
                  <MailCheck className="size-4 text-sky-700" />
                  clear delivery access
                </span>
              </div>
            </div>

            <div className="grid gap-4 rounded-[28px] border border-white/80 bg-white/76 p-5 shadow-[0_18px_40px_rgba(148,163,184,0.12)]">
              <div>
                <div className="footer-kicker">next best action</div>
                <p className="mb-0 mt-3 text-sm leading-7 text-slate-600">
                  {orderingAvailable
                    ? 'Start the birthday order, continue through checkout, and come back through the same private status route when needed.'
                    : 'New ordering is paused, but existing orders can still be opened through the private status page.'}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href={orderingAvailable ? '/memories' : '/status'}>
                    {orderingAvailable ? 'Start the gift' : 'Open status'}
                    <ArrowUpRight />
                  </Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/">Homepage</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="footer-grid">
          <div className="footer-meta">
            <span>
              Editorial calm, light surfaces, clear hierarchy, and as little friction as possible in
              the birthday purchase path.
            </span>
            <span>
              {orderingAvailable
                ? 'Landing page, order start, checkout, and private status remain intentionally connected.'
                : 'The homepage and status route remain available until ordering is switched back on.'}
            </span>
          </div>
          <div className="footer-links" aria-label="Schnellzugriff">
            <Link href="/">Homepage</Link>
            <Link href="/memories">
              {orderingAvailable ? 'Start order' : 'Ordering pause'}
            </Link>
            <Link href="/status">Private status</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
