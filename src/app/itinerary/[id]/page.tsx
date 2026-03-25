import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getItinerary } from '@/services/itinerary.service';
import { getRaceBySlug, getSessionsByRace } from '@/services/race.service';
import { getExperiencesByIds } from '@/services/experience.service';
import { db } from '@/lib/db';
import { races } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import ItineraryView from '@/components/itinerary/ItineraryView';
import { getRaceById } from '@/services/race.service';
import { BASE_OG, SITE_URL } from '@/lib/constants/site';

interface Props { params: Promise<{ id: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const itinerary = await getItinerary(id);
  if (!itinerary) return {};

  const race = await getRaceById(itinerary.raceId);
  const raceName = race?.name || 'Race Weekend';
  const city = race?.city || 'Race';
  return {
    title: `${city} GP Strategy Briefing | Race Weekend`,
    description: `Tactical mission plan for the ${raceName}. Track sessions and local intelligence assets deployed.`,
    robots: { index: false, follow: false },
    alternates: { canonical: `${SITE_URL}/itinerary/${id}` },
    openGraph: { ...BASE_OG,title: `${city} GP Strategy Briefing | Race Weekend`,
      description: `Tactical mission plan for the ${raceName}. Track sessions and local intelligence assets deployed.`,
      images: [{ url: `${SITE_URL}/itinerary/${id}/opengraph-image`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      images: [`${SITE_URL}/itinerary/${id}/opengraph-image`],
    },
  };
}

export default async function ItineraryViewPage({ params }: Props) {
  const { id } = await params;
  const itinerary = await getItinerary(id);
  if (!itinerary) notFound();

  // Fetch race by id
  const [raceRow] = await db.select().from(races).where(eq(races.id, itinerary.raceId)).limit(1);
  if (!raceRow) notFound();

  const race = {
    id: raceRow.id,
    series: (raceRow.series ?? 'f1') as 'f1' | 'motogp',
    slug: raceRow.slug ?? '',
    name: raceRow.name ?? '',
    season: raceRow.season ?? 2026,
    round: raceRow.round ?? 0,
    circuitName: raceRow.circuit_name ?? '',
    city: raceRow.city ?? '',
    country: raceRow.country ?? '',
    countryCode: raceRow.country_code ?? '',
    circuitLat: null,
    circuitLng: null,
    timezone: raceRow.timezone ?? 'UTC',
    raceDate: raceRow.race_date instanceof Date ? raceRow.race_date.toISOString().slice(0, 10) : (raceRow.race_date ?? ''),
    flagEmoji: raceRow.flag_emoji ?? null,
    isActive: raceRow.is_active ?? true,
    isCancelled: raceRow.is_cancelled ?? false,
    officialTicketsUrl: raceRow.official_tickets_url ?? null,
    officialEventUrl: raceRow.official_event_url ?? null,
    hasExperiences: true,
    themeAccent: raceRow.theme_accent ?? null,
    themeAccentAlt: raceRow.theme_accent_alt ?? null,
    themeGlow: raceRow.theme_glow ?? null,
  };

  const [allSessions, selectedExperiences] = await Promise.all([
    getSessionsByRace(race.id),
    getExperiencesByIds(itinerary.experiencesSelected),
  ]);

  const selectedSessions = allSessions.filter(s => itinerary.sessionsSelected.includes(s.id));

  return (
    <div className="min-h-screen pt-20 pb-24 px-4">
      <h1 className="sr-only">
        {race.city} {race.series.toUpperCase()} itinerary
      </h1>
      <ItineraryView
        itinerary={itinerary}
        race={race}
        sessions={selectedSessions}
        experiences={selectedExperiences}
      />
    </div>
  );
}
