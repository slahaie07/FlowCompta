import { motion } from 'motion/react';
import { ShieldCheck, FileText, Camera, Users, Settings } from 'lucide-react';

export function TeamAndTools() {
  const team = [
    {
      name: 'Samuel Lahaie',
      role: 'Fondateur & CPA Senior / Founder & Senior CPA',
      bioEn: 'Samuel is the visionary architect behind Compta-Flow. With over a decade of experience in corporate restructuring, advanced tax planning, and digital systems integration, he ensures that entrepreneurs have the financial foundation to scale securely.',
      bioFr: 'Samuel est l’architecte visionnaire de Compta-Flow. Avec plus d’une décennie d’expérience en restructuration d’entreprises, optimisation fiscale avancée et intégration de systèmes numériques, il veille à ce que les entrepreneurs disposent d’une assise financière solide pour croître en toute sécurité.'
    },
    {
      name: 'Eya',
      role: 'Fiscaliste & CPA Indépendante / Tax Specialist & Independent CPA',
      bioEn: 'Eya brings deep expertise in international tax treaties, cross-border business setups, and multi-jurisdictional compliance. Fluent in multiple languages and highly rigorous, she helps clients navigate complex local and global tax rules with ease.',
      bioFr: 'Eya apporte une expertise pointue des conventions fiscales internationales, de l’implantation d’entreprises transfrontalières et de la conformité multi-juridictionnelle. Parfaitement bilingue et d’une grande rigueur, elle guide nos clients à travers la complexité fiscale locale et internationale.'
    },
    {
      name: 'Sylvie Charette-Clément',
      role: 'Partenaire CPA & Tenue de livres / CPA Partner & Bookkeeping Specialist',
      bioEn: 'Sylvie is dedicated to absolute precision in day-to-day operations. Specializing in advanced bookkeeping systems, payroll compliance, and GST/QST reconciliation, she provides local businesses and freelancers with flawless, audit-ready financial records.',
      bioFr: 'Sylvie se consacre à la précision absolue des opérations quotidiennes. Spécialisée dans les systèmes de tenue de livres avancés, la conformité de la paie et la conciliation de la TPS/TVQ, elle fournit aux entreprises locales et pigistes des livres impeccables et prêts pour l’audit.'
    }
  ];

  const tools = [
    {
      name: 'Dext',
      icon: Camera,
      descEn: 'Instant receipt capture. Snap a photo of your invoices or receipts from your smartphone, and Dext automatically extracts data, eliminating paper clutter.',
      descFr: 'Capture instantanée des reçus. Prenez en photo vos factures d’achat depuis votre téléphone, et Dext extrait automatiquement les données pour éliminer la paperasse.'
    },
    {
      name: 'DocuSign',
      icon: FileText,
      descEn: 'Fully secure, legally binding electronic signatures. Sign representation mandates and official tax documents in a single click from any device.',
      descFr: 'Signatures électroniques sécurisées et juridiquement contraignantes. Signez vos mandats de représentation et documents fiscaux en un clic depuis n’importe quel appareil.'
    },
    {
      name: 'Intuit ProFile',
      icon: ShieldCheck,
      descEn: 'Industry-standard professional tax filing software. Ensures compliance, optimizes tax credits, and enables instant direct transmission (TED) to the CRA and Revenu Québec.',
      descFr: 'Logiciel de déclaration d’impôts professionnel de référence. Garantit la conformité, optimise les crédits fiscaux et permet une transmission électronique directe (TED) rapide.'
    }
  ];

  return (
    <div className="py-24 space-y-32 relative bg-[#030303]">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Team Section */}
      <section id="equipe" className="max-w-7xl mx-auto px-6 relative z-10 space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-gold text-xs font-black tracking-[0.4em] uppercase">Notre Équipe / Our Team</span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-ivoire tracking-tight italic">
            Des experts dédiés à <span className="text-gold">votre réussite.</span>
          </h2>
          <p className="text-silver font-light text-base leading-relaxed">
            Compta-Flow réunit des comptables agréés rigoureux, chevronnés et habités par la passion d’aider les clients de tous horizons — de l’étudiant au chef d’entreprise.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {team.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-3xl bg-surface border border-white/5 hover:border-gold/20 hover:bg-white/[0.01] transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold font-serif font-bold text-2xl">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-serif text-ivoire font-bold">{member.name}</h3>
                    <p className="text-[10px] text-gold/80 font-black uppercase tracking-widest mt-0.5">{member.role}</p>
                  </div>
                </div>

                {/* English Bio (First) */}
                <div className="space-y-2">
                  <span className="text-[9px] font-black tracking-widest text-slate-500 uppercase">English</span>
                  <p className="text-xs text-silver font-light leading-relaxed">
                    {member.bioEn}
                  </p>
                </div>

                {/* French Bio (Second) */}
                <div className="space-y-2 pt-4 border-t border-white/5">
                  <span className="text-[9px] font-black tracking-widest text-slate-500 uppercase">Français</span>
                  <p className="text-xs text-slate-400 font-light leading-relaxed">
                    {member.bioFr}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Tools Section */}
      <section id="outils" className="max-w-7xl mx-auto px-6 relative z-10 space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-gold text-xs font-black tracking-[0.4em] uppercase">Sécurité & Technologie</span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-ivoire tracking-tight italic">
            Les meilleurs outils <span className="text-gold">de l'industrie.</span>
          </h2>
          <p className="text-silver font-light text-base leading-relaxed">
            Pour garantir une protection maximale de vos données (Loi 25) et une efficacité totale, nous travaillons exclusivement avec des connecteurs et logiciels professionnels de confiance.
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
              className="p-8 rounded-3xl bg-surface border border-white/5 hover:border-gold/20 hover:bg-white/[0.01] transition-all duration-300 space-y-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
                  <tool.icon size={22} />
                </div>
                <h3 className="text-2xl font-serif text-ivoire font-bold">{tool.name}</h3>
              </div>

              {/* English Desc (First) */}
              <div className="space-y-1">
                <span className="text-[9px] font-black tracking-widest text-slate-500 uppercase">English</span>
                <p className="text-xs text-silver font-light leading-relaxed">
                  {tool.descEn}
                </p>
              </div>

              {/* French Desc (Second) */}
              <div className="space-y-1 pt-4 border-t border-white/5">
                <span className="text-[9px] font-black tracking-widest text-slate-500 uppercase">Français</span>
                <p className="text-xs text-slate-400 font-light leading-relaxed">
                  {tool.descFr}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
