/**
 * Seeds experience_windows for 4 F1 races in the raceweekend DB.
 * Clears existing windows for each race before inserting.
 *
 * Usage: npx tsx --env-file=.env scripts/seed-experience-windows.ts
 */
import mysql from 'mysql2/promise';

const DB = {
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: Number(process.env.DATABASE_PORT) || 3306,
  user: process.env.DATABASE_USER ?? 'root',
  password: process.env.DATABASE_PASSWORD ?? '',
  database: process.env.DATABASE_NAME ?? 'raceweekend',
};

type WindowDef = {
  slug: string;
  label: string;
  day_of_week: 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  start_time: string;
  end_time: string;
  max_duration_hours: number;
  sort_order: number;
};

const RACE_WINDOWS: Record<string, WindowDef[]> = {
  'australia-f1-2026': [
    { slug: 'thu-full',     label: 'Thursday — Explore Melbourne',        day_of_week: 'Thursday', start_time: '08:00', end_time: '22:00', max_duration_hours: 14,  sort_order: 1 },
    { slug: 'fri-morning',  label: 'Friday Morning — Before FP1',         day_of_week: 'Friday',   start_time: '08:00', end_time: '12:00', max_duration_hours: 3.5, sort_order: 2 },
    { slug: 'fri-gap',      label: 'Friday Afternoon — Between Sessions',  day_of_week: 'Friday',   start_time: '13:30', end_time: '15:30', max_duration_hours: 1.5, sort_order: 3 },
    { slug: 'fri-evening',  label: 'Friday Evening — After FP2',          day_of_week: 'Friday',   start_time: '17:00', end_time: '22:00', max_duration_hours: 4,   sort_order: 4 },
    { slug: 'sat-morning',  label: 'Saturday Morning — Before FP3',       day_of_week: 'Saturday', start_time: '08:00', end_time: '12:00', max_duration_hours: 3.5, sort_order: 5 },
    { slug: 'sat-evening',  label: 'Saturday Evening — After Qualifying',  day_of_week: 'Saturday', start_time: '17:00', end_time: '22:00', max_duration_hours: 4,   sort_order: 6 },
    { slug: 'sun-morning',  label: 'Sunday Morning — Race Day Build-Up',   day_of_week: 'Sunday',   start_time: '08:00', end_time: '14:30', max_duration_hours: 5,   sort_order: 7 },
    { slug: 'sun-evening',  label: 'Sunday Evening — Post-Race Celebration',day_of_week: 'Sunday',  start_time: '17:00', end_time: '22:00', max_duration_hours: 4,   sort_order: 8 },
  ],
  'china-f1-2026': [
    { slug: 'fri-morning',  label: 'Friday Morning — Before FP1',         day_of_week: 'Friday',   start_time: '08:00', end_time: '11:30', max_duration_hours: 3.5, sort_order: 1 },
    { slug: 'fri-gap',      label: 'Friday Afternoon — Between Sessions',  day_of_week: 'Friday',   start_time: '13:00', end_time: '15:00', max_duration_hours: 1.5, sort_order: 2 },
    { slug: 'fri-evening',  label: 'Friday Evening — After FP2',          day_of_week: 'Friday',   start_time: '16:00', end_time: '23:00', max_duration_hours: 4,   sort_order: 3 },
    { slug: 'sat-morning',  label: 'Saturday Morning — Before FP3',       day_of_week: 'Saturday', start_time: '08:00', end_time: '11:30', max_duration_hours: 3.5, sort_order: 4 },
    { slug: 'sat-gap',      label: 'Saturday Afternoon — Between FP3/Quali',day_of_week:'Saturday', start_time: '13:00', end_time: '15:00', max_duration_hours: 1.5, sort_order: 5 },
    { slug: 'sat-evening',  label: 'Saturday Evening — After Qualifying',  day_of_week: 'Saturday', start_time: '16:00', end_time: '23:00', max_duration_hours: 4,   sort_order: 6 },
    { slug: 'sun-morning',  label: 'Sunday Morning — Race Day Exploration',day_of_week: 'Sunday',   start_time: '08:00', end_time: '15:00', max_duration_hours: 6,   sort_order: 7 },
    { slug: 'post-race',    label: 'Sunday Evening — After the Chequered Flag',day_of_week:'Sunday',start_time: '17:00', end_time: '23:00', max_duration_hours: 3,   sort_order: 8 },
  ],
  'japan-f1-2026': [
    { slug: 'fri-morning',  label: 'Friday Morning',       day_of_week: 'Friday',   start_time: '08:00', end_time: '11:30', max_duration_hours: 3.5, sort_order: 1 },
    { slug: 'fri-gap',      label: 'Friday Afternoon',     day_of_week: 'Friday',   start_time: '12:30', end_time: '15:00', max_duration_hours: 2,   sort_order: 2 },
    { slug: 'fri-evening',  label: 'Friday Evening',       day_of_week: 'Friday',   start_time: '16:00', end_time: '23:00', max_duration_hours: 4,   sort_order: 3 },
    { slug: 'sat-morning',  label: 'Saturday Morning',     day_of_week: 'Saturday', start_time: '08:00', end_time: '11:30', max_duration_hours: 3.5, sort_order: 4 },
    { slug: 'sat-gap',      label: 'Saturday Afternoon',   day_of_week: 'Saturday', start_time: '12:30', end_time: '15:00', max_duration_hours: 2,   sort_order: 5 },
    { slug: 'sat-evening',  label: 'Saturday Evening',     day_of_week: 'Saturday', start_time: '16:00', end_time: '23:00', max_duration_hours: 4,   sort_order: 6 },
    { slug: 'sun-morning',  label: 'Race Day Morning',     day_of_week: 'Sunday',   start_time: '08:00', end_time: '14:00', max_duration_hours: 6,   sort_order: 7 },
    { slug: 'post-race',    label: 'Post-Race Evening',    day_of_week: 'Sunday',   start_time: '16:00', end_time: '23:00', max_duration_hours: 3,   sort_order: 8 },
  ],
  'bahrain-f1-2026': [
    { slug: 'fri-morning',  label: 'Friday Morning',                     day_of_week: 'Friday',   start_time: '08:00', end_time: '14:00', max_duration_hours: 6,  sort_order: 1 },
    { slug: 'fri-gap',      label: 'Friday Afternoon — Between Sessions', day_of_week: 'Friday',   start_time: '15:30', end_time: '17:30', max_duration_hours: 2,  sort_order: 2 },
    { slug: 'fri-evening',  label: 'Friday Evening — After Practice',    day_of_week: 'Friday',   start_time: '19:00', end_time: '23:00', max_duration_hours: 4,  sort_order: 3 },
    { slug: 'sat-morning',  label: 'Saturday Morning',                   day_of_week: 'Saturday', start_time: '08:00', end_time: '15:00', max_duration_hours: 7,  sort_order: 4 },
    { slug: 'sat-gap',      label: 'Saturday Afternoon',                 day_of_week: 'Saturday', start_time: '16:30', end_time: '18:30', max_duration_hours: 2,  sort_order: 5 },
    { slug: 'sat-evening',  label: 'Saturday Evening — After Qualifying', day_of_week: 'Saturday', start_time: '20:00', end_time: '23:00', max_duration_hours: 3,  sort_order: 6 },
    { slug: 'sun-morning',  label: 'Race Day — Morning',                 day_of_week: 'Sunday',   start_time: '08:00', end_time: '17:00', max_duration_hours: 9,  sort_order: 7 },
    { slug: 'sun-evening',  label: 'Post-Race Night',                    day_of_week: 'Sunday',   start_time: '20:00', end_time: '23:00', max_duration_hours: 3,  sort_order: 8 },
  ],
};

