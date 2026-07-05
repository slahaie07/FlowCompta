import { listAgents, AGENT_REGISTRY } from '../src/agents/index';
import { buildGrowthPlan } from '../src/lib/gve';

export type InternalCronJob =
  | 'agent-health'
  | 'reconciliation'
  | 'elite-hunter'
  | 'marketing-hunter'
  | 'gve-scan';

export const INTERNAL_CRON_JOBS: InternalCronJob[] = [
  'agent-health',
  'reconciliation',
  'elite-hunter',
  'marketing-hunter',
  'gve-scan',
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

/**
 * GVE — Analyse quotidienne des opportunités de croissance organique du cabinet.
 * Déterministe : classe les canaux légitimes et résume la meilleure prochaine action.
 */
export function runGveScan(): CronJobResult {
  const plan = buildGrowthPlan({
    name: 'ComptaFlow',
    url: 'https://compta-flow.net',
    niche: 'comptabilité',
    province: 'QC',
    language: 'fr',
    monthlyBudgetCad: 300,
    currentMonthlySessions: 1500,
    avgDealValueCad: 1800,
    conversionRatePct: 2.5,
    teamCapacityHoursPerWeek: 12,
  });

  const top = plan.opportunities[0];
  const nextAction = plan.playbook[0];

  return {
    job: 'gve-scan',
    success: true,
    message: `GVE — meilleur canal: ${top?.nameFr ?? 'n/d'} (score ${top?.score ?? 0}). ROI 12 mois projeté: ${Math.round(plan.summary.roi * 100)} %.`,
    details: {
      recommendedChannels: plan.recommendedChannelIds,
      topChannel: top?.channelId,
      topScore: top?.score,
      projectedSessions12m: plan.summary.sessionsAtHorizon,
      projectedRevenue12mCad: plan.summary.cumulativeRevenueCad,
      blendedCac: plan.summary.blendedCac,
      paidBenchmarkCac: plan.summary.paidBenchmarkCac,
      nextAction: nextAction?.titleFr,
      integrity: plan.integrityCharter,
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
    case 'gve-scan':
    case 'gve':
      return runGveScan();
    default:
      return {
        job: normalized,
        success: false,
        message: `Job inconnu. Jobs disponibles: ${INTERNAL_CRON_JOBS.join(', ')}`,
        timestamp: new Date().toISOString(),
      };
  }
}
