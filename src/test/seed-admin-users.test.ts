import { describe, expect, it } from 'vitest';
import { SEED_ADMIN_ACCOUNTS } from '../../scripts/seed-admin-accounts';
import { getPortalHomePath } from '../portals/config/paths';

describe('seed admin accounts', () => {
  it('defines three test accounts with expected roles', () => {
    expect(SEED_ADMIN_ACCOUNTS).toHaveLength(3);
    expect(SEED_ADMIN_ACCOUNTS.map((a) => a.email)).toEqual([
      's.lahaie07@gmail.com',
      'sadmin1@comptaflow.com',
      'sadmin2@comptaflow.com',
    ]);
    expect(SEED_ADMIN_ACCOUNTS.filter((a) => a.role === 'super_admin')).toHaveLength(1);
    expect(SEED_ADMIN_ACCOUNTS.filter((a) => a.role === 'sub_admin')).toHaveLength(2);
  });

  it('maps seeded roles to portal home paths', () => {
    for (const account of SEED_ADMIN_ACCOUNTS) {
      expect(getPortalHomePath(account.role)).toMatch(/^\/portal\//);
    }
    expect(getPortalHomePath('super_admin')).toBe('/portal/owner/super_overview');
    expect(getPortalHomePath('sub_admin')).toBe('/portal/admin/admin_overview');
  });
});
