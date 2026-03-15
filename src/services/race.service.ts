import { db } from '@/lib/db';
import { races, sessions, race_content, experiences } from '@/lib/db/schema';
import { eq, gte, asc, and, sql } from 'drizzle-orm';
import type { Race, Session, RaceContent } from '@/types/race';
import type { RaceSeries } from '@/lib/constants/series';
import { cache } from 'react';

function mapRace(r: typeof races.$inferSelect, expCount = 0): Race {
  return {
    id: r.id,
    series: r.series as RaceSeries,
    slug: r.slug ?? '',
    name: r.name ?? '',
    season: r.season ?? 2026,
    round: r.round ?? 0,
    circuitName: r.circuit_name ?? '',
    city: r.city ?? '',
    country: r.country ?? '',
    countryCode: r.country_code ?? '',
    circuitLat: r.circuit_lat ? Number(r.circuit_lat) : null,
    circuitLng: r.circuit_lng ? Number(r.circuit_lng) : null,
    timezone: r.timezone ?? 'UTC',
    raceDate: r.race_date instanceof Date ? r.race_date.toISOString().slice(0, 10) : (r.race_date ?? ''),
    flagEmoji: r.flag_emoji ?? null,
    isActive: r.is_active ?? true,
    hasExperiences: expCount > 0,
    themeAccent: r.theme_accent ?? null,
    themeAccentAlt: r.theme_accent_alt ?? null,
    themeGlow: r.theme_glow ?? null,
  };
}

function mapSession(s: typeof sessions.$inferSelect): Session {
  return {
    id: s.id,
    raceId: s.race_id ?? 0,
    name: s.name ?? '',
    shortName: s.short_name ?? '',
    sessionType: (s.session_type ?? 'race') as Session['sessionType'],
    dayOfWeek: (s.day_of_week ?? 'Sunday') as Session['dayOfWeek'],
    startTime: s.start_time ?? '',
    endTime: s.end_time ?? '',
    seriesKey: s.series_key ?? null,
    seriesLabel: s.series_label ?? null,
  };
}

export const getRacesBySeries = cache(async (series: RaceSeries): Promise<Race[]> => {
  const { getTableColumns } = await import('drizzle-orm');
  const raceRows = await db
    .select({
      ...getTableColumns(races),
      expCount: sql<number>`(SELECT COUNT(*) FROM experiences WHERE experiences.race_id = races.id)`.mapWith(Number),
    })
    .from(races)
    .where(eq(races.series, series))
    .orderBy(asc(races.race_date));

  return raceRows.map((row) => {
    const { expCount, ...raceData } = row;
    return mapRace(raceData as typeof races.$inferSelect, expCount);
  });
});

export const getRaceBySlug = cache(async (slug: string, series?: RaceSeries): Promise<Race | null> => {
  const conditions = series
    ? and(eq(races.slug, slug), eq(races.series, series))
    : eq(races.slug, slug);
  const [row] = await db.select().from(races).where(conditions).limit(1);
  return row ? mapRace(row) : null;
});

export const getRaceById = cache(async (id: number): Promise<Race | null> => {
  const [row] = await db.select().from(races).where(eq(races.id, id)).limit(1);
  return row ? mapRace(row) : null;
});

export const getRaceWithSessions = cache(async (slug: string): Promise<{ race: Race; sessions: Session[] } | null> => {
  const race = await getRaceBySlug(slug);
  if (!race) return null;
  const sessionRows = await db
    .select()
    .from(sessions)
    .where(eq(sessions.race_id, race.id))
    .orderBy(asc(sessions.day_of_week), asc(sessions.start_time));
  return { race, sessions: sessionRows.map(mapSession) };
});

export const getActiveRaceBySeries = cache(async (series: RaceSeries): Promise<Race | null> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [row] = await db
    .select()
    .from(races)
    .where(and(eq(races.series, series), gte(races.race_date, today)))
    .orderBy(asc(races.race_date))
    .limit(1);
  return row ? mapRace(row) : null;
});

export const getRaceContent = cache(async (raceId: number): Promise<RaceContent | null> => {
  const [row] = await db
    .select()
    .from(race_content)
    .where(eq(race_content.race_id, raceId))
    .limit(1);
  if (!row) return null;
  return {
    id: row.id,
    raceId: row.race_id,
    pageTitle: row.page_title ?? null,
    pageDescription: row.page_description ?? null,
    pageKeywords: (row.page_keywords as string[] | null) ?? null,
    guideIntro: row.guide_intro ?? null,
    tipsContent: row.tips_content ?? null,
    faqItems: ((row.faq_items as Array<{ question?: string; answer?: string; q?: string; a?: string }> | null) ?? [])
      .map(item => ({ question: item.question ?? item.q ?? '', answer: item.answer ?? item.a ?? '' }))
      .filter(item => item.question && !item.question.startsWith('What is F1 Weekend')),
    faqLd: row.faq_ld ?? null,
    circuitFacts: row.circuit_facts ?? null,
    circuitMapSrc: row.circuit_map_src ?? null,
    gettingThere: row.getting_there ?? null,

    whereToStay: row.where_to_stay ?? null,
    heroTitle: row.hero_title ?? null,
    heroSubtitle: row.hero_subtitle ?? null,
    whyCityText: row.why_city_text ?? null,
    highlightsList: (row.highlights_list as string[] | null) ?? null,
    gettingThereIntro: row.getting_there_intro ?? null,
    transportOptions: (row.transport_options as Array<{ icon: string; title: string; desc: string }> | null) ?? null,
    travelTips: (row.travel_tips as Array<{ heading: string; body: string }> | null) ?? null,
    cityGuide: row.city_guide ?? null,
    currency: row.currency ?? null,
  };
});

export const getNearbyRaces = cache(async (currentRaceId: number, series: RaceSeries, raceDate: string, limit = 4): Promise<Race[]> => {
  const allRaces = await getRacesBySeries(series);
  // Sort by proximity to current race date, exclude current race
  return allRaces
    .filter(r => r.id !== currentRaceId)
    .sort((a, b) => {
      const diffA = Math.abs(new Date(a.raceDate).getTime() - new Date(raceDate).getTime());
      const diffB = Math.abs(new Date(b.raceDate).getTime() - new Date(raceDate).getTime());
      return diffA - diffB;
    })
    .slice(0, limit);
});

export const getSessionsByRace = cache(async (raceId: number): Promise<Session[]> => {
  const rows = await db
    .select()
    .from(sessions)
    .where(eq(sessions.race_id, raceId))
    .orderBy(asc(sessions.day_of_week), asc(sessions.start_time));
  return rows.map(mapSession);
});
