import fs from 'fs';
import path from 'path';
import { AppError } from '../../errors/app-error';
import { HttpStatus } from '../../constants/http-status.constants';

/**
 * Service responsible for constructing structured AI prompts.
 * Loads external prompt JSON templates and compiles them with headers, row payloads, and heuristic hints.
 */
export class PromptBuilderService {
  private promptsDir = path.join(__dirname, 'prompts');

  /**
   * Loads a versioned prompt template and replaces tokens dynamically.
   * 
   * @param version - Version filename identifier (e.g., 'crm-import-v1').
   * @param headers - Complete header columns array.
   * @param hints - Matching key-value heuristics.
   * @param rows - Chunk segment array.
   * @returns Formatted system instructions and complete prompt.
   */
  buildPrompt(
    version: string,
    headers: string[],
    hints: Record<string, string>,
    rows: Record<string, string>[]
  ): { systemInstruction: string; prompt: string } {
    const templatePath = path.join(this.promptsDir, `${version}.json`);
    
    if (!fs.existsSync(templatePath)) {
      throw new AppError(`Prompt version template ${version} not found.`, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    try {
      const content = fs.readFileSync(templatePath, 'utf8');
      const data = JSON.parse(content);

      const systemInstruction = data.systemInstruction;
      let prompt = data.promptTemplate;

      prompt = prompt
        .replace('{headers}', JSON.stringify(headers))
        .replace('{hints}', JSON.stringify(hints, null, 2))
        .replace('{rowsJson}', JSON.stringify(rows, null, 2));

      return { systemInstruction, prompt };
    } catch (error: any) {
      throw new AppError(
        `Failed to build prompt for version ${version}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export const promptBuilderService = new PromptBuilderService();
