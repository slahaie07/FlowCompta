import { useState, useEffect } from 'react';
import { AppMode } from '../types';

export function useAppMode() {
  const [mode, setMode] = useState<AppMode>(() => {
    const saved = localStorage.getItem('comptaflow_mode');
    return (saved as AppMode) || 'business';
  });

  const toggleMode = () => {
    const newMode = mode === 'business' ? 'personal' : 'business';
    setMode(newMode);
    localStorage.setItem('comptaflow_mode', newMode);
    
    // Update theme colors dynamically
    if (newMode === 'business') {
      document.documentElement.style.setProperty('--color-gold', '#D4AF37');
      document.documentElement.style.setProperty('--color-sapphire', '#0F52BA');
    } else {
      document.documentElement.style.setProperty('--color-gold', '#0F52BA');
      document.documentElement.style.setProperty('--color-sapphire', '#D4AF37');
    }
  };

  useEffect(() => {
    // Initial color set
    if (mode === 'personal') {
      document.documentElement.style.setProperty('--color-gold', '#0F52BA');
      document.documentElement.style.setProperty('--color-sapphire', '#D4AF37');
    }
  }, []);

  return { mode, toggleMode };
}
