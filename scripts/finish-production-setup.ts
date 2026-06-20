/**
 * Vérification finale + instructions pour compléter la prod.
 * Usage: npm run finish:setup
 */
import { execSync } from 'child_process';

const BASE = process.env.COMPTAFLOW_URL || 'https://compta-flow.net';
const PROJECT_REF = 'hnxdlzdgiascuawgydir';
const ANON = process.env.VITE_SUPABASE_ANON_KEY || '';

async function checkHealth() {
  const res = await fetch(`${BASE}/api/health`);
  const data = (await res.json()) as {
    env: Record<string, string>;
  };
  return data.env ?? {};
}

async function checkPartnerRls() {
  if (!ANON) return { ok: false, detail: 'VITE_SUPABASE_ANON_KEY non défini localement' };
  const url = `https://${PROJECT_REF}.supabase.co/rest/v1/profiles?select=id,role,display_name&role=eq.sub_admin&limit=1`;
  const res = await fetch(url, {
    headers: { apikey: ANON, Authorization: `Bearer ${ANON}` },
  });
  const body = await res.text();
  if (res.ok) return { ok: true, detail: 'Partner picker OK' };
  if (body.includes('42P17')) return { ok: false, detail: 'RLS récursion — exécuter npm run db:migrate' };
  return { ok: false, detail: body.slice(0, 120) };
}

async function main() {
  console.log('\n=== ComptaFlow — Finalisation production ===\n');

  const env = await checkHealth();
  const checks: Array<{ name: string; ok: boolean; action?: string }> = [
    {
      name: 'SUPABASE_SERVICE_ROLE_KEY (Vercel)',
      ok: env.serviceRole === 'configured',
      action: 'Dashboard Supabase → Settings → API → service_role → Vercel env',
    },
    {
      name: 'Gemini',
      ok: env.gemini === 'live',
    },
    {
      name: 'Resend',
      ok: env.resend === 'configured',
    },
    {
      name: 'CRON_SECRET',
      ok: env.cronSecret === 'configured',
    },
    {
      name: 'ADMIN_SECRET (pas fallback)',
      ok: env.adminSecret === 'configured',
      action: 'Vercel → ADMIN_SECRET personnalisé',
    },
  ];

  const partner = await checkPartnerRls();
  checks.push({
    name: 'RLS partenaires (inscription)',
    ok: partner.ok,
    action: partner.ok ? undefined : partner.detail,
  });

  let pending = 0;
  for (const c of checks) {
    const icon = c.ok ? '✓' : '✗';
    console.log(`${icon} ${c.name}`);
    if (!c.ok) {
      pending++;
      if (c.action) console.log(`    → ${c.action}`);
    }
  }

  console.log('\n--- Commandes utiles ---');
  console.log(`  SQL manuel : https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`);
  console.log('  npm run db:migrate          # si SUPABASE_DB_PASSWORD défini');
  console.log('  npm run vercel:sync-env     # si VERCEL_TOKEN + .env.local');
  console.log('  ./scripts/verify-canada-network.sh');

  if (pending === 0) {
    console.log('\n✅ Production complète.\n');
    return;
  }

  console.log(`\n⚠️  ${pending} point(s) à finaliser.\n`);
  process.exit(1);
}

main().catch((err: Error) => {
  console.error(err.message);
  process.exit(1);
});
