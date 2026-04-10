import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { isMemoriesOrderingAvailable } from '@/lib/memories/public-flow';

const heroSignals = [
  { value: 'fast', label: 'in wenigen Minuten bestellt' },
  { value: 'real', label: 'aus euren echten Fotos gebaut' },
  { value: 'giftable', label: 'direkt digital verschenkbar' },
];

const occasions = [
  {
    title: 'Fuer Partnerinnen, Partner und Lieblingsmenschen',
    copy: 'Wenn der Geburtstag gross wirkt und das Geschenk nicht nach letzter Minute aussehen darf.',
  },
  {
    title: 'Fuer beste Freundinnen, Freunde und Geschwister',
    copy: 'Wenn gemeinsame Bilder schon alles sagen, aber du sie nicht einfach nur schicken willst.',
  },
  {
    title: 'Fuer enge Timings und spontane Einfaelle',
    copy: 'Wenn es schnell gehen muss, aber trotzdem persoenlich und durchdacht wirken soll.',
  },
];

const processSteps = [
  {
    label: '01',
    title: 'Du schickst Bilder und einen Moment',
    copy: 'Ein oder zwei Bilder als PNG oder JPG, eine E-Mail und ein kurzer Satz reichen fuer den Start.',
  },
  {
    label: '02',
    title: 'Wir sichern die Bestellung direkt',
    copy: 'Nach dem Briefing gehst du sofort zur Bezahlung und bekommst eine klare Bestellspur.',
  },
  {
    label: '03',
    title: 'Du verfolgst den Fortschritt ohne Nachfragen',
    copy: 'Status, Bearbeitung und finale Auslieferung bleiben ueber denselben Auftrag erreichbar.',
  },
];

const promiseCards = [
  {
    title: 'Persoenlicher als ein Gutschein',
    copy: 'Die Story startet mit euren Bildern, eurer Dynamik und genau dem Ton, der zu euch passt.',
  },
  {
    title: 'Einfacher als ein klassisches Fotobuch',
    copy: 'Kein Layout-Stress, kein langes Basteln, kein komplizierter Konfigurator vor dem Geschenk.',
  },
  {
    title: 'Schnell genug fuer echte Geburtstagsrealitaet',
    copy: 'Auch wenn der Anlass nah ist, bleibt der Weg vom Einfall bis zum Auftrag angenehm kurz.',
  },
];

const faqItems = [
  {
    question: 'Brauche ich viele Fotos?',
    answer: 'Nein. Ein starkes Bild reicht fuer den Start, ein zweites kann den Moment noch klarer machen.',
  },
  {
    question: 'Kann ich Dateien direkt als png oder jpg hochladen?',
    answer: 'Ja. V1 akzeptiert direkte PNG-, JPG- und JPEG-Dateien. Das erste Bild ist Pflicht, ein zweites ist optional.',
  },
  {
    question: 'Muss ich vorher schon genau wissen, wie die Story aussehen soll?',
    answer: 'Nein. Beschreibe lieber das Gefuehl, den Anlass oder einen gemeinsamen Moment. Genau dafuer ist das Briefing gedacht.',
  },
  {
    question: 'Kann ich spaeter noch einmal nachsehen?',
    answer: 'Ja. Nach dem Auftrag bekommst du einen klaren Statuspfad, ueber den du denselben Auftrag wieder aufrufen kannst.',
  },
];

