/**
 * GVE — Orchestrateur du moteur de croissance.
 *
 * Point d'entrée unique : reçoit un profil de cible, renvoie un plan de
 * croissance complet (opportunités classées, canaux recommandés, projection
 * 12 mois, plan d'action, charte d'intégrité).
 */

import type { GrowthPlan, GrowthTarget } from './types';
import { scoreAllChannels, selectChannelsWithinCapacity } from './scoring';
import { projectGrowth } from './projection';
import { buildPlaybook } from './playbook';

export const INTEGRITY_CHARTER =
  "Le GVE ne crée aucun faux compte, n'imite aucune identité, ne contourne aucune " +
  "protection anti-robot et n'automatise aucune publication trompeuse. Il priorise, " +
  "projette et rédige des briefs pour des actions de croissance authentiques exécutées " +
  'par des humains ou via des API officielles, avec divulgation et dans le respect des ' +
  'conditions de chaque plateforme et de la LCAP.';

const DEFAULTS: Partial<GrowthTarget> = {
  language: 'fr',
  monthlyBudgetCad: 0,
  currentMonthlySessions: 0,
  avgDealValueCad: 1200,
  conversionRatePct: 1.2,
  teamCapacityHoursPerWeek: 10,
};

/** Normalise et borne les entrées d'une cible pour éviter les valeurs aberrantes. */
export function normalizeTarget(input: Partial<GrowthTarget>): GrowthTarget {
  const merged = { ...DEFAULTS, ...input } as GrowthTarget;
  return {
    name: merged.name?.trim() || 'Cible sans nom',
    url: merged.url?.trim() || undefined,
    niche: merged.niche?.trim() || 'services',
    province: merged.province || 'QC',
    language: merged.language === 'en' ? 'en' : 'fr',
    monthlyBudgetCad: Math.max(0, Number(merged.monthlyBudgetCad) || 0),
    currentMonthlySessions: Math.max(0, Number(merged.currentMonthlySessions) || 0),
    avgDealValueCad: Math.max(1, Number(merged.avgDealValueCad) || 1200),
    conversionRatePct: Math.min(100, Math.max(0.01, Number(merged.conversionRatePct) || 2)),
    teamCapacityHoursPerWeek: Math.max(0, Number(merged.teamCapacityHoursPerWeek) || 10),
  };
}

/** Construit un plan de croissance complet à partir d'un profil de cible. */
export function buildGrowthPlan(
  input: Partial<GrowthTarget>,
  horizonMonths = 12
): GrowthPlan {
  const target = normalizeTarget(input);
  const opportunities = scoreAllChannels(target);
  const recommendedChannelIds = selectChannelsWithinCapacity(opportunities, target);
  const { series, summary } = projectGrowth(target, recommendedChannelIds, horizonMonths);
  const playbook = buildPlaybook(recommendedChannelIds, opportunities);

  return {
    target,
    generatedAt: new Date().toISOString(),
    opportunities,
    recommendedChannelIds,
    projection: series,
    summary,
    playbook,
    integrityCharter: INTEGRITY_CHARTER,
  };
}
