import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAuthRedirectUrl, getOAuthDisplayName, signInWithGoogle } from './authOAuth';

vi.mock('./supabase', () => ({
  supabase: {
    auth: {
      signInWithOAuth: vi.fn().mockResolvedValue({ error: null }),
    },
  },
}));

import { supabase } from './supabase';

describe('authOAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('builds redirect URL with origin and next path', () => {
    expect(getAuthRedirectUrl('/onboarding')).toBe(
      `${window.location.origin}/auth/callback?next=%2Fonboarding`
    );
  });

  it('normalizes next path without leading slash', () => {
    expect(getAuthRedirectUrl('portal/client')).toBe(
      `${window.location.origin}/auth/callback?next=%2Fportal%2Fclient`
    );
  });

  it('extracts Google display name from metadata', () => {
    expect(getOAuthDisplayName({ full_name: 'Marie Tremblay' })).toBe('Marie Tremblay');
    expect(getOAuthDisplayName({ name: 'John Doe' })).toBe('John Doe');
    expect(getOAuthDisplayName({})).toBe('');
  });

  it('calls signInWithOAuth with google provider', async () => {
    await signInWithGoogle('/portal');
    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: getAuthRedirectUrl('/portal'),
      },
    });
  });
});
