import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Transaction } from '../types';

export function useAdminHub() {
  const [stats, setState] = useState({
    totalRevenue: 0,
    pendingTasks: 0,
    activeClients: 0,
    globalTransactions: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAdminStats() {
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
          // Compute metrics from mock and local storage data
          const storedMockClientsStr = localStorage.getItem('comptaflow_mock_clients');
          let activeClientsCount = 5; // Base mock client count
          if (storedMockClientsStr) {
            try {
              const list = JSON.parse(storedMockClientsStr);
              activeClientsCount += list.length;
            } catch (e) {}
          }

          setState({
            totalRevenue: 5750, // 4500 (inv_1) + 1250 (inv_3 paid)
            pendingTasks: 2,
            activeClients: activeClientsCount,
            globalTransactions: [
              { id: 'tx_mock_1', date: Date.now(), description: 'Facture Client #1024 - Tremblay Tech', amount: 4500.00, type: 'sale', category: 'Revenus', status: 'reconciled', profiles: { display_name: 'Samuel Tremblay' } },
              { id: 'tx_mock_2', date: Date.now() - 3600000 * 2, description: 'Abonnement AWS Cloud Services', amount: 342.50, type: 'purchase', category: 'Hébergement', status: 'reconciled', profiles: { display_name: 'Valérie Roy' } },
              { id: 'tx_mock_3', date: Date.now() - 3600000 * 24, description: 'Consultation Fiscale Elite', amount: 1250.00, type: 'sale', category: 'Revenus', status: 'reconciled', profiles: { display_name: 'Marc-André Gagnon' } }
            ]
          });
          return;
        }

        // 1. Get current user session details
        const { data: sessionData } = await supabase.auth.getSession();
        const uid = sessionData?.session?.user?.id;

        if (!uid) {
          throw new Error("No active session found");
        }

        // 1. Get client count for this sub_admin
        const { count: clientCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'client')
          .eq('sub_admin_id', uid);

        // 2. Get total invoice amounts (Revenue) for this sub_admin
        const { data: invoices } = await supabase
          .from('invoices')
          .select('montant_total')
          .eq('sub_admin_id', uid)
          .eq('statut', 'payee');
        
        const total = invoices?.reduce((acc, inv) => acc + Number(inv.montant_total), 0) || 0;

        // 3. Get my clients profiles to filter transactions
        const { data: myClients } = await supabase
          .from('profiles')
          .select('id')
          .eq('sub_admin_id', uid);
        
        const clientIds = myClients?.map(c => c.id) || [];

        // 3. Get recent global activity from clients of this sub_admin
        let recentLogs: any[] = [];
        if (clientIds.length > 0) {
          const { data: logs, error: logError } = await supabase
            .from('transactions')
            .select('*, profiles(display_name)')
            .in('user_id', clientIds)
            .order('date', { ascending: false })
            .limit(20);
          
          if (logError) console.error("Logs error:", logError);
          recentLogs = logs || [];
        }

        // 4. Get pending tasks (Real count for this sub_admin)
        const { count: pendingInvoices } = await supabase
          .from('invoices')
          .select('*', { count: 'exact', head: true })
          .eq('sub_admin_id', uid)
          .eq('statut', 'envoyee');
        
        const { count: quarantineTransactions } = await supabase
          .from('transactions')
          .select('*', { count: 'exact', head: true })
          .in('user_id', clientIds.length > 0 ? clientIds : [uid])
          .eq('status', 'quarantine');

        setState({
          totalRevenue: total,
          pendingTasks: (pendingInvoices || 0) + (quarantineTransactions || 0),
          activeClients: clientCount || 0,
          globalTransactions: recentLogs
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchAdminStats();
  }, []);

  return { stats, loading };
}
