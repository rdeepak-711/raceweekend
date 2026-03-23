import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { experiences, tickets, affiliate_clicks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  const { type, id } = await params;
  const searchParams = req.nextUrl.searchParams;
  const source = searchParams.get('src') || 'feed';
  
  let targetUrl = '';
  let expId: number | null = null;

  try {
    if (type === 'experience') {
      expId = Number(id);
      const [exp] = await db.select().from(experiences).where(eq(experiences.id, expId)).limit(1);
      if (exp?.affiliate_url) targetUrl = exp.affiliate_url;
    } else if (type === 'ticket') {
      const [tix] = await db.select().from(tickets).where(eq(tickets.id, BigInt(id))).limit(1);
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
      source: source as any,
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
