/** Intentions routées par l'orchestrateur ComptaFlow (usage interne) */

export type AgentIntent =

  | 'TAX'

  | 'PAYROLL'

  | 'BILLING'

  | 'BOOKKEEPING'

  | 'TECHNICAL'

  | 'SALES'

  | 'COMPLIANCE'

  | 'PORTAL'

  | 'ONBOARDING'

  | 'MESSAGING'

  | 'PROCEDURE'

  | 'GENERAL';



export type AgentId =

  | 'router'

  | 'tax'

  | 'payroll'

  | 'billing'

  | 'bookkeeping'

  | 'technical'

  | 'sales'

  | 'compliance'

  | 'portal'

  | 'onboarding'

  | 'messaging'

  | 'procedure-guide'

  | 'general'

  | 'cpa-supervisor'

  | 'document-vision'

  | 'reconciliation'

  | 'firm-ops'

  | 'network-ops'

  | 'security-audit'

  | 'i18n-content'

  | 'devops'

  | 'kyc-review'

  | 'marketing-hunter';



/** routed = sélectionnable par le routeur (support client) ; internal = cron, CLI, admin uniquement */

export type AgentVisibility = 'routed' | 'internal';



export interface AgentMessage {

  role: 'user' | 'system' | 'assistant';

  content: string;

}



export interface AgentContext {

  userId?: string;

  role?: 'client' | 'sub_admin' | 'super_admin';

  province?: string;

  language?: 'fr' | 'en' | 'ar';

  channel?: 'support-chat' | 'cli' | 'api' | 'cron' | 'admin';

  metadata?: Record<string, unknown>;

}



export interface AgentRunInput {

  message: string;

  context?: AgentContext;

  history?: AgentMessage[];

}



export interface AgentRunResult {

  agentId: AgentId;

  intent: AgentIntent;

  answer: string;

  confidence?: number;

  routedBy: 'router' | 'direct';

  latencyMs?: number;

}



/** Réponse publique support — persona humaine, sans métadonnée technique */
export interface PublicSupportAdvisor {
  name: string;
  title: string;
  initials: string;
}

export interface PublicSupportReply {
  answer: string;
  advisor: PublicSupportAdvisor;
  typingDelayMs: number;
  respondedAt: string;
}



export interface AgentDefinition {

  id: AgentId;

  intent: AgentIntent | 'ROUTER';

  name: string;

  description: string;

  systemPrompt: string | ((ctx: AgentContext) => string);

  model?: string;

  temperature?: number;

  visibility: AgentVisibility;

}



export interface LLMGenerateOptions {

  systemPrompt?: string;

  jsonSchema?: object;

  temperature?: number;

  model?: string;

}



export interface LLMClient {

  generateText(prompt: string, options?: LLMGenerateOptions): Promise<string>;

  generateJSON<T>(prompt: string, schema: object, options?: LLMGenerateOptions): Promise<T>;

}



export interface ListAgentsOptions {

  /** Inclure les agents internes (défaut: false) */

  internal?: boolean;

}


