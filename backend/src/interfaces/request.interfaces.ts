import { Request } from 'express';

/**
 * Typed request with validated body.
 */
export interface TypedRequestBody<T> extends Request {
  body: T;
}

/**
 * Typed request with validated query parameters.
 */
export interface TypedRequestQuery<T extends Record<string, string | string[] | undefined>>
  extends Request {
  query: T;
}

/**
 * Typed request with validated params.
 */
export interface TypedRequestParams<T extends Record<string, string>>
  extends Request {
  params: T;
}

/**
 * Typed request with both validated body and params.
 */
export interface TypedRequest<
  TBody,
  TParams extends Record<string, string> = Record<string, string>,
> extends Request {
  body: TBody;
  params: TParams;
}
