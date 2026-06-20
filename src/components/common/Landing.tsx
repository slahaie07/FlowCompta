import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight,
  Menu,
  X,
  Globe,
  LogIn
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useLanguage } from '../../hooks/useLanguage';
import { ServicesCatalogSection } from './ServicesCatalogSection';

export function Landing() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { lang, toggleLanguage, t } = useLanguage();

  const goToSignup = () => navigate('/login?next=/onboarding&register=1');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const tickerItems =
    lang === 'en'
      ? [
          'Hourly bookkeeping $45–75/hr',
          'Monthly packages from $150/mo',
          'GST/HST/PST filings',
          'Payroll 1–5 employees',
          'QuickBooks & Sage setup',
          'Encrypted vault',
        ]
      : [
          'Tenue de livres 45–75 $/h',
          'Forfaits dès 150 $/mois',
          'Déclarations taxes (TPS/TVH/TVP)',
          'Paie 1 à 5 employés',
          'Config. QuickBooks & Sage',
          'Coffre-fort chiffré',
        ];

  return (
    <div className="min-h-screen bg-noir text-ivoire font-sans selection:bg-gold selection:text-noir overflow-x-hidden relative">
      <div className="aurora-bg opacity-30 pointer-events-none fixed inset-0" />
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled ? 'bg-noir/90 backdrop-blur-xl border-b border-gold/15 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.4)]' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="w-10 h-10 border-2 border-gold rounded-full flex items-center justify-center text-gold font-serif font-bold text-xl group-hover:bg-gold group-hover:text-noir transition-all duration-300">C</div>
            <span className="text-2xl font-serif font-bold tracking-tight">Compta<em className="text-gold not-italic">flow</em></span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#services" className="text-sm font-medium text-silver hover:text-gold transition-colors">{t('nav.services')}</a>
            <button onClick={() => navigate('/estimate')} className="text-sm font-medium text-silver hover:text-gold transition-colors">{t('nav.getEstimate')}</button>
            <a href="#processus" className="text-sm font-medium text-silver hover:text-gold transition-colors">{t('nav.processus')}</a>
            <a href="#faq" className="text-sm font-medium text-silver hover:text-gold transition-colors">{t('nav.faq')}</a>
            <button onClick={() => navigate('/login')} className="text-sm font-medium text-silver hover:text-gold transition-colors">{t('nav.clientSpace')}</button>
            
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

          <div className="flex items-center gap-4 md:hidden">
            {/* Language Switcher for Mobile */}
            <button 
              onClick={toggleLanguage} 
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-gold/20 bg-white/5 text-[10px] font-bold text-silver uppercase"
            >
              <Globe size={10} className="text-gold" />
              <span>{lang.toUpperCase()}</span>
            </button>

            <button
              className="text-gold focus-ring rounded-lg p-1"
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
            className="md:hidden absolute top-full left-0 right-0 bg-noir border-b border-gold/20 p-6 flex flex-col gap-6"
          >
            <a href="#services" onClick={() => setIsMenuOpen(false)} className="text-lg font-serif">{t('nav.mobileMenuTitle')}</a>
            <a href="#processus" onClick={() => setIsMenuOpen(false)} className="text-lg font-serif">{t('nav.mobileFlux')}</a>
            <a href="#faq" onClick={() => setIsMenuOpen(false)} className="text-lg font-serif">{t('nav.mobileFaq')}</a>
            <button onClick={() => navigate('/login')} className="text-lg font-serif text-left">→ {t('nav.clientSpace')}</button>
            <Button variant="gold" onClick={goToSignup}>{t('nav.mobileOpen')}</Button>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-2 items-center opacity-30">
          <div className="w-[1px] h-32 bg-gradient-to-b from-transparent to-gold" />
          <span className="rotate-180 [writing-mode:vertical-lr] text-[10px] tracking-[0.6em] uppercase font-bold text-slate-500">
            {t('landing.sideTagline')}
          </span>
          <div className="w-[1px] h-32 bg-gradient-to-t from-transparent to-gold" />
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <span className="premium-badge inline-block">{t('hero.tagline')}</span>
              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif font-bold leading-[0.95] tracking-tighter">
                {t('hero.title1')}<br />
                <span className="italic animated-gradient-text">{t('hero.title2')}</span>
              </h1>
              <p className="text-silver text-lg font-light max-w-lg leading-relaxed">
                {t('hero.subtitle')}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="gold" size="lg" onClick={goToSignup} className="px-10 py-7 text-lg group">
                  {t('hero.cta')} <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate('/estimate')}
                  className="px-8 py-7 text-lg glass-button border-gold/20"
                >
                  {t('hero.estimateCta')}
                </Button>
                <Button 
                  variant="secondary" 
                  size="lg" 
                  onClick={() => navigate('/login')} 
                  className="px-8 py-7 text-lg glass-button border-gold/20 flex gap-3 items-center group"
                >
                  <LogIn size={20} className="group-hover:scale-110 transition-transform text-gold" />
                  {t('hero.clientArea')}
                </Button>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 1, delay: 0.2 }}
              className="hidden lg:block relative"
            >
              <div className="p-10 rounded-[24px] glass-card premium-border-gold relative overflow-hidden group">
                {/* Corner Accents */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-gold rounded-tl-[24px]" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-gold rounded-br-[24px]" />
                
                <Badge variant="gold" className="absolute top-6 right-6 font-bold tracking-widest uppercase text-[10px]">{t('hero.preview')}</Badge>
                
                <div className="space-y-6 pt-4">
                  {[
                    { label: t('hero.item1'), value: t('hero.item1Val') },
                    { label: t('hero.item2'), value: "12" },
                    { label: t('hero.item3'), value: t('hero.item3Val') },
                    { label: t('hero.item4'), value: t('hero.item4Val') },
                  ].map((item, i) => (
                    <motion.div 
                      key={item.label} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + (i * 0.1) }}
                      className="flex justify-between items-center border-b border-white/10 pb-4"
                    >
                      <span className="text-silver font-light">{item.label}</span>
                      <span className="text-ivoire font-medium">{item.value}</span>
                    </motion.div>
                  ))}
                  <div className="flex justify-between items-center pt-4">
                    <span className="text-lg font-serif">{t('hero.peace')}</span>
                    <span className="text-2xl font-serif text-gold border-b-[3px] border-double border-gold pb-1">{t('hero.total')}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-1 border border-gold/20 rounded-2xl overflow-hidden mt-20 glass-card">
            {[
              { val: t('hero.stat1Val'), unit: t('hero.stat1Unit'), desc: t('hero.stat1Desc') },
              { val: t('hero.stat2Val'), unit: t('hero.stat2Unit'), desc: t('hero.stat2Desc') },
              { val: t('hero.stat3Val'), unit: t('hero.stat3Unit'), desc: t('hero.stat3Desc') },
            ].map((stat, i) => (
              <div key={i} className="p-10 flex flex-col gap-2 border-r border-gold/10 last:border-r-0">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-serif text-gold font-bold">{stat.val}</span>
                  <span className="text-2xl font-serif text-gold/60">{stat.unit}</span>
                </div>
                <span className="text-silver text-xs font-bold uppercase tracking-widest">{stat.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Ticker */}
      <div className="border-y border-gold/20 py-5 bg-gold/[0.02] overflow-hidden whitespace-nowrap">
        <div className="flex animate-marquee">
          {[1, 2].map((i) => (
            <div key={i} className="flex shrink-0">
              {tickerItems.map((text) => (
                <span key={text} className="mx-10 text-sm font-serif tracking-[0.2em] text-silver uppercase flex items-center gap-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold" /> {text}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Services Section */}
      <section id="services" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-16 lg:gap-20 mb-16">
            <div className="lg:sticky lg:top-32 h-fit space-y-8">
              <span className="text-gold text-xs font-bold tracking-[0.4em] uppercase">
                {t('landing.registry')}
              </span>
              <h2 className="text-4xl md:text-5xl font-serif font-bold tracking-tight leading-tight">
                <span className="animated-gradient-text">{t('services.title')}</span>
              </h2>
              <p className="text-silver font-light leading-relaxed">{t('services.subtitle')}</p>
              <div className="flex flex-col gap-2 text-xs text-slate-500">
                <a href="#tarif-horaire" className="hover:text-gold transition-colors">
                  → {t('services.categories.hourly.title')}
                </a>
                <a href="#forfaits-mensuels" className="hover:text-gold transition-colors">
                  → {t('services.categories.monthly.title')}
                </a>
                <a href="#services-carte" className="hover:text-gold transition-colors">
                  → {t('services.categories.alacarte.title')}
                </a>
              </div>
              <Button variant="gold" size="lg" onClick={goToSignup}>
                {t('services.composer')}
              </Button>
            </div>

            <ServicesCatalogSection t={t} />
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="processus" className="py-32 bg-surface relative overflow-hidden">
        <div className="absolute inset-0 brand-hero-glow pointer-events-none opacity-50" />
        <div className="max-w-7xl mx-auto px-6 text-center space-y-20 relative z-10">
          <div className="space-y-4">
            <span className="text-gold text-xs font-bold tracking-[0.4em] uppercase">{t('process.tagline')}</span>
            <h2 className="text-5xl font-serif font-bold tracking-tight italic">{t('process.title')}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left relative">
            {/* Connecting line */}
            <div className="absolute top-10 left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent hidden lg:block opacity-30" />
            
            {[
              { n: 1, t: t('process.step1Title'), d: t('process.step1Desc') },
              { n: 2, t: t('process.step2Title'), d: t('process.step2Desc') },
              { n: 3, t: t('process.step3Title'), d: t('process.step3Desc') },
            ].map((step, i) => (
              <div key={i} className="space-y-6 relative group">
                <div className="w-20 h-20 rounded-full border border-gold flex items-center justify-center bg-noir text-gold font-serif text-3xl font-bold relative z-10 group-hover:bg-gold group-hover:text-noir transition-all duration-500 shadow-[0_0_0_8px_var(--color-noir)]">
                  {step.n}
                </div>
                <h3 className="text-2xl font-serif">{step.t}</h3>
                <p className="text-silver font-light text-sm leading-relaxed">{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-32">
        <div className="max-w-3xl mx-auto px-6 space-y-16">
          <div className="text-center space-y-4">
            <span className="text-gold text-xs font-bold tracking-[0.4em] uppercase">{t('faq.tagline')}</span>
            <h2 className="text-5xl font-serif font-bold tracking-tight">{t('faq.title')}</h2>
          </div>

          <div className="space-y-4">
            {[
              { q: t('faq.q1'), a: t('faq.a1') },
              { q: t('faq.q2'), a: t('faq.a2') },
              { q: t('faq.q3'), a: t('faq.a3') },
              { q: t('faq.q4'), a: t('faq.a4') },
            ].map((item, i) => (
              <details key={i} className="group border-b border-white/10 pb-4">
                <summary className="list-none cursor-pointer py-4 flex justify-between items-center text-lg font-medium hover:text-gold transition-colors">
                  {item.q}
                  <span className="text-gold text-2xl group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="text-silver font-light text-sm leading-relaxed pb-4 max-w-2xl">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-gold/20 bg-noir">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="w-8 h-8 border border-gold rounded-full flex items-center justify-center text-gold font-serif font-bold text-sm">C</div>
            <span className="text-xl font-serif font-bold tracking-tight">Compta<em className="text-gold not-italic">flow</em></span>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-8 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
            <span>{t('footer.copyright')}</span>
            <span>{t('footer.taxDisclaimer')}</span>
            <button onClick={() => navigate('/privacy')} className="hover:text-gold transition-colors font-bold uppercase tracking-[0.2em]">{t('footer.privacy')}</button>
            <button onClick={() => navigate('/terms')} className="hover:text-gold transition-colors font-bold uppercase tracking-[0.2em]">{t('footer.terms')}</button>
            <button onClick={() => navigate('/legal')} className="hover:text-gold transition-colors font-bold uppercase tracking-[0.2em]">{t('footer.legal')}</button>
            <button onClick={() => navigate('/cookies')} className="hover:text-gold transition-colors font-bold uppercase tracking-[0.2em]">Cookies</button>
            <a href="/admin" className="hover:text-gold transition-colors">{t('footer.admin')}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
