import { NextRequest, NextResponse } from 'next/server';
import { getCarTelemetry } from '@/lib/api/openf1';

export async function GET(req: NextRequest) {
  const sessionKey = req.nextUrl.searchParams.get('sessionKey');
  // Optional: driver number, default to 1 (Verstappen) or someone likely to have data
  const driverNumber = req.nextUrl.searchParams.get('driverNumber') || '1';

  if (!sessionKey) return NextResponse.json({ error: 'sessionKey required' }, { status: 400 });

  try {
    const telemetry = await getCarTelemetry(Number(sessionKey), Number(driverNumber));
    // Limit to latest 50 points for the chart
    const latest = telemetry.slice(-50);
    return NextResponse.json({ data: latest });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch telemetry' }, { status: 500 });
  }
}
