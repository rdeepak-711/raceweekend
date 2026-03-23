import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { SITE_URL } from '@/lib/constants/site';
import { getRacesBySeries } from '@/services/race.service';
import { getExperiencesByRace, getExperiencesByIds } from '@/services/experience.service';
import { getSessionsByRace } from '@/services/race.service';
import ItineraryBuilder from '@/components/itinerary/ItineraryBuilder';
import type { Race, Session } from '@/types/race';
import type { Experience } from '@/types/experience';

export const metadata: Metadata = {
  title: 'Plan Your Trip | Race Weekend Itinerary Builder',
  description: 'Deploy your custom weekend strategy. Pick sessions, add experiences, and get a shareable link for your race crew.',
  alternates: { canonical: `${SITE_URL}/itinerary` },
  openGraph: {
    title: 'Race Weekend Itinerary Builder',
    description: 'Create and share the perfect F1 or MotoGP weekend plan.',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default async function ItineraryPage() {
  await headers();
  // Fetch upcoming races for both series
  const [f1Races, motoGPRaces] = await Promise.all([
    getRacesBySeries('f1'),
    getRacesBySeries('motogp'),
  ]);

  const today = new Date().toISOString().slice(0, 10);
  // Upcoming races only, sorted ascending by date
  const upcomingF1 = f1Races.filter(r => r.raceDate >= today).sort((a, b) => a.raceDate.localeCompare(b.raceDate));
  const upcomingMotoGP = motoGPRaces.filter(r => r.raceDate >= today).sort((a, b) => a.raceDate.localeCompare(b.raceDate));
  const allRaces: Race[] = [...upcomingF1, ...upcomingMotoGP];

  // Prefetch sessions + experiences for each race
  const allSessions: Record<number, Session[]> = {};
  const allExperiences: Record<number, Experience[]> = {};

  await Promise.all(
    allRaces.map(async race => {
      const [sessions, experiences] = await Promise.all([
        getSessionsByRace(race.id),
        getExperiencesByRace(race.id),
      ]);
      allSessions[race.id] = sessions;
      allExperiences[race.id] = experiences;
    })
  );

  return (
    <div className="min-h-screen pt-20 pb-24 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="py-8 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-[var(--accent-teal)] mb-2">Plan your trip</p>
          <h1 className="font-display font-black text-4xl sm:text-5xl text-white uppercase-heading mb-4">
            Build Your<br />Race Weekend
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-md mx-auto">
            Pick a race, select sessions you&apos;re attending, add local experiences, and get a shareable link.
          </p>
        </div>

        <ItineraryBuilder
          races={allRaces}
          f1Races={upcomingF1}
          motoGPRaces={upcomingMotoGP}
          allSessions={allSessions}
          allExperiences={allExperiences}
        />
      </div>
    </div>
  );
}
