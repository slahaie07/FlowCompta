# ComptaFlow — commandes npm (Windows / macOS / Linux)

Tous les scripts npm utilisent `tsx` ou `node` directement — **aucun Git Bash requis** sur Windows.

## PowerShell (Windows) — recommandé

```powershell
cd C:\Users\user\CODE_WORKSPACE\Projects\flowcompta

# Dev local
npm run dev

# Tests, lint, build
npm run lint
npm test
npm run build

# Vérification pré-promotion (lint + test + build)
npm run promotion:check

# Seed admins — dry run (aucune clé requise)
npm run seed:admins:dry-run

# Seed admins — live (mot de passe via variable d'environnement)
$env:SEED_ADMIN_PASSWORD = "admin1234"
npm run seed:admins

# Alternative : mot de passe en argument (toutes plateformes)
npm run seed:admins -- --password=admin1234

# Alternative : cross-env (npm script portable)
npx cross-env SEED_ADMIN_PASSWORD=admin1234 npm run seed:admins

# Agents CLI (interne)
npm run agents:list
npm run agents:list -- --all
npm run agents:ask -- "Comment déclarer ma TVH?"
npm run agents:ask -- --agent payroll "Préparer T4"
```

### Variables d'environnement temporaires (PowerShell)

```powershell
$env:SEED_ADMIN_PASSWORD = "votre-mot-de-passe"
$env:SUPABASE_SERVICE_ROLE_KEY = "eyJ..."   # depuis Supabase Dashboard → API
npm run seed:admins
```

Ou placez les secrets dans `.env.local` (chargé automatiquement par `dotenv` dans les scripts).

## Bash / zsh (macOS, Linux, Git Bash)

```bash
npm run seed:admins:dry-run
SEED_ADMIN_PASSWORD=admin1234 npm run seed:admins
npm run seed:admins -- --password=admin1234
npx cross-env SEED_ADMIN_PASSWORD=admin1234 npm run seed:admins
```

## Scripts shell bash (infra Canada uniquement)

Les scripts `scripts/provision-canada-network.sh` et `scripts/verify-canada-network.sh` sont **optionnels** (provisionnement infra réseau). Ils nécessitent bash — pas requis pour le dev quotidien ni pour `seed:admins` / `promotion:check`.

## Prérequis seed admins

| Variable | Obligatoire (live) |
|----------|-------------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Oui |
| `SUPABASE_URL` ou `VITE_SUPABASE_URL` | Oui |
| `SEED_ADMIN_PASSWORD` ou `--password=` | Oui |

Voir `docs/TEST_ACCOUNTS.md` pour les comptes cibles.
