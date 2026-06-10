import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { UserData } from '../types';

import { CONFIG } from '../lib/config';

import { internalApi } from '../lib/api';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdminEmail = (email: string) => CONFIG.APP.ADMIN_EMAILS.includes(email);

  useEffect(() => {
    // Tentative Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id, session.user.email!);
      } else {
        // Fallback Local Storage (Mode Autonome)
        const localUser = localStorage.getItem('cf_user');
        if (localUser) {
          const u = JSON.parse(localUser);
          setUser(u);
          fetchProfile(u.id, u.email);
        } else {
          setLoading(false);
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id, session.user.email!);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (uid: string, email: string) => {
    setLoading(true);
    try {
      // 1. Essayer Supabase
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
        // 2. Fallback API Interne
        const localProfile = await internalApi.fetchProfile(uid);
        if (localProfile) {
          setUserData(localProfile);
        } else if (isAdminEmail(email)) {
           // Auto-provision Admin
           setUserData({ displayName: 'Admin Local', companyName: 'Cabinet', email, isAdmin: true } as any);
        }
      }
    } catch (e) {
      // 3. Dernier recours API Interne
      const localProfile = await internalApi.fetchProfile(uid);
      if (localProfile) setUserData(localProfile);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('cf_user');
    setUser(null);
    setUserData(null);
  };

  return { user, userData, loading, logout, isAuthenticated: !!user, refreshProfile: () => user && fetchProfile(user.id, user.email!) };
}
