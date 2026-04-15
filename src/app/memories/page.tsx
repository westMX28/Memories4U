import Link from 'next/link';
import { CheckCircle2, Images, CreditCard, LockKeyhole, Sparkles } from 'lucide-react';
import { MemoriesIntakeForm } from '@/components/MemoriesIntakeForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { isMemoriesOrderingAvailable } from '@/lib/memories/public-flow';

const whatYouNeed = [
  'One or two photos as PNG or JPG',
  'The recipient\'s name and your email',
  'A brief emotional cue instead of detailed instructions',
];

const nextSteps = [
  {
    icon: Images,
    title: 'Your briefing',
    description: 'Only the information that truly matters for a personal, meaningful story.',
  },
  {
    icon: CreditCard,
    title: 'Quick checkout',
    description: 'Your order is secured immediately. No extra steps. Clear pricing upfront.',
  },
  {
    icon: LockKeyhole,
    title: 'Your private path',
    description: 'The same secure link stays with your order for tracking and delivery.',
  },
];

export default function MemoriesPage() {
  const orderingAvailable = isMemoriesOrderingAvailable();

  return (
    <main className="section page-shell">
      <div className="container space-y-8">
        {/* Hero Section */}
        <Card className="overflow-hidden border-white/70 bg-gradient-to-br from-white/95 via-white/92 to-blue-50/85">
          <CardContent className="grid gap-8 p-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:p-10">
            <div className="space-y-6">
              <Badge className="w-fit accent-chip">Order briefing</Badge>
              <div className="space-y-4">
                <h1 className="h2 max-w-[12ch]">Share simply. We listen carefully.</h1>
                <p className="lead max-w-[60ch]">
                  This form is intentionally minimal. Not because gifts are simple, but because 
                  your feelings matter more than your specifications.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {whatYouNeed.map((item) => (
                  <div
                    className="rounded-[24px] border border-white/70 bg-white/80 px-4 py-4 text-sm leading-6 text-slate-700 shadow-[0_12px_32px_rgba(148,163,184,0.08)]"
                    key={item}
                  >
                    <CheckCircle2 className="mb-2 size-4 text-blue-600 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <a href={orderingAvailable ? '#intake-form' : '#ordering-status'}>
                    {orderingAvailable ? 'Begin briefing' : 'View status'}
                  </a>
                </Button>
                <Button asChild variant="secondary">
                  <Link href={orderingAvailable ? '/status' : '/how-it-works'}>
                    {orderingAvailable ? 'Track order' : 'See process'}
                  </Link>
                </Button>
              </div>
            </div>

            {/* Side Panel */}
            <div className="grid gap-4">
              <Card className="border-white/70 bg-white/80 shadow-lg">
                <CardHeader>
                  <Badge className="w-fit accent-chip" variant="secondary">Designed for intention</Badge>
                  <CardTitle className="text-lg">Premium experience, not complexity.</CardTitle>
                  <CardDescription className="text-sm">
                    Generous spacing, clear hierarchy, and every field has a purpose. 
                    Nothing more, nothing less.
                  </CardDescription>
                </CardHeader>
              </Card>

              {nextSteps.map(({ icon: Icon, title, description }) => (
                <Card key={title} className="border-white/70 bg-white/76">
                  <CardContent className="flex gap-4 p-5">
                    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <h3 className="font-display text-base leading-tight font-semibold">{title}</h3>
                      <p className="text-sm text-slate-600 mb-0 mt-1">{description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Form & Info Section */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div id={orderingAvailable ? 'intake-form' : 'ordering-status'}>
            <MemoriesIntakeForm orderingAvailable={orderingAvailable} />
          </div>

          {/* Side Information */}
          <div className="space-y-4">
            {/* What Happens Next */}
            <Card className="border-white/70 bg-white/76">
              <CardHeader>
                <Badge className="w-fit accent-chip" variant="secondary">What happens next</Badge>
                <CardTitle className="text-lg">One order. One secure link. No account required.</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-[24px] border border-blue-100 bg-blue-50/70 p-4">
                  <div className="mini-kicker">After you submit</div>
                  <p className="mb-0 text-sm leading-6 text-slate-700">
                    Your order is created immediately and moved to checkout to secure payment.
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/70 bg-white p-4">
                  <div className="mini-kicker">If checkout is interrupted</div>
                  <p className="mb-0 text-sm leading-6 text-slate-700">
                    Your saved order remains accessible through the status page using your email.
                  </p>
                </div>
                <Separator className="bg-blue-100" />
                <p className="mb-0 text-xs leading-6 text-slate-600">
                  We save everything so you can resume without friction. That&apos;s the design promise.
                </p>
              </CardContent>
            </Card>

            {/* Important Note */}
            <Card className="border-white/70 bg-gradient-to-br from-slate-950 to-blue-950 text-white">
              <CardContent className="space-y-4 p-6">
                <Badge className="border-white/15 bg-white/10 text-white" variant="dark">Important</Badge>
                <h3 className="font-display text-lg leading-tight">No previews. No revisions.</h3>
                <p className="mb-0 text-sm leading-6 text-slate-200">
                  We craft based on your briefing alone. This isn&apos;t a collaborative tool—
                  it&apos;s a commissioned gift. Trust in your words.
                </p>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs text-slate-100 font-medium">
                  <Sparkles className="size-4 text-blue-300" />
                  Intentionally simplified
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
