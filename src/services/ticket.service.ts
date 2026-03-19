import { db } from '@/lib/db';
import { tickets, races } from '@/lib/db/schema';
import { eq, and, gte } from 'drizzle-orm';
import { searchTMEvents } from '@/lib/api/ticketmaster';
import { buildTicketmasterUrl } from '@/lib/affiliates';
import type { Ticket } from '@/types/ticket';
import { connection } from 'next/server';

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

function mapTicket(row: typeof tickets.$inferSelect, raceSlug: string): Ticket {
  return {
    id: row.id,
    raceId: row.race_id ?? 0,
    ticketmasterEventId: row.tm_event_id ?? null,
    title: row.title ?? null,
    category: row.category ?? null,
    priceMin: row.price_min ? Number(row.price_min) : null,
    priceMax: row.price_max ? Number(row.price_max) : null,
    currency: row.currency ?? null,
    quantityAvailable: row.quantity_available ?? null,
    ticketUrl: row.ticket_url ? buildTicketmasterUrl(row.ticket_url, raceSlug) : null,
    ticketSource: row.ticket_source ?? 'ticketmaster',
    section: row.section ?? null,
    row: row.row ?? null,
    zone: row.zone ?? null,
    imageUrl: row.image_url ?? null,
    lastSyncedAt: row.last_synced_at ?? null,
  };
}

export async function getTicketsByRace(raceId: number): Promise<Ticket[]> {
  await connection();
  // Get race info for slug (needed for URL building)
  const [raceRow] = await db.select().from(races).where(eq(races.id, raceId)).limit(1);
  if (!raceRow) return [];

  const cutoff = new Date(Date.now() - CACHE_TTL_MS);
  const raceSlug = raceRow.slug ?? '';

  // Check cache
  const cached = await db
    .select()
    .from(tickets)
    .where(and(eq(tickets.race_id, raceId), gte(tickets.last_synced_at, cutoff)));

  if (cached.length > 0) return cached.map(row => mapTicket(row, raceSlug));

  // Cache miss — fetch from Ticketmaster
  try {
    const seriesLabel = raceRow.series === 'motogp' ? 'MotoGP' : 'Formula 1';
    const query = `${seriesLabel} ${raceRow.city} ${raceRow.season}`;
    const events = await searchTMEvents(query);

    if (events.length > 0) {
      // Clear old records for this race
      await db.delete(tickets).where(eq(tickets.race_id, raceId));

      // Insert fresh records
      const freshValues = events.map(event => {
        const priceInfo = event.priceRanges?.[0];
        return {
          race_id: raceId,
          tm_event_id: event.id,
          stubhub_event_id: null,
          title: event.name,
          category: event.classifications?.[0]?.segment?.name ?? 'Sports',
          price_min: priceInfo ? String(priceInfo.min) : null,
          price_max: priceInfo ? String(priceInfo.max) : null,
          currency: priceInfo?.currency ?? 'USD',
          quantity_available: null, // TM Discovery doesn't provide this
          ticket_url: event.url,
          ticket_source: 'ticketmaster',
          section: null,
          row: null,
          zone: null,
          last_synced_at: new Date(),
        };
      });

      await db.insert(tickets).values(freshValues);

      const fresh = await db.select().from(tickets).where(eq(tickets.race_id, raceId));
      return fresh.map(row => mapTicket(row, raceSlug));
    }
  } catch (err) {
    console.error('getTicketsByRace failed:', err);
  }

  return [];
}
