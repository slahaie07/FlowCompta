# 🏗️ COMPTAFLOW - BLUEPRINT CENTRALISÉ
> Généré le 10 Juin 2026

Ce document rassemble l'intelligence, la configuration et les instructions opérationnelles du projet pour une portabilité et une résilience maximale.

---

## 📋 1. CONFIGURATION SYSTÈME (`src/lib/config.ts`)
```typescript
export const CONFIG = {
  SUPABASE_URL: 'https://unvyxfxlzhnutpugjxhe.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_xgTxHqKekbsaWqERcsPwXw_sTbWCR9x',
  WEBHOOKS: {
    INVOICE: 'VITE_N8N_INVOICE_WEBHOOK_URL',
    SUBSCRIPTION: 'VITE_N8N_SUBSCRIPTION_WEBHOOK_URL',
  },
  STRIPE_PUBLIC_KEY: 'pk_test_...',
  PAYPAL_CLIENT_ID: 'test',
  FEES: {
    SETUP: 60.00,
    MONTHLY_BUSINESS: 449.00,
    PERSONAL_FILE: 120.00,
  },
  APP: {
    NAME: 'ComptaFlow',
    VERSION: '1.0.0-PROD',
    ADMIN_EMAILS: ['admin@comptaflow.ca', 's.lahaie07@gmail.com'],
    SUPPORT_EMAIL: 'support@comptaflow.ca',
  }
};
```

---

## 🗄️ 2. SCHÉMA DE BASE DE DONNÉES (`database.sql`)
```sql
-- Profiles Table
CREATE TABLE profiles (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    display_name TEXT,
    company_name TEXT,
    email TEXT UNIQUE,
    role TEXT DEFAULT 'client' CHECK (role IN ('client', 'admin')),
    status TEXT DEFAULT 'active',
    active_mode TEXT DEFAULT 'business',
    income_bracket TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS & Admin Logic
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
DECLARE is_admin_user BOOLEAN;
BEGIN
  SELECT (role = 'admin') INTO is_admin_user FROM profiles WHERE id = auth.uid();
  RETURN COALESCE(is_admin_user, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🛠️ 3. COMMANDES ET SCRIPTS (`package.json`)
- `npm run dev` : Lancement du serveur de développement hybride (Express + Vite).
- `npm run build` : Compilation complète frontend (dist/) et backend (cjs).
- `npm run start` : Exécution du build de production.
- `npm run lint` : Validation stricte des types TypeScript.

---

## 📄 4. DOCUMENTATION ORIGINALE (`GEMINI.md`)
- **Environnement** : Basé sur Supabase pour le RLS et l'Auth.
- **Routage** : React Router v7 (Navigation par URL réelle).
- **Paiement** : Hybride Stripe (Sessions) et PayPal (SDK).
- **Automation** : Pont n8n via Webhooks pour la gestion des événements critiques.

---

## 💾 5. ÉTAT DE LA SAUVEGARDE
Une sauvegarde complète du code source a été effectuée dans le dossier :
`C:\Users\user\flowcompta\backups`

*Note : Les dossiers 'node_modules' et 'dist' ont été exclus pour optimiser l'espace.*

---
**ComptaFlow - "L'élégance de la précision fiscale."**
