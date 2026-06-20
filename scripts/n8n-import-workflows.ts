/**
 * Importe les workflows ComptaFlow dans n8n (idempotent par nom).
 * Prérequis : compte propriétaire créé (npm run n8n:setup).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { baseUrl, loadCredentials, login, n8nFetch, waitForN8n } from './n8n-lib';

interface WorkflowFile {
  name: string;
  nodes: unknown[];
  connections: Record<string, unknown>;
  settings?: Record<string, unknown>;
}

const WORKFLOW_FILES = [
  'n8n-interac-reconciliation.json',
  'n8n-onboarding-automation.json',
] as const;

function loadWorkflow(filename: string): WorkflowFile {
  const path = resolve(process.cwd(), filename);
  return JSON.parse(readFileSync(path, 'utf8')) as WorkflowFile;
}

async function listWorkflowNames(cookie: string): Promise<Set<string>> {
  const res = await n8nFetch(cookie, '/rest/workflows');
  if (!res.ok) throw new Error(`Liste workflows échouée (${res.status})`);
  const json = (await res.json()) as { data?: Array<{ name: string }> };
  return new Set((json.data ?? []).map((w) => w.name));
}

async function importWorkflow(cookie: string, wf: WorkflowFile): Promise<string> {
  const res = await n8nFetch(cookie, '/rest/workflows', {
    method: 'POST',
    body: JSON.stringify({
      name: wf.name,
      nodes: wf.nodes,
      connections: wf.connections,
      settings: wf.settings ?? { executionOrder: 'v1' },
      active: false,
    }),
  });
  const json = (await res.json()) as { data?: { id: string }; message?: string };
  if (!res.ok) throw new Error(json.message ?? `Import échoué (${res.status})`);
  return json.data?.id ?? '';
}

async function main(): Promise<void> {
  console.log(`Connexion à n8n (${baseUrl})…`);
  await waitForN8n();
  const cookie = await login(loadCredentials());
  const existing = await listWorkflowNames(cookie);

  for (const file of WORKFLOW_FILES) {
    const wf = loadWorkflow(file);
    if (existing.has(wf.name)) {
      console.log(`  ⏭  Déjà présent : ${wf.name}`);
      continue;
    }
    const id = await importWorkflow(cookie, wf);
    console.log(`  ✓  Importé : ${wf.name} (id ${id})`);
  }

  console.log('\nWorkflows prêts dans n8n.');
  console.log('Étapes manuelles restantes :');
  console.log('  1. Configurer les identifiants IMAP / SMTP dans l’interface n8n');
  console.log('  2. Renseigner COMPTAFLOW_ADMIN_SECRET dans .env.n8n (= ADMIN_SECRET Vercel)');
  console.log('  3. Activer les workflows une fois les credentials configurés');
  console.log(`\nÉditeur : ${baseUrl}`);
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
