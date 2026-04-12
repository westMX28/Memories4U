import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Gift,
  Image as ImageIcon,
  LockKeyhole,
  Mail,
  Sparkles,
  TimerReset,
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
import { Separator } from '@/components/ui/separator';
import { isMemoriesOrderingAvailable } from '@/lib/memories/public-flow';

const heroMetrics = [
  { value: '5 min', label: 'vom Gedanken bis zum Auftrag' },
  { value: '1-2', label: 'Bilder für den Einstieg' },
  { value: '1 Link', label: 'für Checkout und Status' },
];

const promiseCards = [
  {
    icon: ImageIcon,
    title: 'Wenige Inputs, bessere Wirkung',
    copy: 'Das Produkt fragt nur nach dem Material, das die Erinnerung wirklich trägt: Bilder, Anlass, Ton und Kontakt.',
  },
  {
    icon: Gift,
    title: 'Ein Geschenk statt eines Projekts',
    copy: 'Die Strecke fühlt sich eher wie Premium-Service an als wie ein langer Konfigurator.',
  },
  {
    icon: LockKeyhole,
    title: 'Private Statusspur statt Support-Pingpong',
    copy: 'Nach dem Checkout bleibt derselbe Auftrag wieder auffindbar, ohne Konto und ohne Umwege.',
  },
];

const flowSteps = [
  {
    step: '01',
    title: 'Du lädst Bilder hoch',
    copy: 'Ein starkes Bild reicht. Ein zweites schafft mehr Kontext, ist aber optional.',
  },
  {
    step: '02',
    title: 'Du beschreibst kurz den Moment',
    copy: 'Kein Roman. Ein Satz zur Stimmung, Beziehung oder Erinnerung ist genug.',
  },
  {
    step: '03',
    title: 'Checkout und Status bleiben verbunden',
    copy: 'Der Auftrag wird gesichert, und später landest du wieder auf derselben privaten Spur.',
  },
];

const faqItems = [
  {
    question: 'Brauche ich viele Fotos?',
    answer: 'Nein. Das Produkt ist bewusst für einen schnellen Einstieg gebaut. Ein gutes Bild reicht für den Start.',
  },
  {
    question: 'Muss ich vorher schon die genaue Story kennen?',
    answer: 'Nein. Du gibst Richtung und Emotion vor. Die eigentliche Ausarbeitung passiert nach dem Briefing.',
  },
  {
    question: 'Wie finde ich den Auftrag später wieder?',
    answer: 'Über deinen privaten Statuspfad. Dort kannst du Fortschritt ansehen oder eine offene Zahlung fortsetzen.',
  },
];

