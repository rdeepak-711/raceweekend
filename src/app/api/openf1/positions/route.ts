import { NextRequest, NextResponse } from 'next/server';
import { getSessionPositions, getSessionDrivers } from '@/lib/api/openf1';

export interface PositionEntry {
  position: number;
  driverNumber: number;
  acronym: string;
  fullName: string;
  teamName: string;
  teamColour: string;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const sessionKey = req.nextUrl.searchParams.get('sessionKey');
  if (!sessionKey) {
    return NextResponse.json({ error: 'sessionKey required' }, { status: 400 });
  }

  const key = Number(sessionKey);
  if (isNaN(key)) {
    return NextResponse.json({ error: 'invalid sessionKey' }, { status: 400 });
  }

  try {
    const [positions, drivers] = await Promise.all([
      getSessionPositions(key),
      getSessionDrivers(key),
    ]);

    // Get latest position per driver (last entry wins)
    const latestByDriver = new Map<number, number>();
    for (const p of positions) {
      latestByDriver.set(p.driver_number, p.position);
    }

    const driverMap = new Map(drivers.map(d => [d.driver_number, d]));

    const result: PositionEntry[] = [];
    for (const [driverNumber, position] of latestByDriver) {
      const driver = driverMap.get(driverNumber);
      if (!driver) continue;
      result.push({
        position,
        driverNumber,
        acronym: driver.name_acronym,
        fullName: driver.full_name,
        teamName: driver.team_name,
        teamColour: driver.team_colour ?? '#888888',
      });
    }

    result.sort((a, b) => a.position - b.position);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
