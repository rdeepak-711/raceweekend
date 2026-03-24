import { NextRequest, NextResponse } from 'next/server';
import { getItinerary } from '@/services/itinerary.service';
import { getRaceById, getSessionsByRace } from '@/services/race.service';
import { getExperiencesByIds } from '@/services/experience.service';
import * as ics from 'ics';
import { SITE_URL } from '@/lib/constants/site';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const itinerary = await getItinerary(id);
  if (!itinerary) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const race = await getRaceById(itinerary.raceId);
  if (!race) return NextResponse.json({ error: 'Race not found' }, { status: 404 });

  const [allSessions, allExperiences] = await Promise.all([
    getSessionsByRace(race.id),
    getExperiencesByIds(itinerary.experiencesSelected),
  ]);

  const selectedSessions = allSessions.filter(s => itinerary.sessionsSelected.includes(s.id));

  const events: ics.EventAttributes[] = [];
  const seriesPath = race.series === 'motogp' ? 'motogp' : 'f1';
  const sessionSeriesLabel = race.series === 'motogp' ? 'MotoGP' : 'Formula 1';
  const days = { Thursday: -3, Friday: -2, Saturday: -1, Sunday: 0 } as const;

  // Add Sessions
  selectedSessions.forEach(s => {
    const raceDate = new Date(race.raceDate);
    const dayOffset = days[s.dayOfWeek] ?? 0;
    const sessionDate = new Date(raceDate);
    sessionDate.setDate(sessionDate.getDate() + dayOffset);

    const [startH, startM] = (s.startTime || '00:00:00').split(':').map(Number);
    const [endH, endM] = (s.endTime || '00:00:00').split(':').map(Number);
    if ([startH, startM, endH, endM].some(Number.isNaN)) return;

    events.push({
      start: [sessionDate.getFullYear(), sessionDate.getMonth() + 1, sessionDate.getDate(), startH, startM],
      end: [sessionDate.getFullYear(), sessionDate.getMonth() + 1, sessionDate.getDate(), endH, endM],
      title: `${race.city} GP: ${s.name}`,
      description: `${sessionSeriesLabel} session at ${race.circuitName}. Track strategy deployed via Race Weekend.`,
      location: race.circuitName || race.city,
      url: `${SITE_URL}/${seriesPath}/${race.slug}`,
      categories: ['Race Session', race.series.toUpperCase()],
      status: 'CONFIRMED',
      busyStatus: 'BUSY'
    });
  });

  // Add Experiences as all-day events on race weekend
  allExperiences.forEach(exp => {
    if (!exp.slug) return;
    const raceDate = new Date(race.raceDate);
    events.push({
      start: [raceDate.getFullYear(), raceDate.getMonth() + 1, raceDate.getDate(), 0, 0],
      duration: { hours: 24 },
      title: `Experience: ${exp.title}`,
      description: `${exp.shortDescription ?? 'Curated local experience.'}\n\nBooked via Race Weekend: ${exp.affiliateUrl}`,
      location: exp.meetingPoint || race.city,
      url: `${SITE_URL}/${seriesPath}/${race.slug}/experiences/${exp.slug}`,
      categories: ['Local Experience'],
    });
  });

  const { error, value } = ics.createEvents(events);

  if (error) {
    return NextResponse.json({ error: 'Failed to generate calendar' }, { status: 500 });
  }

  return new NextResponse(value, {
    headers: {
      'Content-Type': 'text/calendar',
      'Content-Disposition': `attachment; filename="${race.slug}-itinerary.ics"`,
    },
  });
}
