import { useState, useEffect } from 'react';
import { LanguageCode, t } from '../lib/i18n';

export function useLanguage() {
  const [lang, setLang] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('comptaflow_lang');
    if (saved) return saved as LanguageCode;
    
    // Auto-detect based on navigator language or default to 'fr'
    const browserLang = navigator.language.slice(0, 2);
    return (browserLang === 'en' || browserLang === 'fr') ? (browserLang as LanguageCode) : 'fr';
  });

  const changeLanguage = (newLang: LanguageCode) => {
    setLang(newLang);
    localStorage.setItem('comptaflow_lang', newLang);
  };

  const toggleLanguage = () => {
    const nextLang: LanguageCode = lang === 'fr' ? 'en' : 'fr';
    changeLanguage(nextLang);
  };

  const translateHelper = (key: string) => {
    return t(lang, key);
  };

  return { 
    lang, 
    changeLanguage, 
    toggleLanguage, 
    t: translateHelper 
  };
}
