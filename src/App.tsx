import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, HashRouter, Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { UserData } from './types';

import { Landing } from './components/common/Landing';
import { getOAuthDisplayName } from './lib/authOAuth';
import { getPortalHomePath } from './portals/config/paths';
import { LegacyDashboardRedirect } from './portals/shared/LegacyDashboardRedirect';
import { LegacyPortalSlugRedirect } from './portals/shared/LegacyPortalSlugRedirect';
import { LegalCookieBanner } from './components/common/LegalCookieBanner';
import { OrganicLoader } from './components/ui/OrganicLoader';
import { CanadaNetworkProvider } from './context/CanadaNetworkProvider';

import { useAuth } from './hooks/useAuth';
import { useAppMode } from './hooks/useAppMode';
import { toast } from 'sonner';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { supabase } from './lib/supabase';
import { createEmptyUserNeeds } from './lib/servicesCatalog';
import type { PortalRole } from './portals/types';

// ——— Chargement paresseux (découpage de code) ———
// Seule la page d’accueil publique (Landing, importée ci-dessus) part dans le
// paquet initial. Tout le reste — espaces connectés, portails, pages
// secondaires — est découpé en morceaux séparés que Vite/Rollup émet
// automatiquement et que le navigateur ne télécharge que lorsque la route
// correspondante est visitée. Les aides légères des portails (chemins,
// redirections d’alias) sont importées depuis leurs modules directs pour ne
// pas tirer tout le graphe des portails dans le paquet public.
const Auth = lazy(() => import('./components/common/Auth').then((m) => ({ default: m.Auth })));
const Onboarding = lazy(() =>
  import('./components/auth/Onboarding').then((m) => ({ default: m.Onboarding }))
);
const AuthCallback = lazy(() =>
  import('./components/auth/AuthCallback').then((m) => ({ default: m.AuthCallback }))
);
const SuccessScreen = lazy(() =>
  import('./components/SuccessScreen').then((m) => ({ default: m.SuccessScreen }))
);
const PortalDashboard = lazy(() => import('./portals'));
const Privacy = lazy(() => import('./components/common/Privacy').then((m) => ({ default: m.Privacy })));
const Showcase = lazy(() =>
  import('./components/common/Showcase').then((m) => ({ default: m.Showcase }))
);
const Legal = lazy(() => import('./components/common/Legal').then((m) => ({ default: m.Legal })));
const Cookies = lazy(() => import('./components/common/Cookies').then((m) => ({ default: m.Cookies })));
const RegionalLanding = lazy(() =>
  import('./components/common/RegionalLanding').then((m) => ({ default: m.RegionalLanding }))
);
const BlogListPage = lazy(() =>
  import('./components/common/BlogPage').then((m) => ({ default: m.BlogListPage }))
);
const BlogArticlePage = lazy(() =>
  import('./components/common/BlogPage').then((m) => ({ default: m.BlogArticlePage }))
);
const EstimatePage = lazy(() =>
  import('./components/common/EstimatePage').then((m) => ({ default: m.EstimatePage }))
);
const TarifsPage = lazy(() =>
  import('./components/common/TarifsPage').then((m) => ({ default: m.TarifsPage }))
);
const ConfiancePage = lazy(() =>
  import('./components/common/ConfiancePage').then((m) => ({ default: m.ConfiancePage }))
);
const TaxCalculator = lazy(() =>
  import('./components/common/TaxCalculator').then((m) => ({ default: m.TaxCalculator }))
);

function RouteFallback() {
  return (
    <div className="min-h-screen bg-noir text-ivoire flex flex-col items-center justify-center gap-8">
      <OrganicLoader label="FLOW" size="md" />
      <p className="text-slate-500 font-serif italic text-lg animate-pulse">Chargement...</p>
    </div>
  );
}

function PortalHomeRedirect({ userData }: { userData: UserData }) {
  const role = (userData.role ?? 'client') as PortalRole;
  return <Navigate to={getPortalHomePath(role)} replace />;
}

function isClientProfileComplete(userData: UserData | null | undefined): boolean {
  return Boolean(
    userData &&
      (userData.role !== 'client' || (Boolean(userData.fullName?.trim()) && Boolean(userData.province)))
  );
}

