import { useState, useRef, useCallback } from 'react';

export interface JarvisMessage {
  id: string;
  role: 'user' | 'jarvis';
  text: string;
  navLinks?: { label: string; path: string }[];
  timestamp: Date;
  proactive?: boolean;
}

interface UseJarvisChatOptions {
  userId?: string;
  role?: string;
  province?: string;
  language?: 'fr' | 'en' | 'ar';
  currentPage?: string;
  userName?: string;
}

function parseNavLinks(text: string): { cleanText: string; navLinks: { label: string; path: string }[] } {
  const navLinks: { label: string; path: string }[] = [];
  const cleanText = text
    .replace(/\[NAV:([^|]+)\|([^\]]+)\]/g, (_: string, path: string, label: string) => {
      navLinks.push({ path: path.trim(), label: label.trim() });
      return '';
    })
    .replace(/\s{2,}/g, ' ')
    .trim();
  return { cleanText, navLinks };
}

function buildWelcome(userName?: string, lang: 'fr' | 'en' | 'ar' = 'fr'): JarvisMessage {
  const name = userName ? `, ${userName.split(' ')[0]}` : '';
  const text =
    lang === 'en'
      ? `Good day${name}. I am J.A.R.V.I.S., your intelligent financial assistant. All ComptaFlow systems are online. How may I assist you?`
      : lang === 'ar'
        ? `مرحباً${name}. أنا J.A.R.V.I.S.، مساعدك المالي الذكي. جميع أنظمة ComptaFlow تعمل. كيف يمكنني مساعدتك؟`
        : `Bonjour${name}. Je suis J.A.R.V.I.S., votre assistant financier intelligent. Tous les systèmes ComptaFlow sont en ligne. Comment puis-je vous aider ?`;
  return { id: 'welcome', role: 'jarvis', text, timestamp: new Date() };
}

export function useJarvisChat({
  userId,
  role,
  province,
  language = 'fr',
  currentPage,
  userName,
}: UseJarvisChatOptions) {
  const [messages, setMessages] = useState<JarvisMessage[]>(() => [buildWelcome(userName, language)]);
  const [busy, setBusy] = useState(false);
  const historyRef = useRef<{ role: 'user' | 'assistant'; content: string }[]>([]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || busy) return;

      const userMsg: JarvisMessage = {
        id: `u-${Date.now()}`,
        role: 'user',
        text: trimmed,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      historyRef.current.push({ role: 'user', content: trimmed });
      setBusy(true);

      try {
        const res = await fetch('/api/jarvis/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: trimmed,
            context: { userId, role, province, language, currentPage },
            history: historyRef.current.slice(-8),
          }),
        });

        const data = (await res.json()) as { answer: string };
        const { cleanText, navLinks } = parseNavLinks(data.answer);

        const jarvisMsg: JarvisMessage = {
          id: `j-${Date.now()}`,
          role: 'jarvis',
          text: cleanText,
          navLinks: navLinks.length > 0 ? navLinks : undefined,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, jarvisMsg]);
        historyRef.current.push({ role: 'assistant', content: cleanText });
      } catch {
        const errText =
          language === 'en'
            ? 'Systems briefly offline. Please retry in a moment.'
            : 'Systèmes temporairement hors ligne. Veuillez réessayer.';
        setMessages((prev) => [
          ...prev,
          { id: `err-${Date.now()}`, role: 'jarvis', text: errText, timestamp: new Date() },
        ]);
      } finally {
        setBusy(false);
      }
    },
    [busy, userId, role, province, language, currentPage]
  );

  const clearHistory = useCallback(() => {
    historyRef.current = [];
    setMessages([buildWelcome(userName, language)]);
  }, [userName, language]);

  return { messages, busy, sendMessage, clearHistory };
}
