# Biopsie des environnements — ComptaFlow

Rapport généré le **20 juin 2026** après audit complet du workspace, des déploiements et de l’intégrité du code.

---

## 1. Cartographie des dépôts

| Dépôt | Rôle | État |
|-------|------|------|
| **FlowCompta** | Application principale (React + Express + Supabase) | Actif — production sur Vercel |
| **Flowcompta-** | Placeholder AI Studio / Gemini | Vide (README seulement) — non déployé |
| **Excel-Game** | Projet HTML/Jekyll séparé | Indépendant — GitHub Pages |

**Conclusion :** le projet opérationnel est **FlowCompta** → [https://compta-flow.net](https://compta-flow.net).

---

## 2. Environnements

### Production — Vercel (`compta-flow.net`)

| Vérification | Résultat |
|--------------|----------|
| Frontend (`GET /`) | HTTP 200, région `yul1`, headers sécurité OK |
| `GET /api/health` | HTTP 200 — service opérationnel |
| `GET /api/network/status` | HTTP 200 — 13 régions Canada, PIPEDA / Loi 25 |
| `GET /api/cron/agent-health` | HTTP 401 sans secret (comportement attendu) |

**État des secrets (via `/api/health`) :**

| Variable | Statut prod |
|----------|-------------|
| Gemini (`GOOGLE_GEMINI_API_KEY`) | live |
| Supabase client | configured |
| `SUPABASE_SERVICE_ROLE_KEY` | **missing** — à ajouter dans Vercel |
| Resend | configured |
| `ADMIN_SECRET` | configured |
| `CRON_SECRET` | configured |

> **Action prioritaire :** ajouter `SUPABASE_SERVICE_ROLE_KEY` dans Vercel → Settings → Environment Variables (Production). Sans elle, les routes serveur (création sub-admin, webhooks sensibles) sont limitées.

### CI/CD — GitHub Actions

| Workflow | Déclencheur | Statut |
|----------|-------------|--------|
| Canada Network Deploy | push `main` / `cursor/**` | **Bloqué** — compte GitHub Actions verrouillé (facturation) |
| Deploy to GitHub Pages | ~~push main~~ → `workflow_dispatch` | Désactivé sur push (conflit avec Vercel) |
| Cloudflare Pages | `workflow_dispatch` | Inactif (legacy) |

Le déploiement production repose sur **l’intégration Git Vercel** (indépendante des Actions). Les pushes sur `main` déclenchent le build Vercel si le projet est lié au dépôt.

### Alternatifs configurés mais non utilisés

- **Railway** (`railway.json` + `Dockerfile`) — prêt pour conteneur Node, non actif en prod
- **Cloudflare Pages** — workflow legacy désactivé
- **GitHub Pages** — workflow désactivé sur push
- **Netlify** — documentation legacy (`NETLIFY_DEPLOY.md`)

### Local / développement

```bash
cp .env.example .env.local   # renseigner les clés
npm install
npm run dev                    # tsx server.ts
npm run lint && npm test && npm run build
npm run promotion:check        # checklist pré-déploiement
```

---

## 3. Intégrité du code (20 juin 2026)

| Contrôle | Résultat |
|----------|----------|
| `npm run lint` (tsc) | OK |
| `npm test` (vitest) | 62/62 tests passés |
| `npm run build` | OK — bundle principal ~235 Ko gzip ~68 Ko |

---

## 4. Ménage effectué (branche `cursor/cleanup-deploy-82e2`)

Suppression du versioning Git pour :

- `backups/` (~149 fichiers, copie du 14 juin 2026)
- `src/_archive/` (composants legacy non importés)
- Binaires Windows (`.exe`) et sources C# desktop
- Scripts de stress test à la racine (`STRESS_TEST.js`, `MEGA_TRUE_TEST.ts`, etc.)
- Restauration du **stub** `api/index.js` (le bundle est généré par `npm run build` sur Vercel)

Mise à jour :

- `.gitignore` — empêche le retour des backups / binaires
- `.env.example` — `CRON_SECRET`, `RESEND_API_KEY`, `STRIPE_SECRET_KEY`
- `deploy-gh-pages.yml` — plus de déploiement automatique concurrent

---

## 5. Actions restantes (côté propriétaire)

1. **Vercel** — ajouter `SUPABASE_SERVICE_ROLE_KEY` en production  
   - Supabase → [Settings → API](https://supabase.com/dashboard/project/hnxdlzdgiascuawgydir/settings/api) → `service_role`  
   - Puis `npm run vercel:sync-env` (avec `VERCEL_TOKEN` + `.env.local`) ou collage manuel dans Vercel
2. **Supabase RLS** — erreur `42P17` (récursion) sur le sélecteur de partenaires :
   ```bash
   npm run db:migrate   # avec SUPABASE_DB_PASSWORD
   ```
   Ou coller `supabase/migrations/20260620_fix_profiles_rls_recursion.sql` dans le SQL Editor.
3. **GitHub** — résoudre le verrouillage facturation Actions (optionnel)
4. **Stripe** — clés `live` si facturation réelle souhaitée
5. **Vérification** — `npm run finish:setup`

---

## 6. Commandes de vérification post-déploiement

```bash
curl -s https://compta-flow.net/api/health | jq .
./scripts/verify-canada-network.sh
```

---

*ComptaFlow — Québec, Canada — données hébergées région `ca-central-1` / edge `yul1`.*
