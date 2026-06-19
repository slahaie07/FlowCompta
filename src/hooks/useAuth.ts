import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { UserData } from '../types';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        const finalRole = (data.role || 'client') as UserData['role'];
        const metadata = (data.metadata as Record<string, unknown>) || {};
        const needs = data.needs as UserData['needs'];
        let selectedServiceId = metadata.selectedServiceId as string | undefined;

        if (!selectedServiceId && needs && typeof needs === 'object' && !Array.isArray(needs)) {
          const active = Object.entries(needs).find(([, v]) => v === true);
          if (active) selectedServiceId = active[0];
        }

        setUserData({
          id: data.id || uid,
          fullName: data.full_name || data.display_name,
          displayName: data.display_name || data.full_name,
          companyName: data.company_name,
          email: email,
          role: finalRole as any,
          subAdminId: data.sub_admin_id,
          interacEmail: data.interac_email,
          interacQuestion: data.interac_question,
          interacAutodepot: data.interac_autodepot,
          needs,
          selectedServiceId,
          province: metadata.province as string | undefined,
          isAdmin: finalRole === 'super_admin' || finalRole === 'sub_admin',
          createdAt: new Date(data.created_at).getTime(),
        });
      } else {
        setUserData({
          id: uid,
          email: email,
          role: 'client',
          isAdmin: false,
        } as UserData);
      }
    } catch (e) {
      console.error("Erreur critique de récupération de profil :", e);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserData(null);
  };

  return { 
    user, 
    userData, 
    loading, 
    logout, 
    isAuthenticated: !!user, 
    refreshProfile: () => user && fetchProfile(user.id, user.email!) 
  };
}
