import { NextRequest, NextResponse } from 'next/server';
import { getItinerary } from '@/services/itinerary.service';
import { getRaceById, getSessionsByRace } from '@/services/race.service';
import { getExperiencesByIds } from '@/services/experience.service';
import * as ics from 'ics';

export async function GET(
  req: NextRequest,
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

  // Add Sessions
  selectedSessions.forEach(s => {
    const raceDate = new Date(race.raceDate);
    // Find the correct date based on dayOfWeek
    const days = { 'Thursday': -3, 'Friday': -2, 'Saturday': -1, 'Sunday': 0 };
    const dayOffset = (days as any)[s.dayOfWeek || 'Sunday'];
    const sessionDate = new Date(raceDate);
    sessionDate.setDate(sessionDate.getDate() + dayOffset);

    const [startH, startM] = (s.startTime || '00:00:00').split(':').map(Number);
    const [endH, endM] = (s.endTime || '00:00:00').split(':').map(Number);

    events.push({
      start: [sessionDate.getFullYear(), sessionDate.getMonth() + 1, sessionDate.getDate(), startH, startM],
      end: [sessionDate.getFullYear(), sessionDate.getMonth() + 1, sessionDate.getDate(), endH, endM],
      title: `${race.city} GP: ${s.name}`,
      description: `Formula 1 Session at ${race.circuitName}. Track strategy deployed via Race Weekend.`,
      location: race.circuitName || race.city,
      url: `https://raceweekend.app/f1/${race.slug}`,
      categories: ['Race Session', race.series.toUpperCase()],
      status: 'CONFIRMED',
      busyStatus: 'BUSY'
    });
  });

  // Add Experiences as all-day events on race weekend
  allExperiences.forEach(exp => {
    const raceDate = new Date(race.raceDate);
    events.push({
      start: [raceDate.getFullYear(), raceDate.getMonth() + 1, raceDate.getDate(), 0, 0],
      duration: { hours: 24 },
      title: `Experience: ${exp.title}`,
      description: `${exp.shortDescription}\n\nBooked via Race Weekend: ${exp.affiliateUrl}`,
      location: exp.meetingPoint || race.city,
      url: `https://raceweekend.app/experiences/${exp.slug}`,
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
