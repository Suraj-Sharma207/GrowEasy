import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error';
import { HttpStatus } from '../constants/http-status.constants';
import { ERROR_MESSAGES } from '../constants/messages.constants';

/**
 * Catch-all middleware for undefined routes.
 */
export function notFoundHandler(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const error = new AppError(
    `${ERROR_MESSAGES.NOT_FOUND}: ${req.method} ${req.originalUrl}`,
    HttpStatus.NOT_FOUND
  );
  next(error);
}
