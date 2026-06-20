# Paiement par virement Interac — mode manuel (sans n8n)

ComptaFlow fonctionne **entièrement sans n8n**, sans IMAP et sans automatisation externe.  
Le flux manuel dans le portail est le mode **officiel et recommandé**.

---

## Ce dont vous avez besoin

| Rôle | Prérequis |
|------|-----------|
| **Comptable (sub_admin)** | Courriel Interac configuré dans le portail |
| **Client** | Accès au portail + facture reçue |
| **Optionnel** | `RESEND_API_KEY` sur Vercel (courriel auto à la publication) |

Aucun compte n8n, aucun serveur mail à connecter.

---

## Étape 1 — Configurer votre Interac (comptable)

1. Connexion : https://compta-flow.net/login  
2. Portail **admin** → **Paramètres Interac** (`/portal/admin/interac_settings`)  
3. Renseigner :
   - **Adresse de virement** (courriel Interac du cabinet)
   - **Dépôt automatique** : oui/non
   - **Question de sécurité** (si pas de dépôt auto)

---

## Étape 2 — Émettre une facture

1. **Factures** → **Nouvelle facture**  
2. Choisir le client, montant, publier (**Envoyée**)  
3. Le client reçoit les instructions Interac (PDF + courriel si Resend est actif)

---

## Étape 3 — Le client paie

Le client effectue le virement depuis sa banque vers le courriel Interac du comptable.  
**Important :** indiquer le numéro de facture (`FAC-2026-XXXX`) dans le message du virement.

---

## Étape 4 — Le client déclare le paiement

1. Client → **Factures** → ouvrir la facture  
2. Cliquer **« J'ai effectué le virement »**  
3. Le comptable voit une alerte **« X virement(s) à valider »** sur la page Factures

---

## Étape 5 — Le comptable confirme

1. Comptable → **Factures** → facture concernée  
2. Vérifier le dépôt dans la banque  
3. **Confirmer réception du paiement Interac** + saisir la référence bancaire (ex. `CA12345678`)  
4. La facture passe à **Payée** ; le client peut recevoir un courriel de confirmation

---

## Résumé du flux

```
Facture publiée → Client vire (Interac) → Client déclare
       → Comptable vérifie banque → Confirme avec référence → Payée ✅
```

Temps habituel côté comptable : **1 à 2 minutes par facture**.

---

## n8n (optionnel — pas requis)

Si un jour vous disposez d'une instance n8n + boîte IMAP, vous pouvez importer `n8n-interac-reconciliation.json` pour automatiser l'étape 5.  
**Sans n8n, rien ne manque** — la production est complète en mode manuel.

Voir aussi : `docs/AUTOMATED_RECONCILIATION.md` (section automatisation avancée).
