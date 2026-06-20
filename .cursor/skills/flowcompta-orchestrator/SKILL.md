---
name: flowcompta-orchestrator
description: Coordonne le travail multi-agents ComptaFlow (INTERNE). Use when a task spans tax, portal, security, i18n, billing, or API; when delegating to specialists; or when the user mentions agents or orchestrator for this project.
---

# Orchestrateur ComptaFlow (interne)

> Les clients ne doivent jamais voir la multi-agenture. API support = `{ answer }` seulement.

## Quand utiliser

- Tâche touchant plusieurs domaines (ex. factures + i18n + RLS)
- Besoin de découper en sous-tâches par spécialiste
- Référence à `src/agents/`, `AGENTS.md`, ou CLI `npm run agents:ask`

## Spécialistes (support — routés)

| Domaine | Skill / Agent ID |
|---------|------------------|
| Fiscalité Canada | `flowcompta-tax-agent` / `tax` |
| Paie T4/Relevé 1 | `flowcompta-payroll-agent` / `payroll` |
| Facturation | `flowcompta-billing-agent` / `billing` |
| Tenue de livres | `flowcompta-bookkeeping-agent` / `bookkeeping` |
| Portails React | `flowcompta-portal-agent` / `portal` |
| Cabinet sub_admin | `flowcompta-firm-ops-agent` / `firm-ops` |
| Sécurité RLS | `flowcompta-security-agent` / `security-audit` |
| i18n FR/EN/AR | `flowcompta-i18n-agent` / `i18n-content` |
| DevOps | `flowcompta-devops-agent` / `devops` |

## Agents internes (CLI `--agent`, cron)

`document-vision`, `reconciliation`, `marketing-hunter`, `kyc-review`, `network-ops`

## Workflow

1. Identifier le domaine principal → agent lead
2. Lister les domaines secondaires
3. Exécuter le lead en premier, puis les dépendances
4. Valider avec `npm run lint` et `npm test`
5. Ne jamais exposer agentId/intent côté client

## Fichiers clés

- `src/agents/orchestrator.ts` — runtime production
- `src/agents/registry.ts` — prompts et mapping intent
- `AGENTS.md` — documentation interne
