-- Fix infinite recursion on profiles RLS (42P17)
-- Cause: get_user_role() / get_sub_admin_id() query profiles while RLS is evaluating profiles policies.
-- Run in Supabase SQL Editor or: npm run db:migrate

-- 1. Helper functions bypass RLS (SECURITY DEFINER + row_security off)
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

-- 2. Partner directory for anonymous signup (idempotent)
DROP POLICY IF EXISTS "Public liste comptables partenaires" ON public.profiles;

CREATE POLICY "Public liste comptables partenaires" ON public.profiles
FOR SELECT TO anon, authenticated
USING (role = 'sub_admin');

-- 3. RLS hardening: guard privileged profile fields (from 20260619_rls_hardening.sql)
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

-- 4. Signups always create client profiles; names from OAuth metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_sub_admin_id UUID;
    v_full_name TEXT;
BEGIN
    v_full_name := COALESCE(
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'display_name',
        new.raw_user_meta_data->>'name'
    );

    IF new.raw_user_meta_data->>'sub_admin_id' IS NOT NULL AND new.raw_user_meta_data->>'sub_admin_id' <> '' THEN
        v_sub_admin_id := (new.raw_user_meta_data->>'sub_admin_id')::UUID;
    ELSE
        v_sub_admin_id := NULL;
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

-- 5. Self-update policy without recursive subqueries on profiles
DROP POLICY IF EXISTS "Modif propre profil" ON public.profiles;
CREATE POLICY "Modif propre profil" ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND role = public.get_user_role()
  AND sub_admin_id IS NOT DISTINCT FROM public.get_sub_admin_id()
);
