import { describe, it, expect } from 'vitest';
import { calculateCanadianTaxes } from '../lib/financeUtils';
import { calculatePricingEstimate } from '../lib/pricingEstimator';
import { getClientEmailTemplate, getAgentEmailTemplate, getAdminEmailTemplate, getAccountConfirmedEmailTemplate } from '../../api/lib/emailTemplates';

describe('Estimateur réel et gabarits courriel', () => {
  it('calcule le forfait Micro selon la grille, taxes QC incluses', () => {
    const estimate = calculatePricingEstimate({
      serviceId: 'monthlyMicro',
      province: 'QC',
      profileType: 'personal',
      volumeBand: 'low',
      employeeBand: 'none',
      urgency: 'standard',
      addOns: [],
      transactionsBand: 't0_30',
      lateMonthsBand: 'm1_6',
    });
    expect(estimate.amountTypical).toBe(149.99);

    const taxes = calculateCanadianTaxes(estimate.amountTypical, 'QC');
    expect(taxes.subtotal).toBe(149.99);
    expect(taxes.tps).toBeCloseTo(7.5, 2); // 5 %
    expect(taxes.tvq).toBeCloseTo(14.96, 2); // 9,975 %
    expect(taxes.total).toBeCloseTo(172.45, 2);
  });

  it('calcule la paie selon la grille (49 $ + 12 $/employé), TVH Ontario incluse', () => {
    const estimate = calculatePricingEstimate({
      serviceId: 'payroll',
      province: 'ON',
      profileType: 'business',
      volumeBand: 'medium',
      employeeBand: 'medium',
      urgency: 'standard',
      addOns: [],
      transactionsBand: 't31_75',
      lateMonthsBand: 'm1_6',
    });
    expect(estimate.amountTypical).toBe(169); // 49 + 12 x 10

    const taxes = calculateCanadianTaxes(estimate.amountTypical, 'ON');
    expect(taxes.total).toBeCloseTo(190.97, 2); // TVH 13 %
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
