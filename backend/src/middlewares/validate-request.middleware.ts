import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from '../errors/app-error';
import { HttpStatus } from '../constants/http-status.constants';
import { ERROR_MESSAGES } from '../constants/messages.constants';

type ValidationTarget = 'body' | 'query' | 'params';

export function validateRequest(
  schema: ZodSchema,
  target: ValidationTarget = 'body'
) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const result = schema.safeParse(req[target]);

      if (!result.success) {
        const errors = result.error.issues.map(
          (issue) => `${issue.path.join('.')}: ${issue.message}`
        );

        throw new AppError(
          ERROR_MESSAGES.VALIDATION_ERROR,
          HttpStatus.UNPROCESSABLE_ENTITY,
          errors
        );
      }

      req[target] = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
}
