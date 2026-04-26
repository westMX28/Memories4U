import Link from 'next/link';
import { ArrowRight, Upload, Eye, Lock, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const steps = [
  {
    step: '01',
    icon: Upload,
    title: 'Share your moment',
    outcome: 'Photos, their name, a feeling. That becomes the whole gift.',
  },
  {
    step: '02',
    icon: Eye,
    title: 'Confirm the price',
    outcome: '1,99 €. You see it all before paying. No surprises.',
  },
  {
    step: '03',
    icon: Lock,
    title: 'Your order is saved',
    outcome: 'Checkout is next. Your link exists now. Everything stays private and safe.',
  },
  {
    step: '04',
    icon: CheckCircle2,
    title: 'Receive and enjoy',
    outcome: 'Track your order. Download when ready. Share or keep it private.',
  },
];

export default function HowItWorksPage() {
  return (
    <main className="section page-shell">
      <div className="container space-y-16">
        {/* Hero Section */}
        <div className="space-y-8 text-center max-w-3xl mx-auto">
          <Badge className="w-fit accent-chip mx-auto">How it works</Badge>
          <div className="space-y-4">
            <h1 className="h2">Four steps. Total clarity.</h1>
            <p className="lead max-w-[60ch] mx-auto">
              No hidden processes. No technical confusion. Just straightforward steps that get you from moment to gift.
            </p>
          </div>
        </div>

        {/* The Four Steps - Outcome Focused */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          {steps.map(({ step, icon: Icon, title, outcome }, index) => (
            <Card key={step} className={`p-5 sm:p-8 ${index === 1 || index === 3 ? 'card-soft' : 'card-subtle'}`}>
              <div className="space-y-4 sm:space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-blue-700 mb-1.5 sm:mb-2">Step {step}</div>
                    <h3 className="font-display text-lg sm:text-xl leading-tight text-slate-900">{title}</h3>
                  </div>
                  <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center flex-shrink-0">
                    <Icon className="size-5 sm:size-6 text-blue-700" />
                  </div>
                </div>
                <p className="text-sm sm:text-base leading-relaxed text-slate-700 font-medium">{outcome}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Preview Promise Section */}
        <Card className="card-soft p-6 sm:p-8 lg:p-10 bg-gradient-to-br from-blue-50/90 to-blue-50/70">
          <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
            <div className="space-y-3">
              <Badge className="accent-chip">Mid-creation</Badge>
              <h2 className="font-display text-2xl leading-tight text-slate-900">
                You get to see it coming together.
              </h2>
            </div>
            <p className="text-base leading-relaxed text-slate-700 max-w-2xl">
              Before the final version, you get a preview. Not a rough draft. A polished glimpse that shows you how the story is being told, the mood we're capturing, and whether it feels right.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 mt-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-900">What you'll see</h4>
                <ul className="text-sm text-slate-700 space-y-2">
                  <li className="flex gap-2">
                    <span className="text-blue-600 flex-shrink-0">•</span>
                    <span>The visual composition taking form</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-600 flex-shrink-0">•</span>
                    <span>The emotional tone and mood</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-600 flex-shrink-0">•</span>
                    <span>How your story is being told</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-900">Why this matters</h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  You gain confidence that the gift is being shaped around your memory in exactly the way you imagined.
                  It feels real because it is becoming real.
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-blue-200">
              <p className="text-sm text-slate-600">
                <strong className="text-slate-800">The promise:</strong> By the time you see the preview, you'll know this gift honors what you shared.
              </p>
            </div>
          </div>
        </Card>

        {/* Checkout Continuity */}
        <Card className="border-white/70 bg-white/76 p-8">
          <div className="max-w-2xl mx-auto space-y-5">
            <div className="space-y-2">
              <h3 className="font-display text-xl leading-tight text-slate-900">Payment is part of the same order.</h3>
              <p className="text-base text-slate-700">
                When you move into payment, you're not starting something new. Your order is already saved. Your private link already exists.
                Payment is the final step that activates your order—but everything stays connected.
              </p>
            </div>
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <p className="text-sm font-medium text-slate-900">If payment is interrupted:</p>
              <p className="text-sm text-slate-700">
                Your order remains saved in your account-free status page. Use your private link to return and complete payment anytime.
                No lost data. No starting over. Same order, same link, same path.
              </p>
            </div>
          </div>
        </Card>

        {/* What makes this safe & easy */}
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <Badge className="accent-chip mx-auto">Why you can trust this</Badge>
            <h2 className="h2">Three things designed for your peace of mind.</h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="border-white/70 bg-white/76 p-7 space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-semibold uppercase tracking-widest text-blue-700">Private by design</div>
                <h3 className="font-display text-lg leading-tight text-slate-900">No account. No login.</h3>
              </div>
              <p className="text-sm leading-relaxed text-slate-700">
                You get one secure private link. Share it. Save it. Use it forever. Your memories stay yours.
              </p>
            </Card>

            <Card className="border-white/70 bg-white/76 p-7 space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-semibold uppercase tracking-widest text-blue-700">Clear from the start</div>
                <h3 className="font-display text-lg leading-tight text-slate-900">Price upfront.</h3>
              </div>
              <p className="text-sm leading-relaxed text-slate-700">
                You see 1,99 € before you decide. No hidden fees. No surprises at checkout. Just honesty.
              </p>
            </Card>

            <Card className="border-white/70 bg-white/76 p-7 space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-semibold uppercase tracking-widest text-blue-700">Always in control</div>
                <h3 className="font-display text-lg leading-tight text-slate-900">Your pace.</h3>
              </div>
              <p className="text-sm leading-relaxed text-slate-700">
                Order when you want. Pause if you need to. Your link works forever. Nothing expires.
              </p>
            </Card>
          </div>
        </div>

        {/* The guarantee */}
        <Card className="border-white/70 bg-gradient-to-br from-slate-50 to-blue-50/80 p-8 lg:p-10">
          <div className="max-w-2xl space-y-4">
            <h3 className="font-display text-2xl leading-tight text-slate-900">One continuous path.</h3>
            <p className="text-base leading-relaxed text-slate-700">
              From the moment you submit through delivery and beyond—the same private link stays with you. 
              If checkout fails, the same link lets you come back. After delivery, it tracks your gift forever. 
              There's never a moment where you lose access or have to start over. That's the design promise.
            </p>
            <div className="pt-2 border-t border-slate-200 mt-6">
              <p className="text-sm text-slate-600">
                <strong className="text-slate-800">Bottom line:</strong> One link. One price. One gift. No complications.
              </p>
            </div>
          </div>
        </Card>

        {/* Confidence-building final CTA */}
        <div className="space-y-6 text-center">
          <div className="space-y-3">
            <h2 className="font-display text-[clamp(2rem,4vw,2.8rem)] leading-tight max-w-2xl mx-auto">
              You understand this. You can do this.
            </h2>
            <p className="lead max-w-[50ch] mx-auto">
              It takes about 5 minutes to create a gift that feels deeply personal.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 justify-center pt-4">
            <Button asChild size="lg" className="px-8 h-12">
              <Link href="/memories">
                Create your gift
                <ArrowRight className="size-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="px-8 h-12">
              <Link href="/status">
                Track an order
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
