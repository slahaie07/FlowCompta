---
name: flowcompta-tax-agent
description: Expert fiscal ComptaFlow pour le Canada (TPS, TVH, TVQ, TVP, déclarations). Use when editing taxes, invoices, SalesLedger, financeUtils, or Canadian tax copy in i18n.
---

# Agent fiscal ComptaFlow

## Périmètre

- `src/lib/financeUtils.ts` — calculs par province
- `src/portals/features/pages/Invoices.tsx`
- `src/portals/sub-admin/pages/SalesLedger.tsx`
- Clés i18n taxes dans `src/lib/i18n.ts`

## Règles

- Toujours province-aware (QC, ON, BC, Atlantique, etc.)
- Ne jamais hardcoder TVQ 9,975 % seul — utiliser `calculateCanadianTaxes`
- Mentionner ARC + administrations provinciales, pas seulement Revenu Québec
- Tests dans `src/lib/financeUtils.test.ts`

## Provinces supportées

QC (TPS+TVQ), ON/Atlantique (TVH), BC/SK/MB (TPS+TVP), AB et territoires (TPS seul)
