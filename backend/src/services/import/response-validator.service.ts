import { z } from 'zod';
import { MappedLeadRow } from '../../types/import.types';
import { AppError } from '../../errors/app-error';
import { HttpStatus } from '../../constants/http-status.constants';

const mappedFieldSchema = z.object({
  extractedValue: z.preprocess((val) => (val === undefined ? null : val), z.any().transform((v) => (v === null ? null : String(v)))),
  confidenceScore: z.preprocess((val) => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      const parsed = parseFloat(val);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }, z.number().min(0).max(1)),
  detectedSourceColumn: z.preprocess((val) => (val === undefined ? null : val), z.string().nullable()),
});

const mappedLeadRowSchema = z.object({
  name: mappedFieldSchema.optional(),
  email: mappedFieldSchema.optional(),
  phone: mappedFieldSchema.optional(),
  company: mappedFieldSchema.optional(),
  city: mappedFieldSchema.optional(),
  state: mappedFieldSchema.optional(),
  country: mappedFieldSchema.optional(),
  leadOwner: mappedFieldSchema.optional(),
  crmNote: mappedFieldSchema.optional(),
  description: mappedFieldSchema.optional(),
  dataSource: mappedFieldSchema.optional(),
  possessionTime: mappedFieldSchema.optional(),
  createdDate: mappedFieldSchema.optional(),
});

const aiResponseSchema = z.array(mappedLeadRowSchema);

/**
 * Service responsible for validating raw string content returned from Gemini.
 * Sanitizes markdown backticks, parses JSON structures, and validates schemas using Zod.
 */
export class ResponseValidatorService {
  /**
   * Sanitizes and parses raw text output into MappedLeadRow array.
   * 
   * @param rawText - AI generated completion response.
   * @returns Array of mapped lead objects matching schema specifications.
   */
  validate(rawText: string): MappedLeadRow[] {
    try {
      // Find JSON block if Gemini wrapped in markdown backticks
      let cleanText = rawText.trim();
      const match = cleanText.match(/```json\s*([\s\S]*?)\s*```/);
      if (match && match[1]) {
        cleanText = match[1].trim();
      }

      const parsed = JSON.parse(cleanText);
      const validated = aiResponseSchema.safeParse(parsed);

      if (!validated.success) {
        throw new AppError(
          `AI Response validation failed: ${validated.error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      return validated.data;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        `Failed to parse or validate AI response: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }
}

export const responseValidatorService = new ResponseValidatorService();
