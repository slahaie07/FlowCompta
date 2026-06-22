-- Partner directory was only needed for anonymous signup partner picker (removed).
-- Sub-admin assignment: handle_new_user() auto-assigns when exactly one sub_admin exists;
-- otherwise super_admin assigns via console.

DROP POLICY IF EXISTS "Public liste comptables partenaires" ON public.profiles;
