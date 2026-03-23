import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/constants/site';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getRaceBySlug, getRaceWithSessions } from '@/services/race.service';
import RaceSchedule from '@/components/race/RaceSchedule';
import SessionLiveWidget from '@/components/race/SessionLiveWidget';
import { getThemeFromRace } from '@/lib/constants/raceThemes';
import { getF1Meetings, getF1Sessions } from '@/lib/api/openf1';
import { getRaceImagePaths } from '@/lib/utils/raceImages';
import Image from 'next/image';
import RaceSubNav from '@/components/race/RaceSubNav';
import PageBreadcrumb from '@/components/race/PageBreadcrumb';

interface Props { params: Promise<{ raceSlug: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { raceSlug } = await params;
  const race = await getRaceBySlug(raceSlug, 'f1');
  if (!race) return {};
  const { ogImageUrl } = getRaceImagePaths(raceSlug);

  return {
    title: `${race.name} 2026 Session Schedule & Race Times`,
    description: `Full race weekend schedule for the ${race.name}. All session times, timetable, and programme.`,
    alternates: { canonical: `${SITE_URL}/f1/${raceSlug}/schedule` },
    openGraph: {
      title: `${race.name} 2026 Session Schedule & Race Times`,
      description: `Full race weekend schedule for the ${race.name}. All session times, timetable, and programme.`,
      images: ogImageUrl ? [{ url: ogImageUrl, width: 1200, height: 630, alt: `${race.city} — ${race.name}` }] : [],
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
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'F1', item: `${SITE_URL}/f1` },
      { '@type': 'ListItem', position: 3, name: race.name, item: `${SITE_URL}/f1/${raceSlug}` },
      { '@type': 'ListItem', position: 4, name: 'Schedule', item: `${SITE_URL}/f1/${raceSlug}/schedule` },
    ],
  };

  // Build ItemList + Event schema for each session
  const DAY_OFFSETS: Record<string, number> = { Thursday: -3, Friday: -2, Saturday: -1, Sunday: 0 };
  const raceDate = new Date(race.raceDate);
  const scheduleItemListLd = sessions.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${race.name} 2026 Weekend Schedule`,
    itemListElement: sessions.map((s, i) => {
      const sessionDate = new Date(raceDate);
      sessionDate.setDate(sessionDate.getDate() + (DAY_OFFSETS[s.dayOfWeek] ?? 0));
      const dateStr = sessionDate.toISOString().slice(0, 10);
      const startDate = s.startTime ? `${dateStr}T${s.startTime}` : dateStr;
      const endDate = s.endTime ? `${dateStr}T${s.endTime}` : undefined;
      return {
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Event',
          name: s.name,
          startDate,
          ...(endDate ? { endDate } : {}),
          location: {
            '@type': 'Place',
            name: race.circuitName,
            address: { '@type': 'PostalAddress', addressLocality: race.city, addressCountry: race.country },
          },
          organizer: { '@type': 'Organization', name: 'Formula 1' },
          eventStatus: race.isCancelled
            ? 'https://schema.org/EventCancelled'
            : 'https://schema.org/EventScheduled',
        },
      };
    }),
  } : null;

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(scheduleItemListLd ? [breadcrumbLd, scheduleItemListLd] : [breadcrumbLd]) }} />
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
              <Image src={circuitUrl} alt={`${race.circuitName} circuit layout`} width={800} height={450} className="w-full max-h-56 object-contain opacity-80" loading="lazy" />
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
