import { SERVICE_PROCEDURES, summarizeProcedureForAgent } from '../lib/serviceProcedures';
import type { ServiceId } from '../lib/servicesCatalog';
import type { AgentContext } from './types';

/** Injecte le parcours procédural dans le contexte agent si service connu */
export function buildProcedureContextBlock(ctx: AgentContext): string {
  const serviceId = ctx.metadata?.serviceId as ServiceId | undefined;
  if (!serviceId || !(serviceId in SERVICE_PROCEDURES)) return '';

  const summary = summarizeProcedureForAgent(SERVICE_PROCEDURES[serviceId], ctx.language ?? 'fr');
  return `\nParcours procédural actif:\n${summary}\nGuide le client étape par étape vers /portal/client/procedure`;
}
