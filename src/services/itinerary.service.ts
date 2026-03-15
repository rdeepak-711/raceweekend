import { db } from '@/lib/db';
import { itineraries } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateId } from '@/lib/utils';
import type { Itinerary, CreateItineraryInput } from '@/types/itinerary';

function mapItinerary(row: typeof itineraries.$inferSelect): Itinerary {
  return {
    id: row.id,
    raceId: row.race_id ?? 0,
    sessionsSelected: (row.sessions_selected as number[] | null) ?? [],
    experiencesSelected: (row.experiences_selected as number[] | null) ?? [],
    itineraryJson: row.itinerary_json ?? null,
    groupSize: row.group_size ?? 1,
    notes: row.notes ?? null,
    viewCount: row.view_count ?? 0,
    createdAt: row.created_at ?? new Date(),
  };
}

export async function createItinerary(input: CreateItineraryInput): Promise<string> {
  const id = generateId();
  await db.insert(itineraries).values({
    id,
    race_id: input.raceId,
    sessions_selected: input.sessionsSelected,
    experiences_selected: input.experiencesSelected,
    notes: input.notes ?? null,
    group_size: input.groupSize ?? 1,
    view_count: 0,
  });
  return id;
}

export async function getItinerary(id: string): Promise<Itinerary | null> {
  const [row] = await db
    .select()
    .from(itineraries)
    .where(eq(itineraries.id, id))
    .limit(1);
  if (!row) return null;

  // Increment view count (fire-and-forget)
  db.update(itineraries)
    .set({ view_count: (row.view_count ?? 0) + 1 })
    .where(eq(itineraries.id, id))
    .catch((e) => console.error('[itinerary] view count increment failed:', e));

  return mapItinerary(row);
}
