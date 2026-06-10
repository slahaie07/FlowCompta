import { User, Briefcase } from 'lucide-react';
import { AppMode } from '../../types';
import { motion } from 'motion/react';

interface ModeSwitcherProps {
  mode: AppMode;
  onToggle: () => void;
}

export function ModeSwitcher({ mode, onToggle }: ModeSwitcherProps) {
  return (
    <div className="flex bg-midnight/50 p-1 rounded-2xl border border-white/5 relative h-12 w-full max-w-[280px]">
      <motion.div
        className="absolute top-1 bottom-1 bg-gold rounded-xl shadow-glow-sm"
        initial={false}
        animate={{
          left: mode === 'business' ? '4px' : '50%',
          right: mode === 'business' ? '50%' : '4px',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />
      
      <button
        onClick={() => mode === 'personal' && onToggle()}
        className={`flex-1 flex items-center justify-center gap-2 z-10 text-xs font-bold uppercase tracking-widest transition-colors ${
          mode === 'business' ? 'text-midnight' : 'text-slate-500 hover:text-silver'
        }`}
      >
        <Briefcase size={14} /> Business
      </button>
      
      <button
        onClick={() => mode === 'business' && onToggle()}
        className={`flex-1 flex items-center justify-center gap-2 z-10 text-xs font-bold uppercase tracking-widest transition-colors ${
          mode === 'personal' ? 'text-midnight' : 'text-slate-500 hover:text-silver'
        }`}
      >
        <User size={14} /> Personnel
      </button>
    </div>
  );
}
