/**
 * Vérification finale + instructions pour compléter la prod.
 * Usage: npm run finish:setup
 */
import 'dotenv/config';
import { SUPABASE_PROJECT_REF } from '../src/lib/envResolve';

const BASE = process.env.COMPTAFLOW_URL || 'https://compta-flow.net';
const PROJECT_REF = SUPABASE_PROJECT_REF;

type HealthEnv = {
  gemini?: string;
  supabase?: string;
  serviceRole?: string;
  anonKey?: string;
  partnerRls?: string;
  resend?: string;
  adminSecret?: string;
  cronSecret?: string;
};

async function checkHealth(): Promise<HealthEnv> {
  const res = await fetch(`${BASE}/api/health`);
  const data = (await res.json()) as { env: HealthEnv };
  return data.env ?? {};
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
      name: 'Clé anon Supabase (serveur)',
      ok: env.anonKey === 'configured',
      action: 'Vercel → SUPABASE_ANON_KEY ou SUPABASE_PUBLISHABLE_KEY (intégration Supabase)',
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
    {
      name: 'RLS partenaires (inscription)',
      ok: env.partnerRls === 'ok',
      action:
        env.partnerRls === 'recursion'
          ? 'Exécuter npm run db:migrate ou coller supabase/migrations/20260620_fix_profiles_rls_recursion.sql'
          : env.partnerRls === 'missing_key'
            ? 'Configurer SUPABASE_ANON_KEY sur Vercel'
            : `État RLS: ${env.partnerRls ?? 'inconnu'}`,
    },
  ];

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
