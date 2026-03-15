import { db } from '@/lib/db';
import { races, experiences } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import type { RaceSeries } from '@/lib/constants/series';

export async function getRaceStaticParams(series: RaceSeries) {
  const rows = await db
    .select({ slug: races.slug })
    .from(races)
    .where(eq(races.series, series));
  return rows.filter(r => r.slug).map(r => ({ raceSlug: r.slug! }));
}

export async function getExperienceStaticParams(series: RaceSeries) {
  // Single JOIN query instead of N+1 sequential queries
  const rows = await db
    .select({
      raceSlug: races.slug,
      expSlug: experiences.slug,
    })
    .from(experiences)
    .innerJoin(races, and(eq(experiences.race_id, races.id), eq(races.series, series)));

  return rows
    .filter(r => r.raceSlug && r.expSlug)
    .map(r => ({ raceSlug: r.raceSlug!, slug: r.expSlug! }));
}
