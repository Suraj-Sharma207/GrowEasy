export type ImportSessionStatus =
  | 'UPLOADED'
  | 'PREVIEW_READY'
  | 'AI_PROCESSING'
  | 'VALIDATING'
  | 'IMPORTING'
  | 'COMPLETED'
  | 'FAILED'
  | 'EXPIRED';

export interface ColumnAnalysis {
  name: string;
  isDuplicate: boolean;
  isEmpty: boolean;
  isSuspicious: boolean;
}

export interface ValidationReport {
  validRowsCount: number;
  invalidRowsCount: number;
  emptyRowsCount: number;
  duplicateHeaders: string[];
  emptyHeadersCount: number;
}

export interface PreviewDTO {
  importId: string;
  fileName: string;
  fileSize: number;
  totalRows: number;
  detectedColumns: ColumnAnalysis[];
  encoding: string;
  validationStatus: 'Valid' | 'Warning' | 'Error';
  validationReport: ValidationReport;
  previewRows: Record<string, string>[];
}

export interface ParsedCsvData {
  headers: string[];
  rows: Record<string, string>[];
  errors: any[];
  meta: {
    delimiter: string;
    linebreak: string;
    aborted: boolean;
    truncated: boolean;
    cursor: number;
  };
}

// Preserve extraction metrics per field
export interface MappedField {
  extractedValue: string | null;
  confidenceScore: number; // 0 to 1
  detectedSourceColumn: string | null;
}

// Mapped record representing a single lead before normalizations
export interface MappedLeadRow {
  name?: MappedField;
  email?: MappedField;
  phone?: MappedField;
  company?: MappedField;
  city?: MappedField;
  state?: MappedField;
  country?: MappedField;
  leadOwner?: MappedField;
  crmNote?: MappedField;
  description?: MappedField;
  dataSource?: MappedField;
  possessionTime?: MappedField;
  createdDate?: MappedField;
}

// Normalized & Validated Lead ready for database insertion
export interface ProcessedLead {
  name: string;
  email: string;
  countryCode: string;
  mobileWithoutCountryCode: string;
  company: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  leadOwner: string;
  crmStatus: string; // CRMStatus enum
  crmNote: string | null;
  description: string | null;
  dataSource: string;
  possessionTime: Date | null;
  createdAt: Date;
}

export interface SkippedLeadRecord {
  rowNumber: number;
  email?: string;
  phone?: string;
  reason: 'DUPLICATE_EMAIL' | 'DUPLICATE_PHONE' | 'INVALID_FORMAT' | 'MISSING_REQUIRED';
  details: string;
}

export interface ImportWarning {
  rowNumber: number;
  field: string;
  message: string;
  confidenceScore: number;
}

export interface ImportMetrics {
  totalProcessingTimeMs: number;
  aiProcessingTimeMs: number;
  normalizationTimeMs: number;
  databaseInsertionTimeMs: number;
  averageAiBatchLatencyMs: number;
}

export interface ImportSummaryDTO {
  totalRecords: number;
  importedCount: number;
  skippedCount: number;
  duplicateCount: number;
  invalidCount: number;
  processingTimeMs: number;
  metrics: ImportMetrics;
  warnings: ImportWarning[];
  skippedRecords: SkippedLeadRecord[];
}

export interface ImportSession {
  id: string;
  fileName: string;
  uploadedAt: Date;
  expiresAt: Date;
  status: ImportSessionStatus;
  progressPercent: number;
  currentStage: string;
  metadata: {
    fileSize: number;
    encoding: string;
  };
  preview: PreviewDTO;
  validationReport: ValidationReport;
  possibleMappings: Record<string, string>; // heuristic column mapping results
  parsedRows: Record<string, string>[];
  mappedRows: MappedLeadRow[];
  normalizedRows: ProcessedLead[];
  skippedRows: SkippedLeadRecord[];
  warnings: ImportWarning[];
  errors: string[];
  summary: ImportSummaryDTO | null;
}
