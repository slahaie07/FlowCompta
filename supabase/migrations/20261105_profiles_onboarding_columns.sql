-- =============================================================================
-- ComptaFlow — alignement du schéma profiles avec le code client (onboarding)
-- Préparé le 2026-11-04 au soir (diagnostic portail, étape 2). NON APPLIQUÉ par
-- l'agent : à exécuter par BOSS/Sam dans l'éditeur SQL Supabase du projet de
-- production, puis re-tester le parcours d'onboarding.
--
-- Contexte : le code client (App.tsx handleOnboardingComplete, ServiceSelector,
-- écrans admin) lit/écrit sur public.profiles les colonnes company_name, neq,
-- status, active_mode, initial_profile_type, preferred_language, needs et
-- metadata. Ces colonnes ne sont définies que dans database.sql, dont la
-- définition de profiles n'est pas celle de la production (son CHECK sur role
-- exclut super_admin/sub_admin) ; la chaîne de migrations réellement appliquée
-- (comptaflow_migration.sql + supabase/migrations/) ne les ajoute jamais.
-- PostgREST refuse atomiquement tout UPDATE dont le payload contient une
-- colonne absente du schéma : l'onboarding échouait donc en entier.
--
-- Idempotent (IF NOT EXISTS) : sans effet sur une base déjà alignée.
-- Aucun CHECK ajouté volontairement (les valeurs écrites par le code restent
-- libres) ; les DEFAULT reprennent ceux de database.sql.
-- =============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS neq TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS active_mode TEXT DEFAULT 'business',
  ADD COLUMN IF NOT EXISTS initial_profile_type TEXT,
  ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'fr',
  ADD COLUMN IF NOT EXISTS needs JSONB,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Recharger le cache de schéma PostgREST pour que les colonnes soient
-- visibles immédiatement par l'API REST.
NOTIFY pgrst, 'reload schema';

-- Vérification (attendu : 10 lignes) :
-- SELECT column_name FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'profiles'
--   AND column_name IN ('display_name','full_name','company_name','neq',
--     'status','active_mode','initial_profile_type','preferred_language',
--     'needs','metadata');
