/**
 * Seed script: creates empty race_content rows for all races.
 * Run: npm run seed:content
 */

import 'dotenv/config';
import mysql from 'mysql2/promise';

async function main() {
  let conn;
  const dbUrl = process.env.DATABASE_URL;

  if (dbUrl) {
    try {
      const url = new URL(dbUrl);
      conn = await mysql.createConnection({
        host: url.hostname,
        port: Number(url.port) || 3306,
        user: url.username,
        password: decodeURIComponent(url.password),
        database: url.pathname.substring(1),
        ssl: url.searchParams.has('ssl') ? { rejectUnauthorized: false } : undefined,
      });
    } catch (e) {
      console.error('[db] Failed to parse DATABASE_URL', e);
      process.exit(1);
    }
  } else {
    conn = await mysql.createConnection({
      host: process.env.DATABASE_HOST ?? 'localhost',
      port: Number(process.env.DATABASE_PORT) || 3306,
      user: process.env.DATABASE_USER ?? 'root',
      password: process.env.DATABASE_PASSWORD ?? '',
      database: process.env.DATABASE_NAME ?? 'raceweekend',
    });
  }

  const [rows] = await conn.execute('SELECT id, name FROM races') as any;

  let inserted = 0;
  for (const race of rows) {
    await conn.execute(
      `INSERT IGNORE INTO race_content (race_id, page_title, page_description) VALUES (?, ?, ?)`,
      [race.id, `${race.name} Travel Guide`, `Your complete travel guide for ${race.name}. Experiences, schedule, tickets, and more.`]
    );
    inserted++;
  }

  await conn.end();
  console.log(`✅ Seeded race_content for ${inserted} races.`);
}

main().catch(err => { console.error(err); process.exit(1); });
