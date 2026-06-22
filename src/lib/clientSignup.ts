/** Métadonnées Supabase Auth pour l'inscription client (PKCE). */
export type ClientSignupMetadata = {
  full_name: string;
  role: 'client';
};

export function buildClientSignupMetadata(fullName: string): ClientSignupMetadata {
  return {
    full_name: fullName.trim(),
    role: 'client',
  };
}
