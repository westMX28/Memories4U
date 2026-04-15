import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Gift,
  LockKeyhole,
  Mail,
  Sparkles,
  WandSparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { isMemoriesOrderingAvailable } from '@/lib/memories/public-flow';

const reassuranceNotes = [
  'Private, secure, and designed to feel personal—not corporate',
  'Minimal input, maximum emotional impact',
  'A gift experience that honors the memory, not the complexity',
];

const flowSteps = [
  {
    step: '01',
    title: 'Share the memory signals',
    copy: 'Start with one or two photos, the recipient name, and a short note about the moment or tone you want to capture.',
  },
  {
    step: '02',
    title: 'Secure the order',
    copy: 'The order is created first, then moved into checkout without turning the experience into a long configurator.',
  },
  {
    step: '03',
    title: 'Return through the same private path',
    copy: 'If payment is interrupted or you want to check progress later, the same private status link remains your way back.',
  },
];

const promiseCards = [
  {
    icon: Gift,
    title: 'Designed for the moment that matters',
    copy: 'A birthday gift should feel thoughtful, not complicated. We built this specifically for capturing and sharing memories.',
  },
  {
    icon: WandSparkles,
    title: 'Effortless emotional storytelling',
    copy: 'Two photos and a memory are all you need. We transform your moments into a polished, premium digital story.',
  },
  {
    icon: LockKeyhole,
    title: 'Your gift stays private',
    copy: 'Everything stays within a single private path—no account needed, no data collection. Just you, the gift, and the recipient.',
  },
];

const featureNotes = [
  'Designed to feel like a premium service, not a tool',
  'See pricing upfront—no surprises',
  'Built for warmth and intention, not speed',
];

const faqItems = [
  {
    question: 'What do I need to start?',
    answer:
      'You only need a small set of emotional signals: one or two photos, the recipient details, your email, and a short note about the memory or tone.',
  },
  {
    question: 'Do I have to finish everything in one sitting?',
    answer:
      'No. The order is tied to a private status path, so if checkout is interrupted you can return to the same order instead of starting over.',
  },
  {
    question: 'Is the price visible before I begin?',
    answer:
      'Yes. The current starting price is shown on the landing page before you go into the birthday order flow.',
  },
];

