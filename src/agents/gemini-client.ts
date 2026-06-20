import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import type { LLMClient, LLMGenerateOptions } from './types';

const DEFAULT_MODEL = 'gemini-2.5-flash';

function sanitizeKey(val: string | undefined): string {
  if (!val) return '';
  return val.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
}

export function createGeminiClient(apiKey?: string): LLMClient {
  const key = sanitizeKey(apiKey ?? process.env.GOOGLE_GEMINI_API_KEY) || 'mock_gemini_api_key';
  const genAI = new GoogleGenerativeAI(key);

  return {
    async generateText(prompt: string, options: LLMGenerateOptions = {}): Promise<string> {
      const model = genAI.getGenerativeModel({
        model: options.model ?? DEFAULT_MODEL,
        generationConfig: options.temperature != null ? { temperature: options.temperature } : undefined,
      });

      const parts: string[] = [];
      if (options.systemPrompt) parts.push(`Système: ${options.systemPrompt}`);
      parts.push(prompt);

      const result = await model.generateContent(parts.join('\n\n'));
      return result.response.text();
    },

    async generateJSON<T>(prompt: string, schema: object, options: LLMGenerateOptions = {}): Promise<T> {
      const model = genAI.getGenerativeModel({
        model: options.model ?? DEFAULT_MODEL,
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: schema as any,
          ...(options.temperature != null ? { temperature: options.temperature } : {}),
        },
      });

      const text = options.systemPrompt
        ? `Système: ${options.systemPrompt}\n\n${prompt}`
        : prompt;

      const result = await model.generateContent(text);
      return JSON.parse(result.response.text()) as T;
    },
  };
}

/** Schéma JSON pour le routeur d'intentions */
export const routerIntentSchema = {
  type: SchemaType.OBJECT,
  properties: {
    intent: {
      type: SchemaType.STRING,
      description:
        "Intention: TAX, PAYROLL, BILLING, BOOKKEEPING, TECHNICAL, SALES, COMPLIANCE, PORTAL, ONBOARDING, MESSAGING, PROCEDURE, GENERAL",
    },
    confidence: {
      type: SchemaType.NUMBER,
      description: 'Confiance entre 0 et 1',
    },
  },
  required: ['intent'],
};
