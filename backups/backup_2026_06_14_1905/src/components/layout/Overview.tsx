import { FileText, Clock, AlertCircle, TrendingUp, CheckCircle2, ArrowUpRight, HelpCircle, Mail as MailIcon } from 'lucide-react';
import { UserData, AppMode } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ChangelogBox } from './ChangelogBox';
import { motion } from 'motion/react';

export function Overview({ userData, isLoading, currentMode }: { userData: UserData, isLoading: boolean, currentMode: AppMode }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-48 bg-white/5 rounded-3xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative">
        <div className="relative z-10">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-5xl font-serif font-bold text-ivoire tracking-tight leading-tight"
          >
            Bonjour, <span className="animated-gradient-text italic">{userData.displayName}</span>
          </motion.h1>
          <div className="flex items-center gap-3 mt-3">
            <span className="w-8 h-[1px] bg-gold/50"></span>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Dashboard Elite {currentMode === 'business' ? 'Business' : 'Privé'}</p>
          </div>
        </div>
        <div className="flex gap-4 w-full md:w-auto relative z-10">
           <Button variant="secondary" size="lg" className="flex-1 md:flex-none gap-3 h-14 md:h-12 px-8 glass-button rounded-2xl group" onClick={() => window.location.href='mailto:s.lahaie07@gmail.com'}>
             <MailIcon size={16} className="text-gold group-hover:scale-110 transition-transform"/> 
             <span className="text-xs font-bold uppercase tracking-widest">Contacter mon CPA</span>
           </Button>
           <Button variant="ghost" size="icon" className="h-14 w-14 md:h-12 md:w-12 glass-card rounded-2xl border-white/5 hover:border-gold/20 transition-all">
             <HelpCircle size={20} className="text-slate-400"/>
           </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Stats Bento */}
        <Card className="lg:col-span-8 p-8 md:p-12 flex flex-col justify-between group relative overflow-hidden min-h-[400px] premium-border-gold" glow="gold">
          <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-gold/5 rounded-full blur-[120px] -mr-64 -mt-32 group-hover:bg-gold/10 transition-colors duration-1000" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
              <Badge variant="info" className="bg-gold/10 text-gold border-gold/20 py-1.5 px-4 text-[10px] font-black uppercase tracking-[0.2em]">Statut Certifié</Badge>
            </div>
            <h2 className="text-3xl md:text-5xl font-serif text-ivoire leading-tight">Votre santé financière est <br/><span className="text-gold italic underline decoration-gold/30 underline-offset-8">optimale</span></h2>
            <p className="text-slate-400 mt-6 max-w-lg font-medium leading-relaxed text-base opacity-80">
               {currentMode === 'business' 
                 ? `Toutes les obligations pour ${userData.companyName || 'votre entité'} sont sécurisées. Prochaine analyse stratégique le 15 Juillet.`
                 : 'Vos actifs personnels et déductions 2025 sont sous surveillance haute fidélité.'}
            </p>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 relative z-10 mt-8">
             <div className="flex gap-8">
               <div>
                 <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Dernière Action</p>
                 <p className="text-lg font-medium text-silver">Transmise</p>
               </div>
               <div>
                 <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Échéance</p>
                 <p className="text-xl font-medium text-gold">15 Juil 2026</p>
               </div>
             </div>
             <Button variant="secondary" className="w-full md:w-auto gap-2 group">Détails complets <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"/></Button>
          </div>
        </Card>

        {/* Changelog / Updates */}
        <div className="lg:col-span-4 h-[340px]">
           <ChangelogBox />
        </div>

        {/* Quick Metrics */}
        <Card className="lg:col-span-4 p-6 flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-400 border border-green-500/20">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Ratio Santé</p>
            <p className="text-2xl font-serif text-silver">98%</p>
          </div>
        </Card>

        <Card className="lg:col-span-4 p-6 flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-sapphire/10 flex items-center justify-center text-sapphire-light border border-sapphire/20">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Archive Cloud</p>
            <p className="text-2xl font-serif text-silver">24 Docs</p>
          </div>
        </Card>

        <Card className="lg:col-span-4 p-6 flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center text-gold border border-gold/20">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Dernière Sync</p>
            <p className="text-xl font-serif text-silver">09:41</p>
          </div>
        </Card>
      </div>

      {/* Immediate Tasks */}
      <section className="space-y-6">
        <h3 className="text-2xl font-serif text-silver flex items-center gap-3">
          <CheckCircle2 size={24} className="text-gold" /> Tâches & Activités
        </h3>
        <Card className="p-0 overflow-hidden divide-y divide-white/5">
           <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 hover:bg-white/5 transition-colors group">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/20 shadow-lg">
                <AlertCircle size={24} className="text-red-400" />
              </div>
              <div className="flex-1">
                 <div className="flex justify-between items-start">
                    <p className="text-base font-bold text-silver tracking-tight">Signature requise : Rapport T2 (2025)</p>
                    <Badge variant="error">Urgent</Badge>
                 </div>
                 <p className="text-sm text-slate-500 mt-2 font-light leading-relaxed max-w-2xl">Une signature électronique est requise avant le 15 juin pour valider votre dossier fiscal professionnel.</p>
                 <Button variant="gold" className="mt-6 w-full md:w-auto gap-2 h-12">Signer via SignNow™ <ArrowUpRight size={16}/></Button>
              </div>
           </div>
           {[
             { title: "Téléversement Facture #442", time: "Il y a 2 heures", status: "Chiffré", type: "success" },
             { title: "Rapprochement bancaire mensuel", time: "Hier, 16:30", status: "Validé", type: "default" }
           ].map((item, idx) => (
             <div key={idx} className="p-6 md:p-8 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group">
               <div className="flex items-center gap-4 md:gap-6">
                 <div className="w-2 h-2 rounded-full bg-gold/40 group-hover:scale-150 transition-transform" />
                 <div>
                   <p className="text-sm font-medium text-silver">{item.title}</p>
                   <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-widest">{item.time}</p>
                 </div>
               </div>
               <Badge variant={item.type as any}>{item.status}</Badge>
             </div>
           ))}
        </Card>
      </section>
    </div>
  );
}
