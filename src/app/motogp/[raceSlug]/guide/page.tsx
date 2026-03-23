import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/constants/site';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getRaceBySlug, getRaceContent } from '@/services/race.service';
import SeriesBadge from '@/components/race/SeriesBadge';
import GuideAccordion from '@/components/race/GuideAccordion';
import GuideNavCards from '@/components/race/GuideNavCards';
import RaceSubNav from '@/components/race/RaceSubNav';
import PageBreadcrumb from '@/components/race/PageBreadcrumb';
import RaceGallery from '@/components/race/RaceGallery';
import { marked } from 'marked';
import { getThemeFromRace } from '@/lib/constants/raceThemes';
import { getSectionIcon, SECTION_ICONS_MOTOGP } from '@/lib/constants/icons';
import { getRaceImagePaths } from '@/lib/utils/raceImages';
import Image from 'next/image';

interface Props { params: Promise<{ raceSlug: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { raceSlug } = await params;
  const race = await getRaceBySlug(raceSlug, 'motogp');
  if (!race) return {};
  const { ogImageUrl } = getRaceImagePaths(raceSlug);

  return {
    title: `${race.city} MotoGP 2026 Travel Guide: Everything You Need`,
    description: `Travel guide for the ${race.name}. Local tips, getting there, where to stay, and what to do in ${race.city}.`,
    alternates: { canonical: `${SITE_URL}/motogp/${raceSlug}/guide` },
    openGraph: {
      title: `${race.city} MotoGP 2026 Travel Guide: Everything You Need`,
      description: `Travel guide for the ${race.name}. Local tips, getting there, where to stay, and what to do in ${race.city}.`,
      images: ogImageUrl ? [{ url: ogImageUrl, width: 1200, height: 630, alt: `${race.city} — ${race.name}` }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      images: ogImageUrl ? [ogImageUrl] : [],
    },
  };
}

function parseCityGuideSections(html: string): { heading: string; body: string }[] {
  const sections: { heading: string; body: string }[] = [];
  const regex = /<h2[^>]*>(.*?)<\/h2>([\s\S]*?)(?=<h2|$)/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    sections.push({ heading: match[1].replace(/<[^>]+>/g, ''), body: match[2].trim() });
  }
  return sections;
}

const SUB_PAGES = [
  { href: 'getting-there', icon: '✈️', label: 'Getting There',  desc: 'Flights, trains & transfers to the circuit' },
  { href: 'where-to-stay', icon: '🏨', label: 'Where to Stay',  desc: 'Best neighbourhoods & booking tips' },
  { href: 'tips',          icon: '💡', label: 'Race Tips',       desc: 'Essential advice for race weekend' },
];

export default async function MotoGPGuidePage({ params }: Props) {
  const { raceSlug } = await params;
  const race = await getRaceBySlug(raceSlug, 'motogp');
  if (!race) notFound();

  const content = await getRaceContent(race.id);
  const theme = getThemeFromRace(race);
  const { heroExists, heroUrl, galleryImages } = getRaceImagePaths(raceSlug);

  const heroTitle    = content?.heroTitle    ?? `${race.city} Travel Guide`;
  const heroSubtitle = content?.heroSubtitle ?? `Everything you need for the ${race.name}`;
  const intro        = content?.whyCityText  ?? content?.guideIntro ?? null;

  const guideSections = content?.cityGuide
    ? parseCityGuideSections(marked.parse(content.cityGuide) as string)
    : [];

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${race.city} MotoGP 2026 Travel Guide: Everything You Need`,
    description: content?.whyCityText ?? content?.guideIntro ?? `Travel guide for the ${race.name}. Local tips, getting there, where to stay, and what to do in ${race.city}.`,
    author: { '@type': 'Person', name: 'Deepak' },
    publisher: { '@type': 'Organization', name: 'Race Weekend' },
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    url: `${SITE_URL}/motogp/${raceSlug}/guide`,
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'MotoGP', item: `${SITE_URL}/motogp` },
      { '@type': 'ListItem', position: 3, name: race.name, item: `${SITE_URL}/motogp/${raceSlug}` },
      { '@type': 'ListItem', position: 4, name: 'Guide', item: `${SITE_URL}/motogp/${raceSlug}/guide` },
    ],
  };

  const faqLd = content?.faqItems && content.faqItems.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: content.faqItems.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  } : null;

  const schemas = [articleLd, breadcrumbLd, ...(faqLd ? [faqLd] : [])];

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
    <div className="min-h-screen pt-24 pb-24 px-4">
      <div className="max-w-5xl mx-auto">
        <PageBreadcrumb crumbs={[
          { label: 'Home', href: '/' },
          { label: 'MotoGP', href: '/motogp' },
          { label: race.name, href: `/motogp/${raceSlug}` },
          { label: 'Guide' },
        ]} />
        <RaceSubNav raceSlug={raceSlug} series="motogp" current="guide" />

        {/* Hero Image */}
        {heroExists && (
          <div className="relative h-52 sm:h-72 overflow-hidden rounded-2xl mb-8 shadow-2xl">
            <Image
              src={heroUrl}
              alt={`${race.city} - ${race.name}`}
              fill
              priority
              unoptimized
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-transparent opacity-70" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center gap-3 mb-1">
                <SeriesBadge series="motogp" />
                <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Round {race.round} · {race.season}</span>
              </div>
              <h1 className="font-display font-black text-3xl sm:text-5xl text-white uppercase tracking-tight">
                {heroTitle}
              </h1>
            </div>
          </div>
        )}

        {/* Header (no hero image fallback) */}
        {!heroExists && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <SeriesBadge series="motogp" />
              <span className="text-sm text-[var(--text-secondary)]">Round {race.round} · {race.season}</span>
            </div>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-white uppercase mb-1">
              {heroTitle}
            </h2>
            <p className="text-[var(--text-secondary)]">{heroSubtitle}</p>
          </div>
        )}

        <div className="space-y-8">

          {/* Pull-quote */}
          {intro && (
            <div className="relative pl-5 py-1" style={{ borderLeft: `3px solid ${theme.accent}` }}>
              <p className="text-base sm:text-lg italic text-white/80 leading-relaxed">
                &ldquo;{intro}&rdquo;
              </p>
            </div>
          )}

          {/* Highlights chips */}
          {content?.highlightsList && content.highlightsList.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {content.highlightsList.map((item, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-secondary)]"
                >
                  <span style={{ color: theme.accent }}>▸</span> {item}
                </span>
              ))}
            </div>
          )}

          {/* City Guide — section cards */}
          {guideSections.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {guideSections.map((sec, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] overflow-hidden"
                >
                  <div
                    className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border-subtle)]"
                    style={{ borderLeftWidth: '3px', borderLeftStyle: 'solid', borderLeftColor: theme.accent }}
                  >
                    <span className="text-xl">{getSectionIcon(sec.heading, SECTION_ICONS_MOTOGP)}</span>
                    <h2 className="font-display font-black text-sm uppercase tracking-widest text-white">
                      {sec.heading}
                    </h2>
                  </div>
                  <div
                    className="px-5 py-4 text-sm text-[var(--text-secondary)] leading-relaxed
                      [&_p]:mb-3 [&_p:last-child]:mb-0
                      [&_strong]:text-white [&_strong]:font-semibold
                      [&_em]:italic [&_em]:text-[var(--text-tertiary)]
                      [&_ul]:space-y-1.5 [&_ul]:mb-3 [&_li]:flex [&_li]:gap-2 [&_li]:items-start
                      [&_h3]:font-bold [&_h3]:text-white [&_h3]:text-sm [&_h3]:mt-4 [&_h3]:mb-1"
                    dangerouslySetInnerHTML={{ __html: sec.body }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Divider */}
          <div className="relative flex items-center gap-4">
            <div className="flex-1 h-px bg-[var(--border-subtle)]" />
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: theme.accent }} />
            <div className="flex-1 h-px bg-[var(--border-subtle)]" />
          </div>

          {/* Navigation cards */}
          <section>
            <h2 className="font-display font-bold text-lg text-white mb-4">Travel Guides</h2>
            <GuideNavCards subPages={SUB_PAGES} raceSlug={raceSlug} accentColor={theme.accent} series="motogp" />
          </section>

          {/* Gallery */}
          <RaceGallery images={galleryImages} city={race.city} />

          {/* FAQ accordion */}
          {content?.faqItems && content.faqItems.length > 0 && (
            <section>
              <div className="relative flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-[var(--border-subtle)]" />
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: theme.accent }} />
                <div className="flex-1 h-px bg-[var(--border-subtle)]" />
              </div>
              <h2 className="font-display font-bold text-xl text-white mb-4">FAQ</h2>
              <GuideAccordion items={content.faqItems} accentColor={theme.accent} />
            </section>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
