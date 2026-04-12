import Link from 'next/link';
import { ArrowRight, CreditCard, Image as ImageIcon, MailCheck, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const steps = [
  {
    step: '01',
    icon: ImageIcon,
    title: 'Lade die Erinnerungsanker hoch',
    copy: 'Bring ein oder zwei Bilder mit, die das Gefühl schon in sich tragen, das das Geschenk bewahren soll.',
  },
  {
    step: '02',
    icon: ShieldCheck,
    title: 'Gib einen klaren emotionalen Hinweis',
    copy: 'Ein kurzer Moment, eine Stimmung oder ein Beziehungsdetail hilft mehr als ein langer Anweisungsblock.',
  },
  {
    step: '03',
    icon: CreditCard,
    title: 'Sichere den Auftrag im Checkout',
    copy: 'Das Briefing wird zuerst gespeichert, damit der Auftrag erreichbar bleibt, auch wenn die Zahlung einen zweiten Anlauf braucht.',
  },
  {
    step: '04',
    icon: MailCheck,
    title: 'Kehre über die private Statusspur zurück',
    copy: 'Fortschritt, Asset-Verfügbarkeit und Zustellungs-Updates bleiben mit demselben Auftrag verbunden.',
  },
];

export default function HowItWorksPage() {
  return (
    <main className="section page-shell">
      <div className="container space-y-8">
        <Card className="overflow-hidden border-white/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(234,244,255,0.9))]">
          <CardContent className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:p-8">
            <div className="space-y-4">
              <Badge className="w-fit accent-chip">Ablauf im Überblick</Badge>
              <h1 className="h2 max-w-[14ch]">Vier Schritte, mit möglichst wenig Raum für Unsicherheit.</h1>
              <p className="lead max-w-[56ch]">
                Diese Seite ist keine Schauvitrine. Sie senkt Zögern, erklärt die Logik des Auftrags und unterstützt die Entscheidung mit klarer Erwartung statt mit mehr Oberfläche.
              </p>
            </div>
            <Card className="border-white/90 bg-white/84">
              <CardHeader>
                <Badge className="w-fit accent-chip" variant="secondary">darum ist das wichtig</Badge>
                <CardTitle>Die schenkende Person sollte das System auf einen Blick verstehen.</CardTitle>
                <CardDescription>
                  Klare Hierarchie und weniger Worte senken Abbrüche besser als dekorative Komplexität.
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
              <Badge className="w-fit border-white/15 bg-white/10 text-white" variant="dark">weniger Druck im Ablauf</Badge>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,2.8rem)] leading-[1.02]">
                Wenn der Anlass schon nah ist, darf der Produktfluss keinen zusätzlichen Stress machen.
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/memories">
                  Briefing starten
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/status">Status öffnen</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
