# Biopsie des environnements — ComptaFlow

> Audit du 2026-06-20 — branche `cursor/biopsy-cleanup-deploy-52fd`

## Résumé exécutif

| Environnement | URL / cible | Statut | Rôle |
|---------------|-------------|--------|------|
| **Production** | https://compta-flow.net | Actif (Vercel `yul1`) | SPA + API serverless |
| **Preview Vercel** | `*.vercel.app` | CI sur branches `cursor/**` | Prévisualisation avant merge |
| **GitHub Pages** | `*.github.io/flowcompta/` | **Désactivé** (workflow_dispatch) | Conflit base `/flowcompta/` vs `/` |
| **Cloudflare Pages** | — | **Désactivé** (workflow_dispatch) | Remplacé par Vercel |
| **Railway / Docker** | `Dockerfile` + `railway.json` | Config présente, non primaire | Fallback Node standalone |
| **n8n local** | `docker-compose.yml` :5678 | Dev / automation | Webhooks facturation, onboarding |
| **Supabase** | `hnxdlzdgiascuawgydir.supabase.co` | Production DB + Auth | PostgreSQL, RLS, Realtime |
| **Flowcompta-** | Repo placeholder | Vide | Non utilisé |

## Pipeline CI/CD (GitHub Actions)

### `canada-network.yml` — **principal**

- **Déclencheurs** : push `main`, `cursor/**`, PRs, manuel
- **Jobs** : lint → test (62) → build → vérif réseau Canada (13 régions)
- **Déploiement Vercel** : push `main` → `--prod` ; branches `cursor/**` → preview
- **Secrets requis** : `VITE_SUPABASE_*`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

### `deploy-gh-pages.yml` — **désactivé sur push**

- Conflit avec Vercel (`vite.config.ts` base `/flowcompta/` sur GITHUB_REPOSITORY)
- Réactivable manuellement via `workflow_dispatch`

### `deploy.yml` (Cloudflare) — **désactivé**

## Variables d'environnement

Voir `.env.example`. Production minimale :

| Variable | Côté | Critique |
|----------|------|----------|
| `VITE_SUPABASE_URL` | Client | Oui |
| `VITE_SUPABASE_ANON_KEY` | Client | Oui |
| `SUPABASE_SERVICE_ROLE_KEY` | API | Oui |
| `GOOGLE_GEMINI_API_KEY` | API (agents) | Recommandé |
| `ADMIN_SECRET` | API interne | Oui |
| `CRON_SECRET` | Crons Vercel | Oui |
| `STRIPE_SECRET_KEY` / webhook | Paiements | Si Stripe actif |
| `RESEND_API_KEY` | Emails | Si emails actifs |

## Santé du code (post-nettoyage)

```
npm run lint   → OK (tsc --noEmit)
npm test       → OK (62 tests, 16 fichiers)
npm run build  → OK (Vite + esbuild API)
```

## Nettoyage effectué

1. **Suppression `backups/`** (~149 fichiers, ~2.9 Mo) — snapshot du 2026-06-14 dupliqué
2. **Suppression `src/_archive/`** — code Firebase legacy
3. **Suppression scripts ad-hoc** : `MEGA_TRUE_TEST.ts`, `PRODUCTION_STRESS_TEST.ts`, `SUPREME_STACK_BIOPSY.ts`, `test-auth.ts`, `test-admin.ts`
4. **Suppression configs Firebase** : `firebase.json`, `.firebaserc`, `firebase-applet-config.json`
5. **Désinstallation** `firebase`, `firebase-admin` (non utilisés en prod)
6. **`api/index.js`** retiré du dépôt — artefact de build uniquement (généré par `npm run build`)
7. **`local_db.json`** retiré du dépôt — fallback dev avec credentials ; modèle `local_db.example.json`
8. **GitHub Pages** : plus de déploiement automatique sur `main`

## Migrations Supabase à appliquer manuellement

```
supabase/migrations/20260619_rls_hardening.sql
supabase/migrations/20260619_google_oauth_profile.sql
supabase/migrations/20260619_partner_directory.sql
```

## Crons Vercel (`vercel.json`)

| Chemin | Horaire | Rôle |
|--------|---------|------|
| `/api/cron/elite-hunter` | 10h UTC | Prospection B2B |
| `/api/cron/agent-health` | 6h UTC | Santé agents IA |

## Recommandations post-déploiement

1. Vérifier les secrets GitHub (`VERCEL_*`, `VITE_SUPABASE_*`)
2. Confirmer `ADMIN_SECRET` et `CRON_SECRET` forts sur Vercel
3. Appliquer les migrations Supabase si pas déjà fait
4. Tester OAuth Google sur https://compta-flow.net/auth/callback
5. Exécuter `./scripts/verify-canada-network.sh` après deploy prod

---

© 2026 ComptaFlow — Québec, Canada
