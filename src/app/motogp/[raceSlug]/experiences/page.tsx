import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/constants/site';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getRaceBySlug } from '@/services/race.service';
import { getExperiencesByRace } from '@/services/experience.service';
import ExperiencesClient from '@/components/experiences/ExperiencesClient';
import RaceSubNav from '@/components/race/RaceSubNav';
import PageBreadcrumb from '@/components/race/PageBreadcrumb';
import { getRaceImagePaths } from '@/lib/utils/raceImages';

interface Props { params: Promise<{ raceSlug: string }>; searchParams: Promise<{ category?: string; sort?: string; }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { raceSlug } = await params;
  const race = await getRaceBySlug(raceSlug, 'motogp');
  if (!race) return {};
  const { ogImageUrl } = getRaceImagePaths(raceSlug);
  const title = `Things to Do in ${race.city} During the ${race.name}`;
  const description = `Curated experiences for the ${race.name}. Things to do between sessions in ${race.city}.`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/motogp/${raceSlug}/experiences` },
    openGraph: {
      title,
      description,
      images: ogImageUrl ? [{ url: ogImageUrl, width: 1200, height: 630, alt: `${race.city} — ${race.name}` }] : [],
    },
    twitter: {
      card: 'summary_large_image' as const,
      images: ogImageUrl ? [ogImageUrl] : [],
    },
  };
}

export default async function MotoGPExperiencesPage({ params, searchParams }: Props) {
  const { raceSlug } = await params;
  const { category, sort } = await searchParams;

  const race = await getRaceBySlug(raceSlug, 'motogp');
  if (!race) notFound();

  const experiences = await getExperiencesByRace(race.id, {
    category: category as 'food' | 'culture' | 'adventure' | 'daytrip' | 'nightlife' | undefined,
    sort: sort as 'popular' | 'price-low' | 'price-high' | 'duration-short' | 'rating' | undefined,
  });

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'MotoGP', item: `${SITE_URL}/motogp` },
      { '@type': 'ListItem', position: 3, name: race.name, item: `${SITE_URL}/motogp/${raceSlug}` },
      { '@type': 'ListItem', position: 4, name: 'Experiences', item: `${SITE_URL}/motogp/${raceSlug}/experiences` },
    ],
  };

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbLd]) }} />
    <div className="min-h-screen pt-20 pb-24 px-4">
      <div className="max-w-6xl mx-auto">
        <PageBreadcrumb crumbs={[
          { label: 'Home', href: '/' },
          { label: 'MotoGP', href: '/motogp' },
          { label: race.name, href: `/motogp/${raceSlug}` },
          { label: 'Experiences' },
        ]} />
        <RaceSubNav raceSlug={raceSlug} series="motogp" current="experiences" />
        <div className="py-8">
          <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: 'var(--accent-motogp, #FF6B00)' }}>
            🏍️ MotoGP · {race.city}
          </p>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-white uppercase-heading mb-2">
            {race.city} Experiences
          </h1>
          <p className="text-[var(--text-secondary)]">{experiences.length} activities for the {race.name}</p>
        </div>

        <Suspense fallback={null}>
          <ExperiencesClient
            initialExperiences={experiences}
            raceSlug={raceSlug}
            series="motogp"
          />
        </Suspense>
      </div>
    </div>
    </>
  );
}