export default function HomePage() {
  const orderingAvailable = isMemoriesOrderingAvailable();

  return (
    <main>
      <section className="hero hero-home">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.94fr)] lg:items-stretch">
            <div className="grid content-center py-8">
              <Badge className="w-fit">digitale geburtstagsueberraschung</Badge>
              <h1 className="h1">Aus euren Bildern wird ein Geburtstagsgeschenk mit Gefuehl.</h1>
              <p className="lead">
                Memories4U verwandelt Erinnerungen in eine digitale Story, die persoenlich wirkt, schnell bestellt ist und sich sofort weiter verschenken laesst. Fuer den Start reichen ein oder zwei Bilder als direkter Upload.
              </p>
              <div className="mt-6 flex flex-wrap gap-3" aria-label="Produktcharakter">
                {heroSignals.map((item) => (
                  <Badge
                    className="border-white/80 bg-white/82 px-4 py-2 normal-case tracking-normal text-slate-700 shadow-[0_16px_34px_rgba(148,163,184,0.16)]"
                    key={item.value}
                  >
                    {item.label}
                  </Badge>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href={orderingAvailable ? '/memories' : '/status'}>
                    {orderingAvailable ? 'Geburtstags-Story starten' : 'Bestehenden Auftrag ansehen'}
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <Link href={orderingAvailable ? '/how-it-works' : '/memories'}>
                    {orderingAvailable ? 'So funktioniert es' : 'Bestellpause ansehen'}
                  </Link>
                </Button>
              </div>
              <div className="mt-6 max-w-[42ch] rounded-[26px] border border-sky-100 bg-white/70 px-5 py-4 text-[15px] leading-7 text-slate-600 shadow-[0_18px_40px_rgba(148,163,184,0.14)]">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">gedacht fuer</span>
                Wenn du etwas verschenken willst, das naeher wirkt als ein Standardprodukt, aber nicht Tage Vorbereitung braucht.
              </div>
              {!orderingAvailable ? (
                <div className="mt-4 max-w-[44ch] rounded-[26px] border border-amber-200 bg-amber-50/90 px-5 py-4 text-[15px] leading-7 text-amber-950 shadow-[0_18px_40px_rgba(217,119,6,0.12)]">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">bestellstatus</span>
                  Neue Bestellungen sind aktuell pausiert, bis die Bezahlung in dieser Umgebung wieder live ist. Bestehende Auftraege lassen sich weiterhin ueber die Statusseite verfolgen.
                </div>
              ) : null}
              <div className="brand-note mt-6 inline-flex w-fit items-center gap-3 rounded-full border border-white/80 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-[0_12px_30px_rgba(148,163,184,0.14)] backdrop-blur-sm">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-sky-400" aria-hidden="true" />
                Eine ruhige, hochwertige Geschenkstrecke statt ueberladener Konfiguratorlogik.
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[40px] border border-sky-100/80 bg-[linear-gradient(160deg,#0f2744_0%,#3873b8_46%,#8bc5ff_100%)] p-6 shadow-[0_36px_90px_rgba(56,115,184,0.24)] lg:min-h-[560px]">
              <div className="absolute right-[-72px] top-[-42px] h-56 w-56 rounded-full bg-white/16 blur-3xl" />
              <div className="absolute bottom-[-88px] left-[-20px] h-64 w-64 rounded-full bg-sky-200/35 blur-3xl" />

              <Card className="relative z-10 mr-12 border-white/15 bg-white/90 lg:mr-20">
                <CardContent className="p-8">
                  <Badge variant="secondary" className="w-fit border-sky-200 bg-sky-50 text-sky-800">
                    fuer Sara, 31
                  </Badge>
                  <h2 className="mt-5 font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,3rem)] leading-[1.02] text-slate-900">
                    Happy Birthday an den Menschen, mit dem jeder Ort sofort vertraut wird.
                  </h2>
                  <p className="mt-4 max-w-[32ch] text-base leading-7 text-slate-600">
                    Aus Lieblingsbildern, kleinen Beobachtungen und einem Ton, der nach euch klingt.
                  </p>
                </CardContent>
              </Card>

              <Card className="absolute right-6 top-[228px] z-10 w-[240px] border-white/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(223,239,255,0.9))]">
                <CardContent className="grid gap-3 p-6">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">was du schickst</span>
                  <strong>1 bis 2 Bilder als Upload</strong>
                  <strong>1 kurzer Erinnerungsmoment</strong>
                  <strong>1 E-Mail fuer die Zustellung</strong>
                </CardContent>
              </Card>

              <Card className="absolute bottom-7 left-6 z-10 w-[min(300px,calc(100%-48px))] -rotate-2 border-white/20 bg-white/88">
                <CardContent className="p-6">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">was am ende zaehlt</span>
                  <p className="mt-3 text-lg leading-7 text-slate-700">
                    &ldquo;Das fuehlt sich an, als haettest du dir wirklich Gedanken gemacht.&rdquo;
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3" aria-label="Produktmerkmale">
            <Card className="bg-white/72">
              <CardContent className="p-5">
                <span className="mini-kicker">bestellung</span>
                <strong className="block max-w-[18ch] text-xl leading-tight">kurzer Einstieg statt langem Geschenk-Funnel</strong>
              </CardContent>
            </Card>
            <Card className="bg-white/72">
              <CardContent className="p-5">
                <span className="mini-kicker">wirkung</span>
                <strong className="block max-w-[18ch] text-xl leading-tight">emotional, aber nicht kitschig oder generisch</strong>
              </CardContent>
            </Card>
            <Card className="bg-white/72">
              <CardContent className="p-5">
                <span className="mini-kicker">sicherheit</span>
                <strong className="block max-w-[18ch] text-xl leading-tight">Auftrag, Zahlung und Status bleiben sauber nachvollziehbar</strong>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container">
          <div className="section-heading">
            <div className="eyebrow">warum das produkt funktioniert</div>
            <h2 className="h2">Es fuehlt sich nach einem Geschenk an, nicht nach einer Aufgabe.</h2>
          </div>
          <div className="gift-grid">
            {promiseCards.map((item, index) => (
              <Card className={index === 0 ? 'gift-card gift-card-featured' : 'gift-card'} key={item.title}>
                <CardContent className="grid h-full content-between gap-5 p-7">
                  <div className="kicker">{String(index + 1).padStart(2, '0')}</div>
                  <div>
                    <h3>{item.title}</h3>
                    <p className="copy">{item.copy}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Card className="gift-card gift-card-cta">
              <CardContent className="grid h-full content-between gap-5 p-7">
                <div>
                  <span className="mini-kicker">direkter einstieg</span>
                  <h3>Wenn der Geburtstag naeher rueckt, sollte der Start nicht bremsen.</h3>
                </div>
                <Button asChild variant="secondary">
                  <Link href={orderingAvailable ? '/memories' : '/status'}>
                    {orderingAvailable ? 'Jetzt Briefing ausfuellen' : 'Zum Auftragsstatus'}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container product-band">
          <div className="product-band-copy">
            <div className="eyebrow">fuer welche momente</div>
            <h2 className="h2">Gebaut fuer Geburtstage, bei denen Erinnerung wichtiger ist als Materialwert.</h2>
          </div>
          <div className="product-band-grid">
            {occasions.map((item) => (
              <Card className="product-band-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-label="Produktbeweise">
        <div className="container">
          <div className="section-heading">
            <div className="eyebrow">vom gedanken bis zur auslieferung</div>
            <h2 className="h2">Der Weg bleibt klein, damit die Geste gross wirkt.</h2>
            <p className="lead">Keine Kontopflicht, kein komplizierter Editor, kein Suchen nach dem Auftrag nach dem Checkout.</p>
          </div>
          <div className="proof-grid">
            {processSteps.map((item) => (
              <article className="proof-card" key={item.label}>
                <span className="proof-label">{item.label}</span>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div className="eyebrow">haeufige fragen</div>
            <h2 className="h2">Was vor dem ersten Auftrag meist wichtig ist.</h2>
          </div>
          <Accordion type="single" collapsible className="grid gap-4">
            {faqItems.map((item) => (
              <AccordionItem key={item.question} value={item.question}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="section">
        <div className="container cta-band">
          <div>
            <div className="eyebrow">bereit zum starten</div>
            <h2 className="h2">Wenn du schon weisst, fuer wen die Story ist, reicht jetzt ein kurzer Moment zum Loslegen.</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/memories">Auftrag vorbereiten</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/status">Bestehenden Auftrag oeffnen</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
