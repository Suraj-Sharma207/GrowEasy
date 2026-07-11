/**
 * Standard API success response envelope — mirrors backend contract.
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
}

/**
 * Standard API error response envelope — mirrors backend contract.
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  errors: string[];
}

/**
 * Union type for any API response.
 */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Paginated data wrapper for list endpoints.
 */
export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
