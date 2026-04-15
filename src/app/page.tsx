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

const trustPoints = [
  {
    icon: LockKeyhole,
    title: 'Your memories stay yours',
    description: 'No account, no logins, no tracking. A private link that\'s yours forever.',
  },
  {
    icon: WandSparkles,
    title: 'Built on what you tell us',
    description: 'We listen to your photos, your words, what matters. That becomes the whole thing.',
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
    description: 'Photos. A name. How you feel about this person. That\'s the whole brief.',
  },
  {
    step: '02',
    title: 'See the cost, pay once',
    description: '$299. Everything included. No surprises, no recurring charges.',
  },
  {
    step: '03',
    title: 'Get a link you control',
    description: 'Track your order, download when ready, return anytime. It\'s yours to keep.',
  },
];

const faqItems = [
  {
    question: 'What do I actually need to provide?',
    answer:
      'One or two photos. Their name. Your email. And a sentence or two about what the moment means to you. That\'s everything we need. You\'re not writing a novel—just sharing the feeling.',
  },
  {
    question: 'What if I don\'t finish right away?',
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
      'It uses AI as one tool, but the real work is understanding your photos, your story, what this person means to you. The tool helps us translate that into something visual. It\'s not generic because your moment isn\'t.',
  },
];

export default function HomePage() {
  const orderingAvailable = isMemoriesOrderingAvailable();

  return (
    <main className="pb-16">
      {/* Hero Section */}
      <section className="hero hero-home">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] lg:items-center">
            <div className="space-y-10">
              <div className="space-y-6">
                <div className="space-y-3">
                  <h1 className="h1 max-w-[13ch]">
                    A gift built on who they are.
                  </h1>
                  <p className="text-lg leading-relaxed text-slate-700 max-w-[52ch]">
                    Tell us about the person and the moment. We create a thoughtful gift from your photos and memories. Private. Personal. Ready to share or keep.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <Button asChild size="lg" className="px-8 h-12">
                  <Link href={orderingAvailable ? '/memories' : '/status'} className="text-base font-semibold">
                    {orderingAvailable ? 'Create your gift' : 'Check order'}
                    <ArrowRight className="size-5 ml-2" />
                  </Link>
                </Button>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="size-4 text-blue-600" />
                  <span>Starting at <strong>$299</strong></span>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-200">
                <p className="text-xs uppercase tracking-widest font-semibold text-blue-700">Why it works differently</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { label: 'No login, ever', desc: 'A private link that\'s yours forever' },
                    { label: 'Real personalization', desc: 'Built from your photos, your story' },
                    { label: 'Edited, not templated', desc: 'Each one is made separately, with care' },
                    { label: 'One price, all-in', desc: 'See everything before you decide' }
                  ].map((item) => (
                    <div key={item.label} className="text-sm">
                      <p className="font-semibold text-slate-900">{item.label}</p>
                      <p className="text-slate-600 text-xs">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Hero Visual Card */}
            <Card className="hero-showcase-card h-fit sticky top-20">
              <div className="hero-showcase-glow" />
              <CardContent className="hero-showcase-content">
                <div className="relative w-full overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-900 to-blue-950 aspect-square flex items-center justify-center mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent" />
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets%2Ff3b9c9acc55f45cfb82a19e78ec506ff%2F443ebb909efb4130bffe3cf94f6ed157?format=webp&width=800&height=1200"
                    alt="Two people celebrating together while enjoying a gift"
                    className="w-full h-full object-cover rounded-[28px]"
                  />
                  <div className="absolute inset-0 rounded-[28px] bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest font-semibold text-slate-400 mb-2">What you get</p>
                    <h2 className="text-2xl font-display leading-tight text-slate-100 mb-3">
                      Something real to celebrate with.
                    </h2>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      A finished image file made with care. Download it, print it, share it. Or keep it private. It's yours.
                    </p>
                  </div>

                  <div className="rounded-[20px] bg-white/10 border border-white/20 p-4 backdrop-blur-sm">
                    <div className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-2">How it works</div>
                    <ul className="space-y-2 text-sm text-slate-300">
                      <li className="flex gap-2">
                        <span className="text-slate-500 flex-shrink-0">→</span>
                        <span>Share your photos and a moment</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-slate-500 flex-shrink-0">→</span>
                        <span>Confirm price, pay, get your link</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-slate-500 flex-shrink-0">→</span>
                        <span>Download and celebrate</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Section 2: Simplicity (why it's easy) */}
      <section className="workflow-section">
        <div className="container">
          <div className="workflow-header">
            <div className="workflow-header-content">
              <Badge className="w-fit accent-chip" variant="secondary">Three steps</Badge>
              <h2 className="h2 max-w-[12ch]">
                Quick. Clear. Done.
              </h2>
              <p className="lead max-w-[50ch]">
                Designed so you're not guessing at any point. Share, confirm, download.
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

      {/* Section 2.5: The Product (what they actually get) */}
      <section className="section">
        <div className="container">
          <div className="space-y-12">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <Badge className="w-fit accent-chip mx-auto">What you're getting</Badge>
              <h2 className="h2">A real gift shaped by real moments.</h2>
              <p className="lead">
                We don't use templates. We take your photos and what you tell us and create something custom. The difference is noticeable.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {[
                {
                  title: 'Custom arrangement',
                  description: 'We design the layout for your specific photos and moment. Not a preset template. Each one is arranged differently based on what you shared.',
                  details: ['Thoughtful visual flow', 'Reflects your story', 'Edited with care']
                },
                {
                  title: 'Emotional framing',
                  description: 'We focus on what you told us matters. The final piece celebrates this person the way you see them.',
                  details: ['Built on your perspective', 'Captures what you feel', 'Meaningful to you both']
                },
                {
                  title: 'Digital file you own',
                  description: 'High-quality image. Ready to download, print, display. No logins, no subscriptions, no expiry.',
                  details: ['Download and keep it', 'Share or display', 'Stays yours']
                }
              ].map((item) => (
                <Card key={item.title} className="border-white/70 bg-white/76 p-6">
                  <h3 className="font-display text-lg leading-tight mb-3 text-slate-900">{item.title}</h3>
                  <p className="text-sm leading-6 text-slate-700 mb-4">{item.description}</p>
                  <ul className="space-y-2">
                    {item.details.map((detail) => (
                      <li key={detail} className="flex gap-2 text-sm text-slate-600">
                        <span className="text-blue-600 font-bold flex-shrink-0">•</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>

            <Card className="overflow-hidden border-white/70 bg-gradient-to-br from-blue-50/90 to-slate-50/90">
              <CardContent className="p-8 lg:p-10">
                <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
                  <div className="space-y-4">
                    <h3 className="font-display text-2xl leading-tight text-slate-900">
                      Why someone notices the difference.
                    </h3>
                    <p className="text-slate-700 leading-relaxed">
                      A templated gift says "I found a service online." A real gift says "I took time to think about you, picked photos that mean something, and created this specifically."
                    </p>
                    <p className="text-slate-700 leading-relaxed">
                      $299 covers the actual work: understanding your photos, your story, your relationship. Then designing something that reflects that. That's not a machine doing it alone—it's someone reading what you shared and translating it into something visual.
                    </p>
                    <p className="text-sm text-slate-600 border-l-4 border-blue-600 pl-4 mt-6">
                      "You're paying for thoughtfulness, not for AI. For custom design, not a template. For something that couldn't exist without you. That takes time. That has value."
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[28px] bg-white/80 p-6 border border-white/70">
                      <div className="mini-kicker mb-3">The difference</div>
                      <div className="space-y-4">
                        <div>
                          <p className="font-semibold text-slate-900 mb-1 text-sm">Standard photo gift</p>
                          <p className="text-xs text-slate-600">Pre-made layout, your photos inserted, one design fits all</p>
                        </div>
                        <div className="h-px bg-slate-200"></div>
                        <div>
                          <p className="font-semibold text-blue-700 mb-1 text-sm">This gift</p>
                          <p className="text-xs text-slate-700">Custom layout designed for your photos, edited with care, unique to your moment</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[28px] bg-white/80 p-6 border border-white/70">
                      <div className="mini-kicker mb-3">What that means</div>
                      <ul className="space-y-2">
                        <li className="flex gap-2 text-xs text-slate-700">
                          <span className="text-blue-600 flex-shrink-0">✓</span>
                          <span>Built from your story, not a template</span>
                        </li>
                        <li className="flex gap-2 text-xs text-slate-700">
                          <span className="text-blue-600 flex-shrink-0">✓</span>
                          <span>Design decisions made for your moment</span>
                        </li>
                        <li className="flex gap-2 text-xs text-slate-700">
                          <span className="text-blue-600 flex-shrink-0">✓</span>
                          <span>Feels thoughtful, not mass-produced</span>
                        </li>
                        <li className="flex gap-2 text-xs text-slate-700">
                          <span className="text-blue-600 flex-shrink-0">✓</span>
                          <span>Shows you put real thought in</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Section 3: Trust (why it's safe & personal) */}
      <section className="promise-section">
        <div className="container">
          <div className="promise-header">
            <h2 className="h2">Built for trust and ownership</h2>
            <p className="lead max-w-[60ch] mx-auto mt-3">
              Your memories are yours alone. Private by default. No logins, no tracking, no surprises.
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
                    <CardDescription className="promise-card-description">{description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: What you share + What happens (combined clarity) */}
      <section className="section">
        <div className="container grid gap-6 lg:grid-cols-2">
          <Card className="overflow-hidden border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(233,243,255,0.9))] shadow-[0_28px_80px_rgba(87,120,170,0.12)]">
            <CardContent className="space-y-6 p-8 lg:p-10">
              <div className="space-y-3">
                <Badge className="w-fit accent-chip" variant="secondary">What to share</Badge>
                <CardTitle className="text-[clamp(1.6rem,3vw,2.4rem)] max-w-[12ch]">
                  Just the essentials.
                </CardTitle>
                <p className="text-slate-700 text-base leading-relaxed">
                  Photos. Names. How you feel about this person. That's the whole brief. We don't need novels.
                </p>
              </div>

              <div className="rounded-[28px] bg-white/80 p-7 space-y-5">
                <div className="space-y-5">
                  <div className="flex gap-4 items-start">
                    <div className="text-2xl font-light text-slate-400 flex-shrink-0 w-6 text-center">→</div>
                    <div>
                      <p className="font-semibold text-slate-900 mb-1">One or two photos (PNG or JPG)</p>
                      <p className="text-sm text-slate-600">Any size, any quality. Photos that feel right to you. That's it.</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="text-2xl font-light text-slate-400 flex-shrink-0 w-6 text-center">→</div>
                    <div>
                      <p className="font-semibold text-slate-900 mb-1">Their name and your email</p>
                      <p className="text-sm text-slate-600">So we know who the gift is for and where to send your private link.</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="text-2xl font-light text-slate-400 flex-shrink-0 w-6 text-center">→</div>
                    <div>
                      <p className="font-semibold text-slate-900 mb-1">A sentence or two about the feeling</p>
                      <p className="text-sm text-slate-600">A memory. A inside joke. What makes this person special to you. Even one sentence shapes the whole gift.</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-5 mt-5">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong>No writing skills needed.</strong> No long descriptions required. We listen for feeling, not perfection. What you share emotionally is what shapes the gift.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/80 bg-white/74 shadow-[0_24px_64px_rgba(86,117,166,0.08)]">
            <CardHeader>
              <Badge className="w-fit accent-chip">The final gift</Badge>
              <CardTitle className="text-[clamp(1.6rem,3vw,2.4rem)] max-w-[12ch]">
                Ready to celebrate.
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="rounded-[24px] bg-blue-50/70 p-5">
                <div className="mini-kicker">What you get</div>
                <p className="mb-0 mt-3 text-sm leading-6 text-slate-700">
                  A premium digital story, beautifully designed and personalized. Delivered to your private link.
                </p>
              </div>
              <div className="rounded-[24px] bg-white/80 p-5">
                <div className="mini-kicker">Your access</div>
                <p className="mb-0 mt-3 text-sm leading-6 text-slate-700">
                  Private status page. No account needed. Download when ready. Share the joy immediately.
                </p>
              </div>
              <div className="rounded-[28px] bg-slate-950 px-6 py-7 text-white flex items-start gap-4">
                <Sparkles className="mt-0.5 size-5 text-blue-300 flex-shrink-0" />
                <p className="mb-0 text-sm leading-6 text-slate-200">
                  Everything designed for one birthday. One gift. One moment that matters.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing & FAQ Section */}
      <section className="section">
        <div className="container grid gap-6 lg:grid-cols-2">
          <Card className="border-white/80 bg-white/74 shadow-[0_24px_70px_rgba(86,117,166,0.08)]">
            <CardHeader>
              <Badge className="w-fit accent-chip" variant="secondary">Pricing</Badge>
              <CardTitle className="text-[clamp(1.6rem,3vw,2.4rem)] max-w-[12ch]">
                Fair, honest pricing.
              </CardTitle>
              <CardDescription className="text-sm mt-2">
                One price for a complete, beautiful gift. No surprises.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-[28px] bg-gradient-to-br from-slate-950 via-blue-950 to-blue-900 p-8 text-white shadow-[0_28px_60px_rgba(15,23,42,0.2)]">
                <div className="text-xs uppercase tracking-[0.2em] text-blue-200 font-semibold">
                  Handcrafted story
                </div>
                <div className="mt-4 flex items-end gap-2">
                  <span className="font-display text-6xl leading-none font-light">
                    299
                  </span>
                  <span className="text-xs uppercase tracking-[0.18em] text-slate-300 pb-1">
                    Starting
                  </span>
                </div>
                <p className="mb-0 mt-6 max-w-[38ch] text-sm leading-7 text-slate-200">
                  One-time cost. No subscriptions. No recurring charges. A complete gift experience.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/80 bg-white/74 shadow-[0_24px_70px_rgba(86,117,166,0.08)]">
            <CardHeader>
              <Badge className="w-fit accent-chip">FAQ</Badge>
              <CardTitle className="text-[clamp(1.6rem,3vw,2.4rem)]">Questions answered.</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item) => (
                  <AccordionItem key={item.question} value={item.question}>
                    <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-slate-600 leading-relaxed">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Final CTA Section - Decision moment */}
      <section className="section pt-0">
        <div className="container">
          <Card className="border-white/80 bg-gradient-to-br from-slate-950 via-blue-950 to-blue-900 text-white shadow-[0_32px_96px_rgba(15,23,42,0.16)]">
            <CardContent className="flex flex-col gap-8 p-8 lg:flex-row lg:items-center lg:justify-between lg:p-10">
              <div className="space-y-4 flex-1">
                <h2 className="font-display text-[clamp(2rem,4vw,3rem)] leading-tight">
                  Create their gift today.
                </h2>
                <p className="max-w-[48ch] text-base leading-7 text-slate-300">
                  Photos, a memory, and your email. That&apos;s all it takes. The birthday is coming. Make it meaningful.
                </p>
              </div>

              <Button asChild size="lg" className="bg-white text-slate-950 hover:bg-slate-100 px-8 h-12 flex-shrink-0">
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
