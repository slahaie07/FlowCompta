# Comptaflow - Portail Comptable Intelligent

## Configuration & Setup
- **Environnement** : Copier `.env.example` vers `.env` et remplir les clés Supabase, Stripe et n8n.
- **Base de données** : Exécuter le script `database.sql` dans l'éditeur SQL de Supabase pour configurer les tables et les politiques RLS.

## Commandes
- `npm run dev` : Lance le serveur de développement (Vite + Express/tsx).
- `npm run build` : Génère le build de production pour le frontend et le backend.
- `npm run lint` : Vérification des types TypeScript.
- `npm test` : Lance la suite de tests unitaires et d'intégration (Vitest).

## Architecture & Conventions
- **Frontend** : React 19 + Vite.
- **Backend** : Express (API Payment & Webhooks).
- **Routage** : React Router v7 (Navigation réelle par URL).
- **Sécurité** : 
    - Supabase Auth pour l'authentification.
    - Politiques RLS (Row Level Security) pour l'isolation des données clients.
    - Accès Admin centralisé via le rôle 'admin'.
- **Communication** : Intégration réelle avec n8n via des webhooks configurables.

## État Opérationnel (100% Réel & Vérifié)
- Plus aucune simulation : les délais `setTimeout` et les alertes de démonstration ont été supprimés.
- Feedback UX : Tous les `alert()` ont été remplacés par des notifications professionnelles `sonner`.
- Résilience : `ErrorBoundary` globale implémentée pour prévenir les plantages.
- Routage complet : les "patterns" de navigation sont désormais basés sur des URLs réelles.
- Hiérarchie des données : les clients voient uniquement leurs données ; les admins voient tout.
- Validation : Build de production et tests automatisés validés.
