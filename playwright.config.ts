import { defineConfig, devices } from '@playwright/test';

/**
 * Configuration Playwright — tests de fumée navigateur (tests/e2e/).
 *
 * Sur cette VM :
 * - @playwright/test est épinglé à 1.64.0 : son Chromium (r1248) est déjà
 *   installé sous ~/.cache/ms-playwright (le téléchargement de versions
 *   plus récentes échoue — le proxy d’egress intercepte le TLS et le
 *   téléchargeur Playwright le refuse). Ne pas relever la version sans
 *   avoir d’abord réussi `npx playwright install chromium`.
 * - Les tests ne ciblent que le serveur local (127.0.0.1, hors proxy),
 *   donc aucun relais n'est requis. `ignoreHTTPSErrors` par prudence.
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:5173',
    ignoreHTTPSErrors: true,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npx vite --port 5173 --strictPort --host 127.0.0.1',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      // Valeurs FICTIVES : sans elles, le client Supabase lève
      // « supabaseKey is required » au démarrage et rien ne se rend.
      // Aucun appel réel n'est attendu des pages publiques testées.
      VITE_SUPABASE_URL: 'https://exemple-invalide.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'cle-publique-fictive-pour-tests-locaux',
    },
  },
});
