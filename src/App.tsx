import { useEffect } from 'react';
import { BrowserRouter, HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { UserData } from './types';

import { Auth } from './components/common/Auth';
import { Landing } from './components/common/Landing';
import { Onboarding } from './components/auth/Onboarding';
import { SuccessScreen } from './components/SuccessScreen';
import { PortalDashboard, getPortalHomePath, LegacyDashboardRedirect } from './portals';
import { Privacy } from './components/common/Privacy';
import { Showcase } from './components/common/Showcase';
import { Terms } from './components/common/Terms';
import { Legal } from './components/common/Legal';
import { OrganicLoader } from './components/ui/OrganicLoader';

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

function AppContent() {
  const { user, userData, loading, logout, isAuthenticated, refreshProfile } = useAuth();
  const { mode, toggleMode } = useAppMode();
  const navigate = useNavigate();

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
      navigate(portalHome);
    }
  }, [isAuthenticated, userData, navigate, portalHome]);

  const handleOnboardingComplete = async (data: UserData) => {
    if (!user?.id) return;

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
      needs: createEmptyUserNeeds(),
      metadata: { province: data.province },
    });

    if (error) {
      toast.error('Erreur lors de la création du profil : ' + error.message);
      throw error;
    }

    await refreshProfile();
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

  const isProfileComplete = userData && (userData.role !== 'client' || userData.fullName);

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
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/legal" element={<Legal />} />
      <Route path="/showcase" element={<Showcase />} />

      <Route
        path="/login"
        element={
          !isAuthenticated ? (
            <Auth onAuthentication={() => navigate(portalHome)} />
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
              <Onboarding initialEmail={user?.email || ''} onComplete={handleOnboardingComplete} />
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
  );
}

export default function App() {
  const Router = window.location.protocol === 'file:' ? HashRouter : BrowserRouter;
  return (
    <div className="w-full min-h-screen font-sans text-ivoire selection:bg-gold/30 selection:text-noir bg-noir overflow-x-hidden">
      <ErrorBoundary>
        <Router>
          <AppContent />
        </Router>
      </ErrorBoundary>
    </div>
  );
}
