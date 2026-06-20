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

Sans `GOOGLE_GEMINI_API_KEY`, le chat support fonctionne en mode mock. Sans `ADMIN_SECRET`, les endpoints internes agents sont refusés.

### Authentification courriel (PKCE)

L'inscription et la confirmation par courriel utilisent **Supabase Auth** (PKCE). Configurez dans **Supabase Dashboard** → **Authentication → URL Configuration** :

- **Site URL** : `https://compta-flow.net` (prod) ou `http://localhost:5173` (dev).
- **Redirect URLs** (allow list) :
  - `http://localhost:5173/auth/callback`
  - `https://compta-flow.net/auth/callback`

Flux applicatif : `/login` → inscription/connexion courriel → lien de confirmation → `/auth/callback` → onboarding si profil incomplet (province) → portail selon le rôle.

## 💻 Développement local (Windows PowerShell)

Aucun Git Bash requis — tous les scripts npm utilisent `tsx` directement.

```powershell
npm install
npm run dev

# Qualité
npm run lint
npm test
npm run promotion:check

# Seed comptes admin (dry run)
npm run seed:admins:dry-run

# Seed live — mot de passe en argument (recommandé)
npm run seed:admins -- --password=votre-mot-de-passe

# ou variable d'environnement PowerShell
$env:SEED_ADMIN_PASSWORD = "votre-mot-de-passe"
npm run seed:admins

# Setup guidé Windows (migrations SQL + instructions)
npm run setup:windows
```

Référence complète : **`docs/DEV_COMMANDS.md`**

## 📚 Documentation pour l'Architecte
- `PROJECT_BLUEPRINT.md` : Guide suprême de l'architecture.
- `database.sql` : Schéma de base de données complet et sécurisé.
- `Comptaflow_HUB.html` : Cockpit local reliant tous les services.

---
© 2026 Comptaflow — Québec, Canada.
Propulsé par l'IA Architecte Suprême.
