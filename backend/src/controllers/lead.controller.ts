import { Request, Response } from 'express';
import { z } from 'zod';
import { leadService } from '../services/lead.service';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../constants/messages.constants';

const getLeadsSchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val) : 10)),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  status: z.string().optional(),
  company: z.string().optional(),
  city: z.string().optional(),
});

export class LeadController {
  async getLeads(req: Request, res: Response) {
    try {
      const query = getLeadsSchema.parse(req.query);
      const data = await leadService.getLeads(query);

      res.status(200).json({
        success: true,
        message: SUCCESS_MESSAGES.LEADS_FETCHED,
        data,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: ERROR_MESSAGES.VALIDATION_ERROR,
          errors: (error as z.ZodError<any>).issues.map((e: any) => e.message),
        });
        return;
      }

      console.error('Error fetching leads:', error);
      res.status(500).json({
        success: false,
        message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        errors: [String(error), error instanceof Error ? error.stack : ''],
      });
    }
  }

  async getStatistics(_req: Request, res: Response) {
    try {
      const data = await leadService.getStatistics();

      res.status(200).json({
        success: true,
        message: SUCCESS_MESSAGES.STATISTICS_FETCHED,
        data,
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      res.status(500).json({
        success: false,
        message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        errors: [(error as Error).message],
      });
    }
  }
}

export const leadController = new LeadController();
