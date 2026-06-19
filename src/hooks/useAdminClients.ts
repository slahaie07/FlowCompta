import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ClientRecord } from '../types';
import { toast } from 'sonner';

export function useAdminClients(isAdmin: boolean) {
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    if (!isAdmin) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData?.session?.user?.id;

      if (!uid) { setClients([]); return; }

      const { data: profData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', uid)
        .single();
      const userRole = profData?.role || 'sub_admin';

      const combinedList: ClientRecord[] = [];
      const seenIds = new Set<string>();

      // 1. Load client PROFILES (auth users with role='client' assigned to this CPA)
      let profileQuery = supabase
        .from('profiles')
        .select('id, full_name, display_name, company_name, company, email, status, needs, role')
        .eq('role', 'client');

      if (userRole === 'sub_admin') {
        profileQuery = profileQuery.eq('sub_admin_id', uid);
      }

      const { data: profiles, error: pErr } = await profileQuery;
      if (pErr) console.warn("Profiles query:", pErr.message);

      (profiles || []).forEach((p: any) => {
        seenIds.add(p.id);
        combinedList.push({
          id: p.id,
          displayName: p.full_name || p.display_name || 'Sans Nom',
          companyName: p.company_name || p.company || 'Particulier',
          status: p.status || 'Actif',
          documents: 0,
          lastActive: 'Récemment',
          email: p.email,
          needs: Array.isArray(p.needs) ? p.needs : [],
        });
      });

      // 2. Load client RECORDS from `clients` table (CPA's own client directory)
      let clientsQuery = supabase
        .from('clients')
        .select('id, name, email, notes, status, needs, user_id, sub_admin_id');

      if (userRole === 'sub_admin') {
        // clients where this CPA is the owner
        clientsQuery = clientsQuery.or(`user_id.eq.${uid},sub_admin_id.eq.${uid}`);
      }

      const { data: clientRecords, error: cErr } = await clientsQuery;
      if (cErr) console.warn("Clients query:", cErr.message);

      (clientRecords || []).forEach((c: any) => {
        if (seenIds.has(c.id)) return; // already included via profiles
        seenIds.add(c.id);
        combinedList.push({
          id: c.id,
          displayName: c.name || 'Sans Nom',
          companyName: c.name || 'Particulier',
          status: c.status || 'Actif',
          documents: 0,
          lastActive: 'Non connecté',
          email: c.email,
          needs: Array.isArray(c.needs) ? c.needs : [],
        });
      });

      setClients(combinedList);
    } catch (e: any) {
      console.error("Erreur récupération clients:", e);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const addClient = async (newClient: Omit<ClientRecord, 'id' | 'documents' | 'lastActive'>): Promise<boolean> => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData?.session?.user?.id;
      if (!uid) throw new Error("Non authentifié.");

      const needsArray = Array.isArray(newClient.needs) ? newClient.needs : [];

      const { error } = await supabase.from('clients').insert({
        user_id: uid,
        sub_admin_id: uid,
        name: newClient.displayName,
        email: newClient.email || null,
        notes: newClient.companyName,
        status: newClient.status || 'En attente',
        needs: needsArray,
      });

      if (error) throw error;

      toast.success("Nouveau client enregistré dans le cabinet.");
      await fetchClients();
      return true;
    } catch (e: any) {
      console.error("Erreur création client:", e);
      toast.error(e.message || "Erreur de création du client.");
      return false;
    }
  };

  useEffect(() => {
    fetchClients();

    const channel = supabase
      .channel('clients_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => {
        fetchClients();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchClients();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isAdmin]);

  return { clients, loading, refreshClients: fetchClients, addClient };
}
