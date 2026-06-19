import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Invoice } from '../types';
import { toast } from 'sonner';

export function useInvoices(userId?: string, isAdmin: boolean = false) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();

    // Real-time: refresh whenever invoices change
    const channel = supabase
      .channel('invoices_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, () => {
        fetchInvoices();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId, isAdmin]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const { data: sessData } = await supabase.auth.getSession();
      const uid = sessData?.session?.user?.id;
      if (!uid) { setInvoices([]); return; }

      const { data: prof } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', uid)
        .single();
      const userRole = prof?.role || 'client';

      // Join client profile via client_id → profiles.id (FK set in migration)
      let query = supabase
        .from('invoices')
        .select('*, client:profiles!invoices_client_profile_fkey(full_name, email)')
        .order('created_at', { ascending: false });

      if (userRole === 'super_admin') {
        // sees all
      } else if (userRole === 'sub_admin') {
        query = query.eq('sub_admin_id', uid);
      } else {
        // client sees their own invoices
        query = query.eq('client_id', uid);
      }

      if (userId && userRole !== 'client') {
        query = query.eq('client_id', userId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const mapped = (data || []).map((inv: any): Invoice => ({
        id: inv.id,
        number: inv.numero || inv.number || '',
        clientName: inv.client?.full_name || inv.client || 'Particulier',
        clientEmail: inv.client?.email || inv.client_email || '',
        amount: parseFloat(inv.montant_total ?? inv.total ?? inv.subtotal ?? 0) || 0,
        date: inv.date_emission
          ? new Date(inv.date_emission).getTime()
          : new Date(inv.inv_date || inv.created_at).getTime(),
        dueDate: inv.date_echeance ? new Date(inv.date_echeance).getTime() : 0,
        status: mapStatus(inv.statut ?? inv.status),
        userId: inv.client_id || inv.user_id,
        subAdminId: inv.sub_admin_id || inv.user_id,
        items: [],
        montantHt: parseFloat(inv.montant_ht ?? inv.subtotal ?? 0) || 0,
        tps: parseFloat(inv.tps ?? inv.gst ?? 0) || 0,
        tvq: parseFloat(inv.tvq ?? inv.qst ?? 0) || 0,
        montantTotal: parseFloat(inv.montant_total ?? inv.total ?? 0) || 0,
        clientADeclarePaye: inv.client_a_declare_paye ?? false,
        interacReference: inv.interac_reference ?? null,
        datePaiement: inv.date_paiement ?? null,
      }));

      setInvoices(mapped);
    } catch (e) {
      console.error("Erreur fetchInvoices:", e);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const mapStatus = (s: string): Invoice['status'] => {
    const STATUS_MAP: Record<string, Invoice['status']> = {
      payee: 'paid', paid: 'paid',
      envoyee: 'pending', pend: 'pending',
      brouillon: 'draft',
      annulee: 'cancelled',
      late: 'overdue',
    };
    return STATUS_MAP[s] ?? 'draft';
  };

  const addInvoice = async (data: Omit<Invoice, 'id' | 'userId'>, targetUserId?: string) => {
    try {
      if (!targetUserId) throw new Error("ID Client manquant.");

      const { data: sess } = await supabase.auth.getSession();
      const currentUserId = sess?.session?.user?.id;
      if (!currentUserId) throw new Error("Non authentifié.");

      const { error } = await supabase.from('invoices').insert({
        user_id: currentUserId,
        sub_admin_id: currentUserId,
        client_id: targetUserId,
        numero: data.number,
        montant_ht: data.amount,
        statut: 'brouillon',
        date_emission: new Date(data.date).toISOString().split('T')[0],
        date_echeance: data.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : null,
      });

      if (error) throw error;
      toast.success("Facture créée (TPS/TVQ calculées automatiquement).");
      fetchInvoices();
    } catch (e: any) {
      console.error("Erreur création facture:", e);
      toast.error(e.message || "Erreur de création.");
    }
  };

  const updateInvoiceStatus = async (invoiceId: string, status: string, interacRef?: string) => {
    try {
      const payload: any = { statut: status };
      if (status === 'payee') {
        payload.date_paiement = new Date().toISOString();
        if (interacRef) payload.interac_reference = interacRef;
      }

      const { error } = await supabase.from('invoices').update(payload).eq('id', invoiceId);
      if (error) throw error;
      toast.success("Facture mise à jour.");
      fetchInvoices();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Erreur de mise à jour.");
    }
  };

  const declarePaidByClient = async (invoiceId: string) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ client_a_declare_paye: true })
        .eq('id', invoiceId);
      if (error) throw error;

      try {
        await supabase.functions.invoke('notify-subadmin-payment', { body: { invoiceId } });
      } catch {
        console.warn("Notification comptable non envoyée.");
      }

      toast.success("Confirmation de paiement envoyée au comptable.");
      fetchInvoices();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Erreur.");
    }
  };

  return { invoices, loading, addInvoice, updateInvoiceStatus, declarePaidByClient, refreshInvoices: fetchInvoices };
}
