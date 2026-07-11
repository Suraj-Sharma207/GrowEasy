import { GoogleGenerativeAI } from '@google/generative-ai';
import { AppError } from '../../errors/app-error';
import { HttpStatus } from '../../constants/http-status.constants';

/**
 * Wrapper service for calling Google Gemini Generative AI SDK.
 * Handles API key initialization, timeouts, exponential retry policies, and JSON mapping responses.
 */
export class GeminiService {
  private ai: GoogleGenerativeAI | null = null;
  private modelName = 'gemini-2.5-flash';

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.ai = new GoogleGenerativeAI(apiKey);
    } else {
      console.warn('⚠️ GEMINI_API_KEY is not set. AI import mapping will fall back to heuristic header analysis.');
    }
  }

  /**
   * Invoke Gemini API to generate structured content based on prompt and system instructions.
   * Includes exponential backoff and absolute timeout handling.
   * 
   * @param systemInstruction - Constraints and roles for the AI.
   * @param prompt - Compiled batch data and schema.
   * @param retryCount - Maximum count of retries before throwing error.
   * @param timeoutMs - Max execution time before aborting connection.
   * @returns Raw response text (expected JSON structure).
   */
  async generateContent(
    systemInstruction: string,
    prompt: string,
    retryCount = 2,
    timeoutMs = 60000
  ): Promise<string> {
    if (!this.ai) {
      throw new AppError('Gemini API is not configured (missing GEMINI_API_KEY).', HttpStatus.SERVICE_UNAVAILABLE);
    }

    let attempt = 0;
    while (attempt <= retryCount) {
      try {
        const model = this.ai.getGenerativeModel({
          model: this.modelName,
          systemInstruction,
          generationConfig: {
            responseMimeType: 'application/json',
          },
        });

        const fetchPromise = model.generateContent(prompt);

        let timeoutId: NodeJS.Timeout;
        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error('Request Timeout')), timeoutMs);
        });

        const response = await Promise.race([fetchPromise, timeoutPromise]);
        clearTimeout(timeoutId!);
        
        const text = response.response.text();
        if (!text) {
          throw new Error('Empty response from Gemini.');
        }

        return text;
      } catch (error: any) {
        attempt++;
        console.warn(`[GeminiService] Attempt ${attempt} failed: ${error.message}`);
        if (attempt > retryCount) {
          throw new AppError(
            `Gemini request failed after ${attempt} attempts. Last error: ${error.message}`,
            HttpStatus.INTERNAL_SERVER_ERROR
          );
        }
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    throw new AppError('Gemini request failed completely.', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export const geminiService = new GeminiService();
