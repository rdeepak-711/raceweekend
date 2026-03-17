
import 'dotenv/config';
import mysql from 'mysql2/promise';

async function verify() {
  const conn = await mysql.createConnection({
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: Number(process.env.DATABASE_PORT) || 3306,
    user: process.env.DATABASE_USER ?? 'root',
    password: process.env.DATABASE_PASSWORD ?? '',
    database: process.env.DATABASE_NAME ?? 'raceweekend',
  });

  const [sessions] = await conn.execute(
    'SELECT name, day_of_week, start_time, end_time FROM sessions WHERE race_id = 46 ORDER BY day_of_week, start_time'
  );

  console.log('--- Current Sessions for Race 46 (Brazil MotoGP 2026) ---');
  console.table(sessions);

  await conn.end();
}

verify().catch(console.error);
