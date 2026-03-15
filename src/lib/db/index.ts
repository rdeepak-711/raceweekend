import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

/**
 * APEX Singleton Database Connection
 * Prevents connection leaks during Next.js hot-reloading in development.
 */

const globalForDb = global as unknown as {
  pool: mysql.Pool | undefined;
};

const isProd = process.env.NODE_ENV === 'production';

// Fail early if no DB config is present in production
if (isProd && !process.env.DATABASE_URL && !process.env.DATABASE_HOST) {
  throw new Error('[db] Missing database connection details (DATABASE_URL or DATABASE_HOST)');
}

const poolConfig: mysql.PoolOptions = process.env.DATABASE_URL 
  ? { uri: process.env.DATABASE_URL }
  : {
      host: process.env.DATABASE_HOST || (isProd ? '' : 'localhost'),
      port: Number(process.env.DATABASE_PORT) || 3306,
      user: process.env.DATABASE_USER || (isProd ? '' : 'root'),
      password: process.env.DATABASE_PASSWORD ?? '',
      database: process.env.DATABASE_NAME || 'raceweekend',
      waitForConnections: true,
      connectionLimit: 10,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
      ssl: process.env.DATABASE_HOST && process.env.DATABASE_HOST !== 'localhost'
        ? { rejectUnauthorized: false, minVersion: 'TLSv1.2' }
        : undefined,
    };

export const pool = globalForDb.pool ?? mysql.createPool(poolConfig);

if (process.env.NODE_ENV !== 'production') {
  globalForDb.pool = pool;
}

export const db = drizzle(pool, { schema, mode: 'default' });
