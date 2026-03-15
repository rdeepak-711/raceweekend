require('dotenv/config');
const mysql = require('mysql2/promise');
const { execSync } = require('child_process');
const { join } = require('path');

const {
  DATABASE_HOST = 'localhost',
  DATABASE_PORT = '3306',
  DATABASE_USER = 'root',
  DATABASE_PASSWORD = '',
  DATABASE_NAME = 'raceweekend',
} = process.env;

if (!DATABASE_NAME) {
  throw new Error('DATABASE_NAME must be set in your .env');
}

async function recreateDatabase() {
  const connection = await mysql.createConnection({
    host: DATABASE_HOST,
    port: Number(DATABASE_PORT),
    user: DATABASE_USER,
    password: DATABASE_PASSWORD,
    multipleStatements: true,
  });

  console.log(`Dropping database ${DATABASE_NAME} (if exists)...`);
  await connection.query(`DROP DATABASE IF EXISTS \`${DATABASE_NAME}\`;`);
  console.log(`Creating database ${DATABASE_NAME}...`);
  await connection.query(`CREATE DATABASE \`${DATABASE_NAME}\`;`);
  await connection.end();
}

function runDrizzlePush() {
  console.log('Running drizzle-kit push...');
  execSync('npx drizzle-kit push --force', {
    stdio: 'inherit',
    cwd: join(__dirname, '..'),
  });
}

recreateDatabase()
  .then(() => runDrizzlePush())
  .then(() => console.log(`Database ${DATABASE_NAME} ready.`))
  .catch((err) => {
    console.error('Failed to initialize raceweekend db:', err);
    process.exit(1);
  });
