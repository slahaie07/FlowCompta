/**
 * GVE — Modèle de projection de trafic organique et de ROI (déterministe).
 *
 * Chaque canal suit une courbe de montée en charge saturante : la portée
 * approche sa maturité de façon asymptotique sur `rampUpMonths`. Toutes les
 * hypothèses sont explicites et auditables — aucun chiffre gonflé.
 */

import type {
  GrowthChannel,
  GrowthTarget,
  MonthlyProjection,
  ProjectionSummary,
} from './types';
import { getChannel, REVENUE_ATTRIBUTION } from './channels';
import { reachAtMaturity } from './scoring';

/** CAC de référence en publicité payante par niche (CAD). Sources sectorielles indicatives. */
const PAID_BENCHMARK_CAC: Record<string, number> = {
  comptabilité: 280,
  finance: 320,
  saas: 240,
  b2b: 300,
  'e-commerce': 45,
  services: 160,
  fintech: 350,
  default: 200,
};

export function paidBenchmarkCac(niche: string): number {
  const key = niche.toLowerCase();
  const match = Object.keys(PAID_BENCHMARK_CAC).find(
    (n) => n !== 'default' && (key.includes(n) || n.includes(key))
  );
  return PAID_BENCHMARK_CAC[match ?? 'default'];
}

/**
 * Facteur de maturité d'un canal au mois `month` (1-indexé) : courbe saturante
 * atteignant ~90 % à `rampUpMonths`. f(month) = 1 − e^(−k·month), k calibré.
 */
export function maturityFactor(rampUpMonths: number, month: number): number {
  if (month <= 0) return 0;
  const k = Math.log(10) / Math.max(1, rampUpMonths); // ~90 % à rampUpMonths
  return 1 - Math.exp(-k * month);
}

/** Estimation du coût-temps mensuel d'un canal (heures × taux horaire interne). */
const INTERNAL_HOURLY_RATE_CAD = 35;

function channelMonthlyCost(channel: GrowthChannel): number {
  const laborCost = channel.effortHoursPerWeek * 4.33 * INTERNAL_HOURLY_RATE_CAD;
  return channel.monthlyCostCad + laborCost;
}

/**
 * Projette sessions et revenu mois par mois pour un ensemble de canaux
 * sélectionnés, sur un horizon donné (défaut : 12 mois).
 */
export function projectGrowth(
  target: GrowthTarget,
  channelIds: string[],
  horizonMonths = 12
): { series: MonthlyProjection[]; summary: ProjectionSummary } {
  const channels = channelIds
    .map((id) => getChannel(id))
    .filter((c): c is GrowthChannel => Boolean(c));

  const series: MonthlyProjection[] = [];
  let cumulativeRevenue = 0;
  let runningSessions = target.currentMonthlySessions;
  let totalCost = 0;

  for (let month = 1; month <= horizonMonths; month += 1) {
    let incrementalSessions = 0;
    let incrementalRevenue = 0;

    for (const channel of channels) {
      const maturedReach =
        reachAtMaturity(channel, target) * maturityFactor(channel.rampUpMonths, month);
      const previousReach =
        reachAtMaturity(channel, target) *
        maturityFactor(channel.rampUpMonths, month - 1);
      const monthlyGain = Math.max(0, maturedReach - previousReach);

      incrementalSessions += monthlyGain;
      const effectiveConversion =
        (target.conversionRatePct / 100) * channel.conversionModifier;
      incrementalRevenue +=
        maturedReach * effectiveConversion * REVENUE_ATTRIBUTION * target.avgDealValueCad;

      if (month === 1) {
        // Coût comptabilisé une fois par mois sur tout l'horizon.
        totalCost += channelMonthlyCost(channel) * horizonMonths;
      }
    }

    runningSessions += incrementalSessions;
    cumulativeRevenue += incrementalRevenue;

    series.push({
      month,
      incrementalSessions: Math.round(incrementalSessions),
      totalSessions: Math.round(runningSessions),
      incrementalRevenueCad: Math.round(incrementalRevenue),
      cumulativeRevenueCad: Math.round(cumulativeRevenue),
    });
  }

  const last = series[series.length - 1];
  const sessionsAtHorizon = last ? last.totalSessions : target.currentMonthlySessions;
  const cumulativeRevenueCad = last ? last.cumulativeRevenueCad : 0;

  // Clients acquis ≈ revenu cumulé / valeur moyenne d'un client.
  const customersAcquired =
    target.avgDealValueCad > 0 ? cumulativeRevenueCad / target.avgDealValueCad : 0;
  const blendedCac =
    customersAcquired > 0 ? Math.round(totalCost / customersAcquired) : 0;
  const roi =
    totalCost > 0
      ? Math.round(((cumulativeRevenueCad - totalCost) / totalCost) * 100) / 100
      : 0;

  const summary: ProjectionSummary = {
    horizonMonths,
    sessionsAtHorizon,
    cumulativeRevenueCad,
    totalCostCad: Math.round(totalCost),
    blendedCac,
    roi,
    paidBenchmarkCac: paidBenchmarkCac(target.niche),
  };

  return { series, summary };
}
