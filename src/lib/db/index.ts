import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';
import { env } from '@/lib/env';

/**
 * APEX Singleton Database Connection
 * Prevents connection leaks during Next.js hot-reloading in development.
 */

const globalForDb = global as unknown as {
  pool: mysql.Pool | undefined;
};

const isProd = process.env.NODE_ENV === 'production' && !!process.env.VERCEL;

// Sanitize DATABASE_URL (remove single quotes if they exist)
const rawUrl = env.DATABASE_URL?.replace(/^'|'$/g, '');

const host = env.DATABASE_HOST;
const isLocal = host === 'localhost' || host === '127.0.0.1' || !host;

if (isProd && !rawUrl && isLocal) {
  throw new Error(`[db] STOPSHIP: Production build is attempting to connect to local database (${host || 'empty host'}). Please verify DATABASE_URL or DATABASE_HOST in Vercel settings.`);
}

console.log(`[db] Initializing connection pool to: ${rawUrl ? 'EXTERNAL_URL' : host}`);

const poolConfig: mysql.PoolOptions = rawUrl 
  ? { uri: rawUrl }
  : {
      host: env.DATABASE_HOST,
      port: env.DATABASE_PORT,
      user: env.DATABASE_USER,
      password: env.DATABASE_PASSWORD,
      database: env.DATABASE_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
      ssl: env.DATABASE_HOST && env.DATABASE_HOST !== 'localhost'
        ? { rejectUnauthorized: false, minVersion: 'TLSv1.2' }
        : undefined,
    };

export const pool = globalForDb.pool ?? mysql.createPool(poolConfig);

if (process.env.NODE_ENV !== 'production') {
  globalForDb.pool = pool;
}

export const db = drizzle(pool, { schema, mode: 'default' });
