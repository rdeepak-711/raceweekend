import type { Metadata } from 'next';
import { SITE_URL, BASE_OG } from '@/lib/constants/site';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getRaceBySlug } from '@/services/race.service';
import { getExperienceBySlug, getSuggestedExperiences } from '@/services/experience.service';
import { getRaceImagePaths } from '@/lib/utils/raceImages';
import ExperienceTOC from '@/components/experiences/ExperienceTOC';
import ExperienceSuggestions from '@/components/experiences/ExperienceSuggestions';
import PhotoSlider from '@/components/experiences/PhotoSlider';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/constants/categories';
import GuideAccordion from '@/components/race/GuideAccordion';
import { parseMarkdown } from '@/lib/utils/markdown';


interface Props { params: Promise<{ raceSlug: string; slug: string }>; }

function truncateTitle(title: string, budget: number): string {
  if (title.length <= budget) return title;
  const cut = title.lastIndexOf(' ', budget);
  return title.slice(0, cut > 0 ? cut : budget) + '…';
}

function boundDescription(raw: string | null | undefined, raceName: string, city: string): string {
  let desc = raw?.trim() ?? '';
  if (desc.length > 155) {
    const cut = desc.lastIndexOf(' ', 152);
    desc = desc.slice(0, cut > 0 ? cut : 152) + '…';
  }
  if (desc.length < 130) {
    const suffix = ` Book for the ${raceName} in ${city}.`;
    desc = (desc + suffix).slice(0, 155);
  }
  return desc;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { raceSlug, slug } = await params;
  const race = await getRaceBySlug(raceSlug, 'motogp');
  if (!race) return {};
  const exp = await getExperienceBySlug(slug, race.id);
  if (!exp) return {};
  const raceImages = getRaceImagePaths(raceSlug);
  // Use locally-hosted race image for OG — GYG CDN blocks crawlers without referrer
  const ogImage = raceImages.ogImageUrl
    ? { url: raceImages.ogImageUrl, width: 1200, height: 630 }
    : null;
  const suffix = ` | MotoGP ${raceSlug}`;
  const titleBudget = Math.max(20, 55 - suffix.length);
  return {
    title: `${truncateTitle(exp.title, titleBudget)}${suffix}`,
    description: boundDescription(exp.shortDescription, race.name, race.city ?? raceSlug),
    alternates: { canonical: `${SITE_URL}/motogp/${raceSlug}/experiences/${slug}` },
    openGraph: { ...BASE_OG,title: truncateTitle(exp.title, titleBudget),
      description: boundDescription(exp.shortDescription, race.name, race.city ?? raceSlug),
      images: ogImage ? [ogImage] : [],
    },
    twitter: {
      card: 'summary_large_image',
      images: ogImage ? [ogImage.url] : [],
    },
  };
}

