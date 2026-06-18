import { Building, User, CheckCircle, ArrowRight, Calculator, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatCAD } from '../../lib/financeUtils';
import { CONFIG } from '../../lib/config';

export function Pricing() {
  const plans = [
    {
      name: "Dossier Particulier",
      subtitle: "Fiscalité Personnelle",
      description: "Idéal pour les employés et retraités cherchant une optimisation maximale de leurs crédits.",
      features: ["Déclaration T1 / TP-1", "Crédits d'impôt optimisés", "Transmission électronique", "Support via messagerie"],
      cta: "Obtenir mon prix"
    },
    {
      name: "Elite Travailleur Autonome",
      subtitle: "Gestion de Croissance",
      description: "Conçu pour les entrepreneurs solos qui veulent se concentrer sur leur talent, pas sur les taxes.",
      features: ["Tenue de livres mensuelle", "Rapports TPS / TVQ", "Calcul des déductions d'affaires", "Bilan de fin d'année"],
      cta: "Demander une soumission",
      highlight: true
    },
    {
      name: "Structure Corporate",
      subtitle: "Solution Entreprise",
      description: "Gestion complète pour les sociétés incorporées exigeant une rigueur absolue.",
      features: ["États financiers annuels", "Déclarations T2 / CO-17", "Stratégie dividendes/salaires", "Expert dédié attitré"],
      cta: "Évaluer mes besoins"
    }
  ];

  return (
    <div className="space-y-16 py-10">
      <div className="text-center space-y-4">
        <Badge variant="gold" className="px-4 py-1 text-[10px] uppercase tracking-[0.3em]">Tarification Personnalisée</Badge>
        <h2 className="text-5xl font-serif font-bold text-ivoire">Une structure de prix <span className="animated-gradient-text italic">sur mesure.</span></h2>
        <p className="text-slate-500 max-w-2xl mx-auto font-medium">Parce que chaque entrepreneur est unique, nous calculons vos honoraires en fonction de la complexité réelle de votre dossier. Zéro frais d'ouverture.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, i) => (
          <Card key={i} className={`p-10 flex flex-col h-full relative overflow-hidden transition-all duration-500 ${plan.highlight ? 'premium-border-gold ring-1 ring-gold/20' : 'glass-card'}`} glow={plan.highlight ? 'gold' : undefined}>
            {plan.highlight && (
              <div className="absolute top-6 right-6">
                <Sparkles size={20} className="text-gold animate-pulse" />
              </div>
            )}
            
            <div className="space-y-2 mb-8">
              <p className="text-[10px] font-black text-gold uppercase tracking-[0.2em]">{plan.subtitle}</p>
              <h3 className="text-2xl font-serif font-bold text-ivoire">{plan.name}</h3>
            </div>

            <p className="text-sm text-slate-400 font-light leading-relaxed mb-10 flex-1">{plan.description}</p>

            <div className="space-y-4 mb-10">
              {plan.features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs text-silver">
                  <div className="w-5 h-5 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                    <CheckCircle size={14} className="text-gold" />
                  </div>
                  {feat}
                </div>
              ))}
            </div>

            <Button variant={plan.highlight ? 'gold' : 'secondary'} className="w-full h-14 uppercase font-black text-[10px] tracking-widest gap-2">
              {plan.cta} <ArrowRight size={14} />
            </Button>
          </Card>
        ))}
      </div>

      {/* Fact & Safety Box */}
      <div className="max-w-4xl mx-auto p-12 glass-card rounded-[2.5rem] border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gold/[0.01]" />
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-4">
             <div className="flex items-center gap-3 text-gold">
                <ShieldCheck size={24} />
                <h4 className="font-serif text-xl font-bold italic text-ivoire">Sérénité Garantie</h4>
             </div>
             <p className="text-sm text-slate-500 leading-relaxed">Chaque soumission est sans engagement. Nous analysons votre volume de transactions pour vous offrir le prix le plus juste.</p>
          </div>
          <div className="space-y-4 text-right md:text-left">
             <div className="flex items-center gap-3 text-gold md:justify-start justify-end">
                <Zap size={24} />
                <h4 className="font-serif text-xl font-bold italic text-ivoire">Zéro Frais d'Ouverture</h4>
             </div>
             <p className="text-sm text-slate-500 leading-relaxed">L'accès au portail et la création de votre dossier sont totalement gratuits. Vous ne payez que pour les travaux effectués.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
