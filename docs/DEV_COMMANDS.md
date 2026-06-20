# ComptaFlow — commandes npm (Windows / macOS / Linux)

Tous les scripts npm utilisent `tsx` ou `node` directement — **aucun Git Bash requis** sur Windows.

## Ouvrir ComptaFlow (Windows)

**Ne double-cliquez pas** sur `Comptaflow_HUB.html` ou d'autres fichiers `.html` du dépôt : si Windows a associé `.html` à Git Bash, un terminal s'ouvre au lieu du navigateur.

### Méthode recommandée

1. PowerShell : `npm run dev`
2. Ouvrez manuellement **http://localhost:3000** dans Edge ou Chrome
3. Production : **https://compta-flow.net** (coller l'URL dans le navigateur)

### Réinitialiser « Ouvrir avec » (Windows)

Si un fichier `.html` ou `.sh` ouvre encore Git Bash :

1. **Paramètres** → **Applications** → **Applications par défaut** → **Choisir les types de fichiers par défaut**
2. **`.html`** / **`.htm`** → Microsoft Edge ou Google Chrome (pas Git Bash)
3. **`.sh`** → laisser vide ou « Choisir une application » ; ne pas l'utiliser pour ouvrir des pages web

Alternative : clic droit sur un lien → **Copier l'adresse du lien** → coller dans la barre d'adresse du navigateur.

### Terminal : PowerShell, pas Git Bash

Pour `npm run dev`, `npm run seed:admins`, etc., utilisez **PowerShell** ou **Invite de commandes**. Git Bash peut perturber les chemins Windows et les variables d'environnement.

## PowerShell (Windows) — recommandé

```powershell
cd C:\Users\user\CODE_WORKSPACE\Projects\flowcompta

# Dev local
npm run dev
# puis ouvrir http://localhost:3000 dans le navigateur

# Tests, lint, build
npm run lint
npm test
npm run build

# CI complet (identique à Vercel avant chaque déploiement prod)
npm run ci

# Tout vérifier d'un coup (code + prod + réseau Canada)
npm run setup:all

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

## Scripts shell bash (CI / infra Canada uniquement)

Les scripts `scripts/provision-canada-network.sh` et `scripts/verify-canada-network.sh` sont **optionnels** et réservés à **GitHub Actions / Linux**. Sur Windows, **ne double-cliquez pas** les fichiers `.sh` (Windows les ouvre dans Git Bash).

**Alternative Windows :**

```powershell
npm run verify:network
```

Les scripts `seed:admins` / `promotion:check` utilisent `tsx` — aucun bash requis.

## Prérequis seed admins

| Variable | Obligatoire (live) |
|----------|-------------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Oui |
| `SUPABASE_URL` ou `VITE_SUPABASE_URL` | Oui |
| `SEED_ADMIN_PASSWORD` ou `--password=` | Oui |

Voir `docs/TEST_ACCOUNTS.md` pour les comptes cibles.
