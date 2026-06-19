import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAdminHub() {
  const [stats, setState] = useState({
    totalRevenue: 0,
    pendingTasks: 0,
    activeClients: 0,
    globalTransactions: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData?.session?.user?.id;

      if (!uid) {
        // Demo data when not authenticated
        setState({
          totalRevenue: 5750,
          pendingTasks: 2,
          activeClients: 5,
          globalTransactions: [
            { id: '1', date: Date.now(), description: 'Facture Client — Tremblay Tech', amount: 4500, type: 'sale', status: 'reconciled', profiles: { display_name: 'Samuel Tremblay' } },
            { id: '2', date: Date.now() - 7200000, description: 'Abonnement Cloud Services', amount: 342.50, type: 'purchase', status: 'reconciled', profiles: { display_name: 'Valérie Roy' } },
            { id: '3', date: Date.now() - 86400000, description: 'Consultation Fiscale Elite', amount: 1250, type: 'sale', status: 'reconciled', profiles: { display_name: 'Marc-André Gagnon' } },
          ],
        });
        return;
      }

      const { data: myProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', uid)
        .single();
      const userRole = myProfile?.role || 'sub_admin';

      // 1. Client count
      let clientCountQuery = supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'client');
      if (userRole === 'sub_admin') {
        clientCountQuery = clientCountQuery.eq('sub_admin_id', uid);
      }
      const { count: clientCount } = await clientCountQuery;

      // 2. Revenue from paid invoices
      let invoiceQuery = supabase
        .from('invoices')
        .select('montant_total, total')
        .eq('statut', 'payee');
      if (userRole === 'sub_admin') {
        invoiceQuery = invoiceQuery.eq('sub_admin_id', uid);
      }
      const { data: paidInvoices } = await invoiceQuery;
      const total = (paidInvoices || []).reduce((acc, inv) => {
        return acc + parseFloat(inv.montant_total ?? inv.total ?? 0);
      }, 0);

      // 3. Pending invoice count
      let pendingQuery = supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .eq('statut', 'envoyee');
      if (userRole === 'sub_admin') {
        pendingQuery = pendingQuery.eq('sub_admin_id', uid);
      }
      const { count: pendingCount } = await pendingQuery;

      // 4. Recent transactions — fetch then join profiles separately
      const { data: recentTx } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      const txList = recentTx || [];
      const userIds = [...new Set(txList.map((t: any) => t.user_id).filter(Boolean))];

      let profileMap: Record<string, string> = {};
      if (userIds.length > 0) {
        const { data: txProfiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);
        profileMap = Object.fromEntries((txProfiles || []).map((p: any) => [p.id, p.full_name]));
      }

      const enrichedTx = txList.map((t: any) => ({
        ...t,
        description: t.description || t.label || '',
        date: t.date || new Date(t.created_at).getTime(),
        profiles: { display_name: profileMap[t.user_id] || 'Client' },
      }));

      setState({
        totalRevenue: total,
        pendingTasks: pendingCount || 0,
        activeClients: clientCount || 0,
        globalTransactions: enrichedTx,
      });
    } catch (e) {
      console.error("AdminHub error:", e);
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading };
}
