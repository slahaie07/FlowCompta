import { expect, test } from '@playwright/test';

/**
 * Tests de fumée navigateur — pages publiques critiques.
 * Serveur de dev local démarré automatiquement (voir playwright.config.ts).
 */

test('la page d’accueil se charge avec un seul h1', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/ComptaFlow/);
  const headings = page.locator('h1');
  await expect(headings).toHaveCount(1);
  await expect(headings.first()).not.toBeEmpty();
});

test('la page /estimate se charge avec un seul h1', async ({ page }) => {
  await page.goto('/estimate');
  const headings = page.locator('h1');
  await expect(headings).toHaveCount(1);
  await expect(headings.first()).not.toBeEmpty();
});

test('la page de connexion se charge', async ({ page }) => {
  await page.goto('/login');
  // L’écran d’accès (coffre ou choix de connexion) présente des contrôles.
  await expect(page.locator('button, input').first()).toBeVisible();
});

test('le service worker servi déclare le bon CACHE_NAME', async ({ request }) => {
  const response = await request.get('/sw.js');
  expect(response.ok()).toBeTruthy();
  const body = await response.text();
  expect(body).toContain("const CACHE_NAME = 'comptaflow-pwa-v6'");
});
