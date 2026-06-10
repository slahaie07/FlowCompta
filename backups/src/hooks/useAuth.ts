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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id, session.user.email!);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id, session.user.email!);
      else {
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
      } else if (isAdminEmail(email)) {
         // Auto-provision logic for the Admin
         const adminProfile = {
           displayName: 'Samuel L. (Admin)',
           companyName: 'Cabinet ComptaFlow',
           email: email,
           role: 'admin',
           active_mode: 'business'
         };
         setUserData({ ...adminProfile, isAdmin: true, incomeBracket: 'N/A', employeeCount: 'N/A', needs: { bookkeeping: true, payroll: true, taxes: true, rentabilite: true, consultation: true } } as any);
      }
    } catch (e) {
      console.error("Auth fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id, user.email!);
  };

  return { user, userData, loading, logout: () => supabase.auth.signOut(), isAuthenticated: !!user, refreshProfile };
}
