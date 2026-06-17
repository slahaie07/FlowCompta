import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Card } from '../ui/Card';
import { DollarSign, Search, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { OrganicLoader } from '../ui/OrganicLoader';

export function SuperAdminInvoices() {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalHt: 0,
    totalTps: 0,
    totalTvq: 0,
    totalPaid: 0,
    totalPending: 0
  });

  useEffect(() => {
    async function loadInvoices() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('invoices')
          .select('*, client:profiles!client_id(full_name, email), sub_admin:profiles!sub_admin_id(full_name)')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setInvoices(data || []);

        // Calculer les stats globales
        let ht = 0, tps = 0, tvq = 0, paid = 0, pending = 0;
        (data || []).forEach((inv: any) => {
          const total = parseFloat(inv.montant_total || 0);
          ht += parseFloat(inv.montant_ht || 0);
          tps += parseFloat(inv.tps || 0);
          tvq += parseFloat(inv.tvq || 0);
          if (inv.statut === 'payee') {
            paid += total;
          } else {
            pending += total;
          }
        });

        setStats({
          totalHt: ht,
          totalTps: tps,
          totalTvq: tvq,
          totalPaid: paid,
          totalPending: pending
        });
      } catch (err) {
        console.error("Erreur lors de la récupération globale des factures :", err);
      } finally {
        setLoading(false);
      }
    }
    loadInvoices();
  }, []);

  const filteredInvoices = invoices.filter(i => {
    const query = searchQuery.toLowerCase();
    return (
      (i.numero || '').toLowerCase().includes(query) ||
      (i.client?.full_name || '').toLowerCase().includes(query) ||
      (i.sub_admin?.full_name || '').toLowerCase().includes(query) ||
      (i.statut || '').toLowerCase().includes(query)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'payee':
        return (
          <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-semibold w-fit">
            <CheckCircle2 size={12} /> Payée
          </span>
        );
      case 'envoyee':
        return (
          <span className="flex items-center gap-1.5 text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-semibold w-fit">
            <Clock size={12} /> Envoyée
          </span>
        );
      case 'annulee':
        return (
          <span className="flex items-center gap-1.5 text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full text-xs font-semibold w-fit">
            <XCircle size={12} /> Annulée
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 text-slate-400 bg-slate-500/10 border border-slate-500/20 px-3 py-1 rounded-full text-xs font-semibold w-fit">
            <Clock size={12} /> Brouillon
          </span>
        );
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-serif font-bold text-ivoire tracking-tight leading-tight">
            Registre <span className="animated-gradient-text italic">Global Factures.</span>
          </h1>
          <div className="flex items-center gap-3 mt-3">
            <span className="w-8 h-[1px] bg-gold/50"></span>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Audit global de la facturation et des taxes perçues (Lecture seule)</p>
          </div>
        </div>

        <div className="relative w-full md:w-[350px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Rechercher facture, client ou cabinet..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-gold/50 outline-none transition-all placeholder:text-slate-600 font-medium"
          />
        </div>
      </header>

      {/* Grid de taxes et totaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="p-6 space-y-2 glass-card">
          <p className="text-[9px] uppercase tracking-wider text-slate-500 font-black">Total Facturé HT</p>
          <p className="text-2xl font-serif font-bold text-ivoire">
            {stats.totalHt.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
          </p>
        </Card>
        <Card className="p-6 space-y-2 glass-card">
          <p className="text-[9px] uppercase tracking-wider text-slate-500 font-black">Total TPS perçu (5%)</p>
          <p className="text-2xl font-serif font-bold text-gold">
            {stats.totalTps.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
          </p>
        </Card>
        <Card className="p-6 space-y-2 glass-card">
          <p className="text-[9px] uppercase tracking-wider text-slate-500 font-black">Total TVQ perçu (9.975%)</p>
          <p className="text-2xl font-serif font-bold text-gold">
            {stats.totalTvq.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
          </p>
        </Card>
        <Card className="p-6 space-y-2 premium-border-gold" glow="gold">
          <p className="text-[9px] uppercase tracking-wider text-gold font-black">Total Encaissé</p>
          <p className="text-2xl font-serif font-bold text-gold">
            {stats.totalPaid.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
          </p>
        </Card>
        <Card className="p-6 space-y-2 glass-card">
          <p className="text-[9px] uppercase tracking-wider text-slate-500 font-black">Total En Attente</p>
          <p className="text-2xl font-serif font-bold text-slate-400">
            {stats.totalPending.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
          </p>
        </Card>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <OrganicLoader label="INV" size="sm" />
        </div>
      ) : (
        <Card className="p-0 overflow-hidden glass-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.03] text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 border-b border-white/5">
              <tr>
                <th className="px-8 py-6">Numéro</th>
                <th className="px-8 py-6">Client</th>
                <th className="px-8 py-6">Cabinet CPA</th>
                <th className="px-8 py-6 text-right">Sous-Total HT</th>
                <th className="px-8 py-6 text-right">TPS</th>
                <th className="px-8 py-6 text-right">TVQ</th>
                <th className="px-8 py-6 text-right">Total TTC</th>
                <th className="px-8 py-6 text-center">Statut</th>
                <th className="px-8 py-6 text-right">Date Émission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((i) => (
                  <tr key={i.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-8 py-6 font-mono text-sm font-bold text-ivoire">{i.numero}</td>
                    <td className="px-8 py-6 font-serif font-bold text-ivoire">{i.client?.full_name || 'Sans Nom'}</td>
                    <td className="px-8 py-6 text-slate-400 font-semibold text-xs">{i.sub_admin?.full_name || 'Cabinet'}</td>
                    <td className="px-8 py-6 text-right text-slate-400 font-mono text-xs">{parseFloat(i.montant_ht).toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</td>
                    <td className="px-8 py-6 text-right text-slate-500 font-mono text-xs">{parseFloat(i.tps).toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</td>
                    <td className="px-8 py-6 text-right text-slate-500 font-mono text-xs">{parseFloat(i.tvq).toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</td>
                    <td className="px-8 py-6 text-right font-serif font-bold text-gold">{parseFloat(i.montant_total).toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</td>
                    <td className="px-8 py-6 text-center">{getStatusBadge(i.statut)}</td>
                    <td className="px-8 py-6 text-right text-slate-500 text-xs">{new Date(i.date_emission).toLocaleDateString('fr-CA')}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-8 py-12 text-center text-slate-500 italic">
                    Aucune facture enregistrée pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
