import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  CircleCheckBig,
  Gift,
  LockKeyhole,
  Quote,
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
import {
  homepageSupportExamples,
  leadHomepageExample,
  lowerHomepageExamples,
} from '@/lib/memories/examples';
import { isMemoriesOrderingAvailable } from '@/lib/memories/public-flow';

const productPrice = '1,99 €';

const trustPoints = [
  {
    icon: LockKeyhole,
    title: 'Your memories stay yours',
    description: "No account, no logins, no tracking. A private link that's yours forever.",
  },
  {
    icon: WandSparkles,
    title: 'Built on what you tell us',
    description:
      'We listen to your photos, your words, what matters. That becomes the whole thing.',
  },
  {
    icon: Gift,
    title: 'Made with care',
    description: 'More thought than a template. More intention than a click. Real effort.',
  },
];

const processSteps = [
  {
    step: '01',
    title: 'Share what matters',
    description: "Photos. A name. How you feel about this person. That's the whole brief.",
  },
  {
    step: '02',
    title: 'See the cost, pay once',
    description: `${productPrice}. Everything included. No surprises, no recurring charges.`,
  },
  {
    step: '03',
    title: 'Get a link you control',
    description: "Track your order, download when ready, return anytime. It's yours to keep.",
  },
];

const faqItems = [
  {
    question: 'What do I actually need to provide?',
    answer:
      "One or two photos. Their name. Your email. And a sentence or two about what the moment means to you. That's everything we need. You're not writing a novel—just sharing the feeling.",
  },
  {
    question: "What if I don't finish right away?",
    answer:
      'Your order is saved and waiting. If payment gets interrupted, you get a private link to come back and finish exactly where you left off. No starting over, no lost information.',
  },
  {
    question: 'What do I actually get?',
    answer:
      'A finished digital image file. High quality. Ready to download, print, display, or share. Plus a private page where you can track progress and access it anytime. No expirations, no account logins.',
  },
  {
    question: 'Is this AI-made?',
    answer:
      "It uses AI as one tool, but the real work is understanding your photos, your story, what this person means to you. The tool helps us translate that into something visual. It's not generic because your moment isn't.",
  },
];

const reviewNotes = [
  'The homepage uses the approved six-asset curation, but only the homepage-safe subset.',
  'The lead image stays dominant so the page feels editorial rather than like a gallery wall.',
  'Examples signal quality and emotional range, not a live preview before purchase.',
];

