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
    email: 'viviee28@hotmail.com',
    role: 'sub_admin',
    fullName: 'Sylvie Charette-Clément',
    label: 'Partenaire Cabinet',
  },
  {
    email: 'eya-cpa@outlook.com',
    role: 'sub_admin',
    fullName: 'Eya',
    label: 'Partenaire Cabinet (Support Arabe)',
  },
  {
    email: 'queen.eth1@outlook.com',
    role: 'sub_admin',
    fullName: 'Stéphanie Laplante',
    label: 'Partenaire Cabinet',
  },
];

export const PORTAL_HOME_BY_ROLE: Record<AdminRole, string> = {
  super_admin: '/portal/owner/super_overview',
  sub_admin: '/portal/admin/admin_overview',
};
