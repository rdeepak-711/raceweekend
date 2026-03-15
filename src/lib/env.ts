import { z } from 'zod';

const isProd = process.env.NODE_ENV === 'production';

const envSchema = z.object({
  // DATABASE
  DATABASE_URL: z.string().optional(),
  DATABASE_HOST: z.string().default(isProd ? '' : 'localhost'),
  DATABASE_PORT: z.coerce.number().default(3306),
  DATABASE_USER: z.string().default(isProd ? '' : 'root'),
  DATABASE_PASSWORD: z.string().default(''),
  DATABASE_NAME: z.string().default('raceweekend'),

  // API KEYS
  TICKETMASTER_API_KEY: z.string().min(1, 'TICKETMASTER_API_KEY is required'),
  OPENF1_BASE_URL: z.string().url().default('https://api.openf1.org/v1'),
  
  // EMAILS
  CONTACT_EMAIL: z.string().email().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),

  // NEXT.JS
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
}).refine((data) => {
  if (process.env.NODE_ENV === 'production') {
    return !!(data.DATABASE_URL || (data.DATABASE_HOST && data.DATABASE_USER));
  }
  return true;
}, {
  message: "In production, either DATABASE_URL or (DATABASE_HOST and DATABASE_USER) must be provided",
  path: ["DATABASE_HOST"],
});

export const env = envSchema.parse(process.env);

export function validateEnv() {
  try {
    envSchema.parse(process.env);
    console.log('[env] Environment variables validated');
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('[env] Invalid environment variables:', error.flatten().fieldErrors);
      throw new Error('Invalid environment variables');
    }
    throw error;
  }
}
