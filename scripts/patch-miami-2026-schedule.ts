import 'dotenv/config';
import mysql from 'mysql2/promise';

const DB = {
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: Number(process.env.DATABASE_PORT) || 3306,
  user: process.env.DATABASE_USER ?? 'root',
  password: process.env.DATABASE_PASSWORD ?? '',
  database: process.env.DATABASE_NAME ?? 'raceweekend',
};

const CANDIDATE_SLUGS = ['miami-f1-2026', 'miami-2026'] as const;
const TARGET_SLUG = 'miami-f1-2026';

async function main() {
  const conn = await mysql.createConnection(DB);

  const [rows] = await conn.execute<any[]>(
    `SELECT id, slug FROM races WHERE slug IN (?, ?) LIMIT 1`,
    [CANDIDATE_SLUGS[0], CANDIDATE_SLUGS[1]]
  );

  let raceId: number;

  if (rows.length > 0) {
    raceId = rows[0].id;
    await conn.execute(
      `UPDATE races
       SET slug = ?,
           name = ?,
           season = 2026,
           round = 6,
           circuit_name = ?,
           city = ?,
           country = ?,
           country_code = ?,
           circuit_lat = ?,
           circuit_lng = ?,
           timezone = ?,
           race_date = ?,
           flag_emoji = ?,
           series = 'f1',
           is_active = 1
       WHERE id = ?`,
      [
        TARGET_SLUG,
        'Formula 1 Crypto.com Miami Grand Prix 2026',
        'Miami International Autodrome',
        'Miami',
        'United States',
        'US',
        25.9581,
        -80.2389,
        'America/New_York',
        '2026-05-03',
        '🇺🇸',
        raceId,
      ]
    );
    console.log(`[race] updated id=${raceId}`);
  } else {
    const [ins] = await conn.execute<any>(
      `INSERT INTO races
       (series, slug, name, season, round, circuit_name, city, country, country_code, circuit_lat, circuit_lng, timezone, race_date, flag_emoji, is_active)
       VALUES ('f1', ?, ?, 2026, 6, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        TARGET_SLUG,
        'Formula 1 Crypto.com Miami Grand Prix 2026',
        'Miami International Autodrome',
        'Miami',
        'United States',
        'US',
        25.9581,
        -80.2389,
        'America/New_York',
        '2026-05-03',
        '🇺🇸',
      ]
    );
    raceId = ins.insertId;
    console.log(`[race] inserted id=${raceId}`);
  }

  await conn.execute(`DELETE FROM sessions WHERE race_id = ?`, [raceId]);
  await conn.execute(
    `INSERT INTO sessions
      (race_id, name, short_name, session_type, day_of_week, start_time, end_time)
     VALUES
      (?, 'Practice 1',         'FP1',  'fp1',        'Friday',   '12:30:00', '13:30:00'),
      (?, 'Sprint Qualifying',  'SQ',   'qualifying', 'Friday',   '16:30:00', '17:14:00'),
      (?, 'Sprint',             'SPR',  'sprint',     'Saturday', '12:00:00', '13:00:00'),
      (?, 'Qualifying',         'Q',    'qualifying', 'Saturday', '16:00:00', '17:00:00'),
      (?, 'Race',               'R',    'race',       'Sunday',   '16:00:00', '18:00:00')`,
    [raceId, raceId, raceId, raceId, raceId]
  );
  console.log('[sessions] inserted 5 rows');

  await conn.end();
  console.log('\nDone: Miami 2026 schedule patched in raceweekend.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
