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
        // 1. Get client count
        const { count: clientCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'client');

        // 2. Get total invoice amounts (Revenue)
        const { data: invoices } = await supabase
          .from('invoices')
          .select('amount')
          .eq('status', 'paid');
        
        const total = invoices?.reduce((acc, inv) => acc + Number(inv.amount), 0) || 0;

        // 3. Get recent global activity from ALL users
        const { data: recentLogs, error: logError } = await supabase
          .from('transactions')
          .select('*, profiles(display_name)')
          .order('date', { ascending: false })
          .limit(20);

        if (logError) console.error("Logs error:", logError);

        // 4. Get pending tasks (Real count)
        const { count: pendingInvoices } = await supabase
          .from('invoices')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');
        
        const { count: quarantineTransactions } = await supabase
          .from('transactions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'quarantine');

        setState({
          totalRevenue: total,
          pendingTasks: (pendingInvoices || 0) + (quarantineTransactions || 0),
          activeClients: clientCount || 0,
          globalTransactions: recentLogs || []
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
