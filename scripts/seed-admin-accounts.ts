export type AdminRole = 'super_admin' | 'sub_admin';

export interface SeedAccount {
  email: string;
  role: AdminRole;
  fullName: string;
  label: string;
}

/** Emails and roles only — passwords supplied at runtime via env/CLI. */
export const SEED_ADMIN_ACCOUNTS: SeedAccount[] = [
  {
    email: 's.lahaie07@gmail.com',
    role: 'super_admin',
    fullName: 'Samuel L. (Super Admin)',
    label: 'Super Admin',
  },
  {
    email: 'sadmin1@comptaflow.com',
    role: 'sub_admin',
    fullName: 'Mini Admin 1',
    label: 'Sub-admin cabinet 1',
  },
  {
    email: 'sadmin2@comptaflow.com',
    role: 'sub_admin',
    fullName: 'Mini Admin 2',
    label: 'Sub-admin cabinet 2',
  },
];

export const PORTAL_HOME_BY_ROLE: Record<AdminRole, string> = {
  super_admin: '/portal/owner/super_overview',
  sub_admin: '/portal/admin/admin_overview',
};
