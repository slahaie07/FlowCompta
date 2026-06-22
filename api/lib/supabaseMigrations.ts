import fs from 'fs';
import path from 'path';
import pg from 'pg';

import { SUPABASE_PROJECT_REF } from '../../src/lib/envResolve';

const { Client } = pg;
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || SUPABASE_PROJECT_REF;

const EMBEDDED_FIX_SQL = `
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

DROP POLICY IF EXISTS "Public liste comptables partenaires" ON public.profiles;
CREATE POLICY "Public liste comptables partenaires" ON public.profiles
FOR SELECT TO anon, authenticated
USING (role = 'sub_admin');

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

DROP POLICY IF EXISTS "Modif propre profil" ON public.profiles;
CREATE POLICY "Modif propre profil" ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND role = public.get_user_role()
  AND sub_admin_id IS NOT DISTINCT FROM public.get_sub_admin_id()
);
`;

export type MigrationResult = {
  success: boolean;
  message: string;
  host?: string;
  appliedFiles?: string[];
};

function passwordCandidates(): string[] {
  const candidates = [
    process.env.SUPABASE_DB_PASSWORD,
    process.env.DATABASE_PASSWORD,
    process.env.POSTGRES_PASSWORD,
  ].filter((v): v is string => !!v?.trim());

  return [...new Set(candidates)];
}

function loadMigrationSql(allFiles = false): string[] {
  const statements: string[] = [EMBEDDED_FIX_SQL];
  if (!allFiles) return statements;

  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
  if (!fs.existsSync(migrationsDir)) return statements;

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    if (file === '20260620_fix_profiles_rls_recursion.sql') continue;
    statements.push(fs.readFileSync(path.join(migrationsDir, file), 'utf8'));
  }

  return statements;
}

async function connectWithPassword(password: string): Promise<{ client: pg.Client; host: string } | null> {
  const configs = [
    { host: `aws-1-ca-central-1.pooler.supabase.com`, port: 6543, user: `postgres.${PROJECT_REF}` },
    { host: `aws-0-ca-central-1.pooler.supabase.com`, port: 6543, user: `postgres.${PROJECT_REF}` },
    { host: `aws-1-ca-central-1.pooler.supabase.com`, port: 5432, user: `postgres.${PROJECT_REF}` },
    { host: `db.${PROJECT_REF}.supabase.co`, port: 5432, user: 'postgres' },
  ];

  for (const conf of configs) {
    const client = new Client({
      ...conf,
      password,
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 12000,
    });
    try {
      await client.connect();
      return { client, host: `${conf.host}:${conf.port}` };
    } catch {
      try {
        await client.end();
      } catch {
        /* ignore */
      }
    }
  }
  return null;
}

export async function applySupabaseMigrations(options?: { allFiles?: boolean }): Promise<MigrationResult> {
  const allFiles = options?.allFiles ?? false;
  const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  if (databaseUrl) {
    const client = new Client({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 12000,
    });
    try {
      await client.connect();
      const sqlBlocks = loadMigrationSql(allFiles);
      for (const sql of sqlBlocks) {
        await client.query(sql);
      }
      await client.end();
      return { success: true, message: 'Migrations appliquées via DATABASE_URL', host: 'DATABASE_URL', appliedFiles: ['embedded-fix'] };
    } catch (err) {
      try {
        await client.end();
      } catch {
        /* ignore */
      }
      return { success: false, message: (err as Error).message };
    }
  }

  for (const password of passwordCandidates()) {
    const connected = await connectWithPassword(password);
    if (!connected) continue;

    const { client, host } = connected;
    try {
      const sqlBlocks = loadMigrationSql(allFiles);
      for (const sql of sqlBlocks) {
        await client.query(sql);
      }
      await client.end();
      return {
        success: true,
        message: 'Migrations appliquées',
        host,
        appliedFiles: ['embedded-fix'],
      };
    } catch (err) {
      try {
        await client.end();
      } catch {
        /* ignore */
      }
      return { success: false, message: `${host}: ${(err as Error).message}` };
    }
  }

  return {
    success: false,
    message: 'Connexion Postgres impossible — définir SUPABASE_DB_PASSWORD ou DATABASE_URL',
  };
}
