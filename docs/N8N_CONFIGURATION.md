# Configuration n8n — ADMIN_SECRET + IMAP + SMTP

Guide pratique pour activer la réconciliation Interac automatique (optionnel).

---

## 1. Récupérer `ADMIN_SECRET` sur Vercel

1. Ouvrez [vercel.com](https://vercel.com) → projet **ComptaFlow**
2. **Settings → Environment Variables**
3. Copiez la valeur de **`ADMIN_SECRET`** (Production)
4. Si elle n'existe pas : créez un secret fort (32+ caractères aléatoires) et redéployez

> Ne partagez jamais cette valeur. C'est le jeton que n8n envoie à `POST /api/invoices/reconcile`.

---

## 2. Fichier `.env.n8n`

```bash
cp .env.n8n.example .env.n8n
```

Éditez `.env.n8n` :

```env
COMPTAFLOW_ADMIN_SECRET=<collez ADMIN_SECRET Vercel ici>
COMPTAFLOW_API_URL=https://compta-flow.net
COMPTAFLOW_ALERT_EMAIL=comptaflow.officiel@gmail.com
```

Redémarrez n8n :

```bash
docker compose restart n8n
```

---

## 3. Credential IMAP (courriels Interac)

Dans n8n → **Credentials → Add credential → IMAP**

### Boîte dédiée recommandée

Créez une adresse utilisée uniquement pour les notifications de virement (ex. `interac@votredomaine.com` ou un alias Gmail).

### Gmail / Google Workspace

| Champ | Valeur |
|-------|--------|
| Host | `imap.gmail.com` |
| Port | `993` |
| SSL/TLS | Activé |
| User | votre adresse Gmail complète |
| Password | **Mot de passe d'application** (pas le mot de passe Gmail) |

Étapes Google : Compte Google → Sécurité → Validation en 2 étapes → Mots de passe des applications.

### Outlook / Microsoft 365

| Champ | Valeur |
|-------|--------|
| Host | `outlook.office365.com` |
| Port | `993` |
| SSL/TLS | Activé |
| User | adresse Microsoft |
| Password | mot de passe ou mot de passe d'application |

### Autre fournisseur (WHC, OVH, etc.)

Demandez à votre hébergeur les paramètres **IMAP SSL** (souvent port 993).

### Dans le workflow

1. Ouvrez **ComptaFlow — Réconciliation Interac e-Transfer**
2. Nœud **Courriel Interac (IMAP)** → sélectionnez votre credential IMAP
3. Boîte : `INBOX`
4. Optionnel : filtre côté banque sur `notify@payments.interac.ca` ou l'expéditeur de votre institution

---

## 4. Credential SMTP (Resend — alertes)

Dans n8n → **Credentials → SMTP**

| Champ | Valeur |
|-------|--------|
| Host | `smtp.resend.com` |
| Port | `465` ou `587` |
| User | `resend` |
| Password | votre `RESEND_API_KEY` (même clé que sur Vercel) |
| SSL | Activé |

Liez ce credential aux nœuds **Notifier succès** et **Alerter courriel ignoré**.

---

## 5. Tester l'API sans IMAP

Vérifiez que le secret fonctionne :

```bash
curl -s -X POST https://compta-flow.net/api/invoices/reconcile \
  -H "Authorization: Bearer VOTRE_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"invoiceNumber":"FAC-2026-0001","amount":100,"interacRef":"CATEST123456"}'
```

Réponses attendues :

| Code | Signification |
|------|----------------|
| `404` | Secret OK, facture introuvable (normal en test) |
| `401` | Secret incorrect |
| `200` | Facture trouvée et marquée payée |

---

## 6. Activer le workflow

1. Vérifiez que IMAP + SMTP sont configurés
2. Dans n8n, ouvrez le workflow Interac
3. Basculez **Inactive → Active** (en haut à droite)
4. Envoyez un courriel test ou attendez un vrai avis Interac

---

## 7. Onboarding (workflow optionnel)

Le workflow **Onboarding Automatisé** expose un webhook :

```
POST http://localhost:5678/webhook/comptaflow-onboarding
```

Corps JSON : `{ "userId", "email", "displayName", "province", "language" }`

Pour la production, exposez n8n via tunnel (ngrok, Cloudflare Tunnel) ou utilisez n8n Cloud.

---

## Dépannage

| Symptôme | Cause probable |
|----------|----------------|
| `401 Non autorisé` | `COMPTAFLOW_ADMIN_SECRET` ≠ `ADMIN_SECRET` Vercel |
| IMAP timeout | Pare-feu, mauvais host/port, 2FA sans mot de passe app |
| Facture non trouvée | Numéro doit matcher `FAC-AAAA-NNNN` dans le courriel |
| Workflow ne se déclenche pas | Workflow inactif, ou IMAP en polling (attendre l'intervalle) |

---

## Sécurité

- n8n local : ne pas exposer le port 5678 sur Internet sans authentification
- Rotation : si `ADMIN_SECRET` fuit, changez-le sur Vercel **et** dans `.env.n8n`
- Le flux **manuel** dans le portail reste disponible sans n8n (`docs/PAIEMENT_INTERAC.md`)
