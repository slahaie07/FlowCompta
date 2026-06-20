import { describe, expect, it } from 'vitest';
import {
  buildBreakdownRows,
  buildParameterRows,
  getBreakdownLabel,
} from './pricingQuoteSummary';
import { calculatePricingEstimate, type PricingQuestionnaireAnswers } from './pricingEstimator';

const t = (key: string) => `tr:${key}`;

const baseAnswers: PricingQuestionnaireAnswers = {
  serviceId: 'monthlyMicro',
  province: 'QC',
  profileType: 'business',
  volumeBand: 'medium',
  employeeBand: 'none',
  urgency: 'standard',
  addOns: ['gstQst'],
};

describe('pricingQuoteSummary', () => {
  it('builds parameter rows with optional fields', () => {
    const rows = buildParameterRows(baseAnswers, t, { showVolume: true, showEmployees: false });
    expect(rows.length).toBeGreaterThanOrEqual(5);
    expect(rows[0]?.label).toBe('tr:pricingQuestionnaire.result.table.service');
  });

  it('formats breakdown rows from estimate', () => {
    const result = calculatePricingEstimate(baseAnswers);
    const rows = buildBreakdownRows(result, t);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.some((row) => row.label.includes('gstQst') || row.label.startsWith('services.items'))).toBe(true);
  });

  it('resolves breakdown labels', () => {
    expect(getBreakdownLabel('base', t)).toBe('tr:pricingQuestionnaire.breakdown.base');
    expect(getBreakdownLabel('addon.gstQst', t)).toBe('tr:services.items.gstQst.name');
  });
});
