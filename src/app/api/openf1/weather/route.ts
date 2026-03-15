import { NextRequest, NextResponse } from 'next/server';
import { getSessionWeather } from '@/lib/api/openf1';

export async function GET(req: NextRequest) {
  const sessionKey = req.nextUrl.searchParams.get('sessionKey');
  if (!sessionKey) return NextResponse.json({ error: 'sessionKey required' }, { status: 400 });

  try {
    const weather = await getSessionWeather(Number(sessionKey));
    // Get the latest reading
    const latest = weather[weather.length - 1] || null;
    return NextResponse.json({ data: latest });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch weather' }, { status: 500 });
  }
}
