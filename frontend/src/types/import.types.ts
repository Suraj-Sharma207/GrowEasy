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

export interface ImportWarning {
  rowNumber: number;
  field: string;
  message: string;
  confidenceScore: number;
}

export interface SkippedLeadRecord {
  rowNumber: number;
  email?: string;
  phone?: string;
  reason: string;
  details: string;
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
  uploadedAt: string;
  expiresAt: string;
  status: ImportSessionStatus;
  progressPercent: number;
  currentStage: string;
  metadata: {
    fileSize: number;
    encoding: string;
  };
  preview: PreviewDTO;
  validationReport: ValidationReport;
  possibleMappings: Record<string, string>;
  warnings: ImportWarning[];
  errors: string[];
  summary: ImportSummaryDTO | null;
}
