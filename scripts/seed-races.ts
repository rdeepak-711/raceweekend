/**
 * Seed script: populates races + sessions tables for F1 or MotoGP 2026.
 * Usage:
 *   npm run seed:f1       → F1 2026 calendar (24 races)
 *   npm run seed:motogp   → MotoGP 2026 calendar (22 races)
 */

import 'dotenv/config';
import mysql from 'mysql2/promise';

const series = process.argv.includes('--series=motogp') ? 'motogp' : 'f1';

// ──────────────────────────────────────────────────────────────────────────────
// F1 2026 Calendar (24 races)
// ──────────────────────────────────────────────────────────────────────────────

const F1_RACES = [
  { slug: 'australia-f1-2026',     round: 1,  name: 'Formula 1 Qatar Airways Australian Grand Prix 2026',    circuit: 'Albert Park Circuit',           city: 'Melbourne',     country: 'Australia',     code: 'AU', flag: '🇦🇺', tz: 'Australia/Melbourne',  date: '2026-03-08', lat: -37.8497, lng: 144.9680 },
  { slug: 'china-f1-2026',         round: 2,  name: 'Formula 1 Heineken Chinese Grand Prix 2026',            circuit: 'Shanghai International Circuit', city: 'Shanghai',      country: 'China',         code: 'CN', flag: '🇨🇳', tz: 'Asia/Shanghai',        date: '2026-03-15', lat: 31.3389, lng: 121.2198 },
  { slug: 'japan-f1-2026',         round: 3,  name: 'Formula 1 Aramco Japanese Grand Prix 2026',            circuit: 'Suzuka International Racing Course', city: 'Suzuka',   country: 'Japan',         code: 'JP', flag: '🇯🇵', tz: 'Asia/Tokyo',           date: '2026-03-29', lat: 34.8431, lng: 136.5408 },
  { slug: 'bahrain-f1-2026',       round: 4,  name: 'Formula 1 Gulf Air Bahrain Grand Prix 2026',            circuit: 'Bahrain International Circuit',  city: 'Sakhir',       country: 'Bahrain',       code: 'BH', flag: '🇧🇭', tz: 'Asia/Bahrain',         date: '2026-04-12', lat: 26.0325, lng: 50.5106 },
  { slug: 'saudi-arabia-f1-2026',  round: 5,  name: 'Formula 1 STC Saudi Arabian Grand Prix 2026',           circuit: 'Jeddah Street Circuit',          city: 'Jeddah',       country: 'Saudi Arabia',  code: 'SA', flag: '🇸🇦', tz: 'Asia/Riyadh',          date: '2026-04-19', lat: 21.6319, lng: 39.1044 },
  { slug: 'miami-f1-2026',         round: 6,  name: 'Formula 1 Crypto.com Miami Grand Prix 2026',            circuit: 'Miami International Autodrome',  city: 'Miami',        country: 'United States', code: 'US', flag: '🇺🇸', tz: 'America/New_York',     date: '2026-05-04', lat: 25.9581, lng: -80.2389 },
  { slug: 'canada-f1-2026',        round: 7,  name: 'Formula 1 Lenovo Canadian Grand Prix 2026',             circuit: 'Circuit Gilles-Villeneuve',      city: 'Montreal',     country: 'Canada',        code: 'CA', flag: '🇨🇦', tz: 'America/Toronto',      date: '2026-05-25', lat: 45.5000, lng: -73.5228 },
  { slug: 'monaco-f1-2026',        round: 8,  name: 'Formula 1 Grand Prix de Monaco 2026',                   circuit: 'Circuit de Monaco',             city: 'Monaco',       country: 'Monaco',        code: 'MC', flag: '🇲🇨', tz: 'Europe/Monaco',        date: '2026-06-07', lat: 43.7347, lng: 7.4206 },
  { slug: 'spain-f1-2026',         round: 9,  name: 'Formula 1 MSC Cruises Barcelona-Catalunya Grand Prix 2026', circuit: 'Circuit de Barcelona-Catalunya', city: 'Barcelona', country: 'Spain',        code: 'ES', flag: '🇪🇸', tz: 'Europe/Madrid',        date: '2026-06-14', lat: 41.5700, lng: 2.2611 },
  { slug: 'austria-f1-2026',       round: 10, name: 'Formula 1 Lenovo Austrian Grand Prix 2026',             circuit: 'Red Bull Ring',                  city: 'Spielberg',    country: 'Austria',       code: 'AT', flag: '🇦🇹', tz: 'Europe/Vienna',        date: '2026-06-28', lat: 47.2197, lng: 14.7647 },
  { slug: 'britain-f1-2026',       round: 11, name: 'Formula 1 Pirelli British Grand Prix 2026',             circuit: 'Silverstone Circuit',            city: 'Silverstone',  country: 'United Kingdom',code: 'GB', flag: '🇬🇧', tz: 'Europe/London',        date: '2026-07-05', lat: 52.0786, lng: -1.0169 },
  { slug: 'belgium-f1-2026',       round: 12, name: 'Formula 1 Belgian Grand Prix 2026',                     circuit: 'Circuit de Spa-Francorchamps',   city: 'Stavelot',     country: 'Belgium',       code: 'BE', flag: '🇧🇪', tz: 'Europe/Brussels',      date: '2026-07-19', lat: 50.4372, lng: 5.9714 },
  { slug: 'hungary-f1-2026',       round: 13, name: 'Formula 1 AWS Hungarian Grand Prix 2026',               circuit: 'Hungaroring',                    city: 'Budapest',     country: 'Hungary',       code: 'HU', flag: '🇭🇺', tz: 'Europe/Budapest',      date: '2026-07-26', lat: 47.5789, lng: 19.2486 },
  { slug: 'netherlands-f1-2026',   round: 14, name: 'Formula 1 Heineken Dutch Grand Prix 2026',              circuit: 'Circuit Park Zandvoort',         city: 'Zandvoort',    country: 'Netherlands',   code: 'NL', flag: '🇳🇱', tz: 'Europe/Amsterdam',     date: '2026-08-23', lat: 52.3888, lng: 4.5409 },
  { slug: 'italy-f1-2026',         round: 15, name: 'Formula 1 Pirelli Italian Grand Prix 2026',             circuit: 'Autodromo Nazionale Monza',      city: 'Monza',        country: 'Italy',         code: 'IT', flag: '🇮🇹', tz: 'Europe/Rome',          date: '2026-09-06', lat: 45.6156, lng: 9.2811 },
  { slug: 'madrid-f1-2026',        round: 16, name: 'Formula 1 Tag Heuer Spanish Grand Prix 2026',           circuit: 'Madring',                        city: 'Madrid',       country: 'Spain',         code: 'ES', flag: '🇪🇸', tz: 'Europe/Madrid',        date: '2026-09-13', lat: 40.4515, lng: -3.5788 },
  { slug: 'azerbaijan-f1-2026',    round: 17, name: 'Formula 1 Qatar Airways Azerbaijan Grand Prix 2026',    circuit: 'Baku City Circuit',              city: 'Baku',         country: 'Azerbaijan',    code: 'AZ', flag: '🇦🇿', tz: 'Asia/Baku',            date: '2026-09-26', lat: 40.3725, lng: 49.8533 },
  { slug: 'singapore-f1-2026',     round: 18, name: 'Formula 1 Singapore Airlines Singapore Grand Prix 2026',circuit: 'Marina Bay Street Circuit',      city: 'Singapore',    country: 'Singapore',     code: 'SG', flag: '🇸🇬', tz: 'Asia/Singapore',       date: '2026-10-11', lat: 1.2914, lng: 103.8640 },
  { slug: 'united-states-f1-2026', round: 19, name: 'Formula 1 MSC Cruises United States Grand Prix 2026',  circuit: 'Circuit of the Americas',        city: 'Austin',       country: 'United States', code: 'US', flag: '🇺🇸', tz: 'America/Chicago',      date: '2026-10-26', lat: 30.1328, lng: -97.6411 },
  { slug: 'mexico-f1-2026',        round: 20, name: 'Formula 1 Gran Premio de la Ciudad de México 2026',    circuit: 'Autodromo Hermanos Rodriguez',   city: 'Mexico City',  country: 'Mexico',        code: 'MX', flag: '🇲🇽', tz: 'America/Mexico_City',  date: '2026-11-02', lat: 19.4042, lng: -99.0907 },
  { slug: 'brazil-f1-2026',        round: 21, name: 'Formula 1 MSC Cruises São Paulo Grand Prix 2026',      circuit: 'Autodromo Jose Carlos Pace',     city: 'São Paulo',    country: 'Brazil',        code: 'BR', flag: '🇧🇷', tz: 'America/Sao_Paulo',    date: '2026-11-08', lat: -23.7036, lng: -46.6997 },
  { slug: 'las-vegas-f1-2026',     round: 22, name: 'Formula 1 Heineken Las Vegas Grand Prix 2026',         circuit: 'Las Vegas Street Circuit',       city: 'Las Vegas',    country: 'United States', code: 'US', flag: '🇺🇸', tz: 'America/Los_Angeles',  date: '2026-11-22', lat: 36.1699, lng: -115.1398 },
  { slug: 'qatar-f1-2026',         round: 23, name: 'Formula 1 Qatar Airways Qatar Grand Prix 2026',        circuit: 'Losail International Circuit',   city: 'Lusail',       country: 'Qatar',         code: 'QA', flag: '🇶🇦', tz: 'Asia/Qatar',           date: '2026-11-29', lat: 25.4900, lng: 51.4542 },
  { slug: 'abu-dhabi-f1-2026',     round: 24, name: 'Formula 1 Etihad Airways Abu Dhabi Grand Prix 2026',  circuit: 'Yas Marina Circuit',             city: 'Abu Dhabi',    country: 'UAE',           code: 'AE', flag: '🇦🇪', tz: 'Asia/Dubai',           date: '2026-12-06', lat: 24.4672, lng: 54.6031 },
];

