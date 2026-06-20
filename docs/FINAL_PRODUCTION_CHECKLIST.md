# 🏁 CHECKLIST FINALE DE MISE EN PRODUCTION RÉELLE
> Suivez ces dernières étapes pour activer votre cabinet 100% autonome.

---

### 💸 1. Paiements — Interac e-Transfer uniquement

ComptaFlow n'accepte **que le virement Interac e-Transfer**. Aucune carte de crédit ni PayPal.

- [x] **Flux client** : instructions Interac sur chaque facture (courriel du `sub_admin` configuré dans le portail)
- [x] **Confirmation manuelle** : le comptable confirme la réception avec la référence bancaire
- [x] **Flux manuel dans le portail** — voir `docs/PAIEMENT_INTERAC.md` (aucun n8n requis)
- [ ] **Réconciliation automatique (optionnel)** : `n8n-interac-reconciliation.json` — seulement si vous avez n8n + IMAP
  - Cible : `POST https://compta-flow.net/api/invoices/reconcile`
  - Corps : `{ "invoiceNumber", "amount", "interacRef" }`
  - Auth : `Authorization: Bearer <ADMIN_SECRET>`

---

### 🌐 2. Connexion du Nom de Domaine
- [x] **Déploiement Vercel initialisé** : Le site est actuellement déployé sur [https://compta-flow.net](https://compta-flow.net)
- [x] **Liaison Domaine Personnel** : `compta-flow.net` et `www.compta-flow.net` associés avec succès au projet Vercel.
- [ ] **DNS Registrar** : Configurer les enregistrements A (vers `76.76.21.21` pour `compta-flow.net`) et CNAME (vers `cname.vercel-dns.com` pour `www.compta-flow.net`) chez votre registraire (WHC).

---

### 🤖 3. Activation de l'IA & Onboarding (n8n — optionnel)
- [x] **Automatisation d'Onboarding prête** : Le fichier d'importation `n8n-onboarding-automation.json` a été généré et validé.
- [x] **Scripts bootstrap** : `npm run n8n:up` puis `npm run n8n:bootstrap` — voir `docs/N8N_COMPTE.md`
- [ ] **Compte n8n local** : `npm run n8n:setup` (ou bootstrap complet)
- [ ] **Import workflows** : `npm run n8n:import` (inclus dans bootstrap)
- [ ] **COMPTAFLOW_ADMIN_SECRET** dans `.env.n8n` (= `ADMIN_SECRET` Vercel)
- [ ] **Connexions API** : IMAP banque + Resend SMTP dans l'UI n8n
- [ ] **Activer les workflows** après configuration des credentials

---

### 📈 4. Lancement Marketing
- [x] **Réseau Social prêt** : Le script `n8n-social-automation.json` et la table `social_content` de Supabase sont configurés pour la publication automatique.
- [ ] **Planification du premier post** : Insérer une ligne de contenu dans la table `social_content` pour déclencher le multi-posting autonome de l'IA.

---

**STATUT ACTUEL :**
* **Moteur (Frontend & Backend)** : 🟢 **100% OPÉRATIONNEL** (Tous les tests passent, compilation vérifiée).
* **Base de données** : 🟢 **PRÊTE** (Schéma Supabase et RLS optimisés).
* **Paiements** : 🟢 **Interac manuel opérationnel** — n8n optionnel uniquement.
* **Intégration externe** : 🟡 **n8n onboarding + marketing** à importer.
