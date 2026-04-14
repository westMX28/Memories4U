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
  'A slim, private order path from first details through final delivery',
  'One or two photos and a short memory cue are enough to begin',
  'Birthday-specific, premium, and intentionally simple from the first screen',
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
    title: 'Birthday-first positioning',
    copy: 'This is not a generic AI tool. It is a focused birthday gift flow designed to feel warm, premium, and easy to trust.',
  },
  {
    icon: WandSparkles,
    title: 'Small effort, high emotional return',
    copy: 'The front-end asks for the minimum emotional inputs needed to start a polished digital story without friction.',
  },
  {
    icon: LockKeyhole,
    title: 'Private by default',
    copy: 'Checkout recovery, order progress, and delivery access stay connected through one private route instead of an account system.',
  },
];

const featureNotes = [
  'Editorial composition with generous whitespace and a premium tone',
  'Clear pricing before the buyer invests effort',
  'A calm service feel instead of dashboard density or startup clutter',
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
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.03fr)_minmax(360px,0.97fr)] lg:items-center">
            <div className="space-y-7">
              <Badge className="w-fit accent-chip">Birthday Stories v1</Badge>
              <div className="space-y-5">
                <h1 className="h1 max-w-[10.5ch]">
                  A premium birthday gift, built from the memories that already matter.
                </h1>
                <p className="lead max-w-[58ch]">
                  Memories4U turns a small set of emotional inputs into a polished birthday story
                  flow. Start with one or two photos, a short cue, and a private path that stays
                  with the order from checkout to delivery.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href={orderingAvailable ? '/memories' : '/status'}>
                    {orderingAvailable ? 'Start a birthday story' : 'Open order status'}
                    <ArrowRight />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href="/how-it-works">See how it works</Link>
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {featureNotes.map((item) => (
                  <div
                    key={item}
                    className="rounded-[24px] bg-white/76 px-4 py-4 text-sm leading-6 text-slate-700 shadow-[0_20px_40px_rgba(66,94,138,0.08)]"
                  >
                    <CheckCircle2 className="mb-3 size-4 text-sky-700" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <Card className="relative overflow-hidden border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(228,240,255,0.92))] p-2 shadow-[0_40px_120px_rgba(76,114,168,0.18)]">
              <div className="absolute inset-x-10 top-2 h-36 rounded-full bg-sky-200/35 blur-3xl" />
              <CardContent className="relative grid gap-6 p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <Badge variant="secondary" className="accent-chip">Starting at 299</Badge>
                  <div className="text-right text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    calm editorial surface
                  </div>
                </div>

                <div className="rounded-[34px] bg-[linear-gradient(160deg,#ffffff,rgba(241,247,255,0.98))] p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]">
                  <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-sky-800">
                    Sample birthday treatment
                  </p>
                  <h2 className="font-[family-name:var(--font-display)] text-[clamp(2.15rem,4vw,3.45rem)] leading-[0.98] text-slate-950">
                    For Lena, the person who made ordinary afternoons feel like part of the story.
                  </h2>
                  <p className="mb-0 mt-5 max-w-[34ch] text-base leading-7 text-slate-600">
                    A premium digital birthday piece shaped around your photos, your tone, and a
                    memory cue that still feels personal when time is short.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                  <div className="rounded-[28px] bg-[rgba(255,255,255,0.8)] p-5 shadow-[0_16px_38px_rgba(91,123,170,0.1)]">
                    <div className="mini-kicker">what the buyer sees first</div>
                    <div className="mt-4 grid gap-3">
                      {reassuranceNotes.map((item) => (
                        <div key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-700">
                          <span className="mt-2 size-2 rounded-full bg-sky-600" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[28px] bg-slate-950 px-5 py-6 text-white shadow-[0_22px_50px_rgba(15,23,42,0.2)]">
                    <div className="text-sm uppercase tracking-[0.18em] text-sky-200">
                      current price
                    </div>
                    <div className="mt-3 flex items-end gap-2">
                      <span className="font-[family-name:var(--font-display)] text-6xl leading-none">
                        299
                      </span>
                      <span className="pb-2 text-sm uppercase tracking-[0.18em] text-slate-300">
                        one-time
                      </span>
                    </div>
                    <p className="mb-0 mt-4 text-sm leading-7 text-slate-200">
                      Visible before the order begins, so the product feels premium and honest
                      instead of gated behind extra steps.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container grid gap-5 lg:grid-cols-3">
          {promiseCards.map(({ icon: Icon, title, copy }) => (
            <Card key={title} className="border-white/80 bg-white/74 shadow-[0_18px_38px_rgba(78,112,161,0.08)]">
              <CardHeader className="space-y-4">
                <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                  <Icon className="size-5" />
                </span>
                <div className="space-y-2">
                  <CardTitle>{title}</CardTitle>
                  <CardDescription>{copy}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Card className="overflow-hidden border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(236,244,255,0.92))] shadow-[0_32px_100px_rgba(79,109,158,0.12)]">
            <CardContent className="grid gap-8 p-6 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:p-8">
              <div className="space-y-4">
                <Badge className="w-fit accent-chip" variant="secondary">How it works</Badge>
                <h2 className="h2 max-w-[11ch]">
                  A clear path for people who want the gift to feel thoughtful, not rushed.
                </h2>
                <p className="lead max-w-[40ch]">
                  The structure stays simple on purpose: emotional signal first, checkout next,
                  private status throughout.
                </p>
              </div>

              <div className="grid gap-4">
                {flowSteps.map((item, index) => (
                  <Card
                    key={item.step}
                    className={
                      index === 1
                        ? 'border-sky-200/70 bg-white/88 shadow-[0_18px_40px_rgba(85,117,166,0.08)]'
                        : 'border-white/80 bg-white/74'
                    }
                  >
                    <CardContent className="flex gap-4 p-5 sm:p-6">
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--accent),var(--accent-strong))] text-sm font-semibold text-white">
                        {item.step}
                      </div>
                      <div>
                        <h3 className="mt-1 text-2xl">{item.title}</h3>
                        <p className="copy mb-0 mt-3">{item.copy}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="section">
        <div className="container grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <Card className="overflow-hidden border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(233,243,255,0.9))] shadow-[0_28px_80px_rgba(87,120,170,0.12)]">
            <CardContent className="space-y-6 p-6 lg:p-8">
              <div className="space-y-3">
                <Badge className="w-fit accent-chip" variant="secondary">Product preview</Badge>
                <CardTitle className="max-w-[12ch] text-[clamp(2rem,4vw,3rem)]">
                  The page should suggest craft before the buyer sees any production detail.
                </CardTitle>
                <CardDescription className="max-w-[46ch] text-base">
                  This section is intentionally teaser-like. It signals quality, composition, and
                  warmth without pretending the live app already includes a pre-purchase preview
                  workflow.
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
              <Badge className="w-fit accent-chip">What this page promises</Badge>
              <CardTitle className="max-w-[12ch] text-[clamp(2rem,4vw,3rem)]">
                Strong claims only where the current product actually supports them.
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="rounded-[26px] bg-sky-50/75 p-5">
                <div className="mini-kicker">included now</div>
                <p className="mb-0 mt-3 text-sm leading-7 text-slate-700">
                  Birthday-specific positioning, visible price, slim briefing, checkout handoff,
                  and a private status path that stays with the order.
                </p>
              </div>
              <div className="rounded-[26px] bg-white p-5">
                <div className="mini-kicker">not implied here</div>
                <p className="mb-0 mt-3 text-sm leading-7 text-slate-700">
                  No live preview promise, no assisted writing promise, no timing guarantee, and no
                  account-based workflow that the product does not actually implement.
                </p>
              </div>
              <div className="rounded-[30px] bg-slate-950 px-5 py-6 text-white">
                <div className="flex items-start gap-3">
                  <Mail className="mt-1 size-5 text-sky-300" />
                  <p className="mb-0 text-sm leading-7 text-slate-200">
                    The product language stays service-like and calm so the buyer understands the
                    path quickly without feeling pushed into generic software UX.
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
                Clear enough to trust before the order starts.
              </CardTitle>
              <CardDescription className="max-w-[44ch] text-base">
                This slice keeps pricing explicit on the landing page instead of revealing it later
                in the flow.
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
                  The buyer sees the price before committing time, which fits the premium positioning
                  better than a hidden or deferred reveal.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/80 bg-white/74 shadow-[0_24px_70px_rgba(86,117,166,0.08)]">
            <CardHeader>
              <Badge className="w-fit accent-chip">FAQ</Badge>
              <CardTitle>Questions that should not slow down the gift decision.</CardTitle>
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
                  One clear next step
                </Badge>
                <h2 className="font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,3rem)] leading-[1.02]">
                  Start the birthday gift while the memory still feels close.
                </h2>
                <p className="max-w-[44ch] text-base leading-7 text-slate-200">
                  The product should feel like a premium service with a short runway: begin the
                  order, move into checkout, and return through the same private path when needed.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href={orderingAvailable ? '/memories' : '/status'}>
                    {orderingAvailable ? 'Begin the gift' : 'Open private status'}
                    <Sparkles />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href="/how-it-works">Review the flow</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
