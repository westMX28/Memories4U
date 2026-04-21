import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CircleCheckBig, Quote, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  approvedExamples,
  examplesEditorialGroups,
  leadHomepageExample,
} from '@/lib/memories/examples';
import { isMemoriesOrderingAvailable } from '@/lib/memories/public-flow';

const proofNotes = [
  'Exactly six product-approved birthday examples appear here.',
  'Grouping follows emotional range, not a browse-heavy gallery pattern.',
  'Relationship language stays broad wherever the visual read is broader than the prompt family.',
];

export default function ExamplesPage() {
  const orderingAvailable = isMemoriesOrderingAvailable();

  return (
    <main className="page-shell pb-16">
      <section className="section">
        <div className="container grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start">
          <div className="space-y-6">
            <Badge className="w-fit accent-chip">Selected birthday examples</Badge>
            <div className="space-y-4">
              <h1 className="h1 max-w-[11ch]">A curated proof library, not a catalog.</h1>
              <p className="lead max-w-[58ch]">
                These are the current product-cleared birthday examples. The set is deliberately
                selective, but now broad enough to show romantic, social, reunion, and memory-led
                emotional range.
              </p>
            </div>

            <div className="grid gap-3">
              {proofNotes.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-[24px] bg-white/78 px-4 py-4 text-sm leading-7 text-slate-700 shadow-[0_16px_40px_rgba(66,94,138,0.08)]"
                >
                  <CircleCheckBig className="mt-1 size-4 text-sky-700" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href={orderingAvailable ? '/memories' : '/status'}>
                  {orderingAvailable ? 'Start a birthday story' : 'Open private status'}
                  <Sparkles />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/how-it-works">
                  Review the flow
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(228,240,255,0.92))] shadow-[0_32px_100px_rgba(79,109,158,0.14)]">
            <CardContent className="grid gap-6 p-6 sm:p-8">
              <div className="space-y-3">
                <Badge className="w-fit accent-chip" variant="secondary">
                  Lead homepage proof
                </Badge>
                <CardTitle className="max-w-[12ch] text-[clamp(2rem,4vw,3rem)]">
                  The homepage still anchors on one dominant birthday image.
                </CardTitle>
                <CardDescription className="max-w-[46ch] text-base">
                  {leadHomepageExample.editorialLead} The rest of this page expands the range
                  calmly, without pretending there is an open preview gallery.
                </CardDescription>
              </div>

              <div className="overflow-hidden rounded-[28px] bg-white/82 shadow-[0_18px_40px_rgba(85,117,166,0.08)]">
                <div className="relative aspect-[5/4]">
                  <Image
                    src={leadHomepageExample.imagePath}
                    alt="Lead birthday proof example shown on the homepage."
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="grid gap-3 p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className="accent-chip" variant="secondary">
                      Homepage lead
                    </Badge>
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {leadHomepageExample.shortTitle}
                    </span>
                  </div>
                  <p className="mb-0 text-sm leading-7 text-slate-700">
                    {leadHomepageExample.summary}
                  </p>
                </div>
              </div>

              <div className="rounded-[28px] bg-white/82 p-5 shadow-[0_18px_40px_rgba(85,117,166,0.08)]">
                <div className="flex items-start gap-3">
                  <Quote className="mt-1 size-4 text-sky-700" />
                  <p className="mb-0 text-sm leading-7 text-slate-700">
                    Selected birthday-story examples. Chosen for emotional clarity, believable
                    identity preservation, and premium restraint, not for flashy volume.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="section pt-0">
        <div className="container space-y-8">
          {examplesEditorialGroups.map((group) => {
            const examples = approvedExamples.filter(
              (example) => example.editorialGroup === group.title,
            );

            return (
              <Card
                key={group.title}
                className="overflow-hidden border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(239,246,255,0.9))] shadow-[0_24px_64px_rgba(86,117,166,0.08)]"
              >
                <CardHeader className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className="accent-chip" variant="secondary">
                      {group.title}
                    </Badge>
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {examples.length} approved examples
                    </span>
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-[clamp(1.8rem,3vw,2.6rem)]">{group.title}</CardTitle>
                    <CardDescription className="max-w-[54ch] text-base">
                      {group.description}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
                  {examples.map((example) => (
                    <Card
                      key={example.slug}
                      className="overflow-hidden border-white/80 bg-white/88 shadow-[0_18px_40px_rgba(85,117,166,0.08)]"
                    >
                      <div className="relative aspect-[4/3]">
                        <Image
                          src={example.imagePath}
                          alt={`${example.shortTitle} approved birthday story example.`}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <CardHeader className="space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <Badge className="accent-chip" variant="secondary">
                            {example.shortTitle}
                          </Badge>
                          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                            {example.relationshipType}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <CardTitle className="text-[clamp(1.5rem,2.3vw,2rem)]">
                            {example.title}
                          </CardTitle>
                          <CardDescription className="text-base">
                            {example.summary}
                          </CardDescription>
                        </div>
                      </CardHeader>

                      <CardContent className="grid gap-5">
                        <div className="rounded-[22px] bg-sky-50/80 p-4">
                          <div className="mini-kicker">editorial framing</div>
                          <p className="mb-0 mt-3 text-sm leading-7 text-slate-700">
                            {example.editorialLead}
                          </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="rounded-[22px] bg-white p-4">
                            <div className="mini-kicker">scenario family</div>
                            <p className="mb-0 mt-3 text-sm leading-7 text-slate-700">
                              {example.scenarioFamily}
                            </p>
                          </div>
                          <div className="rounded-[22px] bg-slate-950 p-4 text-white">
                            <div className="mini-kicker text-sky-200">emotional angle</div>
                            <p className="mb-0 mt-3 text-sm leading-7 text-slate-200">
                              {example.emotionalAngle}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-[22px] bg-white p-4">
                          <div className="mini-kicker">why it was cleared</div>
                          <div className="mt-3 grid gap-3">
                            {example.whyItPasses.map((item) => (
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

                        <div className="rounded-[22px] border border-sky-100/80 bg-[linear-gradient(180deg,rgba(248,251,255,0.95),rgba(238,245,255,0.95))] p-4">
                          <div className="mini-kicker">curation note</div>
                          <p className="mb-0 mt-3 text-sm leading-7 text-slate-700">
                            {example.curationNote}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </main>
  );
}
