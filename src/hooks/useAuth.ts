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
    // Toujours en mode « arrière-plan » : un rafraîchissement de jeton ou un
    // retour au premier plan ne doit JAMAIS repasser l'app en chargement,
    // sinon App.tsx démonte tout l'arbre et la page perd sa position de
    // défilement (retour instantané en haut de page sur mobile).
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id, session.user.email!, true);
      } else {
        setUser(null);
        setUserData(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (uid: string, email: string, background = false) => {
    if (!background) setLoading(true);

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

        // Province : la source normale est profiles.metadata.province. Si
        // elle est absente (écart de schéma côté production — voir
        // handleOnboardingComplete dans App.tsx), on retombe sur les
        // métadonnées du compte Auth, où l'onboarding écrit aussi la
        // province : sans ce repli, la porte de complétion du profil ne
        // pourrait jamais s'ouvrir pour un client.
        let province = metadata.province as string | undefined;
        if (!province) {
          try {
            const { data: authData } = await supabase.auth.getUser();
            province =
              (authData.user?.user_metadata?.province as string | undefined) || undefined;
          } catch {
            /* repli silencieux : la province reste indéfinie */
          }
        }
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
          province,
          isAdmin: finalRole === 'super_admin' || finalRole === 'sub_admin',
          createdAt: new Date(data.created_at).getTime(),
        });
      } else {
        // Aucune ligne profiles pour ce compte (déclencheur d'inscription
        // absent ou fautif côté base — cas prouvé en production à l'étape 3
        // du diagnostic portail). Avant ce correctif, on retombait sur un
        // userData vide (ni nom, ni province) et le repli métadonnées Auth
        // ci-dessus ne servait jamais : il est DANS la branche « ligne
        // présente ». On lit donc ici les métadonnées Auth — nom inscrit à
        // l'inscription, province écrite par le filet de l'onboarding —
        // pour que la porte de complétion s'évalue sur des données réelles.
        let authMeta: Record<string, any> = {};
        try {
          const { data: authData } = await supabase.auth.getUser();
          authMeta = (authData.user?.user_metadata as Record<string, any>) || {};
        } catch {
          /* repli silencieux : métadonnées Auth illisibles */
        }
        setUserData({
          id: uid,
          email: email,
          fullName: authMeta.full_name || authMeta.display_name || authMeta.name,
          displayName: authMeta.display_name || authMeta.full_name || authMeta.name,
          province: authMeta.province as string | undefined,
          role: 'client',
          isAdmin: false,
        } as UserData);
      }
    } catch (e) {
      console.error("Erreur critique de récupération de profil :", e);
    } finally {
      if (!background) setLoading(false);
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
