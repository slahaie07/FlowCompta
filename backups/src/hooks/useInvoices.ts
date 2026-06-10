import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Invoice } from '../types';
import { communicationService } from '../lib/communication';
import { toast } from 'sonner';

export function useInvoices(userId?: string) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, [userId]);

  const fetchInvoices = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const targetId = userId || user?.id;

      if (!targetId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', targetId)
        .order('date', { ascending: false });
      
      if (error) throw error;
      setInvoices(data || []);
    } catch (e) {
      console.error(e);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const addInvoice = async (data: Omit<Invoice, 'id' | 'userId'>) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Non authentifié");

      const newInvoice = {
        ...data,
        user_id: userData.user.id
      };

      const { error } = await supabase.from('invoices').insert(newInvoice);
      if (error) throw error;

      await communicationService.notifyAdminOfInvoice(newInvoice);
      
      fetchInvoices();
    } catch (e) {
      console.error("Erreur réelle Supabase :", e);
      toast.error("Erreur de base de données. Assurez-vous d'avoir exécuté le script SQL.");
    }
  };

  const updateInvoiceStatus = async (invoiceId: string, status: Invoice['status']) => {
    try {
      const { error } = await supabase.from('invoices').update({ status }).eq('id', invoiceId);
      if (error) throw error;
      fetchInvoices();
    } catch (e) {
      console.error(e);
    }
  };

  return { invoices, loading, addInvoice, updateInvoiceStatus };
}
