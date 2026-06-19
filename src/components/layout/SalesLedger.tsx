import { useState, useMemo, useEffect } from 'react';
import { Download, TrendingUp, Receipt, RefreshCw, AlertCircle, ChevronDown, ChevronUp, Filter, Calendar, Hash, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSalesLedger } from '../../hooks/useSalesLedger';
import { supabase } from '../../lib/supabase';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { OrganicLoader } from '../ui/OrganicLoader';

const fmt = (n: number) => n.toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const FEE_LABELS: Record<string, string> = {
  interac: 'Interac (0%)',
  stripe: 'Stripe (2.9%+0.30$)',
  paypal: 'PayPal (3.49%+0.49$)',
  custom: 'Personnalisé',
};

const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

export function SalesLedger() {
  const { sales, loading, totals, exportCSV, getQuarterlySummary, refreshLedger } = useSalesLedger();
  const [showQuarterly, setShowQuarterly] = useState(false);
  const [filterClient, setFilterClient] = useState('');
  const [filterMonth, setFilterMonth] = useState<string>('');
  const [filterYear, setFilterYear] = useState<string>(new Date().getFullYear().toString());
  const [filterSubAdmin, setFilterSubAdmin] = useState<string>('');
  const [subAdmins, setSubAdmins] = useState<{ id: string; name: string }[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [sortField, setSortField] = useState<'dateVente' | 'revenuNet' | 'montantTtc'>('dateVente');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Détection super_admin + chargement de la liste des comptables
  useEffect(() => {
    async function checkRole() {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess?.session?.user?.id;
      if (!uid) return;
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', uid).single();
      if (profile?.role === 'super_admin') {
        setIsSuperAdmin(true);
        const { data: sas } = await supabase
          .from('profiles')
          .select('id, full_name, display_name, email')
          .eq('role', 'sub_admin');
        setSubAdmins((sas || []).map((s: any) => ({
          id: s.id,
          name: s.full_name || s.display_name || s.email || 'Comptable'
        })));
      }
    }
    checkRole();
  }, []);

  const quarterly = useMemo(() => getQuarterlySummary(), [sales]);

  // Available years derived from data
  const availableYears = useMemo(() => {
    const years = new Set(sales.map(s => new Date(s.dateVente).getFullYear().toString()));
    years.add(new Date().getFullYear().toString());
    return [...years].sort((a, b) => Number(b) - Number(a));
  }, [sales]);

  const filtered = useMemo(() => {
    let rows = [...sales];
    if (filterClient.trim()) {
      const q = filterClient.toLowerCase();
      rows = rows.filter(s => s.clientName.toLowerCase().includes(q) || s.serviceLabel.toLowerCase().includes(q));
    }
    if (filterYear) {
      rows = rows.filter(s => new Date(s.dateVente).getFullYear().toString() === filterYear);
    }
    if (filterMonth) {
      rows = rows.filter(s => new Date(s.dateVente).getMonth().toString() === filterMonth);
    }
    if (filterSubAdmin) {
      rows = rows.filter(s => s.subAdminId === filterSubAdmin);
    }
    rows.sort((a, b) => {
      const av = sortField === 'dateVente' ? new Date(a.dateVente).getTime() : a[sortField];
      const bv = sortField === 'dateVente' ? new Date(b.dateVente).getTime() : b[sortField];
      return sortDir === 'desc' ? (bv as number) - (av as number) : (av as number) - (bv as number);
    });
    return rows;
  }, [sales, filterClient, filterMonth, filterYear, filterSubAdmin, sortField, sortDir]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const SortIcon = ({ field }: { field: typeof sortField }) =>
    sortField === field
      ? (sortDir === 'desc' ? <ChevronDown size={12} className="text-gold" /> : <ChevronUp size={12} className="text-gold" />)
      : <ChevronDown size={12} className="text-slate-600" />;

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-8">
      <OrganicLoader label="GL" size="sm" />
      <p className="text-slate-500 font-serif italic text-lg animate-pulse">Chargement du grand livre...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-20 md:pb-10">

      {/* En-tête */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-ivoire tracking-tight leading-tight">
            Grand Livre <span className="animated-gradient-text italic">des Ventes.</span>
          </h1>
          <div className="flex items-center gap-3 mt-3">
            <span className="w-8 h-[1px] bg-gold/50"></span>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">
              Capture automatique · Moteur TPS/TVQ · Admin exclusif
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={refreshLedger} className="gap-2 text-[10px] font-black uppercase tracking-widest h-10">
            <RefreshCw size={14} /> Actualiser
          </Button>
          <Button variant="gold" size="sm" onClick={exportCSV} className="gap-2 text-[10px] font-black uppercase tracking-widest h-10 shadow-glow">
            <Download size={14} /> Export CSV · ARC
          </Button>
        </div>
      </header>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: 'Ventes totales', value: totals.countVentes.toString(), unit: '', color: 'text-ivoire', icon: Receipt },
          { label: 'Chiffre d\'affaires HT', value: fmt(totals.totalBrut), unit: '$', color: 'text-ivoire', icon: TrendingUp },
          { label: 'TPS collectée', value: fmt(totals.totalTps), unit: '$', color: 'text-amber-400', icon: AlertCircle },
          { label: 'TVQ collectée', value: fmt(totals.totalTvq), unit: '$', color: 'text-amber-400', icon: AlertCircle },
          { label: 'Frais traitement', value: fmt(totals.totalFrais), unit: '$', color: 'text-red-400', icon: Receipt },
          { label: 'Revenu net réel', value: fmt(totals.totalNet), unit: '$', color: 'text-gold', icon: TrendingUp },
        ].map((kpi, i) => (
          <Card key={i} className={`p-5 glass-card relative overflow-hidden ${kpi.label === 'Revenu net réel' ? 'premium-border-gold' : ''}`} glow={kpi.label === 'Revenu net réel' ? 'gold' : undefined}>
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 leading-tight">{kpi.label}</div>
            <div className={`text-xl md:text-2xl font-serif font-bold ${kpi.color}`}>
              {kpi.value}{kpi.unit && <span className="text-sm ml-1">{kpi.unit}</span>}
            </div>
          </Card>
        ))}
      </div>

      {/* ── Bannière vue par cabinet (super_admin) ── */}
      {isSuperAdmin && filterSubAdmin && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gold/5 border border-gold/20 rounded-2xl flex items-center gap-4">
          <Shield size={16} className="text-gold shrink-0" />
          <div>
            <span className="text-[10px] font-black text-gold uppercase tracking-widest">Vue filtrée — Cabinet :</span>
            <span className="text-sm text-ivoire font-bold ml-2">
              {subAdmins.find(s => s.id === filterSubAdmin)?.name}
            </span>
          </div>
          <button onClick={() => setFilterSubAdmin('')} className="ml-auto text-[10px] text-slate-500 hover:text-gold font-black uppercase tracking-widest">
            Voir tous
          </button>
        </motion.div>
      )}

      {/* ── Alerte taxes à remettre ── */}
      {(totals.totalTps + totals.totalTvq) > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="p-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-4">
          <AlertCircle size={20} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-400 font-black text-sm">Rappel fiscal — Taxes à remettre</p>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">
              TPS à remettre à l'ARC : <strong className="text-ivoire">{fmt(totals.totalTps)} $</strong>
              &nbsp;·&nbsp; TVQ à remettre à Revenu Québec : <strong className="text-ivoire">{fmt(totals.totalTvq)} $</strong>
              &nbsp;·&nbsp; Total obligations fiscales : <strong className="text-amber-400">{fmt(totals.totalTps + totals.totalTvq)} $</strong>
            </p>
          </div>
        </motion.div>
      )}

      {/* ── Résumé trimestriel (toggle) ── */}
      <div>
        <button
          onClick={() => setShowQuarterly(v => !v)}
          className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-gold transition-colors"
        >
          <span className={`transition-transform duration-300 ${showQuarterly ? 'rotate-180' : ''}`}><ChevronDown size={16} /></span>
          Résumé fiscal trimestriel {new Date().getFullYear()}
        </button>

        <AnimatePresence>
          {showQuarterly && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quarterly.map(q => (
                  <Card key={q.quarter} className={`p-5 space-y-3 glass-card ${q.isCurrent ? 'premium-border-gold' : 'border-white/5'}`} glow={q.isCurrent ? 'gold' : undefined}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-ivoire uppercase tracking-widest">{q.quarter}</span>
                      {q.isCurrent && <Badge variant="gold" className="text-[8px] py-0.5 px-2 font-black">En cours</Badge>}
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-500 uppercase font-bold">Revenus TTC</p>
                      <p className="text-lg font-serif font-bold text-ivoire">{fmt(q.totalTtc)} $</p>
                    </div>
                    <div className="space-y-1 text-[10px]">
                      <div className="flex justify-between"><span className="text-slate-500">TPS → ARC :</span><span className="text-amber-400 font-bold">{fmt(q.taxesARemettreARC)} $</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">TVQ → RQ :</span><span className="text-amber-400 font-bold">{fmt(q.taxesARemettreRQ)} $</span></div>
                      <div className="flex justify-between border-t border-white/5 pt-1"><span className="text-slate-400 font-bold">Net :</span><span className="text-gold font-bold">{fmt(q.revenuNet)} $</span></div>
                    </div>
                    <p className="text-[9px] text-slate-600 font-bold">{q.count} vente{q.count !== 1 ? 's' : ''}</p>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Filtres ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Filter size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Client ou # facture..."
            value={filterClient}
            onChange={e => setFilterClient(e.target.value)}
            className="w-full bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-silver outline-none focus:ring-1 focus:ring-gold/30 placeholder:text-slate-600"
          />
        </div>

        {/* Filtre Année */}
        <div className="relative">
          <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <select
            value={filterYear}
            onChange={e => setFilterYear(e.target.value)}
            className="bg-white/5 border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-sm text-silver outline-none focus:ring-1 focus:ring-gold/30 appearance-none cursor-pointer"
          >
            <option value="">Toutes les années</option>
            {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* Filtre Mois */}
        <div className="relative">
          <select
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
            className="bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-silver outline-none focus:ring-1 focus:ring-gold/30 appearance-none cursor-pointer"
          >
            <option value="">Tous les mois</option>
            {MONTHS_FR.map((m, i) => <option key={i} value={i.toString()}>{m}</option>)}
          </select>
        </div>

        {/* Filtre Comptable (super_admin seulement) */}
        {isSuperAdmin && subAdmins.length > 0 && (
          <div className="relative">
            <Shield size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/50" />
            <select
              value={filterSubAdmin}
              onChange={e => setFilterSubAdmin(e.target.value)}
              className="bg-gold/5 border border-gold/20 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gold outline-none focus:ring-1 focus:ring-gold/30 appearance-none cursor-pointer"
            >
              <option value="">Tous les cabinets</option>
              {subAdmins.map(sa => <option key={sa.id} value={sa.id}>{sa.name}</option>)}
            </select>
          </div>
        )}

        <div className="flex items-center gap-3 ml-auto">
          {(filterClient || filterMonth || filterSubAdmin || filterYear !== new Date().getFullYear().toString()) && (
            <button
              onClick={() => { setFilterClient(''); setFilterMonth(''); setFilterYear(new Date().getFullYear().toString()); setFilterSubAdmin(''); }}
              className="text-[10px] text-slate-500 hover:text-gold font-black uppercase tracking-widest transition-colors"
            >
              Réinitialiser
            </button>
          )}
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest shrink-0">
            {filtered.length} entrée{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* ── Tableau principal — Desktop ── */}
      <Card className="p-0 overflow-hidden glass-card hidden md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              {[
                { label: 'Date', field: 'dateVente' },
                { label: 'Client', field: null },
                { label: '# Facture · Service', field: null },
                { label: 'Mode paiement', field: null },
                { label: 'Montant HT', field: null },
                { label: 'TPS (5%)', field: null },
                { label: 'TVQ (9.975%)', field: null },
                { label: 'Total TTC', field: 'montantTtc' },
                { label: 'Frais réseau', field: null },
                { label: 'Ref. Interac', field: null },
                { label: 'Net Réel', field: 'revenuNet' },
              ].map(({ label, field }) => (
                <th
                  key={label}
                  onClick={() => field && toggleSort(field as any)}
                  className={`px-5 py-4 text-left text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] whitespace-nowrap ${field ? 'cursor-pointer hover:text-gold select-none' : ''}`}
                >
                  <span className="flex items-center gap-1">
                    {label}
                    {field && <SortIcon field={field as any} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={11} className="px-5 py-16 text-center text-slate-600 italic font-serif text-xl opacity-40">
                  Aucune vente enregistrée.
                </td>
              </tr>
            )}
            <AnimatePresence>
              {filtered.map((sale, i) => (
                <motion.tr
                  key={sale.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="hover:bg-white/[0.02] transition-all group"
                >
                  <td className="px-5 py-4 text-[11px] text-slate-400 font-mono whitespace-nowrap">
                    {new Date(sale.dateVente).toLocaleDateString('fr-CA')}
                    <div className="text-[9px] text-slate-600">{new Date(sale.dateVente).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}</div>
                  </td>
                  <td className="px-5 py-4 font-bold text-ivoire text-sm group-hover:text-gold transition-colors">{sale.clientName}</td>
                  <td className="px-5 py-4 max-w-[180px]">
                    <p className="text-[11px] text-slate-300 font-mono font-bold truncate">{sale.serviceLabel}</p>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant="default" className="text-[8px] font-black uppercase tracking-wider bg-white/5 text-slate-400 border-white/10 whitespace-nowrap">
                      {FEE_LABELS[sale.feeType] || sale.feeType}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 font-mono text-silver text-sm whitespace-nowrap">{fmt(sale.montantHt)} $</td>
                  <td className="px-5 py-4 font-mono text-amber-400 text-sm whitespace-nowrap">{fmt(sale.tps)} $</td>
                  <td className="px-5 py-4 font-mono text-amber-400 text-sm whitespace-nowrap">{fmt(sale.tvq)} $</td>
                  <td className="px-5 py-4 font-mono font-bold text-ivoire text-sm whitespace-nowrap">{fmt(sale.montantTtc)} $</td>
                  <td className="px-5 py-4 font-mono text-red-400 text-sm whitespace-nowrap">{sale.fraisTraitement > 0 ? `-${fmt(sale.fraisTraitement)} $` : '—'}</td>
                  <td className="px-5 py-4">
                    {sale.interacReference
                      ? <span className="text-[10px] font-mono text-sapphire-light bg-sapphire/10 border border-sapphire/20 px-2 py-1 rounded-lg">{sale.interacReference}</span>
                      : <span className="text-[10px] text-slate-600 italic">Dépôt direct</span>
                    }
                  </td>
                  <td className="px-5 py-4 font-serif font-bold text-gold text-base whitespace-nowrap">{fmt(sale.revenuNet)} $</td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>

          {/* Ligne totaux */}
          {filtered.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-gold/30 bg-gold/[0.03]">
                <td colSpan={4} className="px-5 py-5 text-[10px] font-black text-gold uppercase tracking-[0.3em]">
                  TOTAUX — {filtered.length} vente{filtered.length !== 1 ? 's' : ''}
                </td>
                <td className="px-5 py-5 font-mono font-bold text-silver whitespace-nowrap">{fmt(filtered.reduce((s,r)=>s+r.montantHt,0))} $</td>
                <td className="px-5 py-5 font-mono font-bold text-amber-400 whitespace-nowrap">{fmt(filtered.reduce((s,r)=>s+r.tps,0))} $</td>
                <td className="px-5 py-5 font-mono font-bold text-amber-400 whitespace-nowrap">{fmt(filtered.reduce((s,r)=>s+r.tvq,0))} $</td>
                <td className="px-5 py-5 font-mono font-bold text-ivoire whitespace-nowrap">{fmt(filtered.reduce((s,r)=>s+r.montantTtc,0))} $</td>
                <td className="px-5 py-5 font-mono font-bold text-red-400 whitespace-nowrap">{filtered.reduce((s,r)=>s+r.fraisTraitement,0) > 0 ? `-${fmt(filtered.reduce((s,r)=>s+r.fraisTraitement,0))} $` : '—'}</td>
                <td className="px-5 py-5" />
                <td className="px-5 py-5 font-serif font-bold text-gold text-xl whitespace-nowrap">{fmt(filtered.reduce((s,r)=>s+r.revenuNet,0))} $</td>
              </tr>
            </tfoot>
          )}
        </table>
      </Card>

      {/* ── Cartes mobile ── */}
      <div className="md:hidden space-y-4">
        {filtered.length === 0 && (
          <Card className="p-12 text-center glass-card">
            <p className="text-slate-600 italic font-serif text-lg">Aucune vente enregistrée.</p>
          </Card>
        )}
        {filtered.map(sale => (
          <Card key={sale.id} className="p-5 glass-card space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-ivoire">{sale.clientName}</p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">{sale.serviceLabel}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-serif font-bold text-gold">{fmt(sale.revenuNet)} $</p>
                <p className="text-[9px] text-slate-500 uppercase font-bold">Net réel</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: 'HT', value: fmt(sale.montantHt), color: 'text-silver' },
                { label: 'TPS', value: fmt(sale.tps), color: 'text-amber-400' },
                { label: 'TVQ', value: fmt(sale.tvq), color: 'text-amber-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white/5 rounded-xl p-2">
                  <p className={`text-sm font-bold font-mono ${color}`}>{value}$</p>
                  <p className="text-[8px] text-slate-500 uppercase font-bold mt-0.5">{label}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-white/5 pt-3">
              <span>{new Date(sale.dateVente).toLocaleDateString('fr-CA')}</span>
              <Badge variant="default" className="text-[8px] font-black bg-white/5 text-slate-400 border-white/10">
                {FEE_LABELS[sale.feeType] || sale.feeType}
              </Badge>
              <span className="font-mono text-ivoire font-bold">TTC {fmt(sale.montantTtc)} $</span>
            </div>
          </Card>
        ))}

        {/* Totaux mobile */}
        {filtered.length > 0 && (
          <Card className="p-5 premium-border-gold space-y-3" glow="gold">
            <p className="text-[10px] font-black text-gold uppercase tracking-widest">Totaux — {totals.countVentes} ventes</p>
            {[
              { label: 'CA Brut HT', value: totals.totalBrut, color: 'text-silver' },
              { label: 'TPS → ARC', value: totals.totalTps, color: 'text-amber-400' },
              { label: 'TVQ → RQ', value: totals.totalTvq, color: 'text-amber-400' },
              { label: 'Total TTC', value: totals.totalTtc, color: 'text-ivoire' },
              { label: 'Frais', value: totals.totalFrais, color: 'text-red-400' },
              { label: 'Revenu Net', value: totals.totalNet, color: 'text-gold' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{label}</span>
                <span className={`font-mono font-bold text-sm ${color}`}>{fmt(value)} $</span>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}
