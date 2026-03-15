import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createItinerary } from '@/services/itinerary.service';

const CreateItinerarySchema = z.object({
  raceId: z.number().int().positive(),
  sessionsSelected: z.array(z.number().int().positive()).max(20).default([]),
  experiencesSelected: z.array(z.number().int().positive()).max(50).default([]),
  notes: z.string().max(1000).optional(),
  groupSize: z.number().int().min(1).max(100).default(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateItinerarySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { raceId, sessionsSelected, experiencesSelected, notes, groupSize } = parsed.data;

    const id = await createItinerary({
      raceId,
      sessionsSelected,
      experiencesSelected,
      notes,
      groupSize,
    });

    return NextResponse.json({ id, url: `/itinerary/${id}` });
  } catch {
    return NextResponse.json({ error: 'Failed to create itinerary' }, { status: 500 });
  }
}
