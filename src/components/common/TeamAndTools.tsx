import { motion } from 'motion/react';
import { ShieldCheck, Calculator, Table } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

export function TeamAndTools() {
  const { lang } = useLanguage();
  const isFr = lang === 'fr';
  const tools = [
    {
      name: 'Sage 50',
      icon: Calculator,
      descEn: 'Full-featured accounting software for everyday bookkeeping: transaction entry, bank reconciliations and financial statements — your books are kept and updated in Sage 50.',
      descFr: "Logiciel comptable complet pour la tenue de livres au quotidien : saisie des transactions, conciliations bancaires et états financiers — vos livres sont tenus et mis à jour dans Sage 50.",
    },
    {
      name: 'Microsoft Excel',
      icon: Table,
      descEn: 'Custom spreadsheets to follow your numbers closely: budgets, trackers and reports tailored to your business, prepared and maintained in Excel.',
      descFr: "Tableurs sur mesure pour suivre vos chiffres de près : budgets, suivis et rapports adaptés à votre entreprise, préparés et tenus à jour dans Excel.",
    },
    {
      name: 'Intuit ProFile',
      icon: ShieldCheck,
      descEn: 'Professional tax preparation software. Your returns are prepared with care, the credits you may claim are reviewed one by one, then filed electronically (EFILE) with the CRA and Revenu Québec.',
      descFr: "Logiciel professionnel de préparation de déclarations de revenus. Vos déclarations sont préparées avec rigueur, les crédits auxquels vous avez droit sont passés en revue un à un, puis transmis par voie électronique (TED) à l'ARC et à Revenu Québec.",
    },
  ];

  return (
    <div className="py-24 relative bg-[#030303]">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />
      <section id="outils" className="max-w-7xl mx-auto px-6 relative z-10 space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-gold text-xs font-black tracking-[0.4em] uppercase">{isFr ? 'Sécurité & Technologie' : 'Security & Technology'}</span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-ivoire tracking-tight italic">
            {isFr ? (<>Nos outils <span className="text-gold">de travail.</span></>) : (<>Our <span className="text-gold">work tools.</span></>)}
          </h2>
          <p className="text-silver font-light text-base leading-relaxed">
            {isFr ? 'Pour protéger vos données conformément à la Loi 25 et tenir vos dossiers avec rigueur, nous travaillons dans des logiciels professionnels reconnus : Sage 50, Excel et ProFile.' : 'To protect your data in accordance with Law 25 and keep your books rigorously, we work in recognized professional software: Sage 50, Excel and ProFile.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tools.map((tool, i) => (
            <motion.div
              key={tool.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-3xl glass-card space-y-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
                  <tool.icon size={22} />
                </div>
                <h3 className="text-2xl font-serif text-ivoire font-bold">{tool.name}</h3>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-black tracking-widest text-slate-500 uppercase">English</span>
                <p className="text-xs text-silver font-light leading-relaxed">{tool.descEn}</p>
              </div>

              <div className="space-y-1 pt-4 border-t border-white/5">
                <span className="text-[9px] font-black tracking-widest text-slate-500 uppercase">Français</span>
                <p className="text-xs text-slate-400 font-light leading-relaxed">{tool.descFr}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
