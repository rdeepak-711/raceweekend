import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getRaceBySlug, getRaceContent, getSessionsByRace, getNearbyRaces } from '@/services/race.service';
import { getFeaturedExperiences } from '@/services/experience.service';
import RaceHero from '@/components/race/RaceHero';
import RaceNavGrid from '@/components/race/RaceNavGrid';
import FeaturedExperiences from '@/components/experiences/FeaturedExperiences';
import { SERIES_META } from '@/lib/constants/series';
import { getThemeFromRace } from '@/lib/constants/raceThemes';
import { getRaceImagePaths } from '@/lib/utils/raceImages';
import RelatedRaces from '@/components/race/RelatedRaces';

interface Props { params: Promise<{ raceSlug: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { raceSlug } = await params;
  const race = await getRaceBySlug(raceSlug, 'motogp');
  if (!race) return {};
  const content = await getRaceContent(race.id);
  const { ogImageUrl } = getRaceImagePaths(raceSlug);

  const title = content?.pageTitle ?? `${race.name} Travel Guide`;
  const description = content?.pageDescription ?? `Plan your ${race.name} race weekend. Schedule, experiences, tickets, and travel guide for ${race.city}.`;

  return {
    title,
    description,
    alternates: { canonical: `https://raceweekend.app/motogp/${raceSlug}` },
    openGraph: {
      title,
      description,
      images: ogImageUrl ? [{ url: ogImageUrl, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      images: ogImageUrl ? [ogImageUrl] : [],
    },
  };
}

export default async function MotoGPRacePage({ params }: Props) {
  await headers();
  const { raceSlug } = await params;
  const race = await getRaceBySlug(raceSlug, 'motogp');
  if (!race) notFound();

  const [content, sessions, featured, relatedRaces] = await Promise.all([
    getRaceContent(race.id),
    getSessionsByRace(race.id),
    getFeaturedExperiences(race.id, 3),
    getNearbyRaces(race.id, 'motogp', race.raceDate, 4),
  ]);

  const meta = SERIES_META.motogp;
  const theme = getThemeFromRace(race);
  const raceDateTime = `${race.raceDate}T14:00:00`;
  
  // Urgency logic
  const now = new Date();
  const raceDate = new Date(raceDateTime);
  const diffTime = raceDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isSoon = diffDays > 0 && diffDays <= 14;

  const sportsEventLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: race.name,
    startDate: raceDateTime,
    location: {
      '@type': 'Place',
      name: race.circuitName,
      address: { '@type': 'PostalAddress', addressCountry: race.country },
    },
    organizer: { '@type': 'Organization', name: 'MotoGP' },
    url: `https://raceweekend.app/motogp/${race.slug}`,
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://raceweekend.app/' },
      { '@type': 'ListItem', position: 2, name: 'MotoGP', item: 'https://raceweekend.app/motogp' },
      { '@type': 'ListItem', position: 3, name: race.name, item: `https://raceweekend.app/motogp/${race.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([sportsEventLd, breadcrumbLd]) }} />
      
      <div className="min-h-screen bg-[var(--bg-primary)]">
        <div className="pt-14">
          {/* Urgency Banner */}
          {isSoon && (
            <div className="bg-[var(--accent-teal)] text-[var(--bg-primary)] font-bold text-center py-2 text-sm uppercase tracking-wider animate-pulse">
              Race is in {diffDays} days. Book experiences and tickets before they sell out!
            </div>
          )}

          <RaceHero 
            race={race} 
            theme={theme} 
            series="motogp" 
          />

          <div className="max-w-6xl mx-auto px-4 py-16">
            {/* Navigation grid */}
            <RaceNavGrid 
              raceSlug={raceSlug} 
              series="motogp" 
              accentColor={theme.accent} 
              hasTickets={true} 
            />

            {/* Featured experiences */}
            {featured.length > 0 && (
              <section className="mb-20">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="font-display font-black text-2xl md:text-3xl text-white uppercase italic tracking-tighter">
                      Top Experiences
                    </h2>
                    <p className="text-[var(--text-secondary)] text-sm mt-1">Hand-picked activities for your weekend in {race.city}</p>
                  </div>
                  <Link
                    href={`/motogp/${raceSlug}/experiences`}
                    className="px-6 py-2 rounded-full border border-[var(--border-subtle)] text-sm font-bold hover:bg-white/5 transition-colors"
                  >
                    View all →
                  </Link>
                </div>
                <FeaturedExperiences experiences={featured} raceSlug={raceSlug} series="motogp" />
              </section>
            )}

            {/* Tickets Strip CTA */}
            <section className="mb-20">
               <div className="bg-gradient-to-r from-[var(--bg-secondary)] to-[var(--bg-tertiary)] rounded-3xl p-8 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent-motogp)] to-transparent opacity-50" />
                  <div className="relative z-10">
                    <h2 className="font-display font-black text-2xl text-white uppercase italic">Get Tickets Before They&apos;re Gone</h2>
                    <p className="text-[var(--text-secondary)] mt-1">Official Ticketmaster partner listings for the {race.name}</p>
                  </div>
                  <Link 
                    href={`/motogp/${raceSlug}/tickets`}
                    className="w-full md:w-auto px-10 py-4 rounded-full font-black text-white transition-all hover:scale-105 active:scale-95 shadow-xl"
                    style={{ backgroundColor: theme.accent }}
                  >
                    View Ticket Prices →
                  </Link>
               </div>
            </section>

            {/* Guide intro */}
            {content?.guideIntro && (
              <section className="mb-20 p-8 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                <h2 className="font-display font-black text-2xl text-white uppercase italic mb-4">City Guide: {race.city}</h2>
                <p className="text-[var(--text-secondary)] text-lg leading-relaxed whitespace-pre-wrap">{content.guideIntro}</p>
                <Link 
                  href={`/motogp/${raceSlug}/guide`}
                  className="inline-block mt-6 text-[var(--accent-teal)] font-bold hover:underline"
                >
                  Read full travel guide →
                </Link>
              </section>
            )}

            {/* Related Races */}
            <RelatedRaces races={relatedRaces} series="motogp" />

            {/* Itinerary Teaser */}
            <section className="text-center bg-[var(--accent-teal-muted)] rounded-3xl p-12 border border-[var(--accent-teal)]/20 shadow-inner">
               <p className="text-4xl mb-4">📋</p>
               <h2 className="font-display font-black text-2xl md:text-3xl text-white uppercase italic mb-2">Planning a group trip?</h2>
               <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto">Build a shareable itinerary with your selected sessions and experiences.</p>
               <Link
                 href={`/itinerary?race=${race.id}`}
                 className="px-10 py-4 rounded-full bg-[var(--accent-teal)] text-[var(--bg-primary)] font-black transition-all hover:scale-105 active:scale-95 shadow-lg"
               >
                 Build My Itinerary →
               </Link>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
