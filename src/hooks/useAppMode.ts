import { useState } from 'react';
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
  };

  return { mode, toggleMode };
}
