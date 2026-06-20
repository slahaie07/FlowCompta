/**
 * Configuration Centrale Comptaflow
 * Ce fichier est la source unique de vérité pour tous les paramètres de l'application.
 */

import { resolveSupabaseAnonKey, resolveSupabaseUrl } from './envResolve';

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
  // Supabase (VITE_*, NEXT_PUBLIC_*, or Vercel integration SUPABASE_*)
  SUPABASE_URL: resolveSupabaseUrl(),
  SUPABASE_ANON_KEY: resolveSupabaseAnonKey() || sanitizeVar(getEnvVar('VITE_SUPABASE_ANON_KEY') || 'sb_publishable_BHVkYelBLz9x0HJn_EWDyQ_EyJxaAWF'),

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
    HOURLY_BOOKKEEPING: 60.00,
    MONTHLY_MICRO: 200.00,
    MONTHLY_SMALL: 400.00,
    MONTHLY_SME: 650.00,
    GST_QST: 48.00,
    PAYROLL: 65.00,
    T4_RELEVE1: 75.00,
    CATCH_UP: 60.00,
    SOFTWARE_SETUP: 225.00,
    TAX_HELP_AUTONOMOUS: 225.00,
  },

  // Sécurité & App
  APP: {
    NAME: 'Comptaflow',
    VERSION: '1.0.0-PROD',
    SUPER_ADMIN_EMAILS: ['admin@compta-flow.net', 's.lahaie07@gmail.com'],
    SUB_ADMIN_EMAILS: ['comptable@compta-flow.net', 'partenaire@compta-flow.net'],
    SUPPORT_EMAIL: 'support@compta-flow.net',
    SITE_URL: 'https://compta-flow.net',
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
