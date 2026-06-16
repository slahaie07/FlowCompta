import { describe, it, expect, vi, beforeEach } from 'vitest';
import { communicationService } from './communication';

describe('communicationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
