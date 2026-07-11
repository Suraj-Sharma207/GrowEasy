import Papa from 'papaparse';
import { AppError } from '../../errors/app-error';
import { HttpStatus } from '../../constants/http-status.constants';
import { ParsedCsvData } from '../../types/import.types';

/**
 * Service responsible for parsing raw CSV file buffers into structured JSON objects.
 * Handles character encoding, BOM stripping, and empty line elimination.
 */
export class CsvParsingService {
  /**
   * Parse a CSV buffer to extract header columns, raw rows, and parse errors.
   * 
   * @param buffer - File buffer from upload memory storage.
   * @returns Structured ParsedCsvData containing headers and parsed record rows.
   */
  parseBuffer(buffer: Buffer): ParsedCsvData {
    // Basic BOM handling (strip UTF-8 BOM if present)
    let csvString = buffer.toString('utf8');
    if (csvString.charCodeAt(0) === 0xfeff) {
      csvString = csvString.slice(1);
    }

    const results = Papa.parse<Record<string, string>>(csvString, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (header) => header.trim(),
    });

    if (results.errors.length > 0 && results.data.length === 0) {
      throw new AppError('Failed to parse CSV', HttpStatus.BAD_REQUEST, [
        results.errors[0]?.message || 'Unknown parsing error',
      ]);
    }

    return {
      headers: results.meta.fields || [],
      rows: results.data,
      errors: results.errors,
      meta: {
        delimiter: results.meta.delimiter,
        linebreak: results.meta.linebreak,
        aborted: results.meta.aborted,
        truncated: results.meta.truncated,
        cursor: results.meta.cursor,
      },
    };
  }
}

export const csvParsingService = new CsvParsingService();
