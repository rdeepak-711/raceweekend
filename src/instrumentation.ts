export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { validateEnv } = await import('@/lib/env');
    const { initDatabase } = await import('@/lib/db/init');

    validateEnv();
    await initDatabase();
  }
}
