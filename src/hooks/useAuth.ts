import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { UserData } from '../types';
import { CONFIG } from '../lib/config';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const getRoleFromEmail = (email: string): 'super_admin' | 'sub_admin' | 'client' => {
    const lowEmail = email.toLowerCase();
    if (CONFIG.APP.SUPER_ADMIN_EMAILS.some(e => e.toLowerCase() === lowEmail)) return 'super_admin';
    if (CONFIG.APP.SUB_ADMIN_EMAILS.some(e => e.toLowerCase() === lowEmail)) return 'sub_admin';
    return 'client';
  };

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
    const forcedRole = getRoleFromEmail(email);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();

      if (data) {
        const finalRole = forcedRole !== 'client' ? forcedRole : (data.role || 'client');
        setUserData({
          id: data.id || uid,
          fullName: data.full_name,
          displayName: data.full_name, // fallback for components
          email: email,
          role: finalRole as any,
          subAdminId: data.sub_admin_id,
          interacEmail: data.interac_email,
          interacQuestion: data.interac_question,
          interacAutodepot: data.interac_autodepot,
          isAdmin: finalRole === 'super_admin' || finalRole === 'sub_admin',
          createdAt: new Date(data.created_at).getTime()
        });
      } else {
        // Nouvel utilisateur sans profil
        setUserData({
          id: uid,
          email: email,
          role: forcedRole,
          isAdmin: forcedRole === 'super_admin' || forcedRole === 'sub_admin',
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
