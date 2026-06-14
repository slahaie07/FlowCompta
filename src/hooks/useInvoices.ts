import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Invoice } from '../types';
import { communicationService } from '../lib/communication';
import { toast } from 'sonner';

const MOCK_INVOICES: Invoice[] = [
  { id: 'inv_1', userId: 'mock_client_id', date: new Date('2026-06-01').getTime(), dueDate: new Date('2026-07-01').getTime(), clientName: 'Tremblay Tech Inc.', number: 'INV-2026-001', amount: 4500.00, status: 'paid', items: [] },
  { id: 'inv_2', userId: 'mock_client_id', date: new Date('2026-06-08').getTime(), dueDate: new Date('2026-07-08').getTime(), clientName: 'Tremblay Tech Inc.', number: 'INV-2026-002', amount: 249.00, status: 'pending', items: [] },
  { id: 'inv_3', userId: 'mock_client_id', date: new Date('2026-05-15').getTime(), dueDate: new Date('2026-06-15').getTime(), clientName: 'Tremblay Tech Inc.', number: 'INV-2025-098', amount: 1250.00, status: 'overdue', items: [] }
];

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
      const isMock = !targetId || targetId.startsWith('mock_');

      if (isMock) {
        setInvoices(MOCK_INVOICES);
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
      const uid = userData.user?.id || 'mock_client_id';
      const isMock = uid.startsWith('mock_');

      const newInvoice = {
        ...data,
        user_id: uid
      };

      if (isMock) {
        const localNew: Invoice = {
          id: 'inv_' + Date.now(),
          userId: uid,
          ...data
        };
        setInvoices(prev => [localNew, ...prev]);
        toast.success("Facture enregistrée en mode Démo.");
        return;
      }

      const { error } = await supabase.from('invoices').insert(newInvoice);
      if (error) throw error;

      await communicationService.notifyAdminOfInvoice(newInvoice as any);
      fetchInvoices();
    } catch (e) {
      console.error("Erreur réelle :", e);
      toast.error("Erreur de base de données.");
    }
  };

  const updateInvoiceStatus = async (invoiceId: string, status: Invoice['status']) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id || 'mock_client_id';
      const isMock = uid.startsWith('mock_');

      if (isMock) {
        setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, status } : inv));
        return;
      }

      const { error } = await supabase.from('invoices').update({ status }).eq('id', invoiceId);
      if (error) throw error;
      fetchInvoices();
    } catch (e) {
      console.error(e);
    }
  };

  return { invoices, loading, addInvoice, updateInvoiceStatus };
}
