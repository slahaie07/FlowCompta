import { describe, expect, it } from 'vitest';
import { isEmailNotConfirmedError, mapSupabaseAuthError } from './authErrors';

describe('mapSupabaseAuthError', () => {
  it('maps email not confirmed (FR)', () => {
    const result = mapSupabaseAuthError({ message: 'Email not confirmed', status: 400 }, 'fr');
    expect(result.emailNotConfirmed).toBe(true);
    expect(result.message).toContain('confirmée');
  });

  it('maps invalid credentials (FR)', () => {
    const result = mapSupabaseAuthError({ message: 'Invalid login credentials' }, 'fr');
    expect(result.message).toContain('incorrect');
  });

  it('maps duplicate email (EN)', () => {
    const result = mapSupabaseAuthError({ message: 'User already registered' }, 'en');
    expect(result.message).toContain('already exists');
  });

  it('maps weak password (FR)', () => {
    const result = mapSupabaseAuthError({ message: 'Password should be at least 6 characters' }, 'fr');
    expect(result.message).toContain('6 caractères');
  });

  it('detects email not confirmed helper', () => {
    expect(isEmailNotConfirmedError({ message: 'Email not confirmed' })).toBe(true);
    expect(isEmailNotConfirmedError({ message: 'Invalid login credentials' })).toBe(false);
  });
});
