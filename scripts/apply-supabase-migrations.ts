/**
 * Applique les migrations SQL Supabase via connexion Postgres directe.
 * Usage:
 *   SUPABASE_DB_PASSWORD=... npm run db:migrate
 *   DATABASE_URL=postgresql://... npm run db:migrate
 */
import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { SUPABASE_PROJECT_REF } from '../src/lib/envResolve';

const { Client } = pg;
const root = process.cwd();
const migrationsDir = path.join(root, 'supabase', 'migrations');
const projectRef = SUPABASE_PROJECT_REF;

function getConnectionConfigs(): Array<
  | { kind: 'url'; connectionString: string }
  | { kind: 'host'; host: string; port: number; user: string; password: string }
> {
  const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  if (databaseUrl) {
    return [{ kind: 'url', connectionString: databaseUrl }];
  }

  const password =
    process.env.SUPABASE_DB_PASSWORD ||
    process.env.DATABASE_PASSWORD ||
    process.env.POSTGRES_PASSWORD ||
    '';

  if (!password) return [];

  return [
    { kind: 'host', host: `db.${projectRef}.supabase.co`, port: 5432, user: 'postgres', password },
    { kind: 'host', host: 'aws-1-ca-central-1.pooler.supabase.com', port: 6543, user: `postgres.${projectRef}`, password },
    { kind: 'host', host: 'aws-0-ca-central-1.pooler.supabase.com', port: 6543, user: `postgres.${projectRef}`, password },
  ];
}

async function connect(): Promise<pg.Client> {
  const configs = getConnectionConfigs();
  if (configs.length === 0) {
    throw new Error(
      'Définissez DATABASE_URL ou SUPABASE_DB_PASSWORD (mot de passe DB Supabase → Settings → Database).'
    );
  }

  let lastError: Error | undefined;
  for (const conf of configs) {
    const client =
      conf.kind === 'url'
        ? new Client({
            connectionString: conf.connectionString,
            ssl: { rejectUnauthorized: false },
            connectionTimeoutMillis: 10000,
          })
        : new Client({
            host: conf.host,
            port: conf.port,
            user: conf.user,
            password: conf.password,
            database: 'postgres',
            ssl: { rejectUnauthorized: false },
            connectionTimeoutMillis: 10000,
          });
    try {
      await client.connect();
      if (conf.kind === 'host') console.log(`✓ Connecté à ${conf.host}`);
      else console.log('✓ Connecté via DATABASE_URL');
      return client;
    } catch (err) {
      lastError = err as Error;
      if (conf.kind === 'host') console.warn(`✗ ${conf.host}: ${lastError.message}`);
    }
  }
  throw lastError ?? new Error('Connexion Postgres impossible');
}

async function main() {
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log('Aucune migration trouvée.');
    return;
  }

  const client = await connect();

  try {
    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      console.log(`\n→ ${file}`);
      await client.query(sql);
      console.log(`  OK`);
    }
    console.log('\n✅ Toutes les migrations ont été appliquées.');
  } finally {
    await client.end();
  }
}

main().catch((err: Error) => {
  console.error('\n❌', err.message);
  console.error('\nAlternative manuelle :');
  console.error(`  https://supabase.com/dashboard/project/${projectRef}/sql/new`);
  console.error('  Collez le contenu de supabase/migrations/20260620_fix_profiles_rls_recursion.sql');
  process.exit(1);
});
