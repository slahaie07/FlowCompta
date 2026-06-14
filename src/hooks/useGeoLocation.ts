import { useState, useEffect } from 'react';
import { LanguageCode } from '../lib/i18n';

/**
 * Hook pour détecter dynamiquement la langue et la devise selon la géolocalisation
 */
export function useGeoLocation() {
  const [lang, setLang] = useState<LanguageCode>('fr');
  const [currency, setCurrency] = useState('CAD');

  useEffect(() => {
    const detect = async () => {
      try {
        // Tentative via API IP-API (Simple et sans clé pour ce niveau d'automatisation)
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        
        const country = data.country_code; // ex: 'CA', 'US', 'FR', 'AE'
        
        if (['AE', 'SA', 'MA', 'DZ', 'EG'].includes(country)) {
          setLang('ar');
          setCurrency('EUR'); // Placeholder pour EUR si pays arabe hors zone locale
        } else if (country === 'US' || country === 'GB') {
          setLang('en');
          setCurrency('USD');
        } else if (country === 'FR' || country === 'BE' || country === 'CH') {
          setLang('fr');
          setCurrency('EUR');
        } else {
          // Default : Canada
          setLang('fr');
          setCurrency('CAD');
        }
      } catch (e) {
        console.warn("Échec détection Géo, fallback sur CAD/FR");
      }
    };

    detect();
  }, []);

  return { lang, currency };
}
