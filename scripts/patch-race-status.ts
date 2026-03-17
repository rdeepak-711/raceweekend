/**
 * Patch race status: mark Bahrain + Saudi as cancelled, set official ticket URLs for Japan + Canada.
 * Run: npx tsx scripts/patch-race-status.ts
 */

import { db } from '@/lib/db';
import { races } from '@/lib/db/schema';
import { inArray, eq } from 'drizzle-orm';

async function main() {
  // Mark called-off races
  const cancelledSlugs = ['bahrain-f1-2026', 'saudi-arabia-f1-2026'];
  const cancelResult = await db
    .update(races)
    .set({ is_cancelled: true })
    .where(inArray(races.slug, cancelledSlugs));
  console.log(`Marked ${cancelledSlugs.join(', ')} as cancelled`);

  // Set official ticket URLs
  await db
    .update(races)
    .set({ official_tickets_url: 'https://tickets.formula1.com/en/f1-3309-japan' })
    .where(eq(races.slug, 'japan-f1-2026'));
  console.log('Set official tickets URL for suzuka-f1-2026');

  await db
    .update(races)
    .set({ official_tickets_url: 'https://tickets.formula1.com/en/f1-3215-canada' })
    .where(eq(races.slug, 'canada-f1-2026'));
  console.log('Set official tickets URL for canada-f1-2026');

  console.log('Done.');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
