/**
 * Provision ComptaFlow production admin accounts in Supabase Auth + profiles.
 *
 * Passwords are NEVER stored in this repo — pass via env or CLI:
 *   SEED_ADMIN_PASSWORD=*** npm run seed:admins
 *   npm run seed:admins -- --password=***
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY (and SUPABASE_URL or VITE_SUPABASE_URL).
 */
import { createClient, type User } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import {
  SEED_ADMIN_ACCOUNTS,
  PORTAL_HOME_BY_ROLE,
  type AdminRole,
} from './seed-admin-accounts';

dotenv.config({ path: '.env.local' });
dotenv.config();

function sanitizeEnv(value: string | undefined): string {
  return (value ?? '').replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
}

function parseArgs(argv: string[]): { password?: string; dryRun: boolean } {
  let password = sanitizeEnv(process.env.SEED_ADMIN_PASSWORD);
  let dryRun = false;

  for (const arg of argv) {
    if (arg === '--dry-run') dryRun = true;
    else if (arg.startsWith('--password=')) password = arg.slice('--password='.length);
    else if (arg === '--help' || arg === '-h') {
      console.log(`
Usage: npm run seed:admins [-- --password=SECRET] [--dry-run]

Environment:
  SEED_ADMIN_PASSWORD          Runtime password for all seeded accounts (never commit)
  SUPABASE_SERVICE_ROLE_KEY    Required — service role (never commit)
  SUPABASE_URL or VITE_SUPABASE_URL

Portal homes after login:
  super_admin → ${PORTAL_HOME_BY_ROLE.super_admin}
  sub_admin   → ${PORTAL_HOME_BY_ROLE.sub_admin}
`);
      process.exit(0);
    }
  }

  return { password: password || undefined, dryRun };
}

async function findAuthUserByEmail(
  listUsers: (page: number) => Promise<{ users: User[] }>,
  email: string
): Promise<User | null> {
  const target = email.toLowerCase();
  for (let page = 1; page <= 20; page += 1) {
    const { users } = await listUsers(page);
    const match = users.find((u) => u.email?.toLowerCase() === target);
    if (match) return match;
    if (users.length < 200) break;
  }
  return null;
}

async function main() {
  const { password, dryRun } = parseArgs(process.argv.slice(2));

  if (!password) {
    console.error('❌ Missing password. Set SEED_ADMIN_PASSWORD or pass --password=...');
    process.exit(1);
  }

  const supabaseUrl =
    sanitizeEnv(process.env.SUPABASE_URL) || sanitizeEnv(process.env.VITE_SUPABASE_URL);
  const serviceRoleKey = sanitizeEnv(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY are required.');
    process.exit(1);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log(`\n🌱 ComptaFlow admin seed (${dryRun ? 'DRY RUN' : 'LIVE'})`);
  console.log(`   Project: ${supabaseUrl}`);
  console.log(`   Accounts: ${SEED_ADMIN_ACCOUNTS.length}\n`);

  const results: Array<{ email: string; role: AdminRole; userId: string; portal: string; action: string }> = [];

  const listUsers = async (page: number) => {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(`listUsers: ${error.message}`);
    return data;
  };

  for (const account of SEED_ADMIN_ACCOUNTS) {
    const portal = PORTAL_HOME_BY_ROLE[account.role];
    console.log(`→ ${account.label} (${account.email}) → ${account.role} → ${portal}`);

    if (dryRun) {
      results.push({ email: account.email, role: account.role, userId: '(dry-run)', portal, action: 'skipped' });
      continue;
    }

    let userId = '';
    const existing = await findAuthUserByEmail(listUsers, account.email);

    if (existing) {
      userId = existing.id;
      const { error: updateError } = await admin.auth.admin.updateUserById(userId, {
        password,
        email_confirm: true,
        user_metadata: { full_name: account.fullName, display_name: account.fullName },
      });
      if (updateError) throw new Error(`updateUser ${account.email}: ${updateError.message}`);
      results.push({ email: account.email, role: account.role, userId, portal, action: 'updated auth' });
    } else {
      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email: account.email,
        password,
        email_confirm: true,
        user_metadata: { full_name: account.fullName, display_name: account.fullName },
      });
      if (createError) throw new Error(`createUser ${account.email}: ${createError.message}`);
      userId = created.user.id;
      results.push({ email: account.email, role: account.role, userId, portal, action: 'created auth' });
    }

    const { error: profileError } = await admin.from('profiles').upsert(
      {
        id: userId,
        email: account.email,
        full_name: account.fullName,
        display_name: account.fullName,
        role: account.role,
        sub_admin_id: null,
        status: 'active',
      },
      { onConflict: 'id' }
    );

    if (profileError) {
      throw new Error(`profiles upsert ${account.email}: ${profileError.message}`);
    }

    console.log(`   ✓ ${results[results.length - 1]?.action}, profile role=${account.role}, id=${userId.slice(0, 8)}…`);
  }

  console.log('\n✅ Seed complete.\n');
  console.log('Login URLs (production): https://compta-flow.net/login');
  console.log('Portal homes:');
  for (const row of results) {
    console.log(`  ${row.email} (${row.role}) → https://compta-flow.net${row.portal}`);
  }
  console.log('\nVerify login at https://compta-flow.net/login\n');
}

const isDirectRun = process.argv[1]?.replace(/\\/g, '/').includes('seed-admin-users');

if (isDirectRun) {
  main().catch((err: unknown) => {
    console.error('❌ Seed failed:', err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
