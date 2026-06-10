import { UserData, Transaction, Invoice } from '../types';

/**
 * Gabarit de courriel haut de gamme (Style Canva/Stripe)
 * Pour le Bilan Mensuel du Client
 */
export function generateMonthlyClientEmail(userData: UserData, invoices: Invoice[], transactions: Transaction[]) {
  const totalSales = transactions.filter(t => t.type === 'sale').reduce((acc, t) => acc + t.amount, 0);
  const unpaidCount = invoices.filter(i => i.status === 'pending' || i.status === 'overdue').length;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', Helvetica, Arial, sans-serif; color: #1a1f36; line-height: 1.6; background-color: #f7f9fc; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #D4AF37 0%, #AA8529 100%); padding: 40px; text-align: center; color: #0b0e14; }
        .content { padding: 40px; }
        .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
        .stat-card { background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; text-align: center; }
        .stat-value { font-size: 24px; font-weight: bold; color: #D4AF37; margin: 5px 0; }
        .stat-label { font-size: 12px; text-transform: uppercase; color: #64748b; letter-spacing: 0.1em; }
        .button { display: inline-block; padding: 14px 28px; background-color: #0F52BA; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; background: #f8fafc; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-family: serif; font-style: italic;">ComptaFlow</h1>
          <p style="margin: 10px 0 0; opacity: 0.8; font-size: 14px;">Votre Bilan de Santé Financière</p>
        </div>
        <div class="content">
          <h2>Bonjour ${userData.displayName},</h2>
          <p>Voici l'état de votre dossier pour le mois en cours. Votre cabinet a finalisé l'analyse de vos flux récents.</p>
          
          <div class="stat-grid">
            <div class="stat-card">
              <div class="stat-label">Chiffre d'Affaires</div>
              <div class="stat-value">${totalSales.toLocaleString()} $</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Factures en attente</div>
              <div class="stat-value">${unpaidCount}</div>
            </div>
          </div>

          <p style="font-size: 14px;">Plusieurs documents sont prêts pour votre signature électronique dans le coffre-fort.</p>
          
          <div style="text-align: center;">
            <a href="https://flowcompta.netlify.app" class="button">Ouvrir mon Portail</a>
          </div>
        </div>
        <div class="footer">
          © 2026 Cabinet A&G - ComptaFlow. Tous droits réservés.<br>
          Gatineau, QC | Chiffrement AES-256
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Gabarit de Rapport d'Abonnement pour l'Admin
 * Style formel et complet
 */
export function generateSubscriptionReportEmail(userData: UserData, amount: number, confirmationId: string) {
  const needsList = Object.entries(userData.needs)
    .filter(([_, active]) => active)
    .map(([key, _]) => key === 'bookkeeping' ? 'Tenue de livres' : key === 'payroll' ? 'Gestion paie' : key === 'taxes' ? 'Impôts' : key)
    .join(', ');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: sans-serif; color: #0b0e14; background: #f4f7f6; padding: 20px; }
        .report-box { max-width: 600px; margin: auto; background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
        .banner { background: #0b0e14; color: #D4AF37; padding: 20px; text-align: center; }
        .section { padding: 30px; border-bottom: 1px solid #eee; }
        .label { font-size: 10px; text-transform: uppercase; color: #999; font-weight: bold; margin-bottom: 5px; }
        .value { font-size: 16px; margin-bottom: 20px; color: #333; }
        .total-box { background: #fff9e6; padding: 20px; border-radius: 8px; text-align: right; }
        .footer { padding: 20px; font-size: 11px; color: #aaa; text-align: center; }
      </style>
    </head>
    <body>
      <div class="report-box">
        <div class="banner">
          <h1 style="margin:0; font-size: 20px;">NOUVEL ABONNEMENT COMPTAFLOW</h1>
        </div>
        <div class="section">
          <div class="label">Client</div>
          <div class="value">${userData.displayName} (${userData.email})</div>
          
          <div class="label">Entreprise / Type</div>
          <div class="value">${userData.companyName || 'Particulier'} | ${userData.initialProfileType?.toUpperCase() || 'N/A'}</div>

          <div class="label">Services Sélectionnés</div>
          <div class="value" style="color: #0F52BA; font-weight: bold;">${needsList}</div>

          <div class="label">Numéro de Confirmation</div>
          <div class="value" style="font-family: monospace; background: #eee; padding: 5px 10px; display: inline-block; border-radius: 4px;">${confirmationId}</div>
        </div>
        <div class="section">
          <div class="total-box">
            <div class="label">Montant du premier versement</div>
            <div style="font-size: 28px; font-weight: bold; color: #D4AF37;">${amount.toLocaleString()} $ CAD</div>
            <div style="font-size: 10px; color: #666;">(Incluant frais d'ouverture de 60$)</div>
          </div>
        </div>
        <div class="footer">
          Généré automatiquement par le système ComptaFlow v1.0
        </div>
      </div>
    </body>
    </html>
  `;
}

