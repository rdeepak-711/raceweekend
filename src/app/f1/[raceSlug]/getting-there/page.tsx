import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { existsSync } from 'fs';
import { join } from 'path';
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
    title: `Getting to ${race.city} for the ${race.name} | Race Weekend`,
    description: `Flights, transport and transfers to ${race.circuitName} for the ${race.name}.`,
    alternates: { canonical: `https://raceweekend.co/f1/${raceSlug}/getting-there` },
    openGraph: {
      title: `Getting to ${race.city} for the ${race.name} | Race Weekend`,
      description: `Flights, transport and transfers to ${race.circuitName} for the ${race.name}.`,
      images: ogImageUrl ? [{ url: ogImageUrl, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      images: ogImageUrl ? [ogImageUrl] : [],
    },
  };
}

export default async function F1GettingTherePage({ params }: Props) {
  const { raceSlug } = await params;
  const race = await getRaceBySlug(raceSlug, 'f1');
  if (!race) notFound();
  const content = await getRaceContent(race.id);
  const theme = getThemeFromRace(race);
  const { circuitExists, circuitUrl } = getRaceImagePaths(raceSlug);

  const TRANSPORT_FAQ_KEYWORDS = ['get to', 'airport', 'transport', 'train', 'taxi', 'uber', 'drive', 'bus', 'metro', 'travel to'];
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

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://raceweekend.co/' },
      { '@type': 'ListItem', position: 2, name: 'F1', item: 'https://raceweekend.co/f1' },
      { '@type': 'ListItem', position: 3, name: race.name, item: `https://raceweekend.co/f1/${raceSlug}` },
      { '@type': 'ListItem', position: 4, name: 'Getting There', item: `https://raceweekend.co/f1/${raceSlug}/getting-there` },
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
            { label: 'Getting There' },
          ]} />
          <RaceSubNav raceSlug={raceSlug} series="f1" current="getting-there" />

          {/* Circuit Image */}
          {circuitExists && (
            <div className="relative rounded-2xl mb-6 overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border-subtle)] shadow-2xl flex items-center justify-center p-4 sm:p-8">
              <img
                src={circuitUrl}
                alt={`${race.circuitName} layout`}
                className="w-full max-h-72 object-contain"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--bg-primary)] opacity-40 pointer-events-none" />
            </div>
          )}

          <div className="py-4">
            <div className="flex items-center gap-3 mb-2">
              <SeriesBadge series="f1" />
              <span className="text-sm text-[var(--text-secondary)]">{race.city}</span>
            </div>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-white uppercase-heading mb-2">
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

            {/* Transport options — structured cards */}
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

            {/* FAQ */}
            {faqItems.length > 0 && (
              <section>
                <h2 className="font-display font-bold text-xl text-white mb-4">FAQ</h2>
                <GuideAccordion items={faqItems} accentColor={theme.accent} />
              </section>
            )}

            {/* CTA */}
            <div className="pt-4 border-t border-[var(--border-subtle)]">
              <Link
                href={`/f1/${raceSlug}/experiences`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-lg"
                style={{ backgroundColor: theme.accent }}
              >
                Browse Experiences →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
