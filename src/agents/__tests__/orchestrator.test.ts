import { describe, expect, it, vi } from 'vitest';
import { runAgentOrchestrator } from '../orchestrator';
import { toPublicSupportReply } from '../registry';
import type { LLMClient } from '../types';

function mockLLM(routeIntent: string, specialistAnswer: string): LLMClient {
  return {
    generateJSON: vi.fn().mockResolvedValue({ intent: routeIntent, confidence: 0.92 }),
    generateText: vi.fn().mockResolvedValue(specialistAnswer),
  };
}

const testOpts = { skipCpaReview: true };

describe('runAgentOrchestrator', () => {
  it('routes TAX messages to tax agent', async () => {
    const llm = mockLLM('TAX', 'Réponse fiscale test');

    const result = await runAgentOrchestrator(
      { message: 'Comment déclarer ma TPS au Québec?' },
      { llm, ...testOpts }
    );

    expect(result.intent).toBe('TAX');
    expect(result.agentId).toBe('tax');
    expect(result.answer).toBe('Réponse fiscale test');
    expect(result.routedBy).toBe('router');
  });

  it('routes PAYROLL messages to payroll agent', async () => {
    const llm = mockLLM('PAYROLL', 'Réponse paie');

    const result = await runAgentOrchestrator(
      { message: 'Comment préparer les T4 pour 3 employés?' },
      { llm, ...testOpts }
    );

    expect(result.intent).toBe('PAYROLL');
    expect(result.agentId).toBe('payroll');
  });

  it('routes PROCEDURE messages to procedure-guide agent', async () => {
    const llm = mockLLM('PROCEDURE', 'Voici les documents requis');

    const result = await runAgentOrchestrator(
      { message: 'Quels documents pour ma paie?' },
      { llm, ...testOpts }
    );

    expect(result.intent).toBe('PROCEDURE');
    expect(result.agentId).toBe('procedure-guide');
  });

  it('supports direct agent invocation', async () => {
    const llm = mockLLM('GENERAL', 'Réponse portail');

    const result = await runAgentOrchestrator(
      { message: 'Où est le grand livre?' },
      { llm, directAgentId: 'portal', ...testOpts }
    );

    expect(result.agentId).toBe('portal');
    expect(result.routedBy).toBe('direct');
    expect(llm.generateJSON).not.toHaveBeenCalled();
  });

  it('falls back to GENERAL for unknown intents', async () => {
    const llm = mockLLM('UNKNOWN_CATEGORY', 'Bonjour');

    const result = await runAgentOrchestrator({ message: 'Salut' }, { llm, ...testOpts });

    expect(result.intent).toBe('GENERAL');
    expect(result.agentId).toBe('general');
  });
});

describe('toPublicSupportReply', () => {
  it('exposes human advisor persona without agentId', () => {
    const publicReply = toPublicSupportReply(
      { answer: 'Bonjour', agentId: 'tax' },
      'fr'
    );

    expect(publicReply.answer).toBe('Bonjour');
    expect(publicReply.advisor.name).toBe('Sophie Morin');
    expect(publicReply.advisor.title).toBe('Conseillère fiscale');
    expect(publicReply.advisor.initials).toBe('SM');
    expect(publicReply.typingDelayMs).toBeGreaterThan(1000);
    expect(publicReply.respondedAt).toBeTruthy();
    expect(publicReply).not.toHaveProperty('agentId');
    expect(publicReply).not.toHaveProperty('intent');
  });
});
