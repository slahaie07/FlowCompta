import { BarChart3, Users, Clock, TrendingUp, ArrowUpRight, Activity, Send, AlertTriangle, Calculator, CheckCircle, FileText, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { useAdminHub } from '../../../hooks/useAdminHub';
import { toast } from 'sonner';
import { OrganicLoader } from '../../../components/ui/OrganicLoader';
import { useLanguage } from '../../../hooks/useLanguage';
import { getPortalPath } from '../../config/paths';
import { RevenueBarChart } from '../../shared/RevenueBarChart';
import { TaxRemittancePanel } from '../../shared/TaxRemittancePanel';

function MoMBadge({ data }: { data: { month: string; revenue: number }[] }) {
  if (data.length < 2) return null;
  const last = data[data.length - 1].revenue;
  const prev = data[data.length - 2].revenue;
  if (prev === 0) return null;
  const pct = ((last - prev) / prev) * 100;
  return (
    <Badge
      variant={pct >= 0 ? 'success' : 'default'}
      className={pct >= 0 ? 'bg-green-500/10 text-green-400 border-green-500/20 font-black' : 'bg-red-500/10 text-red-400 border-red-500/20 font-black'}
    >
      {pct >= 0 ? '+' : ''}{pct.toFixed(1)}%
    </Badge>
  );
}

export function AdminOverview() {
  const { t } = useLanguage();
  const { stats, loading } = useAdminHub();

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-8">
      <OrganicLoader label="HUB" size="sm" />
      <p className="text-slate-500 font-serif italic text-lg animate-pulse">{t('adminHub.loading')}</p>
    </div>
  );

  const netRevenue = (stats.totalRevenue || 0) * 0.95;

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-serif font-bold text-ivoire tracking-tight leading-tight">
            {t('adminHub.title')} <span className="animated-gradient-text italic">{t('adminHub.titleAccent')}</span>
          </h1>
          <div className="flex items-center gap-3 mt-3">
            <span className="w-8 h-[1px] bg-gold/50"></span>
            <p className="text-slate-500 text-xs font-black uppercase tracking-[0.4em]">{t('adminHub.subtitle')}</p>
          </div>
        </div>
        <Badge variant="gold" className="bg-gold/10 text-gold border-gold/20 py-2 px-6 text-xs font-black uppercase tracking-[0.3em] mb-2">{t('adminHub.badge')}</Badge>
      </header>

      {stats.pendingInteracValidations > 0 && (
        <Link
          to={getPortalPath('sub_admin', 'invoices')}
          className="flex items-center justify-between gap-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-6 py-4 text-amber-200 transition hover:bg-amber-500/15"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-amber-400 shrink-0" />
            <div>
              <p className="font-bold text-sm">
                {stats.pendingInteracValidations} virement{stats.pendingInteracValidations > 1 ? 's' : ''} Interac à confirmer
              </p>
              <p className="text-xs text-amber-200/80 mt-0.5">
                Ouvrez Factures, vérifiez votre banque et saisissez la référence.
              </p>
            </div>
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-amber-400">Voir →</span>
        </Link>
      )}

      <Link
        to={getPortalPath('sub_admin', 'quote')}
        className="flex items-center justify-between gap-4 rounded-2xl border border-gold/30 bg-gold/5 px-6 py-5 transition hover:bg-gold/10 group"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold group-hover:scale-105 transition-transform">
            <Calculator size={22} />
          </div>
          <div>
            <p className="font-bold text-ivoire">{t('adminHub.calculatorTitle')}</p>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-xl">{t('adminHub.calculatorDesc')}</p>
          </div>
        </div>
        <span className="text-xs font-black uppercase tracking-widest text-gold shrink-0">
          {t('adminHub.openCalculator')} →
        </span>
      </Link>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <Card className="p-8 space-y-6 premium-border-gold relative overflow-hidden group" glow="gold">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-gold/10 transition-colors" />
          <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] relative z-10">
            <TrendingUp size={16} className="text-gold" /> {t('adminHub.grossRevenue')}
          </div>
          <p className="text-4xl font-serif font-bold text-ivoire relative z-10">{(stats.totalRevenue || 0).toLocaleString('fr-CA')} $</p>
          <div className="flex items-center gap-2 relative z-10">
            <MoMBadge data={stats.monthlyRevenue} />
            <span className="text-xs text-slate-600 font-bold uppercase tracking-widest">{t('adminHub.vsLastMonth')}</span>
          </div>
        </Card>

        <Card className="p-8 space-y-6 glass-card relative overflow-hidden group" glow="gold">
          <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
            <TrendingUp size={16} className="text-amber-500" /> {t('adminHub.networkFees')}
          </div>
          <p className="text-4xl font-serif font-bold text-amber-500">{((stats.totalRevenue || 0) * 0.05).toLocaleString('fr-CA')} $</p>
          <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">{t('adminHub.networkRoyalty')}</span>
        </Card>

        <Card className="p-8 space-y-6 glass-card relative overflow-hidden group" glow="sapphire">
          <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
            <DollarSign size={16} className="text-gold" /> {t('adminHub.netRevenue')}
          </div>
          <p className="text-4xl font-serif font-bold text-gold">{netRevenue.toLocaleString('fr-CA')} $</p>
          <Badge variant="info" className="bg-sapphire/10 text-sapphire-light border-sapphire/20 font-black">{t('adminHub.netCollected')}</Badge>
        </Card>

        <Card className="p-8 space-y-6 glass-card relative overflow-hidden group">
          <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
            <Users size={16} className="text-slate-400" /> {t('adminHub.clientPortfolio')}
          </div>
          <p className="text-4xl font-serif font-bold text-ivoire">{stats.activeClients}</p>
          <p className="text-xs text-slate-500 font-black uppercase tracking-widest">{t('adminHub.compliantFiles')}</p>
        </Card>

        <Card className="p-8 space-y-6 glass-card relative overflow-hidden group">
          <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
            <Clock size={16} className="text-red-400" /> {t('adminHub.workflow')}
          </div>
          <p className="text-4xl font-serif font-bold text-ivoire">{stats.pendingTasks}</p>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
            <span className="text-xs text-red-500/70 font-black uppercase tracking-widest italic">{t('adminHub.criticalPriority')}</span>
          </div>
        </Card>
      </div>

      {/* Graphique revenus + panneau taxes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-8 glass-card space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-silver uppercase tracking-[0.3em] flex items-center gap-2">
              <BarChart3 size={14} className="text-gold" /> Revenus mensuels — 6 derniers mois
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">
              Mois courant : {(stats.monthlyRevenue[stats.monthlyRevenue.length - 1]?.revenue || 0).toLocaleString('fr-CA')} $
            </span>
          </div>
          <RevenueBarChart data={stats.monthlyRevenue} height={160} label="Factures encaissées (TTC)" />

          {/* Synthèse rapide */}
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/5">
            {[
              { label: 'Meilleur mois', value: Math.max(...stats.monthlyRevenue.map((m) => m.revenue)).toLocaleString('fr-CA') + ' $', color: 'text-gold' },
              { label: 'Moyenne / mois', value: (stats.monthlyRevenue.reduce((a, m) => a + m.revenue, 0) / Math.max(1, stats.monthlyRevenue.length)).toFixed(0) + ' $', color: 'text-ivoire' },
              { label: 'Tendance', value: (() => { const l = stats.monthlyRevenue; if (l.length < 2) return '—'; const t = ((l[l.length-1].revenue - l[0].revenue) / Math.max(1, l[0].revenue)) * 100; return (t >= 0 ? '+' : '') + t.toFixed(1) + '%'; })(), color: 'text-green-400' },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{item.label}</p>
                <p className={`text-lg font-serif font-bold mt-1 ${item.color}`}>{item.value}</p>
              </div>
            ))}
          </div>
        </Card>

        <TaxRemittancePanel netRevenue={stats.totalRevenue || 0} province="QC" />
      </div>

      {/* Flux activité + Statut services */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <Card className="lg:col-span-2 p-0 overflow-hidden glass-card">
          <div className="p-8 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
            <h3 className="text-xs font-black text-silver uppercase tracking-[0.3em]">{t('adminHub.activityFeed')}</h3>
            <Link to={getPortalPath('sub_admin', 'transactions')} className="text-xs font-black uppercase tracking-widest hover:text-gold text-slate-500 transition-colors">
              {t('adminHub.globalArchives')} →
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {stats.globalTransactions.length === 0 && (
              <div className="p-20 text-center text-slate-600 italic font-serif text-xl opacity-40">{t('adminHub.noActivity')}</div>
            )}
            {stats.globalTransactions.slice(0, 8).map((log, i) => (
              <div key={i} className="p-6 flex items-center justify-between hover:bg-white/[0.03] transition-all duration-300 group">
                <div className="flex items-center gap-5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-white/5 ${log.type === 'sale' ? 'bg-green-500/10 text-green-400' : 'bg-gold/10 text-gold'}`}>
                    {log.type === 'sale' ? <ArrowUpRight size={18}/> : <TrendingUp size={18}/>}
                  </div>
                  <div>
                    <p className="text-sm font-black text-ivoire group-hover:text-gold transition-colors">{log.profiles?.display_name || t('adminHub.anonymousMandate')}</p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 truncate max-w-xs">{log.description}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-serif font-bold text-ivoire">{(log.amount || 0).toLocaleString('fr-CA')} $</p>
                  <Badge variant={log.status === 'reconciled' ? 'success' : 'default'} className="font-black uppercase text-[9px] tracking-widest mt-1">{log.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Intelligence + Actions rapides */}
        <Card className="p-8 space-y-8 premium-border-gold relative overflow-hidden" glow="gold">
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-gold/5 blur-3xl rounded-full -mb-32 -mr-32" />
          <div className="flex items-center gap-4 text-gold relative z-10">
            <div className="p-3 bg-gold/10 rounded-2xl border border-gold/20 shadow-glow-sm">
              <Activity size={24} />
            </div>
            <h3 className="font-serif text-xl font-bold italic text-ivoire">{t('adminHub.intelligenceTitle')}</h3>
          </div>

          {/* Liens rapides comptabilité */}
          <div className="space-y-3 relative z-10">
            {[
              { label: 'Grand livre des ventes', to: getPortalPath('sub_admin', 'sales_ledger'), icon: <FileText size={14} />, color: 'text-gold' },
              { label: 'Rapports de services', to: getPortalPath('sub_admin', 'service_reports'), icon: <BarChart3 size={14} />, color: 'text-blue-400' },
              { label: 'Gestion clients', to: getPortalPath('sub_admin', 'admin_clients'), icon: <Users size={14} />, color: 'text-green-400' },
              { label: 'Factures en attente', to: getPortalPath('sub_admin', 'invoices'), icon: <Clock size={14} />, color: 'text-amber-400' },
            ].map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-gold/30 hover:bg-gold/5 transition-all group"
              >
                <span className={`${link.color} group-hover:scale-110 transition-transform`}>{link.icon}</span>
                <span className="text-xs font-bold text-slate-400 group-hover:text-ivoire transition-colors">{link.label}</span>
                <span className="ml-auto text-gold opacity-0 group-hover:opacity-100 transition-opacity text-xs">→</span>
              </Link>
            ))}
          </div>

          <div className="space-y-3 pt-4 border-t border-white/5 relative z-10">
            {[
              { label: 'Cloud Sync Engine', status: t('adminHub.statusActive'), color: 'text-green-500' },
              { label: 'Gemini Tax Logic', status: t('adminHub.statusOnline'), color: 'text-green-500' },
              { label: 'n8n Batch Processor', status: t('adminHub.statusStandby'), color: 'text-gold' },
            ].map((it, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-bold">{it.label}</span>
                <span className={`${it.color} text-[10px] font-black px-2 py-0.5 bg-white/5 rounded-full`}>{it.status}</span>
              </div>
            ))}
          </div>

          <Button
            variant="gold"
            className="w-full gap-3 h-14 shadow-glow font-black uppercase tracking-[0.2em] text-xs relative z-10"
            onClick={() => toast.success(t('adminHub.reportsGenerated'))}
          >
            {t('adminHub.generateReports')} <Send size={16}/>
          </Button>
        </Card>
      </div>

      {/* Protocole cabinet */}
      <section className="space-y-6 mt-4">
        <h2 className="text-xl font-serif font-bold text-ivoire flex items-center gap-3">
          <span className="w-8 h-[1px] bg-gold/40"></span>
          PROTOCOLE DE COLLABORATION CABINET
          <Badge variant="gold" className="text-[10px] bg-gold/10 border-gold/20">MMXXVI</Badge>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {[
            { step: '1', phase: 'Accueil', title: "L'Intake", desc: "Ouvrez le dossier, ajoutez le client, envoyez le contrat et la liste des documents requis.", action: "Statut → En attente de documents", actionColor: 'text-amber-400' },
            { step: '2', phase: 'Récolte', title: 'Les Documents', desc: "En attente des documents. Après une semaine sans nouvelles, envoyez un rappel amical.", action: "Statut → Prêt à traiter", actionColor: 'text-sky-400' },
            { step: '3', phase: 'Production', title: "L'Action", desc: "Production dans Sage/QuickBooks/Impôt. Regroupez vos questions en un seul envoi.", action: "Statut → En cours de production", actionColor: 'text-sky-400' },
            { step: '4', phase: 'Clôture', title: 'Facture & Envoi', desc: "Envoyez pour signature et facture Interac. Ne transmettez rien avant paiement.", action: "Statut → Terminé", actionColor: 'text-green-400' },
          ].map((s) => (
            <Card key={s.step} className="p-6 space-y-4 glass-card relative overflow-hidden group hover:border-gold/20 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-gold font-bold text-xs uppercase tracking-widest">Étape {s.step}</span>
                <span className="text-slate-500 text-xs font-mono">{s.phase}</span>
              </div>
              <h3 className="font-serif font-bold text-lg text-ivoire">{s.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
              <div className="text-[11px] bg-white/5 p-3 rounded-lg border border-white/5">
                Action équipe → <span className={`${s.actionColor} font-bold`}>{s.action}</span>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6 premium-border-gold grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { color: 'bg-amber-500', label: 'Jaune — En Attente', desc: 'Ballon chez le client', textColor: 'text-amber-200', border: 'border-amber-500/20', bg: 'bg-amber-500/10' },
            { color: 'bg-sky-500', label: 'Bleu — En Cours', desc: 'Ballon chez ComptaFlow', textColor: 'text-sky-200', border: 'border-sky-500/20', bg: 'bg-sky-500/10' },
            { color: 'bg-green-500', label: 'Vert — Terminé', desc: 'Dossier fermé', textColor: 'text-green-200', border: 'border-green-500/20', bg: 'bg-green-500/10' },
            { color: 'bg-red-500', label: 'Rouge — Bloqué', desc: 'Problème urgent', textColor: 'text-red-200', border: 'border-red-500/20', bg: 'bg-red-500/10' },
          ].map((c) => (
            <div key={c.label} className={`flex items-center gap-3 p-4 ${c.bg} border ${c.border} rounded-xl`}>
              <span className={`w-3 h-3 rounded-full ${c.color} shrink-0`} />
              <div>
                <p className={`font-bold text-xs ${c.textColor}`}>{c.label}</p>
                <p className="text-slate-500 text-[11px] mt-0.5">{c.desc}</p>
              </div>
            </div>
          ))}
        </Card>
      </section>
    </div>
  );
}
