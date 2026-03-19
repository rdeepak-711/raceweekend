import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getRaceBySlug } from '@/services/race.service';
import { getExperiencesByRace } from '@/services/experience.service';
import ExperiencesClient from '@/components/experiences/ExperiencesClient';
import RaceSubNav from '@/components/race/RaceSubNav';
import PageBreadcrumb from '@/components/race/PageBreadcrumb';
import { getRaceImagePaths } from '@/lib/utils/raceImages';

export const dynamic = 'force-dynamic';

interface Props { params: Promise<{ raceSlug: string }>; searchParams: Promise<{ category?: string; sort?: string; }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { raceSlug } = await params;
  const race = await getRaceBySlug(raceSlug, 'f1');
  if (!race) return {};
  const { ogImageUrl } = getRaceImagePaths(raceSlug);
  const title = `Things to Do in ${race.city} During the ${race.name} | Race Weekend`;
  const description = `Curated experiences for the ${race.name}. Things to do between sessions in ${race.city}.`;
  return {
    title,
    description,
    alternates: { canonical: `https://raceweekend.app/f1/${raceSlug}/experiences` },
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

export default async function F1ExperiencesPage({ params, searchParams }: Props) {
  const { raceSlug } = await params;
  const { category, sort } = await searchParams;

  const race = await getRaceBySlug(raceSlug, 'f1');
  if (!race) notFound();

  const experiences = await getExperiencesByRace(race.id, {
    category: category as 'food' | 'culture' | 'adventure' | 'daytrip' | 'nightlife' | undefined,
    sort: sort as 'popular' | 'price-low' | 'price-high' | 'duration-short' | 'rating' | undefined,
  });

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://raceweekend.app/' },
      { '@type': 'ListItem', position: 2, name: 'F1', item: 'https://raceweekend.app/f1' },
      { '@type': 'ListItem', position: 3, name: race.name, item: `https://raceweekend.app/f1/${raceSlug}` },
      { '@type': 'ListItem', position: 4, name: 'Experiences', item: `https://raceweekend.app/f1/${raceSlug}/experiences` },
    ],
  };

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbLd]) }} />
    <div className="min-h-screen pt-20 pb-24 px-4">
      <div className="max-w-6xl mx-auto">
        <PageBreadcrumb crumbs={[
          { label: 'Home', href: '/' },
          { label: 'F1', href: '/f1' },
          { label: race.name, href: `/f1/${raceSlug}` },
          { label: 'Experiences' },
        ]} />
        <RaceSubNav raceSlug={raceSlug} series="f1" current="experiences" />
        <div className="py-8">
          <p className="text-xs font-medium uppercase tracking-widest text-[var(--accent-f1)] mb-2">
            🏎️ F1 · {race.city}
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
            series="f1"
          />
        </Suspense>
      </div>
    </div>
    </>
  );
}
