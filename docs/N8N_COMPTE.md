# Créer un compte n8n pour ComptaFlow

ComptaFlow **n'a pas besoin de n8n** pour les paiements Interac (voir `PAIEMENT_INTERAC.md`).  
n8n sert uniquement à **automatiser** la réconciliation par courriel bancaire, si vous le souhaitez.

---

## Option A — n8n local (Docker, recommandé)

### 1. Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installé et démarré

### 2. Configuration

```bash
cp .env.n8n.example .env.n8n
# Éditez .env.n8n si besoin (courriel, COMPTAFLOW_ADMIN_SECRET)
```

### 3. Démarrer n8n

```bash
npm run n8n:up
```

Attendez ~30 secondes, puis bootstrap complet (compte + workflows) :

```bash
npm run n8n:bootstrap
```

Ou étape par étape :

```bash
npm run n8n:setup    # crée le compte propriétaire
npm run n8n:import   # importe les workflows JSON
```

Le script affiche l'URL, le courriel et le mot de passe. Ils sont aussi sauvegardés dans `.n8n-credentials.local` (fichier ignoré par git).

### 4. Connexion

Ouvrez **http://localhost:5678** et connectez-vous avec les identifiants affichés.

### 5. Importer les workflows (optionnel)

Si vous avez utilisé `npm run n8n:bootstrap`, les workflows sont déjà importés (inactifs).

Sinon, dans n8n : **Workflows → Import from File** :

| Fichier | Usage |
|---------|--------|
| `n8n-interac-reconciliation.json` | Réconciliation automatique Interac (IMAP) |
| `n8n-onboarding-automation.json` | Webhook post-inscription |

### 6. Variables d'environnement

Sur l'édition communautaire self-hosted, définissez les variables dans **`.env.n8n`** (lue par Docker) — pas dans l'UI n8n :

- `COMPTAFLOW_ADMIN_SECRET` = même valeur que `ADMIN_SECRET` sur Vercel
- `COMPTAFLOW_API_URL` = `https://compta-flow.net`
- `COMPTAFLOW_ALERT_EMAIL` = courriel pour les alertes

Redémarrez n8n après modification : `docker compose restart n8n`

### 7. Credentials à configurer dans l'UI

| Workflow | Credential |
|----------|------------|
| Réconciliation Interac | IMAP (boîte banque) + SMTP (Resend) |
| Onboarding | Google Drive (optionnel) |

Puis **activer** chaque workflow dans l'éditeur n8n.

**Guide détaillé IMAP + ADMIN_SECRET :** `docs/N8N_CONFIGURATION.md`

Voir aussi `AUTOMATED_RECONCILIATION.md`.

### Arrêter n8n

```bash
npm run n8n:down
```

---

## Option B — n8n Cloud

Si vous préférez un hébergement géré :

1. Inscrivez-vous sur [https://app.n8n.cloud/register](https://app.n8n.cloud/register)
2. Créez votre espace de travail
3. Importez les fichiers JSON à la racine du dépôt
4. Ajoutez les variables d'environnement (`COMPTAFLOW_ADMIN_SECRET`, etc.)

**Note :** la création de compte cloud nécessite votre courriel — nous ne pouvons pas le faire à votre place.

---

## Dépannage

| Problème | Solution |
|----------|----------|
| `n8n inaccessible` | Vérifiez que Docker tourne : `docker compose ps` |
| `Instance owner already setup` | Compte déjà créé — connectez-vous ou réinitialisez le volume : `docker compose down -v` |
| Node.js trop ancien (sans Docker) | Utilisez Docker ; n8n 2.x exige Node ≥ 22.22 |
| IMAP / banque | Optionnel — le portail gère tout manuellement sans n8n |

---

## Sécurité

- Ne commitez jamais `.env.n8n` ni `.n8n-credentials.local`
- `COMPTAFLOW_ADMIN_SECRET` doit rester identique à `ADMIN_SECRET` en production
- n8n local n'est pas exposé sur Internet par défaut (localhost uniquement)
