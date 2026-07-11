import { geminiService } from './gemini.service';
import { promptBuilderService } from './prompt-builder.service';
import { responseValidatorService } from './response-validator.service';
import { MappedLeadRow } from '../../types/import.types';

/**
 * Service responsible for mapping raw CSV rows to standard CRM schema using Gemini AI.
 * Handles prompt assembly, execution via Gemini Service, and schema validation on the response.
 */
export class AiMappingService {
  private PROMPT_VERSION = 'crm-import-v1';

  /**
   * Send a batch of CSV rows to Gemini to resolve intelligently to the CRM schema format.
   * 
   * @param batchRows - The subset of raw CSV records to map.
   * @param headers - Complete list of CSV columns.
   * @param hints - Heuristically matched column guesses.
   * @returns Array of mapped lead fields preserving extraction metrics.
   */
  async mapBatch(
    batchRows: Record<string, string>[],
    headers: string[],
    hints: Record<string, string>
  ): Promise<{ mappedRows: MappedLeadRow[]; latencyMs: number }> {
    const startTime = Date.now();

    const { systemInstruction, prompt } = promptBuilderService.buildPrompt(
      this.PROMPT_VERSION,
      headers,
      hints,
      batchRows
    );

    const aiStart = Date.now();
    const rawResponse = await geminiService.generateContent(systemInstruction, prompt);
    const aiEnd = Date.now();
    console.log(`[Performance] AI request (Gemini): ${aiEnd - aiStart}ms`);

    const parseStart = Date.now();
    const mappedRows = responseValidatorService.validate(rawResponse);
    const parseEnd = Date.now();
    console.log(`[Performance] AI response parsing: ${parseEnd - parseStart}ms`);
    const latencyMs = Date.now() - startTime;

    return { mappedRows, latencyMs };
  }
}

export const aiMappingService = new AiMappingService();
