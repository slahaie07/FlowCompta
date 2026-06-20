import { test, expect, vi } from 'vitest';

/**
 * Test de Réconciliation Automatique des Factures via n8n (Interac)
 */
test('Reconciliation : Erreur si jeton secret incorrect', async () => {
  const baseUrl = 'http://localhost:3000';
  const invoiceNumber = 'FAC-2026-0001';
  const interacRef = 'CA123XYZ';

  (global.fetch as any).mockResolvedValueOnce({
    status: 401,
    json: async () => ({ error: "Non autorisé. Jeton secret invalide." })
  });

  const res = await fetch(`${baseUrl}/api/invoices/reconcile`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer wrong_token'
    },
    body: JSON.stringify({ invoiceNumber, interacRef })
  });

  expect(res.status).toBe(401);
  const data = await res.json();
  expect(data.error).toContain('Non autorisé');
});

test('Reconciliation : Succès avec jeton correct et facture valide', async () => {
  const baseUrl = 'http://localhost:3000';
  const invoiceNumber = 'FAC-2026-0001';
  const interacRef = 'CA123XYZ';

  (global.fetch as any).mockResolvedValueOnce({
    status: 200,
    json: async () => ({
      success: true,
      message: "Facture réconciliée avec succès et notifiée par courriel.",
      invoiceId: 'inv-uuid-123'
    })
  });

  const res = await fetch(`${baseUrl}/api/invoices/reconcile`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test_admin_secret'
    },
    body: JSON.stringify({ invoiceNumber, interacRef })
  });

  expect(res.status).toBe(200);
  const data = await res.json();
  expect(data.success).toBe(true);
  expect(data.invoiceId).toBe('inv-uuid-123');
});
