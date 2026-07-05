import { describe, it, expect } from 'vitest';
import { GROWTH_CHANNELS, getChannel } from '../channels';
import {
  nicheFit,
  reachAtMaturity,
  confidenceFor,
  monthlyRevenueAtMaturity,
  scoreAllChannels,
  selectChannelsWithinCapacity,
  PROVINCE_REACH_WEIGHT,
  clamp,
} from '../scoring';
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

describe('gve/scoring', () => {
  it('clamp bornes correctement', () => {
    expect(clamp(5, 0, 1)).toBe(1);
    expect(clamp(-5, 0, 1)).toBe(0);
    expect(clamp(0.5, 0, 1)).toBe(0.5);
  });

  it('nicheFit récompense les canaux alignés sur la niche', () => {
    const seo = getChannel('seo-blog')!;
    const ecommerceTarget = nicheFit(seo, 'e-commerce');
    const comptaTarget = nicheFit(seo, 'comptabilité');
    expect(comptaTarget).toBeGreaterThanOrEqual(0.6);
    expect(comptaTarget).toBeLessThanOrEqual(1.3);
    expect(ecommerceTarget).toBeLessThanOrEqual(comptaTarget);
  });

  it('la portée augmente avec le poids provincial', () => {
    const seo = getChannel('seo-blog')!;
    const qc = reachAtMaturity(seo, target);
    const on = reachAtMaturity(seo, { ...target, province: 'ON' });
    const pe = reachAtMaturity(seo, { ...target, province: 'PE' });
    expect(PROVINCE_REACH_WEIGHT.ON).toBeGreaterThan(PROVINCE_REACH_WEIGHT.QC);
    expect(on).toBeGreaterThan(qc);
    expect(qc).toBeGreaterThan(pe);
  });

  it('la confiance reste dans [0.3, 0.98]', () => {
    for (const channel of GROWTH_CHANNELS) {
      const c = confidenceFor(channel, target);
      expect(c).toBeGreaterThanOrEqual(0.3);
      expect(c).toBeLessThanOrEqual(0.98);
    }
  });

  it('le revenu à maturité croît avec la valeur moyenne du client', () => {
    const seo = getChannel('seo-blog')!;
    const low = monthlyRevenueAtMaturity(seo, { ...target, avgDealValueCad: 500 });
    const high = monthlyRevenueAtMaturity(seo, { ...target, avgDealValueCad: 5000 });
    expect(high).toBeGreaterThan(low);
  });

  it('scoreAllChannels retourne des scores classés et bornés 0..100', () => {
    const scored = scoreAllChannels(target);
    expect(scored).toHaveLength(GROWTH_CHANNELS.length);
    expect(scored[0].rank).toBe(1);
    for (let i = 1; i < scored.length; i += 1) {
      expect(scored[i - 1].score).toBeGreaterThanOrEqual(scored[i].score);
      expect(scored[i].score).toBeGreaterThanOrEqual(0);
      expect(scored[i].score).toBeLessThanOrEqual(100);
    }
  });

  it('est déterministe — mêmes entrées, mêmes scores', () => {
    const a = scoreAllChannels(target);
    const b = scoreAllChannels(target);
    expect(a.map((o) => o.score)).toEqual(b.map((o) => o.score));
  });

  it('selectChannelsWithinCapacity respecte capacité et budget', () => {
    const scored = scoreAllChannels(target);
    const selected = selectChannelsWithinCapacity(scored, {
      ...target,
      teamCapacityHoursPerWeek: 4,
      monthlyBudgetCad: 0,
    });
    const totalHours = selected
      .map((id) => getChannel(id)!.effortHoursPerWeek)
      .reduce((a, b) => a + b, 0);
    const totalCost = selected
      .map((id) => getChannel(id)!.monthlyCostCad)
      .reduce((a, b) => a + b, 0);
    // Au moins le meilleur canal est retourné même si la capacité est serrée.
    expect(selected.length).toBeGreaterThanOrEqual(1);
    // Avec budget 0, aucun canal à coût mensuel > 0 ne devrait être ajouté au-delà du repli.
    if (selected.length > 1) {
      expect(totalHours).toBeLessThanOrEqual(4);
      expect(totalCost).toBe(0);
    }
  });
});