function AppContent() {
  const { user, userData, loading, logout, isAuthenticated, refreshProfile } = useAuth();
  const { mode, toggleMode } = useAppMode();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const portalHome = userData ? getPortalHomePath((userData.role ?? 'client') as PortalRole) : '/portal/client/overview';

  useEffect(() => {
    if (!isAuthenticated) return;

    let timeoutId: number;

    const resetTimer = () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        logout();
        toast.warning("Votre session a expiré pour cause d'inactivité (Sécurité Loi 25).");
        navigate('/login');
      }, 900000);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach((evt) => document.addEventListener(evt, resetTimer));
    resetTimer();

    return () => {
      events.forEach((evt) => document.removeEventListener(evt, resetTimer));
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [isAuthenticated, logout, navigate]);

  useEffect(() => {
    if (isAuthenticated && userData && window.location.pathname === '/login') {
      const next = searchParams.get('next');
      const target =
        next && next.startsWith('/')
          ? next
          : !isClientProfileComplete(userData) && (userData.role ?? 'client') === 'client'
            ? '/onboarding'
            : portalHome;
      navigate(target);
    }
  }, [isAuthenticated, userData, navigate, portalHome, searchParams]);

  const handleOnboardingComplete = async (data: UserData) => {
    if (!user?.id) {
      throw new Error('Session utilisateur absente — impossible de créer le profil.');
    }

    const selectedExpertEmail = (data as any).selectedExpertEmail;

    // La ligne de profil est créée à l'inscription par le déclencheur
    // handle_new_user (SECURITY DEFINER) : on la MET À JOUR, jamais d'upsert.
    // Un upsert PostgREST exige une politique INSERT sur profiles, qui
    // n'existe pas (RLS) — il échouait donc systématiquement et le profil
    // n'était jamais persisté. On n'écrit ni « role » ni « sub_admin_id » :
    // ces champs sont immuables côté client (déclencheur
    // guard_profile_privileged_fields + politique « Modif propre profil ») ;
    // l'assignation de l'expert choisi relève de l'administrateur — le choix
    // du client lui est transmis par le webhook ci-dessous.
    //
    // Écriture en DEUX temps (correctif du 2026-11-04, étape 2) : PostgREST
    // refuse ATOMIQUEMENT tout payload contenant une colonne absente du
    // schéma réel. Or les colonnes « étendues » ci-dessous n'existent que
    // dans database.sql — jamais ajoutées par la chaîne de migrations
    // appliquée (comptaflow_migration.sql + supabase/migrations/) — donc un
    // seul payload mêlant cœur + étendu échouait en entier en production :
    // rien ne persistait et la porte du portail (nom + province) restait
    // fermée. On écrit donc d'abord le cœur prouvé, puis l'étendu en
    // best-effort isolé, pour qu'un écart de schéma ne bloque plus jamais
    // l'entrée du client dans son portail.
    // Rattrapage (correctif du 2026-11-04, étape 3) : si le déclencheur
    // handle_new_user n'a pas créé la ligne à l'inscription — cas prouvé en
    // production : aucune ligne profiles pour des comptes Auth pourtant
    // valides — la mise à jour ci-dessous ne touche 0 ligne et le parcours
    // meurt. On tente donc d'abord de CRÉER la ligne complète. Si elle
    // existe déjà (cas normal), l'insertion échoue en conflit (23505) et on
    // enchaîne sur la mise à jour en deux temps, inchangée. Si la création
    // est refusée par la RLS (42501) ou par un écart de schéma résiduel,
    // on enchaîne aussi : la mise à jour tranchera, et son erreur explicite
    // (« Profil introuvable ») s'affichera — jamais un bouton inerte.
    // On n'écrit ni « role » (défaut base : 'client') ni « sub_admin_id ».
    let profileRowCreated = false;
    {
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: data.email || user.email,
          display_name: data.displayName,
          full_name: data.displayName,
          company_name: data.companyName || null,
          neq: data.neq || null,
          initial_profile_type: data.initialProfileType,
          active_mode: data.activeMode,
          preferred_language: data.language || 'fr',
          status: 'active',
          needs: createEmptyUserNeeds(),
          metadata: { province: data.province },
        })
        .select('id');

      if (!insertError) {
        profileRowCreated = true;
      } else if (insertError.code !== '23505' && insertError.code !== '42501') {
        console.error(
          'Création de rattrapage du profil refusée, mise à jour tentée ensuite :',
          insertError
        );
      }
    }

    if (!profileRowCreated) {
    const { data: updatedRows, error } = await supabase
      .from('profiles')
      .update({
        display_name: data.displayName,
        full_name: data.displayName,
        email: data.email || user.email,
      })
      .eq('id', user.id)
      .select('id');

    if (error) {
      // Aucun toast ici : le catch de l'écran d'onboarding affiche le seul
      // message d'erreur (avant, deux messages contradictoires partaient).
      console.error('Échec de la mise à jour du profil (onboarding) :', error);
      throw error;
    }

    if (!updatedRows || updatedRows.length === 0) {
      console.error('Aucune ligne de profil mise à jour pour', user.id);
      throw new Error('Profil introuvable — la création du profil a échoué.');
    }

    // Écriture étendue : entreprise, NEQ, préférences, besoins, province.
    // Si une colonne manque encore côté production, l'erreur est journalisée
    // et ignorée — la migration d'alignement du schéma
    // (supabase/migrations/20261105_profiles_onboarding_columns.sql) réglera
    // la persistance complète de ces champs ; en attendant, le filet Auth
    // ci-dessous garantit la complétion du parcours.
    const { error: extendedError } = await supabase
      .from('profiles')
      .update({
        company_name: data.companyName || null,
        neq: data.neq || null,
        initial_profile_type: data.initialProfileType,
        active_mode: data.activeMode,
        preferred_language: data.language || 'fr',
        status: 'active',
        needs: createEmptyUserNeeds(),
        metadata: { province: data.province },
      })
      .eq('id', user.id);

    if (extendedError) {
      console.error(
        'Écriture étendue du profil ignorée (écart de schéma production) :',
        extendedError
      );
    }
    } // fin du bloc « ligne non créée au rattrapage » (mise à jour en deux temps)

    // Filet de persistance garanti : la province et le nom sont aussi écrits
    // dans les métadonnées du compte Auth (aucune dépendance au schéma de
    // profiles). fetchProfile s'en sert en repli quand metadata.province est
    // absent, donc la porte isClientProfileComplete peut s'ouvrir même si
    // l'écriture étendue ci-dessus a été refusée.
    try {
      const { error: filetError } = await supabase.auth.updateUser({
        data: {
          province: data.province,
          full_name: data.displayName,
          display_name: data.displayName,
        },
      });
      if (filetError) {
        console.error('Métadonnées Auth (filet onboarding) non écrites :', filetError);
      }
    } catch (filetError) {
      console.error('Métadonnées Auth (filet onboarding) non écrites :', filetError);
    }

    await refreshProfile();

    try {
      await fetch('/api/webhook/onboarding-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          email: data.email || user.email,
          displayName: data.displayName,
          province: data.province,
          language: data.language || 'fr',
          selectedExpertEmail: selectedExpertEmail,
          companyName: data.companyName || null,
          neq: data.neq || null,
              initialProfileType: data.initialProfileType || 'personal',
        }),
      });
    } catch {
      /* email/webhook best-effort */
    }

    toast.success(
      data.language === 'en'
        ? 'Welcome! Pick your service, then follow your guided file path.'
        : data.language === 'ar'
          ? 'مرحباً! اختر خدمتك ثم اتبع مسار ملفك.'
          : 'Bienvenue ! Choisissez votre service, puis suivez votre parcours dossier.'
    );
    navigate('/portal/client/overview');
  };

  // Écran de chargement seulement tant que la première résolution d'auth
  // n'a pas eu lieu. Ensuite, l'arbre reste monté en permanence : l'échanger
  // contre l'écran de chargement ferait perdre la position de défilement.
  if (loading && !user && !userData) {
    return (
      <div className="min-h-screen bg-noir text-ivoire flex flex-col items-center justify-center gap-8">
        <OrganicLoader label="FLOW" size="md" />
        <p className="text-slate-500 font-serif italic text-lg animate-pulse">Initialisation de votre espace sécurisé...</p>
      </div>
    );
  }

  const isProfileComplete = isClientProfileComplete(userData);

  const portalElement =
    isAuthenticated && isProfileComplete && userData ? (
      <PortalDashboard
        userData={userData}
        onLogout={logout}
        currentMode={mode}
        onToggleMode={toggleMode}
        onRefreshProfile={refreshProfile}
      />
    ) : isAuthenticated ? (
      <Navigate to="/onboarding" replace />
    ) : (
      <Navigate to="/login" replace />
    );

  return (
    <>
    <Suspense fallback={<RouteFallback />}>
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/privacy" element={<Privacy />} />
      {/* /terms : l’ancienne page fantôme (prix périmés, doublon de /legal) est
          retirée du routage ; les anciens liens redirigent vers /legal, à jour. */}
      <Route path="/terms" element={<Navigate to="/legal" replace />} />
      <Route path="/legal" element={<Legal />} />
      <Route path="/cookies" element={<Cookies />} />
      <Route path="/ca/:slug" element={<RegionalLanding />} />
      <Route path="/ressources" element={<BlogListPage />} />
      <Route path="/ressources/:slug" element={<BlogArticlePage />} />
      <Route path="/resources" element={<Navigate to="/ressources" replace />} />
      <Route path="/estimate" element={<EstimatePage />} />
      <Route path="/tarifs" element={<TarifsPage />} />
      <Route path="/confiance" element={<ConfiancePage />} />
      <Route path="/calculateur-taxes" element={<TaxCalculator />} />
      <Route path="/tax-calculator" element={<Navigate to="/calculateur-taxes" replace />} />
      <Route path="/showcase" element={<Showcase />} />

      <Route path="/auth/callback" element={<AuthCallback />} />

      <Route
        path="/login"
        element={
          !isAuthenticated ? (
            <Auth onAuthentication={() => { /* Auth navigates via ?next=; profile gate handles onboarding */ }} />
          ) : (
            <Navigate to={portalHome} replace />
          )
        }
      />

      <Route
        path="/onboarding"
        element={
          isAuthenticated ? (
            isProfileComplete ? (
              <Navigate to={portalHome} replace />
            ) : (
              <Onboarding
                initialEmail={user?.email || ''}
                initialDisplayName={getOAuthDisplayName(user?.user_metadata)}
                onComplete={handleOnboardingComplete}
              />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/success"
        element={
          isAuthenticated ? (
            <SuccessScreen onContinue={() => navigate(portalHome)} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Portails dédiés par rôle — le segment suivant est la vue (overview, invoices…) */}
      <Route path="/portal/client/*" element={portalElement} />
      <Route path="/portal/admin/*" element={portalElement} />
      <Route path="/portal/owner/*" element={portalElement} />
      {/* Alias URL (sub-admin / super-admin) → slugs canoniques */}
      <Route
        path="/portal/sub-admin/*"
        element={<LegacyPortalSlugRedirect fromSlug="sub-admin" toSlug="admin" />}
      />
      <Route
        path="/portal/super-admin/*"
        element={<LegacyPortalSlugRedirect fromSlug="super-admin" toSlug="owner" />}
      />

      {/* Redirection racine portail */}
      <Route
        path="/portal"
        element={
          isAuthenticated && userData ? (
            <PortalHomeRedirect userData={userData} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Compatibilité /dashboard/* → /portal/{role}/* */}
      <Route
        path="/dashboard/*"
        element={
          isAuthenticated && userData ? (
            <LegacyDashboardRedirect role={(userData.role ?? 'client') as PortalRole} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
    <LegalCookieBanner />
    </>
  );
}

export default function App() {
  const Router = window.location.protocol === 'file:' ? HashRouter : BrowserRouter;
  return (
    <div className="w-full min-h-screen font-sans text-ivoire selection:bg-gold/30 selection:text-noir bg-noir overflow-x-hidden">
      <ErrorBoundary>
        <CanadaNetworkProvider>
          <Router>
            <AppContent />
          </Router>
        </CanadaNetworkProvider>
      </ErrorBoundary>
    </div>
  );
}
