import { config } from 'dotenv';
import path from 'path';
config({ path: path.join(process.env.HOME!, 'Desktop/.secrets/raceweekend.env') });
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    schema: './src/lib/db/schema.ts',
    out: './drizzle',
    dialect: 'mysql',
    dbCredentials: {
        host: process.env.TIDB_HOST!,
        port: Number(process.env.TIDB_PORT) || 4000,
        user: process.env.TIDB_USER!,
        password: process.env.TIDB_PASSWORD!,
        database: process.env.TIDB_DB!,
        ssl: {},
    },
});
