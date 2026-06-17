import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ClientRecord } from '../types';
import { toast } from 'sonner';

const MOCK_CLIENTS: ClientRecord[] = [
  { id: 'mock_client_1', displayName: 'Samuel Tremblay', companyName: 'Tremblay Tech Inc.', status: 'Actif', documents: 8, lastActive: 'Il y a 5 min', email: 'samuel@tremblaytech.ca', needs: ['T2', 'Tenue de livres'] },
  { id: 'mock_client_2', displayName: 'Valérie Roy', companyName: 'Boutique Écolo Québec', status: 'Actif', documents: 15, lastActive: 'Il y a 2 heures', email: 'valerie@boutiqueecolo.ca', needs: ['TPS/TVQ', 'Tenue de livres'] },
  { id: 'mock_client_3', displayName: 'Marc-André Gagnon', companyName: 'Constructions Gagnon Ltée', status: 'En attente', documents: 3, lastActive: 'Hier', email: 'contact@constructionsgagnon.ca', needs: ['T2', 'Salaires'] }
];

export function useAdminClients(isAdmin: boolean) {
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      let isMock = false;
      let currentUserId = '';
      const localSession = localStorage.getItem('comptaflow_mock_session');
      if (localSession) {
        isMock = true;
      } else {
        try {
          const { data } = await supabase.auth.getSession();
          if (data.session?.user) {
            currentUserId = data.session.user.id;
            isMock = currentUserId.startsWith('mock_');
          } else {
            isMock = true;
          }
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
                combined.unshift(newC);
              }
            });
          } catch(e) {
            console.error(e);
          }
        }
        setClients(combined);
        return;
      }

      // Lire les profils de type client assignés à ce sub_admin (ou tous si super_admin)
      let profileQuery = supabase.from('profiles').select('*').eq('role', 'client');
      
      // Lire aussi la table clients (flat records)
      let clientsQuery = supabase.from('clients').select('*');

      // Vérifier le rôle de l'utilisateur pour appliquer l'isolation
      const { data: profileData } = await supabase.from('profiles').select('role').eq('id', currentUserId).single();
      const userRole = profileData?.role || 'client';

      if (userRole === 'sub_admin') {
        profileQuery = profileQuery.eq('sub_admin_id', currentUserId);
        clientsQuery = clientsQuery.eq('sub_admin_id', currentUserId);
      }

      const [profilesRes, clientsRes] = await Promise.all([profileQuery, clientsQuery]);

      if (profilesRes.error) throw profilesRes.error;
      if (clientsRes.error) throw clientsRes.error;

      // Fusionner les dossiers enregistrés dans la table `clients` et les profils utilisateurs
      const combinedList: ClientRecord[] = [];
      const seenEmails = new Set<string>();

      // 1. Ajouter les profils enregistrés
      (profilesRes.data || []).forEach((p: any) => {
        if (p.email) seenEmails.add(p.email.toLowerCase());
        combinedList.push({
          id: p.id,
          displayName: p.full_name || p.display_name || 'Sans Nom',
          companyName: p.company_name || 'Particulier (Utilisateur)',
          status: p.status || 'Actif',
          documents: 0,
          lastActive: 'Récemment',
          email: p.email,
          needs: p.needs || []
        });
      });

      // 2. Ajouter les fiches de la table `clients` (pour lesquelles le client n'a pas encore créé de profil, ou fiches CPA)
      (clientsRes.data || []).forEach((c: any) => {
        if (c.courriel && seenEmails.has(c.courriel.toLowerCase())) {
          // Déjà inclus via son profil utilisateur, on peut éventuellement enrichir l'entrée
          const existing = combinedList.find(item => item.email?.toLowerCase() === c.courriel.toLowerCase());
          if (existing) {
            existing.companyName = c.nom; // Préférer le nom de l'entreprise de la fiche
            existing.needs = [c.no_tps ? 'TPS' : '', c.no_tvq ? 'TVQ' : ''].filter(Boolean);
          }
          return;
        }
        
        combinedList.push({
          id: c.id,
          displayName: c.nom,
          companyName: c.nom,
          status: 'Fiche active',
          documents: 0,
          lastActive: 'Non connecté',
          email: c.courriel,
          needs: [c.no_tps ? 'TPS' : '', c.no_tvq ? 'TVQ' : ''].filter(Boolean)
        });
      });

      setClients(combinedList);
    } catch (e: any) {
      console.error("Erreur de récupération des clients :", e);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const addClient = async (newClient: Omit<ClientRecord, 'id' | 'documents' | 'lastActive'>) => {
    try {
      let isMock = false;
      let currentUserId = '';
      const localSession = localStorage.getItem('comptaflow_mock_session');
      if (localSession) {
        isMock = true;
      } else {
        try {
          const { data } = await supabase.auth.getSession();
          if (data.session?.user) {
            currentUserId = data.session.user.id;
            isMock = currentUserId.startsWith('mock_');
          } else {
            isMock = true;
          }
        } catch (err) {
          isMock = true;
        }
      }

      if (isMock) {
        const clientRecord: ClientRecord = {
          ...newClient,
          id: `client_${Date.now()}`,
          documents: 0,
          lastActive: "À l'instant"
        };
        const storedMockClientsStr = localStorage.getItem('comptaflow_mock_clients');
        let list = [];
        if (storedMockClientsStr) {
          try {
            list = JSON.parse(storedMockClientsStr);
          } catch(e) {}
        }
        list.push(clientRecord);
        localStorage.setItem('comptaflow_mock_clients', JSON.stringify(list));
        await fetchClients();
        toast.success("Nouveau client enregistré localement.");
        return true;
      }

      // Enregistrer dans la table `clients`
      const { error } = await supabase.from('clients').insert({
        sub_admin_id: currentUserId,
        nom: newClient.displayName,
        courriel: newClient.email,
        telephone: '',
        notes: newClient.companyName // utilise companyName comme notes ou descriptif
      });

      if (error) throw error;

      toast.success("Nouveau client créé dans la base du cabinet.");
      await fetchClients();
      return true;
    } catch (e: any) {
      console.error("Erreur lors de la création du client :", e);
      toast.error(e.message || "Erreur de création du client.");
      return false;
    }
  };

  useEffect(() => {
    fetchClients();
  }, [isAdmin]);

  return { clients, loading, refreshClients: fetchClients, addClient };
}
