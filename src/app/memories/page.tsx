import Link from 'next/link';
import { CheckCircle2, CreditCard, Image as ImageIcon, LockKeyhole, Sparkles } from 'lucide-react';
import { MemoriesIntakeForm } from '@/components/MemoriesIntakeForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { isMemoriesOrderingAvailable } from '@/lib/memories/public-flow';

const formSignals = [
  'Ein bis zwei Bilder als PNG oder JPG',
  'Eine E-Mail fuer Checkout und Lieferung',
  'Ein kurzer emotionaler Hinweis statt langer Regieanweisung',
];

const railCards = [
  {
    icon: ImageIcon,
    title: 'Briefing',
    copy: 'Nur die Inputs, die fuer eine persoenliche Story wirklich nuetzlich sind.',
  },
  {
    icon: CreditCard,
    title: 'Checkout',
    copy: 'Der Auftrag wird sofort gesichert, statt dich erst durch weitere Screens zu schicken.',
  },
  {
    icon: LockKeyhole,
    title: 'Status',
    copy: 'Dieselbe private Spur bleibt spaeter fuer Fortschritt und Zustellung erreichbar.',
  },
];

export default function MemoriesPage() {
  const orderingAvailable = isMemoriesOrderingAvailable();

  return (
    <main className="section page-shell">
      <div className="container space-y-8">
        <Card className="overflow-hidden border-white/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(232,244,255,0.9))]">
          <CardContent className="grid gap-8 p-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:p-8">
            <div className="space-y-5">
              <Badge className="w-fit">order brief</Badge>
              <div className="space-y-4">
                <h1 className="h2 max-w-[13ch]">A short brief, so the gift still feels high-effort.</h1>
                <p className="lead max-w-[58ch]">
                  This page is intentionally lighter than a classic product configurator. The redesign keeps it premium through hierarchy, spacing, and service-like framing instead of extra fields.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {formSignals.map((item) => (
                  <div
                    className="rounded-[24px] border border-white/90 bg-white/82 px-4 py-4 text-sm leading-6 text-slate-700 shadow-[0_16px_36px_rgba(148,163,184,0.12)]"
                    key={item}
                  >
                    <CheckCircle2 className="mb-3 size-4 text-sky-700" />
                    {item}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <a href={orderingAvailable ? '#intake-form' : '#ordering-status'}>
                    {orderingAvailable ? 'Jump to the brief' : 'Read ordering status'}
                  </a>
                </Button>
                <Button asChild variant="secondary">
                  <Link href={orderingAvailable ? '/status' : '/how-it-works'}>
                    {orderingAvailable ? 'Open existing order' : 'See the flow'}
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              <Card className="border-sky-200/70 bg-white/84">
                <CardHeader>
                  <Badge className="w-fit" variant="secondary">premium but fast</Badge>
                  <CardTitle>The page should feel expensive, not exhausting.</CardTitle>
                  <CardDescription>
                    Mostly white, soft blue emphasis, fewer visual decisions, and clearer progression.
                  </CardDescription>
                </CardHeader>
              </Card>

              {railCards.map(({ icon: Icon, title, copy }) => (
                <Card key={title} className="border-white/90 bg-white/82">
                  <CardContent className="flex gap-4 p-5">
                    <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <h3 className="mt-1 text-2xl">{title}</h3>
                      <p className="copy mb-0 mt-2">{copy}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div id={orderingAvailable ? 'intake-form' : 'ordering-status'}>
            <MemoriesIntakeForm orderingAvailable={orderingAvailable} />
          </div>

          <div className="space-y-4">
            <Card className="border-white/90 bg-white/82">
              <CardHeader>
                <Badge className="w-fit" variant="secondary">what changes after submit</Badge>
                <CardTitle>One order. One status path. No extra account logic.</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-[24px] border border-sky-100 bg-sky-50/70 p-4">
                  <div className="mini-kicker">after the brief</div>
                  <p className="mb-0 text-sm leading-7 text-slate-700">
                    The order is created immediately and then handed off to checkout.
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/90 bg-white p-4">
                  <div className="mini-kicker">if checkout breaks</div>
                  <p className="mb-0 text-sm leading-7 text-slate-700">
                    The saved order can still be reopened from the private status page.
                  </p>
                </div>
                <Separator className="bg-sky-100/90" />
                <p className="mb-0 text-sm leading-7 text-slate-600">
                  This is the core conversion tradeoff: fewer knobs, more confidence.
                </p>
              </CardContent>
            </Card>

            <Card className="border-white/90 bg-[linear-gradient(180deg,rgba(20,32,52,0.96),rgba(19,78,138,0.94))] text-white">
              <CardContent className="space-y-4 p-6">
                <Badge className="w-fit border-white/15 bg-white/10 text-white" variant="dark">operator note</Badge>
                <h3 className="text-[2rem] leading-[1.04]">The UI stays simple on purpose.</h3>
                <p className="mb-0 text-sm leading-7 text-slate-200">
                  The redesign improves polish and trust, but it does not invent new backend states or extra customer-side workflow.
                </p>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-slate-100">
                  <Sparkles className="size-4 text-sky-300" />
                  aligned to the current birthday flow
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
