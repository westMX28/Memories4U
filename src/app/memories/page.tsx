import Link from 'next/link';
import { CheckCircle2, CreditCard, Image as ImageIcon, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react';
import { MemoriesIntakeForm } from '@/components/MemoriesIntakeForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { isMemoriesOrderingAvailable } from '@/lib/memories/public-flow';

const formSignals = [
  'Ein starkes Bild reicht als Start',
  'Eine E-Mail hält Checkout und Zustellung zusammen',
  'Ein kurzer Erinnerungsmoment ist genug',
];

const railCards = [
  {
    icon: ImageIcon,
    title: 'Briefing',
    copy: 'Nur die Angaben, die für eine persönliche Story wirklich nützlich sind.',
  },
  {
    icon: CreditCard,
    title: 'Checkout',
    copy: 'Der Auftrag wird sofort gesichert, statt dich erst durch weitere Screens zu schicken.',
  },
  {
    icon: LockKeyhole,
    title: 'Status',
    copy: 'Dieselbe private Spur bleibt später für Fortschritt und Zustellung erreichbar.',
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
              <Badge className="w-fit accent-chip">Schritt 1 · Auftrags-Briefing</Badge>
              <div className="space-y-4">
                <h1 className="h2 max-w-[14ch]">Der erste ruhige Schritt für ein Geschenk, das nicht nach Last-Minute aussieht.</h1>
                <p className="lead max-w-[58ch]">
                  Diese Seite bleibt bewusst schmal. Ein gutes Bild, eine klare Stimmung und deine E-Mail reichen, damit der Auftrag hochwertig startet und derselbe private Rückweg erhalten bleibt.
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

              <div className="rounded-[28px] border border-sky-100 bg-white/84 p-5 shadow-[0_18px_40px_rgba(148,163,184,0.12)]">
                <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(240px,0.9fr)] sm:items-center">
                  <div>
                    <div className="mini-kicker">warum diese Seite so klein bleibt</div>
                    <p className="mb-0 mt-3 text-sm leading-7 text-slate-700">
                      Der Ablauf soll sich eher wie ein hochwertiger Servicestart anfühlen als wie ein Konfigurator. Du musst noch nicht alles wissen, um den Auftrag sicher anzulegen.
                    </p>
                  </div>
                  <div className="rounded-[24px] border border-sky-100 bg-sky-50/75 p-4">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="mt-0.5 size-4 shrink-0 text-sky-700" />
                      <p className="mb-0 text-sm leading-7 text-slate-700">
                        Wenn der Checkout später unterbrochen wird, bleibt derselbe private Statuspfad der Rückweg. Keine zweite Kundenstrecke, kein Konto.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <a href={orderingAvailable ? '#intake-form' : '#ordering-status'}>
                    {orderingAvailable ? 'Zum Briefing springen' : 'Bestellstatus lesen'}
                  </a>
                </Button>
                <Button asChild variant="secondary">
                  <Link href={orderingAvailable ? '/status' : '/how-it-works'}>
                    {orderingAvailable ? 'Bestehenden Auftrag öffnen' : 'Ablauf ansehen'}
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              <Card className="border-sky-200/70 bg-white/84">
                <CardHeader>
                  <Badge className="w-fit accent-chip" variant="secondary">kleiner Input, klare Richtung</Badge>
                  <CardTitle>Ein starkes Bild und ein kurzer Ton reichen für den Anfang.</CardTitle>
                  <CardDescription>
                    Diese Fläche soll Unsicherheit senken, nicht zusätzliche Entscheidungen erzeugen. Erst sichern, dann in Ruhe über dieselbe Statusspur zurückkehren.
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
                <Badge className="w-fit accent-chip" variant="secondary">was nach dem Absenden passiert</Badge>
                <CardTitle>Ein Auftrag. Eine Statusspur. Keine zusätzliche Account-Logik.</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-[24px] border border-sky-100 bg-sky-50/70 p-4">
                  <div className="mini-kicker">nach dem Briefing</div>
                  <p className="mb-0 text-sm leading-7 text-slate-700">
                    Der Auftrag wird sofort angelegt und danach in den Checkout übergeben.
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/90 bg-white p-4">
                  <div className="mini-kicker">wenn der Checkout abbricht</div>
                  <p className="mb-0 text-sm leading-7 text-slate-700">
                    Der gespeicherte Auftrag lässt sich trotzdem über die private Statusseite wieder öffnen.
                  </p>
                </div>
                <Separator className="bg-sky-100/90" />
                <p className="mb-0 text-sm leading-7 text-slate-600">
                  Das ist der zentrale Conversion-Kompromiss: weniger Stellschrauben, mehr Sicherheit.
                </p>
              </CardContent>
            </Card>

            <Card className="border-white/90 bg-[linear-gradient(180deg,rgba(20,32,52,0.96),rgba(19,78,138,0.94))] text-white">
              <CardContent className="space-y-4 p-6">
                <Badge className="w-fit border-white/15 bg-white/10 text-white" variant="dark">Hinweis zum Ablauf</Badge>
                <h3 className="text-[2rem] leading-[1.04]">Die Oberfläche bleibt bewusst einfach.</h3>
                <p className="mb-0 text-sm leading-7 text-slate-200">
                  Das Redesign verbessert Schliff und Vertrauen, erfindet aber keine neuen Backend-Zustände oder zusätzliche Kundenschritte.
                </p>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-slate-100">
                  <Sparkles className="size-4 text-sky-300" />
                  abgestimmt auf den aktuellen Geburtstags-Flow
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
