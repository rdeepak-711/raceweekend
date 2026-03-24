import { db } from '@/lib/db';
import { races, sessions, race_content, experiences } from '@/lib/db/schema';
import { eq, gte, asc, and, sql } from 'drizzle-orm';
import type { Race, Session, RaceContent } from '@/types/race';
import type { RaceSeries } from '@/lib/constants/series';

function parseJsonField<T>(value: unknown): T | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') {
    try { return JSON.parse(value) as T; } catch { return null; }
  }
  return value as T;
}

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
    isCancelled: r.is_cancelled ?? false,
    officialTicketsUrl: r.official_tickets_url ?? null,
    officialEventUrl: r.official_event_url ?? null,
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

export async function getRacesBySeries(series: RaceSeries): Promise<Race[]> {
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
}

export async function getRaceBySlug(slug: string, series?: RaceSeries): Promise<Race | null> {
  const conditions = series
    ? and(eq(races.slug, slug), eq(races.series, series))
    : eq(races.slug, slug);
  const [row] = await db.select().from(races).where(conditions).limit(1);
  return row ? mapRace(row) : null;
}

export async function getRaceById(id: number): Promise<Race | null> {
  const [row] = await db.select().from(races).where(eq(races.id, id)).limit(1);
  return row ? mapRace(row) : null;
}

export async function getRaceWithSessions(slug: string): Promise<{ race: Race; sessions: Session[] } | null> {
  const race = await getRaceBySlug(slug);
  if (!race) return null;
  const sessionRows = await db
    .select()
    .from(sessions)
    .where(eq(sessions.race_id, race.id))
    .orderBy(asc(sessions.day_of_week), asc(sessions.start_time));
  return { race, sessions: sessionRows.map(mapSession) };
}

export async function getActiveRaceBySeries(series: RaceSeries): Promise<Race | null> {
  const [row] = await db
    .select()
    .from(races)
    .where(and(eq(races.series, series), eq(races.is_active, true), gte(races.race_date, sql`CURDATE()`)))
    .orderBy(asc(races.race_date))
    .limit(1);
  return row ? mapRace(row) : null;
}

export async function getRaceContent(raceId: number): Promise<RaceContent | null> {
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
    faqItems: (parseJsonField<Array<{ question?: string; answer?: string; q?: string; a?: string }>>(row.faq_items) ?? [])
      .map(item => ({ question: item.question ?? item.q ?? '', answer: item.answer ?? item.a ?? '' }))
      .filter(item => item.question && !item.question.startsWith('What is F1 Weekend')),
    faqLd: row.faq_ld ?? null,
    circuitFacts: parseJsonField(row.circuit_facts) ?? null,
    circuitMapSrc: row.circuit_map_src ?? null,
    gettingThere: row.getting_there ?? null,

    whereToStay: row.where_to_stay ?? null,
    heroTitle: row.hero_title ?? null,
    heroSubtitle: row.hero_subtitle ?? null,
    whyCityText: row.why_city_text ?? null,
    highlightsList: parseJsonField<string[]>(row.highlights_list) ?? null,
    gettingThereIntro: row.getting_there_intro ?? null,
    transportOptions: parseJsonField<Array<{ icon: string; title: string; desc: string }>>(row.transport_options) ?? null,
    travelTips: parseJsonField<Array<{ heading: string; body: string }>>(row.travel_tips) ?? null,
    cityGuide: row.city_guide ?? null,
    currency: row.currency ?? null,
  };
}

export async function getNearbyRaces(currentRaceId: number, series: RaceSeries, raceDate: string, limit = 4): Promise<Race[]> {
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
}

export async function getSessionsByRace(raceId: number): Promise<Session[]> {
  const rows = await db
    .select()
    .from(sessions)
    .where(eq(sessions.race_id, raceId))
    .orderBy(asc(sessions.day_of_week), asc(sessions.start_time));
  return rows.map(mapSession);
}
