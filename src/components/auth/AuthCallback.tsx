import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { OrganicLoader } from '../ui/OrganicLoader';

export function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = searchParams.get('next') || '/portal';

  useEffect(() => {
    let cancelled = false;

    async function completeAuthCallback() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const authError = params.get('error');
      const authErrorDescription = params.get('error_description');

      if (authError) {
        toast.error(authErrorDescription || 'Connexion annulée.');
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
          if (!session) throw new Error('Session introuvable après la confirmation du courriel.');
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
          toast.success('Connexion réussie.');
          navigate(nextPath.startsWith('/') ? nextPath : `/${nextPath}`, { replace: true });
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erreur de connexion.';
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
        Finalisation de votre connexion…
      </p>
    </div>
  );
}
