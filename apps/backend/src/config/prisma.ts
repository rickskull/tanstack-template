import { PrismaClient } from '@prisma/client';

import { env } from './env';
import { logger } from '../utils/logger';

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: env.DB_URL
    }
  },
  log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
});

prisma.$use(async (params, next) => {
  const result = await next(params);
  return result;
});

if (env.NODE_ENV !== 'test') {
  prisma
    .$connect()
    .then(() => logger.info('Prisma connected'))
    .catch((error) => {
      logger.error({ error }, 'Prisma connection failed');
    });
}
