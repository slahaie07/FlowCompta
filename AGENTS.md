# ComptaFlow — Infrastructure multi-agents (INTERNE)

> **Confidentiel** — Ne pas documenter côté client, UI publique ou marketing. Les utilisateurs voient uniquement « l'assistant ComptaFlow ».

Architecture modulaire : routeur + spécialistes, intégrée à l'API support, au CLI et aux skills Cursor.

## Vue d'ensemble

```
                    ┌─────────────┐
  CLI / cron / admin│   Router    │
                    │   (Gemini)  │
                    └──────┬──────┘
                           │ intent
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
    tax, payroll     billing, bookkeeping    portal, …
         … internes: document-vision, reconciliation, devops
```

## Agents routés (support client — invisible pour l'utilisateur)

| Agent | ID | Rôle |
|-------|-----|------|
| Fiscal Canada | `tax` | TPS, TVH, TVQ, TVP, déclarations |
| Paie | `payroll` | T4, Relevé 1, déductions |
| Facturation | `billing` | Factures, Interac, Stripe |
| Tenue de livres | `bookkeeping` | Transactions, rapprochement |
| Support | `technical` | Portail, coffre-fort, bugs |
| Commercial | `sales` | Mandats, forfaits |
| Conformité | `compliance` | PIPEDA, Loi 25 |
| Portails | `portal` | Navigation `/portal/*` |
| Onboarding | `onboarding` | Inscription, services, province |
| Messagerie | `messaging` | CPA-client, tickets |
| Concierge | `general` | Accueil |

## Agents internes (cron, CLI, admin — jamais exposés aux clients)

| Agent | ID | Rôle |
|-------|-----|------|
| Routeur | `router` | Classification intent |
| Vision | `document-vision` | OCR documents |
| Rapprochement | `reconciliation` | Interac ↔ factures |
| Cabinet | `firm-ops` | Portail sub_admin |
| Réseau | `network-ops` | Super-admin |
| Audit sécurité | `security-audit` | RLS, auth |
| i18n | `i18n-content` | Traductions FR/EN/AR |
| DevOps | `devops` | Deploy, migrations |
| KYC | `kyc-review` | Revue profils |
| Elite Hunter | `marketing-hunter` | Prospection B2B (cron) |

## API (interne)

- `POST /api/support/ai-chat` — réponse publique `{ answer }` uniquement (pas d'agentId/intent)
- `GET /api/internal/agents` — super_admin Bearer **ou** header `X-ComptaFlow-Internal: <ADMIN_SECRET>`
  - `?all=1` inclut les agents internes

## CLI

```bash
npm run agents:list
npm run agents:list -- --all
npm run agents:ask -- "Comment déclarer ma TVH?"
npm run agents:ask -- --agent payroll "Préparer T4"
```

## Variables d'environnement

- `GOOGLE_GEMINI_API_KEY` — appels live Gemini

## Skills Cursor (développement)

Voir `.cursor/skills/flowcompta-*`

## Tests

```bash
npm test -- src/agents
```

## Extension

1. Agent dans `src/agents/registry.ts` (`visibility: 'routed' | 'internal'`)
2. Mapper dans `INTENT_TO_AGENT` si nouvel intent routé
3. Mettre à jour le schéma routeur (`gemini-client.ts`)
4. Skill `.cursor/skills/flowcompta-<name>/SKILL.md`
5. Ne jamais exposer métadonnées agent côté client
