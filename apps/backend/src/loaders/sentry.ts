import * as Sentry from '@sentry/node';
import '@sentry/tracing';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

import { env } from '../config/env';

export function setupSentry() {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    integrations: [nodeProfilingIntegration()],
    tracesSampleRate: env.NODE_ENV === 'production' ? 0.2 : 1
  });
}

export { Sentry };
