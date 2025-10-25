import http from 'http';

import { createApp } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { subscriptionService } from './modules/subscriptions/services/subscription.service';

const app = createApp();
const server = http.createServer(app);

subscriptionService
  .ensureSeedPlans()
  .then(() => logger.info('Subscription plans ensured'))
  .catch((error) => logger.error({ error }, 'Failed to ensure plans'));

server.listen(env.PORT, () => {
  logger.info(`Server listening on port ${env.PORT}`);
});

process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down');
  server.close(() => process.exit(0));
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down');
  server.close(() => process.exit(0));
});
