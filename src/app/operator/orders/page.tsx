import Link from 'next/link';
import { headers } from 'next/headers';
import {
  AlertTriangle,
  ArrowUpRight,
  Boxes,
  Clock3,
  CreditCard,
  Database,
  Mail,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { OperatorOrderState, OperatorOrderStatusResponse } from '@/lib/memories/contracts';
import { getMemoriesConfig } from '@/lib/memories/config';

type OperatorOrdersPageProps = {
  searchParams: Promise<{ jobId?: string }>;
};

type FetchResult =
  | {
      data: OperatorOrderStatusResponse;
      error?: never;
    }
  | {
      data?: never;
      error: string;
    };

const orderStateTone: Record<
  OperatorOrderState,
  { label: string; className: string }
> = {
  payment_pending: {
    label: 'Payment pending',
    className: 'border-amber-200/80 bg-amber-50 text-amber-900',
  },
  paid: {
    label: 'Paid',
    className: 'border-emerald-200/80 bg-emerald-50 text-emerald-900',
  },
  in_progress: {
    label: 'In progress',
    className: 'border-sky-200/80 bg-sky-50 text-sky-900',
  },
  ready: {
    label: 'Ready',
    className: 'border-violet-200/80 bg-violet-50 text-violet-900',
  },
  delivered: {
    label: 'Delivered',
    className: 'border-slate-200/80 bg-slate-100 text-slate-900',
  },
  needs_attention: {
    label: 'Needs attention',
    className: 'border-rose-200/80 bg-rose-50 text-rose-900',
  },
};

function getBaseUrl(forwardedHost: string | null, forwardedProto: string | null) {
  const { appUrl } = getMemoriesConfig();
  if (appUrl) {
    return appUrl.replace(/\/$/, '');
  }

  if (!forwardedHost) {
    return '';
  }

  const protocol = forwardedProto || (forwardedHost.includes('localhost') ? 'http' : 'https');
  return `${protocol}://${forwardedHost}`;
}

function formatDateTime(value?: string) {
  if (!value) {
    return 'Not recorded';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(parsed);
}

function formatBoolean(value: boolean, trueLabel: string, falseLabel: string) {
  return value ? trueLabel : falseLabel;
}

function ValueRow({
  label,
  value,
  mono = false,
  muted = false,
}: {
  label: string;
  value?: string;
  mono?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-t border-slate-200/80 py-3 first:border-t-0 first:pt-0 last:pb-0">
      <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</dt>
      <dd
        className={[
          'max-w-[68%] text-right text-sm leading-6',
          mono ? 'font-mono text-[13px]' : 'text-slate-900',
          muted ? 'text-slate-500' : '',
        ].join(' ')}
      >
        {value || 'Not recorded'}
      </dd>
    </div>
  );
}

function SectionCard({
  icon: Icon,
  kicker,
  title,
  description,
  children,
}: {
  icon: typeof ShieldCheck;
  kicker: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="h-full border-slate-200/80 bg-white/90 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
      <CardHeader className="gap-3">
        <div className="flex items-start gap-4">
          <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
            <Icon className="size-5" />
          </span>
          <div className="space-y-1">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              {kicker}
            </div>
            <CardTitle className="text-[1.6rem] text-slate-950">{title}</CardTitle>
          </div>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="space-y-0">{children}</dl>
      </CardContent>
    </Card>
  );
}

async function getOperatorStatus(jobId: string): Promise<FetchResult> {
  const normalizedJobId = jobId.trim();
  if (!normalizedJobId) {
    return { error: 'Enter a job id to inspect an order.' };
  }

  const requestHeaders = await headers();
  const baseUrl = getBaseUrl(
    requestHeaders.get('x-forwarded-host') || requestHeaders.get('host'),
    requestHeaders.get('x-forwarded-proto'),
  );
  const { internalApiSecret } = getMemoriesConfig();

  if (!baseUrl) {
    return { error: 'The operator page could not determine the app base URL for the internal request.' };
  }

  if (!internalApiSecret) {
    return { error: 'MEMORIES_INTERNAL_API_SECRET is not configured on the server.' };
  }

  const response = await fetch(
    `${baseUrl}/api/memories/${encodeURIComponent(normalizedJobId)}/operator-status`,
    {
      method: 'GET',
      headers: {
        authorization: `Bearer ${internalApiSecret}`,
      },
      cache: 'no-store',
    },
  );

  const payload = (await response.json()) as Partial<OperatorOrderStatusResponse> & { error?: string };

  if (!response.ok) {
    return {
      error:
        payload.error ||
        `The operator status request failed with ${response.status}.`,
    };
  }

  if (!payload.summary || !payload.payment || !payload.generation || !payload.assets || !payload.delivery || !payload.history) {
    return { error: 'The operator status payload is incomplete.' };
  }

  return { data: payload as OperatorOrderStatusResponse };
}

export default async function OperatorOrdersPage({ searchParams }: OperatorOrdersPageProps) {
  const params = await searchParams;
  const jobId = params.jobId?.trim() || '';
  const result = jobId ? await getOperatorStatus(jobId) : null;
  const status = result?.data;
  const error = result?.error;
  const tone = status ? orderStateTone[status.summary.orderState] : null;

  return (
    <main className="section page-shell">
      <div className="container space-y-6">
        <Card className="overflow-hidden border-slate-950/10 bg-[linear-gradient(135deg,rgba(9,16,28,0.98),rgba(23,37,58,0.94)_52%,rgba(39,67,98,0.88))] text-white shadow-[0_28px_90px_rgba(15,23,42,0.18)]">
          <CardContent className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:p-8">
            <div className="space-y-4">
              <Badge variant="dark" className="w-fit border-white/12 bg-white/8">
                Internal operator route
              </Badge>
              <h1 className="h2 max-w-[12ch] text-white">Birthday order diagnosis without customer-facing language.</h1>
              <p className="max-w-[62ch] text-[15px] leading-7 text-slate-200">
                This screen is for operators only. It reads the backend-owned operator contract and keeps the view focused on stuck-order diagnosis, raw references, and honest timestamp coverage.
              </p>
              <form className="grid gap-3 rounded-[28px] border border-white/10 bg-white/6 p-4 backdrop-blur md:grid-cols-[minmax(0,1fr)_auto]">
                <label className="space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">
                    Job id
                  </span>
                  <Input
                    name="jobId"
                    defaultValue={jobId}
                    placeholder="8f4d... or pasted order id"
                    className="border-white/12 bg-white text-slate-950 shadow-none placeholder:text-slate-400"
                  />
                </label>
                <div className="flex items-end">
                  <Button type="submit" size="lg" className="w-full md:w-auto">
                    <Search className="size-4" />
                    Inspect order
                  </Button>
                </div>
              </form>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[28px] border border-white/10 bg-white/8 p-5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">
                  Route contract
                </div>
                <div className="mt-3 font-mono text-[13px] leading-6 text-slate-100">
                  GET /api/memories/:jobId/operator-status
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-200">
                  Server-side fetch only. Internal secret stays on the server and is not exposed to the browser.
                </p>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-white/8 p-5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">
                  Diagnostic rule
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-200">
                  Summary first, references second. When history is missing, the page says so explicitly instead of implying a full event log.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {!jobId ? (
          <Card className="border-dashed border-slate-300/90 bg-white/78">
            <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <div className="mini-kicker">Awaiting lookup</div>
                <h2 className="font-[family-name:var(--font-display)] text-3xl text-slate-950">
                  Paste a job id to load one operator view.
                </h2>
                <p className="max-w-[68ch] text-sm leading-7 text-slate-600">
                  The page expects a single order at a time. It does not attempt batch search, make-console mirroring, or inferred workflow history.
                </p>
              </div>
              <Button asChild variant="secondary">
                <Link href="/status">
                  Customer route
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {error ? (
          <Card className="border-rose-200 bg-rose-50/90">
            <CardContent className="flex gap-4 p-6">
              <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-rose-600 text-white">
                <AlertTriangle className="size-5" />
              </span>
              <div className="space-y-2">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-rose-700">
                  Lookup failed
                </div>
                <h2 className="font-[family-name:var(--font-display)] text-3xl text-rose-950">
                  The operator payload could not be loaded for this order.
                </h2>
                <p className="max-w-[72ch] text-sm leading-7 text-rose-900">{error}</p>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {status && tone ? (
          <>
            <Card className="border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,247,251,0.94))]">
              <CardContent className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:p-8">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className={tone.className}>{tone.label}</Badge>
                    <Badge variant="secondary" className="border-slate-200 bg-white text-slate-700">
                      {status.generation.status}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                      Order summary
                    </div>
                    <h2 className="mt-2 font-[family-name:var(--font-display)] text-[2.7rem] leading-[0.95] text-slate-950">
                      {status.summary.customerEmail}
                    </h2>
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-[22px] border border-slate-200/80 bg-white/90 p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Order id
                      </div>
                      <div className="mt-2 font-mono text-[13px] leading-6 text-slate-900">
                        {status.summary.orderId}
                      </div>
                    </div>
                    <div className="rounded-[22px] border border-slate-200/80 bg-white/90 p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Created
                      </div>
                      <div className="mt-2 text-sm leading-6 text-slate-900">
                        {formatDateTime(status.summary.createdAt)}
                      </div>
                    </div>
                    <div className="rounded-[22px] border border-slate-200/80 bg-white/90 p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Updated
                      </div>
                      <div className="mt-2 text-sm leading-6 text-slate-900">
                        {formatDateTime(status.summary.updatedAt)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[26px] border border-slate-950/8 bg-slate-950 p-5 text-white lg:min-w-[280px]">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Escalation snapshot
                  </div>
                  <dl className="mt-4 space-y-3">
                    <div>
                      <dt className="text-xs uppercase tracking-[0.18em] text-slate-400">Payment ref</dt>
                      <dd className="mt-1 font-mono text-[13px] leading-6 text-slate-100">
                        {status.payment.reference || 'Not recorded'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-[0.18em] text-slate-400">Delivery id</dt>
                      <dd className="mt-1 font-mono text-[13px] leading-6 text-slate-100">
                        {status.delivery.deliveryId || 'Not recorded'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-[0.18em] text-slate-400">Last error</dt>
                      <dd className="mt-1 text-sm leading-6 text-slate-100">
                        {status.generation.lastError || 'None recorded'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <SectionCard
                icon={ShieldCheck}
                kicker="Summary"
                title="Order"
                description="Top-level operator readout for triage before opening any supporting tools."
              >
                <ValueRow label="Customer email" value={status.summary.customerEmail} />
                <ValueRow label="Order state" value={tone.label} />
                <ValueRow label="Job id" value={status.summary.jobId} mono />
              </SectionCard>

              <SectionCard
                icon={CreditCard}
                kicker="Payment"
                title="Payment"
                description="Explicit payment confirmation state plus the raw reference used for follow-up."
              >
                <ValueRow label="Status" value={status.payment.status} />
                <ValueRow label="Provider" value={status.payment.provider || 'Not recorded'} />
                <ValueRow label="Reference" value={status.payment.reference} mono muted={!status.payment.reference} />
              </SectionCard>

              <SectionCard
                icon={Sparkles}
                kicker="Generation"
                title="Generation"
                description="Current backend status for the creative pipeline. No implied hidden sub-states."
              >
                <ValueRow label="Status" value={status.generation.status} />
                <ValueRow
                  label="Unlocked"
                  value={formatBoolean(status.generation.unlocked, 'Yes', 'No')}
                />
                <ValueRow label="Last error" value={status.generation.lastError} muted={!status.generation.lastError} />
              </SectionCard>

              <SectionCard
                icon={Boxes}
                kicker="Assets"
                title="Assets"
                description="Presence flags first, then operator-useful URLs and asset metadata."
              >
                <ValueRow
                  label="Preview"
                  value={formatBoolean(status.assets.preview.present, 'Present', 'Missing')}
                />
                <ValueRow label="Preview URL" value={status.assets.preview.asset?.url} mono muted={!status.assets.preview.asset?.url} />
                <ValueRow
                  label="Final"
                  value={formatBoolean(status.assets.final.present, 'Present', 'Missing')}
                />
                <ValueRow label="Final URL" value={status.assets.final.asset?.url} mono muted={!status.assets.final.asset?.url} />
              </SectionCard>

              <SectionCard
                icon={Mail}
                kicker="Delivery"
                title="Delivery"
                description="Delivery confirmation, target recipient, and recorded provider identifiers."
              >
                <ValueRow
                  label="Delivered"
                  value={formatBoolean(status.delivery.delivered, 'Yes', 'No')}
                />
                <ValueRow label="Provider" value={status.delivery.provider || 'Not recorded'} />
                <ValueRow label="Recipient" value={status.delivery.recipient} />
                <ValueRow label="Delivery id" value={status.delivery.deliveryId} mono muted={!status.delivery.deliveryId} />
              </SectionCard>

              <SectionCard
                icon={Clock3}
                kicker="History"
                title="Timestamps"
                description="This block reflects the actual coverage of the backend payload instead of pretending to be a full event timeline."
              >
                <ValueRow label="History mode" value={status.history.mode} />
                <ValueRow label="Created at" value={formatDateTime(status.history.timestamps.createdAt)} />
                <ValueRow label="Updated at" value={formatDateTime(status.history.timestamps.updatedAt)} />
                <ValueRow label="Delivered at" value={formatDateTime(status.history.timestamps.deliveredAt)} muted={!status.history.timestamps.deliveredAt} />
              </SectionCard>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
              <Card className="border-slate-200/80 bg-white/88">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                      <Database className="size-5" />
                    </span>
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Coverage note
                      </div>
                      <CardTitle className="mt-2 text-[1.7rem] text-slate-950">
                        Current-state timestamps only
                      </CardTitle>
                    </div>
                  </div>
                  <CardDescription>{status.history.note}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                      Preview asset ref
                    </div>
                    <div className="mt-2 font-mono text-[13px] leading-6 text-slate-900">
                      {status.history.references.previewAssetUrl || 'Not recorded'}
                    </div>
                  </div>
                  <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                      Final asset ref
                    </div>
                    <div className="mt-2 font-mono text-[13px] leading-6 text-slate-900">
                      {status.history.references.finalAssetUrl || 'Not recorded'}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200/80 bg-white/88">
                <CardHeader>
                  <div className="mini-kicker">Boundary</div>
                  <CardTitle className="text-[1.7rem] text-slate-950">
                    Internal-only route
                  </CardTitle>
                  <CardDescription>
                    The customer status screen remains separate. This page is intentionally blunt about payment, delivery ids, references, and backend gaps.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild className="w-full">
                    <Link href={`/operator/orders?jobId=${encodeURIComponent(status.summary.jobId)}`}>
                      Refresh this order
                    </Link>
                  </Button>
                  <Button asChild variant="secondary" className="w-full">
                    <Link href="/status">
                      Open customer status route
                      <ArrowUpRight className="size-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}
