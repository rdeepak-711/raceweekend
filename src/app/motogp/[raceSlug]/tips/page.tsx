import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getRaceBySlug, getRaceContent } from '@/services/race.service';
import GuideAccordion from '@/components/race/GuideAccordion';
import RaceSubNav from '@/components/race/RaceSubNav';
import PageBreadcrumb from '@/components/race/PageBreadcrumb';
import { getThemeFromRace } from '@/lib/constants/raceThemes';
import { getRaceImagePaths } from '@/lib/utils/raceImages';
import { headers } from 'next/headers';

interface Props { params: Promise<{ raceSlug: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { raceSlug } = await params;
  const race = await getRaceBySlug(raceSlug, 'motogp');
  if (!race) return {};
  const { ogImageUrl } = getRaceImagePaths(raceSlug);

  return {
    title: `${race.city} Race Weekend Tips — ${race.name} | Race Weekend`,
    description: `Essential tips for attending the ${race.name}. What to bring, circuit facts, and local advice.`,
    alternates: { canonical: `https://raceweekend.app/motogp/${raceSlug}/tips` },
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
  { heading: 'Bring ear protection', body: 'MotoGP bikes are extremely loud. Bring earplugs or quality ear defenders, especially with kids.' },
  { heading: 'Arrive early', body: 'Traffic near circuits is heavy on race day. Allow 90+ minutes extra to reach your seat.' },
  { heading: 'Check the weather', body: 'Race weekends can be 3 days of varying conditions. Layer up and pack a rain poncho.' },
  { heading: 'Explore the paddock area', body: 'Many circuits offer pit lane walks and team merchandise areas free with your race ticket.' },
  { heading: 'Use public transport', body: 'Most circuits have dedicated race day shuttle buses from the city centre.' },
];

export default async function MotoGPTipsPage({ params }: Props) {
  await headers();
  const { raceSlug } = await params;
  const race = await getRaceBySlug(raceSlug, 'motogp');
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
      { '@type': 'ListItem', position: 2, name: 'MotoGP', item: 'https://raceweekend.app/motogp' },
      { '@type': 'ListItem', position: 3, name: race.name, item: `https://raceweekend.app/motogp/${raceSlug}` },
      { '@type': 'ListItem', position: 4, name: 'Tips', item: `https://raceweekend.app/motogp/${raceSlug}/tips` },
    ],
  };

  const schemas = [breadcrumbLd, ...(faqLd ? [faqLd] : [])];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />

      <div className="min-h-screen pt-20 pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          <PageBreadcrumb crumbs={[
            { label: 'Home', href: '/' },
            { label: 'MotoGP', href: '/motogp' },
            { label: race.name, href: `/motogp/${raceSlug}` },
            { label: 'Tips' },
          ]} />
          <RaceSubNav raceSlug={raceSlug} series="motogp" current="tips" />

          <div className="py-8">
            <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: theme.accent }}>
              💡 MotoGP · {race.city}
            </p>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-white uppercase mb-2">
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

            {/* FAQ accordion */}
            {faqItems.length > 0 && (
              <section>
                <h2 className="font-display font-bold text-xl text-white mb-4">FAQ</h2>
                <GuideAccordion items={faqItems} accentColor={theme.accent} />
              </section>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
