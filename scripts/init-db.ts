import 'dotenv/config';
import mysql from 'mysql2/promise';
import { execSync } from 'node:child_process';
import { join } from 'node:path';

const {
  DATABASE_HOST = 'localhost',
  DATABASE_PORT = '3306',
  DATABASE_USER = 'root',
  DATABASE_PASSWORD = '',
  DATABASE_NAME = 'raceweekend',
} = process.env;

if (!DATABASE_NAME) {
  throw new Error('DATABASE_NAME is required in .env');
}

async function resetDatabase() {
  const connection = await mysql.createConnection({
    host: DATABASE_HOST,
    port: Number(DATABASE_PORT),
    user: DATABASE_USER,
    password: DATABASE_PASSWORD,
    multipleStatements: true,
  });

  console.log(`⏳ Dropping ${DATABASE_NAME}...`);
  await connection.query(`DROP DATABASE IF EXISTS \`${DATABASE_NAME}\`;`);
  console.log(`✅ Created ${DATABASE_NAME}`);
  await connection.query(`CREATE DATABASE \`${DATABASE_NAME}\`;`);
  await connection.end();
}

function runDrizzlePush() {
  console.log('⏳ Running drizzle-kit push...');
  execSync('npx drizzle-kit push --force', {
    stdio: 'inherit',
    cwd: process.cwd(),
  });
}

resetDatabase()
  .then(() => runDrizzlePush())
  .catch((err) => {
    console.error('init-db failed:', err);
    process.exit(1);
  })
  .then(() => {
    console.log('✅ raceweekend database recreated with schema.');
  });
