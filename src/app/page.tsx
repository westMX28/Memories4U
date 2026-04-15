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
    title: 'Completely private',
    description: 'No account required. Your order and memories stay with you through a private link.',
  },
  {
    icon: WandSparkles,
    title: 'Emotionally crafted',
    description: 'Each gift is carefully created around the feelings and moments you share.',
  },
  {
    icon: Gift,
    title: 'Beautifully delivered',
    description: 'A handcrafted digital story presented with the intention it deserves.',
  },
];

const processSteps = [
  {
    step: '01',
    title: 'Share your moment',
    description: 'One or two photos, the recipient\'s name, and a short memory or feeling. That\'s all.',
  },
  {
    step: '02',
    title: 'Secure and continue',
    description: 'Clear pricing upfront. Quick, simple checkout. No surprises, no hidden fees.',
  },
  {
    step: '03',
    title: 'Follow your order',
    description: 'A private link stays with you. Track progress anytime, return as needed. Always yours.',
  },
];

const faqItems = [
  {
    question: 'What exactly do I need to start?',
    answer:
      'Just one or two photos of the person, their name, your email, and a brief note about a memory or the feeling you want the gift to capture. That\'s genuinely enough for us to create something meaningful.',
  },
  {
    question: 'Can I come back to finish later?',
    answer:
      'Yes. Your order is stored and linked to your email. If checkout is interrupted, you\'ll receive a link to continue exactly where you left off—no need to start over.',
  },
  {
    question: 'What\'s included in the price?',
    answer:
      'Everything. The handcrafted story, the design, the digital delivery, and your private status page for tracking. Starting at $299. No recurring charges, no surprises.',
  },
  {
    question: 'Is this actually AI-generated?',
    answer:
      'It uses AI as a tool, but it\'s shaped by your input and intention. The result is a thoughtful, personalized piece that feels human because it\'s built around what you share and how you feel about this person.',
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
                    Turn a memory into a gift.
                  </h1>
                  <p className="text-lg leading-relaxed text-slate-700 max-w-[52ch]">
                    Upload your favorite photos. Share what they mean to you. We craft a personalized,
                    handmade story that celebrates this person on their birthday. Premium. Private. Done.
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
                <p className="text-xs uppercase tracking-widest font-semibold text-blue-700">Why choose us</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { label: 'No account needed', desc: 'Private link, permanent access' },
                    { label: 'Truly personalized', desc: 'Shaped by your words, your photos' },
                    { label: 'Handcrafted', desc: 'Not generic, not templated' },
                    { label: 'Transparent pricing', desc: 'See cost before you decide' }
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
                    <p className="text-xs uppercase tracking-widest font-semibold text-blue-400 mb-2">The result</p>
                    <h2 className="text-2xl font-display leading-tight text-white mb-3">
                      A celebration of the moments that matter.
                    </h2>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      A premium digital gift shaped around your photos and memories. Ready to download and celebrate.
                    </p>
                  </div>

                  <div className="rounded-[20px] bg-white/10 border border-white/20 p-4 backdrop-blur-sm">
                    <div className="text-xs uppercase tracking-widest text-blue-200 font-semibold mb-2">Simple process</div>
                    <ul className="space-y-2 text-sm text-slate-200">
                      <li className="flex gap-2">
                        <span className="text-blue-400 flex-shrink-0">→</span>
                        <span>Upload 1-2 photos & brief memory</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-blue-400 flex-shrink-0">→</span>
                        <span>See price, checkout, get link</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-blue-400 flex-shrink-0">→</span>
                        <span>Download when ready, share the joy</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust & Values Section */}
      <section className="promise-section">
        <div className="container">
          <div className="promise-header">
            <h2 className="h2">Why choose Memories4U</h2>
            <p className="lead max-w-[60ch] mx-auto mt-3">
              A gift service designed around what birthdays actually need: thoughtfulness, privacy, and beauty.
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

      {/* Process Section */}
      <section className="workflow-section">
        <div className="container">
          <div className="workflow-header">
            <div className="workflow-header-content">
              <Badge className="w-fit accent-chip" variant="secondary">Simple process</Badge>
              <h2 className="h2 max-w-[12ch]">
                Three thoughtful steps.
              </h2>
              <p className="lead max-w-[50ch]">
                From memory to finished gift, we keep everything simple and intentional.
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

      {/* Editorial Section */}
      <section className="section">
        <div className="container grid gap-6 lg:grid-cols-2">
          <Card className="overflow-hidden border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(233,243,255,0.9))] shadow-[0_28px_80px_rgba(87,120,170,0.12)]">
            <CardContent className="space-y-6 p-8 lg:p-10">
              <div className="space-y-3">
                <Badge className="w-fit accent-chip" variant="secondary">Design & experience</Badge>
                <CardTitle className="text-[clamp(1.6rem,3vw,2.4rem)] max-w-[12ch]">
                  Premium and intentional.
                </CardTitle>
              </div>

              <div className="rounded-[32px] bg-white/85 p-7 space-y-4">
                <div className="rounded-[28px] bg-gradient-to-br from-slate-50 to-blue-50 p-6">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 mb-4">
                    The gift experience
                  </div>
                  <p className="font-display text-2xl leading-tight text-slate-900">
                    &quot;A celebration of this person told through moments that matter to you.&quot;
                  </p>
                </div>
                
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[24px] bg-blue-50/80 p-5">
                    <div className="mini-kicker">Tone</div>
                    <p className="mb-0 mt-3 text-sm leading-6 text-slate-700">
                      Warm, editorial, and genuinely personal—never corporate or generic.
                    </p>
                  </div>
                  <div className="rounded-[24px] bg-white p-5">
                    <div className="mini-kicker">Journey</div>
                    <p className="mb-0 mt-3 text-sm leading-6 text-slate-700">
                      Minimal friction, maximum intention. From first click to final delivery.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/80 bg-white/74 shadow-[0_24px_64px_rgba(86,117,166,0.08)]">
            <CardHeader>
              <Badge className="w-fit accent-chip">Transparency</Badge>
              <CardTitle className="text-[clamp(1.6rem,3vw,2.4rem)] max-w-[12ch]">
                Clear from start to finish.
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="rounded-[26px] bg-blue-50/75 p-5">
                <div className="mini-kicker">What you get</div>
                <p className="mb-0 mt-3 text-sm leading-6 text-slate-700">
                  One handcrafted story, beautiful presentation, digital delivery, and a private status link forever.
                </p>
              </div>
              <div className="rounded-[26px] bg-white p-5">
                <div className="mini-kicker">What you won&apos;t</div>
                <p className="mb-0 mt-3 text-sm leading-6 text-slate-700">
                  No previews to approve, no account required, no ongoing costs, no data collection.
                </p>
              </div>
              <div className="rounded-[30px] bg-slate-950 px-6 py-7 text-white flex items-start gap-4">
                <Mail className="mt-0.5 size-5 text-blue-300 flex-shrink-0" />
                <p className="mb-0 text-sm leading-6 text-slate-200">
                  We speak like a service, not software. Clear, warm, and human.
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
              <div className="rounded-[34px] bg-gradient-to-br from-slate-950 via-blue-950 to-blue-900 p-8 text-white shadow-[0_28px_60px_rgba(15,23,42,0.2)]">
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

      {/* Final CTA Section */}
      <section className="section pt-0">
        <div className="container">
          <Card className="border-white/80 bg-gradient-to-br from-slate-950 via-blue-950 to-blue-900 text-white shadow-[0_32px_96px_rgba(15,23,42,0.16)]">
            <CardContent className="flex flex-col gap-6 p-8 lg:flex-row lg:items-center lg:justify-between lg:p-10">
              <div className="space-y-3 flex-1">
                <Badge className="w-fit border-white/20 bg-white/10 text-white" variant="dark">
                  Ready to create
                </Badge>
                <h2 className="font-display text-[clamp(1.8rem,3vw,2.8rem)] leading-tight">
                  Transform a memory into a gift.
                </h2>
                <p className="max-w-[45ch] text-sm leading-7 text-slate-300">
                  Start now. It takes just a few minutes to share what matters and begin the process.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 flex-shrink-0">
                <Button asChild size="lg" className="bg-white text-slate-950 hover:bg-slate-100">
                  <Link href={orderingAvailable ? '/memories' : '/status'}>
                    {orderingAvailable ? 'Begin now' : 'Check order'}
                    <Sparkles className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className="border-white/20 text-white hover:bg-white/10">
                  <Link href="/how-it-works">See the process</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
