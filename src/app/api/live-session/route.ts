import { NextResponse } from 'next/server';
import { getF1Meetings, getF1Sessions } from '@/lib/api/openf1';

export interface LiveSessionData {
  status: 'live' | 'upcoming' | 'none';
  sessionName?: string;
  raceCity?: string;
  minutesUntil?: number;
  sessionKey?: number;
}

export async function GET(): Promise<NextResponse<LiveSessionData>> {
  try {
    const meetings = await getF1Meetings(2026);
    if (!meetings.length) return NextResponse.json({ status: 'none' });

    const now = new Date();

    // Fetch sessions for all meetings in parallel (limit to ±30 days)
    const nearMeetings = meetings.filter(m => {
      const start = new Date(m.date_start);
      const diffDays = (start.getTime() - now.getTime()) / 86_400_000;
      return diffDays > -7 && diffDays < 30;
    });

    const sessionArrays = await Promise.all(
      nearMeetings.map(m => getF1Sessions(m.meeting_key).catch(() => []))
    );
    const allSessions = sessionArrays.flat();

    // Prioritize sessions (higher index = lower priority)
    const priority = ['race', 'qualifying', 'sprint', 'fp3', 'fp2', 'fp1'];

    // Find all currently live sessions
    const activeSessions = allSessions.filter(s => {
      const start = new Date(s.date_start);
      const end = new Date(s.date_end);
      return start <= now && now <= end;
    });

    if (activeSessions.length > 0) {
      // Pick the highest priority one
      const sortedActive = activeSessions.sort((a, b) => {
        const pA = priority.indexOf(a.session_name.toLowerCase());
        const pB = priority.indexOf(b.session_name.toLowerCase());
        return (pA === -1 ? 99 : pA) - (pB === -1 ? 99 : pB);
      });

      const s = sortedActive[0];
      return NextResponse.json({
        status: 'live',
        sessionName: s.session_name,
        raceCity: s.location,
        sessionKey: s.session_key,
      });
    }

    // Find next upcoming session
    const upcoming = allSessions
      .filter(s => new Date(s.date_start) > now)
      .sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime())[0];

    if (upcoming) {
      const minutesUntil = Math.round((new Date(upcoming.date_start).getTime() - now.getTime()) / 60_000);
      return NextResponse.json({
        status: 'upcoming',
        sessionName: upcoming.session_name,
        raceCity: upcoming.location,
        minutesUntil,
        sessionKey: upcoming.session_key,
      });
    }

    return NextResponse.json({ status: 'none' });
  } catch {
    return NextResponse.json({ status: 'none' });
  }
}
