# 🔄 MARKETING AUTOMATION & N8N ARCHITECTURE
> Propulsé par les skills `marketing-automation` et `n8n-workflow-architect`.

## 1. ARCHITECTURE DES FLUX (N8N HYBRID)
Conformément aux directives du `n8n-workflow-architect`, nous utilisons une approche Hybride : n8n pour l'orchestration, API Node.js pour le traitement lourd.

```text
[Webhook Stripe: Paiement Réussi] 
   │
   ├─► [n8n Node: Supabase] -> Met à jour le statut du profil en "active"
   │
   ├─► [n8n Node: Gmail/Resend] -> Envoie l'Email 1 de la Drip Campaign
   │
   └─► [n8n Node: Slack] -> Alerte l'équipe "Nouveau Client Elite"
```

## 2. DRIP CAMPAIGN: ONBOARDING CLIENT (7 JOURS)
Conçu avec les règles du `marketing-automation` (Lifecycle Stage Management).

### Trigger : `MANDAT_SIGNE_ET_PAYE`

*   **Jour 0 : Le Tapis Rouge (Immédiat)**
    *   *Sujet* : Bienvenue dans l'Élite Financière.
    *   *Contenu* : Lien magique pour se connecter au Vault. Instruction pour déposer la première facture.
*   **Jour 2 : L'Appel du CFO**
    *   *Sujet* : Vos prochaines étapes avec ComptaFlow.
    *   *Contenu* : Présentation du "Radar Fiscal Prédictif". Incitation à connecter son compte bancaire (Plaid).
*   **Jour 5 : Activation de l'IA**
    *   *Sujet* : Rencontrez votre nouvel assistant comptable.
    *   *Contenu* : Explication sur la façon de poser des questions à l'IA ("Combien de taxes dois-je ce mois-ci ?").
*   **Jour 7 : La Vérification (Scoring Update)**
    *   *Condition Logic* : Si le client n'a uploadé aucun document -> Envoi Email Relance. Si document uploadé -> Tag MQL mis à jour en "Active User".

## 3. LEAD SCORING MODEL (MQL -> SQL)
*   +10 pts : Ouverture d'email.
*   +30 pts : Clic sur la page "Pricing".
*   +50 pts : Dépôt d'un document dans le Vault.
*   -20 pts : Inactivité de plus de 14 jours.
*   **Seuil SQL (Prêt pour la vente de services CFO Premium)** : 100 pts.
