-- Fix 500 on anon partner picker: legacy "Admin view profiles" subquery caused infinite recursion (42P17).

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

DROP POLICY IF EXISTS "Admin view profiles" ON public.profiles;
DROP POLICY IF EXISTS "p1" ON public.profiles;

DROP POLICY IF EXISTS "Super admin view all profiles" ON public.profiles;
CREATE POLICY "Super admin view all profiles" ON public.profiles
FOR SELECT TO authenticated
USING (public.get_user_role() = 'super_admin');

DROP POLICY IF EXISTS "Public liste comptables partenaires" ON public.profiles;
CREATE POLICY "Public liste comptables partenaires" ON public.profiles
FOR SELECT TO anon, authenticated
USING (role = 'sub_admin');
