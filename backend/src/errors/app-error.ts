import { HttpStatusCode } from '../constants/http-status.constants';

/**
 * Custom application error class for operational errors.
 * Non-operational errors (bugs) should not use this class.
 */
export class AppError extends Error {
  public readonly statusCode: HttpStatusCode;
  public readonly isOperational: boolean;
  public readonly errors: string[];

  constructor(
    message: string,
    statusCode: HttpStatusCode,
    errors: string[] = [],
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;

    // Maintains proper stack trace for where the error was thrown
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
