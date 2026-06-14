/**
 * Configuration Centrale Comptaflow
 * Ce fichier est la source unique de vérité pour tous les paramètres de l'application.
 */

export const CONFIG = {
  // Supabase
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'https://hnxdlzdgiascuawgydir.supabase.co',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_BHVkYelBLz9x0HJn_EWDyQ_EyJxaAWF',

  // Automations (n8n)
  WEBHOOKS: {
    INVOICE: import.meta.env.VITE_N8N_INVOICE_WEBHOOK_URL,
    SUBSCRIPTION: import.meta.env.VITE_N8N_SUBSCRIPTION_WEBHOOK_URL,
  },

  // Paiements
  STRIPE_PUBLIC_KEY: import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_...',
  PAYPAL_CLIENT_ID: import.meta.env.VITE_PAYPAL_CLIENT_ID || 'test',

  // Paramètres Métier
  FEES: {
    SETUP: 60.00,
    T1: 89.00,
    TA: 199.00,
    T2: 749.00,
    BOOKKEEPING: 249.00,
    STOCKS: 179.00,
    CFO: 499.00
  },

  // Sécurité & App
  APP: {
    NAME: 'Comptaflow',
    VERSION: '1.0.0-PROD',
    ADMIN_EMAILS: ['admin@comptaflow.ca', 's.lahaie07@gmail.com'],
    SUPPORT_EMAIL: 'support@comptaflow.ca',
    INTERAC_EMAIL: 's.lahaie07@gmail.com',
  }
};

/**
 * Validation de l'intégrité du système au démarrage.
 */
export function checkSystemHealth() {
  const issues = [];
  if (!import.meta.env.VITE_SUPABASE_URL) issues.push("Supabase URL absente (fallback actif)");
  if (!import.meta.env.VITE_N8N_INVOICE_WEBHOOK_URL) issues.push("Webhook Facturation non configuré");
  
  if (issues.length > 0) {
    console.warn("⚠️ Diagnostic Système :", issues);
  } else {
    console.info("✅ Système Centralisé & Opérationnel.");
  }
}
