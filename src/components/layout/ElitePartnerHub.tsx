import { Handshake, ExternalLink, TrendingUp, ShieldCheck, Zap, ArrowRight, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export function ElitePartnerHub() {
  const partners = [
    {
      id: "bank-01",
      name: "NeoBank Business",
      category: "BANQUE ELITE",
      benefit: "6 mois de frais offerts + 100$ de bonus",
      desc: "L'ouverture de compte la plus rapide du Canada, intégration directe avec ComptaFlow.",
      offerUrl: "https://neobank.ca/comptaflow",
      commission: "CPA Certified",
      icon: DollarSign
    },
    {
      id: "insur-02",
      name: "SecurPro Assurance",
      category: "ASSURANCE RC PRO",
      benefit: "-15% sur votre prime annuelle",
      desc: "Protection complète pour les entrepreneurs tech et consultants. Devis en 2 minutes.",
      offerUrl: "https://securpro.com/partner/agy",
      commission: "Elite Access",
      icon: ShieldCheck
    },
    {
      id: "saas-03",
      name: "CloudDesk ERP",
      category: "GESTION OPÉRATIONNELLE",
      benefit: "Accès Premium Gratuit (3 mois)",
      desc: "Gérez vos projets et votre inventaire. Les données coulent vers votre dashboard AGY.",
      offerUrl: "https://clouddesk.io/cf",
      commission: "Automation Ready",
      icon: Zap
    }
  ];

  return (
    <div className="space-y-12 pb-20 md:pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-10">
        <div>
          <h1 className="text-5xl font-serif font-bold text-ivoire tracking-tight leading-tight">
            Elite <span className="animated-gradient-text italic">Partner Hub.</span>
          </h1>
          <div className="flex items-center gap-4 mt-3">
             <div className="flex items-center gap-2 px-3 py-1 bg-gold/10 border border-gold/20 rounded-full">
                <Handshake size={12} className="text-gold" />
                <span className="text-gold text-[9px] font-black uppercase tracking-[0.2em]">Partenariats Exclusifs</span>
             </div>
             <span className="w-8 h-[1px] bg-white/10"></span>
             <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.4em]">Écosystème de Croissance</p>
          </div>
        </div>
        <Card className="p-4 bg-gold/5 border border-gold/20 rounded-2xl flex items-center gap-4">
           <div className="w-12 h-12 rounded-xl bg-gold flex items-center justify-center text-midnight">
              <TrendingUp size={24} />
           </div>
           <div>
              <p className="text-[10px] font-black text-gold uppercase tracking-widest">Valeur totale avantages</p>
              <p className="text-2xl font-serif font-bold text-ivoire">+2,500$ / an</p>
           </div>
        </Card>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {partners.map((partner, idx) => (
          <Card key={idx} className="p-8 premium-border-gold group relative overflow-hidden flex flex-col justify-between" glow="gold">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-gold/10 transition-colors" />
            
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                 <div className="w-16 h-16 rounded-2xl bg-gold/5 border border-gold/10 flex items-center justify-center text-gold group-hover:scale-110 transition-transform duration-500 shadow-glow-sm">
                    <partner.icon size={32} />
                 </div>
                 <Badge variant="gold" className="bg-gold/10 text-gold border-gold/20 py-1.5 px-3 font-black text-[8px] tracking-[0.2em]">{partner.commission}</Badge>
              </div>

              <div className="space-y-2">
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">{partner.category}</p>
                 <h3 className="text-2xl font-serif font-bold text-ivoire italic group-hover:text-gold transition-colors">{partner.name}</h3>
                 <p className="text-sm text-slate-400 font-medium leading-relaxed">{partner.desc}</p>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-1">
                 <p className="text-[9px] font-black text-gold uppercase tracking-widest">Votre Privilège Elite</p>
                 <p className="text-sm font-bold text-ivoire">{partner.benefit}</p>
              </div>
            </div>

            <div className="mt-10">
               <Button 
                 variant="gold" 
                 className="w-full h-14 uppercase font-black text-[10px] tracking-widest gap-2 shadow-glow group-hover:scale-[1.02] transition-transform"
                 onClick={() => window.open(partner.offerUrl, '_blank')}
               >
                  Activer l'Offre <ExternalLink size={14} />
               </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-12 glass-panel border-gold/20 relative overflow-hidden mt-12">
         <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10 text-center lg:text-left">
            <div className="space-y-4">
               <h2 className="text-4xl font-serif font-bold text-ivoire italic">Expansion du Réseau.</h2>
               <p className="text-slate-400 max-w-xl font-medium leading-relaxed">Notre algorithme identifie les services les plus pertinents pour votre structure (NEQ) et négocie des tarifs de gros directement pour vous.</p>
            </div>
            <Button variant="ghost" className="px-10 h-16 border-white/5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:border-gold/30">Devenir Partenaire</Button>
         </div>
      </Card>
    </div>
  );
}
