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
        <Card className="overflow-hidden border-white/70 bg-gradient-to-br from-white/95 via-white/92 to-blue-50/85">
          <CardContent className="grid gap-8 p-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:p-10">
            <div className="space-y-6">
              <Badge className="w-fit accent-chip">Private order tracking</Badge>
              <div className="space-y-4">
                <h1 className="h2 max-w-[12ch]">Your order, always with you.</h1>
                <p className="lead max-w-[60ch]">
                  A calm place to track progress, continue checkout if needed, or download your 
                  gift when it&apos;s ready. One private link, always secure.
                </p>
              </div>

              {checkoutCancelled ? (
                <div className="rounded-[24px] border border-amber-200 bg-amber-50/90 px-6 py-4 text-sm leading-7 text-amber-900">
                  <p className="mb-0 font-semibold">Checkout was interrupted.</p>
                  <p className="mb-0 mt-1">Your order is saved and ready to complete. You can resume payment below.</p>
                </div>
              ) : null}
            </div>

            {/* Info Cards */}
            <div className="grid gap-4">
              <Card className="border-white/70 bg-white/80 shadow-lg">
                <CardHeader>
                  <Badge className="w-fit accent-chip" variant="secondary">How this works</Badge>
                  <CardTitle className="text-lg">No account. No login. Just your link.</CardTitle>
                  <CardDescription className="text-sm">
                    Keep this page bookmarked. Share it if you need to. It stays yours forever.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-white/70 bg-white/76">
                <CardContent className="flex gap-4 p-5">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Lock className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-base leading-tight font-semibold">Secure access</h3>
                    <p className="text-sm text-slate-600 mb-0 mt-1">
                      Your order ID and token ensure privacy without requiring an account.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/70 bg-white/76">
                <CardContent className="flex gap-4 p-5">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <RefreshCcw className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-base leading-tight font-semibold">Live updates</h3>
                    <p className="text-sm text-slate-600 mb-0 mt-1">
                      Real-time progress tracking while your gift is being created.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/70 bg-white/76">
                <CardContent className="flex gap-4 p-5">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Zap className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-base leading-tight font-semibold">Quick resume</h3>
                    <p className="text-sm text-slate-600 mb-0 mt-1">
                      If checkout was interrupted, you can complete payment right here.
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
          <Card className="border-white/70 bg-white/76">
            <CardHeader>
              <Badge className="w-fit accent-chip" variant="secondary">Transparency</Badge>
              <CardTitle>Real status, honestly reported.</CardTitle>
              <CardDescription>
                We don&apos;t invent progress states. What you see reflects your order&apos;s actual stage: 
                saved, paid, in creation, or delivered.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-white/70 bg-white/76">
            <CardContent className="flex h-full flex-col justify-between gap-6 p-8">
              <div>
                <div className="mini-kicker">Next steps</div>
                <p className="text-sm leading-7 text-slate-700 mt-2">
                  Start a new gift order or return to explore more. Your current order status remains secure and always accessible.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="sm">
                  <Link href="/memories">
                    {orderingAvailable ? 'New order' : 'Pause notice'}
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
