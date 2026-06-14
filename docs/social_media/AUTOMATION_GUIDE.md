# 🤖 GUIDE D'ACTIVATION : AUTOMATISATION SOCIALE COMPTAFLOW

Ce guide explique comment activer la publication automatique sur vos réseaux sociaux.

---

### 1. Préparation de la Base de Données
J'ai déjà ajouté la table `social_content` à votre fichier `database.sql`.
1. Copiez le contenu de `database.sql` (section 6).
2. Exécutez-le dans votre éditeur SQL Supabase.
3. Configurez un **Webhook Supabase** (Database -> Webhooks) :
   - **Table** : `social_content`
   - **Events** : `INSERT`
   - **Method** : `POST`
   - **URL** : L'URL que vous donnera n8n (voir étape suivante).

---

### 2. Configuration n8n
J'ai créé le fichier `n8n-social-automation.json`.
1. Ouvrez n8n.
2. Créez un nouveau workflow.
3. Cliquez sur les trois points (menu) -> **Import from File** et choisissez `n8n-social-automation.json`.
4. **Configuration des Crédentiels** :
   - **OpenAI** : Pour la génération de texte par IA.
   - **LinkedIn / Instagram / X** : Connectez vos comptes officiels ComptaFlow.
   - **Supabase** : Pour mettre à jour le statut du post une fois publié.
5. Copiez l'URL du noeud **Webhook Supabase** et collez-la dans la configuration Webhook de Supabase (étape 1).

---

### 3. Comment Publier ?
Il vous suffit d'insérer une ligne dans la table `social_content` :
```sql
INSERT INTO social_content (title, raw_content, target_platforms)
VALUES (
  'Nouveau Dashboard ComptaFlow', 
  'Découvrez notre nouvelle interface en glassmorphism pour une gestion comptable élégante.', 
  ARRAY['linkedin', 'instagram']
);
```
**Le reste est automatique :**
- n8n reçoit l'info.
- L'IA génère les légendes parfaites pour chaque réseau.
- Les posts sont publiés.
- Le statut passe à `published` dans votre base de données.

---
*Guide généré par l'Architecte Suprême Gemini CLI - 12 Juin 2026*
