import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { UserData } from '../types';
import { CONFIG } from '../lib/config';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdminEmail = (email: string) => CONFIG.APP.ADMIN_EMAILS.includes(email);

  useEffect(() => {
    // 1. Check if mock session exists
    const localSession = localStorage.getItem('comptaflow_mock_session');
    if (localSession) {
      try {
        const parsed = JSON.parse(localSession);
        setUser(parsed.user);
        setUserData(parsed.userData);
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem('comptaflow_mock_session');
      }
    }

    // Session initiale Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id, session.user.email!);
      } else {
        setLoading(false);
      }
    });

    // Écouteur de changements d'état (Login, Logout, Token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id, session.user.email!);
      } else {
        setUser(null);
        setUserData(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (uid: string, email: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();

      if (data) {
        setUserData({
          displayName: data.display_name,
          companyName: data.company_name,
          email: email,
          incomeBracket: data.income_bracket,
          employeeCount: data.employee_count,
          needs: data.needs,
          isAdmin: data.role === 'admin' || isAdminEmail(email),
          createdAt: new Date(data.created_at).getTime(),
          activeMode: data.active_mode,
          initialProfileType: data.initial_profile_type
        });
      } else {
        // Nouvel utilisateur sans profil (attente onboarding)
        setUserData({
          email: email,
          isAdmin: isAdminEmail(email),
        } as UserData);
      }
    } catch (e) {
      console.error("Erreur critique de récupération de profil :", e);
    } finally {
      setLoading(false);
    }
  };

  const mockLogin = (email: string, isAdmin: boolean) => {
    const mockSession = {
      user: { id: isAdmin ? 'mock_admin_id' : 'mock_client_id', email },
      userData: {
        displayName: isAdmin ? 'Auditeur Suprême' : 'Samuel Tremblay',
        companyName: isAdmin ? 'Comptaflow Cabinet' : 'Tremblay Tech Inc.',
        email: email,
        incomeBracket: isAdmin ? 'N/A' : '100k-250k',
        employeeCount: isAdmin ? 'N/A' : '5',
        needs: isAdmin ? [] : ['GL-01', 'T1'],
        isAdmin: isAdmin,
        createdAt: Date.now(),
        activeMode: 'business',
        initialProfileType: 'business'
      }
    };
    localStorage.setItem('comptaflow_mock_session', JSON.stringify(mockSession));
    setUser(mockSession.user);
    setUserData(mockSession.userData as UserData);
  };

  const logout = async () => {
    localStorage.removeItem('comptaflow_mock_session');
    await supabase.auth.signOut();
    setUser(null);
    setUserData(null);
  };

  return { 
    user, 
    userData, 
    loading, 
    logout, 
    mockLogin,
    isAuthenticated: !!user, 
    refreshProfile: () => user && fetchProfile(user.id, user.email!) 
  };
}