export default function HomePage() {
  const orderingAvailable = isMemoriesOrderingAvailable();

  return (
    <main className="pb-16">
      <section className="hero hero-home">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] lg:items-center">
            <div className="space-y-10">
              <div className="space-y-6">
                <div className="space-y-3">
                  <h1 className="h1 max-w-[12ch]">A birthday gift shaped from real memories.</h1>
                  <p className="max-w-[52ch] text-lg leading-relaxed text-slate-700">
                    One or two photos and a short memory cue are enough. We turn them into a
                    premium birthday image that feels thoughtful, personal, and ready to share.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Button asChild size="lg" className="h-12 px-8">
                  <Link
                    href={orderingAvailable ? '/memories' : '/status'}
                    className="text-base font-semibold"
                  >
                    {orderingAvailable ? 'Create your gift' : 'Check order'}
                    <ArrowRight className="ml-2 size-5" />
                  </Link>
                </Button>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="size-4 text-blue-600" />
                  <span>
                    Starting at <strong>{productPrice}</strong>
                  </span>
                </div>
              </div>

              <div className="space-y-4 border-t border-slate-200 pt-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-700">
                  Built for birthday gifting
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { label: 'No login, ever', desc: "A private link that's yours forever" },
                    { label: 'Real personalization', desc: 'Built from your photos, your story' },
                    { label: 'Edited, not templated', desc: 'Each gift is composed separately, with care' },
                    { label: 'One price, all-in', desc: 'The starting price is visible before you begin' },
                  ].map((item) => (
                    <div key={item.label} className="text-sm">
                      <p className="font-semibold text-slate-900">{item.label}</p>
                      <p className="text-xs text-slate-600">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Card className="hero-showcase-card sticky top-20 h-fit">
              <div className="hero-showcase-glow" />
              <CardContent className="hero-showcase-content">
                <div className="relative mb-6 aspect-square w-full overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-900 to-blue-950">
                  <div className="absolute left-4 top-4 z-10">
                    <Badge className="accent-chip" variant="secondary">
                      Approved lead example
                    </Badge>
                  </div>
                  <Image
                    src={leadHomepageExample.imagePath}
                    alt="Approved garden-party birthday story example."
                    fill
                    className="rounded-[28px] object-cover"
                    priority
                  />
                  <div className="absolute inset-0 rounded-[28px] bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
                      Homepage proof direction
                    </p>
                    <h2 className="mb-3 text-2xl leading-tight text-slate-100">
                      One dominant birthday image, then quieter supporting proof.
                    </h2>
                    <p className="text-sm leading-relaxed text-slate-400">
                      The lead example does the trust work above the fold. Supporting imagery
                      expands the range without turning the page into a gallery.
                    </p>
                  </div>

                  <div className="rounded-[20px] border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
                      Why this image leads
                    </div>
                    <ul className="space-y-2 text-sm text-slate-300">
                      {leadHomepageExample.whyItPasses.slice(0, 3).map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="flex-shrink-0 text-slate-500">→</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {homepageSupportExamples.map((example) => (
                      <div
                        key={example.slug}
                        className="overflow-hidden rounded-[18px] border border-white/15 bg-white/10"
                      >
                        <div className="relative aspect-[4/5]">
                          <Image
                            src={example.imagePath}
                            alt={`${example.shortTitle} supporting birthday story example.`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="space-y-1 p-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                            {example.shortTitle}
                          </p>
                          <p className="text-xs leading-5 text-slate-400">{example.editorialLead}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="workflow-section">
        <div className="container">
          <div className="workflow-header">
            <div className="workflow-header-content">
              <Badge className="w-fit accent-chip" variant="secondary">
                Three steps
              </Badge>
              <h2 className="h2 max-w-[12ch]">Quick. Clear. Done.</h2>
              <p className="lead max-w-[50ch]">
                Designed so you&apos;re not guessing at any point. Share, confirm, download.
              </p>
            </div>
          </div>

          <div className="workflow-steps">
            {processSteps.map((item, index) => (
              <div
                key={item.step}
                className={`workflow-step ${index === 1 ? 'workflow-step-featured' : ''}`}
              >
                <div className="workflow-step-number">{item.step}</div>
                <div className="workflow-step-content">
                  <h3 className="workflow-step-title">{item.title}</h3>
                  <p className="workflow-step-copy">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="space-y-12">
            <div className="mx-auto max-w-3xl space-y-4 text-center">
              <Badge className="mx-auto w-fit accent-chip">What you&apos;re getting</Badge>
              <h2 className="h2">A real gift shaped by real moments.</h2>
              <p className="lead">
                We don&apos;t use templates. We take your photos and what you tell us and create
                something custom. The difference is noticeable.
              </p>
            </div>

            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: 'Custom arrangement',
                  description:
                    'We design the layout for your specific photos and moment. Not a preset template. Each one is arranged differently based on what you shared.',
                  details: ['Thoughtful visual flow', 'Reflects your story', 'Edited with care'],
                },
                {
                  title: 'Emotional framing',
                  description:
                    'We focus on what you told us matters. The final piece celebrates this person the way you see them.',
                  details: ['Built on your perspective', 'Captures what you feel', 'Meaningful to you both'],
                },
                {
                  title: 'Digital file you own',
                  description:
                    'High-quality image. Ready to download, print, display. No logins, no subscriptions, no expiry.',
                  details: ['Download and keep it', 'Share or display', 'Stays yours'],
                },
              ].map((item) => (
                <Card key={item.title} className="border-white/70 bg-white/76 p-4 sm:p-6">
                  <h3 className="mb-3 text-lg leading-tight text-slate-900">{item.title}</h3>
                  <p className="mb-4 text-sm leading-6 text-slate-700">{item.description}</p>
                  <ul className="space-y-2">
                    {item.details.map((detail) => (
                      <li key={detail} className="flex gap-2 text-sm text-slate-600">
                        <span className="flex-shrink-0 font-bold text-blue-600">•</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>

            <Card className="overflow-hidden border-white/70 bg-gradient-to-br from-blue-50/90 to-slate-50/90">
              <CardContent className="p-6 sm:p-8 lg:p-10">
                <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 lg:items-center">
                  <div className="space-y-4">
                    <h3 className="text-2xl leading-tight text-slate-900">
                      Why someone notices the difference.
                    </h3>
                    <p className="leading-relaxed text-slate-700">
                      A templated gift says &quot;I found a service online.&quot; A real gift says
                      &quot;I took time to think about you, picked photos that mean something, and
                      created this specifically.&quot;
                    </p>
                    <p className="leading-relaxed text-slate-700">
                      {productPrice} covers the actual work: understanding your photos, your
                      story, your relationship. Then designing something that reflects that.
                      That&apos;s not a machine doing it alone, it&apos;s someone reading what you
                      shared and translating it into something visual.
                    </p>
                    <p className="mt-6 border-l-4 border-blue-600 pl-4 text-sm text-slate-600">
                      &quot;You&apos;re paying for thoughtfulness, not for AI. For custom design,
                      not a template. For something that couldn&apos;t exist without you. That
                      takes time. That has value.&quot;
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[28px] border border-white/70 bg-white/80 p-6">
                      <div className="mini-kicker mb-3">The difference</div>
                      <div className="space-y-4">
                        <div>
                          <p className="mb-1 text-sm font-semibold text-slate-900">
                            Standard photo gift
                          </p>
                          <p className="text-xs text-slate-600">
                            Pre-made layout, your photos inserted, one design fits all
                          </p>
                        </div>
                        <div className="h-px bg-slate-200" />
                        <div>
                          <p className="mb-1 text-sm font-semibold text-blue-700">This gift</p>
                          <p className="text-xs text-slate-700">
                            Custom layout designed for your photos, edited with care, unique to
                            your moment
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[28px] border border-white/70 bg-white/80 p-6">
                      <div className="mini-kicker mb-3">What that means</div>
                      <ul className="space-y-2">
                        {[
                          'Built from your story, not a template',
                          'Design decisions made for your moment',
                          'Feels thoughtful, not mass-produced',
                          'Shows you put real thought in',
                        ].map((item) => (
                          <li key={item} className="flex gap-2 text-xs text-slate-700">
                            <span className="flex-shrink-0 text-blue-600">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
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
            <h2 className="h2">Built for trust and ownership</h2>
            <p className="mx-auto mt-3 max-w-[60ch] lead">
              Your memories are yours alone. Private by default. No logins, no tracking, no
              surprises.
            </p>
          </div>
          <div className="promise-grid">
            {trustPoints.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="promise-card">
                <CardHeader className="promise-card-header">
                  <span className="promise-card-icon">
                    <Icon className="promise-card-icon-inner" />
                  </span>
                  <div className="promise-card-content">
                    <CardTitle className="promise-card-title">{title}</CardTitle>
                    <CardDescription className="promise-card-description">
                      {description}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <Card className="overflow-hidden border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(232,242,255,0.92))] shadow-[0_28px_80px_rgba(87,120,170,0.12)]">
            <CardContent className="grid gap-6 p-6 lg:p-8">
              <div className="space-y-3">
                <Badge className="w-fit accent-chip" variant="secondary">
                  Curated proof
                </Badge>
                <CardTitle className="max-w-[14ch] text-[clamp(1.8rem,3vw,2.7rem)]">
                  Approved imagery carries more of the proof work now.
                </CardTitle>
                <CardDescription className="max-w-[48ch] text-base">
                  The homepage now draws from the approved birthday set across romantic, reunion,
                  and social lanes while keeping the lead image unmistakably in control.
                </CardDescription>
              </div>

              <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                <div className="overflow-hidden rounded-[28px] border border-white/80 bg-white/90 shadow-[0_18px_40px_rgba(85,117,166,0.08)]">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={leadHomepageExample.imagePath}
                      alt="Approved garden-party birthday story example."
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="grid gap-3 p-5">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge className="accent-chip" variant="secondary">
                        Homepage lead
                      </Badge>
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {leadHomepageExample.label}
                      </span>
                    </div>
                    <p className="mb-0 text-sm leading-7 text-slate-700">
                      {leadHomepageExample.summary}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-[24px] bg-white/84 p-5 shadow-[0_18px_40px_rgba(85,117,166,0.08)]">
                    <div className="mb-3 flex items-start gap-3">
                      <Quote className="mt-1 size-4 text-sky-700" />
                      <div>
                        <div className="mini-kicker">review framing</div>
                        <p className="mb-0 mt-2 text-sm leading-7 text-slate-700">
                          The proof language stays calm and specific. It demonstrates quality
                          direction without pretending there is a live preview promise.
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-3">
                      {reviewNotes.map((item) => (
                        <div
                          key={item}
                          className="flex items-start gap-3 text-sm leading-7 text-slate-700"
                        >
                          <CircleCheckBig className="mt-1 size-4 text-sky-700" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {homepageSupportExamples.map((example) => (
                      <div
                        key={example.slug}
                        className="overflow-hidden rounded-[24px] border border-white/80 bg-white/90 shadow-[0_18px_40px_rgba(85,117,166,0.08)]"
                      >
                        <div className="grid gap-4 p-4 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center">
                          <div className="relative aspect-[4/3] overflow-hidden rounded-[18px]">
                            <Image
                              src={example.imagePath}
                              alt={`${example.shortTitle} supporting birthday story example.`}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="grid gap-2">
                            <div className="flex flex-wrap items-center gap-3">
                              <Badge className="accent-chip" variant="secondary">
                                Supporting proof
                              </Badge>
                              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                {example.shortTitle}
                              </span>
                            </div>
                            <p className="mb-0 text-sm leading-7 text-slate-700">
                              {example.editorialLead}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {lowerHomepageExamples.length > 0 ? (
                <div className="grid gap-4 rounded-[28px] border border-white/80 bg-white/72 p-5 shadow-[0_18px_40px_rgba(85,117,166,0.06)] sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[20px]">
                    <Image
                      src={lowerHomepageExamples[0].imagePath}
                      alt={`${lowerHomepageExamples[0].shortTitle} lower-page birthday story example.`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-3">
                    <Badge className="w-fit accent-chip" variant="secondary">
                      Broader social proof
                    </Badge>
                    <p className="mb-0 text-base leading-7 text-slate-700">
                      {lowerHomepageExamples[0].summary}
                    </p>
                    <p className="mb-0 text-sm leading-6 text-slate-600">
                      Used below the main proof band so the page stays premium and selective while
                      still showing that birthday gifting is not limited to romantic scenes.
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <Button asChild variant="secondary">
                  <Link href="/examples">
                    See selected examples
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(233,243,255,0.9))] shadow-[0_28px_80px_rgba(87,120,170,0.12)]">
            <CardContent className="space-y-6 p-6 sm:p-8 lg:p-10">
              <div className="space-y-3">
                <Badge className="w-fit accent-chip" variant="secondary">
                  What to share
                </Badge>
                <CardTitle className="max-w-[12ch] text-[clamp(1.6rem,3vw,2.4rem)]">
                  Just the essentials.
                </CardTitle>
                <p className="text-base leading-relaxed text-slate-700">
                  Photos. Names. How you feel about this person. That&apos;s the whole brief. We
                  don&apos;t need novels.
                </p>
              </div>

              <div className="space-y-4 rounded-[24px] bg-white/80 p-5 sm:p-7">
                <div className="space-y-4 sm:space-y-5">
                  {[
                    {
                      title: 'One or two photos',
                      copy: "Any size, any quality. That's it.",
                    },
                    {
                      title: 'Their name and email',
                      copy: 'We know who the gift is for and where to send your link.',
                    },
                    {
                      title: 'A sentence about feeling',
                      copy: 'Even one sentence shapes the whole gift.',
                    },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-3 sm:gap-4">
                      <div className="w-5 flex-shrink-0 text-center text-xl font-light text-slate-400 sm:w-6 sm:text-2xl">
                        →
                      </div>
                      <div>
                        <p className="mb-1 text-sm font-semibold text-slate-900 sm:text-base">
                          {item.title}
                        </p>
                        <p className="text-xs text-slate-600 sm:text-sm">{item.copy}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 border-t border-slate-200 pt-4 sm:mt-5 sm:pt-5">
                  <p className="text-xs leading-relaxed text-slate-600">
                    <strong>No writing skills needed.</strong> We listen for feeling, not
                    perfection.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="section">
        <div className="container grid gap-6 lg:grid-cols-2">
          <Card className="border-white/80 bg-white/74 shadow-[0_24px_70px_rgba(86,117,166,0.08)]">
            <CardHeader>
              <Badge className="w-fit accent-chip" variant="secondary">
                Pricing
              </Badge>
              <CardTitle className="max-w-[12ch] text-[clamp(1.6rem,3vw,2.4rem)]">
                Fair, honest pricing.
              </CardTitle>
              <CardDescription className="mt-2 text-sm">
                One price for a complete, beautiful gift. No surprises.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-[28px] bg-gradient-to-br from-slate-950 via-blue-950 to-blue-900 p-8 text-white shadow-[0_28px_60px_rgba(15,23,42,0.2)]">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">
                  Handcrafted story
                </div>
                <div className="mt-4 flex items-end gap-2">
                  <span className="text-6xl font-light leading-none">{productPrice}</span>
                  <span className="pb-1 text-xs uppercase tracking-[0.18em] text-slate-300">
                    Starting
                  </span>
                </div>
                <p className="mb-0 mt-6 max-w-[38ch] text-sm leading-7 text-slate-200">
                  One-time cost. No subscriptions. No recurring charges. A complete gift
                  experience.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/80 bg-white/74 shadow-[0_24px_70px_rgba(86,117,166,0.08)]">
            <CardHeader>
              <Badge className="w-fit accent-chip">FAQ</Badge>
              <CardTitle className="text-[clamp(1.6rem,3vw,2.4rem)]">
                Questions answered.
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item) => (
                  <AccordionItem key={item.question} value={item.question}>
                    <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm leading-relaxed text-slate-600">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="section pt-0">
        <div className="container">
          <Card className="border-white/80 bg-gradient-to-br from-slate-950 via-blue-950 to-blue-900 text-white shadow-[0_32px_96px_rgba(15,23,42,0.16)]">
            <CardContent className="flex flex-col gap-8 p-8 lg:flex-row lg:items-center lg:justify-between lg:p-10">
              <div className="flex-1 space-y-4">
                <h2 className="text-[clamp(2rem,4vw,3rem)] leading-tight">
                  Create their gift today.
                </h2>
                <p className="max-w-[48ch] text-base leading-7 text-slate-300">
                  Photos, a memory, and your email. That&apos;s all it takes. The birthday is
                  coming. Make it meaningful.
                </p>
              </div>

              <Button
                asChild
                size="lg"
                className="h-12 flex-shrink-0 bg-white px-8 text-slate-950 hover:bg-slate-100"
              >
                <Link href={orderingAvailable ? '/memories' : '/status'}>
                  {orderingAvailable ? 'Create your gift' : 'Check order'}
                  <ArrowRight className="size-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
