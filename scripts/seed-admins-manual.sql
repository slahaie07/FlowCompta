-- =============================================================================
-- ComptaFlow — manual admin seed (no service role key required)
-- =============================================================================
-- STEP 1 — Supabase Dashboard → Authentication → Users → Add user (×3)
--   Create each account with email + password (Auto Confirm User: ON):
--     • s.lahaie07@gmail.com        (super_admin)
--     • sadmin1@comptaflow.com      (sub_admin)
--     • sadmin2@comptaflow.com      (sub_admin)
--
-- STEP 2 — Run scripts/combined-migrations.sql first (RLS + partner list).
--
-- STEP 3 — Paste this file in SQL Editor and Run.
-- =============================================================================

-- Confirm emails (skip if "Auto Confirm" was enabled in Auth UI)
UPDATE auth.users
SET
  email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
  confirmed_at = COALESCE(confirmed_at, NOW())
WHERE LOWER(email) IN (
  LOWER('s.lahaie07@gmail.com'),
  LOWER('sadmin1@comptaflow.com'),
  LOWER('sadmin2@comptaflow.com')
);

-- Super admin profile
INSERT INTO public.profiles (id, email, full_name, display_name, role, status, sub_admin_id)
SELECT
  u.id,
  u.email,
  'Samuel L. (Super Admin)',
  'Samuel L. (Super Admin)',
  'super_admin',
  'active',
  NULL
FROM auth.users u
WHERE LOWER(u.email) = LOWER('s.lahaie07@gmail.com')
ON CONFLICT (id) DO UPDATE SET
  role = 'super_admin',
  full_name = EXCLUDED.full_name,
  display_name = EXCLUDED.display_name,
  status = 'active',
  sub_admin_id = NULL;

-- Sub-admin cabinet 1
INSERT INTO public.profiles (id, email, full_name, display_name, role, status, sub_admin_id)
SELECT
  u.id,
  u.email,
  'Mini Admin 1',
  'Mini Admin 1',
  'sub_admin',
  'active',
  NULL
FROM auth.users u
WHERE LOWER(u.email) = LOWER('sadmin1@comptaflow.com')
ON CONFLICT (id) DO UPDATE SET
  role = 'sub_admin',
  full_name = EXCLUDED.full_name,
  display_name = EXCLUDED.display_name,
  status = 'active',
  sub_admin_id = NULL;

-- Sub-admin cabinet 2
INSERT INTO public.profiles (id, email, full_name, display_name, role, status, sub_admin_id)
SELECT
  u.id,
  u.email,
  'Mini Admin 2',
  'Mini Admin 2',
  'sub_admin',
  'active',
  NULL
FROM auth.users u
WHERE LOWER(u.email) = LOWER('sadmin2@comptaflow.com')
ON CONFLICT (id) DO UPDATE SET
  role = 'sub_admin',
  full_name = EXCLUDED.full_name,
  display_name = EXCLUDED.display_name,
  status = 'active',
  sub_admin_id = NULL;

-- Verify
SELECT id, email, role, status, sub_admin_id
FROM public.profiles
WHERE LOWER(email) IN (
  LOWER('s.lahaie07@gmail.com'),
  LOWER('sadmin1@comptaflow.com'),
  LOWER('sadmin2@comptaflow.com')
)
ORDER BY role DESC, email;
