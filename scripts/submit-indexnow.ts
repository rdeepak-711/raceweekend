/**
 * Submit all site URLs to IndexNow for fast search engine indexing.
 *
 * Setup (one-time):
 *   1. Generate a key at https://www.indexnow.org/
 *   2. Create public/{key}.txt containing just the key string
 *   3. Add INDEXNOW_KEY=<key> to ~/.gdrive-excluded/raceweekend/.env.local
 *
 * Run: npx tsx scripts/submit-indexnow.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { db } from '../src/lib/db';
import { experiences } from '../src/lib/db/schema';
import { getRacesBySeries } from '../src/services/race.service';
import { SITE_URL } from '../src/lib/constants/site';

const KEY = process.env.INDEXNOW_KEY;
const HOST = 'raceweekend.co';

if (!KEY) {
  console.error('INDEXNOW_KEY is not set in .env.local');
  process.exit(1);
}

async function collectUrls(): Promise<string[]> {
  const [f1, moto] = await Promise.all([
    getRacesBySeries('f1'),
    getRacesBySeries('motogp'),
  ]);

  const urls: string[] = [
    SITE_URL + '/',
    SITE_URL + '/f1',
    SITE_URL + '/motogp',
  ];

  const raceMap = new Map<number, { slug: string; series: string }>();

  for (const { races, series } of [
    { races: f1, series: 'f1' },
    { races: moto, series: 'motogp' },
  ]) {
    for (const race of races) {
      raceMap.set(race.id, { slug: race.slug, series });
      urls.push(`${SITE_URL}/${series}/${race.slug}`);
      urls.push(`${SITE_URL}/${series}/${race.slug}/experiences`);
      urls.push(`${SITE_URL}/${series}/${race.slug}/guide`);
    }
  }

  const allExps = await db
    .select({ slug: experiences.slug, raceId: experiences.race_id })
    .from(experiences);

  for (const exp of allExps) {
    const info = exp.raceId ? raceMap.get(exp.raceId) : null;
    if (info && exp.slug) {
      urls.push(`${SITE_URL}/${info.series}/${info.slug}/experiences/${exp.slug}`);
    }
  }

  return urls;
}

async function submitBatch(urlList: string[]) {
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: `https://${HOST}/${KEY}.txt`,
      urlList,
    }),
  });
  console.log(`Submitted ${urlList.length} URLs → HTTP ${res.status}`);
}

async function main() {
  const urls = await collectUrls();
  console.log(`Total URLs to submit: ${urls.length}`);
  for (let i = 0; i < urls.length; i += 10000) {
    await submitBatch(urls.slice(i, i + 10000));
  }
}

main().catch(console.error).finally(() => process.exit(0));
