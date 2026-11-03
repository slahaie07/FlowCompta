import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Globe, LogIn, Menu, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { useLanguage } from '../../hooks/useLanguage';

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

  const goToSignup = () => navigate('/login?next=/onboarding&register=1');

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
          <div className="flex items-center gap-3 group cursor-pointer" onClick={goHome}>
            <div className="w-10 h-10 border-2 border-gold rounded-full flex items-center justify-center text-gold font-serif font-bold text-xl group-hover:bg-gold group-hover:text-noir transition-all duration-300">C</div>
            <span className="text-2xl font-serif font-bold tracking-tight">Compta<em className="text-gold not-italic">flow</em></span>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            <button onClick={() => goToSection('services')} className="text-sm font-medium text-silver hover:text-gold transition-colors">{t('nav.services')}</button>
            <button onClick={() => navigate('/tarifs')} className="text-sm font-medium text-silver hover:text-gold transition-colors">{lang === 'fr' ? 'Tarifs' : 'Pricing'}</button>
            <button onClick={() => navigate('/ressources')} className="text-sm font-medium text-silver hover:text-gold transition-colors">{lang === 'fr' ? 'Ressources' : 'Resources'}</button>
            <button onClick={() => navigate('/estimate')} className="text-sm font-medium text-silver hover:text-gold transition-colors">{t('nav.getEstimate')}</button>
            <button onClick={() => goToSection('processus')} className="text-sm font-medium text-silver hover:text-gold transition-colors">{t('nav.processus')}</button>
            <button onClick={() => goToSection('faq')} className="text-sm font-medium text-silver hover:text-gold transition-colors">{t('nav.faq')}</button>
            
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

            <Button variant="gold" size="sm" onClick={goToSignup} className="shadow-gold/20">{t('nav.becomeClient')}</Button>
          </div>

          <div className="flex items-center gap-4 lg:hidden">
            {/* Language Switcher for Mobile */}
            <button 
              onClick={toggleLanguage} 
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-full border border-gold/20 bg-white/5 text-[10px] font-bold text-silver uppercase"
            >
              <Globe size={10} className="text-gold" />
              <span>{lang.toUpperCase()}</span>
            </button>

            <button
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
            <button onClick={() => goToSection('services')} className="text-lg font-serif text-left py-2">{t('nav.mobileMenuTitle')}</button>
            <button onClick={() => goToSection('processus')} className="text-lg font-serif text-left py-2">{t('nav.mobileFlux')}</button>
            <button onClick={() => goToSection('faq')} className="text-lg font-serif text-left py-2">{t('nav.mobileFaq')}</button>
            <button onClick={() => { setIsMenuOpen(false); navigate('/tarifs'); }} className="text-lg font-serif text-left py-2">{lang === 'fr' ? 'Tarifs' : 'Pricing'}</button>
            <button onClick={() => { setIsMenuOpen(false); navigate('/ressources'); }} className="text-lg font-serif text-left py-2">{lang === 'fr' ? 'Ressources' : 'Resources'}</button>
            <button onClick={() => { setIsMenuOpen(false); navigate('/estimate'); }} className="text-lg font-serif text-left py-2">{t('nav.getEstimate')}</button>
            <Button
              variant="secondary"
              onClick={() => { setIsMenuOpen(false); navigate('/login'); }}
              className="w-full flex gap-3 justify-center items-center py-4 cursor-pointer"
            >
              <LogIn size={18} className="text-gold" />
              {lang === 'en' ? 'Client Login' : lang === 'ar' ? 'تسجيل الدخول' : 'Connexion Client'}
            </Button>
            <Button variant="gold" onClick={goToSignup} className="py-4 shadow-gold/20">{t('nav.mobileOpen')}</Button>
          </motion.div>
        )}
      </nav>
    </>
  );
}
