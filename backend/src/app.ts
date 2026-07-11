import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { corsOptions } from './config/cors.config';
import { env } from './config/env.config';
import { rootRouter } from './routes';
import { errorHandler } from './middlewares/error-handler.middleware';
import { notFoundHandler } from './middlewares/not-found.middleware';

/**
 * Create and configure the Express application.
 * Follows the factory pattern for testability.
 */
function createApp(): express.Application {
  const app = express();

  // ── Security ──────────────────────────────────────────────
  app.use(helmet());
  app.use(cors(corsOptions));

  // ── Request Parsing ───────────────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ── Logging ───────────────────────────────────────────────
  if (env.NODE_ENV !== 'test') {
    app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
  }

  // ── API Routes ────────────────────────────────────────────
  app.use(`${env.API_PREFIX}`, rootRouter);

  // ── Error Handling ────────────────────────────────────────
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export const app = createApp();
