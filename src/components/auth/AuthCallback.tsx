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

    async function completeOAuth() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const oauthError = params.get('error');
      const oauthErrorDescription = params.get('error_description');

      if (oauthError) {
        toast.error(oauthErrorDescription || 'Connexion Google annulée.');
        if (!cancelled) navigate('/login', { replace: true });
        return;
      }

      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else {
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession();
          if (error) throw error;
          if (!session) throw new Error('Session introuvable après la connexion Google.');
        }

        if (!cancelled) {
          toast.success('Connexion Google réussie.');
          navigate(nextPath.startsWith('/') ? nextPath : `/${nextPath}`, { replace: true });
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erreur de connexion Google.';
        toast.error(message);
        if (!cancelled) navigate('/login', { replace: true });
      }
    }

    void completeOAuth();
    return () => {
      cancelled = true;
    };
  }, [navigate, nextPath]);

  return (
    <div className="min-h-screen bg-noir text-ivoire flex flex-col items-center justify-center gap-8">
      <OrganicLoader label="FLOW" size="md" />
      <p className="text-slate-500 font-serif italic text-lg animate-pulse">
        Finalisation de votre connexion Google…
      </p>
    </div>
  );
}
