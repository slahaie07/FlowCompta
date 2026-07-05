import { describe, it, expect } from 'vitest';
import { buildGrowthPlan, normalizeTarget, INTEGRITY_CHARTER } from '../engine';

describe('gve/engine', () => {
  it('normalizeTarget applique les défauts et borne les valeurs aberrantes', () => {
    const t = normalizeTarget({ name: '  ', conversionRatePct: 999, avgDealValueCad: -5 });
    expect(t.name).toBe('Cible sans nom');
    expect(t.province).toBe('QC');
    expect(t.conversionRatePct).toBeLessThanOrEqual(100);
    expect(t.avgDealValueCad).toBeGreaterThanOrEqual(1);
  });

  it('buildGrowthPlan retourne un plan complet et cohérent', () => {
    const plan = buildGrowthPlan({
      name: 'ComptaFlow',
      niche: 'comptabilité',
      province: 'QC',
      monthlyBudgetCad: 300,
      currentMonthlySessions: 1500,
      avgDealValueCad: 1800,
      conversionRatePct: 2.5,
      teamCapacityHoursPerWeek: 12,
    });

    expect(plan.opportunities.length).toBeGreaterThan(0);
    expect(plan.recommendedChannelIds.length).toBeGreaterThan(0);
    expect(plan.projection).toHaveLength(12);
    expect(plan.playbook.length).toBeGreaterThan(0);
    expect(plan.summary.roi).toBeGreaterThan(0);
    // Chaque canal recommandé provient bien de la liste des opportunités.
    const scoredIds = new Set(plan.opportunities.map((o) => o.channelId));
    plan.recommendedChannelIds.forEach((id) => expect(scoredIds.has(id)).toBe(true));
  });

  it('chaque action du playbook porte un garde-fou d\'intégrité', () => {
    const plan = buildGrowthPlan({ niche: 'saas', province: 'ON' });
    expect(plan.playbook.length).toBeGreaterThan(0);
    plan.playbook.forEach((action) => {
      expect(action.integrityNote.length).toBeGreaterThan(0);
      expect(['critique', 'haute', 'moyenne']).toContain(action.priority);
    });
  });

  it('la charte d\'intégrité interdit explicitement les faux comptes', () => {
    expect(INTEGRITY_CHARTER.toLowerCase()).toContain('faux compte');
    expect(INTEGRITY_CHARTER.toLowerCase()).toContain('anti-robot');
  });

  it('est déterministe sur les canaux recommandés', () => {
    const a = buildGrowthPlan({ niche: 'comptabilité', province: 'QC' });
    const b = buildGrowthPlan({ niche: 'comptabilité', province: 'QC' });
    expect(a.recommendedChannelIds).toEqual(b.recommendedChannelIds);
    expect(a.summary.sessionsAtHorizon).toBe(b.summary.sessionsAtHorizon);
  });
});
