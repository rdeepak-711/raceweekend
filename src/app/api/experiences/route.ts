import { NextRequest, NextResponse } from 'next/server';
import { getRaceBySlug } from '@/services/race.service';
import { getExperiencesByRace } from '@/services/experience.service';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const raceSlug = searchParams.get('race');
  const category = searchParams.get('category') ?? undefined;
  const partner = searchParams.get('partner') ?? undefined;
  const sort = searchParams.get('sort') ?? undefined;
  const windowSlug = searchParams.get('window') ?? undefined;

  if (!raceSlug) {
    return NextResponse.json({ error: 'race param required' }, { status: 400 });
  }

  const race = await getRaceBySlug(raceSlug);
  if (!race) {
    return NextResponse.json({ data: [] });
  }

  const experiences = await getExperiencesByRace(race.id, {
    category: category as 'food' | 'culture' | 'adventure' | 'daytrip' | 'nightlife' | undefined,
    affiliatePartner: partner as 'getyourguide' | 'ticketmaster' | undefined,
    sort: sort as 'popular' | 'price-low' | 'price-high' | 'duration-short' | 'rating' | undefined,
    windowSlug,
  });

  return NextResponse.json({ data: experiences }, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  });
}
