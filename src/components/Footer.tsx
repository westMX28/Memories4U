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
          <CardContent className="grid gap-6 p-6 sm:gap-8 sm:p-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,1fr)] lg:p-10">
            <div className="space-y-6">
              <Badge className="w-fit accent-chip" variant="secondary">
                Premium birthday stories
              </Badge>
              <div className="space-y-4">
                <div className="footer-title text-[clamp(1.6rem,3vw,2.2rem)]">Memories4U</div>
                <p className="max-w-[42ch] text-[0.95rem] leading-7 text-slate-700">
                  A thoughtful digital gift service that transforms personal memories into
                  beautiful, handcrafted stories for birthdays that deserve something meaningful.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs sm:gap-3 sm:text-sm">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-100 bg-white/85 px-3 py-2 sm:gap-2 sm:px-4">
                  <WandSparkles className="size-3 text-sky-700 sm:size-4" />
                  <span>Emotionally intentional</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-100 bg-white/85 px-3 py-2 sm:gap-2 sm:px-4">
                  <LockKeyhole className="size-3 text-sky-700 sm:size-4" />
                  <span>Completely private</span>
                </span>
                <span className="hidden items-center gap-1.5 rounded-full border border-sky-100 bg-white/85 px-3 py-2 sm:inline-flex sm:gap-2 sm:px-4">
                  <MailCheck className="size-3 text-sky-700 sm:size-4" />
                  <span>Seamless delivery</span>
                </span>
              </div>
            </div>

            <div className="grid gap-4 rounded-[24px] border border-white/75 bg-white/80 p-5 shadow-[0_20px_48px_rgba(148,163,184,0.1)] sm:rounded-[32px] sm:p-7">
              <div>
                <div className="footer-kicker text-xs sm:text-sm">Get started</div>
                <p className="mb-0 mt-2 text-xs leading-6 text-slate-700 sm:mt-3 sm:text-sm sm:leading-7">
                  {orderingAvailable
                    ? 'Share photos and memories. Complete checkout. Your link stays with you.'
                    : 'Existing orders remain accessible. New gifting resumes soon.'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <Button asChild className="h-9 flex-shrink-0 sm:h-11">
                  <Link href={orderingAvailable ? '/memories' : '/status'}>
                    {orderingAvailable ? 'Create gift' : 'View order'}
                    <ArrowUpRight className="size-3.5 sm:size-4" />
                  </Link>
                </Button>
                <Button asChild variant="secondary" className="h-9 flex-shrink-0 sm:h-11">
                  <Link href="/">Back home</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="footer-grid">
          <div className="footer-meta text-sm">
            <span>
              A premium gift experience designed for thoughtfulness. Beautiful, intentional, and as
              simple as possible.
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
            <Link href="/examples">Examples</Link>
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
