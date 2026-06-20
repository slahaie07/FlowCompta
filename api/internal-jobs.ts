import { listAgents, AGENT_REGISTRY } from '../src/agents/index';

export type InternalCronJob =
  | 'agent-health'
  | 'reconciliation'
  | 'elite-hunter'
  | 'marketing-hunter';

export const INTERNAL_CRON_JOBS: InternalCronJob[] = [
  'agent-health',
  'reconciliation',
  'elite-hunter',
  'marketing-hunter',
];

export interface CronJobResult {
  job: string;
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export function runAgentHealthCheck(geminiConfigured: boolean): CronJobResult {
  const routed = listAgents({ internal: false });
  const internal = listAgents({ internal: true });
  const missingPersonas = routed.filter((a) => !AGENT_REGISTRY[a.id]);

  return {
    job: 'agent-health',
    success: missingPersonas.length === 0,
    message:
      missingPersonas.length === 0
        ? `${routed.length} agents routés, ${internal.length} internes — registre OK`
        : `Registre incomplet: ${missingPersonas.map((a) => a.id).join(', ')}`,
    details: {
      routedCount: routed.length,
      internalCount: internal.length,
      geminiConfigured,
      agents: routed.map((a) => a.id),
    },
    timestamp: new Date().toISOString(),
  };
}

export function runReconciliationStub(): CronJobResult {
  return {
    job: 'reconciliation',
    success: true,
    message: 'Rapprochement Interac ↔ factures — cycle simulé (aucune facture en attente critique)',
    details: {
      scanned: 0,
      matched: 0,
      pendingReview: 0,
      mode: 'stub',
    },
    timestamp: new Date().toISOString(),
  };
}

export function runMarketingHunterStub(): CronJobResult {
  return {
    job: 'marketing-hunter',
    success: true,
    message: 'Elite Hunter — prospect B2B simulé (voir /api/cron/elite-hunter pour exécution live)',
    details: {
      campaign: 'SNIPER_V2',
      mode: 'stub',
    },
    timestamp: new Date().toISOString(),
  };
}

export function runInternalCronJob(
  job: string,
  opts: { geminiConfigured?: boolean } = {}
): CronJobResult {
  const normalized = job.toLowerCase().replace(/_/g, '-');

  switch (normalized) {
    case 'agent-health':
      return runAgentHealthCheck(!!opts.geminiConfigured);
    case 'reconciliation':
    case 'reconcile':
      return runReconciliationStub();
    case 'elite-hunter':
    case 'marketing-hunter':
      return runMarketingHunterStub();
    default:
      return {
        job: normalized,
        success: false,
        message: `Job inconnu. Jobs disponibles: ${INTERNAL_CRON_JOBS.join(', ')}`,
        timestamp: new Date().toISOString(),
      };
  }
}
