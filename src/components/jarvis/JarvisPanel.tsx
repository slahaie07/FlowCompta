import { useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Mic, MicOff, Trash2, Wifi, WifiOff, Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { JarvisMessageBubble } from './JarvisMessage';
import { JarvisQuickActions } from './JarvisQuickActions';
import { useJarvisChat } from './useJarvisChat';
import { useJarvisVoice } from './useJarvisVoice';

interface JarvisPanelProps {
  isOpen: boolean;
  userId?: string;
  role?: string;
  province?: string;
  language?: 'fr' | 'en' | 'ar';
  currentPage?: string;
  userName?: string;
  onBusyChange?: (busy: boolean) => void;
}

function TypingWave() {
  return (
    <div className="flex items-start gap-2">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-gold/30 to-gold/10 border border-gold/30 flex items-center justify-center shrink-0">
        <span className="text-gold text-[10px] font-black">JV</span>
      </div>
      <div className="bg-white/5 border border-white/8 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="w-1.5 h-1.5 bg-gold/60 rounded-full animate-bounce"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

export function JarvisPanel({
  isOpen,
  userId,
  role = 'client',
  province,
  language = 'fr',
  currentPage,
  userName,
  onBusyChange,
}: JarvisPanelProps) {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, busy, sendMessage, clearHistory } = useJarvisChat({
    userId, role, province, language, currentPage, userName,
  });

  const handleTranscript = useCallback((text: string) => {
    sendMessage(text);
  }, [sendMessage]);

  const { voiceState, toggle: toggleVoice, speak, stopSpeaking } = useJarvisVoice({
    language,
    onTranscript: handleTranscript,
  });

  const isListening = voiceState === 'listening';
  const isSpeaking = voiceState === 'speaking';
  const voiceUnavailable = voiceState === 'unavailable';

  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);

  useEffect(() => {
    if (scrollRef.current) {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      });
    }
  }, [messages, busy]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || busy) return;
    setInput('');
    sendMessage(text);
  }, [input, busy, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNavigate = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  const handleSpeak = useCallback((text: string) => {
    if (voiceEnabled) speak(text);
  }, [voiceEnabled, speak]);

  const latestJarvisIndex = messages.reduce(
    (last, msg, i) => (msg.role === 'jarvis' ? i : last),
    -1
  );

  const placeholder =
    language === 'en'
      ? 'Ask J.A.R.V.I.S. anything…'
      : language === 'ar'
        ? 'اسأل J.A.R.V.I.S. أي شيء…'
        : 'Posez n\'importe quelle question à J.A.R.V.I.S.…';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />

          {/* Panel */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`
              fixed z-40 bg-[#050505]/95 backdrop-blur-2xl border border-white/8
              flex flex-col shadow-[0_-20px_80px_rgba(198,161,91,0.15)]
              /* Mobile: bottom sheet */
              bottom-0 left-0 right-0 h-[85dvh] rounded-t-3xl
              /* Desktop: side panel */
              md:bottom-6 md:right-24 md:left-auto md:w-[420px] md:h-[600px] md:rounded-3xl md:top-auto
            `}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 shrink-0">
              <div className="flex items-center gap-3">
                {/* Animated logo */}
                <div className="relative w-10 h-10">
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-gold/20 border border-gold/30"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  />
                  <div className="absolute inset-0 rounded-xl flex items-center justify-center">
                    <span className="text-gold text-xs font-black tracking-tight">JV</span>
                  </div>
                </div>
                <div>
                  <h2 className="text-sm font-black tracking-[0.15em] text-gold uppercase">
                    J.A.R.V.I.S.
                  </h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <motion.span
                      className="w-1.5 h-1.5 bg-green-400 rounded-full"
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <span className="text-[9px] text-slate-500 uppercase tracking-[0.2em] font-bold">
                      {isListening
                        ? (language === 'en' ? 'Listening…' : 'Écoute…')
                        : isSpeaking
                          ? (language === 'en' ? 'Speaking…' : 'Parole…')
                          : busy
                            ? (language === 'en' ? 'Processing…' : 'Traitement…')
                            : (language === 'en' ? 'Online' : 'En ligne')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Voice output toggle */}
                {!voiceUnavailable && (
                  <button
                    type="button"
                    onClick={() => {
                      if (isSpeaking) stopSpeaking();
                      setVoiceEnabled((v) => !v);
                    }}
                    className={`p-2 rounded-xl transition-colors ${voiceEnabled ? 'text-gold bg-gold/10 border border-gold/20' : 'text-slate-500 hover:text-slate-300 bg-white/5'}`}
                    aria-label="Synthèse vocale"
                  >
                    {voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                  </button>
                )}

                {/* Status */}
                <div className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded-xl border border-white/5">
                  <Wifi size={10} className="text-green-400" />
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                    {role === 'sub_admin' ? 'CPA' : role === 'super_admin' ? 'OWNER' : 'CLIENT'}
                  </span>
                </div>

                {/* Clear */}
                <button
                  type="button"
                  onClick={clearHistory}
                  className="p-2 text-slate-500 hover:text-slate-300 bg-white/5 rounded-xl transition-colors"
                  aria-label="Effacer la conversation"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Quick actions */}
            <div className="border-b border-white/5 shrink-0">
              <JarvisQuickActions role={role} onSelect={(msg) => { sendMessage(msg); }} disabled={busy} />
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
            >
              {messages.map((msg, i) => (
                <JarvisMessageBubble
                  key={msg.id}
                  message={msg}
                  onNavigate={handleNavigate}
                  onSpeak={handleSpeak}
                  isLatest={i === latestJarvisIndex}
                />
              ))}
              {busy && <TypingWave />}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/5 shrink-0">
              <div className="flex items-end gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus-within:border-gold/30 transition-colors">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  rows={1}
                  disabled={busy || isListening}
                  className="flex-1 bg-transparent outline-none text-sm text-ivoire placeholder:text-slate-600 resize-none max-h-28 leading-relaxed disabled:opacity-50"
                  style={{ fieldSizing: 'content' } as React.CSSProperties}
                />

                <div className="flex items-center gap-2 shrink-0">
                  {/* Mic button */}
                  {!voiceUnavailable && (
                    <motion.button
                      type="button"
                      onClick={toggleVoice}
                      whileTap={{ scale: 0.9 }}
                      disabled={busy}
                      className={`
                        p-2 rounded-xl transition-all
                        ${isListening
                          ? 'bg-red-500/20 border border-red-500/40 text-red-400'
                          : 'text-slate-500 hover:text-gold hover:bg-gold/10 disabled:opacity-40'
                        }
                      `}
                      aria-label={isListening ? 'Arrêter l\'écoute' : 'Parler à JARVIS'}
                    >
                      <AnimatePresence mode="wait">
                        {isListening ? (
                          <motion.span
                            key="mic-off"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.6, repeat: Infinity }}
                          >
                            <MicOff size={16} />
                          </motion.span>
                        ) : (
                          <motion.span key="mic-on" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                            <Mic size={16} />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  )}

                  {/* Send button */}
                  <motion.button
                    type="button"
                    onClick={handleSend}
                    whileTap={{ scale: 0.9 }}
                    disabled={!input.trim() || busy}
                    className="p-2 rounded-xl premium-gradient-gold text-midnight disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_0_15px_rgba(198,161,91,0.4)] transition-all"
                    aria-label="Envoyer"
                  >
                    <Send size={16} />
                  </motion.button>
                </div>
              </div>

              <p className="text-center text-[9px] text-slate-700 mt-2 tracking-wider font-bold uppercase">
                J.A.R.V.I.S. — ComptaFlow AI · Données chiffrées AES-256
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
