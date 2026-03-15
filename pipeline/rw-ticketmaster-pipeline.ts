/**
 * Unified Ticketmaster Pipeline for Raceweekend.
 * Fetches race tickets for active races that have experiences populated.
 *
 * Usage: DATABASE_NAME=raceweekend node --env-file=../.env --import=tsx/esm pipeline/rw-ticketmaster-pipeline.ts [--race=slug] [--json] [--all]
 */
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

const TM_API_KEY = process.env.TICKETMASTER_API_KEY;
const TM_AFFILIATE_ID = process.env.TICKETMASTER_AFFILIATE_ID || ''; // Optional Partner ID
const TM_BASE = 'https://app.ticketmaster.com/discovery/v2';

if (!TM_API_KEY) {
  console.error('❌ TICKETMASTER_API_KEY is not set in environment');
  process.exit(1);
}

// Ensure the affiliate ID is included if we want to monetize links
function buildTicketmasterUrl(url: string, raceSlug: string): string {
  const base = new URL(url);
  base.searchParams.set('utm_source', 'raceweekend');
  base.searchParams.set('utm_medium', 'affiliate');
  base.searchParams.set('utm_campaign', raceSlug);
  if (TM_AFFILIATE_ID) {
    base.searchParams.set('camefrom', TM_AFFILIATE_ID);
  }
  return base.toString();
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchEvents(params: Record<string, string>) {
  const url = new URL(`${TM_BASE}/events.json`);
  url.searchParams.set('apikey', TM_API_KEY!);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  try {
    const res = await fetch(url.toString());
    if (!res.ok) {
      console.warn(`TM API warning: ${res.status} ${res.statusText}`);
      return [];
    }
    const data = await res.json();
    return data._embedded?.events || [];
  } catch (err) {
    console.error(`Failed to fetch from Ticketmaster:`, err);
    return [];
  }
}

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: Number(process.env.DATABASE_PORT) || 3306,
    user: process.env.DATABASE_USER ?? 'root',
    password: process.env.DATABASE_PASSWORD ?? '',
    database: process.env.DATABASE_NAME ?? 'raceweekend',
  });

  const args = process.argv.slice(2);
  const targetRace = args.find(a => a.startsWith('--race='))?.split('=')[1];
  const processAll = args.includes('--all');
  const jsonOnly = args.includes('--json');
  const outputDir = path.join(process.cwd(), 'pipeline/output');

  if (jsonOnly && !fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Only select races that HAVE experiences populated
  let query = `
    SELECT DISTINCT r.id, r.slug, r.name, r.series, r.city, r.country_code, r.race_date, r.season 
    FROM races r
    INNER JOIN experiences e ON r.id = e.race_id
    WHERE r.is_active = 1
  `;
  let queryParams: any[] = [];

  if (targetRace) {
    query += ' AND r.slug = ?';
    queryParams.push(targetRace);
  } else if (!processAll) {
    query += ' AND r.race_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
  }
  
  query += ' ORDER BY r.race_date ASC';

  const [races] = await conn.execute<mysql.RowDataPacket[]>(query, queryParams);

  console.log(`🎫 Raceweekend Ticketmaster Pipeline (Tickets Only)`);
  console.log(`📅 Processing ${races.length} races with existing experiences...\n`);

  for (const race of races) {
    console.log(`🏎️  Processing ${race.slug} (${race.city}, ${race.country_code})`);

    const raceDate = new Date(race.race_date);
    const endDate = new Date(raceDate); endDate.setDate(endDate.getDate() + 2); // Monday

    // Broaden window to catch multi-day events
    const ticketStartDate = new Date(raceDate); ticketStartDate.setDate(ticketStartDate.getDate() - 7);
    const ticketStartDateTime = ticketStartDate.toISOString().split('.')[0] + 'Z';
    const endDateTime = endDate.toISOString().split('.')[0] + 'Z';

    const season = raceDate.getFullYear();
    const keyword = race.series === 'f1'
      ? `Formula 1 Grand Prix ${race.city} ${season}`
      : `MotoGP ${race.city} ${season}`;

    console.log(`   -> Searching for race tickets: "${keyword}"`);
    const raceEvents = await fetchEvents({
      keyword,
      startDateTime: ticketStartDateTime,
      endDateTime,
      countryCode: race.country_code,
      segmentId: 'KZFzniwnSyZfZ7v7nE', // Sports
      size: '10',
      sort: 'date,asc'
    });

    if (raceEvents.length > 0) {
      const ticketsToSave = [];
      for (const event of raceEvents) {
        const priceRange = event.priceRanges?.[0];
        
        ticketsToSave.push({
          race_id: race.id,
          tm_event_id: event.id,
          title: event.name,
          category: event.classifications?.[0]?.genre?.name || 'Sports',
          price_min: priceRange?.min || null,
          price_max: priceRange?.max || null,
          currency: priceRange?.currency || null,
          ticket_url: buildTicketmasterUrl(event.url, race.slug),
          ticket_source: 'ticketmaster'
        });
      }

      if (jsonOnly) {
        fs.writeFileSync(
          path.join(outputDir, `${race.slug}-tickets.json`),
          JSON.stringify(ticketsToSave, null, 2)
        );
        console.log(`   📂 Saved ${ticketsToSave.length} race tickets to JSON.`);
      } else {
        await conn.execute('DELETE FROM tickets WHERE race_id = ? AND ticket_source = "ticketmaster"', [race.id]);
        for (const t of ticketsToSave) {
          await conn.execute(
            `INSERT INTO tickets (
              race_id, tm_event_id, title, category, price_min, price_max, currency, ticket_url, ticket_source, last_synced_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [t.race_id, t.tm_event_id, t.title, t.category, t.price_min, t.price_max, t.currency, t.ticket_url, t.ticket_source]
          );
        }
        console.log(`   ✅ Saved ${ticketsToSave.length} race tickets to DB.`);
      }
    } else {
      console.log(`   ⚠️ No race tickets found.`);
    }

    await sleep(500);
    console.log(`----------------------------------------`);
  }

  console.log(`🎉 Pipeline complete.`);
  await conn.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
