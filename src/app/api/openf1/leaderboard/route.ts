import { NextRequest, NextResponse } from 'next/server';
import { getSessionPositions, getSessionDrivers } from '@/lib/api/openf1';

export async function GET(req: NextRequest) {
  const sessionKey = req.nextUrl.searchParams.get('sessionKey');
  if (!sessionKey) return NextResponse.json({ error: 'sessionKey required' }, { status: 400 });

  try {
    const key = Number(sessionKey);
    if (isNaN(key)) return NextResponse.json({ error: 'invalid sessionKey' }, { status: 400 });
    const [positions, drivers] = await Promise.all([
      getSessionPositions(key),
      getSessionDrivers(key),
    ]);

    // Map positions to driver details
    const leaderboard = positions.map(p => {
      const driver = drivers.find(d => d.driver_number === p.driver_number);
      return {
        position: p.position,
        driverNumber: p.driver_number,
        fullName: driver?.full_name || 'Unknown',
        nameAcronym: driver?.name_acronym || 'UNK',
        teamName: driver?.team_name || 'Independent',
        teamColour: driver?.team_colour ? `#${driver.team_colour}` : '#666666',
        headshotUrl: driver?.headshot_url,
      };
    }).sort((a, b) => a.position - b.position);

    return NextResponse.json({ data: leaderboard }, {
      headers: { 'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30' },
    });
  } catch (e) {
    console.error('Leaderboard API error:', e);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
