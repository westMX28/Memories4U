import Link from 'next/link';
import { ArrowRight, Images, Share2, Lock, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const steps = [
  {
    step: '01',
    icon: Images,
    title: 'Share what matters',
    description: 'One or two photos that hold the feeling you want the gift to capture.',
    detail: 'Plus: The recipient\'s name, your email, and a short memory or tone to guide the creation.',
  },
  {
    step: '02',
    icon: Share2,
    title: 'Set expectations clearly',
    description: 'See the price upfront. Understand what you\'re commissioning. No hidden steps.',
    detail: 'Checkout is quick and straightforward. Your briefing is saved before payment to protect against interruption.',
  },
  {
    step: '03',
    icon: Lock,
    title: 'You own the access',
    description: 'No account needed. A private link keeps your order secure and always available.',
    detail: 'Email the link to yourself. Share it with others who need to track the gift. It\'s yours to manage.',
  },
  {
    step: '04',
    icon: Send,
    title: 'Follow and receive',
    description: 'Track progress in real time. Know when the story is ready. Download when it\'s delivered.',
    detail: 'Status updates, delivery notification, and lifetime access to your handcrafted gift—all through one link.',
  },
];

const principles = [
  {
    title: 'Emotional clarity',
    description: 'We listen for feeling, not instructions. What you share in a few words is enough.',
  },
  {
    title: 'No surprises',
    description: 'Pricing, timeline, and what you\'re getting are clear before you decide.',
  },
  {
    title: 'Maximum simplicity',
    description: 'Every step has been designed to reduce friction and unnecessary choices.',
  },
  {
    title: 'Privacy by design',
    description: 'No account system, no tracking cookies, no data collection. Just your gift, your way.',
  },
];

export default function HowItWorksPage() {
  return (
    <main className="section page-shell">
      <div className="container space-y-12">
        {/* Hero Section */}
        <Card className="overflow-hidden border-white/70 bg-gradient-to-br from-white/95 via-white/92 to-blue-50/85">
          <CardContent className="grid gap-8 p-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,1fr)] lg:p-10">
            <div className="space-y-5">
              <Badge className="w-fit accent-chip">The process</Badge>
              <div className="space-y-3">
                <h1 className="h2 max-w-[12ch]">
                  Four intentional steps.
                </h1>
                <p className="lead max-w-[60ch]">
                  From sharing a memory to downloading your gift, we've designed every moment 
                  to feel calm, clear, and meaningful.
                </p>
              </div>
            </div>
            <Card className="border-white/70 bg-white/80 shadow-lg">
              <CardHeader>
                <Badge className="w-fit accent-chip" variant="secondary">Why this matters</Badge>
                <CardTitle className="text-lg mt-2">The gift deserves a frictionless path.</CardTitle>
                <CardDescription className="text-sm">
                  A complicated order flow undermines the emotion of a gift. We remove that noise 
                  so the meaning comes through.
                </CardDescription>
              </CardHeader>
            </Card>
          </CardContent>
        </Card>

        {/* Steps */}
        <div className="grid gap-5">
          {steps.map(({ step, icon: Icon, title, description, detail }, index) => (
            <div
              key={step}
              className={`workflow-step ${index === 1 ? 'workflow-step-featured' : ''}`}
            >
              <div className="workflow-step-number">{step}</div>
              <div className="workflow-step-content grid gap-4">
                <div className="flex items-start gap-3">
                  <Icon className="size-5 text-blue-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="workflow-step-title">{title}</h3>
                    <p className="workflow-step-copy">{description}</p>
                  </div>
                </div>
                <div className="flex gap-2 items-start text-sm text-slate-600 pl-8">
                  <span className="text-xs font-semibold uppercase text-blue-700 mt-0.5 flex-shrink-0">Note:</span>
                  <p className="mb-0">{detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Design Principles */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <Badge className="accent-chip">Built on these principles</Badge>
            <h2 className="h2">What guides every decision</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {principles.map((principle) => (
              <Card key={principle.title} className="border-white/75 bg-white/76 p-6">
                <h3 className="font-display text-[1.2rem] leading-tight mb-2">{principle.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{principle.description}</p>
              </Card>
            ))}
          </div>
        </div>

        <Separator className="my-4" />

        {/* Trust Section */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]">
          <Card className="border-white/80 bg-white/76 p-8">
            <div className="space-y-6">
              <div>
                <Badge className="accent-chip mb-4">Privacy</Badge>
                <h3 className="text-xl font-display leading-tight mb-3">Your gift, your control</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  No account means no login required. No data collection means your memories stay private. 
                  A permanent private link means the gift stays yours—forever.
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Forward the link to whoever needs it. Check status anytime. Download and share when it&apos;s 
                  ready. Everything is in your hands.
                </p>
              </div>
            </div>
          </Card>

          <Card className="border-white/80 bg-gradient-to-br from-blue-50 to-blue-100/50 p-8">
            <div className="space-y-6">
              <div>
                <Badge className="mb-4 border-blue-200 bg-white/60 accent-chip" variant="secondary">Timing</Badge>
                <h3 className="text-xl font-display leading-tight mb-3">No artificial pressure</h3>
                <p className="text-sm text-slate-700 leading-relaxed mb-4">
                  You decide when to order. We handle the creation timeline. You check status whenever.
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Birthdays arrive suddenly. Your ordering and tracking flow shouldn&apos;t add stress—
                  it should feel supportive.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Final CTA */}
        <Card className="border-white/80 bg-gradient-to-br from-slate-950 via-blue-950 to-blue-900 text-white">
          <CardContent className="flex flex-col gap-6 p-8 lg:flex-row lg:items-center lg:justify-between lg:p-10">
            <div className="space-y-3 flex-1">
              <Badge className="w-fit border-white/20 bg-white/10" variant="dark">Ready to start</Badge>
              <h2 className="font-display text-[clamp(1.8rem,3vw,2.6rem)] leading-tight">
                Begin your gift now.
              </h2>
              <p className="max-w-[50ch] text-sm leading-7 text-slate-300">
                Share your memory, see the price, complete checkout. A few minutes to create something meaningful.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 flex-shrink-0">
              <Button asChild size="lg" className="bg-white text-slate-950 hover:bg-slate-100">
                <Link href="/memories">
                  Start creating
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="border-white/20 text-white hover:bg-white/10">
                <Link href="/status">Check status</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
