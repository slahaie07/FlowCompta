import { AGENT_REGISTRY } from './registry';
import type { AgentContext, AgentIntent, LLMClient } from './types';

/** Intentions où une validation CPA est obligatoire avant réponse client */
export const CPA_SUPERVISED_INTENTS: AgentIntent[] = ['TAX', 'PAYROLL', 'BOOKKEEPING'];

const CPA_SUPERVISOR_FALLBACK = `Tu es le superviseur CPA ComptaFlow. Valide fiscalité/paie/comptabilité Canada. Ne jamais inventer de montants.`;

function getCpaSupervisorPrompt(): string {
  const prompt = AGENT_REGISTRY['cpa-supervisor']?.systemPrompt;
  return typeof prompt === 'string' ? prompt : CPA_SUPERVISOR_FALLBACK;
}

/**
 * Revue par le super-agent CPA — corrige erreurs de calcul, incertitudes fiscales,
 * mauvaise province/taux. Ne jamais inventer de montants.
 */
export async function runCpaSupervisorReview(
  llm: LLMClient,
  input: {
    userMessage: string;
    draftAnswer: string;
    intent: AgentIntent;
    context: AgentContext;
  }
): Promise<string> {
  const ctxLines: string[] = [];
  if (input.context.province) ctxLines.push(`Province: ${input.context.province}`);
  if (input.context.metadata?.serviceId) ctxLines.push(`Service: ${input.context.metadata.serviceId}`);

  const prompt = `Message client:
"""${input.userMessage}"""

Réponse proposée (${input.intent}):
"""
${input.draftAnswer}
"""

${ctxLines.length ? `Contexte:\n${ctxLines.join('\n')}\n` : ''}
Valide ou corrige cette réponse. Renvoie UNIQUEMENT le texte final pour le client (ton humain conservé).`;

  return llm.generateText(prompt, {
    systemPrompt: getCpaSupervisorPrompt(),
    temperature: 0.15,
    model: 'gemini-2.5-flash',
  });
}

export function requiresCpaSupervision(intent: AgentIntent): boolean {
  return CPA_SUPERVISED_INTENTS.includes(intent);
}
