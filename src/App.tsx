import { useEffect } from 'react';
import { BrowserRouter, HashRouter, Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { UserData } from './types';

import { Auth } from './components/common/Auth';
import { Landing } from './components/common/Landing';
import { Onboarding } from './components/auth/Onboarding';
import { AuthCallback } from './components/auth/AuthCallback';
import { getOAuthDisplayName } from './lib/authOAuth';
import { SuccessScreen } from './components/SuccessScreen';
import { PortalDashboard, getPortalHomePath, LegacyDashboardRedirect } from './portals';
import { LegacyPortalSlugRedirect } from './portals/shared/LegacyPortalSlugRedirect';
import { Privacy } from './components/common/Privacy';
import { Showcase } from './components/common/Showcase';
import { Terms } from './components/common/Terms';
import { Legal } from './components/common/Legal';
import { Cookies } from './components/common/Cookies';
import { RegionalLanding } from './components/common/RegionalLanding';
import { EstimatePage } from './components/common/EstimatePage';
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
      nas: data.nas || null,
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
      toast.error('Erreur lors de la création du profil : ' + error.message);
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
          nas: data.nas || null,
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
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/legal" element={<Legal />} />
      <Route path="/cookies" element={<Cookies />} />
      <Route path="/ca/:slug" element={<RegionalLanding />} />
      <Route path="/estimate" element={<EstimatePage />} />
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
