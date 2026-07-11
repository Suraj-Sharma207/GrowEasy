import { AppError } from '../../errors/app-error';
import { HttpStatus } from '../../constants/http-status.constants';
import { ColumnAnalysis, ParsedCsvData, ValidationReport } from '../../types/import.types';

/**
 * Service responsible for validating raw CSV structures against scale limits.
 * Inspects column headers for empty entries or duplicates, and counts malformed rows.
 */
export class CsvValidationService {
  private MAX_ROWS = 10000;
  private MAX_COLS = 100;

  /**
   * Run structural audits on parsed CSV data.
   * 
   * @param parsedData - Structured output from CSV parsing.
   * @returns ColumnAnalysis list and overall ValidationReport summary.
   */
  analyze(parsedData: ParsedCsvData): {
    columnAnalysis: ColumnAnalysis[];
    validationReport: ValidationReport;
    status: 'Valid' | 'Warning' | 'Error';
  } {
    const { headers, rows, errors } = parsedData;

    if (rows.length > this.MAX_ROWS) {
      throw new AppError(
        `File exceeds maximum row limit of ${this.MAX_ROWS}.`,
        HttpStatus.BAD_REQUEST
      );
    }
    if (headers.length > this.MAX_COLS) {
      throw new AppError(
        `File exceeds maximum column limit of ${this.MAX_COLS}.`,
        HttpStatus.BAD_REQUEST
      );
    }

    // Analyze Columns
    const columnAnalysis: ColumnAnalysis[] = [];
    const headerCounts: Record<string, number> = {};
    
    for (const h of headers) {
      const name = h.trim();
      headerCounts[name] = (headerCounts[name] || 0) + 1;
    }

    for (const h of headers) {
      const name = h.trim();
      columnAnalysis.push({
        name,
        isEmpty: name === '',
        isDuplicate: (headerCounts[name] || 0) > 1,
        isSuspicious: name.length > 50 || name.startsWith('Unnamed'),
      });
    }

    // Validation Report
    const duplicateHeaders = Object.keys(headerCounts).filter(k => (headerCounts[k] || 0) > 1);
    const emptyHeadersCount = columnAnalysis.filter(c => c.isEmpty).length;
    
    // PapaParse stores malformed rows in errors
    // A row is invalid if it has a different number of columns than headers, etc.
    const invalidRowsCount = errors.filter(e => e.type === 'FieldMismatch').length;
    
    // We already used skipEmptyLines: 'greedy' in parsing, so empty rows should be 0 in data,
    // but maybe we can count them if needed. For now, it's 0.
    const emptyRowsCount = 0; 
    
    const validRowsCount = rows.length - invalidRowsCount;

    const validationReport: ValidationReport = {
      validRowsCount: Math.max(0, validRowsCount),
      invalidRowsCount,
      emptyRowsCount,
      duplicateHeaders,
      emptyHeadersCount,
    };

    let status: 'Valid' | 'Warning' | 'Error' = 'Valid';
    if (duplicateHeaders.length > 0 || invalidRowsCount > 0 || emptyHeadersCount > 0) {
      status = 'Warning';
    }
    if (validRowsCount === 0) {
      status = 'Error';
    }

    return { columnAnalysis, validationReport, status };
  }
}

export const csvValidationService = new CsvValidationService();
