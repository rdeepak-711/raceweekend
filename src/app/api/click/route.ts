import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { affiliate_clicks, experiences } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { buildGYGAffiliateUrl } from '@/lib/affiliates';
import { z } from 'zod';

const ClickSchema = z.object({
  experienceId: z.number().int().positive(),
  source: z
    .enum(['feed', 'itinerary', 'featured', 'map', 'guide', 'ticket', 'hero', 'sidebar'])
    .optional(),
  sessionId: z.string().max(255).optional(),
  itineraryId: z.string().max(12).nullable().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const parsed = ClickSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    const { experienceId, source, sessionId, itineraryId } = parsed.data;

    // Fetch the experience to get affiliate URL
    const [exp] = await db.select().from(experiences).where(eq(experiences.id, experienceId)).limit(1);
    if (!exp) {
      return NextResponse.json({ error: 'Experience not found' }, { status: 404 });
    }

    const affiliateUrl = exp.affiliate_url
      ? buildGYGAffiliateUrl(exp.affiliate_url, { utmContent: String(experienceId) })
      : null;

    // Log the click (fire-and-forget)
    db.insert(affiliate_clicks).values({
      experience_id: experienceId,
      itinerary_id: itineraryId ?? null,
      source: source ?? 'feed',
      session_id: sessionId ?? null,
      user_agent: req.headers.get('user-agent') ?? null,
      referer: req.headers.get('referer') ?? null,
    }).catch((e) => console.error('[click] affiliate click insert failed:', e));

    return NextResponse.json({ affiliateUrl });
  } catch {
    return NextResponse.json({ error: 'Failed to log click' }, { status: 500 });
  }
}
