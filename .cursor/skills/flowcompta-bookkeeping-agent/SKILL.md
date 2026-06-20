---
name: flowcompta-bookkeeping-agent
description: Tenue de livres ComptaFlow (transactions, catégorisation, grand livre). Use when working on transactions, sales ledger, reconciliation, or bookkeeping flows.
---

# Agent tenue de livres ComptaFlow

## Domaine

- Client: transactions (`/portal/client/transactions`)
- Sub-admin: grand livre (`SalesLedger.tsx`), rapports de service
- Agent runtime: `bookkeeping` — intent `BOOKKEEPING`

## Fichiers clés

- `src/portals/features/pages/Transactions.tsx`
- `src/portals/sub-admin/pages/SalesLedger.tsx`
- `src/hooks/useTransactions.ts`, `useSalesLedger.ts`
- `src/test/reconciliation.test.ts`

## Validation

`npm test` après changements rapprochement ou catégorisation.
