import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Transaction } from '../types';
import { toast } from 'sonner';

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'tx_1', userId: 'mock_client_id', date: '2026-06-12', description: 'Facture Client #1024 - Tremblay Tech', amount: 4500.00, type: 'credit', category: 'Revenus d\'entreprise' },
  { id: 'tx_2', userId: 'mock_client_id', date: '2026-06-11', description: 'Abonnement AWS Cloud Services', amount: -342.50, type: 'debit', category: 'Hébergement & Cloud' },
  { id: 'tx_3', userId: 'mock_client_id', date: '2026-06-10', description: 'Stripe Payout - Tremblay Tech Inc.', amount: 8200.00, type: 'credit', category: 'Revenus d\'entreprise' },
  { id: 'tx_4', userId: 'mock_client_id', date: '2026-06-08', description: 'Frais de Cabinet - ComptaFlow Elite', amount: -249.00, type: 'debit', category: 'Honoraires professionnels' },
  { id: 'tx_5', userId: 'mock_client_id', date: '2026-06-05', description: 'Déplacement Client - Uber Québec', amount: -42.80, type: 'debit', category: 'Transport & Déplacements' },
  { id: 'tx_6', userId: 'mock_client_id', date: '2026-06-02', description: 'Abonnement GitHub Enterprise', amount: -99.00, type: 'debit', category: 'Logiciels & SaaS' },
  { id: 'tx_7', userId: 'mock_client_id', date: '2026-05-30', description: 'Restauration Affaires - Le Saint-Amour', amount: -185.40, type: 'debit', category: 'Repas & Représentation' }
];

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
      const { data: { user } } = await supabase.auth.getUser();
      const targetId = userId || user?.id;
      const isMock = !targetId || targetId.startsWith('mock_');

      if (isMock) {
        setTransactions(MOCK_TRANSACTIONS);
        setLoading(false);
        return;
      }

      let query = supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (!isAdmin) query = query.eq('user_id', targetId);
      
      const { data, error } = await query;
      if (error) throw error;
      
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
      const uid = user.user?.id || 'mock_client_id';
      const isMock = uid.startsWith('mock_');
      
      const newTx = { ...data, user_id: uid };

      if (isMock) {
        const localNew: Transaction = {
          id: 'tx_' + Date.now(),
          userId: uid,
          ...data
        };
        setTransactions(prev => [localNew, ...prev]);
        toast.success("Transaction enregistrée en mode Démo.");
        return;
      }

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