async function main() {
  const conn = await mysql.createConnection(DB);

  for (const [raceSlug, windows] of Object.entries(RACE_WINDOWS)) {
    const [raceRows] = await conn.execute<mysql.RowDataPacket[]>(
      'SELECT id FROM races WHERE slug = ? LIMIT 1', [raceSlug]
    );
    if (!raceRows.length) {
      console.warn(`⚠️  Race '${raceSlug}' not found — skipping`);
      continue;
    }
    const raceId = raceRows[0].id as number;

    // Clear existing windows (remove map entries first to avoid FK errors)
    await conn.execute(
      'DELETE FROM experience_windows_map WHERE window_id IN (SELECT id FROM experience_windows WHERE race_id = ?)',
      [raceId]
    );
    await conn.execute('DELETE FROM experience_windows WHERE race_id = ?', [raceId]);

    for (const w of windows) {
      await conn.execute(
        `INSERT INTO experience_windows (race_id, slug, label, day_of_week, start_time, end_time, max_duration_hours, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [raceId, w.slug, w.label, w.day_of_week, w.start_time, w.end_time, w.max_duration_hours, w.sort_order]
      );
    }
    console.log(`✅ Seeded ${windows.length} windows for ${raceSlug}`);
  }

  await conn.end();
  console.log('\n✅ Experience windows seeded for all 4 F1 races');
}

main().catch((err) => { console.error(err); process.exit(1); });
