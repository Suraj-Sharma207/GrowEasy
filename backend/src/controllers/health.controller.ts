import { Request, Response } from 'express';
import { sendSuccess } from '../utils/api-response.util';
import { SUCCESS_MESSAGES, HttpStatus } from '../constants';

export function getHealthCheck(_req: Request, res: Response): void {
  sendSuccess(
    res,
    {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    SUCCESS_MESSAGES.HEALTH_CHECK,
    HttpStatus.OK
  );
}
