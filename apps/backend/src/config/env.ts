import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  DB_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  MP_PUBLIC_KEY: z.string().min(1),
  MP_ACCESS_TOKEN: z.string().min(1),
  MP_CLIENT_ID: z.string().min(1),
  MP_CLIENT_SECRET: z.string().min(1),
  MP_WEBHOOK_SECRET: z.string().min(1),
  MP_WEBHOOK_URL: z.string().url(),
  FRONT_SUCCESS_URL: z.string().url(),
  FRONT_FAILURE_URL: z.string().url(),
  FRONT_PENDING_URL: z.string().url(),
  PLATFORM_COMMISSION_RATE: z.coerce.number().min(0).max(1).default(0.15),
  MIN_WITHDRAWAL_AMOUNT: z.coerce.number().min(0).default(50),
  PAYOUT_SCHEDULE: z.string(),
  EMAIL_PROVIDER_DSN: z.string().min(1),
  SMS_PROVIDER_API_KEY: z.string().min(1),
  SENTRY_DSN: z.string().min(1),
  TOTP_ISSUER: z.string().default('SkVoid')
});

export const env = envSchema.parse(process.env);
