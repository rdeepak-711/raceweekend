require('dotenv/config');
const mysql = require('mysql2/promise');

const {
  DATABASE_HOST = 'localhost',
  DATABASE_PORT = '3306',
  DATABASE_USER = 'root',
  DATABASE_PASSWORD = '',
  DATABASE_NAME = 'raceweekend',
} = process.env;

const races = [
  {
    slug: 'rw-f1-melbourne',
    name: 'Australian Grand Prix 2026',
    season: 2026,
    round: 1,
    circuit_name: 'Albert Park Circuit',
    city: 'Melbourne',
    country: 'Australia',
    country_code: 'AU',
    circuit_lat: -37.8497,
    circuit_lng: 144.968,
    timezone: 'Australia/Melbourne',
    race_date: '2026-03-08',
  },
  {
    slug: 'rw-f1-shanghai',
    name: 'Chinese Grand Prix 2026',
    season: 2026,
    round: 2,
    circuit_name: 'Shanghai International Circuit',
    city: 'Shanghai',
    country: 'China',
    country_code: 'CN',
    circuit_lat: 31.3389,
    circuit_lng: 121.2201,
    timezone: 'Asia/Shanghai',
    race_date: '2026-03-15',
  },
  {
    slug: 'rw-f1-suzuka',
    name: 'Japanese Grand Prix 2026',
    season: 2026,
    round: 3,
    circuit_name: 'Suzuka Circuit',
    city: 'Suzuka',
    country: 'Japan',
    country_code: 'JP',
    circuit_lat: 34.8431,
    circuit_lng: 136.5407,
    timezone: 'Asia/Tokyo',
    race_date: '2026-03-29',
  },
  {
    slug: 'rw-f1-bahrain',
    name: 'Bahrain Grand Prix 2026',
    season: 2026,
    round: 4,
    circuit_name: 'Bahrain International Circuit',
    city: 'Sakhir',
    country: 'Bahrain',
    country_code: 'BH',
    circuit_lat: 26.0325,
    circuit_lng: 50.5106,
    timezone: 'Asia/Bahrain',
    race_date: '2026-04-12',
  },
  {
    slug: 'rw-f1-saudi',
    name: 'Saudi Arabian Grand Prix 2026',
    season: 2026,
    round: 5,
    circuit_name: 'Jeddah Corniche Circuit',
    city: 'Jeddah',
    country: 'Saudi Arabia',
    country_code: 'SA',
    circuit_lat: 21.6219,
    circuit_lng: 39.1044,
    timezone: 'Asia/Riyadh',
    race_date: '2026-04-19',
  },
  {
    slug: 'rw-f1-miami',
    name: 'Formula 1 Crypto.com Miami Grand Prix 2026',
    season: 2026,
    round: 6,
    circuit_name: 'Miami International Autodrome',
    city: 'Miami',
    country: 'United States',
    country_code: 'US',
    circuit_lat: 25.9581,
    circuit_lng: -80.2389,
    timezone: 'America/New_York',
    race_date: '2026-05-03',
  },
];

async function seed() {
  const connection = await mysql.createConnection({
    host: DATABASE_HOST,
    port: Number(DATABASE_PORT),
    user: DATABASE_USER,
    password: DATABASE_PASSWORD,
    database: DATABASE_NAME,
  });

  await connection.beginTransaction();
  try {
    for (const race of races) {
      const sql = `
        INSERT INTO races (slug, name, season, round, circuit_name, city, country, country_code, circuit_lat, circuit_lng, timezone, race_date, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true)
        ON DUPLICATE KEY UPDATE
          name=VALUES(name),
          season=VALUES(season),
          round=VALUES(round),
          circuit_name=VALUES(circuit_name),
          city=VALUES(city),
          country=VALUES(country),
          country_code=VALUES(country_code),
          circuit_lat=VALUES(circuit_lat),
          circuit_lng=VALUES(circuit_lng),
          timezone=VALUES(timezone),
          race_date=VALUES(race_date),
          is_active=VALUES(is_active)
      `;
      await connection.execute(sql, [
        race.slug,
        race.name,
        race.season,
        race.round,
        race.circuit_name,
        race.city,
        race.country,
        race.country_code,
        race.circuit_lat,
        race.circuit_lng,
        race.timezone,
        race.race_date,
      ]);
    }
    await connection.commit();
    console.log('Inserted race rows for the six F1 events.');
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    await connection.end();
  }
}

seed().catch((err) => {
  console.error('seed-races failed:', err);
  process.exit(1);
});