// MotoGP 2026 Calendar (22 races)
const MOTOGP_RACES = [
  { slug: 'thailand-motogp-2026',   round: 1,  name: 'Thailand Grand Prix 2026',          circuit: 'Chang International Circuit',          city: 'Buriram',      country: 'Thailand',      code: 'TH', flag: '🇹🇭', tz: 'Asia/Bangkok',             date: '2026-03-01', lat: 14.9547, lng: 103.0767 },
  { slug: 'brazil-motogp-2026',     round: 2,  name: 'Brazil Grand Prix 2026',            circuit: 'Autodromo Internacional Ayrton Senna', city: 'Goiânia',      country: 'Brazil',        code: 'BR', flag: '🇧🇷', tz: 'America/Sao_Paulo',        date: '2026-03-22', lat: -16.7189, lng: -49.2131 },
  { slug: 'americas-motogp-2026',   round: 3,  name: 'Americas Grand Prix 2026',           circuit: 'Circuit of the Americas',              city: 'Austin',       country: 'United States', code: 'US', flag: '🇺🇸', tz: 'America/Chicago',          date: '2026-03-29', lat: 30.1328, lng: -97.6411 },
  { slug: 'qatar-motogp-2026',      round: 4,  name: 'Qatar Grand Prix 2026',             circuit: 'Losail International Circuit',         city: 'Lusail',       country: 'Qatar',         code: 'QA', flag: '🇶🇦', tz: 'Asia/Qatar',               date: '2026-04-12', lat: 25.4900, lng: 51.4542 },
  { slug: 'spain-motogp-2026',      round: 5,  name: 'Spanish Grand Prix 2026',            circuit: 'Circuito de Jerez',                    city: 'Jerez',        country: 'Spain',         code: 'ES', flag: '🇪🇸', tz: 'Europe/Madrid',            date: '2026-04-26', lat: 36.7081, lng: -6.0339 },
  { slug: 'france-motogp-2026',     round: 6,  name: 'French Grand Prix 2026',             circuit: 'Circuit Bugatti',                      city: 'Le Mans',      country: 'France',        code: 'FR', flag: '🇫🇷', tz: 'Europe/Paris',             date: '2026-05-10', lat: 47.9561, lng: 0.2071 },
  { slug: 'catalan-motogp-2026',    round: 7,  name: 'Catalan Grand Prix 2026',            circuit: 'Circuit de Barcelona-Catalunya',       city: 'Barcelona',    country: 'Spain',         code: 'ES', flag: '🇪🇸', tz: 'Europe/Madrid',            date: '2026-05-17', lat: 41.5700, lng: 2.2611 },
  { slug: 'italy-motogp-2026',      round: 8,  name: 'Italian Grand Prix 2026',            circuit: 'Autodromo del Mugello',                city: 'Mugello',      country: 'Italy',         code: 'IT', flag: '🇮🇹', tz: 'Europe/Rome',              date: '2026-05-31', lat: 43.9975, lng: 11.3719 },
  { slug: 'hungary-motogp-2026',    round: 9,  name: 'Hungary Grand Prix 2026',           circuit: 'Balaton Park Circuit',                 city: 'Balatonfőkajár',country: 'Hungary',       code: 'HU', flag: '🇭🇺', tz: 'Europe/Budapest',          date: '2026-06-07', lat: 47.0311, lng: 18.2211 },
  { slug: 'czech-motogp-2026',      round: 10, name: 'Czech Republic Grand Prix 2026',    circuit: 'Automotodrom Brno',                    city: 'Brno',         country: 'Czech Republic',code: 'CZ', flag: '🇨🇿', tz: 'Europe/Prague',            date: '2026-06-21', lat: 49.2033, lng: 16.4444 },
  { slug: 'netherlands-motogp-2026',round: 11, name: 'Dutch TT 2026',                      circuit: 'TT Circuit Assen',                     city: 'Assen',        country: 'Netherlands',   code: 'NL', flag: '🇳🇱', tz: 'Europe/Amsterdam',         date: '2026-06-28', lat: 52.9625, lng: 6.5236 },
  { slug: 'germany-motogp-2026',    round: 12, name: 'German Grand Prix 2026',             circuit: 'Sachsenring',                          city: 'Hohenstein',   country: 'Germany',       code: 'DE', flag: '🇩🇪', tz: 'Europe/Berlin',            date: '2026-07-12', lat: 50.7918, lng: 12.6839 },
  { slug: 'britain-motogp-2026',    round: 13, name: 'British Grand Prix 2026',            circuit: 'Silverstone Circuit',                  city: 'Silverstone',  country: 'United Kingdom',code: 'GB', flag: '🇬🇧', tz: 'Europe/London',            date: '2026-08-09', lat: 52.0786, lng: -1.0169 },
  { slug: 'aragon-motogp-2026',     round: 14, name: 'Aragon Grand Prix 2026',             circuit: 'MotorLand Aragón',                     city: 'Alcañiz',      country: 'Spain',         code: 'ES', flag: '🇪🇸', tz: 'Europe/Madrid',            date: '2026-08-30', lat: 40.9522, lng: -0.3317 },
  { slug: 'san-marino-motogp-2026', round: 15, name: 'San Marino Grand Prix 2026',         circuit: 'Misano World Circuit',                 city: 'Misano Adriatico',country: 'San Marino', code: 'SM', flag: '🇸🇲', tz: 'Europe/Rome',              date: '2026-09-13', lat: 44.0075, lng: 12.6806 },
  { slug: 'austria-motogp-2026',    round: 16, name: 'Austrian Grand Prix 2026',           circuit: 'Red Bull Ring',                        city: 'Spielberg',    country: 'Austria',       code: 'AT', flag: '🇦🇹', tz: 'Europe/Vienna',            date: '2026-09-20', lat: 47.2197, lng: 14.7647 },
  { slug: 'japan-motogp-2026',      round: 17, name: 'Japanese Grand Prix 2026',           circuit: 'Twin Ring Motegi',                     city: 'Motegi',       country: 'Japan',         code: 'JP', flag: '🇯🇵', tz: 'Asia/Tokyo',               date: '2026-10-04', lat: 36.5283, lng: 140.1981 },
  { slug: 'indonesia-motogp-2026',  round: 18, name: 'Indonesia Grand Prix 2026',          circuit: 'Pertamina Mandalika Street Circuit',   city: 'Lombok',       country: 'Indonesia',     code: 'ID', flag: '🇮🇩', tz: 'Asia/Makassar',            date: '2026-10-11', lat: -8.8969, lng: 116.3050 },
  { slug: 'australia-motogp-2026',  round: 19, name: 'Australian Grand Prix 2026 (MotoGP)',circuit: 'Phillip Island Circuit',               city: 'Phillip Island',country: 'Australia',    code: 'AU', flag: '🇦🇺', tz: 'Australia/Melbourne',      date: '2026-10-25', lat: -38.5035, lng: 145.2302 },
  { slug: 'malaysia-motogp-2026',   round: 20, name: 'Malaysian Grand Prix 2026',          circuit: 'Sepang International Circuit',         city: 'Sepang',       country: 'Malaysia',      code: 'MY', flag: '🇲🇾', tz: 'Asia/Kuala_Lumpur',         date: '2026-11-01', lat: 2.7606, lng: 101.7381 },
  { slug: 'portugal-motogp-2026',   round: 21, name: 'Portuguese Grand Prix 2026',         circuit: 'Autodromo Internacional do Algarve',   city: 'Portimão',     country: 'Portugal',      code: 'PT', flag: '🇵🇹', tz: 'Europe/Lisbon',            date: '2026-11-15', lat: 37.2272, lng: -8.6269 },
  { slug: 'valencia-motogp-2026',   round: 22, name: 'Valencian Community Grand Prix 2026',circuit: 'Circuit Ricardo Tormo',                city: 'Valencia',     country: 'Spain',         code: 'ES', flag: '🇪🇸', tz: 'Europe/Madrid',            date: '2026-11-22', lat: 39.4847, lng: -0.6317 },
];

