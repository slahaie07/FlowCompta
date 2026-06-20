/**
 * Print copy-paste SQL setup instructions (no service role required locally).
 * Usage: npm run setup:print-sql
 */
import fs from 'fs';
import path from 'path';
import { SEED_ADMIN_ACCOUNTS, PORTAL_HOME_BY_ROLE } from '../src/lib/seedAdminAccounts';

const root = process.cwd();
const combinedPath = path.join(root, 'scripts', 'combined-migrations.sql');
const manualSeedPath = path.join(root, 'scripts', 'seed-admins-manual.sql');

function readOrPlaceholder(filePath: string, label: string): string {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return `-- (${label} not found at ${filePath})`;
  }
}

function main() {
  console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║  ComptaFlow — setup without SUPABASE_SERVICE_ROLE_KEY (local / dashboard)  ║
╚══════════════════════════════════════════════════════════════════════════════╝

No CLI seed? Follow these steps in Supabase Dashboard → SQL Editor.

━━━ STEP 0 — Base schema (once) ━━━
If not done yet, run comptaflow_migration.sql first.

━━━ STEP 1 — Combined migrations (paste below) ━━━
File: scripts/combined-migrations.sql

${readOrPlaceholder(combinedPath, 'combined-migrations.sql')}

━━━ STEP 2 — Create Auth users (Dashboard UI) ━━━
Authentication → Users → Add user (enable "Auto Confirm User"):

${SEED_ADMIN_ACCOUNTS.map(
  (a) => `  • ${a.email}  →  role ${a.role}  →  portal ${PORTAL_HOME_BY_ROLE[a.role]}`
).join('\n')}

Use strong passwords — never commit them to git.

━━━ STEP 3 — Promote profiles (paste below) ━━━
File: scripts/seed-admins-manual.sql

${readOrPlaceholder(manualSeedPath, 'seed-admins-manual.sql')}

━━━ STEP 4 — Vercel env (production API only) ━━━
Once deployed, add in Vercel → Settings → Environment Variables:
  • VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY  (client)
  • SUPABASE_SERVICE_ROLE_KEY                  (server — from Supabase → Settings → API)
  • ADMIN_SECRET, CRON_SECRET, RESEND_API_KEY

Optional: Vercel ↔ Supabase integration auto-injects URL + anon + service_role.
See docs/SETUP_WITHOUT_CLI.md

━━━ STEP 5 — Bootstrap via HTTP (after service role on Vercel) ━━━
curl -X POST https://compta-flow.net/api/bootstrap-admins \\
  -H "X-ComptaFlow-Internal: YOUR_ADMIN_SECRET" \\
  -H "Content-Type: application/json" \\
  -d '{"password":"YOUR_STRONG_PASSWORD"}'

━━━ Client signup without seed ━━━
After STEP 1 only: partner picker works if ≥1 sub_admin profile exists.
If exactly one sub_admin exists, new clients are auto-assigned (handle_new_user trigger).

Full guide: docs/SETUP_WITHOUT_CLI.md
`);
}

main();
