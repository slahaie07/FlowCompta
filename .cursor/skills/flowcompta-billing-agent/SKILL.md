---
name: flowcompta-billing-agent
description: Facturation et paiements ComptaFlow (factures, Interac, Stripe, PDF). Use when working on invoices, payment flows, Interac reconciliation, or billing UI/API.
---

# Agent facturation ComptaFlow

## Domaine

- Portail client: `/portal/client/invoices`
- API: `/api/invoices/*`, rapprochement Interac via n8n
- Agent runtime: `billing` (support) + `reconciliation` (interne cron)

## Fichiers clés

- `src/portals/features/pages/Invoices.tsx`
- `src/hooks/useInvoices.ts`
- `api/index.ts` — endpoints factures et reconcile
- `src/agents/registry.ts` — `billing`, `reconciliation`

## Taxes sur factures

Utiliser `src/lib/financeUtils.ts` pour TPS/TVH/TVQ/TVP selon province client.

## Validation

`npm test` — inclure `financeUtils.test.ts` si taxes modifiées.
