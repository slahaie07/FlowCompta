import { CONFIG } from './config';

/** PKCE / email confirmation return URL — works on localhost and production (compta-flow.net). */
export function getAuthRedirectUrl(nextPath = '/portal'): string {
  const origin =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : CONFIG.APP.SITE_URL;
  const next = encodeURIComponent(nextPath.startsWith('/') ? nextPath : `/${nextPath}`);
  return `${origin}/auth/callback?next=${next}`;
}

/** Display name from Supabase user metadata (email signup, etc.). */
export function getOAuthDisplayName(metadata: Record<string, unknown> | undefined): string {
  if (!metadata) return '';
  const candidates = ['full_name', 'display_name', 'name'];
  for (const key of candidates) {
    const value = metadata[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}
