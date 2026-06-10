import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Transaction } from '../types';
import { toast } from 'sonner';

import { internalApi } from '../lib/api';

export function useTransactions(userId?: string, isAdmin: boolean = false) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();

    // Real-time subscription (Supabase only)
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
        fetchTransactions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, isAdmin]);

  const fetchTransactions = async () => {
    try {
      let data = [];
      const { data: { user } } = await supabase.auth.getUser();
      const targetId = userId || user?.id || (JSON.parse(localStorage.getItem('cf_user') || '{}').id);

      if (!isAdmin && !targetId) {
        setLoading(false);
        return;
      }

      // 1. Tentative Supabase
      try {
        let query = supabase
          .from('transactions')
          .select('*')
          .order('date', { ascending: false });

        if (!isAdmin) query = query.eq('user_id', targetId);
        
        const { data: supabaseData, error } = await query;
        if (supabaseData && !error) data = supabaseData;
        else throw new Error("Supabase fail");
      } catch (e) {
        // 2. Fallback API Interne
        data = await internalApi.fetchTransactions(targetId, isAdmin);
      }

      setTransactions(data || []);
    } catch (e) {
      console.error("Transactions error:", e);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (data: Omit<Transaction, 'id' | 'userId'>) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      const uid = user.user?.id || (JSON.parse(localStorage.getItem('cf_user') || '{}').id);
      
      if (!uid) throw new Error("Auth required");
      
      const newTx = { ...data, user_id: uid };

      // 1. Supabase
      try {
        const { error } = await supabase.from('transactions').insert(newTx);
        if (error) throw error;
      } catch (e) {
        // 2. API Interne
        await internalApi.addTransaction(newTx);
      }
      
      fetchTransactions();
    } catch (e) {
      console.error("Insert error:", e);
      toast.error("Erreur d'enregistrement.");
    }
  };

  return { transactions, loading, addTransaction };
}
