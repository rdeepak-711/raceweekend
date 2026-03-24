import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getTicketsByRace } from '@/services/ticket.service';

const RaceIdSchema = z.coerce.number().int().positive();

export async function GET(req: NextRequest) {
  const raceIdRaw = req.nextUrl.searchParams.get('raceId');
  if (!raceIdRaw) {
    return NextResponse.json({ error: 'raceId required' }, { status: 400 });
  }
  const parsedRaceId = RaceIdSchema.safeParse(raceIdRaw);
  if (!parsedRaceId.success) {
    return NextResponse.json({ error: 'raceId must be a positive integer' }, { status: 400 });
  }

  const tickets = await getTicketsByRace(parsedRaceId.data);
  return NextResponse.json({ data: tickets }, {
    headers: { 'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=86400' },
  });
}
