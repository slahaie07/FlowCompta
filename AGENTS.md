# ComptaFlow — Infrastructure multi-agents (INTERNE)

> **Confidentiel** — Ne pas documenter côté client, UI publique ou marketing. Les utilisateurs voient uniquement « l'assistant ComptaFlow » (personas humaines).

Architecture modulaire : routeur → spécialiste → revue CPA (si applicable), intégrée à l'API support, au CLI et aux skills Cursor.

## Vue d'ensemble

```
                    ┌─────────────┐
  CLI / cron / admin│   Router    │
                    │   (Gemini)  │
                    └──────┬──────┘
                           │ intent
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
    tax, payroll     billing, bookkeeping    portal, procedure-guide, …
         │                 │                 │
         └──────────── CPA superviseur ──────┘  (TAX, PAYROLL, BOOKKEEPING)
         … internes: document-vision, reconciliation, devops
```

### Pipeline orchestrateur (`src/agents/orchestrator.ts`)

1. **Routeur** — classifie l'intention (`gemini-client.ts` → schéma JSON)
2. **Spécialiste** — réponse avec persona humaine (`personas.ts`) + contexte procédural si `metadata.serviceId`
3. **Super-agent CPA** — validation interne pour `TAX`, `PAYROLL`, `BOOKKEEPING` (`cpa-review.ts`) — jamais exposé au client

## Agents routés (support client — invisible pour l'utilisateur)

| Agent | ID | Intent | Rôle |
|-------|-----|--------|------|
| Fiscal Canada | `tax` | TAX | TPS, TVH, TVQ, TVP, déclarations |
| Paie | `payroll` | PAYROLL | T4, Relevé 1, déductions |
| Facturation | `billing` | BILLING | Factures, Interac, Stripe |
| Tenue de livres | `bookkeeping` | BOOKKEEPING | Transactions, rapprochement |
| Support | `technical` | TECHNICAL | Portail, coffre-fort, bugs |
| Commercial | `sales` | SALES | Mandats, forfaits |
| Conformité | `compliance` | COMPLIANCE | PIPEDA, Loi 25 |
| Portails | `portal` | PORTAL | Navigation `/portal/*` |
| Onboarding | `onboarding` | ONBOARDING | Inscription, services, province |
| Messagerie | `messaging` | MESSAGING | CPA-client, tickets |
| **Guide parcours** | **`procedure-guide`** | **PROCEDURE** | **Étapes dossier, documents, `/portal/client/procedure`** |
| Concierge | `general` | GENERAL | Accueil |

## Agents internes (cron, CLI, admin — jamais exposés aux clients)

| Agent | ID | Rôle |
|-------|-----|------|
| Routeur | `router` | Classification intent |
| **Super-agent CPA** | **`cpa-supervisor`** | **Revue CPA post-spécialiste (TAX/paie/tenue de livres)** |
| Vision | `document-vision` | OCR documents |
| Rapprochement | `reconciliation` | Interac ↔ factures |
| Cabinet | `firm-ops` | Portail sub_admin |
| Réseau | `network-ops` | Super-admin |
| Audit sécurité | `security-audit` | RLS, auth |
| i18n | `i18n-content` | Traductions FR/EN/AR |
| DevOps | `devops` | Deploy, migrations |
| KYC | `kyc-review` | Revue profils |
| Elite Hunter | `marketing-hunter` | Prospection B2B (cron) |
| **Stratège croissance** | **`growth-strategist`** | **Briefs de contenu & plans de canaux du GVE (cron/CLI)** |

### Super-agent CPA (`cpa-supervisor`)

- **Fichier** : `src/agents/cpa-review.ts` + définition dans `registry.ts`
- **Déclenché** : automatiquement après tax, payroll, bookkeeping (`CPA_SUPERVISED_INTENTS`)
- **Rôle** : corriger taux provinciaux, incohérences T4/Relevé 1, catégories comptables ; ne jamais inventer de montants
- **Sortie** : texte final client uniquement — ton humain conservé, aucune mention d'IA ou de « super-agent »
- **Tests** : `skipCpaReview: true` dans les mocks unitaires (`orchestrator.test.ts`)

