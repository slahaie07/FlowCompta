export type AdminRole = 'super_admin' | 'sub_admin';

export interface SeedAccount {
  email: string;
  role: AdminRole;
  fullName: string;
  label: string;
}

/** Emails and roles only — passwords supplied at runtime via env/CLI/API. */
export const SEED_ADMIN_ACCOUNTS: SeedAccount[] = [
  {
    email: 's.lahaie07@gmail.com',
    role: 'super_admin',
    fullName: 'Samuel Lahaie',
    label: 'Super Admin',
  },
  {
    email: 'simon.gagne0088@gmail.com',
    role: 'sub_admin',
    fullName: 'Simon Gagné',
    label: 'Équipe Compta-Flow — Saisie de factures',
  },
  {
    email: 'viviee28@hotmail.com',
    role: 'sub_admin',
    fullName: 'Sylvie Charette',
    label: 'Équipe Compta-Flow — Production comptable',
  },
];

export const PORTAL_HOME_BY_ROLE: Record<AdminRole, string> = {
  super_admin: '/portal/owner/super_overview',
  sub_admin: '/portal/admin/admin_overview',
};
