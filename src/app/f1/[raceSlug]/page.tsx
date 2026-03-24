import type { Metadata } from 'next';
import { SITE_URL, BASE_OG } from '@/lib/constants/site';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getRaceBySlug, getRaceContent, getSessionsByRace, getNearbyRaces } from '@/services/race.service';
import { getFeaturedExperiences } from '@/services/experience.service';
import RaceHero from '@/components/race/RaceHero';
import RaceNavGrid from '@/components/race/RaceNavGrid';
import FeaturedExperiences from '@/components/experiences/FeaturedExperiences';
import { getThemeFromRace } from '@/lib/constants/raceThemes';
import { getRaceImagePaths } from '@/lib/utils/raceImages';
import { getF1Meetings, getF1Sessions } from '@/lib/api/openf1';
import LiveTacticalHub from '@/components/race/LiveTacticalHub';
import RelatedRaces from '@/components/race/RelatedRaces';
import { isSoon, getUrgencyMessage } from '@/lib/utils';

interface Props { params: Promise<{ raceSlug: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { raceSlug } = await params;
  const race = await getRaceBySlug(raceSlug, 'f1');
  if (!race) return {};
  const content = await getRaceContent(race.id);
  const { ogImageUrl } = getRaceImagePaths(raceSlug);

  const title = content?.pageTitle ?? `${race.city} GP 2026: Schedule, Tickets & Experiences`;
  const description = content?.pageDescription ?? `Plan your ${race.name} race weekend. Schedule, experiences, tickets, and travel guide for ${race.city}.`;

