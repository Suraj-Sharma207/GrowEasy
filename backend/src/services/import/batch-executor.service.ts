import { aiMappingService } from './ai-mapping.service';
import { MappedLeadRow, MappedField } from '../../types/import.types';

/**
 * Service responsible for constructing batches of records and orchestrating execution.
 * Handles progress logging, retries, and falling back to heuristic models if AI processing fails.
 */
export class BatchExecutor {
  /**
   * Processes a single batch of records. First delegates to the AI mapping service.
   * If AI mapping crashes, falls back to local heuristic mappings as a safety net.
   * 
   * @param batchRows - Subsection of CSV records to map.
   * @param headers - Complete array of parsed CSV columns.
   * @param hints - Guess matches for CRM fields.
   */
  async executeBatch(
    batchRows: Record<string, string>[],
    headers: string[],
    hints: Record<string, string>
  ): Promise<{ mappedRows: MappedLeadRow[]; latencyMs: number; error: string | null }> {
    const startTime = Date.now();
    try {
      const result = await aiMappingService.mapBatch(batchRows, headers, hints);
      return { mappedRows: result.mappedRows, latencyMs: result.latencyMs, error: null };
    } catch (err: any) {
      // Heuristic Fallback
      const mappedRows = batchRows.map((row) => {
        const mappedRow: MappedLeadRow = {};
        
        for (const [header, crmField] of Object.entries(hints)) {
          const value = row[header];
          const mappedField: MappedField = {
            extractedValue: value === undefined ? null : value,
            confidenceScore: 0.5, // Low confidence score for heuristic mappings
            detectedSourceColumn: header,
          };
          // @ts-ignore
          mappedRow[crmField] = mappedField;
        }

        return mappedRow;
      });

      const latencyMs = Date.now() - startTime;
      return { mappedRows, latencyMs, error: err.message };
    }
  }

  /**
   * Partitions the complete list of CSV parsed records into manageable chunks.
   * Adaptive batch sizing:
   * - <= 20 rows: single batch
   * - <= 200 rows: batches of 50
   * - > 200 rows: batches of 100
   * 
   * @param rows - Complete list of records.
   * @returns Array of grouped batches.
   */
  constructBatches(rows: Record<string, string>[]): Record<string, string>[][] {
    const totalRows = rows.length;
    let batchSize = 100;
    
    if (totalRows <= 20) {
      batchSize = Math.max(1, totalRows); // At least 1
    } else if (totalRows <= 200) {
      batchSize = 50;
    } else {
      batchSize = 100;
    }

    const batches: Record<string, string>[][] = [];
    for (let i = 0; i < totalRows; i += batchSize) {
      batches.push(rows.slice(i, i + batchSize));
    }
    return batches;
  }
}

export const batchExecutor = new BatchExecutor();
