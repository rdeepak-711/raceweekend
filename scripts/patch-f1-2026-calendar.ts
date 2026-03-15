/**
 * Patch script: sync F1 2026 calendar with official schedule.
 *
 * Changes vs previous seed:
 * - Remove Emilia-Romagna (not on 2026 calendar)
 * - Canada: Round 10 → Round 7, date May 25
 * - Insert Madrid (Madring) as Round 16
 * - Renumber Austria 11→10, Britain 12→11, Belgium 13→12,
 *   Hungary 14→13, Netherlands 15→14, Italy 16→15
 * - Fix race dates for Miami, Austria, Britain, Belgium, Hungary,
 *   Netherlands, Azerbaijan, Singapore, US, Mexico, Las Vegas
 * - Update race names with correct 2026 sponsors
 *
 * Usage: npx tsx --env-file=.env scripts/patch-f1-2026-calendar.ts
 */

import mysql from 'mysql2/promise';

const DB = {
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: Number(process.env.DATABASE_PORT) || 3306,
  user: process.env.DATABASE_USER ?? 'root',
  password: process.env.DATABASE_PASSWORD ?? '',
  database: process.env.DATABASE_NAME ?? 'raceweekend',
};

async function main() {
  const conn = await mysql.createConnection(DB);
  console.log('\n🏁 Patching F1 2026 calendar...\n');

  // ── 1. Delete Emilia-Romagna (no longer on 2026 calendar) ────────────────
  const [[emiRow]] = await conn.execute(
    'SELECT id FROM races WHERE slug = ?', ['emilia-romagna-f1-2026']
  ) as any;

  if (emiRow) {
    const emiId = emiRow.id;
    // Delete in FK order: experience_windows_map → experience_windows → experiences → sessions → race_content → races
    await conn.execute('DELETE ewm FROM experience_windows_map ewm JOIN experiences e ON ewm.experience_id=e.id WHERE e.race_id=?', [emiId]);
    await conn.execute('DELETE FROM experiences WHERE race_id=?', [emiId]);
    await conn.execute('DELETE FROM experience_windows WHERE race_id=?', [emiId]);
    await conn.execute('DELETE FROM sessions WHERE race_id=?', [emiId]);
    await conn.execute('DELETE FROM race_content WHERE race_id=?', [emiId]);
    await conn.execute('DELETE FROM races WHERE id=?', [emiId]);
    console.log('  ✓ Deleted emilia-romagna-f1-2026 (+ 18 experiences, sessions, content)');
  } else {
    console.log('  ℹ  emilia-romagna-f1-2026 not found (already deleted?)');
  }

  // ── 2. Update Canada: Round 7, date May 25 ───────────────────────────────
  await conn.execute(
    `UPDATE races SET round=7, race_date='2026-05-25', name='Formula 1 Lenovo Canadian Grand Prix 2026'
     WHERE slug='canada-f1-2026'`
  );
  console.log('  ✓ canada-f1-2026 → Round 7, 2026-05-25');

  // ── 3. Renumber + fix dates for rounds that shifted ─────────────────────
  const updates: Array<{ slug: string; round: number; date: string; name: string }> = [
    // Round 6 - Miami
    { slug: 'miami-f1-2026',         round: 6,  date: '2026-05-04', name: 'Formula 1 Crypto.com Miami Grand Prix 2026' },
    // Round 8 - Monaco (round stays, date already correct, update name)
    { slug: 'monaco-f1-2026',        round: 8,  date: '2026-06-07', name: 'Formula 1 Grand Prix de Monaco 2026' },
    // Round 9 - Barcelona-Catalunya (date already correct)
    { slug: 'spain-f1-2026',         round: 9,  date: '2026-06-14', name: 'Formula 1 MSC Cruises Barcelona-Catalunya Grand Prix 2026' },
    // Round 10 - Austria (was 11, date Jul 5 → Jun 28)
    { slug: 'austria-f1-2026',       round: 10, date: '2026-06-28', name: 'Formula 1 Lenovo Austrian Grand Prix 2026' },
    // Round 11 - Britain (was 12, date Jul 19 → Jul 5)
    { slug: 'britain-f1-2026',       round: 11, date: '2026-07-05', name: 'Formula 1 Pirelli British Grand Prix 2026' },
    // Round 12 - Belgium (was 13, date Aug 2 → Jul 19)
    { slug: 'belgium-f1-2026',       round: 12, date: '2026-07-19', name: 'Formula 1 Belgian Grand Prix 2026' },
    // Round 13 - Hungary (was 14, date Aug 9 → Jul 26)
    { slug: 'hungary-f1-2026',       round: 13, date: '2026-07-26', name: 'Formula 1 AWS Hungarian Grand Prix 2026' },
    // Round 14 - Netherlands (was 15, date Aug 30 → Aug 23)
    { slug: 'netherlands-f1-2026',   round: 14, date: '2026-08-23', name: 'Formula 1 Heineken Dutch Grand Prix 2026' },
    // Round 15 - Italy (was 16, date unchanged)
    { slug: 'italy-f1-2026',         round: 15, date: '2026-09-06', name: 'Formula 1 Pirelli Italian Grand Prix 2026' },
    // Round 17 - Azerbaijan (date Sep 20 → Sep 26)
    { slug: 'azerbaijan-f1-2026',    round: 17, date: '2026-09-26', name: 'Formula 1 Qatar Airways Azerbaijan Grand Prix 2026' },
    // Round 18 - Singapore (date Oct 4 → Oct 11)
    { slug: 'singapore-f1-2026',     round: 18, date: '2026-10-11', name: 'Formula 1 Singapore Airlines Singapore Grand Prix 2026' },
    // Round 19 - United States (date Oct 18 → Oct 26)
    { slug: 'united-states-f1-2026', round: 19, date: '2026-10-26', name: 'Formula 1 MSC Cruises United States Grand Prix 2026' },
    // Round 20 - Mexico (date Oct 25 → Nov 2)
    { slug: 'mexico-f1-2026',        round: 20, date: '2026-11-02', name: 'Formula 1 Gran Premio de la Ciudad de México 2026' },
    // Round 21 - Brazil (date correct)
    { slug: 'brazil-f1-2026',        round: 21, date: '2026-11-08', name: 'Formula 1 MSC Cruises São Paulo Grand Prix 2026' },
    // Round 22 - Las Vegas (date Nov 21 → Nov 22)
    { slug: 'las-vegas-f1-2026',     round: 22, date: '2026-11-22', name: 'Formula 1 Heineken Las Vegas Grand Prix 2026' },
    // Rounds with name updates only
    { slug: 'australia-f1-2026',     round: 1,  date: '2026-03-08', name: 'Formula 1 Qatar Airways Australian Grand Prix 2026' },
    { slug: 'china-f1-2026',         round: 2,  date: '2026-03-15', name: 'Formula 1 Heineken Chinese Grand Prix 2026' },
    { slug: 'japan-f1-2026',         round: 3,  date: '2026-03-29', name: 'Formula 1 Aramco Japanese Grand Prix 2026' },
    { slug: 'bahrain-f1-2026',       round: 4,  date: '2026-04-12', name: 'Formula 1 Gulf Air Bahrain Grand Prix 2026' },
    { slug: 'saudi-arabia-f1-2026',  round: 5,  date: '2026-04-19', name: 'Formula 1 STC Saudi Arabian Grand Prix 2026' },
    { slug: 'qatar-f1-2026',         round: 23, date: '2026-11-29', name: 'Formula 1 Qatar Airways Qatar Grand Prix 2026' },
    { slug: 'abu-dhabi-f1-2026',     round: 24, date: '2026-12-06', name: 'Formula 1 Etihad Airways Abu Dhabi Grand Prix 2026' },
  ];

  for (const u of updates) {
    await conn.execute(
      `UPDATE races SET round=?, race_date=?, name=? WHERE slug=? AND series='f1'`,
      [u.round, u.date, u.name, u.slug]
    );
    console.log(`  ✓ ${u.slug} → Round ${u.round}, ${u.date}`);
  }

  // ── 4. Insert Madrid (Madring) as Round 16 ───────────────────────────────
  const [[existingMadrid]] = await conn.execute(
    'SELECT id FROM races WHERE slug = ?', ['madrid-f1-2026']
  ) as any;

  if (!existingMadrid) {
    await conn.execute(
      `INSERT INTO races
         (series, slug, name, season, round, circuit_name, city, country, country_code,
          circuit_lat, circuit_lng, timezone, race_date, flag_emoji, is_active)
       VALUES ('f1','madrid-f1-2026','Formula 1 Tag Heuer Spanish Grand Prix 2026',
               2026, 16, 'Madring', 'Madrid', 'Spain', 'ES',
               40.4515, -3.5788, 'Europe/Madrid', '2026-09-13', '🇪🇸', 1)`
    );
    const [[madridRow]] = await conn.execute('SELECT id FROM races WHERE slug = ?', ['madrid-f1-2026']) as any;
    const madridId = madridRow.id;

    // Seed standard F1 sessions
    const sessions = [
      { name: 'Practice 1', short: 'FP1', type: 'fp1',       day: 'Friday',   start: '11:30:00', end: '12:30:00' },
      { name: 'Practice 2', short: 'FP2', type: 'fp2',       day: 'Friday',   start: '15:00:00', end: '16:00:00' },
      { name: 'Practice 3', short: 'FP3', type: 'fp3',       day: 'Saturday', start: '11:30:00', end: '12:30:00' },
      { name: 'Qualifying', short: 'Q',   type: 'qualifying', day: 'Saturday', start: '15:00:00', end: '16:00:00' },
      { name: 'Race',       short: 'R',   type: 'race',       day: 'Sunday',   start: '15:00:00', end: '17:00:00' },
    ];
    for (const s of sessions) {
      await conn.execute(
        `INSERT INTO sessions (race_id, name, short_name, session_type, day_of_week, start_time, end_time)
         VALUES (?,?,?,?,?,?,?)`,
        [madridId, s.name, s.short, s.type, s.day, s.start, s.end]
      );
    }
    // Insert empty race_content row
    await conn.execute(
      `INSERT IGNORE INTO race_content (race_id, page_title, page_description)
       VALUES (?, 'Madrid F1 2026 | Formula 1 Tag Heuer Spanish Grand Prix',
               'Your guide to the 2026 Formula 1 Tag Heuer Spanish Grand Prix in Madrid.')`,
      [madridId]
    );
    console.log('  ✓ Inserted madrid-f1-2026 (Round 16, Madring, 2026-09-13) + sessions + race_content');
  } else {
    console.log('  ℹ  madrid-f1-2026 already exists');
  }

  await conn.end();

  console.log('\n✅ F1 2026 calendar patch complete.\n');
  console.log('Run this to verify:');
  console.log('  mysql raceweekend -e "SELECT round, slug, race_date FROM races WHERE series=\'f1\' ORDER BY round;"');
}

main().catch(err => { console.error(err); process.exit(1); });
