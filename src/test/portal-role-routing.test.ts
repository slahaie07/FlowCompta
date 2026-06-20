import { describe, expect, it } from 'vitest';
import { PORTAL_ROUTES } from '../portals/config/routes';
import { isPathAllowedForRole } from '../portals/config/navigation';
import { getPortalHomePath, roleFromPortalSlug } from '../portals/config/paths';
import type { PortalRole } from '../portals/types';

describe('portal role routing', () => {
  it('redirects each role to its dedicated home portal', () => {
    expect(getPortalHomePath('client')).toBe('/portal/client/overview');
    expect(getPortalHomePath('sub_admin')).toBe('/portal/admin/admin_overview');
    expect(getPortalHomePath('super_admin')).toBe('/portal/owner/super_overview');
  });

  it('blocks client-only routes for sub_admin and super_admin', () => {
    expect(isPathAllowedForRole('overview', 'client')).toBe(true);
    expect(isPathAllowedForRole('overview', 'sub_admin')).toBe(false);
    expect(isPathAllowedForRole('overview', 'super_admin')).toBe(false);
  });

  it('blocks sub_admin cabinet routes for clients', () => {
    expect(isPathAllowedForRole('admin_overview', 'sub_admin')).toBe(true);
    expect(isPathAllowedForRole('admin_clients', 'sub_admin')).toBe(true);
    expect(isPathAllowedForRole('admin_overview', 'client')).toBe(false);
    expect(isPathAllowedForRole('service_reports', 'client')).toBe(false);
  });

  it('restricts quote calculator to admin and super admin only', () => {
    expect(isPathAllowedForRole('quote', 'client')).toBe(false);
    expect(isPathAllowedForRole('quote', 'sub_admin')).toBe(true);
    expect(isPathAllowedForRole('quote', 'super_admin')).toBe(true);
  });

  it('allows super_admin network routes only for super_admin', () => {
    for (const path of ['super_overview', 'super_subadmins', 'super_clients', 'super_invoices']) {
      expect(isPathAllowedForRole(path, 'super_admin')).toBe(true);
      expect(isPathAllowedForRole(path, 'sub_admin')).toBe(false);
      expect(isPathAllowedForRole(path, 'client')).toBe(false);
    }
  });

  it('maps legacy portal slug aliases to roles', () => {
    expect(roleFromPortalSlug('admin')).toBe('sub_admin');
    expect(roleFromPortalSlug('sub-admin')).toBe('sub_admin');
    expect(roleFromPortalSlug('owner')).toBe('super_admin');
    expect(roleFromPortalSlug('super-admin')).toBe('super_admin');
    expect(roleFromPortalSlug('client')).toBe('client');
  });

  it('defines route roles that match navigation allowlists', () => {
    const roles: PortalRole[] = ['client', 'sub_admin', 'super_admin'];

    for (const route of PORTAL_ROUTES) {
      for (const role of route.roles) {
        expect(
          isPathAllowedForRole(route.path, role),
          `${route.path} should appear in ${role} nav`
        ).toBe(true);
      }

      for (const role of roles.filter((r) => !route.roles.includes(r))) {
        if (isPathAllowedForRole(route.path, role)) {
          // Shared routes (messaging, sales_ledger) may appear in nav for multiple roles
          expect(route.roles).toContain(role);
        }
      }
    }
  });
});
