import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getRaceBySlug, getRaceWithSessions } from '@/services/race.service';
import RaceSchedule from '@/components/race/RaceSchedule';
import SessionLiveWidget from '@/components/race/SessionLiveWidget';
import { getThemeFromRace } from '@/lib/constants/raceThemes';
import { getF1Meetings, getF1Sessions } from '@/lib/api/openf1';
import { getRaceImagePaths } from '@/lib/utils/raceImages';
import RaceSubNav from '@/components/race/RaceSubNav';
import PageBreadcrumb from '@/components/race/PageBreadcrumb';

interface Props { params: Promise<{ raceSlug: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { raceSlug } = await params;
  const race = await getRaceBySlug(raceSlug, 'f1');
  if (!race) return {};
  const { ogImageUrl } = getRaceImagePaths(raceSlug);

  return {
    title: `${race.name} Schedule 2026 | Race Weekend`,
    description: `Full race weekend schedule for the ${race.name}. All session times, timetable, and programme.`,
    alternates: { canonical: `https://raceweekend.app/f1/${raceSlug}/schedule` },
    openGraph: {
      title: `${race.name} Schedule 2026 | Race Weekend`,
      description: `Full race weekend schedule for the ${race.name}. All session times, timetable, and programme.`,
      images: ogImageUrl ? [{ url: ogImageUrl, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      images: ogImageUrl ? [ogImageUrl] : [],
    },
  };
}

async function findLiveSessionKey(cityName: string): Promise<number | null> {
  try {
    const meetings = await getF1Meetings(2026);
    const meeting = meetings.find(m =>
      m.location.toLowerCase().includes(cityName.toLowerCase()) ||
      cityName.toLowerCase().includes(m.location.toLowerCase())
    );
    if (!meeting) return null;

    const sessions = await getF1Sessions(meeting.meeting_key);
    const now = new Date();
    const live = sessions.find(s => {
      const start = new Date(s.date_start);
      const end = new Date(s.date_end);
      return start <= now && now <= end;
    });
    return live?.session_key ?? null;
  } catch {
    return null;
  }
}

export default async function F1SchedulePage({ params }: Props) {
  await headers();
  const { raceSlug } = await params;
  const result = await getRaceWithSessions(raceSlug);
  if (!result) notFound();

  const { race, sessions } = result;
  const theme = getThemeFromRace(race);
  const { circuitExists, circuitUrl } = getRaceImagePaths(raceSlug);

  // Get current time for live detection (server-side)
  const now = new Date();
  const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  // Try to find a live OpenF1 session key
  const liveSessionKey = await findLiveSessionKey(race.city);

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://raceweekend.app/' },
      { '@type': 'ListItem', position: 2, name: 'F1', item: 'https://raceweekend.app/f1' },
      { '@type': 'ListItem', position: 3, name: race.name, item: `https://raceweekend.app/f1/${raceSlug}` },
      { '@type': 'ListItem', position: 4, name: 'Schedule', item: `https://raceweekend.app/f1/${raceSlug}/schedule` },
    ],
  };

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbLd]) }} />
    <div className="min-h-screen pt-20 pb-24 px-4">
      <div className="max-w-4xl mx-auto">
        <PageBreadcrumb crumbs={[
          { label: 'Home', href: '/' },
          { label: 'F1', href: '/f1' },
          { label: race.name, href: `/f1/${raceSlug}` },
          { label: 'Schedule' },
        ]} />
        <RaceSubNav raceSlug={raceSlug} series="f1" current="schedule" />

        <div className="py-8">
          {/* Circuit Image */}
          {circuitExists && (
            <div className="relative rounded-xl mb-6 shadow-lg border border-white/5 bg-[var(--bg-secondary)] flex items-center justify-center p-4">
              <img src={circuitUrl} alt={race.circuitName} className="w-full max-h-56 object-contain opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-transparent opacity-30 pointer-events-none" />
            </div>
          )}

          <p
            className="text-xs font-medium uppercase tracking-widest mb-2"
            style={{ color: theme.accent }}
          >
            🏎️ F1 · {race.city}
          </p>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-white uppercase mb-2">
            Race Weekend Schedule
          </h1>
          <p className="text-[var(--text-secondary)] mb-4">{race.circuitName} · {race.raceDate}</p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-white/5 text-[var(--text-tertiary)] text-xs font-bold uppercase tracking-wider shadow-sm">
            <span className="text-sm">⏰</span> All times shown in {race.timezone} local time
          </div>
        </div>

        {/* Live positions widget */}
        {liveSessionKey !== null && (
          <div className="mb-6">
            <SessionLiveWidget sessionKey={liveSessionKey} raceAccent={theme.accent} />
          </div>
        )}

        {race.isCancelled && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-center">
            <p className="text-red-400 font-black uppercase tracking-widest text-sm">⚠️ This race has been called off</p>
            <p className="text-[var(--text-tertiary)] text-xs mt-1">All sessions listed below are cancelled</p>
          </div>
        )}

        {sessions.length > 0 ? (
          <RaceSchedule
            sessions={sessions}
            timezone={race.timezone}
            accentColor={theme.accent}
            raceDate={race.raceDate}
            isCancelled={race.isCancelled}
          />
        ) : (
          <p className="text-[var(--text-secondary)]">Schedule not yet available.</p>
        )}
      </div>
    </div>
    </>
  );
}
