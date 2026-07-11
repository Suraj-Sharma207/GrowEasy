import { importSessionRepository } from '../../repositories/import-session.repository';
import { headerAnalyzerService } from './header-analyzer.service';
import { batchExecutor } from './batch-executor.service';
import { leadNormalizerService } from './lead-normalizer.service';
import { duplicateDetectorService } from './duplicate-detector.service';
import { leadValidationService } from './lead-validation.service';
import { bulkImportService } from './bulk-import.service';
import { 
  MappedLeadRow, 
  ProcessedLead, 
  SkippedLeadRecord, 
  ImportWarning, 
  ImportSummaryDTO 
} from '../../types/import.types';

/**
 * Orchestrator class running the async pipeline for CSV Import Sessions.
 * Coordinates parsing, AI mapping, validation, deduplication, and bulk insertion.
 */
export class ImportWorker {
  /**
   * Run the import session processing pipeline.
   * Updates state, counts, stages, and issues logging updates at each milestone.
   * 
   * @param importId - Unique identifier of the session.
   */
  async process(importId: string): Promise<void> {
    const startTime = Date.now();
    const session = await importSessionRepository.findById(importId);
    if (!session) {
      console.error(`[ImportWorker] [ID: ${importId}] Session not found. Cannot start pipeline.`);
      return;
    }

    console.info(`[ImportWorker] [ID: ${importId}] Import Started. Stage: Initializing.`);

    try {
      session.status = 'AI_PROCESSING';
      session.currentStage = 'AI Processing';
      session.progressPercent = 5;
      await importSessionRepository.update(importId, session);

      // Analyze Headers heuristically
      const hints = headerAnalyzerService.analyze(session.preview.detectedColumns.map((c) => c.name));
      session.possibleMappings = hints;

      // 1. AI Batch Execution
      const batches = batchExecutor.constructBatches(session.parsedRows);
      const totalBatches = batches.length;
      
      const mappedRows: MappedLeadRow[] = [];
      let aiProcessingTimeMs = 0;
      let totalLatencyMs = 0;
      let failedBatchesCount = 0;

      for (let i = 0; i < totalBatches; i++) {
        const batch = batches[i];
        if (!batch) continue;
        
        const batchNumber = i + 1;
        const batchStart = Date.now();

        console.info(`[ImportWorker] [ID: ${importId}] [Batch: ${batchNumber}/${totalBatches}] Batch Started. Stage: AI Mapping.`);

        session.currentStage = `AI Processing (Batch ${batchNumber}/${totalBatches})`;
        session.progressPercent = Math.min(45, Math.round(5 + (i / totalBatches) * 40));
        await importSessionRepository.update(importId, session);

        const result = await batchExecutor.executeBatch(
          batch,
          session.preview.detectedColumns.map((c) => c.name),
          hints
        );
        
        const batchDuration = Date.now() - batchStart;
        aiProcessingTimeMs += batchDuration;
        totalLatencyMs += result.latencyMs;

        if (result.error) {
          failedBatchesCount++;
          console.warn(`[ImportWorker] [ID: ${importId}] [Batch: ${batchNumber}/${totalBatches}] Fallback Activated. AI batch mapping failed: ${result.error}`);
          session.errors.push(`Batch ${batchNumber} failed: ${result.error}. Fell back to heuristics.`);
        } else {
          console.info(`[ImportWorker] [ID: ${importId}] [Batch: ${batchNumber}/${totalBatches}] Batch Completed. Stage: AI Mapping. Duration: ${batchDuration}ms.`);
        }

        mappedRows.push(...result.mappedRows);
      }

      session.mappedRows = mappedRows;
      const averageAiBatchLatencyMs = totalBatches > 0 ? totalLatencyMs / totalBatches : 0;

      // 2. Validation & Deduplication & Normalization
      console.info(`[ImportWorker] [ID: ${importId}] Validation Pipeline Started. Stage: Normalization & Deduplication.`);

      session.status = 'VALIDATING';
      session.currentStage = 'Normalizing & Checking Duplicates';
      session.progressPercent = 50;
      await importSessionRepository.update(importId, session);

      const normalizationStart = Date.now();
      const processedLeads: ProcessedLead[] = [];
      const skippedLeads: SkippedLeadRecord[] = [];
      const warnings: ImportWarning[] = [];

      let duplicateCount = 0;
      let invalidCount = 0;

      // 1. Fully normalize ALL rows sequentially first so we can extract emails/phones globally
      const allNormalizedLeads: ProcessedLead[] = [];
      mappedRows.forEach((mappedRow, index) => {
        const rowNumber = index + 1;
        const { lead, warnings: rowWarnings } = leadNormalizerService.normalizeRow(mappedRow, rowNumber);
        warnings.push(...rowWarnings);
        allNormalizedLeads.push(lead);
      });

      // 2. Build global duplicate cache in a single DB query
      const duplicateCache = await duplicateDetectorService.buildGlobalDuplicateCache(allNormalizedLeads);

      // 3. Batch validation logic (retains progress reporting batches)
      const batchSize = 100;
      for (let i = 0; i < allNormalizedLeads.length; i += batchSize) {
        session.progressPercent = Math.min(85, Math.round(50 + (i / allNormalizedLeads.length) * 35));
        await importSessionRepository.update(importId, session);

        const batchLeads = allNormalizedLeads.slice(i, i + batchSize);

        // Batch duplicate check using O(1) cache
        const { duplicates } = duplicateDetectorService.detectDuplicatesWithCache(batchLeads, i, duplicateCache);
        
        // Validate
        batchLeads.forEach((lead, index) => {
          const rowNumber = i + index + 1;

          if (duplicates.has(index)) {
            duplicateCount++;
            skippedLeads.push(duplicates.get(index)!);
            return;
          }

          const validationError = leadValidationService.validateRow(lead, rowNumber);
          if (validationError) {
            invalidCount++;
            skippedLeads.push(validationError);
            return;
          }

          processedLeads.push(lead);
        });
      }

      const normalizationTimeMs = Date.now() - normalizationStart;
      console.info(`[ImportWorker] [ID: ${importId}] Validation Completed. Stage: Normalization & Deduplication. Duration: ${normalizationTimeMs}ms.`);

      session.normalizedRows = processedLeads;
      session.skippedRows = skippedLeads;
      session.warnings = warnings;

      // 3. Database Insertion (Bulk Import)
      console.info(`[ImportWorker] [ID: ${importId}] Database Insert Started. Stage: Bulk Persistence.`);

      session.status = 'IMPORTING';
      session.currentStage = 'Saving Leads to Database';
      session.progressPercent = 90;
      await importSessionRepository.update(importId, session);

      const dbInsertStart = Date.now();
      const totalProcessingTimeMs = Date.now() - startTime;

      await bulkImportService.execute(
        session.fileName,
        processedLeads,
        skippedLeads,
        totalProcessingTimeMs
      );

      const databaseInsertionTimeMs = Date.now() - dbInsertStart;
      console.info(`[ImportWorker] [ID: ${importId}] Database Insert Completed. Stage: Bulk Persistence. Duration: ${databaseInsertionTimeMs}ms.`);

      // 4. Import Summary
      const summary: ImportSummaryDTO = {
        totalRecords: session.parsedRows.length,
        importedCount: processedLeads.length,
        skippedCount: skippedLeads.length,
        duplicateCount,
        invalidCount,
        processingTimeMs: Date.now() - startTime,
        metrics: {
          totalProcessingTimeMs: Date.now() - startTime,
          aiProcessingTimeMs,
          normalizationTimeMs,
          databaseInsertionTimeMs,
          averageAiBatchLatencyMs,
        },
        warnings,
        skippedRecords: skippedLeads,
      };

      session.summary = summary;
      session.status = 'COMPLETED';
      session.currentStage = 'Completed';
      session.progressPercent = 100;
      await importSessionRepository.update(importId, session);

      console.info(`[ImportWorker] [ID: ${importId}] Import Finished. Stage: Completed. Imported: ${processedLeads.length}, Skipped: ${skippedLeads.length}, Total Time: ${Date.now() - startTime}ms.`);
    } catch (error: any) {
      const failedTime = Date.now() - startTime;
      console.error(`[ImportWorker] [ID: ${importId}] Import Failed. Stage: Crashed. Time Elapsed: ${failedTime}ms. Error: ${error.message}`);
      
      session.status = 'FAILED';
      session.currentStage = 'Failed';
      session.progressPercent = 100;
      session.errors.push(`Pipeline error: ${error.message}`);
      await importSessionRepository.update(importId, session);
    }
  }
}

export const importWorker = new ImportWorker();
