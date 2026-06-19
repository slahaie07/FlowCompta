import { describe, expect, it } from 'vitest';
import {
  getPortalHomePath,
  getPortalPath,
  getActiveSegment,
  legacyDashboardToPortalPath,
} from '../portals/config/paths';

describe('portal paths', () => {
  it('builds role-specific home paths', () => {
    expect(getPortalHomePath('client')).toBe('/portal/client/overview');
    expect(getPortalHomePath('sub_admin')).toBe('/portal/admin/admin_overview');
    expect(getPortalHomePath('super_admin')).toBe('/portal/owner/super_overview');
  });

  it('extracts active segment from portal URLs', () => {
    expect(getActiveSegment('/portal/client/invoices', 'client')).toBe('invoices');
    expect(getActiveSegment('/portal/admin/admin_clients', 'sub_admin')).toBe('admin_clients');
  });

  it('maps legacy dashboard URLs', () => {
    expect(legacyDashboardToPortalPath('/dashboard/pricing', 'client')).toBe('/portal/client/services');
    expect(getPortalPath('sub_admin', 'invoices')).toBe('/portal/admin/invoices');
  });
});
