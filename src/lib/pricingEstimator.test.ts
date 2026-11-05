import { describe, it, expect } from 'vitest';
import {
  calculatePricingEstimate,
  getRecommendedAddOns,
  type PricingQuestionnaireAnswers,
} from './pricingEstimator';

const baseAnswers: PricingQuestionnaireAnswers = {
  serviceId: 'monthlyMicro',
  province: 'QC',
  profileType: 'personal',
  volumeBand: 'low',
  employeeBand: 'none',
  urgency: 'standard',
  addOns: [],
  transactionsBand: 't0_30',
  lateMonthsBand: 'm1_6',
};

describe('pricingEstimator (grille Compta-Flow)', () => {
  it('prices the Micro package at the fixed grid price (149.99)', () => {
    const result = calculatePricingEstimate(baseAnswers);
    expect(result.billingUnit).toBe('monthly');
    expect(result.amountTypical).toBe(149.99);
    expect(result.amountMin).toBe(149.99);
    expect(result.amountMax).toBe(149.99);
  });

  it('follows the monthly ladder by transaction band', () => {
    const result = calculatePricingEstimate({
      ...baseAnswers,
      serviceId: 'monthlySmall',
      transactionsBand: 't76_150',
    });
    expect(result.amountTypical).toBe(349.99);
  });

  it('increases monthly SME estimates with the transaction band', () => {
    const low = calculatePricingEstimate({
      ...baseAnswers,
      serviceId: 'monthlySme',
      transactionsBand: 't31_75',
    });
    const high = calculatePricingEstimate({
      ...baseAnswers,
      serviceId: 'monthlySme',
      transactionsBand: 't201_300',
    });
    expect(low.amountTypical).toBe(249.99);
    expect(high.amountTypical).toBe(599.99);
  });

  it('prices hourly bookkeeping at the fixed grid rate (35 $/h, no invented range)', () => {
    const result = calculatePricingEstimate({
      ...baseAnswers,
      serviceId: 'hourlyBookkeeping',
      volumeBand: 'medium',
    });
    expect(result.billingUnit).toBe('hourly');
    expect(result.amountTypical).toBe(35); // taux de grille, pas 35 $ x heures devinées
    expect(result.amountMin).toBe(35);
    expect(result.amountMax).toBe(35);
  });

  it('attaches the real grid packages overlapping the declared volume band', () => {
    const medium = calculatePricingEstimate({
      ...baseAnswers,
      serviceId: 'hourlyBookkeeping',
      volumeBand: 'medium', // 20 à 100 transactions/mois
    });
    // Paliers 31-75 (Essentiel) et 76-150 de la grille, prix exacts.
    expect(medium.packages?.map((p) => p.monthlyPrice)).toEqual([249.99, 349.99]);

    const low = calculatePricingEstimate({
      ...baseAnswers,
      serviceId: 'hourlyBookkeeping',
      volumeBand: 'low',
    });
    // Palier 0-30 : Micro (trimestriel) et Essentiel (mensuel).
    expect(low.packages?.map((p) => p.monthlyPrice)).toEqual([149.99, 249.99]);
  });

  it('scales payroll as 49 $ + 12 $ per employee', () => {
    const small = calculatePricingEstimate({
      ...baseAnswers,
      serviceId: 'payroll',
      employeeBand: 'small',
    });
    const medium = calculatePricingEstimate({
      ...baseAnswers,
      serviceId: 'payroll',
      employeeBand: 'medium',
    });
    expect(small.amountTypical).toBe(85); // 49 + 12 x 3
    expect(medium.amountTypical).toBe(169); // 49 + 12 x 10
  });

  it('calculates T4/Relevé 1 at 15 $ per employee', () => {
    const result = calculatePricingEstimate({
      ...baseAnswers,
      serviceId: 't4Releve1',
      employeeBand: 'small',
    });
    expect(result.amountTypical).toBe(45); // 15 x 3
  });

  it('calculates catch-up per late month (65 $ x 9 months typical)', () => {
    const result = calculatePricingEstimate({
      ...baseAnswers,
      serviceId: 'catchUp',
      lateMonthsBand: 'm7_12',
    });
    expect(result.billingUnit).toBe('oneTime');
    expect(result.amountTypical).toBe(585);
  });

  it('adds the +25 % express surcharge on priority urgency', () => {
    const standard = calculatePricingEstimate(baseAnswers);
    const priority = calculatePricingEstimate({
      ...baseAnswers,
      urgency: 'priority',
    });
    expect(priority.amountTypical).toBe(187.49); // 149.99 x 1.25
    expect(priority.amountTypical).toBeGreaterThan(standard.amountTypical);
  });

  it('includes add-on fees at grid prices (tax filing 75 $)', () => {
    const without = calculatePricingEstimate(baseAnswers);
    const withAddon = calculatePricingEstimate({
      ...baseAnswers,
      addOns: ['gstQst'],
    });
    expect(withAddon.amountTypical).toBe(224.99);
    expect(withAddon.amountTypical).toBeGreaterThan(without.amountTypical);
  });

  it('suggests relevant add-ons per service', () => {
    expect(getRecommendedAddOns('monthlySme')).toContain('payroll');
    expect(getRecommendedAddOns('payroll')).toContain('t4Releve1');
  });
});
