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
    if (!user?.id) return;

    let subAdminId: string | null = null;
    const selectedExpertEmail = (data as any).selectedExpertEmail;
    if (selectedExpertEmail) {
      try {
        const { data: adminProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', selectedExpertEmail)
          .single();
        if (adminProfile) {
          subAdminId = adminProfile.id;
        }
      } catch (err) {
        console.error('Failed to lookup assigned expert:', err);
      }
    }

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      display_name: data.displayName,
      full_name: data.displayName,
      company_name: data.companyName || null,
      email: data.email || user.email,
      neq: data.neq || null,
      initial_profile_type: data.initialProfileType,
      active_mode: data.activeMode,
      preferred_language: data.language || 'fr',
      status: 'active',
      role: 'client',
      sub_admin_id: subAdminId,
      needs: createEmptyUserNeeds(),
      metadata: { province: data.province },
    });

    if (error) {
      toast.error('La création de votre profil a échoué. Veuillez réessayer. / Your profile could not be created. Please try again.');
      throw error;
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

  if (loading) {
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
