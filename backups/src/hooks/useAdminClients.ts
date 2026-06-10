import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ClientRecord } from '../types';

export function useAdminClients(isAdmin: boolean) {
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'client');

      if (error) throw error;

      const mapped = data.map(p => ({
        id: p.id,
        displayName: p.display_name || 'Inconnu',
        companyName: p.company_name || 'Particulier',
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
