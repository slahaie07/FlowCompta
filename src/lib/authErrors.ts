import type { LanguageCode } from './i18n';

type AuthErrorKey =
  | 'emailNotConfirmed'
  | 'invalidCredentials'
  | 'duplicateEmail'
  | 'weakPassword'
  | 'rateLimited'
  | 'generic';

const FR_MESSAGES: Record<AuthErrorKey, string> = {
  emailNotConfirmed:
    "Votre adresse courriel n'a pas encore été confirmée. Consultez votre boîte de réception (et les indésirables), puis réessayez.",
  invalidCredentials: 'Courriel ou mot de passe incorrect.',
  duplicateEmail: 'Un compte existe déjà avec cette adresse courriel. Connectez-vous ou réinitialisez votre mot de passe.',
  weakPassword: 'Le mot de passe doit contenir au moins 6 caractères.',
  rateLimited: 'Trop de tentatives. Patientez quelques minutes avant de réessayer.',
  generic: "Échec de l'authentification. Veuillez réessayer.",
};

const EN_MESSAGES: Record<AuthErrorKey, string> = {
  emailNotConfirmed:
    'Your email address has not been confirmed yet. Check your inbox (and spam), then try again.',
  invalidCredentials: 'Incorrect email or password.',
  duplicateEmail: 'An account already exists with this email. Sign in or reset your password.',
  weakPassword: 'Password must be at least 6 characters.',
  rateLimited: 'Too many attempts. Please wait a few minutes before trying again.',
  generic: 'Authentication failed. Please try again.',
};

function classifyAuthError(message: string, status?: number): AuthErrorKey {
  const m = message.toLowerCase();

  if (
    m.includes('email not confirmed') ||
    m.includes('email_not_confirmed') ||
    (status === 400 && m.includes('confirm'))
  ) {
    return 'emailNotConfirmed';
  }
  if (
    m.includes('invalid login credentials') ||
    m.includes('invalid credentials') ||
    m.includes('wrong password')
  ) {
    return 'invalidCredentials';
  }
  if (
    m.includes('already registered') ||
    m.includes('user already registered') ||
    m.includes('already been registered') ||
    m.includes('duplicate')
  ) {
    return 'duplicateEmail';
  }
  if (
    m.includes('password') &&
    (m.includes('weak') || m.includes('short') || m.includes('at least') || m.includes('6'))
  ) {
    return 'weakPassword';
  }
  if (m.includes('rate limit') || m.includes('too many') || status === 429) {
    return 'rateLimited';
  }

  return 'generic';
}

/** Maps Supabase Auth errors to user-friendly FR/EN messages. */
export function mapSupabaseAuthError(
  error: { message?: string; status?: number } | null | undefined,
  lang: LanguageCode = 'fr'
): { message: string; emailNotConfirmed: boolean } {
  if (!error?.message) {
    const message = lang === 'en' ? EN_MESSAGES.generic : FR_MESSAGES.generic;
    return { message, emailNotConfirmed: false };
  }

  const key = classifyAuthError(error.message, error.status);
  const table = lang === 'en' ? EN_MESSAGES : FR_MESSAGES;

  return {
    message: table[key],
    emailNotConfirmed: key === 'emailNotConfirmed',
  };
}

export function isEmailNotConfirmedError(error: { message?: string; status?: number } | null | undefined): boolean {
  return classifyAuthError(error?.message ?? '', error?.status) === 'emailNotConfirmed';
}
