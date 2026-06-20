/** Resolve Supabase env from Vercel integration names or ComptaFlow VITE_* names. */

const sanitize = (val: string | undefined): string =>
  (val ?? '').replace(/[\u200B-\u200D\uFEFF]/g, '').trim();

function read(key: string): string | undefined {
  if (typeof import.meta !== 'undefined' && import.meta.env?.[key] != null) {
    return sanitize(String(import.meta.env[key]));
  }
  if (typeof process !== 'undefined' && process.env?.[key] != null) {
    return sanitize(process.env[key]);
  }
  return undefined;
}

export function resolveSupabaseUrl(): string {
  // Vercel Supabase integration (SUPABASE_*) first on server; VITE_* for client bundle
  return (
    read('SUPABASE_URL') ||
    read('VITE_SUPABASE_URL') ||
    read('NEXT_PUBLIC_SUPABASE_URL') ||
    'https://unvyxfxlzhnutpugjxhe.supabase.co'
  );
}

export function resolveSupabaseAnonKey(): string {
  return (
    read('SUPABASE_ANON_KEY') ||
    read('NEXT_PUBLIC_SUPABASE_ANON_KEY') ||
    read('SUPABASE_PUBLISHABLE_KEY') ||
    read('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY') ||
    read('VITE_SUPABASE_ANON_KEY') ||
    ''
  );
}

export function resolveSupabaseServiceRoleKey(): string {
  return read('SUPABASE_SERVICE_ROLE_KEY') || read('SUPABASE_SECRET_KEY') || '';
}
