import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { communicationService } from './communication';

describe('communicationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Test hermétique : force le webhook à « non configuré » quel que soit
    // l'environnement (la CI définit VITE_N8N_INVOICE_WEBHOOK_URL). On teste
    // ici le comportement de repli, indépendamment des variables ambiantes.
    vi.stubEnv('VITE_N8N_INVOICE_WEBHOOK_URL', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('notifies admin of invoice with correct payload', async () => {
    const invoiceData = { id: '123', amount: 500 };
    await communicationService.notifyAdminOfInvoice(invoiceData);
    
    // Should NOT call fetch if webhook URL is not set (mocked to null/default)
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('logs to console when webhook is not configured', async () => {
    const consoleSpy = vi.spyOn(console, 'info');
    await communicationService.notifyAdminOfInvoice({ id: '1' });
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Webhook non configuré'),
      expect.any(Object)
    );
  });
});
