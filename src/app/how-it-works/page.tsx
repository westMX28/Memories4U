import Link from 'next/link';
import { ArrowRight, CreditCard, Image as ImageIcon, MailCheck, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const steps = [
  {
    step: '01',
    icon: ImageIcon,
    title: 'Upload the memory anchors',
    copy: 'Bring one or two images that already carry the feeling you want the gift to keep.',
  },
  {
    step: '02',
    icon: ShieldCheck,
    title: 'Add one sharp emotional cue',
    copy: 'A short moment, tone, or relationship cue does more than a long instruction block.',
  },
  {
    step: '03',
    icon: CreditCard,
    title: 'Secure the order in checkout',
    copy: 'The brief is saved first so the order remains recoverable even if payment needs a second try.',
  },
  {
    step: '04',
    icon: MailCheck,
    title: 'Return through the private status path',
    copy: 'Progress, final asset availability, and delivery updates stay tied to the same job.',
  },
];

export default function HowItWorksPage() {
  return (
    <main className="section page-shell">
      <div className="container space-y-8">
        <Card className="overflow-hidden border-white/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(234,244,255,0.9))]">
          <CardContent className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:p-8">
            <div className="space-y-4">
              <Badge className="w-fit">flow overview</Badge>
              <h1 className="h2 max-w-[13ch]">Four steps, with very little room for confusion.</h1>
              <p className="lead max-w-[56ch]">
                This is not a showroom route. It exists to lower hesitation, explain the order logic, and support conversion with cleaner expectation-setting.
              </p>
            </div>
            <Card className="border-white/90 bg-white/84">
              <CardHeader>
                <Badge className="w-fit" variant="secondary">why this matters</Badge>
                <CardTitle>The buyer should understand the system in one glance.</CardTitle>
                <CardDescription>
                  Clear hierarchy and fewer words reduce drop-off better than decorative complexity.
                </CardDescription>
              </CardHeader>
            </Card>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {steps.map(({ step, icon: Icon, title, copy }) => (
            <Card key={step} className="border-white/90 bg-white/82">
              <CardContent className="grid gap-4 p-5 sm:grid-cols-[96px_minmax(0,1fr)] sm:p-6">
                <div className="flex items-center gap-3 sm:block">
                  <div className="inline-flex size-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--accent),var(--accent-strong))] text-base font-semibold text-white">
                    {step}
                  </div>
                  <span className="mt-3 inline-flex size-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 sm:flex">
                    <Icon className="size-5" />
                  </span>
                </div>
                <div>
                  <h3 className="mt-1 text-[2rem] leading-[1.04]">{title}</h3>
                  <p className="copy mb-0 mt-3">{copy}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-white/90 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(20,83,145,0.94))] text-white">
          <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between lg:p-8">
            <div>
              <Badge className="w-fit border-white/15 bg-white/10 text-white" variant="dark">conversion support</Badge>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,2.8rem)] leading-[1.02]">
                If the occasion is already close, the product flow should not add stress.
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/memories">
                  Start the brief
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/status">Open status</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
