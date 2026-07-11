import axios from 'axios';
import { API_CONFIG } from '@/constants/app.constants';
import type { ApiErrorResponse } from '@/types/api.types';

/**
 * Pre-configured Axios instance for all API requests.
 * Centralizes base URL, timeout, headers, and error interceptors.
 */
const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Response interceptor — extracts data or throws structured errors.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const apiError = error.response?.data as ApiErrorResponse | undefined;

      if (apiError && !apiError.success) {
        const enrichedError = new Error(apiError.message);
        (enrichedError as Error & { errors: string[] }).errors = apiError.errors;
        return Promise.reject(enrichedError);
      }
    }

    return Promise.reject(error);
  }
);

export { apiClient };
