import Link from 'next/link';
import { Clock3, RefreshCcw, ShieldCheck } from 'lucide-react';
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

  return (
    <main className="section page-shell">
      <div className="container space-y-8">
        <Card className="overflow-hidden border-white/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(234,244,255,0.9))]">
          <CardContent className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:p-8">
            <div className="space-y-4">
              <Badge className="w-fit">private order status</Badge>
              <h1 className="h2 max-w-[13ch]">One place for payment recovery, progress, and delivery updates.</h1>
              <p className="lead max-w-[56ch]">
                This route is the operational anchor of the customer flow. The redesign makes it calmer and clearer without changing the existing backend state model.
              </p>
              {params.checkout === 'cancelled' ? (
                <div className="rounded-[24px] border border-amber-200 bg-amber-50/90 px-5 py-4 text-sm leading-7 text-amber-950">
                  The checkout was not completed. Your order is still stored and can be reopened from this page.
                </div>
              ) : null}
            </div>

            <div className="grid gap-4">
              <Card className="border-white/90 bg-white/84">
                <CardContent className="flex gap-4 p-5">
                  <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                    <ShieldCheck className="size-5" />
                  </span>
                  <div>
                    <h3 className="mt-1 text-2xl">Private access</h3>
                    <p className="copy mb-0 mt-2">Job id and access token keep the order traceable without forcing an account.</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-white/90 bg-white/84">
                <CardContent className="flex gap-4 p-5">
                  <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                    <RefreshCcw className="size-5" />
                  </span>
                  <div>
                    <h3 className="mt-1 text-2xl">Live refresh</h3>
                    <p className="copy mb-0 mt-2">Progress polling continues automatically while the order is still moving.</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-white/90 bg-white/84">
                <CardContent className="flex gap-4 p-5">
                  <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                    <Clock3 className="size-5" />
                  </span>
                  <div>
                    <h3 className="mt-1 text-2xl">Fast recovery</h3>
                    <p className="copy mb-0 mt-2">If payment was interrupted, this is the same path used to continue cleanly.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <StatusLookup initialJobId={params.jobId} initialAccessToken={params.accessToken} />

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-white/90 bg-white/82">
            <CardHeader>
              <Badge className="w-fit" variant="secondary">good to know</Badge>
              <CardTitle>This screen reports order state. It does not invent new actions.</CardTitle>
              <CardDescription>
                That keeps the UX honest: payment and asset availability come from the backend, while the frontend stays focused on clarity.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-white/90 bg-white/82">
            <CardContent className="flex h-full flex-col justify-between gap-4 p-6">
              <div>
                <div className="mini-kicker">quick links</div>
                <p className="mb-0 text-sm leading-7 text-slate-600">
                  Start a fresh order or return to the homepage without losing the existing status path.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/memories">
                    {orderingAvailable ? 'Start new order' : 'Ordering pause'}
                  </Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/">Homepage</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
