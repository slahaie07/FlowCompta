import { describe, expect, it } from 'vitest';
import {
  isServiceId,
  REPORT_SERVICE_TO_CATALOG,
  SERVICE_CATALOG,
  SERVICE_CATEGORIES,
} from './servicesCatalog';

describe('servicesCatalog', () => {
  it('includes fiscal category with professional services', () => {
    expect(SERVICE_CATEGORIES).toContain('fiscal');
    const fiscal = SERVICE_CATALOG.filter((s) => s.category === 'fiscal');
    expect(fiscal.length).toBe(6);
  });

  it('maps service report ids to catalog ids', () => {
    expect(REPORT_SERVICE_TO_CATALOG.t1).toBe('personalTaxT1');
    expect(REPORT_SERVICE_TO_CATALOG.cfo).toBe('virtualCfo');
    expect(isServiceId(REPORT_SERVICE_TO_CATALOG.t2)).toBe(true);
  });

  it('validates service ids', () => {
    expect(isServiceId('personalTaxT1')).toBe(true);
    expect(isServiceId('unknown')).toBe(false);
    expect(isServiceId(null)).toBe(false);
  });
});
