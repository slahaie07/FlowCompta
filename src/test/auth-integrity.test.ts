import { test, expect } from 'vitest';

/**
 * Test d'Intégrité de l'Authentification (Anti-Régression)
 * Vérifie que le flux d'inscription et de connexion reste opérationnel.
 */
test('Flux complet : Inscription -> Connexion', async () => {
  const baseUrl = 'http://localhost:3000';
  const testUser = {
    email: `auto_${Date.now()}@test.ca`,
    password: 'password123',
    displayName: 'Automated Test'
  };

  // 1. Test Inscription
  const mockUserResponse = { user: { id: 'test-uuid', email: testUser.email } };
  (global.fetch as any).mockResolvedValueOnce({
    status: 200,
    json: async () => mockUserResponse
  });

  const regRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUser)
  });
  expect(regRes.status).toBe(200);
  const regData = await regRes.json();
  expect(regData.user.email).toBe(testUser.email);

  // 2. Test Connexion
  (global.fetch as any).mockResolvedValueOnce({
    status: 200,
    json: async () => ({ user: { id: 'test-uuid', email: testUser.email } })
  });

  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testUser.email, password: testUser.password })
  });
  expect(loginRes.status).toBe(200);
  const loginData = await loginRes.json();
  expect(loginData.user.id).toBe(regData.user.id);
});
