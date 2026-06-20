import { describe, it, expect } from 'vitest';
import {
  getActiveRegions,
  getLegalRequirements,
  getNetworkStatus,
  getRegion,
  buildSitemapUrls,
  normalizeProvinceCode,
} from './canadaNetwork';

describe('canadaNetwork', () => {
  it('couvre les 13 provinces et territoires', () => {
    expect(getActiveRegions()).toHaveLength(13);
  });

  it('normalise les codes province', () => {
    expect(normalizeProvinceCode('quebec')).toBe('QC');
    expect(normalizeProvinceCode('ON')).toBe('ON');
    expect(normalizeProvinceCode(undefined)).toBe('QC');
  });

  it('applique le pattern légal Loi 25 pour le Québec', () => {
    const legal = getLegalRequirements(getRegion('QC'));
    expect(legal.some((l) => l.id === 'loi25_officer')).toBe(true);
  });

  it('génère un sitemap avec pages régionales', () => {
    const urls = buildSitemapUrls();
    expect(urls.some((u) => u.includes('/ca/quebec'))).toBe(true);
    expect(urls.some((u) => u.includes('/ca/ontario'))).toBe(true);
    expect(urls.length).toBeGreaterThanOrEqual(18);
  });

  it('retourne le status réseau conforme', () => {
    const status = getNetworkStatus();
    expect(status.compliance.pipeda).toBe(true);
    expect(status.compliance.loi25).toBe(true);
    expect(status.compliance.dataInCanada).toBe(true);
    expect(status.activeRegions).toBe(13);
  });
});
