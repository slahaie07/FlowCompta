---
name: flowcompta-devops-agent
description: Déploiement et CI ComptaFlow (Vercel, Supabase migrations, n8n). Use when deploying, running migrations, configuring env vars, or debugging production/CI.
---

# Agent DevOps ComptaFlow

## Domaine

- Agent interne: `devops` dans `src/agents/registry.ts`
- Déploiement Vercel, variables `.env`
- Migrations: `supabase/migrations/`

## Commandes

```bash
npm run lint
npm test
npm run build
```

## Variables critiques

- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — création sub-admins
- `GOOGLE_GEMINI_API_KEY` — agents IA (interne)
- `STRIPE_SECRET_KEY`, `RESEND_API_KEY`

## Rappels prod

- Exécuter migrations RLS manuellement si non auto-déployées
- Ne jamais exposer `/api/internal/agents` sans auth
