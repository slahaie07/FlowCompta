import { useState, useEffect } from 'react';
import { BrowserRouter, HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { UserData, Message } from './types';

// Imports corrigés pour la nouvelle architecture
import { Auth } from './components/common/Auth';
import { Landing } from './components/common/Landing';
import { Onboarding } from './components/auth/Onboarding';
import { SuccessScreen } from './components/SuccessScreen';
import { Dashboard } from './components/layout/Dashboard';
import { Privacy } from './components/common/Privacy';
import { Showcase } from './components/common/Showcase';
import { OrganicLoader } from './components/ui/OrganicLoader';

import { useAuth } from './hooks/useAuth';
import { useAppMode } from './hooks/useAppMode';
import { toast } from 'sonner';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

function RoleRedirect({ userData }: { userData: UserData | null }) {
  if (!userData) {
    return (
      <div className="min-h-screen bg-midnight text-silver flex flex-col items-center justify-center gap-8">
        <OrganicLoader label="LOAD" size="md" />
        <p className="text-slate-500 font-serif italic text-lg animate-pulse">Chargement de votre profil sécurisé...</p>
      </div>
    );
  }
  if (userData.role === 'super_admin') return <Navigate to="/super-admin" replace />;
  if (userData.role === 'sub_admin') return <Navigate to="/sub-admin" replace />;
  return <Navigate to="/client" replace />;
}

function AppContent() {
  const { user, userData, loading, logout, isAuthenticated, refreshProfile, mockLogin } = useAuth();
  const { mode, toggleMode } = useAppMode();
  const [adminMessages, setAdminMessages] = useState<Message[]>([]);
  const navigate = useNavigate();

  // Détecteur d'inactivité pour sécurité Loi 25 (15 minutes)
  useEffect(() => {
    if (!isAuthenticated) return;

    let timeoutId: number;

    const resetTimer = () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      // 15 minutes = 900 000 ms
      timeoutId = window.setTimeout(() => {
        logout();
        toast.warning("Votre session a expiré pour cause d'inactivité (Sécurité Loi 25).");
        navigate('/login');
      }, 900000);
    };

    // Événements d'activité utilisateur
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(evt => document.addEventListener(evt, resetTimer));
    resetTimer();

    return () => {
      events.forEach(evt => document.removeEventListener(evt, resetTimer));
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [isAuthenticated, logout, navigate]);

  // Redirection automatique après authentification
  useEffect(() => {
    if (isAuthenticated && userData && window.location.pathname === '/login') {
      if (userData.role === 'super_admin') navigate('/super-admin');
      else if (userData.role === 'sub_admin') navigate('/sub-admin');
      else navigate('/client');
    }
  }, [isAuthenticated, userData, navigate]);

  const handleOnboardingComplete = () => {
    refreshProfile();
    navigate('/success');
  };

  const handleOnSendMessage = (text: string) => {
    const newMsg: Message = {
      id: Date.now().toString(),
      sender: userData?.role === 'client' ? 'client' : 'cpa',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      clientName: userData?.fullName || 'Utilisateur'
    };
    setAdminMessages(prev => [...prev, newMsg]);
  };

  // Écran de chargement structurel
  if (loading) {
    return (
      <div className="min-h-screen bg-midnight text-silver flex flex-col items-center justify-center gap-8">
        <OrganicLoader label="FLOW" size="md" />
        <p className="text-slate-500 font-serif italic text-lg animate-pulse">Initialisation de votre espace sécurisé...</p>
      </div>
    );
  }

  const isProfileComplete = userData && (userData.role !== 'client' || userData.fullName);

  return (
    <Routes>
      {/* Route Racine */}
      <Route path="/" element={<Landing />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/showcase" element={<Showcase />} />

      {/* Routes Publiques */}
      <Route path="/login" element={
        !isAuthenticated ? (
          <Auth onAuthentication={() => {}} mockLogin={mockLogin} />
        ) : (
          <RoleRedirect userData={userData} />
        )
      } />
      
      {/* Routes Protégées - Flux Onboarding */}
      <Route path="/onboarding" element={
        isAuthenticated ? (
          isProfileComplete ? <RoleRedirect userData={userData} /> : <Onboarding initialEmail={user?.email || ''} onComplete={handleOnboardingComplete} />
        ) : <Navigate to="/login" replace />
      } />

      <Route path="/success" element={
          isAuthenticated ? <SuccessScreen onContinue={() => navigate('/dashboard')} /> : <Navigate to="/login" replace />
      } />

      {/* Portail Super Admin */}
      <Route path="/super-admin/*" element={
        isAuthenticated ? (
          userData && userData.role === 'super_admin' ? (
            <Dashboard 
              userData={userData} 
              adminMessages={adminMessages}
              onSendMessage={handleOnSendMessage}
              onLogout={logout}
              currentMode={mode}
              onToggleMode={toggleMode}
            />
          ) : <RoleRedirect userData={userData} />
        ) : <Navigate to="/login" replace />
      } />

      {/* Portail Sub Admin */}
      <Route path="/sub-admin/*" element={
        isAuthenticated ? (
          userData && userData.role === 'sub_admin' ? (
            <Dashboard 
              userData={userData} 
              adminMessages={adminMessages}
              onSendMessage={handleOnSendMessage}
              onLogout={logout}
              currentMode={mode}
              onToggleMode={toggleMode}
            />
          ) : <RoleRedirect userData={userData} />
        ) : <Navigate to="/login" replace />
      } />

      {/* Portail Client */}
      <Route path="/client/*" element={
        isAuthenticated ? (
          userData && userData.role === 'client' ? (
            <Dashboard 
              userData={userData} 
              adminMessages={adminMessages}
              onSendMessage={handleOnSendMessage}
              onLogout={logout}
              currentMode={mode}
              onToggleMode={toggleMode}
            />
          ) : <RoleRedirect userData={userData} />
        ) : <Navigate to="/login" replace />
      } />

      {/* Redirection générique */}
      <Route path="/dashboard" element={<RoleRedirect userData={userData} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  const Router = window.location.protocol === 'file:' ? HashRouter : BrowserRouter;
  return (
    <div className="w-full min-h-screen font-sans text-silver selection:bg-sapphire/30 selection:text-white bg-midnight overflow-x-hidden">
      <ErrorBoundary>
        <Router>
          <AppContent />
        </Router>
      </ErrorBoundary>
    </div>
  );
}
