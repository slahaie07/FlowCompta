import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Globe, LogIn, Menu, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { useLanguage } from '../../hooks/useLanguage';
import { CONFIG } from '../../lib/config';
import { trackEvent } from '../../lib/trackEvent';

export function SiteHeader() {
  const { lang, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  // Lot A12 : le parcours principal est la fiche ; le portail passe par « Connexion Client ».
  const goToIntake = () => {
    trackEvent('intake_click', { source: 'site_header', lang });
    window.open(CONFIG.APP.INTAKE_FORM_URL, '_blank', 'noopener,noreferrer');
  };

  const goHome = () => {
    setIsMenuOpen(false);
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  const goToSection = (id: string) => {
    setIsMenuOpen(false);
    if (location.pathname === '/') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      sessionStorage.setItem('comptaflow-scroll-target', id);
      navigate('/');
    }
  };

  return (
    <>
<nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled ? 'bg-noir/90 backdrop-blur-xl border-b border-gold/15 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.4)]' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div
            className="flex items-center gap-3 group cursor-pointer focus-ring"
            role="button"
            tabIndex={0}
            aria-label="Compta-Flow"
            onClick={goHome}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                goHome();
              }
            }}
          >
            <img src="/logo-comptaflow-transparent-sm.webp" alt="Compta-Flow" width={264} height={83} className="h-6 sm:h-7 w-auto shrink-0" />
            <span className="hidden min-[380px]:block text-xl sm:text-2xl font-serif font-bold tracking-tight">Compta<em className="text-gold not-italic">flow</em></span>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            <button onClick={() => goToSection('services')} className="text-sm font-medium text-silver hover:text-gold transition-colors focus-ring">{t('nav.services')}</button>
            <button onClick={() => navigate('/tarifs')} className="text-sm font-medium text-silver hover:text-gold transition-colors focus-ring">{lang === 'fr' ? 'Tarifs' : 'Pricing'}</button>
            <button onClick={() => navigate('/ressources')} className="text-sm font-medium text-silver hover:text-gold transition-colors focus-ring">{lang === 'fr' ? 'Ressources' : 'Resources'}</button>
            <button onClick={() => navigate('/estimate')} className="text-sm font-medium text-silver hover:text-gold transition-colors focus-ring">{t('nav.getEstimate')}</button>
            <button onClick={() => goToSection('processus')} className="text-sm font-medium text-silver hover:text-gold transition-colors focus-ring">{t('nav.processus')}</button>
            <button onClick={() => goToSection('faq')} className="text-sm font-medium text-silver hover:text-gold transition-colors focus-ring">{t('nav.faq')}</button>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/login')}
              className="glass-button border-gold/20 flex gap-2 items-center group cursor-pointer"
            >
              <LogIn size={13} className="text-gold group-hover:scale-110 transition-transform" />
              <span>{lang === 'en' ? 'Client Login' : lang === 'ar' ? 'تسجيل الدخول' : 'Connexion Client'}</span>
            </Button>
            
            <button 
              onClick={toggleLanguage} 
              aria-label={t('portal.changeLanguage')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/20 bg-white/5 text-xs font-bold text-silver uppercase hover:border-gold hover:text-gold transition-all duration-300 cursor-pointer focus-ring"
            >
              <Globe size={12} className="text-gold" />
              <span>{lang.toUpperCase()}</span>
            </button>

            <Button variant="gold" size="sm" onClick={goToIntake} className="shadow-gold/20">{t('nav.becomeClient')}</Button>
          </div>

          <div className="flex items-center gap-4 lg:hidden">
            {/* Language Switcher for Mobile */}
            <button 
              onClick={toggleLanguage}
              aria-label={t('portal.changeLanguage')}
              className="flex items-center gap-1.5 px-3 py-2 min-h-11 rounded-full border border-gold/20 bg-white/5 text-[10px] font-bold text-silver uppercase focus-ring"
            >
              <Globe size={10} className="text-gold" />
              <span>{lang.toUpperCase()}</span>
            </button>

            <button
              ref={menuButtonRef}
              className="text-gold focus-ring rounded-lg p-2"
              aria-label={isMenuOpen ? t('portal.closeMenu') : t('portal.openMenu')}
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="lg:hidden absolute top-full left-0 right-0 bg-noir border-b border-gold/20 p-6 flex flex-col gap-6"
          >
            <button onClick={() => goToSection('services')} className="text-lg font-serif text-left py-2 focus-ring">{t('nav.mobileMenuTitle')}</button>
            <button onClick={() => goToSection('processus')} className="text-lg font-serif text-left py-2 focus-ring">{t('nav.mobileFlux')}</button>
            <button onClick={() => goToSection('faq')} className="text-lg font-serif text-left py-2 focus-ring">{t('nav.mobileFaq')}</button>
            <button onClick={() => { setIsMenuOpen(false); navigate('/tarifs'); }} className="text-lg font-serif text-left py-2 focus-ring">{lang === 'fr' ? 'Tarifs' : 'Pricing'}</button>
            <button onClick={() => { setIsMenuOpen(false); navigate('/ressources'); }} className="text-lg font-serif text-left py-2 focus-ring">{lang === 'fr' ? 'Ressources' : 'Resources'}</button>
            <button onClick={() => { setIsMenuOpen(false); navigate('/estimate'); }} className="text-lg font-serif text-left py-2 focus-ring">{t('nav.getEstimate')}</button>
            <Button
              variant="secondary"
              onClick={() => { setIsMenuOpen(false); navigate('/login'); }}
              className="w-full flex gap-3 justify-center items-center py-4 cursor-pointer"
            >
              <LogIn size={18} className="text-gold" />
              {lang === 'en' ? 'Client Login' : lang === 'ar' ? 'تسجيل الدخول' : 'Connexion Client'}
            </Button>
            <Button variant="gold" onClick={goToIntake} className="py-4 shadow-gold/20">{t('nav.mobileOpen')}</Button>
          </motion.div>
        )}
      </nav>
    </>
  );
}
