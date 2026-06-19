import { describe, expect, it } from 'vitest';
import {
  getPortalHomePath,
  getPortalPath,
  getActiveSegment,
  legacyDashboardToPortalPath,
} from '../portals/config/paths';
import { isPathAllowedForRole } from '../portals/config/navigation';

describe('portal paths', () => {
  it('builds role-specific home paths', () => {
    expect(getPortalHomePath('client')).toBe('/portal/client/overview');
    expect(getPortalHomePath('sub_admin')).toBe('/portal/admin/admin_overview');
    expect(getPortalHomePath('super_admin')).toBe('/portal/owner/super_overview');
  });

  it('extracts active segment from portal URLs', () => {
    expect(getActiveSegment('/portal/client/invoices', 'client')).toBe('invoices');
    expect(getActiveSegment('/portal/admin/admin_clients', 'sub_admin')).toBe('admin_clients');
    expect(getActiveSegment('/portal/admin/sales_ledger', 'sub_admin')).toBe('sales_ledger');
    expect(getActiveSegment('/portal/owner/sales_ledger', 'super_admin')).toBe('sales_ledger');
  });

  it('maps legacy dashboard URLs', () => {
    expect(legacyDashboardToPortalPath('/dashboard/pricing', 'client')).toBe('/portal/client/services');
    expect(getPortalPath('sub_admin', 'invoices')).toBe('/portal/admin/invoices');
    expect(legacyDashboardToPortalPath('/dashboard/sales_ledger', 'sub_admin')).toBe(
      '/portal/admin/sales_ledger'
    );
  });

  it('allows production routes per role', () => {
    expect(isPathAllowedForRole('sales_ledger', 'sub_admin')).toBe(true);
    expect(isPathAllowedForRole('service_reports', 'sub_admin')).toBe(true);
    expect(isPathAllowedForRole('sales_ledger', 'super_admin')).toBe(true);
    expect(isPathAllowedForRole('service_reports', 'super_admin')).toBe(false);
  });
});
