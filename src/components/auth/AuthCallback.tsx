import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { OrganicLoader } from '../ui/OrganicLoader';
import { useLanguage } from '../../hooks/useLanguage';
import { mapSupabaseAuthError } from '../../lib/authErrors';
import { CONFIG } from '../../lib/config';

const SESSION_NOT_FOUND_FR = 'Session introuvable après la confirmation du courriel.';
const SESSION_NOT_FOUND_EN = 'Session not found after email confirmation.';

export function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { lang } = useLanguage();
  const nextPath = searchParams.get('next') || '/portal';

  useEffect(() => {
    let cancelled = false;

    async function completeAuthCallback() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const authError = params.get('error');
      const authErrorDescription = params.get('error_description');

      if (authError) {
        console.warn('Auth callback error:', authError, authErrorDescription);
        toast.error(
          lang === 'en'
            ? `Sign-in did not complete. Try again, or write to us at ${CONFIG.APP.SUPPORT_EMAIL}.`
            : `La connexion n’a pas abouti. Réessayez, ou écrivez-nous à ${CONFIG.APP.SUPPORT_EMAIL}.`
        );
        if (!cancelled) navigate('/login', { replace: true });
        return;
      }
      try {
        let currentSession = null;
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          currentSession = data.session;
        } else {
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession();
          if (error) throw error;
          if (!session) throw new Error(lang === 'en' ? SESSION_NOT_FOUND_EN : SESSION_NOT_FOUND_FR);
          currentSession = session;
        }

        if (currentSession && currentSession.user) {
          const user = currentSession.user;
          const email = user.email;
          const fullName = user.user_metadata?.full_name || user.user_metadata?.display_name || 'Client ComptaFlow';
          
          try {
            fetch('/api/webhook/account-confirmed', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: user.id,
                email,
                fullName,
              }),
            });
          } catch (e) {
            console.warn("Échec d'envoi de la notification d'activation :", e);
          }
        }

        if (!cancelled) {
          toast.success(lang === 'en' ? 'Signed in successfully.' : 'Connexion réussie.');
          navigate(nextPath.startsWith('/') ? nextPath : `/${nextPath}`, { replace: true });
        }
      } catch (err: unknown) {
        const rawMessage = err instanceof Error ? err.message : '';
        const message =
          rawMessage === SESSION_NOT_FOUND_FR || rawMessage === SESSION_NOT_FOUND_EN
            ? rawMessage
            : mapSupabaseAuthError(
                err && typeof err === 'object' && 'message' in err
                  ? (err as { message?: string; status?: number })
                  : undefined,
                lang
              ).message;
        toast.error(message);
        if (!cancelled) navigate('/login', { replace: true });
      }
    }

    void completeAuthCallback();
    return () => {
      cancelled = true;
    };
  }, [navigate, nextPath]);

  return (
    <div className="min-h-screen bg-noir text-ivoire flex flex-col items-center justify-center gap-8">
      <OrganicLoader label="FLOW" size="md" />
      <p className="text-slate-500 font-serif italic text-lg animate-pulse">
        {lang === 'en' ? 'Completing your sign-in…' : 'Finalisation de votre connexion…'}
      </p>
    </div>
  );
}
