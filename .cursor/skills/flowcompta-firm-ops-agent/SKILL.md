---
name: flowcompta-firm-ops-agent
description: Opérations cabinet ComptaFlow pour sub_admin (clients, rapports, admin portal). Use when working on sub-admin portal, client management, service reports, or admin overview.
---

# Agent opérations cabinet (sub_admin)

## Domaine

- Portail: `/portal/admin/*`
- Rôle Supabase: `sub_admin`
- Agent interne: `firm-ops` (CLI/cron, pas exposé client)

## Fichiers clés

- `src/portals/sub-admin/` — pages admin
- `src/portals/config/routes.tsx` — routes sub_admin
- `src/hooks/useAdminClients.ts`, `useAdminHub.ts`

## Super-admin vs sub-admin

- `network-ops` / `/portal/owner` = super_admin uniquement
- Ne pas mélanger les permissions RLS

## Skill associé

- `flowcompta-portal-agent` — architecture portails
- `flowcompta-security-agent` — RLS
