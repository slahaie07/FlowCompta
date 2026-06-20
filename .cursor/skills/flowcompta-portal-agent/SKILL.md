---
name: flowcompta-portal-agent
description: Architecture portails ComptaFlow (client, admin, owner). Use when editing src/portals/, routes, navigation, lazy loading, or portal URLs /portal/client|admin|owner.
---

# Agent portails ComptaFlow

## Structure

```
src/portals/
  config/     navigation.ts, routes.tsx, paths.ts, lazy-pages.ts
  client/     pages client
  sub-admin/  pages comptable
  super-admin/ pages owner
  features/   transactions, invoices, vault, messaging
  shared/     PortalShell, PortalNav, RequireRole
```

## URLs

| Rôle | Base |
|------|------|
| client | `/portal/client/*` |
| sub_admin | `/portal/admin/*` |
| super_admin | `/portal/owner/*` |

Legacy `/dashboard/*` → redirect via `LegacyDashboardRedirect`.

## Checklist modification

1. Ajouter route dans `routes.tsx` + `lazy-pages.ts` + `navigation.ts`
2. Clés i18n `portal.nav.*` (FR/EN/AR)
3. Test `src/test/portal-paths.test.ts`
4. `npm run build` — vérifier code splitting
