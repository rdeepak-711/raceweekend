const BASE_URL = 'https://www.thesportsdb.com/api/v1/json/3';
const MOTOGP_LEAGUE_ID = '4370';

export interface SportsDBEvent {
  idEvent: string;
  strEvent: string;
  strLeague: string;
  strSeason: string;
  strVenue: string | null;
  strCity: string | null;
  strCountry: string | null;
  dateEvent: string | null;
  strTime: string | null;
  strStatus: string | null;
  intHomeScore: string | null;
  intAwayScore: string | null;
  strThumb: string | null;
}

export interface SportsDBResult {
  idEvent: string;
  strEvent: string;
  dateEvent: string | null;
  strStatus: string | null;
  intHomeScore: string | null;
  intAwayScore: string | null;
  strVideo: string | null;
}

/** Shared race result type — compatible with both OpenF1 and TheSportsDB outputs */
export interface RaceResult {
  eventId: string;
  eventName: string;
  date: string | null;
  status: string | null;
  thumbUrl: string | null;
  venue: string | null;
  city: string | null;
}

async function sportsdbFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`TheSportsDB ${path}: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function getMotoGPSeasonEvents(season = 2026): Promise<SportsDBEvent[]> {
  try {
    const data = await sportsdbFetch<{ events: SportsDBEvent[] | null }>(
      `/eventsseason.php?id=${MOTOGP_LEAGUE_ID}&s=${season}`
    );
    return data.events ?? [];
  } catch {
    return [];
  }
}

export async function getMotoGPEventDetail(eventId: string): Promise<SportsDBEvent | null> {
  try {
    const data = await sportsdbFetch<{ events: SportsDBEvent[] | null }>(
      `/lookupevent.php?id=${eventId}`
    );
    return data.events?.[0] ?? null;
  } catch {
    return null;
  }
}

/** Convert a SportsDBEvent to the shared RaceResult type */
export function toRaceResult(event: SportsDBEvent): RaceResult {
  return {
    eventId: event.idEvent,
    eventName: event.strEvent,
    date: event.dateEvent,
    status: event.strStatus,
    thumbUrl: event.strThumb,
    venue: event.strVenue,
    city: event.strCity,
  };
}
