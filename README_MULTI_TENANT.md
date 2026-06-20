# 🏛️ Guide Multi-Locataire ComptaFlow

Ce guide explique comment appliquer la structure multi-locataire à 3 rôles (`super_admin`, `sub_admin`, `client`) avec isolation totale des données.

---

## 1. Ordre des Migrations (SQL Supabase)

1. Ouvrez l'éditeur SQL de votre tableau de bord Supabase (projet `unvyxfxlzhnutpugjxhe`).
2. Copiez l'intégralité du contenu de `comptaflow_migration.sql` situé à la racine du projet.
3. Exécutez le script dans l'éditeur SQL Supabase.
   - Ce script va drop les anciennes tables, créer la nouvelle table `profiles` (avec support rôles et Interac), créer les tables métier (`clients`, `documents`, `messages`, `invoices`), configurer les triggers de calcul automatique de taxes Québec et de synchronisation d'inscription, puis activer la sécurité Row Level Security (RLS) sur toutes les tables.

---

## 2. Comment créer le premier `super_admin`

Une fois que vous avez créé votre compte via l'interface d'inscription (ou directement via Supabase Auth), vous pouvez promouvoir votre compte au rôle de `super_admin` en exécutant cette requête SQL dans l'éditeur Supabase :

```sql
UPDATE public.profiles
SET role = 'super_admin'
WHERE email = 'votre-courriel@domaine.com';
```

---

## 3. Comment configurer l'Interac d'un `sub_admin`

Chaque `sub_admin` (comptable partenaire) reçoit les fonds de ses propres clients sur son identifiant Interac.
1. Connectez-vous avec un compte ayant le rôle `sub_admin`.
2. Allez dans l'onglet **Configuration Interac** de votre panneau latéral.
3. Saisissez votre adresse courriel Interac.
4. Cochez l'option "Dépôt Automatique" (Auto-dépôt) si vos virements s'encaissent sans question. Si désactivé, saisissez la question de sécurité requise pour vos clients.
5. Cliquez sur **Sauvegarder les Paramètres**.

---

## 4. Comment rattacher un client (metadata `sub_admin_id`)

Le rattachement d'un client à son comptable partenaire se fait au moment de l'inscription via les métadonnées de l'utilisateur :
- Lors du `signUp` de l'utilisateur client, le front transmet dans les options :
  ```javascript
  supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: "Nom du Client",
        role: "client",
        sub_admin_id: "ID-UUID-DU-SUB-ADMIN"
      }
    }
  });
  ```
- Le trigger de base de données `on_auth_user_created` intercepte automatiquement ces valeurs et enregistre la ligne dans la table `profiles` publique avec le lien `sub_admin_id` adéquat.

---

## 5. Comment TESTER l'isolation entre 2 sub_admins (CPA)

Pour s'assurer que le sub_admin B ne peut **JAMAIS** lire ou interagir avec les données du sub_admin A, suivez ce protocole :

1. **Création des comptes** :
   - Inscrivez `comptableA@flow.com` et `comptableB@flow.com` en sélectionnant le rôle **Comptable Partenaire**.
   - Inscrivez `clientA@flow.com` en sélectionnant le rôle **Client final** et rattachez-le à `comptableA` via le sélecteur.
   - Inscrivez `clientB@flow.com` en sélectionnant le rôle **Client final** et rattachez-le à `comptableB` via le sélecteur.

2. **Génération de données (Test Invoices/Clients)** :
   - Connectez-vous en tant que `comptableA`. Créez un client dans votre panel, puis générez une facture pour `clientA`.
   - Déconnectez-vous.

3. **Vérification d'isolation stricte** :
   - Connectez-vous en tant que `comptableB`.
   - Accédez à l'onglet **Mes Clients** et **Factures Clients** : vous devez constater que la liste est vide et que vous ne voyez ni `clientA` ni sa facture.
   - Si vous tentez de faire une requête directe de récupération via le client Supabase JS en injectant l'ID de la facture du `clientA`, la base de données Supabase renverra un tableau vide `[]` ou une erreur d'accès grâce aux règles strictes de sécurité RLS (`sub_admin_id = auth.uid()`).
