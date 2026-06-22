import { describe, it, expect } from 'vitest';
import { buildClientSignupMetadata } from './clientSignup';

describe('clientSignup', () => {
  it('builds client-only metadata', () => {
    expect(buildClientSignupMetadata('Jean Dupont')).toEqual({
      full_name: 'Jean Dupont',
      role: 'client',
    });
  });
});
