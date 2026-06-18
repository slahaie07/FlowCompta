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
      let uid = '';
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        uid = data.session.user.id;
      }

      const targetId = userId || uid;
      if (!targetId) {
        setTransactions([]);
        setLoading(false);
        return;
      }

      let query = supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (!isAdmin) query = query.eq('user_id', targetId);
      
      const { data: dbData, error } = await query;
      if (error) throw error;
      
      setTransactions(dbData || []);
    } catch (e) {
      console.error("Transactions error:", e);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (data: Omit<Transaction, 'id' | 'userId'>, targetUserId?: string) => {
    try {
      let uid = targetUserId;
      if (!uid) {
        const { data: sess } = await supabase.auth.getSession();
        uid = sess?.session?.user?.id;
      }

      if (!uid) throw new Error("Utilisateur non identifié.");
      
      const newTx = { ...data, user_id: uid };

      const { data: dbData, error } = await supabase.from('transactions').insert(newTx).select();
      if (error) throw error;
      
      // LIVE TRACKER ALERT
      try {
        await fetch('/api/webhook/transaction-alert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transactionId: dbData[0].id,
            amount: newTx.amount,
            vendor: newTx.description,
            date: new Date(newTx.date).toLocaleDateString(),
            type: newTx.type
          })
        });
      } catch(e) {
        console.warn("Live tracker alert failed");
      }

      fetchTransactions();
    } catch (e) {
      console.error("Insert error:", e);
      toast.error("Erreur d'enregistrement.");
    }
  };

  return { transactions, loading, addTransaction };
}
