import { useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { JarvisOrb } from './JarvisOrb';
import { JarvisPanel } from './JarvisPanel';

export interface JarvisProps {
  userId?: string;
  role?: string;
  province?: string;
  language?: 'fr' | 'en' | 'ar';
  userName?: string;
}

export function Jarvis({ userId, role, province, language = 'fr', userName }: JarvisProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const location = useLocation();

  const currentPage = location.pathname;

  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  return (
    <>
      <JarvisPanel
        isOpen={isOpen}
        userId={userId}
        role={role}
        province={province}
        language={language}
        currentPage={currentPage}
        userName={userName}
        onBusyChange={setBusy}
      />
      <JarvisOrb
        isOpen={isOpen}
        onToggle={toggle}
        busy={busy}
      />
    </>
  );
}
