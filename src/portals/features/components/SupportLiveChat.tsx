import { Send, User } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { useLanguage } from '../../../hooks/useLanguage';
import { DEFAULT_PERSONA, formatResponseTime } from '../../../agents/personas';
import type { PublicSupportReply } from '../../../agents/types';

interface ChatMessage {
  id: string;
  role: 'user' | 'advisor';
  text: string;
  advisorName?: string;
  advisorTitle?: string;
  advisorInitials?: string;
  timeLabel?: string;
}

interface SupportLiveChatProps {
  province?: string;
  userId?: string;
}

function TypingIndicator({ name }: { name: string }) {
  return (
    <div className="flex items-start gap-3 animate-in fade-in duration-300">
      <div className="w-9 h-9 rounded-xl bg-gold/15 text-gold border border-gold/25 flex items-center justify-center text-xs font-bold shrink-0">
        …
      </div>
      <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1.5">{name}</p>
        <div className="flex gap-1 items-center h-4">
          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

export function SupportLiveChat({ province, userId }: SupportLiveChatProps) {
  const { t, lang } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [typingAdvisor, setTypingAdvisor] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<{ role: 'user' | 'assistant'; content: string }[]>([]);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    });
  }, []);

  useEffect(() => {
    if (initialized) return;
    setInitialized(true);
    const welcome =
      lang === 'en'
        ? `Hi! I'm ${DEFAULT_PERSONA.displayName}, your ComptaFlow contact. How can I help you today?`
        : lang === 'ar'
          ? `مرحباً! أنا ${DEFAULT_PERSONA.displayName}، مسؤولتك في ComptaFlow. كيف يمكنني مساعدتك؟`
          : `Bonjour ! Je suis ${DEFAULT_PERSONA.displayName}, votre interlocutrice ComptaFlow. Comment puis-je vous aider ?`;
    setMessages([
      {
        id: 'welcome',
        role: 'advisor',
        text: welcome,
        advisorName: DEFAULT_PERSONA.displayName,
        advisorTitle:
          lang === 'en'
            ? DEFAULT_PERSONA.titleEn
            : lang === 'ar'
              ? DEFAULT_PERSONA.titleAr
              : DEFAULT_PERSONA.titleFr,
        advisorInitials: DEFAULT_PERSONA.initials,
        timeLabel: formatResponseTime(new Date().toISOString(), lang),
      },
    ]);
  }, [initialized, lang]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingAdvisor, scrollToBottom]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || busy) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text,
      timeLabel: formatResponseTime(new Date().toISOString(), lang),
    };

    setMessages((prev) => [...prev, userMsg]);
    historyRef.current.push({ role: 'user', content: text });
    setInput('');
    setBusy(true);

    try {
      const res = await fetch('/api/support/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: {
            channel: 'support-chat',
            language: lang,
            province,
            userId,
            role: 'client',
          },
          history: historyRef.current.slice(-8),
        }),
      });

      const data = (await res.json()) as PublicSupportReply;
      setTypingAdvisor(data.advisor.name);
      scrollToBottom();

      await new Promise((r) => setTimeout(r, data.typingDelayMs));

      setTypingAdvisor(null);
      const advisorMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'advisor',
        text: data.answer,
        advisorName: data.advisor.name,
        advisorTitle: data.advisor.title,
        advisorInitials: data.advisor.initials,
        timeLabel: formatResponseTime(data.respondedAt, lang),
      };
      setMessages((prev) => [...prev, advisorMsg]);
      historyRef.current.push({ role: 'assistant', content: data.answer });
    } catch {
      setTypingAdvisor(null);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'advisor',
          text: t('support.chatError'),
          advisorName: DEFAULT_PERSONA.displayName,
          advisorInitials: DEFAULT_PERSONA.initials,
          timeLabel: formatResponseTime(new Date().toISOString(), lang),
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col h-[420px] border border-white/10 rounded-2xl overflow-hidden bg-noir/40">
      <div className="px-5 py-4 border-b border-white/5 bg-white/5 flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gold/20 text-gold border border-gold/30 flex items-center justify-center font-bold text-sm">
          {typingAdvisor ? '…' : DEFAULT_PERSONA.initials}
        </div>
        <div>
          <h4 className="text-sm font-serif text-ivoire italic">{t('support.liveChatTitle')}</h4>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
              {typingAdvisor
                ? `${typingAdvisor} ${t('support.typingPrefix')}…`
                : t('support.onlineNow')}
            </span>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
        {messages.map((msg) =>
          msg.role === 'user' ? (
            <div key={msg.id} className="flex flex-col items-end">
              <div className="px-4 py-2.5 rounded-2xl rounded-tr-sm bg-gold text-midnight max-w-[85%] text-sm leading-relaxed">
                {msg.text}
              </div>
              {msg.timeLabel && (
                <span className="text-[9px] text-slate-600 font-bold uppercase mt-1.5 tracking-widest">
                  {msg.timeLabel}
                </span>
              )}
            </div>
          ) : (
            <div key={msg.id} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gold text-xs font-bold shrink-0">
                {msg.advisorInitials ?? <User size={16} />}
              </div>
              <div className="flex flex-col items-start max-w-[85%]">
                <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3">
                  {(msg.advisorName || msg.advisorTitle) && (
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1.5">
                      {msg.advisorName}
                      {msg.advisorTitle ? ` · ${msg.advisorTitle}` : ''}
                    </p>
                  )}
                  <p className="text-sm text-silver leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
                {msg.timeLabel && (
                  <span className="text-[9px] text-slate-600 font-bold uppercase mt-1.5 tracking-widest">
                    {msg.timeLabel}
                  </span>
                )}
              </div>
            </div>
          )
        )}
        {typingAdvisor && <TypingIndicator name={typingAdvisor} />}
      </div>

      <div className="p-4 border-t border-white/5 bg-obsidian/50 shrink-0 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder={t('support.chatPlaceholder')}
          disabled={busy}
          className="flex-1 bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm outline-none text-silver placeholder:text-slate-600 focus:ring-1 focus:ring-gold/30"
        />
        <Button
          variant="gold"
          className="w-12 h-12 rounded-xl p-0 shrink-0"
          onClick={sendMessage}
          disabled={busy || !input.trim()}
          aria-label={t('support.send')}
        >
          <Send size={18} />
        </Button>
      </div>
    </div>
  );
}
