-- =============================================================================
-- ComptaFlow — combined migrations (one paste in Supabase SQL Editor)
-- =============================================================================
-- Prerequisite: base schema from comptaflow_migration.sql already applied.
-- Order: RLS recursion fix → hardening → partner directory RLS.
-- Safe to re-run (CREATE OR REPLACE / DROP IF EXISTS).
-- =============================================================================

-- ─── 0. Fix RLS recursion (42P17) — REQUIRED for partner picker ──────────────

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
SET row_security = off
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_sub_admin_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
SET row_security = off
AS $$
  SELECT sub_admin_id FROM public.profiles WHERE id = auth.uid();
$$;

-- ─── 1. RLS hardening + signup trigger ───────────────────────────────────────

CREATE OR REPLACE FUNCTION public.guard_profile_privileged_fields()
RETURNS TRIGGER AS $$
BEGIN
  IF public.get_user_role() IS DISTINCT FROM 'super_admin' THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'profile.role is immutable for non super_admin users';
    END IF;
    IF NEW.sub_admin_id IS DISTINCT FROM OLD.sub_admin_id THEN
      RAISE EXCEPTION 'profile.sub_admin_id is immutable for non super_admin users';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS guard_profile_privileged_fields ON public.profiles;
CREATE TRIGGER guard_profile_privileged_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_privileged_fields();

-- Signups are always clients; auto-assign sole sub_admin when partner not chosen
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_sub_admin_id UUID;
    v_full_name TEXT;
    v_sub_admin_count INT;
BEGIN
    v_full_name := COALESCE(
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'display_name',
        new.raw_user_meta_data->>'name'
    );

    IF new.raw_user_meta_data->>'sub_admin_id' IS NOT NULL
       AND new.raw_user_meta_data->>'sub_admin_id' <> '' THEN
        v_sub_admin_id := (new.raw_user_meta_data->>'sub_admin_id')::UUID;
    ELSE
        SELECT COUNT(*) INTO v_sub_admin_count
        FROM public.profiles
        WHERE role = 'sub_admin';

        IF v_sub_admin_count = 1 THEN
            SELECT id INTO v_sub_admin_id
            FROM public.profiles
            WHERE role = 'sub_admin'
            LIMIT 1;
        ELSE
            v_sub_admin_id := NULL;
        END IF;
    END IF;

    INSERT INTO public.profiles (id, role, sub_admin_id, full_name, display_name, email, created_at)
    VALUES (
        new.id,
        'client',
        v_sub_admin_id,
        v_full_name,
        v_full_name,
        new.email,
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP POLICY IF EXISTS "Modif propre profil" ON public.profiles;
CREATE POLICY "Modif propre profil" ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND role = public.get_user_role()
  AND sub_admin_id IS NOT DISTINCT FROM public.get_sub_admin_id()
);

-- ─── 2. Partner directory (anon signup partner picker) ───────────────────────

DROP POLICY IF EXISTS "Public liste comptables partenaires" ON public.profiles;

CREATE POLICY "Public liste comptables partenaires" ON public.profiles
FOR SELECT TO anon, authenticated
USING (role = 'sub_admin');

-- ─── Verify ──────────────────────────────────────────────────────────────────
-- SELECT policyname, roles, cmd FROM pg_policies WHERE tablename = 'profiles';
-- SELECT proname FROM pg_proc WHERE proname IN ('handle_new_user', 'guard_profile_privileged_fields');
