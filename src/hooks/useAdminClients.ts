import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ClientRecord } from '../types';

const MOCK_CLIENTS: ClientRecord[] = [
  { id: 'mock_client_1', displayName: 'Samuel Tremblay', companyName: 'Tremblay Tech Inc.', status: 'Actif', documents: 8, lastActive: 'Il y a 5 min', email: 'samuel@tremblaytech.ca', needs: ['T2', 'Tenue de livres'] },
  { id: 'mock_client_2', displayName: 'Valérie Roy', companyName: 'Boutique Écolo Québec', status: 'Actif', documents: 15, lastActive: 'Il y a 2 heures', email: 'valerie@boutiqueecolo.ca', needs: ['TPS/TVQ', 'Tenue de livres'] },
  { id: 'mock_client_3', displayName: 'Marc-André Gagnon', companyName: 'Constructions Gagnon Ltée', status: 'En attente', documents: 3, lastActive: 'Hier', email: 'contact@constructionsgagnon.ca', needs: ['T2', 'Salaires'] },
  { id: 'mock_client_4', displayName: 'Sophie Lavoie', companyName: 'Clinique Physio Santé', status: 'Actif', documents: 12, lastActive: 'Il y a 3 jours', email: 'sophie.lavoie@physiosante.ca', needs: ['T2', 'TPS/TVQ'] },
  { id: 'mock_client_5', displayName: 'Jean-Pierre Fortin', companyName: 'Fortin & Associés Consulting', status: 'Archivé', documents: 22, lastActive: 'Il y a 1 mois', email: 'jp@fortinconsulting.ca', needs: ['T2'] }
];

export function useAdminClients(isAdmin: boolean) {
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const isMock = !userData.user || userData.user.id.startsWith('mock_');

      if (isMock) {
        setClients(MOCK_CLIENTS);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'client');

      if (error) throw error;

      const mapped = (data || []).map((p: any) => ({
        id: p.id,
        displayName: p.display_name || p.displayName || 'Inconnu',
        companyName: p.company_name || p.companyName || 'Particulier',
        status: 'Actif',
        documents: p.id === 'mock_client_id' ? 4 : Math.floor(Math.random() * 10) + 1,
        lastActive: 'Récemment',
        email: p.email,
        needs: p.needs || []
      })) as ClientRecord[];

      setClients(mapped);
    } catch (e) {
      console.error(e);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [isAdmin]);

  return { clients, loading, refreshClients: fetchClients };
}
