# ComptaFlow — setup without CLI / service role (local)

When `SUPABASE_SERVICE_ROLE_KEY` is unavailable locally (Vercel cannot `env add` without a value, MCP auth fails, preview env incomplete), use this dashboard-first path.

## Quick path (recommended)

| Step | Where | Action |
|------|--------|--------|
| 0 | Supabase SQL Editor | Run `comptaflow_migration.sql` if base schema not applied |
| 1 | Supabase SQL Editor | Paste **`scripts/combined-migrations.sql`** → Run |
| 2 | Supabase Auth → Users | Create 3 users with **Auto Confirm User** ON (see emails below) |
| 3 | Supabase SQL Editor | Paste **`scripts/seed-admins-manual.sql`** → Run |
| 4 | Terminal | `npm run setup:print-sql` — prints full SQL bundle for copy-paste |
| 5 | Vercel | Add env vars (see [Vercel env](#vercel-environment-variables)) |

### Admin emails (create in Auth UI)

| Email | Role after seed SQL |
|-------|---------------------|
| `s.lahaie07@gmail.com` | `super_admin` |
| `sadmin1@comptaflow.com` | `sub_admin` |
| `sadmin2@comptaflow.com` | `sub_admin` |

Passwords: choose strong values locally — **never commit**.

Portal homes after login: see `docs/TEST_ACCOUNTS.md`.

---

## A. Service role alternatives

### A1. Combined SQL (no CLI)

Single file: **`scripts/combined-migrations.sql`**

Includes:

- RLS hardening (`guard_profile_privileged_fields`, profile update policy)
- `handle_new_user` — always `client`, OAuth names, **auto-assign sole sub_admin**
- Partner directory RLS — anon can `SELECT` profiles where `role = 'sub_admin'`

### A2. Manual admin seed SQL

**`scripts/seed-admins-manual.sql`** — promotes profiles for Auth users you created in the dashboard. No service role.

### A3. Print all SQL

**PowerShell :**

```powershell
npm run setup:print-sql
```

**Bash :** `npm run setup:print-sql`

Outputs combined migrations + manual seed + checklist to stdout.

### A4. Vercel ↔ Supabase integration

Vercel can link a Supabase project and **auto-inject** these variables into Production/Preview:

- `SUPABASE_URL` / project URL
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`

**How:** Vercel Dashboard → Project → **Storage** → **Connect Supabase** (or Integrations → Supabase).

After linking:

1. Redeploy preview/production
2. Confirm `SUPABASE_SERVICE_ROLE_KEY` appears under Settings → Environment Variables (server-only, not `VITE_*`)
3. Use HTTP bootstrap (A5) instead of local `npm run seed:admins`

Note: Integration does not run SQL migrations — you still paste `combined-migrations.sql` in Supabase SQL Editor.

### A5. One-time HTTP bootstrap (Vercel + service role)

Once `SUPABASE_SERVICE_ROLE_KEY` and `ADMIN_SECRET` are on Vercel:

**PowerShell :**

```powershell
$body = @{ password = "YOUR_STRONG_PASSWORD" } | ConvertTo-Json
Invoke-RestMethod -Uri "https://compta-flow.net/api/bootstrap-admins" `
  -Method POST `
  -Headers @{ "X-ComptaFlow-Internal" = "YOUR_ADMIN_SECRET" } `
  -ContentType "application/json" `
  -Body $body
```

**Bash :**

```bash
curl -X POST https://compta-flow.net/api/bootstrap-admins \
  -H "X-ComptaFlow-Internal: YOUR_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"password":"YOUR_STRONG_PASSWORD"}'
```

Or Bearer: `Authorization: Bearer YOUR_ADMIN_SECRET`

Creates/updates the three admin Auth users and profiles (same as `npm run seed:admins`). **No anon key, no migration token** — protected by `ADMIN_SECRET` only.

Legacy `/api/setup-admin` remains but requires the same secret; prefer `/api/bootstrap-admins`.

---

## B. Client email signup (no seed script)

After **Step 1 only** (`combined-migrations.sql`):

1. Partner picker loads sub_admins via anon RLS policy
2. If **zero** sub_admins → registration form shows contact support (form disabled)
3. If **exactly one** sub_admin → `handle_new_user` auto-assigns (signup works without picker selection)
4. If **multiple** sub_admins → user must pick one

Basic client signup does **not** require `npm run seed:admins` — only at least one `sub_admin` profile (manual SQL or bootstrap).

---

## C. Windows

```powershell
npm run setup:windows
```

Runs `scripts/setup-windows.ps1`: checks Node, copies `.env.local`, prints dashboard steps.

Cross-platform scripts use `tsx` (no bash required).

---

## D. n8n / webhooks / Resend (no local service role)

### Resend manual test

With `RESEND_API_KEY` on Vercel only:

**PowerShell :**

```powershell
$body = @{
  email = "you@example.com"
  displayName = "Test"
  province = "QC"
  language = "fr"
} | ConvertTo-Json
Invoke-RestMethod -Uri "https://compta-flow.net/api/webhook/onboarding-complete" `
  -Method POST -ContentType "application/json" -Body $body
```

**Bash :**

```bash
curl -X POST https://compta-flow.net/api/webhook/onboarding-complete \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","displayName":"Test","province":"QC","language":"fr"}'
```

Response includes `emailSent: true/false`. Profile metadata update requires `SUPABASE_SERVICE_ROLE_KEY` on the server.

### n8n onboarding

Import workflow → POST `/api/webhook/onboarding-complete`. Server-side email + optional profile patch once service role is on Vercel. No local service role needed for webhook **testing** (email only).

---

## E. Internal API (`/api/internal/*`)

| Symptom | Cause | Fix |
|---------|-------|-----|
| `401 Unauthorized` | Missing/wrong `ADMIN_SECRET` | Set in Vercel Preview + Production; header `X-ComptaFlow-Internal` or `Authorization: Bearer` |
| `404 Not found` | Old deploy | Redeploy; endpoints now return **401** when auth fails (clearer than 404) |
| Empty agents list | OK | `GET /api/internal/agents?all=1` with valid secret |

Example:

**PowerShell :**

```powershell
Invoke-RestMethod -Uri "https://compta-flow.net/api/internal/agents?all=1" `
  -Headers @{ "X-ComptaFlow-Internal" = "YOUR_ADMIN_SECRET" }
```

**Bash :**

```bash
curl https://compta-flow.net/api/internal/agents?all=1 \
  -H "X-ComptaFlow-Internal: YOUR_ADMIN_SECRET"
```

---

## F. Vercel environment variables

| Variable | Scope | Required for |
|----------|-------|----------------|
| `VITE_SUPABASE_URL` | Build + client | App auth |
| `VITE_SUPABASE_ANON_KEY` | Build + client | App auth |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Bootstrap, webhooks metadata, admin APIs |
| `ADMIN_SECRET` | Server | Internal API, bootstrap |
| `CRON_SECRET` | Server | Vercel crons |
| `RESEND_API_KEY` | Server | Transactional email |
| `GOOGLE_GEMINI_API_KEY` | Server | Support chat (mock if absent) |

Preview: copy Production vars or use Supabase integration on preview deployments.

---

## Security notes

- Never commit `.secrets.local.txt`, `.env.local`, or passwords
- `setup_admin.ts` at repo root is **deprecated** — use dashboard SQL or `/api/bootstrap-admins`
- Rotate `ADMIN_SECRET` if it was ever exposed
