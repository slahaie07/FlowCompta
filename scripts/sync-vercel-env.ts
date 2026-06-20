/**
 * Synchronise les variables d'environnement Vercel (production).
 * Usage:
 *   VERCEL_TOKEN=... npm run vercel:sync-env
 *
 * Variables lues depuis l'environnement local ou .env.local :
 *   SUPABASE_SERVICE_ROLE_KEY (requis si manquant en prod)
 *   VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, GOOGLE_GEMINI_API_KEY, etc.
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const PROJECT = 'comptaflow-platform';
const PROD_VARS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_URL',
  'GOOGLE_GEMINI_API_KEY',
  'ADMIN_SECRET',
  'CRON_SECRET',
  'RESEND_API_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'VITE_STRIPE_PUBLIC_KEY',
] as const;

function loadDotEnvLocal() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

function main() {
  if (!process.env.VERCEL_TOKEN) {
    console.error('❌ VERCEL_TOKEN requis. Créez-en un sur https://vercel.com/account/tokens');
    process.exit(1);
  }

  loadDotEnvLocal();

  if (!process.env.SUPABASE_URL && process.env.VITE_SUPABASE_URL) {
    process.env.SUPABASE_URL = process.env.VITE_SUPABASE_URL;
  }

  const toSet = PROD_VARS.filter((name) => process.env[name]?.trim());
  if (toSet.length === 0) {
    console.error('❌ Aucune variable à synchroniser. Renseignez .env.local ou exportez les variables.');
    process.exit(1);
  }

  console.log(`\n=== Sync Vercel (${PROJECT}, production) ===\n`);

  for (const name of toSet) {
    const value = process.env[name]!.trim();
    console.log(`→ ${name}`);
    try {
      execSync(
        `npx vercel env add ${name} production --force`,
        {
          input: value,
          stdio: ['pipe', 'inherit', 'inherit'],
          env: { ...process.env, VERCEL_TOKEN: process.env.VERCEL_TOKEN },
        }
      );
      console.log('  OK');
    } catch {
      console.error(`  ✗ Échec pour ${name}`);
    }
  }

  console.log('\n→ Redéploiement production...');
  execSync(`npx vercel deploy --prod --yes --token ${process.env.VERCEL_TOKEN}`, {
    stdio: 'inherit',
    cwd: process.cwd(),
  });

  console.log('\n✅ Variables synchronisées et déploiement lancé.');
}

main();
