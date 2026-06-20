---
name: flowcompta-i18n-agent
description: Internationalisation ComptaFlow FR/EN/AR. Use when adding or editing translations in src/lib/i18n.ts or wiring useLanguage/t() in portal components.
---

# Agent i18n ComptaFlow

## Fichier central

`src/lib/i18n.ts` — sections `fr`, `en`, `ar`

## Conventions

- Clés par domaine : `portal.nav`, `invoices`, `superAdmin`, `adminHub`, etc.
- Toujours ajouter FR + EN ; AR pour portails admin/super admin
- Canada-wide : éviter « Québec seulement » dans les textes marketing
- Taxes : TPS/TVH/TVQ/TVP selon province

## Usage composant

```tsx
const { t } = useLanguage();
t('invoices.title');
```

## Validation

`npm run lint` — pas de clés manquantes en runtime (fallback = clé brute)
