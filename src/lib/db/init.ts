import mysql from 'mysql2/promise';
import { execSync } from 'child_process';

let initialized = false;

/**
 * Auto-initialize on server startup:
 * 1. Creates the database if it doesn't exist
 * 2. Runs drizzle-kit push to sync tables from schema.ts
 *
 * Safe to call multiple times — only runs once.
 */
export async function initDatabase(): Promise<void> {
  if (initialized) return;

  const dbUrl = process.env.DATABASE_URL;
  let dbName = process.env.DATABASE_NAME ?? 'raceweekend';
  let connectionConfig: any;

  if (dbUrl) {
    // Basic parser for mysql://user:pass@host:port/dbname?...
    try {
      const url = new URL(dbUrl);
      dbName = url.pathname.substring(1); // Remove leading slash
      
      connectionConfig = {
        host: url.hostname,
        port: Number(url.port) || 3306,
        user: url.username,
        password: decodeURIComponent(url.password),
        ssl: url.searchParams.has('ssl') ? { rejectUnauthorized: false } : undefined,
      };
    } catch (e) {
      console.error('[db] Failed to parse DATABASE_URL', e);
      throw e;
    }
  } else {
    connectionConfig = {
      host: process.env.DATABASE_HOST ?? 'localhost',
      port: Number(process.env.DATABASE_PORT) || 3306,
      user: process.env.DATABASE_USER ?? 'root',
      password: process.env.DATABASE_PASSWORD ?? '',
    };
  }

  try {
    const conn = await mysql.createConnection(connectionConfig);

    await conn.execute(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log(`[db] Database '${dbName}' ready`);

    // Manual migrations/patches
    try {
      await conn.query(`USE \`${dbName}\``);
      await conn.query(`ALTER TABLE experiences MODIFY COLUMN distance_km decimal(10,2)`);
      console.log(`[db] Applied distance_km precision patch`);
    } catch (e) {
      // Ignore if table doesn't exist yet
    }

    await conn.end();

    console.log('[db] Syncing tables from schema.ts...');
    execSync('npx drizzle-kit push --force', {
      stdio: 'pipe',
      cwd: process.cwd(),
    });
    console.log('[db] All tables synced from schema.ts');

    initialized = true;
  } catch (error) {
    console.error('[db] Initialization failed:', error);
    throw error;
  }
}

// Support manual CLI execution
if (process.argv.includes('--run')) {
  initDatabase().then(() => {
    console.log('✅ Initialization complete');
    process.exit(0);
  }).catch(err => {
    console.error('❌ Initialization failed');
    process.exit(1);
  });
}
