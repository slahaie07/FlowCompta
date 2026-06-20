-- Allow anonymous signup flow to list partner bookkeepers (sub_admin) for client registration.
-- Exposes only partner profiles (role = sub_admin); required for /login?register=1 partner picker.

DROP POLICY IF EXISTS "Public liste comptables partenaires" ON public.profiles;

CREATE POLICY "Public liste comptables partenaires" ON public.profiles
FOR SELECT TO anon, authenticated
USING (role = 'sub_admin');
