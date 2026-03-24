import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { experiences, tickets, affiliate_clicks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const TypeSchema = z.enum(['experience', 'ticket']);
const ExperienceIdSchema = z.coerce.number().int().positive();
const TicketIdSchema = z.coerce.bigint().refine((v) => v > BigInt(0));
const SourceSchema = z
  .enum(['feed', 'itinerary', 'featured', 'map', 'guide', 'ticket', 'hero', 'sidebar'])
  .catch('feed');

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  const rawParams = await params;
  const typeResult = TypeSchema.safeParse(rawParams.type);
  if (!typeResult.success) {
    return NextResponse.redirect(new URL('/', req.url));
  }
  const type = typeResult.data;
  const id = rawParams.id;
  const searchParams = req.nextUrl.searchParams;
  const source = SourceSchema.parse(searchParams.get('src') || 'feed');
  
  let targetUrl = '';
  let expId: number | null = null;

  try {
    if (type === 'experience') {
      const expIdResult = ExperienceIdSchema.safeParse(id);
      if (!expIdResult.success) {
        return NextResponse.redirect(new URL('/', req.url));
      }
      expId = expIdResult.data;
      const [exp] = await db.select().from(experiences).where(eq(experiences.id, expId)).limit(1);
      if (exp?.affiliate_url) targetUrl = exp.affiliate_url;
    } else {
      const ticketIdResult = TicketIdSchema.safeParse(id);
      if (!ticketIdResult.success) {
        return NextResponse.redirect(new URL('/', req.url));
      }
      const [tix] = await db.select().from(tickets).where(eq(tickets.id, ticketIdResult.data)).limit(1);
      if (tix?.ticket_url) targetUrl = tix.ticket_url;
    }

    if (!targetUrl) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Server-side track click (non-blocking)
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const referer = req.headers.get('referer') || 'direct';
    
    db.insert(affiliate_clicks).values({
      experience_id: expId,
      source,
      user_agent: userAgent.slice(0, 500),
      referer: referer.slice(0, 1000),
    }).catch(e => console.error('[affiliate] click tracking failed:', e));

    const redirect = NextResponse.redirect(targetUrl);
    redirect.headers.set('X-Robots-Tag', 'noindex');
    return redirect;
  } catch (e) {
    console.error('[affiliate] redirect error:', e);
    return NextResponse.redirect(new URL('/', req.url));
  }
}
