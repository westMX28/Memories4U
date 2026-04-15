import Link from 'next/link';
import { ArrowDownToLine, ExternalLink, CheckCircle, Sparkles, Lock, Clock } from 'lucide-react';
import { getMemoryJobStatus } from '@/lib/memories/service';
import { MemoryAssetPreview } from '@/components/MemoryAssetPreview';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
      <div className="container space-y-8">
        <Card className="success-shell overflow-hidden card-hero">
          <CardContent className="p-10 text-center sm:p-12">
            <div className="inline-flex mb-6">
              <Badge className="success-badge flex items-center gap-2">
                <CheckCircle className="size-5" />
                {paymentConfirmed ? 'On the way' : 'Order saved'}
              </Badge>
            </div>

            <h1 className="h2 max-w-[18ch] mx-auto">
              {paymentConfirmed
                ? 'Your gift is being created.'
                : 'Your gift is ready for payment.'}
            </h1>

            <p className="lead mx-auto max-w-[60ch] mt-6">
              {paymentConfirmed
                ? liveStatus?.finalAsset
                  ? 'It\'s ready. Download it and celebrate with them.'
                  : liveStatus?.previewAsset
                    ? 'You\'ll see a preview soon to make sure it feels right.'
                    : 'We\'re working on it now. Check your private status page for updates, or come back here anytime.'
                : 'Everything you shared is saved. Your private link is waiting. Complete payment whenever you\'re ready.'}
            </p>

            {params.email ? (
              <div className="success-meta mx-auto max-w-3xl mt-8">
                <div className="rounded-[24px] bg-white/80 border border-blue-100 p-5">
                  <div className="text-sm uppercase tracking-widest text-blue-700 font-semibold">Being delivered to</div>
                  <p className="mb-0 text-base mt-2 text-slate-700">{params.email}</p>
                </div>
              </div>
            ) : null}

            {deliveryAsset ? (
              <Card className="mx-auto mt-12 max-w-4xl card-neutral text-left">
                <CardContent className="space-y-6 p-8 sm:p-10">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-4">
                      <Badge className="w-fit accent-chip" variant="secondary">
                        {liveStatus?.finalAsset ? 'Ready' : 'Preview available'}
                      </Badge>
                      <div>
                        <h2 className="text-3xl leading-tight font-display mb-3">
                          {liveStatus?.finalAsset
                            ? 'Your gift is ready.'
                            : 'Preview is ready.'}
                        </h2>
                        <p className="text-slate-700 mb-0 max-w-[56ch] leading-relaxed">
                          {liveStatus?.delivery
                            ? `Delivered to ${liveStatus.delivery.recipient}. You can download it here anytime.`
                            : liveStatus?.finalAsset
                              ? 'Download it, share it, celebrate with them. It\'s yours now.'
                              : 'Get a look at how it\'s coming together. Let us know if anything needs adjusting, or we\'ll move to the final version.'}
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
                          {liveStatus?.finalAsset ? 'Herunterladen' : 'Vorschau ansehen'}
                        </a>
                      </Button>
                      <Button asChild size="lg" variant="secondary">
                        <Link href={statusHref} className="flex items-center gap-2">
                          <Clock className="size-4" />
                          Fortschritt
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

            {/* Continuation & Status Path Reassurance */}
            <Card className="mx-auto mt-12 max-w-3xl card-soft">
              <CardContent className="p-8 sm:p-10">
                <div className="space-y-4">
                  <h2 className="text-xl font-display font-semibold text-slate-900">What's next.</h2>
                  <p className="text-slate-700 leading-relaxed mb-0">
                    {paymentConfirmed
                      ? 'Your gift is now being created. Return to your private status page anytime to check progress, see the preview, or download the final version. Everything stays secure and private.'
                      : 'Your gift is here, waiting for payment. When you\'re ready to pay, return to your private page and complete checkout. No information is lost, no starting over needed.'}
                  </p>
                  {paymentConfirmed && (
                    <div className="mt-6 flex items-start gap-4 p-4 rounded-[24px] bg-white/70 border border-blue-200">
                      <div className="text-blue-600 mt-1 flex-shrink-0">
                        <Clock className="size-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 mb-1">Live tracking</p>
                        <p className="text-sm text-slate-700 mb-0">Your status page updates in real-time as we work on your gift.</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="mt-12 grid gap-4 md:grid-cols-3">
              <Card className="card-subtle">
                <CardContent className="flex gap-4 p-6">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mt-1">
                    <Lock className="size-5" />
                  </span>
                  <div>
                    <div className="mini-kicker">Your gift</div>
                    <p className="mb-0 text-sm leading-6 text-slate-700">
                      Saved privately. Fully secure. Only your link can access it.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="card-subtle">
                <CardContent className="flex gap-4 p-6">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mt-1">
                    <Sparkles className="size-5" />
                  </span>
                  <div>
                    <div className="mini-kicker">What's happening</div>
                    <p className="mb-0 text-sm leading-6 text-slate-700">
                      {paymentConfirmed
                        ? 'Your gift is being created. Live updates on your status page.'
                        : 'Pay when you\'re ready. Your gift is safe and waiting.'}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="card-subtle">
                <CardContent className="flex gap-4 p-6">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mt-1">
                    <Clock className="size-5" />
                  </span>
                  <div>
                    <div className="mini-kicker">Your access point</div>
                    <p className="mb-0 text-sm leading-6 text-slate-700">
                      One private page for everything: progress, updates, and your final gift.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-wrap gap-3 justify-center mt-12">
              <Button asChild size="lg">
                <Link href={statusHref} className="flex items-center gap-2">
                  <Clock className="size-4" />
                  View progress
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/">Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
