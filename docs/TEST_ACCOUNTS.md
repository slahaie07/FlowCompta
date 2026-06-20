# ComptaFlow — comptes de test (interne)

> **Confidentiel** — courriels et rôles uniquement. Les mots de passe ne sont **jamais** versionnés dans git.

## Comptes admin de démonstration

| Courriel | Rôle | Portail après connexion |
|----------|------|-------------------------|
| `s.lahaie07@gmail.com` | `super_admin` | `/portal/owner/super_overview` |
| `sadmin1@comptaflow.com` | `sub_admin` | `/portal/admin/admin_overview` |
| `sadmin2@comptaflow.com` | `sub_admin` | `/portal/admin/admin_overview` |

### Slugs portail par rôle

| Rôle | Base URL | Vue d'accueil |
|------|----------|---------------|
| `super_admin` | `/portal/owner` | `super_overview` |
| `sub_admin` | `/portal/admin` | `admin_overview` |
| `client` | `/portal/client` | `overview` |

Les `sub_admin` n'ont pas de `sub_admin_id` sur leur propre profil — leur `profiles.id` sert d'identifiant cabinet pour rattacher les clients.

## Provisionnement

### Script recommandé (local ou prod Supabase)

**PowerShell (Windows) :**

```powershell
# .env.local : SUPABASE_SERVICE_ROLE_KEY + VITE_SUPABASE_URL
npm run seed:admins:dry-run

$env:SEED_ADMIN_PASSWORD = "***"
npm run seed:admins

# ou mot de passe en argument (toutes plateformes)
npm run seed:admins -- --password=***
```

**Bash (macOS / Linux) :**

```bash
SEED_ADMIN_PASSWORD='***' npm run seed:admins
```

**Sans service role localement :** voir **`docs/SETUP_WITHOUT_CLI.md`**

- `npm run setup:print-sql` — SQL copy-paste bundle
- `scripts/combined-migrations.sql` + `scripts/seed-admins-manual.sql` — dashboard only
- `POST /api/bootstrap-admins` — après déploiement Vercel (`ADMIN_SECRET` + service role) ; corps JSON `{"password":"..."}`

Les trois comptes ci-dessus correspondent à `SEED_ADMIN_ACCOUNTS` dans `src/lib/seedAdminAccounts.ts`.

Options :

- `--password=...` — surcharge `SEED_ADMIN_PASSWORD` (préféré sur Windows)
- `--dry-run` — affiche le plan sans écrire (`npm run seed:admins:dry-run`)

Voir `docs/DEV_COMMANDS.md` et `.env.example`.

### Prérequis Supabase

1. Migration `comptaflow_migration.sql` appliquée
2. Migration RLS `supabase/migrations/20260619_rls_hardening.sql` appliquée (inscriptions publiques = `client` uniquement ; rôles admin via service role)

### Vérification manuelle (SQL Editor)

```sql
SELECT id, email, role, sub_admin_id
FROM public.profiles
WHERE email IN (
  's.lahaie07@gmail.com',
  'sadmin1@comptaflow.com',
  'sadmin2@comptaflow.com'
);
```

## Sécurité

- Ne jamais committer de mots de passe dans le dépôt
- Changer les mots de passe avant promotion réelle
- `SUPABASE_SERVICE_ROLE_KEY` : local / CI uniquement, jamais côté client

## Auth applicative

- Connexion : Supabase Auth (`signInWithPassword`) via `/login`
- Rôle effectif : colonne `profiles.role` (pas les listes `CONFIG.APP.SUPER_ADMIN_EMAILS`)
- `local_db.json` : fallback API legacy ; **non utilisé** pour ces comptes Supabase
