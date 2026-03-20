import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { marked } from 'marked';
import { getRaceBySlug, getRaceContent } from '@/services/race.service';
import SeriesBadge from '@/components/race/SeriesBadge';
import GuideAccordion from '@/components/race/GuideAccordion';
import RaceSubNav from '@/components/race/RaceSubNav';
import { getThemeFromRace } from '@/lib/constants/raceThemes';
import { getNeighborhoodIcon } from '@/lib/constants/icons';
import PageBreadcrumb from '@/components/race/PageBreadcrumb';
import { getRaceImagePaths } from '@/lib/utils/raceImages';

interface Props { params: Promise<{ raceSlug: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { raceSlug } = await params;
  const race = await getRaceBySlug(raceSlug, 'f1');
  if (!race) return {};
  const { ogImageUrl } = getRaceImagePaths(raceSlug);
  const title = `Where to Stay for the ${race.name} — Hotels & Neighborhoods | Race Weekend`;
  const description = `Best areas to stay near ${race.circuitName} for race weekend. Neighborhoods, prices and booking tips.`;
  return {
    title,
    description,
    alternates: { canonical: `https://raceweekend.co/f1/${raceSlug}/where-to-stay` },
    openGraph: {
      title,
      description,
      images: ogImageUrl ? [{ url: ogImageUrl, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: 'summary_large_image' as const,
      images: ogImageUrl ? [ogImageUrl] : [],
    },
  };
}

const STAY_KEYWORDS = ['hotel', 'stay', 'accommodation', 'book', 'hostel', 'airbnb', 'neighborhood'];

function parseSections(html: string): { heading: string; body: string }[] {
  const sections: { heading: string; body: string }[] = [];
  const regex = /<h[23][^>]*>(.*?)<\/h[23]>([\s\S]*?)(?=<h[23]|$)/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    sections.push({ heading: match[1].replace(/<[^>]+>/g, ''), body: match[2].trim() });
  }
  return sections;
}

export default async function F1WhereToStayPage({ params }: Props) {
  const { raceSlug } = await params;
  const race = await getRaceBySlug(raceSlug, 'f1');
  if (!race) notFound();
  const content = await getRaceContent(race.id);
  const theme = getThemeFromRace(race);

  const whereToStayHtml = content?.whereToStay
    ? (marked.parse(content.whereToStay) as string)
    : null;

  const sections = whereToStayHtml ? parseSections(whereToStayHtml) : [];

  // Intro text = everything before first heading
  const introMatch = whereToStayHtml?.match(/^([\s\S]*?)(?=<h[23])/i);
  const introHtml = introMatch?.[1]?.trim() ?? null;

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

  const STAY_FAQ_KEYWORDS = ['hotel', 'stay', 'accommodation', 'book', 'hostel', 'airbnb', 'neighborhood', 'where to stay', 'area'];
  const faqItems = (content?.faqItems ?? []).filter(item => {
    const q = item?.question?.toLowerCase() || '';
    const a = item?.answer?.toLowerCase() || '';
    return STAY_FAQ_KEYWORDS.some(kw => q.includes(kw) || a.includes(kw));
  });

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://raceweekend.co/' },
      { '@type': 'ListItem', position: 2, name: 'F1', item: 'https://raceweekend.co/f1' },
      { '@type': 'ListItem', position: 3, name: race.name, item: `https://raceweekend.co/f1/${raceSlug}` },
      { '@type': 'ListItem', position: 4, name: 'Where to Stay', item: `https://raceweekend.co/f1/${raceSlug}/where-to-stay` },
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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd ? [breadcrumbLd, faqLd] : breadcrumbLd) }} />

      <div className="min-h-screen pt-24 pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          <PageBreadcrumb crumbs={[
            { label: 'Home', href: '/' },
            { label: 'F1', href: '/f1' },
            { label: race.name, href: `/f1/${raceSlug}` },
            { label: 'Where to Stay' },
          ]} />
          <RaceSubNav raceSlug={raceSlug} series="f1" current="where-to-stay" />

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <SeriesBadge series="f1" />
              <span className="text-sm text-[var(--text-secondary)]">{race.city}</span>
            </div>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-white uppercase mb-1">
              Where to Stay in {race.city}
            </h1>
            <p className="text-[var(--text-secondary)]">{race.name} · {race.raceDate}</p>
          </div>

          <div className="space-y-10">
            {/* Intro blurb */}
            {introHtml ? (
              <div
                className="text-[var(--text-secondary)] leading-relaxed [&_p]:mb-2 [&_strong]:text-white [&_strong]:font-semibold text-sm"
                dangerouslySetInnerHTML={{ __html: introHtml }}
              />
            ) : (
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Race weekends sell out fast. Here&apos;s where to stay near {race.circuitName} — from party-central neighbourhoods to quieter spots with easy transport links.
              </p>
            )}

            {/* Neighbourhood cards */}
            {sections.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sections.map((sec, i) => (
                  <div
                    key={i}
                    className="rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] overflow-hidden"
                  >
                    <div
                      className="flex items-center gap-3 px-5 py-3.5 border-b border-[var(--border-subtle)]"
                      style={{ borderLeftWidth: '3px', borderLeftStyle: 'solid', borderLeftColor: theme.accent }}
                    >
                      <span className="text-xl">{getNeighborhoodIcon(sec.heading)}</span>
                      <h2 className="font-display font-black text-sm uppercase tracking-widest text-white">{sec.heading}</h2>
                    </div>
                    <div
                      className="px-5 py-4 text-sm text-[var(--text-secondary)] leading-relaxed
                        [&_p]:mb-2 [&_p:last-child]:mb-0
                        [&_strong]:text-white [&_strong]:font-semibold
                        [&_em]:italic [&_em]:text-[var(--text-tertiary)]
                        [&_ul]:space-y-1 [&_ul]:mb-2 [&_li]:leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: sec.body }}
                    />
                  </div>
                ))}
              </div>
            ) : whereToStayHtml ? (
              <div
                className="text-sm text-[var(--text-secondary)] leading-relaxed [&_p]:mb-3 [&_strong]:text-white [&_strong]:font-semibold"
                dangerouslySetInnerHTML={{ __html: whereToStayHtml }}
              />
            ) : (
              <p className="text-[var(--text-secondary)]">Accommodation guide coming soon.</p>
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

            {/* CTA */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-[var(--border-subtle)]">
              <Link
                href={`/f1/${raceSlug}/getting-there`}
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-[var(--border-subtle)] text-white font-bold rounded-lg hover:border-[var(--accent-teal)] transition-colors"
              >
                ✈️ Getting There
              </Link>
              <Link
                href={`/f1/${raceSlug}/experiences`}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
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
