import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Invoice } from '../types';
import { communicationService } from '../lib/communication';
import { toast } from 'sonner';

import { internalApi } from '../lib/api';

export function useInvoices(userId?: string) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, [userId]);

  const fetchInvoices = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const targetId = userId || user?.id || (JSON.parse(localStorage.getItem('cf_user') || '{}').id);

      if (!targetId) {
        setLoading(false);
        return;
      }

      let data = [];
      // 1. Supabase
      try {
        const { data: supabaseData, error } = await supabase
          .from('invoices')
          .select('*')
          .eq('user_id', targetId)
          .order('date', { ascending: false });
        
        if (supabaseData && !error) data = supabaseData;
        else throw new Error("Supabase fail");
      } catch (e) {
        // 2. API Interne
        data = await internalApi.fetchInvoices(targetId);
      }
      
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
      const uid = userData.user?.id || (JSON.parse(localStorage.getItem('cf_user') || '{}').id);
      
      if (!uid) throw new Error("Non authentifié");

      const newInvoice = {
        ...data,
        user_id: uid
      };

      // 1. Supabase
      try {
        const { error } = await supabase.from('invoices').insert(newInvoice);
        if (error) throw error;
      } catch (e) {
        // 2. API Interne
        await internalApi.addInvoice(newInvoice);
      }

      await communicationService.notifyAdminOfInvoice(newInvoice);
      fetchInvoices();
    } catch (e) {
      console.error("Erreur réelle :", e);
      toast.error("Erreur de base de données.");
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
