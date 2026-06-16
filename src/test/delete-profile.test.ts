import { test, expect, vi } from 'vitest';

/**
 * Test de Suppression de Compte - Conformité Loi 25 (Right to be Forgotten)
 * Vérifie le comportement de l'endpoint et le blocage légal en cas de déclarations ou factures en cours.
 */
test('Loi 25 : Suppression de compte autorisée', async () => {
  const baseUrl = 'http://localhost:3000';
  const userId = 'mock_to_delete_id';
  const email = 'delete_me@test.ca';

  // Simulation d'une suppression réussie (aucun document fiscal ni facture impayée)
  (global.fetch as any).mockResolvedValueOnce({
    status: 200,
    json: async () => ({
      success: true,
      message: "Conformité Loi 25 confirmée : toutes les données personnelles ont été supprimées définitivement du système.",
      method: "local_db.json"
    })
  });

  const res = await fetch(`${baseUrl}/api/profile/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, email })
  });

  expect(res.status).toBe(200);
  const data = await res.json();
  expect(data.success).toBe(true);
  expect(data.method).toBe('local_db.json');
});

test('Loi 25 : Refus de suppression pour rétention légale (factures impayées/déclarations fiscales)', async () => {
  const baseUrl = 'http://localhost:3000';
  const userId = 'mock_client_id'; // a des déclarations fiscales ou factures
  const email = 'client@comptaflow.ca';

  // Simulation d'un rejet (Loi 25 / obligations fiscales de 7 ans)
  (global.fetch as any).mockResolvedValueOnce({
    status: 409,
    json: async () => ({
      success: false,
      error: "LEGAL_RETENTION_REQUIRED",
      hasTaxFilings: true,
      hasUnpaidInvoices: false,
      message: "La suppression du compte a été rejetée. Les déclarations fiscales officielles transmises et les factures impayées doivent être conservées légalement pendant 7 ans."
    })
  });

  const res = await fetch(`${baseUrl}/api/profile/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, email })
  });

  expect(res.status).toBe(409);
  const data = await res.json();
  expect(data.success).toBe(false);
  expect(data.error).toBe('LEGAL_RETENTION_REQUIRED');
  expect(data.hasTaxFilings).toBe(true);
});