export default function HomePage() {
  const orderingAvailable = isMemoriesOrderingAvailable();

  return (
    <main className="pb-16">
      <section className="hero hero-home">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)] lg:items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <Badge className="w-fit accent-chip">A gift for memories that matter</Badge>
                <div className="space-y-6">
                  <h1 className="h1 max-w-[10ch]">
                    Turn your favorite memory into a premium birthday gift.
                  </h1>
                  <p className="lead max-w-[58ch]">
                    Share a photo and a memory. We'll craft it into a beautiful, personalized birthday story.
                    Simple, private, and thoughtful.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href={orderingAvailable ? '/memories' : '/status'}>
                    {orderingAvailable ? 'Create your gift' : 'Check order status'}
                    <ArrowRight />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href="/how-it-works">See the process</Link>
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {featureNotes.map((item) => (
                  <div
                    key={item}
                    className="hero-feature-card"
                  >
                    <CheckCircle2 className="hero-feature-icon" />
                    <p className="hero-feature-text">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <Card className="hero-showcase-card">
              <div className="hero-showcase-glow" />
              <CardContent className="hero-showcase-content">
                <div className="hero-showcase-header">
                  <Badge variant="secondary" className="accent-chip">Starting at $299</Badge>
                  <div className="hero-showcase-label">
                    one beautiful gift
                  </div>
                </div>

                <div className="hero-showcase-preview">
                  <p className="hero-showcase-subtitle">
                    Sample birthday gift
                  </p>
                  <h2 className="hero-showcase-title">
                    For Lena, the person who made ordinary afternoons feel like part of the story.
                  </h2>
                  <p className="hero-showcase-description">
                    A handcrafted digital piece shaped around your photos, your tone, and your memory.
                    Delivered beautifully.
                  </p>
                </div>

                <div className="hero-showcase-grid">
                  <div className="hero-showcase-detail">
                    <div className="mini-kicker">what you share</div>
                    <div className="hero-showcase-bullets">
                      {reassuranceNotes.map((item) => (
                        <div key={item} className="hero-showcase-bullet">
                          <span className="hero-showcase-dot" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="hero-showcase-price">
                    <div className="hero-showcase-price-label">
                      starting price
                    </div>
                    <div className="hero-showcase-price-value">
                      <span className="hero-showcase-price-amount">299</span>
                      <span className="hero-showcase-price-currency">$</span>
                    </div>
                    <p className="hero-showcase-price-note">
                      See our price upfront. No surprises, no hidden fees.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="promise-section">
        <div className="container">
          <div className="promise-header">
            <h2 className="h2">Why choose Memories4U</h2>
          </div>
          <div className="promise-grid">
            {promiseCards.map(({ icon: Icon, title, copy }) => (
              <Card key={title} className="promise-card">
                <CardHeader className="promise-card-header">
                  <span className="promise-card-icon">
                    <Icon className="promise-card-icon-inner" />
                  </span>
                  <div className="promise-card-content">
                    <CardTitle className="promise-card-title">{title}</CardTitle>
                    <CardDescription className="promise-card-description">{copy}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="workflow-section">
        <div className="container">
          <div className="workflow-header">
            <div className="workflow-header-content">
              <Badge className="w-fit accent-chip" variant="secondary">How it works</Badge>
              <h2 className="h2 max-w-[13ch]">
                A simple, meaningful path to create your gift.
              </h2>
              <p className="lead max-w-[42ch]">
                We've designed the entire experience to be thoughtful and intuitive,
                from your first memory to the final delivery.
              </p>
            </div>
          </div>

          <div className="workflow-steps">
            {flowSteps.map((item, index) => (
              <div
                key={item.step}
                className={`workflow-step ${index === 1 ? 'workflow-step-featured' : ''}`}
              >
                <div className="workflow-step-number">{item.step}</div>
                <div className="workflow-step-content">
                  <h3 className="workflow-step-title">{item.title}</h3>
                  <p className="workflow-step-copy">{item.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <Card className="overflow-hidden border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(233,243,255,0.9))] shadow-[0_28px_80px_rgba(87,120,170,0.12)]">
            <CardContent className="space-y-6 p-6 lg:p-8">
              <div className="space-y-3">
                <Badge className="w-fit accent-chip" variant="secondary">The experience</Badge>
                <CardTitle className="max-w-[13ch] text-[clamp(2rem,4vw,3rem)]">
                  Designed to feel premium, not complicated.
                </CardTitle>
                <CardDescription className="max-w-[48ch] text-base">
                  Every detail—from the layout to the language—is crafted to make the gift-giving
                  experience feel warm, intentional, and special.
                </CardDescription>
              </div>

              <div className="rounded-[32px] bg-white/82 p-6 shadow-[0_18px_42px_rgba(86,115,160,0.1)]">
                <div className="grid gap-5">
                  <div className="rounded-[28px] bg-[linear-gradient(145deg,#fefefe,#edf5ff)] p-6">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Editorial composition
                    </div>
                    <p className="mb-0 mt-4 font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,3rem)] leading-[1.02] text-slate-950">
                      “A birthday piece shaped around the moments that already feel like home.”
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[24px] bg-sky-50/80 p-5">
                      <div className="mini-kicker">tone</div>
                      <p className="mb-0 mt-3 text-sm leading-7 text-slate-700">
                        Editorial, emotionally warm, and premium rather than loud or novelty-led.
                      </p>
                    </div>
                    <div className="rounded-[24px] bg-white p-5">
                      <div className="mini-kicker">buyer expectation</div>
                      <p className="mb-0 mt-3 text-sm leading-7 text-slate-700">
                        A thin path to purchase with enough visual quality to justify a premium
                        birthday gift decision.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/80 bg-white/74 shadow-[0_24px_64px_rgba(86,117,166,0.08)]">
            <CardHeader>
              <Badge className="w-fit accent-chip">Built for trust</Badge>
              <CardTitle className="max-w-[12ch] text-[clamp(2rem,4vw,3rem)]">
                Honest about what we do.
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="rounded-[26px] bg-sky-50/75 p-5">
                <div className="mini-kicker">what's included</div>
                <p className="mb-0 mt-3 text-sm leading-7 text-slate-700">
                  Birthday-specific design, transparent pricing, a simple briefing form, seamless checkout,
                  and a private link that's yours from start to finish.
                </p>
              </div>
              <div className="rounded-[26px] bg-white p-5">
                <div className="mini-kicker">what we don't promise</div>
                <p className="mb-0 mt-3 text-sm leading-7 text-slate-700">
                  No live preview, no AI writing assistance, no guaranteed turnaround time,
                  and no account logins needed.
                </p>
              </div>
              <div className="rounded-[30px] bg-slate-950 px-5 py-6 text-white">
                <div className="flex items-start gap-3">
                  <Mail className="mt-1 size-5 text-sky-300" />
                  <p className="mb-0 text-sm leading-7 text-slate-200">
                    We speak like a service, not software. Clear, warm, and focused on making
                    your gift feel special.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="section">
        <div className="container grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <Card className="border-white/80 bg-white/74 shadow-[0_24px_70px_rgba(86,117,166,0.08)]">
            <CardHeader>
              <Badge className="w-fit accent-chip" variant="secondary">Pricing</Badge>
              <CardTitle className="max-w-[12ch] text-[clamp(2rem,4vw,3rem)]">
                Transparent pricing for a premium gift.
              </CardTitle>
              <CardDescription className="max-w-[44ch] text-base">
                See the investment upfront. No surprises, no hidden fees. Just a clear price for
                a gift that truly matters.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-[34px] bg-[linear-gradient(135deg,rgba(15,23,42,0.97),rgba(20,64,124,0.94))] p-6 text-white shadow-[0_28px_60px_rgba(15,23,42,0.16)]">
                <div className="text-sm uppercase tracking-[0.2em] text-sky-200">
                  Birthday story gift
                </div>
                <div className="mt-4 flex flex-wrap items-end gap-3">
                  <span className="font-[family-name:var(--font-display)] text-[clamp(4rem,8vw,5.8rem)] leading-none">
                    299
                  </span>
                  <span className="pb-3 text-sm uppercase tracking-[0.18em] text-slate-300">
                    starting price
                  </span>
                </div>
                <p className="mb-0 mt-5 max-w-[38ch] text-sm leading-7 text-slate-200">
                  One-time investment for a gift that's personal, premium, and meaningful.
                  No recurring charges.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/80 bg-white/74 shadow-[0_24px_70px_rgba(86,117,166,0.08)]">
            <CardHeader>
              <Badge className="w-fit accent-chip">Questions</Badge>
              <CardTitle>Everything you need to know about getting started.</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item) => (
                  <AccordionItem key={item.question} value={item.question}>
                    <AccordionTrigger>{item.question}</AccordionTrigger>
                    <AccordionContent>{item.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="section pt-0">
        <div className="container">
          <Card className="border-white/80 bg-[linear-gradient(135deg,rgba(14,23,39,0.97),rgba(21,83,145,0.95))] text-white shadow-[0_32px_80px_rgba(15,23,42,0.16)]">
            <CardContent className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between lg:p-8">
              <div className="space-y-2">
                <Badge className="w-fit border-white/15 bg-white/10 text-white" variant="dark">
                  Let's create your gift
                </Badge>
                <h2 className="font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,3rem)] leading-[1.02]">
                  Turn a memory into something unforgettable.
                </h2>
                <p className="max-w-[44ch] text-base leading-7 text-slate-200">
                  The process is simple. Just share what matters. We'll handle the rest.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href={orderingAvailable ? '/memories' : '/status'}>
                    {orderingAvailable ? 'Start creating' : 'Check order status'}
                    <Sparkles />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href="/how-it-works">See how it works</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
