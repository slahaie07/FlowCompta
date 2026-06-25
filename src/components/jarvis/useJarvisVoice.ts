import { useState, useRef, useCallback, useEffect } from 'react';

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'unavailable';

interface UseJarvisVoiceOptions {
  language?: 'fr' | 'en' | 'ar';
  onTranscript: (text: string) => void;
}

const LANG_MAP: Record<string, string> = {
  fr: 'fr-CA',
  en: 'en-CA',
  ar: 'ar-SA',
};

export function useJarvisVoice({ language = 'fr', onTranscript }: UseJarvisVoiceOptions) {
  const [voiceState, setVoiceState] = useState<VoiceState>(() => {
    if (typeof window === 'undefined') return 'unavailable';
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    return SpeechRecognition ? 'idle' : 'unavailable';
  });

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      window.speechSynthesis?.cancel();
    };
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition || voiceState === 'listening') return;

    const recognition = new SpeechRecognition();
    recognition.lang = LANG_MAP[language] ?? 'fr-CA';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setVoiceState('listening');
    recognition.onend = () => {
      if (voiceState !== 'speaking') setVoiceState('idle');
    };
    recognition.onerror = () => setVoiceState('idle');
    recognition.onresult = (event: any) => {
      const transcript = event.results[0]?.[0]?.transcript ?? '';
      if (transcript.trim()) {
        setVoiceState('processing');
        onTranscript(transcript.trim());
        setTimeout(() => setVoiceState('idle'), 500);
      } else {
        setVoiceState('idle');
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [voiceState, language, onTranscript]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setVoiceState('idle');
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();

      const cleanText = text
        .replace(/\[NAV:[^\]]+\]/g, '')
        .replace(/\*\*/g, '')
        .replace(/#+\s/g, '')
        .slice(0, 400);

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = LANG_MAP[language] ?? 'fr-CA';
      utterance.rate = 1.05;
      utterance.pitch = 0.9;

      utterance.onstart = () => setVoiceState('speaking');
      utterance.onend = () => setVoiceState('idle');
      utterance.onerror = () => setVoiceState('idle');

      synthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [language]
  );

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setVoiceState('idle');
  }, []);

  const toggle = useCallback(() => {
    if (voiceState === 'listening') stopListening();
    else if (voiceState === 'speaking') stopSpeaking();
    else startListening();
  }, [voiceState, startListening, stopListening, stopSpeaking]);

  return { voiceState, startListening, stopListening, stopSpeaking, speak, toggle };
}
