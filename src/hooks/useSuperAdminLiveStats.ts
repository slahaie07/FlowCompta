import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface SuperAdminPartnerRow {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
  clientsCount: number;
  revenue: number;
}

export interface SuperAdminLiveStats {
  subAdminsCount: number;
  clientsCount: number;
  totalInvoices: number;
  pendingInvoices: number;
  paidInvoices: number;
  totalRevenue: number;
  pendingRevenue: number;
  byProvince: Record<string, number>;
  byService: Record<string, number>;
  partners: SuperAdminPartnerRow[];
  monthlyRevenue: { month: string; revenue: number }[];
}

const EMPTY_STATS: SuperAdminLiveStats = {
  subAdminsCount: 0,
  clientsCount: 0,
  totalInvoices: 0,
  pendingInvoices: 0,
  paidInvoices: 0,
  totalRevenue: 0,
  pendingRevenue: 0,
  byProvince: {},
  byService: {},
  partners: [],
  monthlyRevenue: [],
};

function computeStats(profiles: any[], invoices: any[]): SuperAdminLiveStats {
  const subAdminsList = profiles.filter((p) => p.role === 'sub_admin');
  const clientsList = profiles.filter((p) => p.role === 'client');

  let pendingInvoices = 0;
  let paidInvoices = 0;
  let totalRevenue = 0;
  let pendingRevenue = 0;

  const byProvince: Record<string, number> = {};
  const byService: Record<string, number> = {};

  clientsList.forEach((c) => {
    const province =
      typeof c.metadata?.province === 'string' && c.metadata.province
        ? c.metadata.province
        : '—';
    byProvince[province] = (byProvince[province] || 0) + 1;

    const needs = c.needs;
    if (needs && typeof needs === 'object' && !Array.isArray(needs)) {
      Object.entries(needs).forEach(([key, active]) => {
        if (active) byService[key] = (byService[key] || 0) + 1;
      });
    }
  });

  invoices.forEach((inv) => {
    const total = parseFloat(inv.montant_total || 0);
    if (inv.statut === 'payee') {
      paidInvoices += 1;
      totalRevenue += total;
    } else if (inv.statut !== 'annulee') {
      pendingInvoices += 1;
      pendingRevenue += total;
    }
  });

  const partners = subAdminsList.map((sa) => {
    const saClients = clientsList.filter((c) => c.sub_admin_id === sa.id).length;
    const saRevenue = invoices
      .filter((i) => i.sub_admin_id === sa.id && i.statut === 'payee')
      .reduce((sum, i) => sum + parseFloat(i.montant_total || 0), 0);

    return {
      id: sa.id,
      full_name: sa.full_name,
      email: sa.email,
      created_at: sa.created_at,
      clientsCount: saClients,
      revenue: saRevenue,
    };
  });

  const now = new Date();
  const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('fr-CA', { month: 'short', year: '2-digit' });
    const revenue = invoices
      .filter((inv) => inv.statut === 'payee' && inv.created_at?.startsWith(key))
      .reduce((sum: number, inv: any) => sum + parseFloat(inv.montant_total || 0), 0);
    return { month: label, revenue };
  });

  return {
    subAdminsCount: subAdminsList.length,
    clientsCount: clientsList.length,
    totalInvoices: invoices.length,
    pendingInvoices,
    paidInvoices,
    totalRevenue,
    pendingRevenue,
    byProvince,
    byService,
    partners,
    monthlyRevenue,
  };
}

export function useSuperAdminLiveStats(enabled = true) {
  const [stats, setStats] = useState<SuperAdminLiveStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [{ data: profiles, error: pError }, { data: invoices, error: invError }] =
        await Promise.all([
          supabase.from('profiles').select('id, role, full_name, email, created_at, sub_admin_id, metadata, needs'),
          supabase.from('invoices').select('montant_total, statut, sub_admin_id, created_at'),
        ]);

      if (pError) throw pError;
      if (invError) throw invError;

      setStats(computeStats(profiles || [], invoices || []));
    } catch (err) {
      console.error('SuperAdmin live stats error:', err);
      setStats(EMPTY_STATS);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    load();

    if (!enabled) return;

    const channel = supabase
      .channel('super_admin_live_stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, () => load())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, load]);

  return { stats, loading, refresh: load };
}
