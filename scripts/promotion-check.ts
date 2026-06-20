/**
 * Vérification pré-promotion : env, tests, build.
 * Usage: npm run promotion:check
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const root = process.cwd();

type CheckResult = { name: string; ok: boolean; detail: string };

const results: CheckResult[] = [];

function check(name: string, ok: boolean, detail: string) {
  results.push({ name, ok, detail });
  const icon = ok ? '✓' : '✗';
  console.log(`${icon} ${name}: ${detail}`);
}

function fileExists(rel: string): boolean {
  return fs.existsSync(path.join(root, rel));
}

function hasAnyEnv(...keys: string[]): boolean {
  return keys.some((k) => Boolean(process.env[k]?.trim()));
}

console.log('\n=== ComptaFlow Promotion Check ===\n');

// Fichiers critiques
check('api/app.ts', fileExists('api/app.ts'), 'Express API source');
check('api/internal-jobs.ts', fileExists('api/internal-jobs.ts'), 'Internal cron jobs');
check('.env.example', fileExists('.env.example'), 'Env template for deploy');
check('supabase/migrations/20260619_rls_hardening.sql', fileExists('supabase/migrations/20260619_rls_hardening.sql'), 'RLS migration (apply manually)');

// Variables recommandées — accept Vercel Supabase integration aliases
const envGroups: Array<{ label: string; keys: string[] }> = [
  { label: 'Supabase URL', keys: ['SUPABASE_URL', 'VITE_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL'] },
  {
    label: 'Supabase anon/publishable',
    keys: [
      'SUPABASE_ANON_KEY',
      'SUPABASE_PUBLISHABLE_KEY',
      'VITE_SUPABASE_ANON_KEY',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    ],
  },
  { label: 'Supabase service role', keys: ['SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SECRET_KEY'] },
  { label: 'Gemini', keys: ['GOOGLE_GEMINI_API_KEY'] },
  { label: 'Admin secret', keys: ['ADMIN_SECRET', 'SUPABASE_DB_PASSWORD'] },
  { label: 'Cron secret', keys: ['CRON_SECRET'] },
  { label: 'Resend', keys: ['RESEND_API_KEY'] },
];

const missingGroups = envGroups.filter((g) => !hasAnyEnv(...g.keys));
if (missingGroups.length === 0) {
  check('env-vars', true, 'Toutes les variables recommandées sont définies (ou alias Vercel)');
} else {
  const missingLabels = missingGroups.map((g) => g.label).join(', ');
  check('env-vars', false, `Manquantes localement: ${missingLabels} (OK en dev si .env.example utilisé)`);
}

const adminFromEnv =
  process.env.ADMIN_SECRET?.trim() || process.env.SUPABASE_DB_PASSWORD?.trim() || '';
if (adminFromEnv === 'Maison-139' || !adminFromEnv) {
  check('admin-secret-strength', false, 'ADMIN_SECRET absent ou valeur par défaut — changer en production');
} else {
  check('admin-secret-strength', true, 'ADMIN_SECRET personnalisé');
}

try {
  console.log('\n--- npm run lint ---\n');
  execSync('npm run lint', { stdio: 'inherit', cwd: root });
  check('lint', true, 'TypeScript OK');
} catch {
  check('lint', false, 'Échec tsc --noEmit');
}

try {
  console.log('\n--- npm test ---\n');
  execSync('npm test', { stdio: 'inherit', cwd: root });
  check('test', true, 'Vitest OK');
} catch {
  check('test', false, 'Tests en échec');
}

try {
  console.log('\n--- npm run build ---\n');
  execSync('npm run build', { stdio: 'inherit', cwd: root });
  check('build', true, 'Vite + API bundle OK');
  check('api/index.js', fileExists('api/index.js'), 'Bundle Vercel généré (stub remplacé par esbuild)');
} catch {
  check('build', false, 'Build en échec');
}

const failed = results.filter((r) => !r.ok);
console.log('\n=== Résumé ===');
console.log(`Checks: ${results.length - failed.length}/${results.length} OK`);

if (failed.length > 0) {
  console.log('\nActions manuelles requises pour la prod:');
  console.log('  1. Vercel → Settings → Environment Variables (ou intégration Supabase):');
  console.log('     ADMIN_SECRET, SUPABASE_SECRET_KEY (ou SUPABASE_SERVICE_ROLE_KEY), CRON_SECRET');
  console.log('  2. Supabase SQL Editor → exécuter supabase/migrations/20260619_rls_hardening.sql');
  console.log('  3. n8n → importer n8n-onboarding-automation.json');
  console.log('     Webhook cible: POST https://compta-flow.net/api/webhook/onboarding-complete');
  process.exit(1);
}

console.log('\nPromotion check passed.\n');
process.exit(0);
