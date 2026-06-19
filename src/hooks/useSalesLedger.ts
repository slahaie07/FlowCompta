import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export interface SaleEntry {
  id: string;
  invoiceId: string;
  clientName: string;
  serviceLabel: string;
  dateVente: string;
  montantHt: number;
  tps: number;
  tvq: number;
  montantTtc: number;
  feeType: string;
  fraisTraitement: number;
  revenuNet: number;
  interacReference: string | null;
}

export interface LedgerTotals {
  totalBrut: number;
  totalTps: number;
  totalTvq: number;
  totalTtc: number;
  totalFrais: number;
  totalNet: number;
  countVentes: number;
}

export function useSalesLedger() {
  const [sales, setSales] = useState<SaleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState<LedgerTotals>({
    totalBrut: 0, totalTps: 0, totalTvq: 0,
    totalTtc: 0, totalFrais: 0, totalNet: 0, countVentes: 0,
  });

  const mapSale = (row: any): SaleEntry => ({
    id: row.id,
    invoiceId: row.invoice_id,
    clientName: row.client_name || 'Client',
    serviceLabel: row.service_label || 'Service',
    dateVente: row.date_vente,
    montantHt: parseFloat(row.montant_ht) || 0,
    tps: parseFloat(row.tps) || 0,
    tvq: parseFloat(row.tvq) || 0,
    montantTtc: parseFloat(row.montant_ttc) || 0,
    feeType: row.fee_type || 'interac',
    fraisTraitement: parseFloat(row.frais_traitement) || 0,
    revenuNet: parseFloat(row.revenu_net) || 0,
    interacReference: row.interac_reference || null,
  });

  const computeTotals = (rows: SaleEntry[]): LedgerTotals => ({
    totalBrut:  rows.reduce((s, r) => s + r.montantHt, 0),
    totalTps:   rows.reduce((s, r) => s + r.tps, 0),
    totalTvq:   rows.reduce((s, r) => s + r.tvq, 0),
    totalTtc:   rows.reduce((s, r) => s + r.montantTtc, 0),
    totalFrais: rows.reduce((s, r) => s + r.fraisTraitement, 0),
    totalNet:   rows.reduce((s, r) => s + r.revenuNet, 0),
    countVentes: rows.length,
  });

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sales_ledger')
        .select('*')
        .order('date_vente', { ascending: false });

      if (error) throw error;

      const mapped = (data || []).map(mapSale);
      setSales(mapped);
      setTotals(computeTotals(mapped));
    } catch (e) {
      console.error('Sales ledger error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSales();

    // Real-time: écoute les nouvelles ventes capturées par le trigger DB
    const channel = supabase
      .channel('sales_ledger_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sales_ledger' }, (payload) => {
        const newSale = mapSale(payload.new);
        setSales(prev => {
          const updated = [newSale, ...prev];
          setTotals(computeTotals(updated));
          return updated;
        });
        // Alerte push admin — notification dorée non intrusive
        toast.success(
          `💰 Vente confirmée : ${newSale.clientName} — ${newSale.revenuNet.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $ net`,
          {
            duration: 8000,
            description: `Ref Interac : ${newSale.interacReference || 'Dépôt direct'} · Facture ${newSale.serviceLabel}`,
          }
        );
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // ─── Export CSV comptable ────────────────────────────────────────────────
  const exportCSV = () => {
    const headers = [
      'Date', 'Client', 'Facture', 'Montant HT ($)',
      'TPS ($)', 'TVQ ($)', 'Total TTC ($)',
      'Frais Traitement ($)', 'Revenu Net ($)', 'Référence Interac'
    ];
    const rows = sales.map(s => [
      new Date(s.dateVente).toLocaleDateString('fr-CA'),
      s.clientName,
      s.serviceLabel,
      s.montantHt.toFixed(2),
      s.tps.toFixed(2),
      s.tvq.toFixed(2),
      s.montantTtc.toFixed(2),
      s.fraisTraitement.toFixed(2),
      s.revenuNet.toFixed(2),
      s.interacReference || '',
    ]);

    // Ligne totaux
    rows.push([
      'TOTAUX', '', '',
      totals.totalBrut.toFixed(2),
      totals.totalTps.toFixed(2),
      totals.totalTvq.toFixed(2),
      totals.totalTtc.toFixed(2),
      totals.totalFrais.toFixed(2),
      totals.totalNet.toFixed(2),
      '',
    ]);

    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' }); // BOM pour Excel FR
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ComptaFlow_GrandLivre_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Export CSV généré — compatible Excel et ARC.');
  };

  // ─── Résumé fiscal trimestriel ───────────────────────────────────────────
  const getQuarterlySummary = () => {
    const now = new Date();
    const currentQ = Math.floor(now.getMonth() / 3);
    const quarters: Record<string, SaleEntry[]> = { Q1: [], Q2: [], Q3: [], Q4: [] };

    sales.forEach(s => {
      const d = new Date(s.dateVente);
      const q = Math.floor(d.getMonth() / 3);
      const key = `Q${q + 1}` as keyof typeof quarters;
      if (d.getFullYear() === now.getFullYear()) {
        quarters[key].push(s);
      }
    });

    return Object.entries(quarters).map(([quarter, entries]) => ({
      quarter,
      isCurrent: parseInt(quarter.replace('Q', '')) - 1 === currentQ,
      totalTtc: entries.reduce((s, r) => s + r.montantTtc, 0),
      taxesARemettreARC: entries.reduce((s, r) => s + r.tps, 0),
      taxesARemettreRQ: entries.reduce((s, r) => s + r.tvq, 0),
      revenuNet: entries.reduce((s, r) => s + r.revenuNet, 0),
      count: entries.length,
    }));
  };

  return { sales, loading, totals, exportCSV, getQuarterlySummary, refreshLedger: fetchSales };
}
