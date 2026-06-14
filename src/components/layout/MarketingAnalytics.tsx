import { BarChart3, Target, MousePointer2, PieChart, TrendingUp, Globe2, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { supabase } from '../../lib/supabase';

export function MarketingAnalytics() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
    const sub = supabase.channel('marketing_realtime')
      .on('postgres_changes', { event: 'INSERT', table: 'marketing_leads' }, (payload) => {
        setLeads(prev => [payload.new, ...prev]);
      })
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  const fetchLeads = async () => {
    const { data } = await supabase.from('marketing_leads').select('*').order('created_at', { ascending: false });
    if (data) setLeads(data);
    setLoading(false);
  };

  const totalLeads = leads.length;
  const convertedLeads = leads.filter(l => l.converted_at).length;
  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0;
  const estimatedPipeline = leads.reduce((acc, l) => acc + (Number(l.revenue_estimate) || 0), 0);

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-serif font-bold text-ivoire tracking-tight leading-tight">
            Marketing <span className="animated-gradient-text italic">Guerilla.</span>
          </h1>
          <div className="flex items-center gap-3 mt-3">
            <span className="w-8 h-[1px] bg-gold/50"></span>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Analytics Acquisition Temps Réel</p>
          </div>
        </div>
        <div className="flex gap-4">
           <Badge variant="gold" className="bg-gold/10 text-gold border-gold/20 py-2 px-6 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Live Campaign</Badge>
        </div>
      </header>

      {/* Stats Bento */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <Card className="p-8 space-y-6 premium-border-gold relative overflow-hidden group" glow="gold">
          <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
            <Target size={16} className="text-gold" /> Capture Leads
          </div>
          <p className="text-4xl font-serif font-bold text-ivoire">{totalLeads}</p>
          <div className="flex items-center gap-2">
            <TrendingUp size={12} className="text-green-400" />
            <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Pulsation de croissance</span>
          </div>
        </Card>

        <Card className="p-8 space-y-6 glass-card relative overflow-hidden group">
          <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
            <MousePointer2 size={16} className="text-sapphire-light" /> Taux Conversion
          </div>
          <p className="text-4xl font-serif font-bold text-ivoire">{conversionRate}%</p>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Onboarding complété</p>
        </Card>

        <Card className="p-8 space-y-6 glass-card relative overflow-hidden group">
          <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
            <Zap size={16} className="text-gold" /> Pipeline Estimé
          </div>
          <p className="text-4xl font-serif font-bold text-ivoire">{(estimatedPipeline / 1000).toFixed(1)}k $</p>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Valeur brute du réseau</p>
        </Card>

        <Card className="p-8 space-y-6 glass-card relative overflow-hidden group">
          <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
            <Globe2 size={16} className="text-green-500" /> Latence de Flux
          </div>
          <p className="text-4xl font-serif font-bold text-ivoire">18ms</p>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Réponse Node: Montreal-01</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Real-time Lead Stream */}
        <Card className="lg:col-span-2 p-0 overflow-hidden glass-card">
          <div className="p-8 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
             <h3 className="text-xs font-black text-silver uppercase tracking-[0.3em]">Flux entrant des prospects</h3>
             <Badge variant="info" className="text-[9px] font-black uppercase">Socket Secure</Badge>
          </div>
          <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto custom-scrollbar">
             {leads.length === 0 && (
                <div className="p-20 text-center text-slate-600 italic font-serif text-xl opacity-40">En attente des premières pulsations marketing...</div>
             )}
             {leads.map((lead, i) => (
               <div key={lead.id || i} className="p-8 flex items-center justify-between hover:bg-white/[0.03] transition-all duration-500 group">
                  <div className="flex items-center gap-6">
                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-white/5 ${lead.converted_at ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-slate-600'}`}>
                        <Target size={20}/>
                     </div>
                     <div>
                        <p className="text-base font-black text-ivoire uppercase tracking-tighter">Prospect #{lead.id?.slice(-4) || '???'}</p>
                        <p className="text-[10px] text-slate-500 font-bold mt-1">Source: <span className="text-gold">{lead.source}</span> — Campagne: {lead.campaign_id}</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <Badge variant={lead.converted_at ? 'success' : 'default'} className="font-black uppercase text-[9px] tracking-widest">
                        {lead.converted_at ? 'Converti' : 'En veille'}
                     </Badge>
                     <p className="text-[10px] text-slate-600 mt-2 font-black uppercase tracking-tighter">{lead.metadata?.region || 'Global Network'}</p>
                  </div>
               </div>
             ))}
          </div>
        </Card>

        {/* Campaign Control Center */}
        <Card className="p-10 space-y-8 premium-border-gold relative overflow-hidden" glow="gold">
           <h3 className="font-serif text-2xl font-bold italic text-ivoire">Régie Guerilla</h3>
           <p className="text-sm text-slate-500 leading-relaxed font-medium">Contrôlez l'intensité de l'acquisition et ajustez le budget algorithmique.</p>
           
           <div className="space-y-6">
              {[
                { label: 'Google Search Ads', status: 'Actif', color: 'text-green-500' },
                { label: 'Meta Dynamic Creative', status: 'Optimisation', color: 'text-gold' },
                { label: 'LinkedIn B2B Bridge', status: 'En attente', color: 'text-slate-600' }
              ].map((it, idx) => (
                <div key={idx} className="flex items-center justify-between">
                   <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">{it.label}</span>
                   <span className={`${it.color} text-[10px] font-black uppercase tracking-tighter`}>{it.status}</span>
                </div>
              ))}
           </div>
           
           <Button variant="gold" className="w-full gap-3 h-16 shadow-glow font-black uppercase tracking-[0.2em] text-xs">
              Étendre l'Acquisition <TrendingUp size={16}/>
           </Button>
        </Card>
      </div>
    </div>
  );
}
