import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getRaceBySlug, getRaceWithSessions } from '@/services/race.service';
import RaceSchedule from '@/components/race/RaceSchedule';
import { getThemeFromRace } from '@/lib/constants/raceThemes';
import { getRaceImagePaths } from '@/lib/utils/raceImages';
import RaceSubNav from '@/components/race/RaceSubNav';
import PageBreadcrumb from '@/components/race/PageBreadcrumb';
import { getRaceStaticParams } from '@/lib/staticParams';

interface Props { params: Promise<{ raceSlug: string }>; }

export async function generateStaticParams() {
  return getRaceStaticParams('motogp');
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { raceSlug } = await params;
  const race = await getRaceBySlug(raceSlug, 'motogp');
  if (!race) return {};
  const { ogImageUrl } = getRaceImagePaths(raceSlug);

  return {
    title: `${race.name} Schedule 2026 | Race Weekend`,
    description: `Full race weekend schedule for the ${race.name}. All session times, timetable, and programme.`,
    alternates: { canonical: `https://raceweekend.app/motogp/${raceSlug}/schedule` },
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

export const revalidate = 3600;

export default async function MotoGPSchedulePage({ params }: Props) {
  const { raceSlug } = await params;
  const result = await getRaceWithSessions(raceSlug);
  if (!result) notFound();

  const { race, sessions } = result;
  const theme = getThemeFromRace(race);
  const { circuitExists, circuitUrl } = getRaceImagePaths(raceSlug);

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://raceweekend.app/' },
      { '@type': 'ListItem', position: 2, name: 'MotoGP', item: 'https://raceweekend.app/motogp' },
      { '@type': 'ListItem', position: 3, name: race.name, item: `https://raceweekend.app/motogp/${raceSlug}` },
      { '@type': 'ListItem', position: 4, name: 'Schedule', item: `https://raceweekend.app/motogp/${raceSlug}/schedule` },
    ],
  };

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbLd]) }} />
    <div className="min-h-screen pt-20 pb-24 px-4">
      <div className="max-w-4xl mx-auto">
        <PageBreadcrumb crumbs={[
          { label: 'Home', href: '/' },
          { label: 'MotoGP', href: '/motogp' },
          { label: race.name, href: `/motogp/${raceSlug}` },
          { label: 'Schedule' },
        ]} />
        <RaceSubNav raceSlug={raceSlug} series="motogp" current="schedule" />

        <div className="py-8">
          {/* Circuit Image */}
          {circuitExists && (
            <div className="relative rounded-xl mb-6 shadow-lg border border-white/5 bg-[var(--bg-secondary)] flex items-center justify-center p-4">
              <img src={circuitUrl} alt={race.circuitName} className="w-full max-h-56 object-contain opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-transparent opacity-30 pointer-events-none" />
            </div>
          )}

          <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: theme.accent }}>
            🏍️ MotoGP · {race.city}
          </p>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-white uppercase mb-2">
            Race Weekend Schedule
          </h1>
          <p className="text-[var(--text-secondary)] mb-4">{race.circuitName} · {race.raceDate}</p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-white/5 text-[var(--text-tertiary)] text-xs font-bold uppercase tracking-wider shadow-sm">
            <span className="text-sm">⏰</span> All times shown in {race.timezone} local time
          </div>
        </div>

        {sessions.length > 0 ? (
          <RaceSchedule
            sessions={sessions}
            timezone={race.timezone}
            accentColor={theme.accent}
            raceDate={race.raceDate}
          />
        ) : (
          <p className="text-[var(--text-secondary)]">Schedule not yet available.</p>
        )}
      </div>
    </div>
    </>
  );
}
