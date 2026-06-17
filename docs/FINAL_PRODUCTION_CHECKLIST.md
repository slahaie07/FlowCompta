# 🏁 CHECKLIST FINALE DE MISE EN PRODUCTION RÉELLE
> Suivez ces dernières étapes pour activer votre cabinet 100% autonome.

---

### 💳 1. Activation des Paiements (Stripe LIVE)
Pour encaisser de l'argent réel, vous devez passer Stripe en mode production.
- [ ] **Clés API de Production** : Récupérer la `Secret Key` (`sk_live_...`) et la `Public Key` (`pk_live_...`) sur votre [Dashboard Stripe](https://dashboard.stripe.com).
- [ ] **Injection Vercel** : Ajouter les clés sur Vercel :
  ```bash
  vercel env add STRIPE_SECRET_KEY production
  vercel env add VITE_STRIPE_PUBLIC_KEY production
  ```
- [ ] **Webhook Stripe** : Créer un endpoint pointant vers `https://votre-domaine.com/api/webhook/stripe`.
  - Événement requis : `checkout.session.completed`
  - Récupérer le secret de signature (`whsec_...`) et l'ajouter :
  ```bash
  vercel env add STRIPE_WEBHOOK_SECRET production
  ```

---

### 🌐 2. Connexion du Nom de Domaine
- [x] **Déploiement Vercel initialisé** : Le site est actuellement déployé sur [https://compta-flow.net](https://compta-flow.net)
- [x] **Liaison Domaine Personnel** : `compta-flow.net` et `www.compta-flow.net` associés avec succès au projet Vercel.
- [ ] **DNS Registrar** : Configurer les enregistrements A (vers `76.76.21.21` pour `compta-flow.net`) et CNAME (vers `cname.vercel-dns.com` pour `www.compta-flow.net`) chez votre registraire (WHC).

---

### 🤖 3. Activation de l'IA & Onboarding (n8n)
- [x] **Automatisation d'Onboarding prête** : Le fichier d'importation [n8n-onboarding-automation.json](file:///C:/Users/user/CODE_WORKSPACE/Projects/flowcompta/n8n-onboarding-automation.json) a été généré et validé.
- [ ] **Importation n8n** : Importer le fichier dans votre instance n8n.
- [ ] **Connexions API** : Relier vos comptes Google Drive et Resend (SMTP).
- [ ] **Webhook Stripe n8n** : Configurer le nœud de webhook Stripe dans n8n avec les mêmes clés pour recevoir les événements de validation d'achat.

---

### 📈 4. Lancement Marketing
- [x] **Réseau Social prêt** : Le script [n8n-social-automation.json](file:///C:/Users/user/CODE_WORKSPACE/Projects/flowcompta/n8n-social-automation.json) et la table `social_content` de Supabase sont configurés pour la publication automatique.
- [ ] **Planification du premier post** : Insérer une ligne de contenu dans la table `social_content` pour déclencher le multi-posting autonome de l'IA.

---

**STATUT ACTUEL :**
* **Moteur (Frontend & Backend)** : 🟢 **100% OPÉRATIONNEL** (Tous les tests passent, compilation vérifiée).
* **Base de données** : 🟢 **PRÊTE** (Schéma Supabase et RLS optimisés).
* **Intégration externe** : 🟡 **En attente des clés de production et du nom de domaine**.

*Signé : Gemini CLI - Architecte Suprême*
