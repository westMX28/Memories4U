import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ jobId?: string; accessToken?: string; email?: string; checkout?: string }>;
}) {
  const params = await searchParams;
  const paymentConfirmed = params.checkout === 'success';
  const statusHref =
    params.jobId && params.accessToken
      ? `/status?jobId=${encodeURIComponent(params.jobId)}&accessToken=${encodeURIComponent(params.accessToken)}`
      : '/status';

  return (
    <main className="section page-shell">
      <div className="container">
        <Card className="success-shell overflow-hidden border-white/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(231,243,255,0.92))]">
          <CardContent className="p-8 text-center sm:p-10">
            <Badge className="success-badge mx-auto w-fit">
              {paymentConfirmed ? 'Payment confirmed' : 'Order saved'}
            </Badge>
            <h1 className="h2 max-w-[14ch] mx-auto">
              {paymentConfirmed
                ? 'Your birthday-story order is confirmed and connected to status tracking.'
                : 'Your order is saved and ready to be resumed.'}
            </h1>
            <p className="lead mx-auto max-w-[46ch]">
              {paymentConfirmed
                ? 'This page confirms the successful handoff. From here, the status route becomes the single place to follow progress and final delivery.'
                : 'The order brief is stored. If payment did not finish, use the status page to reopen the same order without starting over.'}
            </p>

            {params.email ? (
              <div className="success-meta mx-auto max-w-3xl">
                <div>
                  <strong>Delivery email</strong>
                  <span>{params.email}</span>
                </div>
              </div>
            ) : null}

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <Card className="border-white/90 bg-white/82">
                <CardContent className="p-6">
                  <div className="mini-kicker">stored</div>
                  <p className="mb-0 text-sm leading-7 text-slate-700">
                    The order remains tied to a private job id and access token.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-white/90 bg-white/82">
                <CardContent className="p-6">
                  <div className="mini-kicker">next</div>
                  <p className="mb-0 text-sm leading-7 text-slate-700">
                    {paymentConfirmed
                      ? 'Production and final delivery continue outside this page.'
                      : 'Checkout can be retried later from the status route.'}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-white/90 bg-white/82">
                <CardContent className="p-6">
                  <div className="mini-kicker">re-entry</div>
                  <p className="mb-0 text-sm leading-7 text-slate-700">
                    The status page is the canonical return point for updates and final assets.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="btn-row justify-center">
              <Button asChild>
                <Link href={statusHref}>Open order status</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/">Back to homepage</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
