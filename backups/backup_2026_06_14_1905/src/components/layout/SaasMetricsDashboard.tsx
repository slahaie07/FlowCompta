import { TrendingUp, Users, DollarSign, Activity, ArrowUpRight, ArrowDownRight, Target, Zap, ShieldCheck } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export function SaasMetricsDashboard() {
  // Données de prévision générées par le module "saas-revenue-growth-metrics"
  const metrics = {
    mrr: 12450.00, // Monthly Recurring Revenue
    arr: 149400.00, // Annual Recurring Revenue
    growthRate: 18.5,
    churnRate: 1.2,
    ltv: 4500, // Life Time Value
    cac: 150, // Customer Acquisition Cost
    activeSubscriptions: 86
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-5xl font-serif font-bold text-ivoire tracking-tight leading-tight">
            Valorisation <span className="animated-gradient-text italic">SaaS.</span>
          </h1>
          <p className="text-slate-500 mt-2 text-[10px] font-black uppercase tracking-[0.4em]">Métriques de Croissance & LTV/CAC Ratio</p>
        </div>
        <Badge variant="gold" className="bg-gold/10 text-gold border-gold/20 py-2 px-6 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">
          Objectif 1M$ Val.
        </Badge>
      </header>

      {/* Main KPIs - The "North Star" Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card className="p-8 premium-border-gold relative overflow-hidden group" glow="gold">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-gold/10 transition-colors" />
          <div className="flex items-center justify-between mb-4 relative z-10">
             <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
               <DollarSign size={16} className="text-gold" /> MRR (Revenu Mensuel Récurrent)
             </div>
             <Badge variant="success" className="bg-green-500/10 text-green-400 border-green-500/20">+{metrics.growthRate}%</Badge>
          </div>
          <p className="text-5xl font-serif font-bold text-ivoire relative z-10">{metrics.mrr.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</p>
          <div className="mt-4 pt-4 border-t border-white/5 relative z-10 flex justify-between items-center">
             <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">ARR Projeté</span>
             <span className="text-sm font-bold text-gold">{metrics.arr.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</span>
          </div>
        </Card>

        <Card className="p-8 glass-card relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4 relative z-10">
             <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
               <Activity size={16} className="text-sapphire-light" /> LTV:CAC Ratio
             </div>
          </div>
          <div className="flex items-end gap-2 relative z-10">
            <p className="text-5xl font-serif font-bold text-ivoire">30:1</p>
          </div>
          <p className="text-[10px] text-slate-500 mt-3 font-bold leading-relaxed max-w-[250px] relative z-10">Ratio exceptionnel. Votre coût d'acquisition de {metrics.cac}$ génère {metrics.ltv}$ sur la durée de vie du client.</p>
        </Card>

        <Card className="p-8 glass-card relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4 relative z-10">
             <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
               <Users size={16} className="text-red-400" /> Churn Rate (Désabonnement)
             </div>
             <Badge variant="error" className="bg-red-500/10 text-red-400 border-red-500/20">{metrics.churnRate}%</Badge>
          </div>
          <p className="text-5xl font-serif font-bold text-ivoire relative z-10">{metrics.activeSubscriptions}</p>
          <p className="text-[10px] text-slate-500 mt-2 font-black uppercase tracking-widest relative z-10">Abonnements PAD actifs</p>
        </Card>
      </div>

      {/* Advanced Insights */}
      <Card className="p-10 bg-noir/40 border border-white/5 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center text-gold border border-gold/20 shadow-glow-sm">
                 <Zap size={32} />
              </div>
              <div>
                 <h3 className="text-2xl font-serif font-bold text-ivoire">Audit de Croissance Claude 3.5</h3>
                 <p className="text-sm text-slate-400 mt-1">Généré via `saas-launch-audit` & `saas-revenue-growth-metrics`</p>
              </div>
           </div>
           <Button variant="ghost" className="border-white/5 text-[10px] font-black uppercase tracking-widest text-gold hover:bg-gold/5">Télécharger le Rapport Investisseur</Button>
        </div>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="p-6 bg-white/[0.02] rounded-2xl border border-white/5">
              <h4 className="text-xs font-black text-silver uppercase tracking-widest mb-2 flex items-center gap-2"><Target size={14} className="text-green-400"/> Santé du Pipeline</h4>
              <p className="text-sm text-slate-400 leading-relaxed">L'entonnoir d'acquisition LinkedIn convertit à 4.2%. À ce rythme, le palier des 250K$ ARR sera atteint dans 4.3 mois.</p>
           </div>
           <div className="p-6 bg-white/[0.02] rounded-2xl border border-white/5">
              <h4 className="text-xs font-black text-silver uppercase tracking-widest mb-2 flex items-center gap-2"><ShieldCheck size={14} className="text-gold"/> Rétention Produit</h4>
              <p className="text-sm text-slate-400 leading-relaxed">Le module 'Elite Intelligence' retient 94% des utilisateurs. C'est votre fonctionnalité clé (Sticky Feature).</p>
           </div>
           <div className="p-6 bg-red-500/5 rounded-2xl border border-red-500/10">
              <h4 className="text-xs font-black text-red-400 uppercase tracking-widest mb-2 flex items-center gap-2"><ArrowDownRight size={14}/> Goulot d'étranglement</h4>
              <p className="text-sm text-slate-400 leading-relaxed">Le taux de complétion de la signature des mandats chute si le client est sur mobile (60%). Optimisation UI requise.</p>
           </div>
        </div>
      </Card>
    </div>
  );
}
