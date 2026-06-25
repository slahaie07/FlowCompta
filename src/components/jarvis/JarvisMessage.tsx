import { motion } from 'motion/react';
import { ExternalLink, Volume2 } from 'lucide-react';
import type { JarvisMessage as JarvisMessageType } from './useJarvisChat';

interface JarvisMessageProps {
  message: JarvisMessageType;
  onNavigate?: (path: string) => void;
  onSpeak?: (text: string) => void;
  isLatest?: boolean;
}

export function JarvisMessageBubble({ message, onNavigate, onSpeak, isLatest }: JarvisMessageProps) {
  const isJarvis = message.role === 'jarvis';
  const timeStr = message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`flex ${isJarvis ? 'items-start' : 'items-end flex-col'} gap-2`}
    >
      {isJarvis && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-gold/30 to-gold/10 border border-gold/30 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-gold text-[10px] font-black tracking-tight">JV</span>
        </div>
      )}

      <div className={`max-w-[85%] ${isJarvis ? 'items-start' : 'items-end flex flex-col'}`}>
        {isJarvis && (
          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-gold/60 mb-1 block">
            J.A.R.V.I.S.
          </span>
        )}

        <div
          className={`
            px-4 py-3 rounded-2xl text-sm leading-relaxed
            ${isJarvis
              ? 'bg-white/5 border border-white/8 rounded-tl-sm text-ivoire'
              : 'bg-gold text-midnight rounded-tr-sm font-medium'
            }
          `}
        >
          <p className="whitespace-pre-wrap break-words">{message.text}</p>
        </div>

        {/* Nav links */}
        {isJarvis && message.navLinks && message.navLinks.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {message.navLinks.map((link) => (
              <button
                key={link.path}
                type="button"
                onClick={() => onNavigate?.(link.path)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gold border border-gold/30 rounded-xl bg-gold/5 hover:bg-gold/15 transition-colors"
              >
                <ExternalLink size={10} />
                {link.label}
              </button>
            ))}
          </div>
        )}

        <div className={`flex items-center gap-2 mt-1 ${isJarvis ? '' : 'justify-end'}`}>
          <span className="text-[10px] text-slate-600">{timeStr}</span>
          {isJarvis && isLatest && onSpeak && (
            <button
              type="button"
              onClick={() => onSpeak(message.text)}
              className="text-slate-600 hover:text-gold transition-colors"
              aria-label="Lire à voix haute"
            >
              <Volume2 size={11} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
