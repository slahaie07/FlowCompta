import { Building, User, CheckCircle, ArrowRight, Calculator } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { calculateCanadianTaxes, formatCAD } from '../lib/financeUtils';

import { CONFIG } from '../lib/config';

export function Pricing() {
  const businessLevel = CONFIG.FEES.MONTHLY_BUSINESS;
  const personalLevel = CONFIG.FEES.PERSONAL_FILE;
  
  const bizTaxes = calculateCanadianTaxes(businessLevel, 'QC');
  const persTaxes = calculateCanadianTaxes(personalLevel, 'QC');

  return (
    <div className="space-y-12 pb-10">
      <header className="text-center space-y-4">
        <h1 className="text-4xl font-serif font-medium text-silver tracking-tight italic">Architecture de <span className="text-gold">Valeur.</span></h1>
        <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Grille tarifaire officielle Cabinet A&G</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Business */}
        <Card className="p-8 space-y-8" glow="gold">
           <div className="flex items-center justify-between border-b border-white/5 pb-6">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold shadow-lg"><Building size={24} /></div>
                 <div>
                    <h3 className="text-xl font-serif text-silver">PME & Gestion</h3>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">T2 / Tenue / Paie</p>
                 </div>
              </div>
              <Badge variant="gold">Populaire</Badge>
           </div>
           
           <div className="space-y-6">
              <div className="flex justify-between items-end">
                 <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">À partir de</p>
                    <p className="text-4xl font-serif text-gold">{formatCAD(businessLevel)}</p>
                 </div>
                 <p className="text-[10px] text-slate-600 font-bold uppercase pb-1">/ Mois</p>
              </div>
              
              <ul className="space-y-3">
                 {[
                   'Tenue de livres mensuelle',
                   'Production T2 / CO-17 incluse',
                   'Liaison bancaire automatisée',
                   'Accès Admin Prioritaire'
                 ].map(f => (
                   <li key={f} className="flex items-center gap-3 text-sm text-slate-400 font-light">
                      <CheckCircle size={14} className="text-green-500" /> {f}
                   </li>
                 ))}
              </ul>
           </div>
           
           <div className="pt-6 border-t border-white/5 space-y-2">
              <div className="flex justify-between text-[10px] text-slate-600 font-bold uppercase"><span>TPS (5%)</span><span>{formatCAD(bizTaxes.tps)}</span></div>
              <div className="flex justify-between text-[10px] text-slate-600 font-bold uppercase"><span>TVQ (9.975%)</span><span>{formatCAD(bizTaxes.tvq)}</span></div>
              <div className="flex justify-between text-xs text-silver font-bold pt-2"><span>Total Mensuel</span><span>{formatCAD(bizTaxes.total)}</span></div>
           </div>
        </Card>

        {/* Personal */}
        <Card className="p-8 space-y-8" glow="sapphire">
           <div className="flex items-center gap-4 border-b border-white/5 pb-6">
              <div className="w-12 h-12 rounded-2xl bg-sapphire/10 flex items-center justify-center text-sapphire-light shadow-lg"><User size={24} /></div>
              <div>
                 <h3 className="text-xl font-serif text-silver">Particuliers</h3>
                 <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">T1 / TP1 / Conseil</p>
              </div>
           </div>

           <div className="space-y-6">
              <div className="flex justify-between items-end">
                 <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Standard</p>
                    <p className="text-4xl font-serif text-sapphire-light">{formatCAD(personalLevel)}</p>
                 </div>
                 <p className="text-[10px] text-slate-600 font-bold uppercase pb-1">/ Dossier</p>
              </div>
              
              <ul className="space-y-3">
                 {[
                   'Optimisation T1 / TP1',
                   'Analyse REER / CELI',
                   'Coffre-fort documents à vie',
                   'Support email inclus'
                 ].map(f => (
                   <li key={f} className="flex items-center gap-3 text-sm text-slate-400 font-light">
                      <CheckCircle size={14} className="text-sapphire-light" /> {f}
                   </li>
                 ))}
              </ul>
           </div>

           <div className="pt-6 border-t border-white/5 space-y-2">
              <div className="flex justify-between text-[10px] text-slate-600 font-bold uppercase"><span>TPS (5%)</span><span>{formatCAD(persTaxes.tps)}</span></div>
              <div className="flex justify-between text-[10px] text-slate-600 font-bold uppercase"><span>TVQ (9.975%)</span><span>{formatCAD(persTaxes.tvq)}</span></div>
              <div className="flex justify-between text-xs text-silver font-bold pt-2"><span>Total Final</span><span>{formatCAD(persTaxes.total)}</span></div>
           </div>
        </Card>
      </div>

      {/* Setup Fee Highlight */}
      <Card className="p-6 bg-gold/[0.02] border-gold/10 flex items-center justify-between gap-6">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold"><Calculator size={20}/></div>
            <p className="text-sm font-medium text-slate-400 italic">Des frais d'ouverture de dossier de <span className="text-gold font-bold">{formatCAD(CONFIG.FEES.SETUP)}</span> s'appliquent à toute nouvelle inscription.</p>
         </div>
         <Button variant="ghost" size="sm" className="gap-2 text-[10px] uppercase font-bold">Détails légaux <ArrowRight size={14}/></Button>
      </Card>
    </div>
  );
}
