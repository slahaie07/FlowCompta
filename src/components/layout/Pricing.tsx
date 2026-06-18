import { CheckCircle, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export function Pricing() {
  const plans = [
    {
      name: "Dossier Particulier",
      subtitle: "Fiscalité Personnelle",
      price: "89 $",
      description: "Idéal pour les salariés et retraités cherchant une optimisation maximale de leurs crédits.",
      features: ["Déclaration T1 / TP-1", "Crédits d'impôt optimisés", "Transmission électronique", "Support via messagerie"],
      cta: "Choisir ce forfait"
    },
    {
      name: "Elite Travailleur Autonome",
      subtitle: "Gestion de Croissance",
      price: "199 $",
      description: "Conçu pour les entrepreneurs solos qui veulent se concentrer sur leur talent, pas sur les taxes.",
      features: ["Tenue de livres mensuelle", "Rapports TPS / TVQ", "Déclaration T2125 & dépenses", "Bilan de fin d'année"],
      cta: "Choisir ce forfait",
      highlight: true
    },
    {
      name: "Structure Corporate",
      subtitle: "Solution Entreprise",
      price: "749 $",
      description: "Gestion complète pour les petites sociétés incorporées exigeant une rigueur absolue.",
      features: ["Tenue de livres de société", "Préparation T2 / CO-17", "Stratégie dividendes/salaires", "Partenaire CPA pour certification*"],
      cta: "Choisir ce forfait"
    }
  ];

  return (
    <div className="space-y-16 py-10">
      <div className="text-center space-y-4">
        <Badge variant="gold" className="px-4 py-1 text-[10px] uppercase tracking-[0.3em]">Tarifs fixes & Transparents</Badge>
        <h2 className="text-5xl font-serif font-bold text-ivoire">Votre tenue de livres à <span className="animated-gradient-text italic">prix fixe net.</span></h2>
        <p className="text-slate-500 max-w-2xl mx-auto font-medium">Des tarifs transparents et clairs, sans mauvaise surprise. Zéro frais d'ouverture de dossier.</p>
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
              <p className="text-4xl font-serif font-bold text-gold pt-2">{plan.price}</p>
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

      {/* Transparence Box - Ce que je fais / Ce que je ne fais pas */}
      <div className="max-w-4xl mx-auto p-12 glass-card rounded-[2.5rem] border border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gold/[0.01]" />
        <div className="relative z-10 space-y-10">
          <div className="text-center space-y-2">
             <h3 className="font-serif text-3xl font-bold text-ivoire italic">Transparence & Cadre Légal</h3>
             <p className="text-xs text-slate-500 uppercase tracking-widest font-black">Notre périmètre d'intervention réglementaire au Québec</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-6">
            <div className="space-y-6">
               <div className="flex items-center gap-3 text-green-400">
                  <CheckCircle size={24} />
                  <h4 className="font-serif text-xl font-bold text-ivoire">Ce que nous réalisons</h4>
               </div>
               <ul className="space-y-3 text-sm text-slate-400 font-light">
                 <li>• <strong>Tenue de livres mensuelle</strong> complète et conciliations bancaires.</li>
                 <li>• <strong>Préparation de déclarations</strong> de taxes (TPS/TVQ) et d'impôts (T1, T2125).</li>
                 <li>• <strong>Saisie et classement</strong> de vos reçus/factures dans le coffre-fort chiffré.</li>
                 <li>• <strong>Assistance administrative</strong> et préparation des états financiers non audités (Mission de compilation).</li>
               </ul>
            </div>
            
            <div className="space-y-6">
               <div className="flex items-center gap-3 text-gold">
                  <ShieldCheck size={24} />
                  <h4 className="font-serif text-xl font-bold text-ivoire">Ce qui est confié à un CPA*</h4>
               </div>
               <ul className="space-y-3 text-sm text-slate-400 font-light">
                 <li>• <strong>États financiers audités</strong> ou missions d'examen avec opinion publique.</li>
                 <li>• <strong>Signature d'états financiers certifiés</strong> réservée aux CPA auditeurs.</li>
                 <li>• * Pour ces mandats complexes ou réglementés, nous collaborons avec des <strong>CPA externes partenaires</strong> qui valident et signent les déclarations.</li>
               </ul>
            </div>
          </div>
          
          <div className="pt-6 border-t border-white/5 text-center text-xs text-slate-500 leading-relaxed max-w-2xl mx-auto">
            Garantie de lancement : <strong>1er appel conseil gratuit</strong> et garantie <strong>satisfait ou repris</strong>. Nous nous engageons à offrir un service d'aide comptable irréprochable et transparent.
          </div>
        </div>
      </div>
    </div>
  );
}
