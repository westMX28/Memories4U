import Link from 'next/link';
import { Lock, RefreshCcw, Zap } from 'lucide-react';
import { StatusLookup } from '@/components/StatusLookup';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { isMemoriesOrderingAvailable } from '@/lib/memories/public-flow';

export default async function StatusPage({
  searchParams,
}: {
  searchParams: Promise<{ jobId?: string; accessToken?: string; checkout?: string }>;
}) {
  const params = await searchParams;
  const orderingAvailable = isMemoriesOrderingAvailable();
  const checkoutCancelled = params.checkout === 'cancelled';

  return (
    <main className="section page-shell">
      <div className="container space-y-8">
        {/* Hero Section */}
        <Card className="overflow-hidden card-hero">
          <CardContent className="grid gap-8 p-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:p-10">
            <div className="space-y-6">
              <Badge className="w-fit accent-chip">Your private order space</Badge>
              <div className="space-y-4">
                <h1 className="h2 max-w-[14ch]">Your order. Your control. Your link.</h1>
                <p className="lead max-w-[60ch]">
                  A calm place to track progress, complete payment if needed, or download your gift. Everything through one private link. Permanently.
                </p>
              </div>

              {checkoutCancelled ? (
                <div className="rounded-[24px] border border-amber-200 bg-amber-50/90 px-6 py-4 text-sm leading-7 text-amber-900">
                  <p className="mb-0 font-semibold">Payment was interrupted.</p>
                  <p className="mb-0 mt-1">Your gift is waiting. Complete payment below to finish your order.</p>
                </div>
              ) : null}
            </div>

            {/* Info Cards */}
            <div className="grid gap-4">
              <Card className="card-neutral">
                <CardHeader>
                  <Badge className="w-fit accent-chip" variant="secondary">How this works</Badge>
                  <CardTitle className="text-lg">No account. No login. Just your link.</CardTitle>
                  <CardDescription className="text-sm">
                    Bookmark this page. Share it if needed. It's yours forever.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="card-subtle">
                <CardContent className="flex gap-4 p-5">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Lock className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-base leading-tight font-semibold">Private and secure</h3>
                    <p className="text-sm text-slate-600 mb-0 mt-1">
                      Your order ID and token are your access. No tracking, no data sales.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-subtle">
                <CardContent className="flex gap-4 p-5">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <RefreshCcw className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-base leading-tight font-semibold">Live updates</h3>
                    <p className="text-sm text-slate-600 mb-0 mt-1">
                      This page shows real-time progress while your gift is being created.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-subtle">
                <CardContent className="flex gap-4 p-5">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Zap className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-base leading-tight font-semibold">Come back anytime</h3>
                    <p className="text-sm text-slate-600 mb-0 mt-1">
                      Payment interrupted? Return with this link whenever you're ready.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Status Lookup Component */}
        <StatusLookup
          initialJobId={params.jobId}
          initialAccessToken={params.accessToken}
          checkoutCancelled={checkoutCancelled}
        />

        {/* Bottom Info */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="card-subtle">
            <CardHeader>
              <Badge className="w-fit accent-chip" variant="secondary">Honesty</Badge>
              <CardTitle>Real status, plainly stated.</CardTitle>
              <CardDescription>
                No invented progress stages. What you see is true: saved, paid, in creation, delivered. Nothing more, nothing less.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="card-subtle">
            <CardContent className="flex h-full flex-col justify-between gap-6 p-8">
              <div>
                <div className="mini-kicker">Next steps</div>
                <p className="text-sm leading-7 text-slate-700 mt-2">
                  Order another gift, or return home. Your current order stays safe and always accessible.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="sm">
                  <Link href="/memories">
                    {orderingAvailable ? 'Create another' : 'Ordering paused'}
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="sm">
                  <Link href="/">Home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
