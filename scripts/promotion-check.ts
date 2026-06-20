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

console.log('\n=== ComptaFlow Promotion Check ===\n');

// Fichiers critiques
check('api/app.ts', fileExists('api/app.ts'), 'Express API source');
check('api/internal-jobs.ts', fileExists('api/internal-jobs.ts'), 'Internal cron jobs');
check('.env.example', fileExists('.env.example'), 'Env template for deploy');
check('supabase/migrations/20260619_rls_hardening.sql', fileExists('supabase/migrations/20260619_rls_hardening.sql'), 'RLS migration (apply manually)');

// Variables recommandées (production)
const prodVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'GOOGLE_GEMINI_API_KEY',
  'ADMIN_SECRET',
  'SUPABASE_SERVICE_ROLE_KEY',
  'CRON_SECRET',
  'RESEND_API_KEY',
];

const missing = prodVars.filter((v) => !process.env[v]);
if (missing.length === 0) {
  check('env-vars', true, 'Toutes les variables recommandées sont définies');
} else {
  check('env-vars', false, `Manquantes localement: ${missing.join(', ')} (OK en dev si .env.example utilisé)`);
}

if (process.env.ADMIN_SECRET === 'Maison-139' || !process.env.ADMIN_SECRET) {
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
  check('api/index.cjs', fileExists('api/index.cjs'), 'Bundle Vercel généré');
} catch {
  check('build', false, 'Build en échec');
}

const failed = results.filter((r) => !r.ok);
console.log('\n=== Résumé ===');
console.log(`Checks: ${results.length - failed.length}/${results.length} OK`);

if (failed.length > 0) {
  console.log('\nActions manuelles requises pour la prod:');
  console.log('  1. Vercel → Settings → Environment Variables:');
  console.log('     ADMIN_SECRET, SUPABASE_SERVICE_ROLE_KEY, CRON_SECRET');
  console.log('  2. Supabase SQL Editor → exécuter supabase/migrations/20260619_rls_hardening.sql');
  console.log('  3. n8n → importer n8n-onboarding-automation.json');
  console.log('     Webhook cible: POST https://compta-flow.net/api/webhook/onboarding-complete');
  process.exit(1);
}

console.log('\nPromotion check passed.\n');
process.exit(0);
