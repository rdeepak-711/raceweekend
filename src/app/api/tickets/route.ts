import { NextRequest, NextResponse } from 'next/server';
import { getTicketsByRace } from '@/services/ticket.service';

export async function GET(req: NextRequest) {
  const raceId = req.nextUrl.searchParams.get('raceId');
  if (!raceId) {
    return NextResponse.json({ error: 'raceId required' }, { status: 400 });
  }

  const tickets = await getTicketsByRace(Number(raceId));
  return NextResponse.json({ data: tickets }, {
    headers: { 'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=86400' },
  });
}