async function main() {
  console.log(`\n🏁 Seeding ${series.toUpperCase()} 2026 races...\n`);

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

  const races = series === 'f1' ? F1_RACES : MOTOGP_RACES;

  for (const race of races) {
    // Upsert race
    await conn.execute(
      `INSERT INTO races (series, slug, name, season, round, circuit_name, city, country, country_code, circuit_lat, circuit_lng, timezone, race_date, flag_emoji, is_active)
       VALUES (?, ?, ?, 2026, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE
         name=VALUES(name), round=VALUES(round), circuit_name=VALUES(circuit_name),
         city=VALUES(city), country=VALUES(country), country_code=VALUES(country_code),
         circuit_lat=VALUES(circuit_lat), circuit_lng=VALUES(circuit_lng),
         timezone=VALUES(timezone), race_date=VALUES(race_date), flag_emoji=VALUES(flag_emoji)`,
      [series, race.slug, race.name, race.round, race.circuit, race.city, race.country, race.code, race.lat, race.lng, race.tz, race.date, race.flag]
    );

    const [[raceRow]] = await conn.execute('SELECT id FROM races WHERE slug = ?', [race.slug]) as any;
    const raceId = raceRow.id;

    // Seed basic sessions (generic F1 weekend format)
    const sessions = [
      { name: 'Free Practice 1', short: 'FP1', type: 'fp1', day: 'Friday', start: '13:30:00', end: '14:30:00' },
      { name: 'Free Practice 2', short: 'FP2', type: 'fp2', day: 'Friday', start: '17:00:00', end: '18:00:00' },
      { name: 'Free Practice 3', short: 'FP3', type: 'fp3', day: 'Saturday', start: '12:30:00', end: '13:30:00' },
      { name: 'Qualifying',      short: 'QUAL',type: 'qualifying', day: 'Saturday', start: '16:00:00', end: '17:00:00' },
      { name: 'Grand Prix',      short: 'RACE',type: 'race', day: 'Sunday',   start: '15:00:00', end: '17:00:00' },
    ];

    for (const s of sessions) {
      await conn.execute(
        `INSERT IGNORE INTO sessions (race_id, name, short_name, session_type, day_of_week, start_time, end_time)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [raceId, s.name, s.short, s.type, s.day, s.start, s.end]
      );
    }

    console.log(`✅ Seeded ${race.city} (${series.toUpperCase()})`);
  }

  await conn.end();
  console.log(`\n✨ ${series.toUpperCase()} seeding complete!\n`);
}

main().catch(err => {
  console.error('💥 Seeding failed:', err);
  process.exit(1);
});
