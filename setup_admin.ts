/**
 * @deprecated Do not use — hardcoded credentials removed.
 *
 * Alternatives (no local service role):
 *   1. docs/SETUP_WITHOUT_CLI.md
 *   2. scripts/seed-admins-manual.sql (Supabase SQL Editor)
 *   3. POST /api/bootstrap-admins (Vercel + ADMIN_SECRET + SUPABASE_SECRET_KEY)
 *   4. SEED_ADMIN_PASSWORD=*** npm run seed:admins (when service role available locally)
 */
console.error(`
❌ setup_admin.ts is deprecated and disabled.

Use instead:
  • npm run setup:print-sql
  • docs/SETUP_WITHOUT_CLI.md
  • scripts/seed-admins-manual.sql
`);
process.exit(1);
