import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ClientRecord } from '../types';
import { toast } from 'sonner';

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
      let isMock = false;
      const localSession = localStorage.getItem('comptaflow_mock_session');
      if (localSession) {
        isMock = true;
      } else {
        try {
          const { data } = await supabase.auth.getSession();
          isMock = !data.session?.user || data.session.user.id.startsWith('mock_');
        } catch (err) {
          isMock = true;
        }
      }

      if (isMock) {
        const storedMockClientsStr = localStorage.getItem('comptaflow_mock_clients');
        let combined = [...MOCK_CLIENTS];
        if (storedMockClientsStr) {
          try {
            const storedMockClients = JSON.parse(storedMockClientsStr);
            storedMockClients.forEach((newC: ClientRecord) => {
              const idx = combined.findIndex(c => c.email === newC.email);
              if (idx >= 0) {
                combined[idx] = newC;
              } else {
                combined.unshift(newC); // New clients at top
              }
            });
          } catch(e) {
            console.error(e);
          }
        }
        setClients(combined);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'client');

      if (error) throw error;

      // Fetch actual document counts for each client
      const { data: docsData } = await supabase
        .from('documents')
        .select('id, user_id');

      const docCounts = (docsData || []).reduce((acc: Record<string, number>, doc: any) => {
        acc[doc.user_id] = (acc[doc.user_id] || 0) + 1;
        return acc;
      }, {});

      const mapped = (data || []).map((p: any) => ({
        id: p.id,
        displayName: p.display_name || p.displayName || 'Inconnu',
        companyName: p.company_name || p.companyName || 'Particulier',
        status: p.status || 'Actif',
        documents: p.id === 'mock_client_id' ? 4 : (docCounts[p.id] || 0),
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

  const addClient = async (newClient: Omit<ClientRecord, 'id' | 'documents' | 'lastActive'>) => {
    const clientId = `client_${Date.now()}`;
    const clientRecord: ClientRecord = {
      ...newClient,
      id: clientId,
      documents: 0,
      lastActive: 'À l\'instant'
    };

    // Check if mock
    let isMock = false;
    const localSession = localStorage.getItem('comptaflow_mock_session');
    if (localSession) {
      isMock = true;
    } else {
      try {
        const { data } = await supabase.auth.getSession();
        isMock = !data.session?.user || data.session.user.id.startsWith('mock_');
      } catch (err) {
        isMock = true;
      }
    }

    if (isMock) {
      const storedMockClientsStr = localStorage.getItem('comptaflow_mock_clients');
      let list = [];
      if (storedMockClientsStr) {
        try {
          list = JSON.parse(storedMockClientsStr);
        } catch(e) {
          console.error(e);
        }
      }
      list.push(clientRecord);
      localStorage.setItem('comptaflow_mock_clients', JSON.stringify(list));
      await fetchClients();
      toast.success("Nouveau client enregistré localement (Mémoire active).");
      return true;
    } else {
      const { error } = await supabase.from('profiles').insert({
        id: clientId,
        display_name: newClient.displayName,
        company_name: newClient.companyName,
        email: newClient.email,
        role: 'client',
        needs: newClient.needs,
        status: newClient.status
      });

      if (error) {
        toast.error("Erreur de création du client.");
        return false;
      }
      toast.success("Nouveau client créé dans Supabase.");
      await fetchClients();
      return true;
    }
  };

  useEffect(() => {
    fetchClients();
  }, [isAdmin]);

  return { clients, loading, refreshClients: fetchClients, addClient };
}
