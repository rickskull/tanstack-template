import 'express-async-errors';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

import { setupSentry, Sentry } from './loaders/sentry';
import { logger } from './utils/logger';
import { routes } from './routes';
import openApiDocument from '../docs/openapi.json' assert { type: 'json' };
import { errorHandler } from './middleware/error-handler';

setupSentry();

export const createApp = () => {
  const app = express();

  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());

  app.use(helmet());
  app.use(cors({ origin: '*', credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      limit: 120,
      standardHeaders: true,
      legacyHeaders: false
    })
  );

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

  app.use(routes);

  app.use(Sentry.Handlers.errorHandler());
  app.use(errorHandler);

  app.on('close', () => {
    logger.info('HTTP server closing');
  });

  return app;
};

export type AppInstance = ReturnType<typeof createApp>;
