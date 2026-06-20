import { CONFIG } from './config';
import { supabase } from './supabase';

const ADMIN_NOTIFY_EMAIL = CONFIG.APP.SUPPORT_EMAIL;

/**
 * Service de communication ComptaFlow
 * Relie les actions critiques à l'infrastructure backend via Webhooks n8n/Automation.
 */
export const communicationService = {
  /**
   * Envoi générique vers le bus d'automatisation
   */
  async _postToAutomation(webhookUrl: string, payload: any) {
    if (!webhookUrl || webhookUrl.includes('your-n8n-instance')) {
      console.info("[CommunicationService] Webhook non configuré. Payload:", payload);
      return;
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (e) {
      console.error("[CommunicationService] Échec de la notification:", e);
    }
  },

  /**
   * Notifie l'admin d'une nouvelle facture ou d'un paiement.
   */
  async notifyAdminOfInvoice(invoiceData: any) {
    const N8N_URL = import.meta.env.VITE_N8N_INVOICE_WEBHOOK_URL;
    
    await this._postToAutomation(N8N_URL, {
      adminEmail: ADMIN_NOTIFY_EMAIL,
      type: 'INVOICE_CREATED',
      data: invoiceData,
      timestamp: new Date().toISOString()
    });
  },

  /**
   * Notifie l'admin d'un nouvel abonnement complet.
   */
  async notifyAdminOfSubscription(userData: any, amount: number, confirmationId: string) {
    const N8N_URL = import.meta.env.VITE_N8N_SUBSCRIPTION_WEBHOOK_URL;
    
    await this._postToAutomation(N8N_URL, {
      adminEmail: ADMIN_NOTIFY_EMAIL,
      type: 'NEW_SUBSCRIPTION',
      client: userData.displayName,
      email: userData.email,
      company: userData.companyName,
      amount: amount,
      confirmation: confirmationId,
      services: userData.needs,
      timestamp: new Date().toISOString()
    });
  },

  /**
   * Notifie l'admin d'un choix de paiement manuel (Interac).
   */
  async notifyAdminOfManualPayment(userData: any, amount: number) {
    const N8N_URL = import.meta.env.VITE_N8N_SUBSCRIPTION_WEBHOOK_URL;
    
    await this._postToAutomation(N8N_URL, {
      adminEmail: ADMIN_NOTIFY_EMAIL,
      type: 'MANUAL_PAYMENT_PENDING',
      client: userData.displayName,
      email: userData.email,
      company: userData.companyName,
      amount: amount,
      instructions: 'Virement Interac attendu',
      timestamp: new Date().toISOString()
    });
  }
};
