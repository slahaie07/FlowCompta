import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

export const baseUrl = (process.env.N8N_BASE_URL ?? 'http://localhost:5678').replace(/\/$/, '');

export interface N8nCredentials {
  email: string;
  password: string;
}

export function loadCredentials(): N8nCredentials {
  const credPath = resolve(process.cwd(), '.n8n-credentials.local');
  if (existsSync(credPath)) {
    const text = readFileSync(credPath, 'utf8');
    const email = text.match(/^N8N_OWNER_EMAIL=(.+)$/m)?.[1]?.trim();
    const password = text.match(/^N8N_OWNER_PASSWORD=(.+)$/m)?.[1]?.trim();
    if (email && password) return { email, password };
  }

  const email = process.env.N8N_OWNER_EMAIL;
  const password = process.env.N8N_OWNER_PASSWORD;
  if (email && password) return { email, password };

  throw new Error(
    'Identifiants manquants — exécutez npm run n8n:setup ou définissez N8N_OWNER_EMAIL / N8N_OWNER_PASSWORD',
  );
}

export async function waitForN8n(maxAttempts = 30): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(`${baseUrl}/rest/settings`);
      if (res.ok) return;
    } catch {
      // pas encore prêt
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error(`n8n inaccessible sur ${baseUrl}`);
}

export async function login(creds: N8nCredentials): Promise<string> {
  const res = await fetch(`${baseUrl}/rest/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: creds.email, password: creds.password }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Connexion n8n échouée (${res.status}): ${body}`);
  }

  const raw = res.headers.get('set-cookie');
  const cookies = res.headers.getSetCookie?.() ?? (raw ? [raw] : []);
  const session = cookies.find((c) => c.startsWith('n8n-auth='));
  if (!session) throw new Error('Cookie de session n8n introuvable');
  return session.split(';')[0] ?? '';
}

export async function n8nFetch(
  cookie: string,
  path: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
      ...(init?.headers ?? {}),
    },
  });
}
