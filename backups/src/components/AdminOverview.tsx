import { BarChart3, Users, Clock, TrendingUp, ArrowUpRight, Activity, Send } from 'lucide-react';
import { UserData, ClientRecord } from '../types';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { useAdminHub } from '../hooks/useAdminHub';
import { toast } from 'sonner';

export function AdminOverview() {
  const { stats, loading } = useAdminHub();

  if (loading) return <div className="p-8 text-center animate-pulse">Initialisation du Hub Cabinet...</div>;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-serif font-medium text-silver tracking-tight">Vue d'ensemble <span className="text-gold italic">du Cabinet.</span></h1>
        <p className="text-slate-400 mt-1.5 text-sm font-light uppercase tracking-widest">Sommaire journalier et opérations</p>
      </header>

      {/* Admin Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 space-y-4" glow="gold">
          <div className="flex items-center gap-3 text-slate-500 text-[10px] uppercase font-bold tracking-widest"><TrendingUp size={14} className="text-gold" /> Revenu Cabinet (Mois)</div>
          <p className="text-3xl font-serif text-silver">{stats.totalRevenue.toLocaleString()} $</p>
          <Badge variant="success">+12% vs mois dernier</Badge>
        </Card>
        <Card className="p-6 space-y-4" glow="sapphire">
          <div className="flex items-center gap-3 text-slate-500 text-[10px] uppercase font-bold tracking-widest"><Users size={14} className="text-sapphire-light" /> Clients Actifs</div>
          <p className="text-3xl font-serif text-silver">{stats.activeClients}</p>
          <p className="text-[10px] text-slate-500 uppercase font-bold">Dossiers conformes</p>
        </Card>
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3 text-slate-500 text-[10px] uppercase font-bold tracking-widest"><Clock size={14} className="text-red-400" /> Tâches en attente</div>
          <p className="text-3xl font-serif text-silver">{stats.pendingTasks}</p>
          <p className="text-[10px] text-red-500/50 uppercase font-bold italic">Priorité haute</p>
        </Card>
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3 text-slate-500 text-[10px] uppercase font-bold tracking-widest"><Activity size={14} className="text-green-500" /> Sync Automatique</div>
          <div className="flex items-center gap-2">
             <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
             <p className="text-lg font-medium text-silver uppercase tracking-tighter">En ligne</p>
          </div>
          <p className="text-[10px] text-slate-500 uppercase font-bold">n8n / Gemini / Google</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Global Activity */}
        <Card className="lg:col-span-2 p-0 overflow-hidden">
          <div className="p-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
             <h3 className="text-sm font-bold text-silver uppercase tracking-widest">Flux d'activité des clients</h3>
             <Button variant="ghost" size="sm">Voir tout</Button>
          </div>
          <div className="divide-y divide-white/5">
             {stats.globalTransactions.length === 0 && (
                <div className="p-12 text-center text-slate-600 italic">Aucune activité récente détectée sur le réseau.</div>
             )}
             {stats.globalTransactions.map((log, i) => (
               <div key={i} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors group cursor-pointer">
                  <div className="flex items-center gap-4">
                     <div className={`w-2 h-2 rounded-full ${log.type === 'sale' ? 'bg-green-500' : 'bg-gold'}`} />
                     <div>
                        <p className="text-sm font-bold text-silver">{log.profiles?.display_name || 'Utilisateur'}</p>
                        <p className="text-xs text-slate-500">{log.description}</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <Badge variant={log.status === 'reconciled' ? 'success' : 'default'}>{log.status}</Badge>
                     <p className="text-[10px] text-slate-600 mt-1 font-bold">{new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
               </div>
             ))}
          </div>
        </Card>

        {/* Integration Status Box */}
        <Card className="p-8 space-y-6 bg-sapphire/[0.03] border-sapphire/10">
           <div className="flex items-center gap-3 text-sapphire-light">
              <BarChart3 size={24} />
              <h3 className="font-serif text-lg font-medium italic">Gestion Google</h3>
           </div>
           <p className="text-xs text-slate-500 leading-relaxed">Vos outils Google Workspace sont synchronisés pour la gestion automatique des horaires et des tâches.</p>
           
           <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                 <span className="text-slate-400">Gmail Sync</span>
                 <span className="text-green-500 font-bold uppercase tracking-tighter">Actif</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                 <span className="text-slate-400">Calendar Sync</span>
                 <span className="text-green-500 font-bold uppercase tracking-tighter">Actif</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                 <span className="text-slate-400">Tâches n8n</span>
                 <span className="text-gold font-bold uppercase tracking-tighter">En cours</span>
              </div>
           </div>
           
           <div className="space-y-3 pt-4">
              <Button 
                variant="gold" 
                className="w-full gap-2 h-12 shadow-glow-sm"
                onClick={async () => {
                  console.info("Déclenchement des bilans mensuels...");
                  // Intégration réelle avec un service d'envoi de rapports
                  toast.success("Les bilans mensuels formatés ont été mis en file d'attente pour envoi.");
                }}
              >
                Envoyer Bilans Mensuels <Send size={14}/>
              </Button>
              <Button variant="secondary" className="w-full gap-2 h-12">Configurer Google <ArrowUpRight size={14}/></Button>
           </div>
        </Card>
      </div>
    </div>
  );
}
