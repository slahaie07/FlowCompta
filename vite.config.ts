import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

/** Map Vercel Supabase integration vars → VITE_* for client bundle */
function mapSupabaseEnv(env: Record<string, string>) {
  if (!env.VITE_SUPABASE_URL) {
    env.VITE_SUPABASE_URL = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || '';
  }
  if (!env.VITE_SUPABASE_ANON_KEY) {
    env.VITE_SUPABASE_ANON_KEY =
      env.SUPABASE_ANON_KEY ||
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      env.SUPABASE_PUBLISHABLE_KEY ||
      env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      '';
  }
}

export default defineConfig(({ mode }) => {
  // loadEnv reads .env files only; Vercel injects SUPABASE_* into process.env at build time
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env } as Record<string, string>;
  mapSupabaseEnv(env);
  process.env.VITE_SUPABASE_URL = env.VITE_SUPABASE_URL;
  process.env.VITE_SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY;

  return {
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || ''),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || ''),
    },
    base: process.env.GITHUB_REPOSITORY ? '/flowcompta/' : '/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('@supabase')) {
                return 'vendor-db';
              }
              if (id.includes('@google')) {
                return 'vendor-ai';
              }
              if (id.includes('lucide-react') || id.includes('motion')) {
                return 'vendor-ui';
              }
              return 'vendor-core';
            }
          }
        }
      }
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify — file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