### Guide parcours (`procedure-guide`)

- **Intent** : `PROCEDURE` — routeur détecte questions sur documents requis, étapes mandat, progression dossier
- **Persona** : Camille Bergeron — « Accompagnement dossier »
- **Contexte** : si `context.metadata.serviceId` est défini, `procedure-context.ts` injecte le résumé depuis `serviceProcedures.ts`

## Parcours procéduraux (10 services)

Source unique : `src/lib/serviceProcedures.ts` — consommée par l'UI client et l'agent `procedure-guide`.

| Service ID | Code | Description |
|------------|------|-------------|
| `hourlyBookkeeping` | HR-01 | Tenue horaire |
| `monthlyMicro` | MN-01 | Forfait micro mensuel |
| `monthlySmall` | MN-02 | Forfait PME petite |
| `monthlySme` | MN-03 | Forfait PME |
| `gstQst` | TX-01 | TPS/TVH/TVQ |
| `payroll` | PY-01 | Paie |
| `t4Releve1` | PY-02 | T4 / Relevé 1 |
| `catchUp` | HR-02 | Rattrapage comptable |
| `softwareSetup` | HR-03 | Configuration logiciel |
| `taxHelpAutonomous` | TX-02 | Aide fiscale autonome |

Chaque parcours inclut : mandat signé → documents coffre-fort → revue CPA → livraison. Étapes typiques : `mandate`, `documents`, `cpa_review`, `delivery`.

### UI client

- **Route** : `/portal/client/procedure` (`src/portals/config/routes.tsx`)
- **Page** : `ServiceProcedure.tsx` — progression localStorage via `useServiceProcedureProgress`
- **Sélection service** : `ServiceSelector.tsx` — enregistre `metadata.selectedServiceId` sur le profil Supabase

### Contexte agent support

Passer dans `POST /api/support/ai-chat` :

```json
{
  "message": "Quels documents pour ma paie?",
  "context": {
    "language": "fr",
    "province": "QC",
    "metadata": { "serviceId": "payroll" }
  }
}
```

## API (interne)

- `POST /api/support/ai-chat` — réponse publique `{ answer, advisor, typingDelayMs, respondedAt }` uniquement (pas d'agentId/intent)
- `GET /api/internal/agents` — super_admin Bearer **ou** header `X-ComptaFlow-Internal: <ADMIN_SECRET>`
  - `?all=1` inclut les agents internes (dont `cpa-supervisor`)

## CLI

**PowerShell (Windows) :**

```powershell
npm run agents:list
npm run agents:list -- --all
npm run agents:ask -- "Comment déclarer ma TVH?"
npm run agents:ask -- --agent payroll "Préparer T4"
npm run agents:ask -- --agent procedure-guide "Documents pour T4?"
npm run promotion:check
npm run seed:admins:dry-run
npm run seed:admins -- --password=SECRET
```

**Bash :**

```bash
npm run agents:list
npm run agents:list -- --all
npm run agents:ask -- "Comment déclarer ma TVH?"
npm run agents:ask -- --agent payroll "Préparer T4"
npm run agents:ask -- --agent procedure-guide "Documents pour T4?"
```

Voir `docs/DEV_COMMANDS.md` pour seed admins et promotion check.

## Variables d'environnement

- `GOOGLE_GEMINI_API_KEY` — appels live Gemini

## Skills Cursor (développement)

Voir `.cursor/skills/flowcompta-*`

## Tests

```bash
npm test -- src/agents
npm run lint
npm run build
```

## Extension

1. Agent dans `src/agents/registry.ts` (`visibility: 'routed' | 'internal'`)
2. Mapper dans `INTENT_TO_AGENT` si nouvel intent routé
3. Mettre à jour le schéma routeur (`gemini-client.ts` — inclure `PROCEDURE` si applicable)
4. Persona dans `personas.ts` si agent routé client
5. Skill `.cursor/skills/flowcompta-<name>/SKILL.md`
6. Parcours service : ajouter entrée dans `SERVICE_PROCEDURES` + clés i18n `procedure.*`
7. Ne jamais exposer métadonnées agent côté client
