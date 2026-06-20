import { describe, it, expect } from 'vitest';
import { getAuthRedirectUrl, getOAuthDisplayName } from './authOAuth';

describe('authOAuth', () => {
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

  it('extracts display name from user metadata', () => {
    expect(getOAuthDisplayName({ full_name: 'Marie Tremblay' })).toBe('Marie Tremblay');
    expect(getOAuthDisplayName({ name: 'John Doe' })).toBe('John Doe');
    expect(getOAuthDisplayName({})).toBe('');
  });
});
