import createHttpError from 'http-errors';
import { NextFunction, Request, Response } from 'express';

import { logger } from '../utils/logger';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const error = createHttpError.isHttpError(err)
    ? err
    : createHttpError(500, 'Internal Server Error');

  logger.error({ err }, 'Request failed');

  res.status(error.statusCode || 500).json({
    message: error.message,
    details: error,
    statusCode: error.statusCode || 500
  });
}
