/**
 * Patch: Replace Thailand MotoGP 2026 sessions with the official schedule.
 * Source: PT Grand Prix of Thailand official timetable (26 Feb – 1 Mar 2026)
 * Run: npx tsx scripts/patch-thailand-motogp-sessions.ts
 */
import mysql from 'mysql2/promise';
import 'dotenv/config';

const RACE_ID = 45; // thailand-motogp-2026

interface Session {
  name: string;
  short_name: string;
  session_type: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  series_key: string;
  series_label: string;
}

const SESSIONS: Session[] = [
  // ── Thursday 26 Feb – Pre-Event ───────────────────────────────────────────
  { name: 'MotoGP GearUp',                  short_name: 'MotoGP GU',  session_type: 'event',     day_of_week: 'Thursday', start_time: '17:20:00', end_time: '18:00:00', series_key: 'motogp', series_label: 'MotoGP' },
  { name: 'MotoGP Pre-Event Press Conference', short_name: 'MotoGP PC', session_type: 'event',   day_of_week: 'Thursday', start_time: '18:00:00', end_time: '18:30:00', series_key: 'motogp', series_label: 'MotoGP' },

  // ── Friday 27 Feb – Free Practice ────────────────────────────────────────
  { name: 'Moto3 Free Practice 1',           short_name: 'Moto3 FP1', session_type: 'fp1',       day_of_week: 'Friday',   start_time: '09:00:00', end_time: '09:35:00', series_key: 'moto3',  series_label: 'Moto3' },
  { name: 'Moto2 Free Practice 1',           short_name: 'Moto2 FP1', session_type: 'fp1',       day_of_week: 'Friday',   start_time: '09:50:00', end_time: '10:30:00', series_key: 'moto2',  series_label: 'Moto2' },
  { name: 'MotoGP Free Practice 1',          short_name: 'MotoGP FP1', session_type: 'fp1',      day_of_week: 'Friday',   start_time: '10:45:00', end_time: '11:30:00', series_key: 'motogp', series_label: 'MotoGP' },
  { name: 'Moto3 Practice',                  short_name: 'Moto3 P',   session_type: 'practice',  day_of_week: 'Friday',   start_time: '13:15:00', end_time: '13:50:00', series_key: 'moto3',  series_label: 'Moto3' },
  { name: 'Moto2 Practice',                  short_name: 'Moto2 P',   session_type: 'practice',  day_of_week: 'Friday',   start_time: '14:05:00', end_time: '14:45:00', series_key: 'moto2',  series_label: 'Moto2' },
  { name: 'MotoGP Practice',                 short_name: 'MotoGP P',  session_type: 'practice',  day_of_week: 'Friday',   start_time: '15:00:00', end_time: '16:00:00', series_key: 'motogp', series_label: 'MotoGP' },

  // ── Saturday 28 Feb – Qualifying & Sprint ────────────────────────────────
  { name: 'Moto3 Free Practice 2',           short_name: 'Moto3 FP2', session_type: 'fp2',       day_of_week: 'Saturday', start_time: '08:40:00', end_time: '09:10:00', series_key: 'moto3',  series_label: 'Moto3' },
  { name: 'Moto2 Free Practice 2',           short_name: 'Moto2 FP2', session_type: 'fp2',       day_of_week: 'Saturday', start_time: '09:25:00', end_time: '09:55:00', series_key: 'moto2',  series_label: 'Moto2' },
  { name: 'MotoGP Free Practice 2',          short_name: 'MotoGP FP2', session_type: 'fp2',      day_of_week: 'Saturday', start_time: '10:10:00', end_time: '10:40:00', series_key: 'motogp', series_label: 'MotoGP' },
  { name: 'MotoGP Qualifying 1',             short_name: 'MotoGP Q1', session_type: 'qualifying', day_of_week: 'Saturday', start_time: '10:50:00', end_time: '11:05:00', series_key: 'motogp', series_label: 'MotoGP' },
  { name: 'MotoGP Qualifying 2',             short_name: 'MotoGP Q2', session_type: 'qualifying', day_of_week: 'Saturday', start_time: '11:15:00', end_time: '11:30:00', series_key: 'motogp', series_label: 'MotoGP' },
  { name: 'Moto3 Qualifying 1',              short_name: 'Moto3 Q1', session_type: 'qualifying', day_of_week: 'Saturday', start_time: '12:45:00', end_time: '13:00:00', series_key: 'moto3',  series_label: 'Moto3' },
  { name: 'Moto3 Qualifying 2',              short_name: 'Moto3 Q2', session_type: 'qualifying', day_of_week: 'Saturday', start_time: '13:10:00', end_time: '13:25:00', series_key: 'moto3',  series_label: 'Moto3' },
  { name: 'Moto2 Qualifying 1',              short_name: 'Moto2 Q1', session_type: 'qualifying', day_of_week: 'Saturday', start_time: '13:40:00', end_time: '13:55:00', series_key: 'moto2',  series_label: 'Moto2' },
  { name: 'Moto2 Qualifying 2',              short_name: 'Moto2 Q2', session_type: 'qualifying', day_of_week: 'Saturday', start_time: '14:05:00', end_time: '14:20:00', series_key: 'moto2',  series_label: 'Moto2' },
  { name: 'MotoGP Sprint',                   short_name: 'MotoGP SPR', session_type: 'sprint',   day_of_week: 'Saturday', start_time: '15:00:00', end_time: '16:00:00', series_key: 'motogp', series_label: 'MotoGP' },

  // ── Sunday 1 Mar – Race Day ───────────────────────────────────────────────
  { name: 'MotoGP Warm Up',                  short_name: 'MotoGP WU', session_type: 'warmup',    day_of_week: 'Sunday',   start_time: '10:40:00', end_time: '10:50:00', series_key: 'motogp', series_label: 'MotoGP' },
  { name: 'Moto3 Race',                      short_name: 'Moto3 R',   session_type: 'race',      day_of_week: 'Sunday',   start_time: '12:00:00', end_time: '12:45:00', series_key: 'moto3',  series_label: 'Moto3' },
  { name: 'Moto2 Race',                      short_name: 'Moto2 R',   session_type: 'race',      day_of_week: 'Sunday',   start_time: '13:15:00', end_time: '14:35:00', series_key: 'moto2',  series_label: 'Moto2' },
  { name: 'MotoGP Grand Prix',               short_name: 'MotoGP R',  session_type: 'race',      day_of_week: 'Sunday',   start_time: '15:00:00', end_time: '16:15:00', series_key: 'motogp', series_label: 'MotoGP' },
  { name: 'MotoGP After the Flag',           short_name: 'MotoGP ATF', session_type: 'event',    day_of_week: 'Sunday',   start_time: '16:15:00', end_time: '16:40:00', series_key: 'motogp', series_label: 'MotoGP' },
  { name: 'MotoGP Sunday Press Conference',  short_name: 'MotoGP SPC', session_type: 'event',    day_of_week: 'Sunday',   start_time: '16:40:00', end_time: '17:00:00', series_key: 'motogp', series_label: 'MotoGP' },
];

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DATABASE_HOST || 'localhost',
    port: Number(process.env.DATABASE_PORT) || 3306,
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '12345678',
    database: process.env.DATABASE_NAME || 'raceweekend',
  });

  console.log(`🏍️  Patching Thailand MotoGP 2026 sessions (race_id=${RACE_ID})...`);

  // Clear all existing sessions for this race
  const [del] = await conn.execute('DELETE FROM sessions WHERE race_id = ?', [RACE_ID]) as any;
  console.log(`🗑️  Deleted ${del.affectedRows} stale sessions`);

  // Insert the corrected schedule
  const sql = `
    INSERT INTO sessions
      (race_id, name, short_name, session_type, day_of_week, start_time, end_time, series_key, series_label)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  for (const s of SESSIONS) {
    await conn.execute(sql, [
      RACE_ID,
      s.name, s.short_name, s.session_type,
      s.day_of_week, s.start_time, s.end_time,
      s.series_key, s.series_label,
    ]);
  }

  console.log(`✅ Inserted ${SESSIONS.length} sessions`);

  // Verify
  const [rows] = await conn.execute(
    'SELECT day_of_week, start_time, name, series_key FROM sessions WHERE race_id = ? ORDER BY FIELD(day_of_week, "Thursday","Friday","Saturday","Sunday"), start_time',
    [RACE_ID],
  ) as any;

  console.log('\n📅 Thailand MotoGP 2026 Schedule:');
  let currentDay = '';
  for (const r of rows) {
    if (r.day_of_week !== currentDay) {
      currentDay = r.day_of_week;
      console.log(`\n  ${currentDay}:`);
    }
    console.log(`    ${r.start_time.slice(0,5)}  [${(r.series_key || 'event').padEnd(6)}]  ${r.name}`);
  }

  await conn.end();
  console.log('\n✅ Done!');
}

main().catch(err => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
