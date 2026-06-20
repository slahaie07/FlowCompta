import { describe, expect, it } from 'vitest';
import { runAgentOrchestrator } from '../orchestrator';
import { isMockGeminiKey } from '../gemini-client';

describe('mock Gemini fallback', () => {
  it('detects mock API key', () => {
    expect(isMockGeminiKey('mock_gemini_api_key')).toBe(true);
    expect(isMockGeminiKey('')).toBe(true);
    expect(isMockGeminiKey('AIza-real-key')).toBe(false);
  });

  it('returns helpful answer without live Gemini', async () => {
    const prev = process.env.GOOGLE_GEMINI_API_KEY;
    process.env.GOOGLE_GEMINI_API_KEY = 'mock_gemini_api_key';

    const result = await runAgentOrchestrator(
      { message: 'Comment déclarer ma TVQ au Québec?' },
      { skipCpaReview: true }
    );

    expect(result.intent).toBe('TAX');
    expect(result.answer.length).toBeGreaterThan(20);
    expect(result.answer).toContain('Mode assistance');

    process.env.GOOGLE_GEMINI_API_KEY = prev;
  });
});
