export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { validateEnv } = await import('@/lib/env');
    validateEnv();

    // Only run DB init in development or a specific CI/MIGRATION environment
    // to avoid ECONNREFUSED issues on Vercel startup.
    if (process.env.NODE_ENV === 'development' || process.env.RUN_DB_INIT === 'true') {
      const { initDatabase } = await import('@/lib/db/init');
      await initDatabase();
    }
  }
}
