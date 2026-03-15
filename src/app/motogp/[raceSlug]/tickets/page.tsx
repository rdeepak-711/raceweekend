import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getRaceBySlug } from '@/services/race.service';
import { getTicketsByRace } from '@/services/ticket.service';
import TicketsClient from '@/components/tickets/TicketsClient';
import RaceCountdown from '@/components/race/RaceCountdown';
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
    title: `${race.name} MotoGP Tickets 2026 | Race Weekend`,
    description: `Buy ${race.name} MotoGP tickets. Compare race ticket listings via Ticketmaster.`,
    alternates: { canonical: `https://raceweekend.app/motogp/${raceSlug}/tickets` },
    openGraph: {
      title: `${race.name} MotoGP Tickets 2026 | Race Weekend`,
      description: `Buy ${race.name} MotoGP tickets. Compare race ticket listings via Ticketmaster.`,
      images: ogImageUrl ? [{ url: ogImageUrl, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      images: ogImageUrl ? [ogImageUrl] : [],
    },
  };
}

export const revalidate = 21600;

export default async function MotoGPTicketsPage({ params }: Props) {
  const { raceSlug } = await params;
  const race = await getRaceBySlug(raceSlug, 'motogp');
  if (!race) notFound();

  const tickets = await getTicketsByRace(race.id);
  const theme = getThemeFromRace(race);
  const raceDateTime = `${race.raceDate}T14:00:00`;

  const today = new Date().toISOString().slice(0, 10);
  const isPast = race.raceDate < today;

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://raceweekend.app/' },
      { '@type': 'ListItem', position: 2, name: 'MotoGP', item: 'https://raceweekend.app/motogp' },
      { '@type': 'ListItem', position: 3, name: race.name, item: `https://raceweekend.app/motogp/${raceSlug}` },
      { '@type': 'ListItem', position: 4, name: 'Tickets', item: `https://raceweekend.app/motogp/${raceSlug}/tickets` },
    ],
  };

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbLd]) }} />
    <div className="min-h-screen bg-[var(--bg-primary)] pt-20 pb-24 px-4">
      <div className="max-w-6xl mx-auto">
        <PageBreadcrumb crumbs={[
          { label: 'Home', href: '/' },
          { label: 'MotoGP', href: '/motogp' },
          { label: race.name, href: `/motogp/${raceSlug}` },
          { label: 'Tickets' },
        ]} />
        <RaceSubNav raceSlug={raceSlug} series="motogp" current="tickets" />

        <div className="py-12 border-b border-white/5 mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] mb-3" style={{ color: theme.accent }}>
                🎟 MotoGP · {race.city}
              </p>
              <h1 className="font-display font-black text-4xl md:text-6xl text-white uppercase italic tracking-tighter leading-none">
                Race Tickets
              </h1>
              <p className="text-[var(--text-secondary)] text-lg mt-4 font-medium">{race.name} · {race.raceDate}</p>
            </div>

            <div className="bg-[var(--bg-secondary)] px-6 py-4 rounded-2xl border border-white/5 shadow-xl min-w-[280px]">
              <p className="text-[var(--text-tertiary)] text-[10px] font-black uppercase tracking-widest mb-2">Race Starts In</p>
              <RaceCountdown targetDate={raceDateTime} size="sm" />
            </div>
          </div>
        </div>

        {tickets.length > 0 && !isPast ? (
          <TicketsClient tickets={tickets} raceAccent={theme.accent} />
        ) : (
          <div className="text-center py-24 bg-[var(--bg-secondary)] rounded-3xl border border-white/5 shadow-2xl overflow-hidden relative">
            <div
              className="absolute top-0 right-0 w-64 h-64 blur-[100px] rounded-full opacity-10 pointer-events-none"
              style={{ backgroundColor: theme.accent }}
            />
            <div className="relative z-10 space-y-6">
              <p className="text-6xl mb-6">{isPast ? '🏁' : '🎟'}</p>
              <h2 className="font-display font-black text-3xl text-white uppercase italic">
                {isPast ? 'Race Weekend Completed' : 'Tickets Coming Soon'}
              </h2>
              <p className="text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
                {isPast 
                  ? `The ${race.name} has concluded. Check back later for details on the next season's events.`
                  : `Listings for the ${race.name} typically appear approximately 4-8 weeks before the event. Check back soon for the best available prices.`
                }
              </p>
              <div className="flex justify-center pt-4">
                <Link
                  href={`/motogp/${raceSlug}/experiences`}
                  className="px-10 py-4 rounded-full font-black text-white transition-all hover:scale-105 active:scale-95 shadow-xl"
                  style={{ backgroundColor: theme.accent }}
                >
                  Browse {race.city} Experiences →
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="mt-20 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
          <p className="text-[var(--text-tertiary)] text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <span>Official Ticketing Partner</span>
            <span className="text-white text-sm italic">Ticketmaster</span>
          </p>
          <p className="text-[var(--text-tertiary)] text-[10px] uppercase tracking-wider">
            Updated every 6 hours · Affiliate Partner
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
