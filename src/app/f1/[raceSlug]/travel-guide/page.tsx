import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getRaceBySlug, getRaceContent } from '@/services/race.service';
import { getFeaturedExperiences } from '@/services/experience.service';
import { getThemeFromRace } from '@/lib/constants/raceThemes';
import ExperienceCard from '@/components/experiences/ExperienceCard';
import GuideAccordion from '@/components/race/GuideAccordion';
import RelatedRaces from '@/components/race/RelatedRaces';
import { headers } from 'next/headers';

interface Props { params: Promise<{ raceSlug: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { raceSlug } = await params;
  const race = await getRaceBySlug(raceSlug, 'f1');
  if (!race) return {};
  const content = await getRaceContent(race.id);
  const { ogImageUrl } = getRaceImagePaths(raceSlug);

  const title = `${race.city} F1 2026 Travel Guide — Best Experiences, Hotels & Tips`;
  const description = content?.pageDescription || `The ultimate travel guide for the ${race.name}. Best things to do in ${race.city}, where to stay, and how to get to the circuit.`;

  return {
    title,
    description,
    alternates: { canonical: `https://raceweekend.app/f1/${raceSlug}/travel-guide` },
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

export default async function F1TravelGuidePage({ params }: Props) {
  await headers();
  const { raceSlug } = await params;
  const race = await getRaceBySlug(raceSlug, 'f1');
  if (!race) notFound();

  const [content, featured] = await Promise.all([
    getRaceContent(race.id),
    getFeaturedExperiences(race.id, 3),
  ]);

  const theme = getThemeFromRace(race);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: `${race.city} Formula 1 2026 Travel Guide`,
        description: content?.pageDescription,
        image: `https://raceweekend.app/og/${race.slug}.jpg`,
        author: { '@type': 'Organization', name: 'Race Weekend' },
        publisher: { '@type': 'Organization', name: 'Race Weekend' },
        datePublished: new Date().toISOString(),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://raceweekend.app/' },
          { '@type': 'ListItem', position: 2, name: 'F1', item: 'https://raceweekend.app/f1' },
          { '@type': 'ListItem', position: 3, name: race.name, item: `https://raceweekend.app/f1/${race.slug}` },
          { '@type': 'ListItem', position: 4, name: 'Travel Guide', item: `https://raceweekend.app/f1/${race.slug}/travel-guide` },
        ],
      },
      content?.faqItems ? {
        '@type': 'FAQPage',
        mainEntity: content.faqItems.map(item => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      } : null,
    ].filter(Boolean),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      <div className="min-h-screen bg-[var(--bg-primary)] pt-20 pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <Link
            href={`/f1/${raceSlug}`}
            className="text-sm font-bold hover:text-white transition-colors mb-8 flex items-center gap-2 group"
            style={{ color: theme.accent }}
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Overview
          </Link>

          {/* Hero */}
          <section className="mb-16">
            <p className="text-xs font-black uppercase tracking-[0.2em] mb-3" style={{ color: theme.accent }}>
              Travel Guide
            </p>
            <h1 className="font-display font-black text-4xl md:text-6xl text-white uppercase italic tracking-tighter leading-none mb-6">
              {race.city} <span className="text-[var(--text-tertiary)]">F1 2026</span>
            </h1>
            <p className="text-xl text-[var(--text-secondary)] leading-relaxed font-medium border-l-4 pl-6" style={{ borderColor: theme.accent }}>
              {content?.guideIntro || `Everything you need to know for your ${race.name} race weekend trip.`}
            </p>
          </section>

          {/* Why Visit */}
          {content?.whyCityText && (
            <section className="mb-16">
              <h2 className="font-display font-black text-2xl text-white uppercase italic mb-6">Why Visit {race.city}?</h2>
              <div className="prose prose-invert max-w-none text-[var(--text-secondary)] leading-relaxed">
                {content.whyCityText}
              </div>
            </section>
          )}

          {/* Highlights */}
          {content?.highlightsList && content.highlightsList.length > 0 && (
            <section className="mb-16 bg-[var(--bg-secondary)] p-8 rounded-3xl border border-white/5 shadow-xl">
              <h2 className="font-display font-black text-2xl text-white uppercase italic mb-6">Weekend Highlights</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {content.highlightsList.map((highlight, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-[var(--accent-teal)]">✓</span>
                    <span className="text-[var(--text-secondary)] text-sm">{highlight}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Getting There */}
          <section className="mb-16">
            <h2 className="font-display font-black text-2xl text-white uppercase italic mb-6">Getting to the Circuit</h2>
            <div className="text-[var(--text-secondary)] leading-relaxed mb-8">
              {content?.gettingThereIntro || `Getting to ${race.circuitName} from ${race.city} is straightforward with several options available.`}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {content?.transportOptions?.map((opt, i) => (
                <div key={i} className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-white/5">
                  <span className="text-3xl block mb-4">{opt.icon}</span>
                  <h3 className="text-white font-bold mb-2">{opt.title}</h3>
                  <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{opt.desc}</p>
                </div>
              )) || (
                <div className="col-span-full p-6 rounded-2xl bg-[var(--bg-secondary)] border border-white/5 text-center">
                  <p className="text-[var(--text-secondary)]">Transport details are being updated. Check back closer to the race.</p>
                </div>
              )}
            </div>
          </section>

          {/* Top 3 Experiences */}
          {featured.length > 0 && (
            <section className="mb-16">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-display font-black text-2xl text-white uppercase italic">Must-Do Experiences</h2>
                <Link href={`/f1/${raceSlug}/experiences`} className="text-sm font-bold text-[var(--accent-teal)] hover:underline">
                  View all activities →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featured.map((exp, i) => (
                  <ExperienceCard 
                    key={exp.id} 
                    experience={exp} 
                    index={i} 
                    detailHref={`/f1/${raceSlug}/experiences/${exp.slug}`}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Where to Stay */}
          {content?.whereToStay && (
            <section className="mb-16">
              <h2 className="font-display font-black text-2xl text-white uppercase italic mb-6">Where to Stay in {race.city}</h2>
              <div className="prose prose-invert max-w-none text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                {content.whereToStay}
              </div>
            </section>
          )}

          {/* Travel Tips Accordion */}
          {content?.travelTips && content.travelTips.length > 0 && (
            <section className="mb-16">
              <h2 className="font-display font-black text-2xl text-white uppercase italic mb-6">Expert Travel Tips</h2>
              <GuideAccordion 
                items={content.travelTips.map((t, i) => ({ 
                  question: typeof t === 'string' ? `Tip #${i + 1}` : t.heading, 
                  answer: typeof t === 'string' ? t : t.body 
                }))} 
                accentColor={theme.accent} 
              />
            </section>
          )}

          {/* FAQ Accordion */}
          {content?.faqItems && content.faqItems.length > 0 && (
            <section className="mb-16">
              <h2 className="font-display font-black text-2xl text-white uppercase italic mb-6">Frequently Asked Questions</h2>
              <GuideAccordion 
                items={content.faqItems} 
                accentColor="var(--accent-teal)" 
              />
            </section>
          )}
        </div>
      </div>
    </>
  );
}
