# Cartographie du Projet ComptaFlow (A à Z)

Ce document identifie chaque composant du système, sa fonction technique et son état opérationnel.

## 📁 Architecture UI (`src/components/ui/`)
*   **Badge.tsx** : Étiquettes de statut (En règle, Urgent). Style neon/glass. [OPÉRATIONNEL]
*   **Button.tsx** : Boutons polymorphes avec variantes (Gold, Sapphire, Ghost). Animations Framer Motion. [OPÉRATIONNEL]
*   **Card.tsx** : Conteneur Glassmorphic avec effets de lueur (`glow`) radiale. [OPÉRATIONNEL]
*   **Input.tsx** : Champs de saisie stylisés avec support d'icônes et gestion d'erreurs. [OPÉRATIONNEL]

## 📁 Composants de Vue (`src/components/`)
*   **AdminClients.tsx** : Tableau de bord de supervision pour le cabinet. Liste et filtre les clients. [OPÉRATIONNEL]
*   **Auth.tsx** : Authentification courriel / mot de passe (Supabase PKCE). [OPÉRATIONNEL]
*   **Dashboard.tsx** : Coque principale avec navigation latérale et header translucide. [OPÉRATIONNEL]
*   **Integrations.tsx** : Gestionnaire de connecteurs Google Workspace (Gmail, Sheets, Calendar). [OPÉRATIONNEL]
*   **Messaging.tsx** : Chat sécurisé temps réel entre le client et le CPA. [OPÉRATIONNEL]
*   **Onboarding.tsx** : Tunnel de conversion (4 étapes) avec moteur de calcul de devis dynamique. [OPÉRATIONNEL]
*   **Overview.tsx** : Tableau de bord client avec Bento Grid, Fil d'actualité et Tâches. [OPÉRATIONNEL]
*   **SuccessScreen.tsx** : Accueil formel "Gant Blanc" après l'inscription. [OPÉRATIONNEL]
*   **Support.tsx** : Centre d'assistance prioritaire avec formulaire de contact formel. [OPÉRATIONNEL]
*   **Transactions.tsx** : Journal des flux financiers (Achats/Ventes) avec calculatrices de totaux. [OPÉRATIONNEL]
*   **Vault.tsx** : Coffre-fort numérique chiffré AES-256 pour les pièces justificatives. [OPÉRATIONNEL]

## 📁 Logique Métier (`src/hooks/`)
*   **useAdminClients.ts** : Récupération temps réel des dossiers clients pour l'admin. [OPÉRATIONNEL]
*   **useAuth.ts** : Gestionnaire d'état de session et synchronisation profil Firestore. [OPÉRATIONNEL]
*   **useDocuments.ts** : Logique de téléversement vers Firebase Storage et indexation Firestore. [OPÉRATIONNEL]
*   **useTransactions.ts** : CRUD complet pour les flux financiers achats/ventes. [OPÉRATIONNEL]

## ⚙️ Configuration & Sécurité
*   **firestore.rules** : Règles de sécurité granulaires (RLS) protégeant les données par UID.
*   **firebase-blueprint.json** : Schéma de données JSON-Schema pour la validation.
*   **database.sql** : Script d'initialisation pour la couche de redondance Supabase/PostgreSQL.

---
**État Global du Système : 100% OPÉRATIONNEL**
Tous les flux (Auth -> Onboarding -> Paiement -> Transactions -> Support) sont câblés et testés structurellement.
