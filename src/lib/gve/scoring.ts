/**
 * GVE — Moteur de scoring d'opportunités (déterministe, testable).
 *
 * Approche RICE adaptée : chaque canal reçoit un score = f(Reach, Impact,
 * Confidence, Effort). Aucune donnée aléatoire — mêmes entrées ⇒ mêmes sorties,
 * pour que les projections soient auditables et reproductibles.
 */

import type { ProvinceCode } from '../financeUtils';
import type { GrowthChannel, GrowthTarget, OpportunityScore } from './types';
import { GROWTH_CHANNELS, REVENUE_ATTRIBUTION } from './channels';

/**
 * Pondération de portée par province, reflétant la taille du marché adressable
 * (amortie par racine carrée : la portée organique ne croît pas linéairement
 * avec la population). Normalisé sur QC = 1,0.
 */
export const PROVINCE_REACH_WEIGHT: Record<ProvinceCode, number> = {
  ON: 1.35,
  QC: 1.0,
  BC: 0.82,
  AB: 0.76,
  MB: 0.45,
  SK: 0.42,
  NS: 0.38,
  NB: 0.34,
  NL: 0.28,
  PE: 0.18,
  YT: 0.12,
  NT: 0.12,
  NU: 0.1,
};

/** Borne une valeur dans un intervalle [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Adéquation niche ↔ canal : proportion de tags du canal qui recoupent la niche
 * de la cible, ramenée à un modulateur 0,6..1,3 (jamais nul — tout canal garde
 * une portée résiduelle).
 */
export function nicheFit(channel: GrowthChannel, niche: string): number {
  const needle = niche.toLowerCase();
  const matches = channel.fitTags.filter(
    (tag) => needle.includes(tag) || tag.includes(needle)
  ).length;
  if (channel.fitTags.length === 0) return 1;
  const ratio = matches / channel.fitTags.length;
  return clamp(0.6 + ratio * 1.4, 0.6, 1.3);
}

/** Portée qualifiée mensuelle estimée à maturité pour un canal donné. */
export function reachAtMaturity(channel: GrowthChannel, target: GrowthTarget): number {
  const provinceWeight = PROVINCE_REACH_WEIGHT[target.province] ?? 0.5;
  const fit = nicheFit(channel, target.niche);
  // La portée s'échelonne aussi (faiblement) avec l'effort réellement soutenable.
  const effortScale = clamp(target.teamCapacityHoursPerWeek / 12, 0.35, 1.4);
  return Math.round(channel.baseReachPerMonth * provinceWeight * fit * effortScale);
}

/**
 * Confiance dans l'estimation (0..1) : plus élevée quand la cible a déjà du
 * trafic (données réelles) et quand le canal monte vite (ramp court).
 */
export function confidenceFor(channel: GrowthChannel, target: GrowthTarget): number {
  const trafficSignal = clamp(target.currentMonthlySessions / 3000, 0, 1);
  const rampSignal = clamp(1 - (channel.rampUpMonths - 3) / 9, 0.4, 1);
  const dataSignal = target.avgDealValueCad > 0 && target.conversionRatePct > 0 ? 1 : 0.7;
  return clamp(0.45 + 0.25 * trafficSignal + 0.2 * rampSignal + 0.1 * dataSignal, 0.3, 0.98);
}

/** Contribution mensuelle estimée au chiffre d'affaires à maturité, en CAD. */
export function monthlyRevenueAtMaturity(
  channel: GrowthChannel,
  target: GrowthTarget
): number {
  const reach = reachAtMaturity(channel, target);
  const effectiveConversion =
    (target.conversionRatePct / 100) * channel.conversionModifier;
  const customers = reach * effectiveConversion * REVENUE_ATTRIBUTION;
  return Math.round(customers * target.avgDealValueCad);
}

/**
 * Score composite normalisé 0..100.
 * score = (impactNorm × reachNorm × confidence) / effortNorm, calibré.
 */
export function scoreChannel(
  channel: GrowthChannel,
  target: GrowthTarget
): OpportunityScore {
  const reach = reachAtMaturity(channel, target);
  const revenue = monthlyRevenueAtMaturity(channel, target);
  const confidence = confidenceFor(channel, target);

  // Normalisations douces (log) pour éviter qu'un seul facteur n'écrase le score.
  const reachNorm = Math.log10(reach + 10) / 4; // ~0..1 pour reach jusqu'à ~10k
  const impactNorm = Math.log10(revenue + 10) / 6; // ~0..1 pour revenu jusqu'à ~1M
  const effortNorm = clamp(channel.effortHoursPerWeek / 6, 0.5, 1.8); // 6 h = référence

  // Score effort-ajusté (RICE) : récompense le rendement par heure investie.
  const raw = (reachNorm * impactNorm * confidence) / effortNorm;
  const score = Math.round(clamp(raw * 80, 0, 100) * 10) / 10;

  return {
    channelId: channel.id,
    category: channel.category,
    nameFr: channel.nameFr,
    nameEn: channel.nameEn,
    reachAtMaturity: reach,
    monthlyRevenueAtMaturity: revenue,
    confidence: Math.round(confidence * 100) / 100,
    effortHoursPerWeek: channel.effortHoursPerWeek,
    monthlyCostCad: channel.monthlyCostCad,
    score,
    rank: 0,
  };
}

/** Score et classe tous les canaux du catalogue pour une cible. */
export function scoreAllChannels(target: GrowthTarget): OpportunityScore[] {
  const scored = GROWTH_CHANNELS.map((channel) => scoreChannel(channel, target));
  scored.sort((a, b) => b.score - a.score);
  scored.forEach((opportunity, index) => {
    opportunity.rank = index + 1;
  });
  return scored;
}

/**
 * Sélectionne les meilleurs canaux tenant dans la capacité d'exécution et le
 * budget de la cible (glouton par score décroissant).
 */
export function selectChannelsWithinCapacity(
  opportunities: OpportunityScore[],
  target: GrowthTarget
): string[] {
  let remainingHours = target.teamCapacityHoursPerWeek;
  let remainingBudget = target.monthlyBudgetCad;
  const selected: string[] = [];

  for (const opportunity of opportunities) {
    if (
      opportunity.effortHoursPerWeek <= remainingHours &&
      opportunity.monthlyCostCad <= remainingBudget
    ) {
      selected.push(opportunity.channelId);
      remainingHours -= opportunity.effortHoursPerWeek;
      remainingBudget -= opportunity.monthlyCostCad;
    }
    if (remainingHours <= 0) break;
  }

  // Toujours recommander au moins le meilleur canal, même si la capacité est nulle.
  if (selected.length === 0 && opportunities.length > 0) {
    selected.push(opportunities[0].channelId);
  }
  return selected;
}
