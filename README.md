# Comptaflow — La comptabilité qui coule de source 🚀

![Comptaflow Banner](https://compta-flow.net/og-image.png)

Comptaflow est un cabinet comptable de nouvelle génération basé au Québec, fusionnant l'expertise fiscale traditionnelle avec une infrastructure technologique de pointe. 

## 🏛️ L'Écosystème Comptaflow
Le projet est structuré autour de quatre piliers fondamentaux :
- **🚀 Portail Client** : Interface haute couture pour l'onboarding, le dépôt de documents et le suivi en temps réel.
- **🛡️ Console Admin** : Cockpit de pilotage pour le CPA (gestion des mandats, facturation, messagerie).
- **🔐 Coffre-fort** : Stockage chiffré AES-256 conforme à la Loi 25.
- **💬 Flux Direct** : Messagerie instantanée CPA-Client via Supabase Realtime.

## 🛠️ Stack Technique (Elite)
- **Frontend** : React 19, Vite, Tailwind CSS, Framer Motion.
- **Backend** : Node.js (Express) on Vercel Functions.
- **Base de données** : Supabase (PostgreSQL), Realtime engine.
- **Email** : Resend API integration.
- **Paiements** : Stripe & PayPal components + Interac Webhook scaffolding.

## 🚀 Déploiement
La plateforme est déployée en production sur **Vercel** :
👉 [https://compta-flow.net/](https://compta-flow.net/)

### Variables d'environnement (production)
Copiez `.env.example` et renseignez au minimum :

| Variable | Usage |
|----------|--------|
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | Auth et données client |
| `SUPABASE_SERVICE_ROLE_KEY` | API serveur (sub-admins, webhooks) — **secret** |
| `GOOGLE_GEMINI_API_KEY` | Assistant support multi-agents (Gemini) |
| `ADMIN_SECRET` | `Authorization: Bearer` ou header `X-ComptaFlow-Internal` sur `/api/internal/*` |
| `CRON_SECRET` | Protection des crons Vercel (`/api/cron/*`) |
| `INITIAL_ADMIN_EMAIL` / `INITIAL_ADMIN_PASSWORD` | Provisionnement initial via `/api/setup-admin` |
| `VITE_BASE_PATH` | Chemin public Vite; conserver `/` pour Vercel |

Sans `GOOGLE_GEMINI_API_KEY`, le chat support fonctionne en mode mock. Sans `ADMIN_SECRET`, les endpoints internes agents, diagnostics et réconciliation sont refusés.

### Connexion Google (OAuth)

La connexion « Continuer avec Google » utilise **Supabase Auth** (PKCE). Aucune clé Google n'est requise dans `.env` — tout se configure dans les consoles Supabase et Google Cloud.

1. **Google Cloud Console** ([console.cloud.google.com](https://console.cloud.google.com))
   - Créer un projet (ou réutiliser un existant).
   - **APIs & Services → OAuth consent screen** : type External, domaines autorisés `compta-flow.net`.
   - **Credentials → Create OAuth client ID** : type **Web application**.
   - **Authorized redirect URIs** :
     - `https://<VOTRE_PROJECT_REF>.supabase.co/auth/v1/callback`
   - Copier **Client ID** et **Client Secret**.

2. **Supabase Dashboard** → **Authentication → Providers → Google**
   - Activer Google, coller Client ID et Client Secret.

3. **Supabase** → **Authentication → URL Configuration**
   - **Site URL** : `https://compta-flow.net` (prod) ou `http://localhost:5173` (dev).
   - **Redirect URLs** (allow list) :
     - `http://localhost:5173/auth/callback`
     - `https://compta-flow.net/auth/callback`

4. Appliquer la migration SQL `supabase/migrations/20260619_google_oauth_profile.sql` (profil `client` + nom Google).

Flux applicatif : `/login` → Google → `/auth/callback` → onboarding si profil incomplet (province) → portail selon le rôle.

## 📚 Documentation pour l'Architecte
- `PROJECT_BLUEPRINT.md` : Guide suprême de l'architecture.
- `database.sql` : Schéma de base de données complet et sécurisé.
- `Comptaflow_HUB.html` : Cockpit local reliant tous les services.

---
© 2026 Comptaflow — Québec, Canada.
Propulsé par l'IA Architecte Suprême.
