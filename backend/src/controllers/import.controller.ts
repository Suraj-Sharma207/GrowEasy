import { Request, Response } from 'express';
import { importSessionRepository } from '../repositories/import-session.repository';
import { csvPreviewService } from '../services/import/csv-preview.service';
import { importWorker } from '../services/import/import-worker.service';
import { ERROR_MESSAGES } from '../constants/messages.constants';

export class ImportController {
  async analyzeCsv(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No file uploaded.',
          errors: [],
        });
        return;
      }

      if (req.file.mimetype !== 'text/csv' && req.file.mimetype !== 'application/vnd.ms-excel') {
        res.status(400).json({
          success: false,
          message: 'Invalid file type. Only CSV files are allowed.',
          errors: [],
        });
        return;
      }

      const session = await csvPreviewService.generateSession(req.file);

      res.status(200).json({
        success: true,
        message: 'CSV analyzed and import session created.',
        data: session.preview, // Return preview to match frontend DTO expectations
      });
    } catch (error: any) {
      console.error('Error analyzing CSV:', error);
      res.status(500).json({
        success: false,
        message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        errors: [error.message || String(error)],
      });
    }
  }

  async getSession(req: Request, res: Response): Promise<void> {
    try {
      const importId = req.params.importId as string;
      if (!importId) {
        res.status(400).json({
          success: false,
          message: 'Missing importId.',
          errors: [],
        });
        return;
      }

      const session = await importSessionRepository.findById(importId);
      if (!session) {
        res.status(404).json({
          success: false,
          message: 'Import session not found or expired.',
          errors: [],
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Session retrieved successfully.',
        data: session,
      });
    } catch (error: any) {
      console.error('Error retrieving session:', error);
      res.status(500).json({
        success: false,
        message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        errors: [error.message || String(error)],
      });
    }
  }

  async processImport(req: Request, res: Response): Promise<void> {
    try {
      const { importId } = req.body;
      if (!importId) {
        res.status(400).json({
          success: false,
          message: 'Missing importId.',
          errors: [],
        });
        return;
      }

      const session = await importSessionRepository.findById(importId);
      if (!session) {
        res.status(404).json({
          success: false,
          message: 'Import session not found or expired.',
          errors: [],
        });
        return;
      }

      // Check if already processing
      if (session.status === 'AI_PROCESSING' || session.status === 'VALIDATING' || session.status === 'IMPORTING') {
        res.status(400).json({
          success: false,
          message: 'Import is already in progress.',
          errors: [],
        });
        return;
      }

      // Kick off background execution asynchronously as required
      importWorker.process(importId).catch((err) => {
        console.error(`[ImportController] Async worker crashed for ${importId}:`, err);
      });

      res.status(202).json({
        success: true,
        message: 'Import processing started in background.',
        data: { importId },
      });
    } catch (error: any) {
      console.error('Error starting import:', error);
      res.status(500).json({
        success: false,
        message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        errors: [error.message || String(error)],
      });
    }
  }
}

export const importController = new ImportController();
