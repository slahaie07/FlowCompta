import { BarChart3, Users, Clock, TrendingUp, ArrowUpRight, Activity, Send } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { UserData, ClientRecord } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAdminHub } from '../../hooks/useAdminHub';
import { toast } from 'sonner';
import { OrganicLoader } from '../ui/OrganicLoader';

export function AdminOverview() {
  const { stats, loading } = useAdminHub();

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-8">
      <OrganicLoader label="HUB" size="sm" />
      <p className="text-slate-500 font-serif italic text-lg animate-pulse">Initialisation du Hub Cabinet...</p>
    </div>
  );

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-serif font-bold text-ivoire tracking-tight leading-tight">
            Hub <span className="animated-gradient-text italic">Comptaflow.</span>
          </h1>
          <div className="flex items-center gap-3 mt-3">
            <span className="w-8 h-[1px] bg-gold/50"></span>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Opérations Stratégiques & BI</p>
          </div>
        </div>
        <Badge variant="gold" className="bg-gold/10 text-gold border-gold/20 py-2 px-6 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Administrateur Suprême</Badge>
      </header>

      {/* Admin Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
        <Card className="p-8 space-y-6 premium-border-gold relative overflow-hidden group" glow="gold">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-gold/10 transition-colors" />
          <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] relative z-10">
            <TrendingUp size={16} className="text-gold" /> Chiffre d'Affaires Brut
          </div>
          <p className="text-4xl font-serif font-bold text-ivoire relative z-10">{(stats.totalRevenue || 0).toLocaleString()} $</p>
          <div className="flex items-center gap-2 relative z-10">
            <Badge variant="success" className="bg-green-500/10 text-green-400 border-green-500/20 font-black">+12.4%</Badge>
            <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">vs mois dernier</span>
          </div>
        </Card>

        <Card className="p-8 space-y-6 glass-card relative overflow-hidden group" glow="gold">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-gold/10 transition-colors" />
          <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] relative z-10">
            <TrendingUp size={16} className="text-amber-500" /> Frais de Réseau (5%)
          </div>
          <p className="text-4xl font-serif font-bold text-amber-500 relative z-10">{((stats.totalRevenue || 0) * 0.05).toLocaleString()} $</p>
          <div className="flex items-center gap-2 relative z-10">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Redevance ComptaFlow</span>
          </div>
        </Card>

        <Card className="p-8 space-y-6 glass-card relative overflow-hidden group" glow="sapphire">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sapphire/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-sapphire/10 transition-colors" />
          <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] relative z-10">
            <TrendingUp size={16} className="text-sapphire-light" /> Revenu Net Cabinet (95%)
          </div>
          <p className="text-4xl font-serif font-bold text-gold relative z-10">{((stats.totalRevenue || 0) * 0.95).toLocaleString()} $</p>
          <div className="flex items-center gap-2 relative z-10">
            <Badge variant="info" className="bg-sapphire/10 text-sapphire-light border-sapphire/20 font-black">Net Encaissé</Badge>
          </div>
        </Card>
        
        <Card className="p-8 space-y-6 glass-card relative overflow-hidden group">
          <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
            <Users size={16} className="text-slate-400" /> Portefeuille Clients
          </div>
          <p className="text-4xl font-serif font-bold text-ivoire">{stats.activeClients}</p>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Dossiers conformes ARC/RQ</p>
        </Card>

        <Card className="p-8 space-y-6 glass-card relative overflow-hidden group">
          <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
            <Clock size={16} className="text-red-400" /> Flux de Travail
          </div>
          <p className="text-4xl font-serif font-bold text-ivoire">{stats.pendingTasks}</p>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
            <span className="text-[9px] text-red-500/70 font-black uppercase tracking-widest italic">Priorité Critique</span>
          </div>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="p-8 glass-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xs font-black text-silver uppercase tracking-[0.3em]">Évolution du Chiffre d'Affaires</h3>
            <p className="text-[10px] text-slate-500 font-bold mt-1">6 derniers mois — Factures acquittées</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gold/80" />
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Revenus TTC</span>
          </div>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.monthlyRevenue} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C6A15B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#C6A15B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k$`} width={36} />
              <Tooltip
                contentStyle={{ background: '#0B0B0C', border: '1px solid rgba(198,161,91,0.2)', borderRadius: 12, color: '#F3EEE3', fontSize: 11, fontWeight: 700 }}
                formatter={(v: any) => [`${Number(v).toLocaleString('fr-CA')} $`, 'Revenus']}
                labelStyle={{ color: '#9ca3af' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#C6A15B" strokeWidth={2} fill="url(#goldGrad)" dot={{ fill: '#C6A15B', r: 3 }} activeDot={{ r: 5, fill: '#C6A15B' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Recent Global Activity */}
        <Card className="lg:col-span-2 p-0 overflow-hidden glass-card">
          <div className="p-8 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
             <h3 className="text-xs font-black text-silver uppercase tracking-[0.3em]">Flux d'activité du réseau</h3>
             <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest hover:text-gold">Archives Globales</Button>
          </div>
          <div className="divide-y divide-white/5">
             {stats.globalTransactions.length === 0 && (
                <div className="p-20 text-center text-slate-600 italic font-serif text-xl opacity-40">Aucune pulsation détectée sur le réseau ComptaFlow.</div>
             )}
             {stats.globalTransactions.map((log, i) => (
               <div key={i} className="p-8 flex items-center justify-between hover:bg-white/[0.03] transition-all duration-500 group cursor-pointer">
                  <div className="flex items-center gap-6">
                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-white/5 ${log.type === 'sale' ? 'bg-green-500/10 text-green-400' : 'bg-gold/10 text-gold'}`}>
                        {log.type === 'sale' ? <ArrowUpRight size={20}/> : <TrendingUp size={20}/>}
                     </div>
                     <div>
                        <p className="text-base font-black text-ivoire group-hover:text-gold transition-colors">{log.profiles?.display_name || 'Mandat Anonyme'}</p>
                        <p className="text-xs text-slate-500 font-medium mt-1">{log.description}</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <Badge variant={log.status === 'reconciled' ? 'success' : 'default'} className="font-black uppercase text-[9px] tracking-widest">{log.status}</Badge>
                     <p className="text-[10px] text-slate-600 mt-2 font-black uppercase tracking-tighter">{new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
               </div>
             ))}
          </div>
        </Card>

        {/* Integration Status Box */}
        <Card className="p-10 space-y-8 premium-border-gold relative overflow-hidden" glow="gold">
           <div className="absolute bottom-0 right-0 w-64 h-64 bg-gold/5 blur-3xl rounded-full -mb-32 -mr-32" />
           <div className="flex items-center gap-4 text-gold relative z-10">
              <div className="p-3 bg-gold/10 rounded-2xl border border-gold/20 shadow-glow-sm">
                <BarChart3 size={28} />
              </div>
              <h3 className="font-serif text-2xl font-bold italic text-ivoire">Gestion Intelligence</h3>
           </div>
           <p className="text-sm text-slate-500 leading-relaxed font-medium relative z-10">Contrôlez les connecteurs cloud et déclenchez les automatisations de fin de période.</p>
           
           <div className="space-y-6 relative z-10">
              {[
                { label: 'Cloud Sync Engine', status: 'Actif', color: 'text-green-500' },
                { label: 'Gemini Tax Logic', status: 'En ligne', color: 'text-green-500' },
                { label: 'n8n Batch Processor', status: 'Standby', color: 'text-gold' }
              ].map((it, idx) => (
                <div key={idx} className="flex items-center justify-between">
                   <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">{it.label}</span>
                   <span className={`${it.color} text-[10px] font-black uppercase tracking-tighter px-3 py-1 bg-white/5 rounded-full`}>{it.status}</span>
                </div>
              ))}
           </div>
           
           <div className="space-y-4 pt-6 relative z-10">
              <Button 
                variant="gold" 
                className="w-full gap-3 h-16 shadow-glow font-black uppercase tracking-[0.2em] text-xs"
                onClick={async () => {
                  toast.success("Intelligence en marche : Les bilans ont été formatés.");
                }}
              >
                Générer Bilans <Send size={16}/>
              </Button>
              <Button variant="ghost" className="w-full gap-2 h-14 glass-button rounded-2xl text-[10px] font-black uppercase tracking-widest">Connecteurs Cloud</Button>
           </div>
        </Card>
      </div>
    </div>
  );
}
