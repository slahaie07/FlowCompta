import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Invoice } from '../types';
import { toast } from 'sonner';

export function useInvoices(userId?: string, isAdmin: boolean = false) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, [userId, isAdmin]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      let uid = '';
      let userRole = 'client';

      const { data: sessData } = await supabase.auth.getSession();
      if (sessData?.session?.user) {
        uid = sessData.session.user.id;
        
        // Get user role
        const { data: prof } = await supabase.from('profiles').select('role').eq('id', uid).single();
        userRole = prof?.role || 'client';
      }

      if (!uid) {
        setInvoices([]);
        return;
      }

      let query = supabase
        .from('invoices')
        .select('*, client:profiles!client_id(full_name, email)')
        .order('created_at', { ascending: false });

      // Filtrer selon le rôle pour isolation totale
      if (userRole === 'super_admin') {
        // Super admin voit tout
      } else if (userRole === 'sub_admin') {
        // Sub admin voit seulement les factures de ses clients
        query = query.eq('sub_admin_id', uid);
      } else {
        // Client voit seulement ses factures
        query = query.eq('client_id', uid);
      }

      // Filtre optionnel par client spécifique
      if (userId) {
        query = query.eq('client_id', userId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      const mapped = (data || []).map((inv: any) => ({
        id: inv.id,
        number: inv.numero,
        clientName: inv.client?.full_name || 'Particulier',
        amount: parseFloat(inv.montant_total),
        date: new Date(inv.date_emission).getTime(),
        dueDate: inv.date_echeance ? new Date(inv.date_echeance).getTime() : 0,
        status: mapStatusToFront(inv.statut),
        userId: inv.client_id,
        items: [],
        montantHt: parseFloat(inv.montant_ht),
        tps: parseFloat(inv.tps),
        tvq: parseFloat(inv.tvq),
        montantTotal: parseFloat(inv.montant_total),
        clientADeclarePaye: inv.client_a_declare_paye,
        interacReference: inv.interac_reference,
        datePaiement: inv.date_paiement,
        subAdminId: inv.sub_admin_id
      })) as Invoice[];

      setInvoices(mapped);
    } catch (e) {
      console.error("Erreur fetchInvoices:", e);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const mapStatusToFront = (dbStatus: string): Invoice['status'] => {
    if (dbStatus === 'payee') return 'paid';
    if (dbStatus === 'envoyee') return 'pending';
    if (dbStatus === 'brouillon') return 'draft';
    return 'overdue';
  };

  const addInvoice = async (data: Omit<Invoice, 'id' | 'userId'>, targetUserId?: string) => {
    try {
      if (!targetUserId) throw new Error("ID Client manquant.");

      let currentUserId = '';
      const { data: sess } = await supabase.auth.getSession();
      if (sess?.session?.user) {
        currentUserId = sess.session.user.id;
      }

      if (!currentUserId) throw new Error("Non authentifié.");

      const newInvoice = {
        sub_admin_id: currentUserId,
        client_id: targetUserId,
        numero: data.number,
        montant_ht: data.amount, // montant HT saisi
        statut: 'brouillon',
        date_emission: new Date(data.date).toISOString().split('T')[0],
        date_echeance: data.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : null
      };

      const { error } = await supabase.from('invoices').insert(newInvoice);
      if (error) throw error;

      toast.success("Facture créée avec succès (Taxes calculées automatiquement).");
      fetchInvoices();
    } catch (e: any) {
      console.error("Erreur lors de la création de facture :", e);
      toast.error(e.message || "Erreur de création de facture.");
    }
  };

  const updateInvoiceStatus = async (invoiceId: string, status: string, interacRef?: string) => {
    try {
      const updatePayload: any = { statut: status };
      if (status === 'payee') {
        updatePayload.date_paiement = new Date().toISOString();
        if (interacRef) updatePayload.interac_reference = interacRef;
      }

      const { error } = await supabase.from('invoices').update(updatePayload).eq('id', invoiceId);
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
      toast.success("Confirmation de paiement envoyée au comptable.");
      fetchInvoices();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Erreur lors de la mise à jour.");
    }
  };

  return { invoices, loading, addInvoice, updateInvoiceStatus, declarePaidByClient, refreshInvoices: fetchInvoices };
}
