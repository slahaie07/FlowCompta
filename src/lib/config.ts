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
  SUPABASE_ANON_KEY: resolveSupabaseAnonKey() || sanitizeVar(getEnvVar('VITE_SUPABASE_ANON_KEY') || ''),

  // Automations (n8n)
  WEBHOOKS: {
    INVOICE: sanitizeVar(getEnvVar('VITE_N8N_INVOICE_WEBHOOK_URL')),
    SUBSCRIPTION: sanitizeVar(getEnvVar('VITE_N8N_SUBSCRIPTION_WEBHOOK_URL')),
  },

  // Paiements — Interac e-Transfer uniquement (aucune carte / PayPal)
  PAYMENT_METHOD: 'interac' as const,

  // Paramètres Métier — prix d'entrée de la grille officielle, alignés sur servicesCatalog.ts
  // (les forfaits mensuels varient ensuite selon l'échelle de transactions de pricingEstimator.ts)
  FEES: {
    SETUP: 149.00,
    HOURLY_BOOKKEEPING: 35.00,
    MONTHLY_MICRO: 149.99,
    MONTHLY_SMALL: 249.99,
    MONTHLY_SME: 449.99,
    GST_QST: 75.00,
    PAYROLL: 49.00,
    T4_RELEVE1: 15.00,
    CATCH_UP: 75.00,
    SOFTWARE_SETUP: 199.00,
    TAX_HELP_AUTONOMOUS: 199.99,
  },

  // Sécurité & App
  APP: {
    NAME: 'Comptaflow',
    VERSION: '1.0.0-PROD',
    SUPER_ADMIN_EMAILS: ['admin@compta-flow.net', 'compta-flow@outlook.com'],
    SUB_ADMIN_EMAILS: ['comptable@compta-flow.net', 'partenaire@compta-flow.net'],
    SUPPORT_EMAIL: 'contact@compta-flow.net',
    INTAKE_FORM_URL: 'https://docs.google.com/forms/d/e/1FAIpQLSdF_7Sfi0fbRwGezELWVdGZ9QzUtQnY-FTI5ROmVXB0sooPHg/viewform',
    SITE_URL: 'https://compta-flow.net',
    /** Destinataire par défaut des virements Interac plateforme (distinct des comptes auth admin). */
    INTERAC_EMAIL: 'compta-flow@outlook.com',
  }
};

/** Courriel officiel support / soumissions / reçus — source unique côté app. */
export const SUPPORT_EMAIL = CONFIG.APP.SUPPORT_EMAIL;

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
