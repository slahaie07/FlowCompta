import { describe, it, expect } from 'vitest';
import { calculateCanadianTaxes } from '../lib/financeUtils';
import { getClientEmailTemplate, getAgentEmailTemplate, getAdminEmailTemplate, getAccountConfirmedEmailTemplate } from '../../api/lib/emailTemplates';

describe('Premium Quote Builder & Emails (Canva Style)', () => {
  it('calcule correctement les tarifs de la tenue de livres avec volume et incorporation', () => {
    // Cas 1: 50 transactions, incorporé
    // Base: 150$, transactions supp: (50-30)*0.50 = 10$, incorporation: 75$ => Subtotal = 235$
    let base = 150.00;
    const transactions = 50;
    if (transactions > 30) base += (transactions - 30) * 0.50;
    base += 75.00; // inc

    expect(base).toBe(235.00);

    const taxes = calculateCanadianTaxes(base, 'QC');
    expect(taxes.subtotal).toBe(235.00);
    expect(taxes.tps).toBe(11.75); // 5%
    expect(taxes.tvq).toBe(23.44); // 9.975% rounded
    expect(taxes.total).toBe(270.19); // 235 + 11.75 + 23.44
  });

  it('calcule correctement les tarifs des impôts avec feuillets et crypto', () => {
    // Cas 2: 5 feuillets, crypto
    // Base: 120$, feuillets supp: (5-2)*10 = 30$, crypto: 50$ => Subtotal = 200$
    let base = 120.00;
    const slips = 5;
    if (slips > 2) base += (slips - 2) * 10;
    base += 50.00; // crypto

    expect(base).toBe(200.00);

    const taxes = calculateCanadianTaxes(base, 'QC');
    expect(taxes.total).toBe(229.95); // 200 + 10 (TPS) + 19.95 (TVQ)
  });

  it('produit les templates HTML Or & Noir avec les données réelles', () => {
    const mockData = {
      clientName: 'Tremblay Inc.',
      clientEmail: 'info@tremblay.ca',
      serviceName: 'Tenue de Livres Mensuelle',
      province: 'QC',
      subtotal: '235,00 $',
      taxesHtml: '<tr><td>TPS :</td><td>11,75 $</td></tr>',
      total: '270,19 $',
      agentName: 'Sylvie Charette-Clément',
      agentEmail: 'viviee28@hotmail.com',
      quoteRef: 'EST-2026-9872',
      portalUrl: 'https://compta-flow.net/login',
    };

    const clientMail = getClientEmailTemplate(mockData);
    const agentMail = getAgentEmailTemplate(mockData);
    const adminMail = getAdminEmailTemplate(mockData);

    expect(clientMail).toContain('Tremblay Inc.');
    expect(clientMail).toContain('EST-2026-9872');
    expect(clientMail).toContain('#D4AF37'); // Couleur Or

    expect(agentMail).toContain('Sylvie Charette-Clément');
    expect(agentMail).toContain('info@tremblay.ca');

    expect(adminMail).toContain('Tremblay Inc.');
    expect(adminMail).toContain('Samuel');
  });

  it('prend en charge la traduction arabe (RTL) pour le client d\'Eya', () => {
    const mockArabicData = {
      clientName: 'ياسمين بن علي',
      clientEmail: 'yasmine@cpa.ca',
      serviceName: 'مسك الدفاتر الشهري',
      province: 'QC',
      subtotal: '235,00 $',
      taxesHtml: '<tr><td>ضريبة :</td><td>35,19 $</td></tr>',
      total: '270,19 $',
      agentName: 'إيليا (Eya)',
      agentEmail: 'eya-cpa@outlook.com',
      quoteRef: 'EST-2026-9872',
      portalUrl: 'https://compta-flow.net/login',
      lang: 'ar' as const,
    };

    const clientMail = getClientEmailTemplate(mockArabicData);
    expect(clientMail).toContain('dir="rtl"');
    expect(clientMail).toContain('ياسمين بن علي');
    expect(clientMail).toContain('إيليا (Eya)');
  });

  it('produit le template HTML Or & Noir de confirmation de compte', () => {
    const html = getAccountConfirmedEmailTemplate({
      clientName: 'Marc-André Tremblay',
      clientEmail: 'marc.andre@tremblay.ca',
      portalUrl: 'https://compta-flow.net/login',
    });

    expect(html).toContain('Marc-André Tremblay');
    expect(html).toContain('marc.andre@tremblay.ca');
    expect(html).toContain('Courriel Confirmé');
    expect(html).toContain('#D4AF37'); // Or
  });
});
