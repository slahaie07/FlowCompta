import { motion } from 'motion/react';
import type { PortalNavSection } from '../types';
import { useLanguage } from '../../hooks/useLanguage';

interface PortalNavProps {
  sections: PortalNavSection[];
  activePath: string;
  portalPrefix: string;
  onNavigate: (path: string) => void;
}

export function PortalNav({ sections, activePath, onNavigate }: PortalNavProps) {
  const { t } = useLanguage();

  return (
    <div className="flex-1 px-4 py-4 space-y-6 overflow-y-auto custom-scrollbar">
      {sections.map((section) => (
        <div key={section.sectionKey} className="space-y-1">
          <p className="px-5 py-2 text-[10px] font-black uppercase tracking-[0.35em] text-slate-600">
            {t(`portal.sections.${section.sectionKey}`)}
          </p>
          {section.items.map((item) => {
            const isActive = activePath === item.path;
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => onNavigate(item.path)}
                className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-500 group relative overflow-hidden focus-ring ${
                  isActive
                    ? 'bg-gradient-to-r from-gold/20 to-transparent text-gold border-l-2 border-gold'
                    : 'text-slate-400 hover:text-ivoire hover:bg-white/5'
                }`}
              >
                <item.icon
                  size={20}
                  className={
                    isActive ? 'text-gold' : 'text-slate-500 group-hover:text-gold transition-colors duration-500'
                  }
                />
                <span className="text-sm font-bold tracking-tight text-left">
                  {t(`portal.nav.${item.labelKey}`)}
                </span>
                {isActive && (
                  <motion.div layoutId="nav-glow" className="absolute inset-0 bg-gold/5 blur-xl -z-10" />
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
