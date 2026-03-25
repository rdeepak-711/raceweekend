import type { Metadata } from 'next';
import { SITE_URL, BASE_OG } from '@/lib/constants/site';
import { notFound } from 'next/navigation';
import { getRaceBySlug, getRaceContent } from '@/services/race.service';
import GuideAccordion from '@/components/race/GuideAccordion';
import Image from 'next/image';
import RaceSubNav from '@/components/race/RaceSubNav';
import PageBreadcrumb from '@/components/race/PageBreadcrumb';
import { getThemeFromRace } from '@/lib/constants/raceThemes';
import { getRaceImagePaths } from '@/lib/utils/raceImages';

interface Props { params: Promise<{ raceSlug: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { raceSlug } = await params;
  const race = await getRaceBySlug(raceSlug, 'motogp');
  if (!race) return {};
  const content = await getRaceContent(race.id);
  const { ogImageUrl } = getRaceImagePaths(raceSlug);
  const hasTransportContent = Boolean(
    content?.gettingThere ||
    content?.gettingThereIntro ||
    (content?.transportOptions && content.transportOptions.length > 0)
  );

  return {
    title: `Getting to ${race.city} for the ${race.name}`,
    description: `Flights, transport and transfers to ${race.circuitName} for the ${race.name}.`,
    alternates: { canonical: `${SITE_URL}/motogp/${raceSlug}/getting-there` },
    openGraph: { ...BASE_OG,title: `Getting to ${race.city} for the ${race.name}`,
      description: `Flights, transport and transfers to ${race.circuitName} for the ${race.name}.`,
      images: ogImageUrl ? [{ url: ogImageUrl, width: 1200, height: 630, alt: `${race.city} — ${race.name}` }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      images: ogImageUrl ? [ogImageUrl] : [],
    },
    ...(hasTransportContent ? {} : { robots: { index: false, follow: true } }),
  };
}

const TRANSPORT_FAQ_KEYWORDS = ['get to', 'airport', 'transport', 'train', 'taxi', 'uber', 'drive', 'bus', 'metro', 'travel to'];

const buildBreadcrumbLd = (race: { name: string; slug: string }) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'MotoGP', item: `${SITE_URL}/motogp` },
    { '@type': 'ListItem', position: 3, name: race.name, item: `${SITE_URL}/motogp/${race.slug}` },
    { '@type': 'ListItem', position: 4, name: 'Getting There', item: `${SITE_URL}/motogp/${race.slug}/getting-there` },
  ],
});

export default async function MotoGPGettingTherePage({ params }: Props) {
  const { raceSlug } = await params;
  const race = await getRaceBySlug(raceSlug, 'motogp');
  if (!race) notFound();
  const schemaDate = `${race.raceDate}T00:00:00.000Z`;
  const content = await getRaceContent(race.id);
  const theme = getThemeFromRace(race);
  const { circuitExists, circuitUrl } = getRaceImagePaths(raceSlug);

  const faqItems = (content?.faqItems ?? []).filter(item =>
    TRANSPORT_FAQ_KEYWORDS.some(kw => item.question.toLowerCase().includes(kw) || item.answer.toLowerCase().includes(kw))
  );

  const faqLd = faqItems.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  } : null;

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `Getting to ${race.city} for the ${race.name}`,
    description: `Flights, transport and transfers to ${race.circuitName} for the ${race.name}.`,
    author: { '@type': 'Person', name: 'Deepak' },
    publisher: { '@type': 'Organization', name: 'Race Weekend' },
    dateModified: schemaDate,
    url: `${SITE_URL}/motogp/${raceSlug}/getting-there`,
  };

  const schemas = [buildBreadcrumbLd(race), articleLd, ...(faqLd ? [faqLd] : [])];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />

      <div className="min-h-screen pt-20 pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          <PageBreadcrumb crumbs={[
            { label: 'Home', href: '/' },
            { label: 'MotoGP', href: '/motogp' },
            { label: race.name, href: `/motogp/${raceSlug}` },
            { label: 'Getting There' },
          ]} />
          <RaceSubNav raceSlug={raceSlug} series="motogp" current="getting-there" />

          <div className="py-8">
            {/* Circuit Image */}
            {circuitExists && (
              <div className="relative rounded-xl mb-6 shadow-lg border border-white/5 bg-[var(--bg-secondary)] flex items-center justify-center p-4">
                <Image src={circuitUrl} alt={`${race.circuitName} circuit layout`} width={800} height={450} className="w-full max-h-56 object-contain opacity-80" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-transparent opacity-30 pointer-events-none" />
              </div>
            )}

            <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: theme.accent }}>
              ✈️ MotoGP · {race.city}
            </p>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-white uppercase mb-2">
              Getting to {race.city}
            </h1>
            <p className="text-[var(--text-secondary)]">{race.name} · {race.raceDate}</p>
          </div>

          <div className="space-y-10">
            {/* Map Link */}
            {race.circuitLat && race.circuitLng && (
              <a
                href={`https://maps.google.com/?q=${race.circuitLat},${race.circuitLng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[var(--accent-teal)] transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  📍
                </div>
                <div>
                  <p className="font-bold text-white text-lg">{race.circuitName}</p>
                  <p className="text-sm text-[var(--accent-teal)] font-medium">Open in Google Maps →</p>
                </div>
              </a>
            )}

            {/* Intro */}
            {content?.gettingThereIntro && (
              <p className="text-[var(--text-secondary)] leading-relaxed text-base">
                {content.gettingThereIntro}
              </p>
            )}

            {/* Transport options */}
            {content?.transportOptions && content.transportOptions.length > 0 ? (
              <section>
                <h2 className="font-display font-bold text-xl text-white mb-4">Transport Options</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {content.transportOptions.map((opt, i) => (
                    <div key={i} className="p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[var(--accent-teal)] transition-colors">
                      <div className="text-4xl mb-3">{opt.icon}</div>
                      <p className="font-display font-bold text-white mb-1">{opt.title}</p>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{opt.desc}</p>
                    </div>
                  ))}
                </div>
              </section>
            ) : content?.gettingThere ? (
              <section>
                <h2 className="font-display font-bold text-xl text-white mb-4">Getting There</h2>
                <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{content.gettingThere}</p>
              </section>
            ) : (
              <p className="text-[var(--text-secondary)]">Transport guide coming soon.</p>
            )}

            {/* FAQ Accordion */}
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
