import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, X } from 'lucide-react';
import type { VoiceState } from './useJarvisVoice';

interface JarvisOrbProps {
  isOpen: boolean;
  onToggle: () => void;
  busy?: boolean;
  voiceState?: VoiceState;
  notificationCount?: number;
}

export function JarvisOrb({ isOpen, onToggle, busy, voiceState, notificationCount = 0 }: JarvisOrbProps) {
  const isListening = voiceState === 'listening';
  const isSpeaking = voiceState === 'speaking';
  const isActive = busy || isListening || isSpeaking;

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.5 }}
    >
      {/* Pulse rings */}
      <AnimatePresence>
        {isActive && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full border border-gold/40"
              initial={{ scale: 1, opacity: 0.7 }}
              animate={{ scale: 2.2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border border-gold/20"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.8, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Idle pulse */}
      {!isActive && !isOpen && (
        <motion.div
          className="absolute inset-0 rounded-full bg-gold/20"
          animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Main button */}
      <motion.button
        type="button"
        onClick={onToggle}
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.05 }}
        aria-label={isOpen ? 'Fermer JARVIS' : 'Ouvrir JARVIS'}
        className={`
          relative w-16 h-16 rounded-full flex items-center justify-center
          shadow-[0_0_30px_rgba(198,161,91,0.4)] focus-ring
          transition-all duration-300 border-2
          ${isOpen
            ? 'bg-noir border-gold/60 text-gold'
            : 'premium-gradient-gold border-gold/80 text-midnight'
          }
        `}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={22} />
            </motion.span>
          ) : isListening ? (
            <motion.span
              key="mic-on"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <Mic size={22} />
            </motion.span>
          ) : (
            <motion.span
              key="logo"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <JarvisIcon />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Busy spinner */}
        {busy && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-gold/80"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        )}
      </motion.button>

      {/* Notification badge */}
      <AnimatePresence>
        {notificationCount > 0 && !isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-black text-white border border-noir"
          >
            {notificationCount > 9 ? '9+' : notificationCount}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Label */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute -top-7 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-[0.25em] text-gold/70 whitespace-nowrap pointer-events-none"
          >
            J.A.R.V.I.S.
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function JarvisIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
