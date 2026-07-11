import { Response } from 'express';
import { HttpStatusCode, HttpStatus } from '../constants/http-status.constants';
import { ERROR_MESSAGES } from '../constants/messages.constants';
import type { ApiSuccessResponse, ApiErrorResponse } from '../types/api-response.types';

/**
 * Send a standardized success response.
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: HttpStatusCode = HttpStatus.OK
): Response<ApiSuccessResponse<T>> {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

/**
 * Send a standardized error response.
 */
export function sendError(
  res: Response,
  message: string = ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
  statusCode: HttpStatusCode = HttpStatus.INTERNAL_SERVER_ERROR,
  errors: string[] = []
): Response<ApiErrorResponse> {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
}
