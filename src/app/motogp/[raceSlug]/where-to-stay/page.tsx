import type { Metadata } from 'next';
import { SITE_URL, BASE_OG } from '@/lib/constants/site';
import { notFound } from 'next/navigation';
import { getRaceBySlug, getRaceContent } from '@/services/race.service';
import GuideAccordion from '@/components/race/GuideAccordion';
import RaceSubNav from '@/components/race/RaceSubNav';
import PageBreadcrumb from '@/components/race/PageBreadcrumb';
import { getThemeFromRace } from '@/lib/constants/raceThemes';
import { getNeighborhoodIcon } from '@/lib/constants/icons';
import { getRaceImagePaths } from '@/lib/utils/raceImages';
import { parseMarkdown } from '@/lib/utils/markdown';

interface Props { params: Promise<{ raceSlug: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { raceSlug } = await params;
  const race = await getRaceBySlug(raceSlug, 'motogp');
  if (!race) return {};
  const content = await getRaceContent(race.id);
  const { ogImageUrl } = getRaceImagePaths(raceSlug);
  const hasStayContent = Boolean(
    content?.whereToStay ||
    (content?.travelTips && content.travelTips.length > 0)
  );
  return {
    title: `${race.city} ${race.name} 2026: Best Hotels & Accommodation`,
    description: `Best areas to stay near ${race.circuitName} for race weekend. Neighborhoods, prices and booking tips.`,
    alternates: { canonical: `${SITE_URL}/motogp/${raceSlug}/where-to-stay` },
    openGraph: { ...BASE_OG,title: `${race.city} ${race.name} 2026: Best Hotels & Accommodation`,
      description: `Best areas to stay near ${race.circuitName} for race weekend. Neighborhoods, prices and booking tips.`,
      images: ogImageUrl ? [{ url: ogImageUrl, width: 1200, height: 630, alt: `${race.city} — ${race.name}` }] : [],
    },
    twitter: {
      card: 'summary_large_image' as const,
      images: ogImageUrl ? [ogImageUrl] : [],
    },
    ...(hasStayContent ? {} : { robots: { index: false, follow: true } }),
  };
}

const STAY_KEYWORDS = ['hotel', 'stay', 'accommodation', 'book', 'hostel', 'airbnb', 'neighborhood'];
const STAY_FAQ_KEYWORDS = ['hotel', 'stay', 'accommodation', 'book', 'hostel', 'airbnb', 'neighborhood', 'where to stay', 'area'];

function parseSections(html: string): { heading: string; body: string }[] {
  const sections: { heading: string; body: string }[] = [];
  const regex = /<h[23][^>]*>(.*?)<\/h[23]>([\s\S]*?)(?=<h[23]|$)/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const heading = match[1].replace(/<[^>]+>/g, '').trim();
    const body = match[2].trim();
    if (heading && body) sections.push({ heading, body });
  }
  return sections;
}

