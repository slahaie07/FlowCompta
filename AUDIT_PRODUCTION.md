# Audit de Production - Comptaflow

Ce document résume l'architecture de production mise en place en fonction de votre cahier des charges.

## 1. Hiérarchie et Réseau Confidentiel (Supabase / PostgreSQL)

Le schéma SQL complet et les règles de sécurité RLS ont été générés dans le fichier `database.sql` à la racine du projet. 
Il définit une hiérarchie stricte avec 4 tables principales :
- `profiles` : Authentification et rôles (client ou admin).
- `companies` : Informations de l'entreprise (NEQ, NAS, Coordonnées).
- `invoices` : Facturations et lien avec Stripe.
- `documents` : Système de coffre-fort sécurisé.

**Sécurité (RLS)** : Les politiques garantissent qu'un utilisateur ne peut `SELECT`, `INSERT`, `UPDATE` ou `DELETE` que les données liées à son propre identifiant (`auth.uid()`), tandis que le rôle `admin` possède un accès global pour superviser tous les dossiers.

## 2. Tunnel de Service et Informations Obligatoires

Les validations ont été implémentées tant côté client (React) que côté serveur (Express) pour sécuriser l'entonnoir de conversion.

**Format des données exigées :**
- **Nom de l'entreprise** : Chaîne de caractères standard.
- **NEQ** (Numéro d'Entreprise du Québec) : Obligatoire. Regex `^\d{10}$` (exactement 10 chiffres).
- **NAS** (Numéro d'Assurance Sociale) : Optionnel/Conditionnel. Regex `^\d{9}$` (9 chiffres sans espaces).
- **Courriel** : Obligatoire. Regex standard `^[^\s@]+@[^\s@]+\.[^\s@]+$`.

**L'intégration Stripe** se trouve dans le fichier `server.ts` :
L'API `/api/payment` reçoit les données strictement validées, génère une session de paiement Stripe incluant l'email du client et les métadonnées (NEQ, NAS fourni, Nom de l'entreprise). Le traitement du paiement conditionne la création du dossier permanent de l'utilisateur.

## 3. Automatisation et Acheminement (n8n & Email)

Le flux n8n a été exporté sous format standard dans le fichier `n8n-workflow.json`.

**Séquence du Workflow :**
1. Déclencheur Webhook : Intercepte les évènements de `server.ts` ou directement depuis Stripe (`checkout.session.completed`).
2. Nœud Conditionnel : Vérifie la validité du paiement.
3. Nœud d'Envoi Courriel : Utilise un service SMTP pour envoyer un courriel de confirmation récapitulatif (Résumé de la nouvelle situation) dynamique basé sur le payload JSON du Webhook, adressé au client avec une copie conforme invisible (CCI/CC) automatique envoyée à `s.lahaie07@gmail.com`.

## 4. Ce Qu'il Manque Pour Être 100% "PRÊT" (Checklist)

Pour que la plateforme Comptaflow passe en production réelle, vous devez finaliser la configuration des éléments externes qui échappent à ce code source :

### Variables d'environnement requises (`.env`)
1. **STRIPE_SECRET_KEY** : Votre clé secrète de production Stripe (ex: `sk_live_...`).
2. **STRIPE_PUBLIC_KEY** : Votre clé publique (ex: `pk_live_...`).
3. **STRIPE_WEBHOOK_SECRET** : (Optionnel, mais recommandé dans `server.ts` pour valider la signature cryptographique de Stripe).

### Configuration Base de Données (Supabase)
1. Exécutez le contenu intégral de `database.sql` dans l'éditeur SQL de votre projet Supabase.
2. Liez les URL du portail front-end (`APP_URL`) dans les paramètres d'authentification Supabase (URL de redirection post-login).

### Configuration de l'Automatisation (n8n)
1. Importer le fichier `n8n-workflow.json` dans votre instance n8n.
2. Paramétrer les credentials (Identifiants) de votre serveur d'envoi de courriels (SMTP) dans le nœud "Send Email Summary".
3. Copier l'URL de test/production du premier nœud Webhook et l'inscrire dans le portail développeur Stripe comme endpoint de Webhook.

### Actions Requises de votre côté :
- [ ] Créer/Obtenir vos clés Stripe (Dashboard Stripe).
- [ ] Créer le projet Supabase et y injecter `database.sql`.
- [ ] Déployer l'instance n8n et configurer l'accès SMTP.
- [ ] Mettre à jour `.env` avec les valeurs réelles sur l'environnement de déploiement final.
