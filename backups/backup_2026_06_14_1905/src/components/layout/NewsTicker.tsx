import { Newspaper, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';

export function NewsTicker() {
  const news = [
    "ARC : Prolongation du délai pour les déclarations T2 de Juillet 2026.",
    "Revenu Québec : Nouveau crédit d'impôt pour la numérisation des PME.",
    "ComptaFlow : L'analyse IA est maintenant 40% plus rapide via Gemini 1.5.",
    "Marché : Hausse du taux directeur, impact sur les marges de crédit corporatives.",
    "Stratégie : Comment optimiser vos déductions pour le télétravail en 2026."
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full h-8 bg-noir/80 backdrop-blur-md border-t border-gold/10 z-50 overflow-hidden flex items-center">
      <div className="bg-gold text-midnight h-full px-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest z-10">
        <Newspaper size={14} /> Live Fiscal
      </div>
      <motion.div 
        className="flex gap-20 whitespace-nowrap px-10 items-center"
        animate={{ x: [0, -1000] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        {news.map((n, i) => (
          <div key={i} className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest group cursor-pointer hover:text-gold transition-colors">
            <span className="w-1.5 h-1.5 bg-gold rounded-full" />
            {n}
            <ArrowUpRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
        {/* Repeat for seamless scrolling */}
        {news.map((n, i) => (
          <div key={`dup-${i}`} className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest group cursor-pointer hover:text-gold transition-colors">
            <span className="w-1.5 h-1.5 bg-gold rounded-full" />
            {n}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
