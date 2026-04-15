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
      <div className="container space-y-8">
        <Card className="overflow-hidden border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.93),rgba(232,243,255,0.88))]">
          <CardContent className="grid gap-8 p-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,1fr)] lg:p-10">
            <div className="space-y-6">
              <Badge className="w-fit accent-chip" variant="secondary">Premium birthday stories</Badge>
              <div className="space-y-4">
                <div className="footer-title text-[clamp(1.6rem,3vw,2.2rem)]">Memories4U</div>
                <p className="max-w-[42ch] text-[0.95rem] leading-7 text-slate-700">
                  A thoughtful digital gift service that transforms personal memories into beautiful,
                  handcrafted stories for birthdays that deserve something meaningful.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/85 px-4 py-2.5">
                  <WandSparkles className="size-4 text-sky-700" />
                  Emotionally intentional
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/85 px-4 py-2.5">
                  <LockKeyhole className="size-4 text-sky-700" />
                  Completely private
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/85 px-4 py-2.5">
                  <MailCheck className="size-4 text-sky-700" />
                  Seamless delivery
                </span>
              </div>
            </div>

            <div className="grid gap-4 rounded-[32px] border border-white/75 bg-white/80 p-7 shadow-[0_20px_48px_rgba(148,163,184,0.1)]">
              <div>
                <div className="footer-kicker">Get started</div>
                <p className="mb-0 mt-3 text-sm leading-7 text-slate-700">
                  {orderingAvailable
                    ? 'Begin your gift now. Share photos, memories, and complete checkout. Your private status link stays with you.'
                    : 'Existing orders remain accessible through the private status page. New orders resume soon.'}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild className="flex-shrink-0">
                  <Link href={orderingAvailable ? '/memories' : '/status'}>
                    {orderingAvailable ? 'Create gift' : 'View order'}
                    <ArrowUpRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="secondary" className="flex-shrink-0">
                  <Link href="/">Back home</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="footer-grid">
          <div className="footer-meta text-sm">
            <span>
              A premium gift experience designed for thoughtfulness. Beautiful, intentional, and as simple as possible.
            </span>
            <span>
              {orderingAvailable
                ? 'From browse to delivery, every touchpoint is designed to honor the significance of a birthday gift.'
                : 'The service remains available for existing orders. New gifting will resume soon.'}
            </span>
          </div>
          <div className="footer-links">
            <Link href="/">Home</Link>
            <Link href="/how-it-works">How it works</Link>
            <Link href="/memories">
              {orderingAvailable ? 'Create' : 'Pause'}
            </Link>
            <Link href="/status">Order status</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
