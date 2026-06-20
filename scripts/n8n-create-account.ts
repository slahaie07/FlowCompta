/**
 * Crée le compte propriétaire n8n (première installation).
 * Prérequis : n8n accessible sur N8N_BASE_URL (défaut http://localhost:5678).
 *
 * Usage :
 *   docker compose up -d n8n
 *   npm run n8n:setup
 */
import { randomBytes } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { baseUrl, waitForN8n } from './n8n-lib';
const email = process.env.N8N_OWNER_EMAIL ?? 'comptaflow@compta-flow.local';
const firstName = process.env.N8N_OWNER_FIRST_NAME ?? 'ComptaFlow';
const lastName = process.env.N8N_OWNER_LAST_NAME ?? 'Admin';
const password =
  process.env.N8N_OWNER_PASSWORD ??
  randomBytes(15).toString('base64url').slice(0, 20);

async function waitForN8nLocal(): Promise<void> {
  return waitForN8n();
}

async function isOwnerSetup(): Promise<boolean> {
  const res = await fetch(`${baseUrl}/rest/settings`);
  if (!res.ok) throw new Error(`Impossible de lire /rest/settings (${res.status})`);
  const json = (await res.json()) as {
    data?: { userManagement?: { showSetupOnFirstLoad?: boolean } };
  };
  return json.data?.userManagement?.showSetupOnFirstLoad === false;
}

async function createOwner(): Promise<void> {
  const res = await fetch(`${baseUrl}/rest/owner/setup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, firstName, lastName, password }),
  });
  const body = await res.text();
  if (!res.ok) {
    throw new Error(`Création du compte échouée (${res.status}): ${body}`);
  }
}

function saveCredentials(): void {
  const credPath = resolve(process.cwd(), '.n8n-credentials.local');
  const content = [
    '# ComptaFlow — identifiants n8n locaux (ne pas committer)',
    `N8N_BASE_URL=${baseUrl}`,
    `N8N_OWNER_EMAIL=${email}`,
    `N8N_OWNER_PASSWORD=${password}`,
    '',
    '# Connexion : ouvrez N8N_BASE_URL dans le navigateur',
  ].join('\n');
  writeFileSync(credPath, `${content}\n`, 'utf8');
  console.log(`\nIdentifiants enregistrés dans ${credPath}`);
}

async function main(): Promise<void> {
  console.log(`Attente de n8n sur ${baseUrl}…`);
  await waitForN8nLocal();

  if (await isOwnerSetup()) {
    console.log('Un compte propriétaire existe déjà. Rien à faire.');
    console.log(`Connexion : ${baseUrl}`);
    return;
  }

  await createOwner();
  saveCredentials();

  console.log('\nCompte n8n créé avec succès.');
  console.log(`  URL      : ${baseUrl}`);
  console.log(`  Courriel : ${email}`);
  console.log(`  Mot de passe : ${password}`);
  console.log('\nProchaines étapes :');
  console.log('  1. Connectez-vous à n8n');
  console.log('  2. Importez n8n-interac-reconciliation.json (optionnel)');
  console.log('  3. Définissez COMPTAFLOW_ADMIN_SECRET = ADMIN_SECRET Vercel');
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
