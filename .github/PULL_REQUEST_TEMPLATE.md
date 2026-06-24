# 🏛️ Pull Request - Compta-Flow

## 📝 Description & Contexte
<!-- Résumez ici l'objectif de cette PR et le problème qu'elle résout. Expliquez la solution technique choisie. -->

## 🔍 Type de Modification
- [ ] 🚀 **Feature** (Nouvelle fonctionnalité)
- [ ] 🐛 **Fix** (Correction de bug)
- [ ] ⚡ **Refactoring** (Optimisation, nettoyage ou structuration du code)
- [ ] 🛠️ **DevOps & CI** (Modifications de scripts, de configurations Docker/Vercel ou de workflows GitHub)
- [ ] 📝 **Documentation** (Modifications ou ajouts dans le dossier docs ou les README)

## 🎯 Portails & Modules Impactés
- [ ] 👑 **Samuel (Super Admin)** : Tableau de bord principal, supervision des dossiers clients.
- [ ] 💼 **Viviane (Sub-Admin / CPA)** : Espace comptabilité courante, assignation de mandats.
- [ ] 🌍 **Eya (Sub-Admin / CPA)** : Interface multilingue, support RTL, gestion des taxes régionales.
- [ ] 👤 **Espace Client** : Tunnel de tarification, téléchargement de documents, signature des mandats.
- [ ] ⚙️ **API / Base de données** : Supabase, schémas SQL, middleware Express, intégration des webhooks n8n.

## 🎨 Conformité UX & Design System (Charte Gold & Black)
- [ ] Le code applique rigoureusement la charte graphique exclusive **Or & Noir** (Gold & Black).
- [ ] Le layout est entièrement adaptatif et responsive (Mobile / Tablette / Desktop).
- [ ] L'accessibilité (contraste des boutons, navigation clavier) a été vérifiée.
- [ ] Le support RTL et multilingue a été préservé ou enrichi si nécessaire.

## 🔒 Sécurité & Intégrité des Données
- [ ] Les politiques RLS (Row Level Security) de Supabase ont été testées pour ce périmètre.
- [ ] Aucun secret ou clé API privée n'a été introduit dans le code source (utilisation exclusive des variables d'environnement).
- [ ] Validation et sanitization rigoureuses de toutes les données d'entrées utilisateur.

## 🧪 Suite de Tests & Validation Technique
- [ ] La suite complète de tests passe avec succès (`npm test`).
- [ ] De nouveaux tests unitaires/intégration ont été écrits pour couvrir les nouveaux cas.
- [ ] Le script de vérification du réseau canadien a été validé (`npm run verify:canada-module`).
- [ ] Le build de production final compile sans erreur (`npm run build`).

## 🖼️ Captures d'Écran / Rendu Visuel
<!-- Si vos modifications impliquent des changements graphiques, merci d'inclure un visuel comparatif Avant/Après ou un GIF de démonstration. -->
| Avant | Après |
| :--- | :--- |
| *Insérer image* | *Insérer image* |
