import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Transaction } from '../types';
import { toast } from 'sonner';

export function useTransactions(userId?: string, isAdmin: boolean = false) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();

    // Real-time subscription
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
      let query = supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (!isAdmin) {
        const { data: { user } } = await supabase.auth.getUser();
        const targetId = userId || user?.id;

        if (!targetId) {
          setLoading(false);
          return;
        }
        query = query.eq('user_id', targetId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTransactions(data || []);
    } catch (e) {
      console.error("Transactions real-time error:", e);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (data: Omit<Transaction, 'id' | 'userId'>) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Auth required");
      
      const { error } = await supabase.from('transactions').insert({
        ...data,
        user_id: user.user.id
      });
      if (error) throw error;
    } catch (e) {
      console.error("Supabase insert error:", e);
      toast.error("Erreur d'enregistrement. Vérifiez que les tables SQL sont créées.");
    }
  };

  return { transactions, loading, addTransaction };
}
