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
          id: data.id || uid,
          fullName: data.full_name,
          displayName: data.full_name, // fallback for components
          email: email,
          role: data.role || 'client',
          subAdminId: data.sub_admin_id,
          interacEmail: data.interac_email,
          interacQuestion: data.interac_question,
          interacAutodepot: data.interac_autodepot,
          isAdmin: data.role === 'super_admin' || data.role === 'sub_admin' || isAdminEmail(email),
          createdAt: new Date(data.created_at).getTime()
        });
      } else {
        // Nouvel utilisateur sans profil (attente onboarding/création automatique par trigger)
        setUserData({
          id: uid,
          email: email,
          role: 'client',
          isAdmin: isAdminEmail(email),
        } as UserData);
      }
    } catch (e) {
      console.error("Erreur critique de récupération de profil :", e);
    } finally {
      setLoading(false);
    }
  };

  const mockLogin = (email: string, role: 'super_admin' | 'sub_admin' | 'client') => {
    const id = `mock_${role}_id`;
    const mockSession = {
      user: { id, email },
      userData: {
        id,
        fullName: role === 'super_admin' ? 'Super Admin Compta' : role === 'sub_admin' ? 'Partenaire CPA' : 'Client Tremblay',
        displayName: role === 'super_admin' ? 'Super Admin Compta' : role === 'sub_admin' ? 'Partenaire CPA' : 'Client Tremblay',
        companyName: role === 'super_admin' ? 'Comptaflow Cabinet' : role === 'sub_admin' ? 'Cabinet Associé CPA' : 'Tremblay Tech Inc.',
        email: email,
        role: role,
        isAdmin: role === 'super_admin' || role === 'sub_admin',
        subAdminId: role === 'client' ? 'mock_sub_admin_id' : undefined,
        interacEmail: role === 'sub_admin' ? 'interac@cpa.ca' : undefined,
        interacQuestion: role === 'sub_admin' ? 'Mot de passe' : undefined,
        interacAutodepot: role === 'sub_admin' ? false : undefined,
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
