import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

export function PricingGrid() {
  const navigate = useNavigate();

  const handleCtaClick = () => {
    navigate('/login?next=/onboarding&register=1');
  };

  const tiers = [
    {
      name: 'Étudiants',
      price: '49.99 $',
      period: '/ déclaration',
      desc: 'Idéal pour les étudiants du niveau collégial ou universitaire avec revenus simples.',
      features: [
        'Déclarations fiscales T1 & TP1',
        'Transmission électronique (TED)',
        'Optimisation des crédits de scolarité',
        'Relevé 8 / Relevé 31',
        'Support courriel inclus'
      ],
      popular: false
    },
    {
      name: 'Particuliers',
      price: '89.99 $',
      period: '/ déclaration',
      desc: 'Conçu pour les salariés, retraités et familles ayant des déclarations standards.',
      features: [
        'Déclarations fiscales T1 & TP1',
        'Revenus d’emploi, retraite & chômage',
        'Frais médicaux & dons de charité',
        'Déductions familiales & garde d’enfants',
        'Transmission TED rapide (24-48h)'
      ],
      popular: false
    },
    {
      name: 'Travailleurs Autonomes',
      price: '199.99 $',
      period: '/ déclaration',
      desc: 'Notre forfait le plus populaire pour les professionnels indépendants et pigistes.',
      features: [
        'Déclarations fiscales T1 & TP1 complètes',
        'Formulaire de dépenses T2125',
        'Calcul des dépenses de bureau à domicile',
        'Amortissement des actifs d’entreprise',
        'Optimisation fiscale sur mesure'
      ],
      popular: true
    },
    {
      name: 'Tenue de livres & Taxes',
      price: '249.99 $',
      period: '/ mois',
      desc: 'Pour les PME et entreprises individuelles souhaitant déléguer leur gestion mensuelle.',
      features: [
        'Saisie simplifiée sur Dext (photos)',
        'Conciliation bancaire mensuelle',
        'Production des rapports de TPS & TVQ',
        'États financiers trimestriels',
        'Support prioritaire par SMS/Courriel'
      ],
      popular: false
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-noir">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-gold text-xs font-black tracking-[0.4em] uppercase">Tarifs Transparents</span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-ivoire tracking-tight italic">
            Des prix fixes, <span className="text-gold">sans surprise.</span>
          </h2>
          <p className="text-silver font-light text-base leading-relaxed">
            Trouvez le forfait qui correspond à votre réalité fiscale et à vos besoins comptables.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {tiers.map((tier) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`rounded-3xl p-8 flex flex-col justify-between relative transition-all duration-300 border ${
                tier.popular
                  ? 'border-gold bg-gold/[0.02] shadow-[0_0_40px_rgba(212,175,55,0.1)] scale-105 md:scale-105 z-10'
                  : 'border-white/5 bg-surface hover:border-gold/30 hover:bg-white/[0.01]'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gold text-noir text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-gold/20">
                  <Sparkles size={10} />
                  <span>Populaire</span>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-serif text-ivoire font-bold">{tier.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed min-h-[40px]">{tier.desc}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  {tier.name === 'Tenue de livres & Taxes' && <span className="text-slate-400 text-xs font-semibold mr-1">À partir de</span>}
                  <span className="text-3xl md:text-4xl font-serif font-bold text-gold">{tier.price}</span>
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{tier.period}</span>
                </div>

                <ul className="space-y-3 pt-4 border-t border-white/5">
                  {tier.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-xs text-silver leading-relaxed">
                      <Check size={14} className="text-gold shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <Button
                  variant={tier.popular ? 'gold' : 'secondary'}
                  className="w-full gap-2 text-xs font-bold uppercase tracking-widest h-12 rounded-2xl"
                  onClick={handleCtaClick}
                >
                  Choisir ce forfait <ArrowRight size={14} />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Custom Service Callout */}
        <div className="max-w-4xl mx-auto bg-white/[0.01] border border-white/5 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-gold/20 transition-all duration-300">
          <div className="space-y-2 text-left">
            <h4 className="text-lg font-serif text-ivoire font-bold">Besoin de services sur mesure ?</h4>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
              Que ce soit pour la gestion de la paie multi-employés, l’incorporation d’entreprise ou un accompagnement fiscal avancé, notre équipe est prête à s’adapter à vos défis.
            </p>
          </div>
          <a
            href="mailto:compta-flow@outlook.com"
            className="px-6 py-4 rounded-2xl border border-gold/30 bg-gold/5 text-xs font-bold uppercase tracking-widest text-gold hover:bg-gold/10 hover:border-gold/60 transition-all duration-300 shrink-0"
          >
            Contacter compta-flow@outlook.com
          </a>
        </div>
      </div>
    </section>
  );
}
