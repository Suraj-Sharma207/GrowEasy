import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { AppError } from '../errors/app-error';
import { HttpStatus } from '../constants/http-status.constants';
import { ERROR_MESSAGES } from '../constants/messages.constants';
import { sendError } from '../utils/api-response.util';
import { env } from '../config/env.config';

/**
 * Central error handling middleware.
 * Catches all errors thrown in route handlers and middlewares.
 */
export const errorHandler: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Handle known operational errors
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode, err.errors);
    return;
  }

  // Log unexpected errors in development
  if (env.NODE_ENV === 'development') {
    console.error('❌ Unexpected Error:', err);
  }

  // Handle unexpected errors — never leak internal details
  sendError(
    res,
    ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    HttpStatus.INTERNAL_SERVER_ERROR
  );
};
