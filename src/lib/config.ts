/**
 * Configuration Centrale Comptaflow
 * Ce fichier est la source unique de vérité pour tous les paramètres de l'application.
 */

const sanitizeVar = (val: string | undefined): string => {
  if (!val) return '';
  return val.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
};

const getEnvVar = (key: string): string | undefined => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  return undefined;
};

export const CONFIG = {
  // Supabase
  SUPABASE_URL: sanitizeVar(getEnvVar('VITE_SUPABASE_URL') || 'https://hnxdlzdgiascuawgydir.supabase.co'),
  SUPABASE_ANON_KEY: sanitizeVar(getEnvVar('VITE_SUPABASE_ANON_KEY') || 'sb_publishable_BHVkYelBLz9x0HJn_EWDyQ_EyJxaAWF'),

  // Automations (n8n)
  WEBHOOKS: {
    INVOICE: sanitizeVar(getEnvVar('VITE_N8N_INVOICE_WEBHOOK_URL')),
    SUBSCRIPTION: sanitizeVar(getEnvVar('VITE_N8N_SUBSCRIPTION_WEBHOOK_URL')),
  },

  // Paiements
  STRIPE_PUBLIC_KEY: sanitizeVar(getEnvVar('VITE_STRIPE_PUBLIC_KEY') || 'pk_test_...'),
  PAYPAL_CLIENT_ID: sanitizeVar(getEnvVar('VITE_PAYPAL_CLIENT_ID') || 'test'),

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
    SUPER_ADMIN_EMAILS: ['admin@comptaflow.ca', 's.lahaie07@gmail.com'],
    SUB_ADMIN_EMAILS: ['comptable@comptaflow.ca', 'partenaire@comptaflow.ca'],
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
