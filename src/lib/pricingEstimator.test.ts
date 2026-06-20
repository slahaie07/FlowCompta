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
};

describe('pricingEstimator', () => {
  it('returns a range for monthly micro package', () => {
    const result = calculatePricingEstimate(baseAnswers);
    expect(result.billingUnit).toBe('monthly');
    expect(result.amountTypical).toBeGreaterThan(0);
    expect(result.amountMin).toBeLessThanOrEqual(result.amountTypical);
    expect(result.amountMax).toBeGreaterThanOrEqual(result.amountTypical);
  });

  it('increases estimate for high volume monthly SME', () => {
    const low = calculatePricingEstimate({
      ...baseAnswers,
      serviceId: 'monthlySme',
      volumeBand: 'low',
      profileType: 'business',
    });
    const high = calculatePricingEstimate({
      ...baseAnswers,
      serviceId: 'monthlySme',
      volumeBand: 'high',
      profileType: 'sme',
    });
    expect(high.amountTypical).toBeGreaterThan(low.amountTypical);
  });

  it('calculates hourly bookkeeping from estimated hours', () => {
    const result = calculatePricingEstimate({
      ...baseAnswers,
      serviceId: 'hourlyBookkeeping',
      volumeBand: 'medium',
      profileType: 'business',
    });
    expect(result.billingUnit).toBe('hourly');
    expect(result.amountTypical).toBeGreaterThanOrEqual(300);
  });

  it('scales payroll with employee band', () => {
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
    expect(medium.amountTypical).toBeGreaterThan(small.amountTypical);
  });

  it('calculates T4 per employee', () => {
    const result = calculatePricingEstimate({
      ...baseAnswers,
      serviceId: 't4Releve1',
      employeeBand: 'small',
    });
    expect(result.amountTypical).toBe(125);
  });

  it('adds priority urgency surcharge', () => {
    const standard = calculatePricingEstimate(baseAnswers);
    const priority = calculatePricingEstimate({
      ...baseAnswers,
      urgency: 'priority',
    });
    expect(priority.amountTypical).toBeGreaterThan(standard.amountTypical);
  });

  it('includes add-on fees', () => {
    const without = calculatePricingEstimate(baseAnswers);
    const withAddon = calculatePricingEstimate({
      ...baseAnswers,
      addOns: ['gstQst'],
    });
    expect(withAddon.amountTypical).toBeGreaterThan(without.amountTypical);
  });

  it('suggests relevant add-ons per service', () => {
    expect(getRecommendedAddOns('monthlySme')).toContain('payroll');
    expect(getRecommendedAddOns('payroll')).toContain('t4Releve1');
    expect(getRecommendedAddOns('corporateT2')).toContain('gstQst');
  });

  it('returns fiscal T1 estimate as one-time fee', () => {
    const result = calculatePricingEstimate({
      ...baseAnswers,
      serviceId: 'personalTaxT1',
      profileType: 'personal',
    });
    expect(result.billingUnit).toBe('oneTime');
    expect(result.amountTypical).toBeGreaterThanOrEqual(80);
  });

  it('scales corporate T2 with employee band', () => {
    const small = calculatePricingEstimate({
      ...baseAnswers,
      serviceId: 'corporateT2',
      profileType: 'sme',
      volumeBand: 'medium',
      employeeBand: 'none',
    });
    const medium = calculatePricingEstimate({
      ...baseAnswers,
      serviceId: 'corporateT2',
      profileType: 'sme',
      volumeBand: 'medium',
      employeeBand: 'medium',
    });
    expect(medium.amountTypical).toBeGreaterThan(small.amountTypical);
  });
});
