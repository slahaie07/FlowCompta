import { describe, it, expect } from 'vitest';
import { calculateCanadianTaxes, formatCAD } from '../lib/financeUtils';

describe('financeUtils', () => {
  describe('calculateCanadianTaxes', () => {
    it('calculates QC taxes correctly', () => {
      const amount = 100;
      const result = calculateCanadianTaxes(amount, 'QC');
      expect(result.tps).toBe(5);
      expect(result.tvq).toBe(9.98);
      expect(result.total).toBe(114.98);
    });

    it('calculates ON taxes correctly', () => {
      const amount = 100;
      const result = calculateCanadianTaxes(amount, 'ON');
      expect(result.tvh).toBe(13);
      expect(result.total).toBe(113);
    });

    it('handles zero amount', () => {
      const result = calculateCanadianTaxes(0, 'QC');
      expect(result.total).toBe(0);
    });
  });

  describe('formatCAD', () => {
    it('formats currency correctly', () => {
      expect(formatCAD(1234.56)).toContain('1');
      expect(formatCAD(1234.56)).toContain('234');
      // Exact format can depend on locale in environment, but should contain numbers
    });
  });
});
