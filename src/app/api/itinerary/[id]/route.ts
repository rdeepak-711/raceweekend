import { NextRequest, NextResponse } from 'next/server';
import { getItinerary } from '@/services/itinerary.service';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const itinerary = await getItinerary(id);
  if (!itinerary) {
    return NextResponse.json({ error: 'Itinerary not found' }, { status: 404 });
  }
  return NextResponse.json(itinerary);
}
