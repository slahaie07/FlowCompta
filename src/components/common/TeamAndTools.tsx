import { motion } from 'motion/react';
import { ShieldCheck, FileText, Camera } from 'lucide-react';

export function TeamAndTools() {
  const tools = [
    {
      name: 'Dext',
      icon: Camera,
      descEn: 'Instant receipt capture. Snap a photo of your invoices or receipts from your smartphone, and Dext automatically extracts data, eliminating paper clutter.',
      descFr: "Capture instantanée des reçus. Prenez en photo vos factures d'achat depuis votre téléphone, et Dext extrait automatiquement les données pour éliminer la paperasse.",
    },
    {
      name: 'DocuSign',
      icon: FileText,
      descEn: 'Fully secure, legally binding electronic signatures. Sign representation mandates and official tax documents in a single click from any device.',
      descFr: "Signatures électroniques sécurisées et juridiquement contraignantes. Signez vos mandats de représentation et documents fiscaux en un clic depuis n'importe quel appareil.",
    },
    {
      name: 'Intuit ProFile',
      icon: ShieldCheck,
      descEn: 'Industry-standard professional tax filing software. Ensures compliance, optimizes tax credits, and enables instant direct transmission (TED) to the CRA and Revenu Québec.',
      descFr: "Logiciel de déclaration d'impôts professionnel de référence. Garantit la conformité, optimise les crédits fiscaux et permet une transmission électronique directe (TED) rapide.",
    },
  ];

  return (
    <div className="py-24 relative bg-[#030303]">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />
      <section id="outils" className="max-w-7xl mx-auto px-6 relative z-10 space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-gold text-xs font-black tracking-[0.4em] uppercase">Sécurité &amp; Technologie</span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-ivoire tracking-tight italic">
            Les meilleurs outils <span className="text-gold">de l&apos;industrie.</span>
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
