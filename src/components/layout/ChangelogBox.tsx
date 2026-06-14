import { Megaphone, ArrowUpRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export function ChangelogBox() {
  const updates = [
    { 
      id: '1', 
      title: 'Moteur IA v2.4', 
      date: 'Aujourd\'hui', 
      type: 'Système', 
      content: 'L\'extraction de données sur factures froissées est améliorée de 40%.' 
    },
    { 
      id: '2', 
      title: 'Conformité Loi 25', 
      date: '8 juin 2026', 
      type: 'Légal', 
      content: 'Chiffrement de bout en bout activé sur tous les messages.' 
    },
    { 
      id: '3', 
      title: 'Double Mode (Switch)', 
      date: '5 juin 2026', 
      type: 'Feature', 
      content: 'Basculez entre votre profil personnel et professionnel en un clic.' 
    },
  ];

  return (
    <Card className="h-full flex flex-col p-8 bg-white/[0.02] border-white/5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-[60px] pointer-events-none group-hover:scale-150 transition-transform duration-700" />
      
      <div className="flex items-center gap-3 mb-8 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold border border-gold/20">
          <Megaphone size={18} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-silver uppercase tracking-widest">Nouveautés du Cabinet</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Mises à jour & Alertes</p>
        </div>
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar relative z-10">
        {updates.map((update) => (
          <div key={update.id} className="space-y-2 border-l border-white/5 pl-4 hover:border-gold/30 transition-colors cursor-pointer group/item">
            <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-tighter">
              <span className="text-gold">{update.type}</span>
              <span className="text-slate-600">{update.date}</span>
            </div>
            <h4 className="text-sm font-bold text-silver group-hover/item:text-gold transition-colors">{update.title}</h4>
            <p className="text-xs text-slate-500 font-light leading-relaxed">{update.content}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-white/5 relative z-10">
        <Button variant="ghost" size="sm" className="w-full gap-2 text-slate-500 hover:text-gold">
          Voir tout l'historique <ArrowUpRight size={14} />
        </Button>
      </div>
    </Card>
  );
}