export default function HomePage() {
  const orderingAvailable = isMemoriesOrderingAvailable();

  return (
    <main className="pb-16">
      <section className="hero hero-home">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:items-center">
            <div className="space-y-7">
              <Badge className="w-fit accent-chip">ruhiger Geburtstags-Flow</Badge>
              <div className="space-y-5">
                <h1 className="h1 max-w-[11ch]">Die ruhigste Art, gemeinsame Erinnerungen in ein Geburtstagsgeschenk zu verwandeln.</h1>
                <p className="lead max-w-[54ch]">
                  Memories4U hält die Oberfläche leicht, hochwertig und direkt: ein paar echte Signale hochladen, den Auftrag sichern und denselben privaten Weg bis zur Zustellung wiederfinden.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {heroMetrics.map((item) => (
                  <Card key={item.label} className="border-white/90 bg-white/82">
                    <CardContent className="p-5">
                      <div className="text-2xl font-medium tracking-[-0.03em] text-slate-900">{item.value}</div>
                      <p className="mb-0 mt-2 text-sm leading-6 text-slate-600">{item.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href={orderingAvailable ? '/memories' : '/status'}>
                    {orderingAvailable ? 'Geburtstags-Briefing starten' : 'Auftragsstatus öffnen'}
                    <ArrowRight />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href="/how-it-works">Ablauf ansehen</Link>
                </Button>
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/82 px-4 py-2 shadow-[0_14px_34px_rgba(148,163,184,0.12)] accent-chip">
                  <Sparkles className="size-4 text-sky-700" />
                  hochwertig ohne aufgeblasenen Funnel
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/82 px-4 py-2 shadow-[0_14px_34px_rgba(148,163,184,0.12)]">
                  <TimerReset className="size-4 text-sky-700" />
                  gemacht für echte Last-Minute-Momente
                </span>
              </div>
            </div>

            <Card className="relative overflow-hidden border-white/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(223,239,255,0.92))] p-2 shadow-[0_40px_120px_rgba(100,149,207,0.22)]">
              <div className="absolute inset-x-8 top-0 h-32 rounded-full bg-sky-200/30 blur-3xl" />
              <CardContent className="relative grid gap-6 p-6 sm:p-8">
                <div className="flex items-center justify-between gap-4">
                  <Badge variant="secondary" className="accent-chip">Vorschau auf die Story</Badge>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-800">weiß / eisblau / tiefes Blau</span>
                </div>

                <div className="rounded-[30px] border border-sky-100 bg-[linear-gradient(145deg,#ffffff,#eff7ff)] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                  <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-sky-800">für Sara, 31</p>
                  <h2 className="font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,3rem)] leading-[1.02] text-slate-900">
                    Alles Gute zum Geburtstag an den Menschen, der selbst gewöhnliche Tage bewahrenswert macht.
                  </h2>
                  <p className="mb-0 mt-4 max-w-[34ch] text-base leading-7 text-slate-600">
                    Entsteht aus euren Bildern, einem klaren Erinnerungsmoment und einem Ton, der sich nach euch anfühlt.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Card className="border-white/90 bg-white/82">
                    <CardContent className="p-5">
                      <div className="mini-kicker">was hineingeht</div>
                      <ul className="list mt-3">
                        <li>1 bis 2 Bild-Uploads</li>
                        <li>Empfängername und Zustell-E-Mail</li>
                        <li>ein kurzer, emotional hilfreicher Hinweis</li>
                      </ul>
                    </CardContent>
                  </Card>
                  <Card className="border-sky-200/80 bg-[linear-gradient(180deg,rgba(240,247,255,0.96),rgba(225,239,255,0.9))]">
                    <CardContent className="p-5">
                      <div className="mini-kicker">warum es funktioniert</div>
                      <p className="mb-0 text-sm leading-7 text-slate-700">
                        Die Seite lässt alles weg, was bremst, und behält nur die Signale, die Vertrauen, Klarheit und Tempo aufbauen.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container grid gap-5 lg:grid-cols-3">
          {promiseCards.map(({ icon: Icon, title, copy }) => (
            <Card key={title} className="border-white/90 bg-white/82">
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
          <Card className="overflow-hidden border-white/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(235,245,255,0.88))]">
            <CardContent className="grid gap-8 p-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:p-8">
              <div className="space-y-4">
                <Badge className="w-fit accent-chip" variant="secondary">der Geschenkweg</Badge>
                <h2 className="h2 max-w-[13ch]">Kurz genug, um es jetzt abzuschließen. Wertig genug, um bewusst zu wirken.</h2>
                <p className="lead max-w-[40ch]">
                  Das ist die wirkungsvollste Phase des Redesigns: stärkere Hierarchie, klarere Informationsdichte und sichtbar mehr Vertrauen, ohne neue Komplexität in den Ablauf zu bringen.
                </p>
              </div>

              <div className="grid gap-4">
                {flowSteps.map((item, index) => (
                  <Card key={item.step} className={index === 1 ? 'border-sky-200/80 bg-white/88' : 'border-white/90 bg-white/82'}>
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
        <div className="container grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <Card className="border-white/90 bg-white/82">
            <CardHeader>
              <Badge className="w-fit accent-chip" variant="secondary">Vertrauen und Erwartung</Badge>
              <CardTitle className="max-w-[14ch] text-[clamp(2rem,4vw,3rem)]">Genau dann ruhig, wenn die schenkende Person es eilig hat.</CardTitle>
              <CardDescription className="max-w-[44ch] text-base">
                Das visuelle System bleibt überwiegend hell und nutzt dunkles Blau gezielt, damit das Produkt hochwertig und modern wirkt, ohne kühl oder technisch zu erscheinen.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[26px] border border-sky-100 bg-sky-50/70 p-5">
                  <div className="mini-kicker">vor der Zahlung</div>
                  <p className="mb-0 text-sm leading-7 text-slate-700">Klare Erwartung, direkter Upload und eine einfache emotionale Richtung.</p>
                </div>
                <div className="rounded-[26px] border border-sky-100 bg-white p-5">
                  <div className="mini-kicker">nach der Zahlung</div>
                  <p className="mb-0 text-sm leading-7 text-slate-700">Private Statusspur, weniger Rückfragen und ein sauberer Weg bis zur finalen Zustellung.</p>
                </div>
              </div>
              <Separator className="bg-sky-100/80" />
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm text-white">
                  <CheckCircle2 className="size-4 text-sky-300" />
                  klarere Hierarchie
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm text-white">
                  <CheckCircle2 className="size-4 text-sky-300" />
                  ruhigeres Layout
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm text-white">
                  <CheckCircle2 className="size-4 text-sky-300" />
                  natürlichere Sprache
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/90 bg-white/82">
            <CardHeader>
              <Badge className="w-fit accent-chip">FAQ</Badge>
              <CardTitle>Fragen, die den Checkout nicht aufhalten sollten.</CardTitle>
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
          <Card className="border-white/90 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(22,78,138,0.94))] text-white">
            <CardContent className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between lg:p-8">
              <div className="space-y-2">
                <Badge className="w-fit border-white/15 bg-white/10 text-white" variant="dark">wenn der Anlass schon nah ist</Badge>
                <h2 className="font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,3rem)] leading-[1.02]">
                  Lass das Geschenk aufmerksam wirken, auch wenn der Zeitpunkt knapp ist.
                </h2>
                <p className="max-w-[44ch] text-base leading-7 text-slate-200">
                  Nimm den kürzesten Weg, der sich trotzdem hochwertig anfühlt: Briefing starten, Auftrag sichern und den Rest über die Statusseite begleiten.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href={orderingAvailable ? '/memories' : '/status'}>
                    {orderingAvailable ? 'Jetzt starten' : 'Status öffnen'}
                    <Mail />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href="/how-it-works">4-Schritte-Ablauf ansehen</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
