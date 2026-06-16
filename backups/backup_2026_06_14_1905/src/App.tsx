import { useState } from 'react';
import { BrowserRouter, HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { UserData, Message } from './types';

// Imports corriges suite a la restructuration architecturale
import { Auth } from './components/common/Auth';
import { Landing } from './components/common/Landing';
import { Onboarding } from './components/auth/Onboarding';
import { SuccessScreen } from './components/SuccessScreen';
import { Dashboard } from './components/layout/Dashboard';

import { supabase } from './lib/supabase';
import { useAuth } from './hooks/useAuth';
import { useAppMode } from './hooks/useAppMode';

import { communicationService } from './lib/communication';
import { toast } from 'sonner';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

/**
 * AppContent - Architecture de Routage Standardisee
 * Gere la logique d'acces, la redirection automatique et l'onboarding.
 */
function AppContent() {
  const { user, userData, loading, logout, isAuthenticated, refreshProfile, mockLogin } = useAuth();
  const { mode, toggleMode } = useAppMode();
  const [adminMessages, setAdminMessages] = useState<Message[]>([]);
  const navigate = useNavigate();

  // Gestion centralisee de la fin d'onboarding
  const handleOnboardingComplete = async (data: UserData, quoteValue: number) => {
    if (!user) return;

    try {
      const confirmationId = `CF-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

      // Synchronisation avec la base de donnees réelle
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        display_name: data.displayName,
        company_name: data.companyName,
        email: user.email,
        income_bracket: data.incomeBracket,
        employee_count: data.employeeCount,
        needs: data.needs,
        role: 'client',
        active_mode: data.activeMode || 'business',
        initial_profile_type: data.initialProfileType || 'business'
      });

      if (error) throw error;

      await refreshProfile();
      await communicationService.notifyAdminOfSubscription(data, quoteValue, confirmationId);

      navigate('/success');
    } catch(e) {
      console.error("Erreur de sauvegarde :", e);
      toast.error("Echec de synchronisation. Verifiez votre connexion Supabase.");
    }
  };

  const handleOnSendMessage = (text: string) => {
    const newMsg: Message = {
      id: Date.now().toString(),
      sender: userData?.isAdmin ? 'cpa' : 'client',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      clientName: userData?.displayName || 'Inconnu'
    };
    setAdminMessages(prev => [...prev, newMsg]);
  };

  // Ecran de chargement structurel
  if (loading) {
    return (
      <div className="min-h-screen bg-midnight text-silver flex items-center justify-center">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-gold/10 border-t-gold rounded-full animate-spin" />
          <motion.div 
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 flex items-center justify-center text-gold font-serif text-xs tracking-widest font-bold"
          >
            FLOW
          </motion.div>
        </div>
      </div>
    );
  }

  const isProfileComplete = userData && userData.incomeBracket;

  return (
    <Routes>
      {/* Route Racine - Landing Page Gold Standard */}
      <Route path="/" element={<Landing />} />

      {/* Routes Publiques - Auth Centralisee */}
      <Route path="/login" element={!isAuthenticated ? <Auth onAuthentication={() => navigate('/dashboard')} mockLogin={mockLogin} /> : <Navigate to="/dashboard" replace />} />
      
      {/* Routes Protegees - Flux Onboarding */}
      <Route path="/onboarding" element={
        isAuthenticated ? (
          isProfileComplete ? <Navigate to="/dashboard" replace /> : <Onboarding initialEmail={user?.email || ''} onComplete={handleOnboardingComplete} />
        ) : <Navigate to="/login" replace />
      } />

      <Route path="/success" element={
          isAuthenticated ? <SuccessScreen onContinue={() => navigate('/dashboard')} /> : <Navigate to="/login" replace />
      } />

      {/* Tableau de Bord Principal */}
      <Route path="/dashboard/*" element={
        isAuthenticated ? (
          isProfileComplete ? (
            <Dashboard 
              userData={userData} 
              adminMessages={adminMessages}
              onSendMessage={handleOnSendMessage}
              onLogout={logout}
              currentMode={mode}
              onToggleMode={toggleMode}
            />
          ) : <Navigate to="/onboarding" replace />
        ) : <Navigate to="/login" replace />
      } />

      {/* Redirection fallback */}
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
