# 🤖 Réconciliation Automatique des Virements Interac via n8n

Ce document décrit comment connecter et configurer un workflow **n8n** pour analyser automatiquement les courriels de confirmation de dépôt Interac et valider instantanément les factures des clients dans la plateforme ComptaFlow.

---

## 📋 1. Principe de Fonctionnement

1. **Virement du Client** : Le client effectue un virement Interac pour payer sa facture et insère le **numéro de facture** (ex: `FAC-2026-0001`) comme référence/message du transfert.
2. **Notification par Courriel** : Le cabinet reçoit un courriel de sa banque ou d'Interac notifiant que le dépôt a été complété (contenant le montant, le message/référence du virement, et le numéro de référence unique de transaction Interac).
3. **Déclencheur n8n** : n8n détecte le nouveau courriel via un nœud IMAP ou Gmail.
4. **Extraction des Données** : Un nœud de code JavaScript extrait :
   - Le numéro de facture.
   - Le montant reçu.
   - Le code de référence Interac.
5. **Appel API Sécurisé** : n8n effectue une requête POST à l'API ComptaFlow pour marquer la facture correspondante comme payée.

---

## 🔒 2. L'Endpoint de Réconciliation API

L'endpoint exposé par ComptaFlow est :
* **Route** : `POST /api/invoices/reconcile`
* **En-têtes** :
  * `Authorization: Bearer <ADMIN_SECRET>` (Jeton d'autorisation sécurisé défini dans vos variables d'environnement)
  * `Content-Type: application/json`
* **Corps (JSON)** :
  ```json
  {
    "invoiceNumber": "FAC-2026-0001",
    "amount": 286.29,
    "interacRef": "CA1A2B3C"
  }
  ```

---

## ⚙️ 3. Import rapide dans n8n

1. Dans n8n : **Workflows → Import from File**
2. Sélectionnez **`n8n-interac-reconciliation.json`** à la racine du dépôt FlowCompta
3. Configurez les credentials :
   - **IMAP** : boîte qui reçoit les notifications Interac de votre banque
   - **SMTP / Resend** : alertes succès / échec
4. Variables d'environnement n8n :
   - `COMPTAFLOW_ADMIN_SECRET` = valeur de `ADMIN_SECRET` sur Vercel
   - `COMPTAFLOW_ALERT_EMAIL` = courriel du comptable (optionnel)
5. Activez le workflow

### Structure du workflow importé

### Étape 1 : Déclencheur Courriel (Gmail ou IMAP)
* **Nœud** : *Gmail Trigger* (On Message Received) ou *IMAP Email*
* **Filtres** :
  * Expéditeur : `notify@payments.interac.ca` ou le courriel de votre banque.
  * Sujet : `a déposé votre virement` ou `virement Interac reçu`.

### Étape 2 : Extraction JavaScript (Code Node)
Ajoutez un nœud **Code** avec le script suivant pour extraire les paramètres de la facture :

```javascript
// Extraction par expressions régulières à partir du corps du courriel
const body = items[0].json.text || items[0].json.html || "";

// 1. Extraire le numéro de facture (ex: FAC-2026-0001)
const invoiceMatch = body.match(/FAC-\d{4}-\d{4}/);
const invoiceNumber = invoiceMatch ? invoiceMatch[0] : null;

// 2. Extraire le montant (ex: 286.29)
const amountMatch = body.match(/(\d+[\.,]\d{2})\s?\$/);
const amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '.')) : null;

// 3. Extraire le numéro de référence Interac (ex: CA1A2B3C)
const refMatch = body.match(/\b(CA[A-Z0-9]{6})\b/i);
const interacRef = refMatch ? refMatch[1].toUpperCase() : "INTERAC_AUTO";

return [{
  json: {
    invoiceNumber,
    amount,
    interacRef,
    rawBody: body
  }
}];
```

### Étape 3 : Filtre de Validation (IF Node)
* **Conditions** : Vérifier que `invoiceNumber` et `amount` ne sont pas vides, pour éviter de traiter des courriels sans rapport.

### Étape 4 : Requête HTTP (HTTP Request Node)
* **Méthode** : `POST`
* **URL** : `https://compta-flow.net/api/invoices/reconcile`
* **Authentication** : None (Gérée manuellement via Header)
* **Headers** :
  * Name: `Authorization`, Value: `Bearer {{ YOUR_ADMIN_SECRET }}`
  * Name: `Content-Type`, Value: `application/json`
* **Body Parameters** (JSON) :
  * `invoiceNumber` : `{{ $json.invoiceNumber }}`
  * `amount` : `{{ $json.amount }}`
  * `interacRef` : `{{ $json.interacRef }}`

---

## ✅ 4. Actions Post-Réconciliation Automatique
Dès que la facture est réconciliée :
1. Son statut passe à **« payée »** sur le portail client et sur le cockpit comptable.
2. La date de paiement et le numéro de référence Interac sont enregistrés en base de données.
3. Un **courriel automatique de reçu officiel** est immédiatement envoyé au client par la plateforme.
4. Une trace d'action `AUTO_RECONCILE` est inscrite dans les registres d'audit de sécurité.
