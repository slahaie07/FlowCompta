import { User, Briefcase } from 'lucide-react';
import { AppMode } from '../../types';
import { motion } from 'motion/react';
import { useLanguage } from '../../hooks/useLanguage';

interface ModeSwitcherProps {
  mode: AppMode;
  onToggle: () => void;
}

export function ModeSwitcher({ mode, onToggle }: ModeSwitcherProps) {
  const { t } = useLanguage();

  return (
    <div className="flex bg-noir/50 p-1 rounded-2xl border border-white/5 relative h-12 w-full max-w-[280px]" role="group" aria-label={t('portal.overview.subtitle')}>
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
        type="button"
        aria-pressed={mode === 'business'}
        onClick={() => mode === 'personal' && onToggle()}
        className={`flex-1 flex items-center justify-center gap-2 z-10 text-xs font-bold uppercase tracking-widest transition-colors focus-ring rounded-xl ${
          mode === 'business' ? 'text-noir' : 'text-slate-500 hover:text-ivoire'
        }`}
      >
        <Briefcase size={14} /> {t('business')}
      </button>
      
      <button
        type="button"
        aria-pressed={mode === 'personal'}
        onClick={() => mode === 'business' && onToggle()}
        className={`flex-1 flex items-center justify-center gap-2 z-10 text-xs font-bold uppercase tracking-widest transition-colors focus-ring rounded-xl ${
          mode === 'personal' ? 'text-noir' : 'text-slate-500 hover:text-ivoire'
        }`}
      >
        <User size={14} /> {t('personal')}
      </button>
    </div>
  );
}