  return {
    title,
    description,
    keywords: content?.pageKeywords ?? [],
    alternates: { canonical: `${SITE_URL}/f1/${raceSlug}` },
    openGraph: { ...BASE_OG,title,
      description,
      images: ogImageUrl ? [{ url: ogImageUrl, width: 1200, height: 630, alt: `${race.city} — ${race.name}` }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      images: ogImageUrl ? [ogImageUrl] : [],
    },
  };
}

export default async function F1RacePage({ params }: Props) {
  const { raceSlug } = await params;
  const race = await getRaceBySlug(raceSlug, 'f1');
  if (!race) notFound();

  const [content, sessions, featured, relatedRaces] = await Promise.all([
    getRaceContent(race.id),
    getSessionsByRace(race.id),
    getFeaturedExperiences(race.id, 3),
    getNearbyRaces(race.id, 'f1', race.raceDate, 4),
  ]);

  const theme = getThemeFromRace(race);
  const { circuitExists, circuitUrl, galleryImages, ogImageUrl } = getRaceImagePaths(raceSlug);
  const raceDateTime = `${race.raceDate}T14:00:00`;

  // Live session check
  let activeSession = null;
  try {
    const meetings = await getF1Meetings(race.season);
    const meeting = meetings.find(m => m.location.toLowerCase() === race.city.toLowerCase() || m.meeting_name.toLowerCase().includes(race.city.toLowerCase()));
    if (meeting) {
      const allF1Sessions = await getF1Sessions(meeting.meeting_key);
      const now = new Date();
      activeSession = allF1Sessions.find(s => {
        const start = new Date(s.date_start);
        const end = new Date(s.date_end);
        return start <= now && now <= end;
      });
    }
  } catch (e) {
    console.warn('[live-check] OpenF1 session sync unavailable');
  }
  
  const { soon, daysRemaining } = isSoon(race.raceDate);

  const eventLocation = {
    '@type': 'Place',
    name: race.circuitName,
    address: { '@type': 'PostalAddress', addressLocality: race.city, addressCountry: race.country },
    ...(race.circuitLat && race.circuitLng ? {
      geo: { '@type': 'GeoCoordinates', latitude: race.circuitLat, longitude: race.circuitLng },
    } : {}),
  };

  const subEvents = sessions.length > 0
    ? sessions.map(s => ({
        '@type': 'SportsEvent',
        name: s.name,
        startDate: s.startTime,
        endDate: s.endTime,
        sport: 'Formula 1',
        location: eventLocation,
      }))
    : undefined;

  const sportsEventLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: race.name,
    url: `${SITE_URL}/f1/${race.slug}`,
    startDate: raceDateTime,
    endDate: `${race.raceDate}T18:00:00`,
    description: `The ${race.name} at ${race.circuitName} in ${race.city}, ${race.country}. Book tickets, experiences, and plan your F1 race weekend.`,
    sport: 'Formula 1',
    eventStatus: race.isCancelled
      ? 'https://schema.org/EventCancelled'
      : 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    ...(ogImageUrl ? { image: [ogImageUrl] } : {}),
    location: eventLocation,
    organizer: {
      '@type': 'Organization',
      name: 'Formula 1',
      url: 'https://www.formula1.com',
    },
    performer: {
      '@type': 'Organization',
      name: 'FIA Formula One World Championship',
      url: 'https://www.formula1.com',
    },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/f1/${race.slug}/tickets`,
      availability: race.isCancelled
        ? 'https://schema.org/Discontinued'
        : 'https://schema.org/InStock',
      validFrom: '2025-01-01',
      priceCurrency: 'EUR',
    },
    ...(subEvents ? { subEvent: subEvents } : {}),
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'F1', item: `${SITE_URL}/f1` },
      { '@type': 'ListItem', position: 3, name: race.name, item: `${SITE_URL}/f1/${race.slug}` },
    ],
  };

  const faqLd = content?.faqItems?.length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: content.faqItems.slice(0, 5).map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  } : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([sportsEventLd, breadcrumbLd, ...(faqLd ? [faqLd] : [])]) }} />
      
      <div className="min-h-screen bg-[var(--bg-primary)]">
        <div className="pt-14">
          {/* Urgency Banner */}
          {soon && (
            <div className="bg-[var(--accent-teal)] text-[var(--bg-primary)] font-bold text-center py-2 text-sm uppercase tracking-wider animate-pulse">
              {getUrgencyMessage(daysRemaining)}
            </div>
          )}

          <RaceHero
            race={race}
            theme={theme}
            series="f1"
            circuitUrl={circuitExists ? circuitUrl : undefined}
          />

          <div className="max-w-6xl mx-auto px-4 py-16">
            {/* Live Tactical Hub — High Contrast Intervention */}
            {activeSession && (
              <section className="mb-20">
                <LiveTacticalHub 
                  sessionKey={activeSession.session_key} 
                  sessionName={activeSession.session_name} 
                />
              </section>
            )}

            {/* Navigation grid */}
            <RaceNavGrid
              raceSlug={raceSlug}
              series="f1"
              accentColor={theme.accent}
              hasTickets={true}
            />

            {/* Gallery strip */}
            {galleryImages.length > 0 && (() => {
              const galleryAlts = [
                `F1 cars racing at ${race.circuitName} during the ${race.name}`,
                `${race.name} fans watching from the grandstands at ${race.city}`,
                `Pit lane activity during the ${race.name} weekend`,
                `${race.circuitName} aerial view during the ${race.name}`,
                `${race.name} podium celebration at ${race.city}`,
                `Fan atmosphere at the ${race.name} in ${race.city}`,
              ];
              return (
                <div className="flex gap-3 overflow-x-auto pb-2 mb-20 scrollbar-none">
                  {galleryImages.map((src, i) => (
                    <div key={i} className="relative h-48 w-72 flex-shrink-0">
                      <Image
                        src={src}
                        alt={galleryAlts[i] ?? `${race.name} race weekend photo ${i + 1}`}
                        fill
                        loading="lazy"
                        sizes="288px"
                        className="object-cover rounded-2xl shadow-lg opacity-90 hover:opacity-100 transition-opacity"
                      />
                    </div>
                  ))}
                </div>
              );
            })()}

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
                    href={`/f1/${raceSlug}/experiences`}
                    className="px-6 py-2 rounded-full border border-[var(--border-subtle)] text-sm font-bold hover:bg-white/5 transition-colors"
                  >
                    View all →
                  </Link>
                </div>
                <FeaturedExperiences experiences={featured} raceSlug={raceSlug} series="f1" />
              </section>
            )}

            {/* Tickets Strip CTA */}
            <section className="mb-20">
               <div className="bg-gradient-to-r from-[var(--bg-secondary)] to-[var(--bg-tertiary)] rounded-3xl p-8 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent-f1)] to-transparent opacity-50" />
                  <div className="relative z-10">
                    <h2 className="font-display font-black text-2xl text-white uppercase italic">Get Tickets Before They&apos;re Gone</h2>
                    <p className="text-[var(--text-secondary)] mt-1">Official Ticketmaster partner listings for the {race.name}</p>
                  </div>
                  <Link 
                    href={`/f1/${raceSlug}/tickets`}
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
                  href={`/f1/${raceSlug}/guide`}
                  className="inline-block mt-6 text-[var(--accent-teal)] font-bold hover:underline"
                >
                  Read full travel guide →
                </Link>
              </section>
            )}

            {/* Related Races */}
            <RelatedRaces races={relatedRaces} series="f1" />

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
