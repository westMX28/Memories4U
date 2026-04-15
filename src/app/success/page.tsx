import Link from 'next/link';
import { ArrowDownToLine, ExternalLink, CheckCircle, Sparkles } from 'lucide-react';
import { getMemoryJobStatus } from '@/lib/memories/service';
import { MemoryAssetPreview } from '@/components/MemoryAssetPreview';
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
  const liveStatus =
    params.jobId && params.accessToken
      ? await getMemoryJobStatus(params.jobId, params.accessToken).catch(() => null)
      : null;
  const deliveryAsset = liveStatus?.finalAsset || liveStatus?.previewAsset;
  const statusHref =
    params.jobId && params.accessToken
      ? `/status?jobId=${encodeURIComponent(params.jobId)}&accessToken=${encodeURIComponent(params.accessToken)}`
      : '/status';

  return (
    <main className="section page-shell">
      <div className="container">
        <Card className="success-shell overflow-hidden border-white/70 bg-gradient-to-br from-white/95 via-white/92 to-blue-50/85">
          <CardContent className="p-10 text-center sm:p-12">
            <div className="inline-flex mb-4">
              <Badge className="success-badge flex items-center gap-2">
                <CheckCircle className="size-4" />
                {paymentConfirmed ? 'Payment confirmed' : 'Order saved'}
              </Badge>
            </div>

            <h1 className="h2 max-w-[16ch] mx-auto">
              {paymentConfirmed
                ? 'Your gift order is confirmed and being created.'
                : 'Your order is saved and ready to complete.'}
            </h1>

            <p className="lead mx-auto max-w-[56ch] mt-4">
              {paymentConfirmed
                ? liveStatus?.finalAsset
                  ? 'Your handcrafted story is ready. Download it below and celebrate this person.'
                  : liveStatus?.previewAsset
                    ? 'A preview is already available. The final version is being refined.'
                    : 'Creation has begun. You\'ll receive updates as progress unfolds. Check your status page anytime.'
                : 'Your briefing is saved. Return to complete payment whenever you\'re ready—no need to start over.'}
            </p>

            {params.email ? (
              <div className="success-meta mx-auto max-w-3xl mt-6">
                <div className="rounded-[24px] bg-white/80 border border-white/70 p-4">
                  <strong className="text-sm uppercase tracking-widest text-blue-700">Delivery email</strong>
                  <p className="mb-0 text-sm mt-1 text-slate-700">{params.email}</p>
                </div>
              </div>
            ) : null}

            {deliveryAsset ? (
              <Card className="mx-auto mt-10 max-w-4xl border-white/70 bg-white/80 text-left shadow-[0_32px_96px_rgba(96,174,252,0.12)]">
                <CardContent className="space-y-6 p-8 sm:p-10">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-4">
                      <Badge className="w-fit accent-chip" variant="secondary">
                        {liveStatus?.finalAsset ? 'Ready to download' : 'Preview ready'}
                      </Badge>
                      <div>
                        <h2 className="text-3xl leading-tight font-display mb-3">
                          {liveStatus?.finalAsset
                            ? 'Your story is ready.'
                            : 'A preview is available now.'}
                        </h2>
                        <p className="text-slate-700 mb-0 max-w-[56ch] leading-relaxed">
                          {liveStatus?.delivery
                            ? `The gift has been prepared for ${liveStatus.delivery.recipient}.`
                            : liveStatus?.finalAsset
                              ? 'Download and share. Celebrate this person with what you\'ve created together.'
                              : 'The final piece is being perfected. You can preview now or wait for the complete version.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 flex-shrink-0">
                      <Button asChild size="lg">
                        <a
                          href={deliveryAsset.url}
                          target="_blank"
                          rel="noreferrer"
                          download={liveStatus?.finalAsset ? '' : undefined}
                          className="flex items-center gap-2"
                        >
                          <ArrowDownToLine className="size-5" />
                          {liveStatus?.finalAsset ? 'Download gift' : 'View preview'}
                        </a>
                      </Button>
                      <Button asChild size="lg" variant="secondary">
                        <Link href={statusHref} className="flex items-center gap-2">
                          <ExternalLink className="size-4" />
                          Status
                        </Link>
                      </Button>
                    </div>
                  </div>

                  <MemoryAssetPreview
                    asset={deliveryAsset}
                    variant={liveStatus?.finalAsset ? 'final' : 'preview'}
                  />
                </CardContent>
              </Card>
            ) : null}

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <Card className="border-white/70 bg-white/76">
                <CardContent className="p-6">
                  <div className="mini-kicker">Your order</div>
                  <p className="mb-0 text-sm leading-6 text-slate-700">
                    Linked to your email and secured with a private access token. Always yours.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-white/70 bg-white/76">
                <CardContent className="p-6">
                  <div className="mini-kicker">What happens next</div>
                  <p className="mb-0 text-sm leading-6 text-slate-700">
                    {paymentConfirmed
                      ? 'Creation is underway. Receive updates as the gift is finalized.'
                      : 'You can resume checkout anytime through your private status link.'}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-white/70 bg-white/76">
                <CardContent className="p-6">
                  <div className="mini-kicker">Your access point</div>
                  <p className="mb-0 text-sm leading-6 text-slate-700">
                    One private status page for tracking, updates, and final delivery.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-wrap gap-3 justify-center mt-8">
              <Button asChild size="lg">
                <Link href={statusHref} className="flex items-center gap-2">
                  <Sparkles className="size-4" />
                  View order status
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/">Return home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
