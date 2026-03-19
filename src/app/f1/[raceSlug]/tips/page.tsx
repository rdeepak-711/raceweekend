import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getRaceBySlug, getRaceContent } from '@/services/race.service';
import SeriesBadge from '@/components/race/SeriesBadge';
import GuideAccordion from '@/components/race/GuideAccordion';
import RaceSubNav from '@/components/race/RaceSubNav';
import PageBreadcrumb from '@/components/race/PageBreadcrumb';
import { getThemeFromRace } from '@/lib/constants/raceThemes';
import { getRaceImagePaths } from '@/lib/utils/raceImages';

interface Props { params: Promise<{ raceSlug: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { raceSlug } = await params;
  const race = await getRaceBySlug(raceSlug, 'f1');
  if (!race) return {};
  const { ogImageUrl } = getRaceImagePaths(raceSlug);

  return {
    title: `${race.city} Race Weekend Tips — ${race.name} | Race Weekend`,
    description: `Essential tips for attending the ${race.name}. What to bring, circuit facts, and local advice.`,
    alternates: { canonical: `https://raceweekend.app/f1/${raceSlug}/tips` },
    openGraph: {
      title: `${race.city} Race Weekend Tips — ${race.name} | Race Weekend`,
      description: `Essential tips for attending the ${race.name}. What to bring, circuit facts, and local advice.`,
      images: ogImageUrl ? [{ url: ogImageUrl, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      images: ogImageUrl ? [ogImageUrl] : [],
    },
  };
}

const UNIVERSAL_TIPS = [
  { heading: 'Book early', body: 'Hotels near circuits sell out months in advance. Book as soon as your plans are confirmed.' },
  { heading: 'Bring ear protection', body: 'F1 cars produce 140dB+. Bring earplugs or quality ear defenders, especially with kids.' },
  { heading: 'Arrive early', body: 'Traffic near circuits is heavy on race day. Allow 90+ minutes extra to reach your seat.' },
  { heading: 'Check the weather', body: 'Race weekends can be 3 days of varying conditions. Layer up and pack a rain poncho.' },
  { heading: 'Explore the paddock area', body: 'Many circuits offer pit lane walks and team merchandise areas free with your race ticket.' },
  { heading: 'Use public transport', body: 'Most circuits have dedicated race day shuttle buses from the city centre.' },
];

export default async function F1TipsPage({ params }: Props) {
  const { raceSlug } = await params;
  const race = await getRaceBySlug(raceSlug, 'f1');
  if (!race) notFound();
  const content = await getRaceContent(race.id);
  const theme = getThemeFromRace(race);

  const faqItems = content?.faqItems ?? [];
  const circuitFacts = content?.circuitFacts as Record<string, string> | null;
  const travelTips = content?.travelTips && content.travelTips.length > 0 ? content.travelTips : UNIVERSAL_TIPS;

  const faqLd = faqItems.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  } : null;

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://raceweekend.app/' },
      { '@type': 'ListItem', position: 2, name: 'F1', item: 'https://raceweekend.app/f1' },
      { '@type': 'ListItem', position: 3, name: race.name, item: `https://raceweekend.app/f1/${raceSlug}` },
      { '@type': 'ListItem', position: 4, name: 'Tips', item: `https://raceweekend.app/f1/${raceSlug}/tips` },
    ],
  };

  const schemas = [breadcrumbLd, ...(faqLd ? [faqLd] : [])];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />

      <div className="min-h-screen pt-24 pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          <PageBreadcrumb crumbs={[
            { label: 'Home', href: '/' },
            { label: 'F1', href: '/f1' },
            { label: race.name, href: `/f1/${raceSlug}` },
            { label: 'Tips' },
          ]} />
          <RaceSubNav raceSlug={raceSlug} series="f1" current="tips" />

          <div className="py-8">
            <div className="flex items-center gap-3 mb-2">
              <SeriesBadge series="f1" />
              <span className="text-sm text-[var(--text-secondary)]">{race.city}</span>
            </div>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-white uppercase-heading mb-2">
              {race.city} Race Weekend Tips
            </h1>
            <p className="text-[var(--text-secondary)]">{race.name} · {race.raceDate}</p>
          </div>

          <div className="space-y-10">
            {/* Tips cards */}
            <section>
              <h2 className="font-display font-bold text-xl text-white mb-4">Essential Tips</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {travelTips.map((tip, i) => {
                  const heading = typeof tip === 'string' ? `Tip #${i + 1}` : tip.heading;
                  const body = typeof tip === 'string' ? tip : tip.body;
                  return (
                    <div key={i} className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] transition-colors shadow-sm">
                      <p className="font-black text-white mb-2 uppercase tracking-tight" style={{ color: i < 3 ? theme.accent : 'white' }}>{heading}</p>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{body}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Circuit facts */}
            {circuitFacts && Object.keys(circuitFacts).length > 0 && (
              <section>
                <h2 className="font-display font-bold text-xl text-white mb-4">Circuit Facts</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(circuitFacts).map(([key, val]) => (
                    <div key={key} className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                      <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">{key}</p>
                      <p className="font-mono text-sm text-white font-medium">{val}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* FAQ */}
            {faqItems.length > 0 && (
              <section>
                <h2 className="font-display font-bold text-xl text-white mb-4">FAQ</h2>
                <GuideAccordion items={faqItems} accentColor={theme.accent} />
              </section>
            )}

            {/* CTA */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-[var(--border-subtle)]">
              <Link
                href={`/f1/${raceSlug}/experiences`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-lg"
                style={{ backgroundColor: theme.accent }}
              >
                Browse Experiences →
              </Link>
              <Link
                href={`/itinerary`}
                className="inline-flex items-center gap-2 px-6 py-3 border border-[var(--border-subtle)] text-white font-bold rounded-xl hover:border-[var(--accent-teal)] transition-all"
              >
                Build Itinerary
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