export default async function MotoGPExperienceDetailPage({ params }: Props) {
  const { raceSlug, slug } = await params;
  const race = await getRaceBySlug(raceSlug, 'motogp');
  if (!race) notFound();
  const experience = await getExperienceBySlug(slug, race.id);
  if (!experience) notFound();

  const suggestions = await getSuggestedExperiences(race.id, slug, 4);
  const color = CATEGORY_COLORS[experience.category] ?? '#6E6E82';
  const categoryLabel = CATEGORY_LABELS[experience.category] ?? experience.category;
  const articleHtml = experience.guideArticle ? parseMarkdown(experience.guideArticle) : null;

  const raceImagesForSchema = getRaceImagePaths(raceSlug);
  const schemaImage = raceImagesForSchema.ogImageUrl ?? undefined;

  const combinedSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': ['TouristAttraction', 'Product'],
    name: experience.title,
    description: experience.shortDescription,
    image: schemaImage,
    offers: {
      '@type': 'Offer',
      price: Number(experience.priceAmount).toFixed(2),
      priceCurrency: experience.priceCurrency,
      availability: 'https://schema.org/InStock',
      url: experience.affiliateUrl,
    },
    ...(experience.rating > 0 ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: experience.rating,
        reviewCount: Number(experience.reviewCount),
      },
    } : {}),
    ...(experience.lat && experience.lng ? {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: experience.lat,
        longitude: experience.lng,
      },
    } : {}),
    ...(experience.reviewsSnapshot && experience.reviewsSnapshot.length > 0 ? {
      review: experience.reviewsSnapshot.slice(0, 2).map(r => ({
        '@type': 'Review',
        author: { '@type': 'Person', name: r.author },
        reviewRating: { '@type': 'Rating', ratingValue: r.rating },
        reviewBody: r.text,
      })),
    } : {}),
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'MotoGP', item: `${SITE_URL}/motogp` },
      { '@type': 'ListItem', position: 3, name: race.name, item: `${SITE_URL}/motogp/${raceSlug}` },
      { '@type': 'ListItem', position: 4, name: 'Experiences', item: `${SITE_URL}/motogp/${raceSlug}/experiences` },
      { '@type': 'ListItem', position: 5, name: experience.title, item: `${SITE_URL}/motogp/${raceSlug}/experiences/${slug}` },
    ],
  };

  const faqLd = experience.faqItems && experience.faqItems.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: experience.faqItems.slice(0, 5).map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  } : null;

  const schemas = [combinedSchema, breadcrumbLd, ...(faqLd ? [faqLd] : [])];

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
    <div className="min-h-screen pt-20 pb-24">

      <div className="max-w-7xl mx-auto px-4">
        <PhotoSlider
          photos={experience.photos}
          imageUrl={experience.imageUrl}
          title={experience.title}
          color={color}
          imageEmoji={experience.imageEmoji}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 flex gap-8">
        <ExperienceTOC accentColor="var(--accent-teal)" />

        {/* Main content */}
        <article className="flex-1 min-w-0">
          <div id="overview" className="mb-8">
            <span className="text-xs font-medium px-2.5 py-1 rounded-full uppercase-badge mb-3 inline-block" style={{ color, backgroundColor: `${color}20`, border: `1px solid ${color}40` }}>
              {categoryLabel}
            </span>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-white uppercase-heading mb-3">{experience.title}</h1>
            <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-4">{experience.shortDescription}</p>

            <div className="flex flex-wrap gap-4 text-sm text-[var(--text-secondary)] mb-6">
              <span>⏱ {experience.durationLabel}</span>
              <span>★ {experience.rating.toFixed(1)} ({experience.reviewCount.toLocaleString()} reviews)</span>
              {experience.neighborhood && <span>📍 {experience.neighborhood}</span>}
              {experience.languages && experience.languages.length > 0 && <span>🌐 {experience.languages.slice(0, 3).join(', ')}</span>}
            </div>

            <div className="flex items-center gap-4 p-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
              <div>
                <p className="text-2xl font-display font-bold text-white">{experience.priceLabel}</p>
                <p className="text-sm text-[var(--text-secondary)]">per person</p>
              </div>
              <a
                href={experience.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center py-3 rounded-full font-bold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#FF6B00' }}
              >
                Book on GetYourGuide →
              </a>
            </div>
          </div>

          {experience.highlights && experience.highlights.length > 0 && (
            <section id="highlights" className="mb-8 pt-4">
              <h2 className="font-display font-bold text-2xl text-white mb-4">Highlights</h2>
              <ul className="space-y-2">
                {experience.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-[var(--text-secondary)]">
                    <span style={{ color: 'var(--accent-teal)' }}>✓</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {(experience.includes || experience.excludes) && (
            <section id="includes" className="mb-8 pt-4">
              <h2 className="font-display font-bold text-2xl text-white mb-4">What&apos;s Included</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {experience.includes && experience.includes.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-white mb-2">✅ Included</p>
                    <ul className="space-y-1">
                      {experience.includes.map((item, i) => (
                        <li key={i} className="text-sm text-[var(--text-secondary)]">• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {experience.excludes && experience.excludes.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-white mb-2">❌ Not included</p>
                    <ul className="space-y-1">
                      {experience.excludes.map((item, i) => (
                        <li key={i} className="text-sm text-[var(--text-secondary)]">• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          )}

          {experience.raceContext && (
            <section id="itinerary" className="mb-8 pt-4">
              <div className="rounded-2xl p-5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)]"
                style={{ borderLeft: '4px solid var(--accent-teal)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">🏍️</span>
                  <h2 className="font-display font-bold text-lg text-white">Race Weekend Context</h2>
                </div>
                <p className="text-[var(--text-secondary)] leading-relaxed text-sm">{experience.raceContext}</p>
              </div>
            </section>
          )}

          {articleHtml && (
            <section className="mb-8 pt-4">
              <div className="guide-article" dangerouslySetInnerHTML={{ __html: articleHtml as string }} />
            </section>
          )}

          {experience.reviewsSnapshot && experience.reviewsSnapshot.length > 0 && (
            <section id="reviews" className="mb-8 pt-4">
              <h2 className="font-display font-bold text-2xl text-white mb-4">Reviews</h2>
              <div className="space-y-4">
                {experience.reviewsSnapshot.slice(0, 4).map((r, i) => (
                  <div key={i} className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-white">{r.author}</span>
                      <span className="text-xs text-[var(--text-secondary)]">★ {r.rating}</span>
                      {r.country && <span className="text-xs text-[var(--text-tertiary)]">· {r.country}</span>}
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{r.text}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {experience.faqItems && experience.faqItems.length > 0 && (
            <section id="faq" className="mb-8 pt-4">
              <h2 className="font-display font-bold text-2xl text-white mb-4">FAQ</h2>
              <GuideAccordion items={experience.faqItems} accentColor="var(--accent-teal)" />
            </section>
          )}

          <section id="booking" className="pt-4">
            <div className="p-6 rounded-xl border" style={{ borderColor: 'rgba(255,107,0,0.3)', backgroundColor: 'rgba(255,107,0,0.05)' }}>
              <h2 className="font-display font-bold text-xl text-white mb-2">Ready to Book?</h2>
              <p className="text-sm text-[var(--text-secondary)] mb-4">Book securely on GetYourGuide. Instant confirmation available.</p>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-2xl font-display font-bold text-white">{experience.priceLabel}</p>
                  <p className="text-xs text-[var(--text-secondary)]">per person</p>
                </div>
                <a
                  href={experience.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center py-3 rounded-full font-bold text-white hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#FF6B00' }}
                >
                  Book on GetYourGuide →
                </a>
              </div>
            </div>
          </section>

          {suggestions.length > 0 && (
            <section className="pt-8 mt-4 border-t border-[var(--border-subtle)]">
              <h2 className="font-display font-bold text-xl text-white mb-4">More Experiences in {race.city}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {suggestions.map(s => (
                  <Link
                    key={s.id}
                    href={`/motogp/${raceSlug}/experiences/${s.slug}`}
                    className="flex gap-3 p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:border-[var(--border-medium)] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white line-clamp-2">{s.title}</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">{s.priceLabel}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>

        <ExperienceSuggestions
          experiences={suggestions}
          basePath={`/motogp/${raceSlug}/experiences`}
        />
      </div>
    </div>
    </>
  );
}
