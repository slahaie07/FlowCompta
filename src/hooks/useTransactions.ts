import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Transaction } from '../types';
import { toast } from 'sonner';

export function useTransactions(userId?: string, isAdmin: boolean = false) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();

    const channel = supabase
      .channel('transactions_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
        fetchTransactions();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId, isAdmin]);

  const fetchTransactions = async () => {
    try {
      let uid = '';
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) uid = data.session.user.id;

      const targetId = userId || uid;
      if (!targetId) { setTransactions([]); setLoading(false); return; }

      let query = supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!isAdmin) query = query.eq('user_id', targetId);

      const { data: dbData, error } = await query;
      if (error) throw error;

      // Map DB columns → Transaction type (handles both old and new schema)
      const mapped: Transaction[] = (dbData || []).map((t: any) => ({
        id: t.id,
        userId: t.user_id,
        type: t.type || 'purchase',
        amount: parseFloat(t.amount) || 0,
        description: t.description || t.label || '',
        date: t.date || (t.tx_date ? new Date(t.tx_date).getTime() : new Date(t.created_at).getTime()),
        status: t.status || 'pending',
        category: t.category || 'Général',
        context: (t.context as 'business' | 'personal') || 'business',
        aiConfidence: t.ai_confidence ?? undefined,
      }));

      setTransactions(mapped);
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

      const newTx = {
        user_id: uid,
        label: data.description,        // legacy column
        description: data.description,  // new column
        amount: data.amount,
        tx_date: new Date(data.date).toISOString().split('T')[0], // legacy column
        date: data.date,                // new column
        type: data.type,
        status: data.status || 'pending',
        category: data.category || 'Général',
        context: data.context || 'business',
      };

      const { error } = await supabase.from('transactions').insert(newTx);
      if (error) throw error;

      fetchTransactions();
    } catch (e) {
      console.error("Insert error:", e);
      toast.error("Erreur d'enregistrement.");
    }
  };

  return { transactions, loading, addTransaction };
}