export default async function MotoGPWhereToStayPage({ params }: Props) {
  const { raceSlug } = await params;
  const race = await getRaceBySlug(raceSlug, 'motogp');
  if (!race) notFound();
  const content = await getRaceContent(race.id);
  const theme = getThemeFromRace(race);

  const whereToStayHtml = content?.whereToStay
    ? parseMarkdown(content.whereToStay)
    : null;

  const neighborhoods = whereToStayHtml ? parseSections(whereToStayHtml) : [];

  const introMatch = whereToStayHtml?.match(/^([\s\S]*?)(?=<h[23])/i);
  const introHtml = introMatch ? introMatch[1].trim() : null;

  // Normalize tips to {heading, body} objects
  const normalizedTips = (content?.travelTips ?? []).map(tip => {
    if (typeof tip === 'string') return { heading: 'General Tip', body: tip };
    return { heading: tip.heading || 'General Tip', body: tip.body || '' };
  });

  const relevantTips = normalizedTips.filter(tip => {
    const heading = tip.heading.toLowerCase();
    const body = tip.body.toLowerCase();
    return STAY_KEYWORDS.some(kw => heading.includes(kw) || body.includes(kw));
  });
  
  const displayTips = relevantTips.length > 0 ? relevantTips : normalizedTips.slice(0, 3);

  const faqItems = (content?.faqItems ?? []).filter(item => {
    const q = item?.question?.toLowerCase() || '';
    const a = item?.answer?.toLowerCase() || '';
    return STAY_FAQ_KEYWORDS.some(kw => q.includes(kw) || a.includes(kw));
  });

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'MotoGP', item: `${SITE_URL}/motogp` },
      { '@type': 'ListItem', position: 3, name: race.name, item: `${SITE_URL}/motogp/${raceSlug}` },
      { '@type': 'ListItem', position: 4, name: 'Where to Stay', item: `${SITE_URL}/motogp/${raceSlug}/where-to-stay` },
    ],
  };

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
    headline: `${race.city} ${race.name} 2026: Best Hotels & Accommodation`,
    description: `Best areas to stay near ${race.circuitName} for race weekend. Neighborhoods, prices and booking tips.`,
    author: { '@type': 'Person', name: 'Deepak' },
    publisher: { '@type': 'Organization', name: 'Race Weekend' },
    dateModified: new Date().toISOString(),
    url: `${SITE_URL}/motogp/${raceSlug}/where-to-stay`,
  };

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbLd, articleLd, ...(faqLd ? [faqLd] : [])]) }} />
    <div className="min-h-screen pt-20 pb-24 px-4">
      <div className="max-w-4xl mx-auto">
        <PageBreadcrumb crumbs={[
          { label: 'Home', href: '/' },
          { label: 'MotoGP', href: '/motogp' },
          { label: race.name, href: `/motogp/${raceSlug}` },
          { label: 'Where to Stay' },
        ]} />
        <RaceSubNav raceSlug={raceSlug} series="motogp" current="where-to-stay" />

        <div className="py-8">
          <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: theme.accent }}>
            🏨 MotoGP · {race.city}
          </p>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-white uppercase mb-2">
            Where to Stay in {race.city}
          </h1>
          <p className="text-[var(--text-secondary)]">{race.name} · {race.raceDate}</p>
        </div>

        <div className="space-y-10">
          {/* Intro */}
          {introHtml ? (
            <div
              className="text-[var(--text-secondary)] leading-relaxed [&_p]:mb-3 [&_p:last-child]:mb-0"
              dangerouslySetInnerHTML={{ __html: introHtml }}
            />
          ) : (
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Race weekends sell out fast. Here&apos;s where to stay near {race.circuitName} — from party-central neighbourhoods to quieter spots with easy transport links.
            </p>
          )}

          {/* Neighbourhood cards */}
          {neighborhoods.length > 0 && (
            <section>
              <h2 className="font-display font-bold text-xl text-white mb-4">Neighbourhoods</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {neighborhoods.map((nb, i) => (
                  <div key={i} className="rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] overflow-hidden">
                    <div
                      className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border-subtle)]"
                      style={{ borderLeftWidth: '3px', borderLeftStyle: 'solid', borderLeftColor: theme.accent }}
                    >
                      <span className="text-xl">{getNeighborhoodIcon(nb.heading)}</span>
                      <h3 className="font-display font-black text-sm uppercase tracking-widest text-white">{nb.heading}</h3>
                    </div>
                    <div
                      className="px-5 py-4 text-sm text-[var(--text-secondary)] leading-relaxed [&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:text-white [&_ul]:space-y-1 [&_li]:flex [&_li]:gap-2"
                      dangerouslySetInnerHTML={{ __html: nb.body }}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Fallback prose if no sections parsed */}
          {neighborhoods.length === 0 && whereToStayHtml && (
            <section
              className="prose prose-invert prose-sm max-w-none [&_h2]:font-display [&_h2]:font-bold [&_h2]:text-white [&_h3]:font-display [&_h3]:font-bold [&_h3]:text-white [&_p]:text-[var(--text-secondary)] [&_li]:text-[var(--text-secondary)] [&_strong]:text-white"
              dangerouslySetInnerHTML={{ __html: whereToStayHtml }}
            />
          )}

          {/* Booking Tips */}
          {displayTips.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-[var(--accent-teal)]/10 border border-[var(--accent-teal)]/20 flex items-center justify-center text-lg">💡</div>
                <h2 className="font-display font-black text-2xl text-white uppercase italic tracking-tight">Booking Strategy</h2>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {displayTips.map((tip, i) => (
                  <div key={i} className="p-6 rounded-3xl bg-black border border-white/10 relative overflow-hidden group hover:border-[var(--accent-teal)]/30 transition-all">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent-teal)]/20 group-hover:bg-[var(--accent-teal)] transition-colors" />
                    <h3 className="font-display font-bold text-white uppercase tracking-tight mb-2 text-lg">{tip.heading}</h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed uppercase font-mono tracking-tight">{tip.body}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
