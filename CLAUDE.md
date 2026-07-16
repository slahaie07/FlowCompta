# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Express + Vite via tsx server.ts, port 3000)
npm run build     # Build frontend (Vite) + backend (esbuild → dist/server.cjs)
npm start         # Run production build
npm run lint      # TypeScript type-check (tsc --noEmit)
npm test          # Run all tests with Vitest
npx vitest run src/lib/financeUtils.test.ts  # Run a single test file
```

## Architecture

FlowCompta is a Canadian accounting SaaS for a CPA cabinet. It is a **full-stack single-repo** app:

- **Frontend**: React 19 + TypeScript, Vite, Tailwind CSS 4 (Vite plugin, not PostCSS)
- **Backend**: Express server in `server.ts` that serves both the Vite app in dev (via `createViteServer`) and static files in production, plus all `/api/*` routes
- **Primary database**: Supabase (PostgreSQL + Auth)
- **Fallback database**: `local_db.json` — a flat JSON file served through Express `/api/*` routes. This is not a development convenience; it is a designed production fallback so the app works when Supabase is unavailable

### The three-tier fallback pattern

This pattern runs throughout the data layer. Any data operation tries:
1. **Supabase** (primary cloud DB)
2. **Express `/api/*` routes** backed by `local_db.json` (internal fallback)
3. **localStorage** (for auth session only)

`useAuth` (`src/hooks/useAuth.ts`) and `internalApi` (`src/lib/api.ts`) are the canonical examples. When adding new data features, preserve this pattern.

### Auth and routing (`src/App.tsx`)

`useAuth` drives all routing decisions. The guard logic is:
- No session → `/login`
- Session but no `incomeBracket` on profile → `/onboarding` (profile incomplete)
- Session + complete profile → `/dashboard/*`

Admin status is determined by `role === 'admin'` in the Supabase profile **or** by email being in `CONFIG.APP.ADMIN_EMAILS` (`src/lib/config.ts`). The two hardcoded admin emails are `admin@comptaflow.ca` and `s.lahaie07@gmail.com`.

### Dashboard routing (`src/components/Dashboard.tsx`)

The Dashboard is a shell with a sidebar. The active panel is determined by the URL path under `/dashboard/`:

| Path | Component | Who sees it |
|------|-----------|-------------|
| `/dashboard/overview` | `Overview` | Clients |
| `/dashboard/transactions` | `Transactions` | Both (filtered by role) |
| `/dashboard/invoices` | `Invoices` | Both |
| `/dashboard/vault` | `Vault` | Clients |
| `/dashboard/messaging` | `Messaging` | Both |
| `/dashboard/integrations` | `Integrations` | Clients |
| `/dashboard/admin_overview` | `AdminOverview` | Admins only |
| `/dashboard/admin_clients` | `AdminClients` | Admins only |

### Key lib modules

- `src/lib/config.ts` — single source of truth for all config (Supabase URL/key, fees, admin emails, webhook URLs). All env vars have hardcoded fallbacks so the app boots without a `.env`.
- `src/lib/api.ts` — `internalApi` client that calls the Express fallback routes
- `src/lib/financeUtils.ts` — Canadian tax engine. `calculateCanadianTaxes(amount, province)` returns `{ tps, tvq, tvh, total }`. QC uses GST+QST; ON/Atlantic use HST; other provinces use GST only.
- `src/lib/communication.ts` — sends n8n webhook notifications (subscription alerts, invoice events)
- `src/lib/firebase.ts` — Firebase/Firestore client (optional redundancy layer for document storage)
- `src/lib/i18n.ts` — translations for FR/EN/AR; `UserData.language` selects locale

### Express server (`server.ts`)

The server handles:
- `/api/auth/register` and `/api/auth/login` — local JSON auth fallback
- `/api/profile/:id` — read/write profiles to `local_db.json`
- `/api/transactions` — CRUD against `local_db.json`
- `/api/invoices` — CRUD against `local_db.json`
- `/api/admin/clients` — admin-only client list
- `/api/payment/simulate`, `/api/payment/stripe`, `/api/payment/paypal` — payment endpoints (Stripe/PayPal in sandbox mode)
- In dev: proxies all non-API requests through Vite's dev middleware. In production: serves `dist/` as static files.

### Supabase schema

Five tables defined in `database.sql`:
- `profiles` — one per user; `role` column is `'admin'` or `'client'`; `active_mode` is `'personal'` or `'business'`
- `transactions` — `type` is `'sale'` or `'purchase'`; `status` is `'pending' | 'reconciled' | 'error' | 'quarantine'`; `context` is `AppMode`
- `invoices` — `status` is `'paid' | 'pending' | 'overdue' | 'draft'`
- `audit_logs` — append-only action tracking
- `documents` — encrypted file metadata; actual files are in Firebase Storage

Row-level security is enforced: users can only access their own rows; admins bypass via role check.

### Environment variables

Copy `.env.example` to `.env`. All vars have fallbacks in `src/lib/config.ts` so the app runs without them, but Stripe/PayPal/n8n webhooks will use sandbox/no-op values.

Required for production:
- `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`
- `VITE_STRIPE_PUBLIC_KEY` + `STRIPE_SECRET_KEY`
- `VITE_PAYPAL_CLIENT_ID` + `PAYPAL_CLIENT_ID` + `PAYPAL_CLIENT_SECRET`
- `VITE_N8N_INVOICE_WEBHOOK_URL` + `VITE_N8N_SUBSCRIPTION_WEBHOOK_URL`

### Testing

Tests live alongside source in `src/lib/*.test.ts`. The test setup (`src/test/setup.ts`) mocks the entire Supabase client and `global.fetch`. Tests run in jsdom. There are no component tests currently; only utility unit tests (`financeUtils`, `communication`).

### Codebase language

Code comments, variable names in `server.ts`, and UI strings are primarily **French**. `src/lib/i18n.ts` handles runtime translation. When adding comments or console messages, follow the existing language of the file.
