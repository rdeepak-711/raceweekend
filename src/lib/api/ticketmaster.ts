/**
 * Ticketmaster Discovery API client
 */

const TM_BASE = 'https://app.ticketmaster.com/discovery/v2';

export interface TMEvent {
  id: string;
  name: string;
  url: string;
  dates: {
    start: {
      dateTime: string;
      localDate: string;
      localTime: string;
    };
  };
  priceRanges?: Array<{
    type: string;
    currency: string;
    min: number;
    max: number;
  }>;
  classifications?: Array<{
    segment: { name: string };
    genre: { name: string };
  }>;
  _embedded?: {
    venues?: Array<{
      name: string;
      city: { name: string };
      country: { name: string };
    }>;
  };
}

export async function searchTMEvents(keyword: string): Promise<TMEvent[]> {
  const apiKey = process.env.TICKETMASTER_API_KEY;
  if (!apiKey) {
    console.error('TICKETMASTER_API_KEY is missing');
    return [];
  }

  const url = new URL(`${TM_BASE}/events.json`);
  url.searchParams.set('keyword', keyword);
  url.searchParams.set('apikey', apiKey);
  url.searchParams.set('classificationName', 'Sports');
  url.searchParams.set('size', '20');
  url.searchParams.set('sort', 'date,asc');

  try {
    const res = await fetch(url.toString());
    if (!res.ok) {
      console.error(`Ticketmaster API error: ${res.status} ${res.statusText}`);
      return [];
    }
    const data = await res.json();
    return data._embedded?.events || [];
  } catch (err) {
    console.error('Failed to fetch from Ticketmaster:', err);
    return [];
  }
}

export async function searchTMNearbyEvents(params: {
  city: string;
  countryCode: string;
  startDateTime: string; // ISO string
  endDateTime: string;   // ISO string
}): Promise<TMEvent[]> {
  const apiKey = process.env.TICKETMASTER_API_KEY;
  if (!apiKey) {
    console.error('TICKETMASTER_API_KEY is missing');
    return [];
  }

  const classifications = ['Music', 'Arts & Theatre'];
  const allEvents: TMEvent[] = [];

  for (const classification of classifications) {
    const url = new URL(`${TM_BASE}/events.json`);
    url.searchParams.set('apikey', apiKey);
    url.searchParams.set('city', params.city);
    url.searchParams.set('countryCode', params.countryCode);
    url.searchParams.set('startDateTime', params.startDateTime);
    url.searchParams.set('endDateTime', params.endDateTime);
    url.searchParams.set('classificationName', classification);
    url.searchParams.set('size', '20');
    url.searchParams.set('sort', 'date,asc');

    try {
      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        const events = data._embedded?.events || [];
        allEvents.push(...events);
      }
    } catch (err) {
      console.error(`Failed to fetch ${classification} from Ticketmaster:`, err);
    }
  }

  // Deduplicate by ID
  const seen = new Set<string>();
  const uniqueEvents = allEvents.filter(event => {
    if (seen.has(event.id)) return false;
    seen.add(event.id);
    return true;
  });

  return uniqueEvents.slice(0, 30);
}
