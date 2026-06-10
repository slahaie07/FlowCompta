import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ClientRecord } from '../types';

import { internalApi } from '../lib/api';

export function useAdminClients(isAdmin: boolean) {
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      let data = [];
      // 1. Supabase
      try {
        const { data: supabaseData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'client');

        if (supabaseData && !error) data = supabaseData;
        else throw new Error("Supabase fail");
      } catch (e) {
        // 2. API Interne
        data = await internalApi.fetchAdminClients();
      }

      const mapped = data.map((p: any) => ({
        id: p.id,
        displayName: p.display_name || p.displayName || 'Inconnu',
        companyName: p.company_name || p.companyName || 'Particulier',
        status: 'Actif',
        documents: 0,
        lastActive: 'Récemment',
        email: p.email
      })) as ClientRecord[];

      setClients(mapped);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [isAdmin]);

  return { clients, loading, refreshClients: fetchClients };
}
