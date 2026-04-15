import Link from 'next/link';
import { CheckCircle2, Images, CreditCard, LockKeyhole, Sparkles } from 'lucide-react';
import { MemoriesIntakeForm } from '@/components/MemoriesIntakeForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { isMemoriesOrderingAvailable } from '@/lib/memories/public-flow';

const whatYouNeed = [
  'One or two photos (PNG or JPG—any size)',
  'Their name and your email (so we know who and where)',
  'A sentence or two about the feeling (that\'s enough)',
];

const nextSteps = [
  {
    icon: Images,
    title: 'We listen, not judge',
    description: 'Your photos and feelings shape the whole thing. No perfectionism required.',
  },
  {
    icon: CreditCard,
    title: 'One price, no surprises',
    description: '$299, all-in. See the price before you checkout. Nothing hidden.',
  },
  {
    icon: LockKeyhole,
    title: 'Your private link forever',
    description: 'Download anytime. No account login. It\'s yours to keep and share.',
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
              <Badge className="w-fit accent-chip">Create your gift</Badge>
              <div className="space-y-4">
                <h1 className="h2 max-w-[12ch]">Just share what matters.</h1>
                <p className="lead max-w-[60ch]">
                  Two photos. A name. A feeling. That's genuinely all we need. No long forms, no complex descriptions.
                  You won't need to write a lot.
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
                    {orderingAvailable ? 'Start here' : 'View status'}
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
                  <Badge className="w-fit accent-chip" variant="secondary">No work required</Badge>
                  <CardTitle className="text-lg">Simple. No overthinking needed.</CardTitle>
                  <CardDescription className="text-sm">
                    You won't spend time writing detailed descriptions or filling out complex forms.
                    This is about emotion, not perfection.
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
            {/* What Happens After Submit */}
            <Card className="border-white/70 bg-white/76">
              <CardHeader>
                <Badge className="w-fit accent-chip" variant="secondary">The flow</Badge>
                <CardTitle className="text-lg">Here's exactly what happens next.</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-[24px] border border-blue-100 bg-blue-50/70 p-4">
                  <div className="mini-kicker">1. You submit</div>
                  <p className="mb-0 text-sm leading-6 text-slate-700">
                    Your order is saved instantly. You immediately get a unique private link.
                  </p>
                </div>
                <div className="rounded-[24px] border border-blue-100 bg-blue-50/50 p-4">
                  <div className="mini-kicker">2. You checkout</div>
                  <p className="mb-0 text-sm leading-6 text-slate-700">
                    You're guided directly to payment. Secure. Clear. No extra steps.
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/70 bg-white p-4">
                  <div className="mini-kicker">3. You always have access</div>
                  <p className="mb-0 text-sm leading-6 text-slate-700">
                    The same private link works forever. Track progress, access delivery, see everything. No expiration, no account needed.
                  </p>
                </div>
                <Separator className="bg-blue-100" />
                <p className="mb-0 text-xs leading-6 text-slate-600">
                  <strong className="text-slate-700">The guarantee:</strong> One link, forever. Whether you pause before payment or come back after delivery—it's always the same secure path.
                </p>
              </CardContent>
            </Card>

            {/* Trust Guarantee */}
            <Card className="border-white/70 bg-gradient-to-br from-slate-950 to-blue-950 text-white">
              <CardContent className="space-y-4 p-6">
                <Badge className="border-white/15 bg-white/10 text-white" variant="dark">No pressure. No complexity.</Badge>
                <h3 className="font-display text-lg leading-tight">Simple form. Secure process. Always your link.</h3>
                <p className="mb-0 text-sm leading-6 text-slate-200">
                  The form is intentionally short. You don't need to write much—just photos and a feeling.
                  Everything is saved. Everything is private. Nothing disappears.
                </p>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs text-slate-100 font-medium">
                  <Sparkles className="size-4 text-blue-300" />
                  Built for peace of mind
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
