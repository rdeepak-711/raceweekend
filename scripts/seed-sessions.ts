/**
 * Seed script: copies sessions from pitlane.schedule_entries to raceweekend.sessions.
 */
import mysql from 'mysql2/promise';
import 'dotenv/config';

async function main() {
  const config = {
    host: process.env.DATABASE_HOST || 'localhost',
    port: Number(process.env.DATABASE_PORT) || 3306,
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '12345678',
  };

  const conn = await mysql.createConnection(config);

  console.log('🚀 Starting cross-DB session seed...');

  // 1. Get raceweekend races to match by city
  const [rwRaces] = await conn.execute('SELECT id, city, slug FROM raceweekend.races');
  const cityToIdMap: Record<string, number> = {};
  (rwRaces as any[]).forEach(r => {
    cityToIdMap[r.city.toLowerCase()] = r.id;
  });

  // 2. Get schedule entries from pitlane
  // We join with pitlane.races to get the city for matching
  const [entries] = await conn.execute(`
    SELECT se.*, r.city as pitlane_city 
    FROM pitlane.schedule_entries se 
    JOIN pitlane.races r ON se.race_id = r.id
  `);

  console.log(`📊 Found ${(entries as any[]).length} entries in pitlane.schedule_entries`);

  let seededCount = 0;
  let skippedCount = 0;

  for (const entry of (entries as any[])) {
    const rwRaceId = cityToIdMap[entry.pitlane_city.toLowerCase()];
    if (!rwRaceId) {
      skippedCount++;
      continue;
    }

    const { shortName, sessionType } = mapSessionInfo(entry.title, entry.series_key);

    await conn.execute(`
      INSERT INTO raceweekend.sessions 
        (race_id, name, short_name, day_of_week, start_time, end_time, session_type, series_key, series_label)
      VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        end_time = VALUES(end_time),
        session_type = VALUES(session_type),
        series_key = VALUES(series_key),
        series_label = VALUES(series_label)
    `, [
      rwRaceId, 
      entry.title, 
      shortName, 
      entry.day_of_week, 
      entry.start_time, 
      entry.end_time, 
      sessionType, 
      entry.series_key, 
      entry.series || entry.series_key // series_label
    ]);

    seededCount++;
  }

  console.log(`✅ Seeding complete.`);
  console.log(`   - Seeded/Updated: ${seededCount}`);
  console.log(`   - Skipped (no city match): ${skippedCount}`);

  await conn.end();
}

function mapSessionInfo(title: string, seriesKey: string | null): { shortName: string, sessionType: string } {
  let shortName = title.slice(0, 8);
  let sessionType = 'event';

  if (seriesKey === 'f1') {
    if (title.includes('Free Practice 1')) { shortName = 'FP1'; sessionType = 'fp1'; }
    else if (title.includes('Free Practice 2')) { shortName = 'FP2'; sessionType = 'fp2'; }
    else if (title.includes('Free Practice 3')) { shortName = 'FP3'; sessionType = 'fp3'; }
    else if (title.includes('Sprint Qualifying') || title.includes('Sprint Shootout')) { shortName = 'SQ'; sessionType = 'qualifying'; }
    else if (title.includes('Qualifying')) { shortName = 'Q'; sessionType = 'qualifying'; }
    else if (title.includes('Sprint')) { shortName = 'SPR'; sessionType = 'sprint'; }
    else if (title.includes('Race')) { shortName = 'Race'; sessionType = 'race'; }
    else { shortName = title.slice(0, 8); sessionType = 'event'; }
  } 
  else if (seriesKey === 'f2' || seriesKey === 'f3') {
    const abbreviatedTitle = title.replace('Practice', 'Prac').replace('Qualifying', 'Qual').replace('Sprint Race', 'Sprint').replace('Feature Race', 'Feature');
    shortName = `${seriesKey.toUpperCase()} ${abbreviatedTitle.split(' ').pop()}`;
    sessionType = 'support';
  }
  else if (seriesKey === 'porsche' || seriesKey === 'supercars') {
    shortName = title.replace('Practice', 'P').replace('Qualifying', 'Q').replace('Race', 'R');
    if (shortName.length > 8) shortName = shortName.slice(0, 8);
    sessionType = 'support';
  }
  else {
    shortName = title.slice(0, 8);
    sessionType = 'event';
  }

  return { shortName, sessionType };
}

main().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
