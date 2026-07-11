import { randomUUID } from 'crypto';
import { csvParsingService } from './csv-parsing.service';
import { csvValidationService } from './csv-validation.service';
import { importSessionRepository } from '../../repositories/import-session.repository';
import { ImportSession, PreviewDTO } from '../../types/import.types';
import { AppError } from '../../errors/app-error';
import { HttpStatus } from '../../constants/http-status.constants';

/**
 * Service responsible for orchestrating file ingestion and session setup.
 * Parses file, runs metadata validations, prepares the 20-row preview payload, and stores the session.
 */
export class CsvPreviewService {
  /**
   * Generates a new ImportSession DTO based on the uploaded file and stores it.
   * 
   * @param file - Uploaded Multer file configuration.
   * @returns The constructed ImportSession ready for review.
   */
  async generateSession(file: Express.Multer.File): Promise<ImportSession> {
    if (!file.buffer) {
      throw new AppError('File buffer is missing (must use memoryStorage).', HttpStatus.BAD_REQUEST);
    }
    
    // Parse the file in-memory
    const parseStart = Date.now();
    const parsedData = csvParsingService.parseBuffer(file.buffer);
    const parseEnd = Date.now();
    console.log(`[Performance] CSV parsing: ${parseEnd - parseStart}ms`);

    if (parsedData.rows.length === 0) {
      throw new AppError('CSV file is empty or contains only headers.', HttpStatus.BAD_REQUEST);
    }

    // Analyze the parsed data
    const validationStart = Date.now();
    const { columnAnalysis, validationReport, status } = csvValidationService.analyze(parsedData);
    const validationEnd = Date.now();
    console.log(`[Performance] CSV validation: ${validationEnd - validationStart}ms`);

    const previewStart = Date.now();
    const importId = randomUUID();

    const preview: PreviewDTO = {
      importId,
      fileName: file.originalname,
      fileSize: file.size,
      totalRows: parsedData.rows.length,
      detectedColumns: columnAnalysis,
      encoding: 'UTF-8',
      validationStatus: status,
      validationReport,
      previewRows: parsedData.rows.slice(0, 20),
    };
    const previewEnd = Date.now();
    console.log(`[Performance] Preview generation: ${previewEnd - previewStart}ms`);

    const sessionStart = Date.now();
    const session: ImportSession = {
      id: importId,
      fileName: file.originalname,
      uploadedAt: new Date(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour TTL
      status: 'PREVIEW_READY',
      progressPercent: 100,
      currentStage: 'Preview Ready',
      metadata: {
        fileSize: file.size,
        encoding: 'UTF-8',
      },
      preview,
      validationReport,
      possibleMappings: {},
      parsedRows: parsedData.rows,
      mappedRows: [],
      normalizedRows: [],
      skippedRows: [],
      warnings: [],
      errors: [],
      summary: null,
    };

    // Store in our repository abstraction
    await importSessionRepository.create(session);
    const sessionEnd = Date.now();
    console.log(`[Performance] ImportSession creation: ${sessionEnd - sessionStart}ms`);

    return session;
  }
}

export const csvPreviewService = new CsvPreviewService();
