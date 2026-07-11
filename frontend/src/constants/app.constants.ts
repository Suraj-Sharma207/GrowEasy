export const APP_CONFIG = {
  name: 'GrowEasy CRM',
  tagline: 'AI-powered Lead Import & Management',
  version: '1.0.0',
} as const;

export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1',
  timeout: 30000,
} as const;

export const PAGINATION_DEFAULTS = {
  pageSize: 10,
  pageSizeOptions: [10, 20, 30, 50] as readonly number[],
} as const;
