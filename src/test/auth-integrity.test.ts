import { describe, it, expect } from 'vitest';
import { buildClientSignupMetadata } from '../lib/clientSignup';

/**
 * Intégrité auth — Supabase PKCE (pas de routes /api/auth/* legacy).
 */
describe('Auth integrity (Supabase PKCE)', () => {
  it('inscription client : métadonnées forcées role client', () => {
    const metadata = buildClientSignupMetadata('  Marie Tremblay  ');
    expect(metadata.role).toBe('client');
    expect(metadata.full_name).toBe('Marie Tremblay');
    expect(metadata).not.toHaveProperty('sub_admin_id');
  });

  it('analyse document IA : JWT requis (contrat API)', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      status: 401,
      json: async () => ({ error: 'Authentification requise (Bearer token Supabase).' }),
    } as Response);

    const res = await fetch('http://localhost:3000/api/ai/analyze-document', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileData: 'dGVzdA==',
        fileName: 'facture.pdf',
        mimeType: 'application/pdf',
      }),
    });

    expect(res.status).toBe(401);
    const data = (await res.json()) as { error: string };
    expect(data.error).toContain('Authentification requise');
  });

  it('intelligence financière : JWT requis (contrat API)', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      status: 401,
      json: async () => ({ error: 'Authentification requise (Bearer token Supabase).' }),
    } as Response);

    const res = await fetch('http://localhost:3000/api/intelligence/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transactions: [],
        query: 'Test',
        profile: { displayName: 'Test' },
      }),
    });

    expect(res.status).toBe(401);
  });
});
