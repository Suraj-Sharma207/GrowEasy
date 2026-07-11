export const SUCCESS_MESSAGES = {
  LEADS_FETCHED: 'Leads fetched successfully.',
  STATISTICS_FETCHED: 'Statistics fetched successfully.',
  IMPORT_READY: 'Import endpoint ready for Phase 3',
  HEALTH_CHECK: 'API is healthy',
} as const;

export const ERROR_MESSAGES = {
  VALIDATION_ERROR: 'Validation error.',
  INTERNAL_SERVER_ERROR: 'Internal server error.',
  NOT_FOUND: 'Resource not found.',
} as const;
