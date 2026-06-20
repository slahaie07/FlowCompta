import { createGeminiClient, isMockGeminiKey, routerIntentSchema } from './gemini-client';
import { createMockLLMClient } from './mock-llm';
import { buildHumanConversationPrompt, getPersonaForAgent } from './personas';
import { requiresCpaSupervision, runCpaSupervisorReview } from './cpa-review';
import { buildProcedureContextBlock } from './procedure-context';
import { AGENT_REGISTRY, getAgentForIntent } from './registry';
import type {
  AgentContext,
  AgentId,
  AgentIntent,
  AgentRunInput,
  AgentRunResult,
  LLMClient,
} from './types';

const VALID_INTENTS: AgentIntent[] = [
  'TAX',
  'PAYROLL',
  'BILLING',
  'BOOKKEEPING',
  'TECHNICAL',
  'SALES',
  'COMPLIANCE',
  'PORTAL',
  'ONBOARDING',
  'MESSAGING',
  'PROCEDURE',
  'GENERAL',
];

function normalizeIntent(raw: string): AgentIntent {
  const upper = raw?.toUpperCase?.() ?? 'GENERAL';
  return VALID_INTENTS.includes(upper as AgentIntent) ? (upper as AgentIntent) : 'GENERAL';
}

function resolveSystemPrompt(
  agent: (typeof AGENT_REGISTRY)[string],
  ctx: AgentContext
): string {
  const base =
    typeof agent.systemPrompt === 'function' ? agent.systemPrompt(ctx) : agent.systemPrompt;

  const extras: string[] = [];
  if (ctx.province) extras.push(`Province du client: ${ctx.province}.`);
  if (ctx.role) extras.push(`Rôle portail: ${ctx.role}.`);

  const lang = ctx.language ?? 'fr';
  if (lang) extras.push(`Langue de réponse: ${lang}.`);

  const procedureBlock = buildProcedureContextBlock(ctx);
  if (procedureBlock) extras.push(procedureBlock.trim());

  let prompt = base;
  if (agent.visibility === 'routed') {
    const persona = getPersonaForAgent(agent.id);
    prompt = `${buildHumanConversationPrompt(persona, lang)}\n\n${base}`;
  }

  return extras.length ? `${prompt}\n\nContexte:\n${extras.join('\n')}` : prompt;
}

async function generateSpecialistAnswer(
  llm: LLMClient,
  agent: (typeof AGENT_REGISTRY)[string],
  ctx: AgentContext,
  message: string,
  history?: AgentRunInput['history']
): Promise<string> {
  const systemPrompt = resolveSystemPrompt(agent, ctx);
  const historyBlock =
    history?.length ?
      history.map((m) => `${m.role}: ${m.content}`).join('\n') + '\n\n'
    : '';

  return llm.generateText(`${historyBlock}Client: ${message}`, {
    systemPrompt,
    model: agent.model,
    temperature: agent.temperature ?? 0.4,
  });
}

export interface OrchestratorOptions {
  llm?: LLMClient;
  directAgentId?: AgentId;
  onRoute?: (intent: AgentIntent, agentId: AgentId) => void;
  /** Désactive la revue CPA (tests unitaires) */
  skipCpaReview?: boolean;
}

/**
 * Orchestrateur multi-agents ComptaFlow.
 * 1. Routeur → intention
 * 2. Spécialiste → réponse
 * 3. Super-agent CPA → validation (tax/paie/tenue de livres)
 */
export async function runAgentOrchestrator(
  input: AgentRunInput,
  options: OrchestratorOptions = {}
): Promise<AgentRunResult> {
  const started = Date.now();
  const llm = options.llm ?? (isMockGeminiKey() ? createMockLLMClient() : createGeminiClient());
  const ctx: AgentContext = input.context ?? {};

  let intent: AgentIntent;
  let agentId: AgentId;
  let routedBy: 'router' | 'direct' = 'router';
  let confidence: number | undefined;

  if (options.directAgentId && options.directAgentId !== 'router') {
    const agent = AGENT_REGISTRY[options.directAgentId];
    if (!agent) throw new Error(`Agent inconnu: ${options.directAgentId}`);
    agentId = options.directAgentId;
    intent = agent.intent === 'ROUTER' ? 'GENERAL' : (agent.intent as AgentIntent);
    routedBy = 'direct';
  } else {
    const routeResult = await llm.generateJSON<{ intent: string; confidence?: number }>(
      `Message utilisateur:\n"""${input.message}"""`,
      routerIntentSchema,
      { systemPrompt: AGENT_REGISTRY.router.systemPrompt as string, temperature: 0.1 }
    );

    intent = normalizeIntent(routeResult.intent);
    agentId = getAgentForIntent(intent).id;
    confidence = routeResult.confidence;
    options.onRoute?.(intent, agentId);
  }

  const agent = AGENT_REGISTRY[agentId];
  let answer = await generateSpecialistAnswer(
    llm,
    agent,
    ctx,
    input.message,
    input.history
  );

  if (!options.skipCpaReview && requiresCpaSupervision(intent)) {
    answer = await runCpaSupervisorReview(llm, {
      userMessage: input.message,
      draftAnswer: answer,
      intent,
      context: ctx,
    });
  }

  return {
    agentId,
    intent,
    answer,
    confidence,
    routedBy,
    latencyMs: Date.now() - started,
  };
}

export { createGeminiClient };
