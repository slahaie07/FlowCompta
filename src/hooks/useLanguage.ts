import { useState, useEffect } from 'react';
import { LanguageCode, t } from '../lib/i18n';

export function useLanguage() {
  const [lang, setLang] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('comptaflow_lang');
    if (saved) return saved as LanguageCode;
    
    // Auto-detect based on navigator language or default to 'fr'
    const browserLang = navigator.language.slice(0, 2);
    if (browserLang === 'en' || browserLang === 'fr' || browserLang === 'ar') {
      return browserLang as LanguageCode;
    }
    return 'fr';
  });

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const changeLanguage = (newLang: LanguageCode) => {
    setLang(newLang);
    localStorage.setItem('comptaflow_lang', newLang);
  };

  const toggleLanguage = () => {
    let nextLang: LanguageCode;
    if (lang === 'fr') {
      nextLang = 'en';
    } else if (lang === 'en') {
      nextLang = 'ar';
    } else {
      nextLang = 'fr';
    }
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
