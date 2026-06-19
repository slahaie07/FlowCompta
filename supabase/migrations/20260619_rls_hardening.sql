-- RLS hardening: prevent privilege escalation on profiles
-- Run in Supabase SQL Editor after comptaflow_migration.sql

-- 1. Block self-service role / sub_admin_id changes (except super_admin)
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

-- 2. Signups are always clients; privileged roles are provisioned server-side
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_sub_admin_id UUID;
    v_full_name TEXT;
BEGIN
    v_full_name := COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'display_name');

    IF new.raw_user_meta_data->>'sub_admin_id' IS NOT NULL AND new.raw_user_meta_data->>'sub_admin_id' <> '' THEN
        v_sub_admin_id := (new.raw_user_meta_data->>'sub_admin_id')::UUID;
    ELSE
        v_sub_admin_id := NULL;
    END IF;

    INSERT INTO public.profiles (id, role, sub_admin_id, full_name, email, created_at)
    VALUES (
        new.id,
        'client',
        v_sub_admin_id,
        v_full_name,
        new.email,
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Tighten self-update policy: users cannot escalate via UPDATE policy alone
DROP POLICY IF EXISTS "Modif propre profil" ON public.profiles;
CREATE POLICY "Modif propre profil" ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
  AND sub_admin_id IS NOT DISTINCT FROM (SELECT p.sub_admin_id FROM public.profiles p WHERE p.id = auth.uid())
);
