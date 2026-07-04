import { describe, it, expect } from 'vitest';
import { maturityFactor, paidBenchmarkCac, projectGrowth } from '../projection';
import type { GrowthTarget } from '../types';

const target: GrowthTarget = {
  name: 'ComptaFlow',
  niche: 'comptabilité',
  province: 'QC',
  language: 'fr',
  monthlyBudgetCad: 300,
  currentMonthlySessions: 1500,
  avgDealValueCad: 1800,
  conversionRatePct: 2.5,
  teamCapacityHoursPerWeek: 12,
};

describe('gve/projection', () => {
  it('maturityFactor croît de 0 vers ~0.9 à rampUpMonths', () => {
    expect(maturityFactor(6, 0)).toBe(0);
    const atRamp = maturityFactor(6, 6);
    expect(atRamp).toBeGreaterThan(0.85);
    expect(atRamp).toBeLessThan(0.95);
    expect(maturityFactor(6, 12)).toBeGreaterThan(atRamp);
  });

  it('paidBenchmarkCac reconnaît les niches connues et retombe sur défaut', () => {
    expect(paidBenchmarkCac('comptabilité')).toBe(280);
    expect(paidBenchmarkCac('secteur inconnu xyz')).toBe(200);
  });

  it('projette une série croissante de sessions cumulées', () => {
    const { series, summary } = projectGrowth(target, ['seo-blog', 'local-seo-gbp'], 12);
    expect(series).toHaveLength(12);
    expect(series[0].totalSessions).toBeGreaterThanOrEqual(target.currentMonthlySessions);
    for (let i = 1; i < series.length; i += 1) {
      expect(series[i].totalSessions).toBeGreaterThanOrEqual(series[i - 1].totalSessions);
      expect(series[i].cumulativeRevenueCad).toBeGreaterThanOrEqual(
        series[i - 1].cumulativeRevenueCad
      );
    }
    expect(summary.horizonMonths).toBe(12);
    expect(summary.sessionsAtHorizon).toBe(series[11].totalSessions);
  });

  it('calcule un CAC mixte inférieur au benchmark payant pour de l\'organique', () => {
    const { summary } = projectGrowth(target, ['seo-blog', 'local-seo-gbp'], 12);
    expect(summary.blendedCac).toBeGreaterThan(0);
    expect(summary.blendedCac).toBeLessThan(summary.paidBenchmarkCac);
  });

  it('gère un ensemble de canaux vide sans planter', () => {
    const { series, summary } = projectGrowth(target, [], 6);
    expect(series).toHaveLength(6);
    expect(summary.cumulativeRevenueCad).toBe(0);
    expect(summary.roi).toBe(0);
  });

  it('ignore les identifiants de canaux inconnus', () => {
    const { summary } = projectGrowth(target, ['canal-inexistant'], 6);
    expect(summary.cumulativeRevenueCad).toBe(0);
  });
});
