import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  ShieldCheck, 
  Clock, 
  CheckCircle, 
  Users, 
  Building, 
  Calculator, 
  FileText, 
  ArrowRight,
  Menu,
  X,
  Globe
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useLanguage } from '../../hooks/useLanguage';

export function Landing() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const { lang, toggleLanguage, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    
    // Check cookie consent for Law 25
    const accepted = localStorage.getItem('comptaflow_cookies_accepted');
    if (!accepted) {
      setShowCookieBanner(true);
    }
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const services = [
    { code: "T1 / TP-1", name: t('services.t1_name'), price: t('services.t1_price'), desc: t('services.t1_desc') },
    { code: "T2125", name: t('services.ta_name'), price: t('services.ta_price'), desc: t('services.ta_desc') },
    { code: "GL-01", name: t('services.gl_name'), price: t('services.gl_price'), desc: t('services.gl_desc') },
    { code: "INV-02", name: t('services.inv_name'), price: t('services.inv_price'), desc: t('services.inv_desc') },
  ];

  return (
    <div className="min-h-screen bg-noir text-ivoire font-sans selection:bg-gold selection:text-noir overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled ? 'bg-noir/95 backdrop-blur-md border-b border-gold/10 py-3' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="w-10 h-10 border-2 border-gold rounded-full flex items-center justify-center text-gold font-serif font-bold text-xl group-hover:bg-gold group-hover:text-noir transition-all duration-300">C</div>
            <span className="text-2xl font-serif font-bold tracking-tight">Compta<em className="text-gold not-italic">flow</em></span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#services" className="text-sm font-medium text-silver hover:text-gold transition-colors">{t('nav.services')}</a>
            <a href="#processus" className="text-sm font-medium text-silver hover:text-gold transition-colors">{t('nav.processus')}</a>
            <a href="#faq" className="text-sm font-medium text-silver hover:text-gold transition-colors">{t('nav.faq')}</a>
            <button onClick={() => navigate('/login')} className="text-sm font-medium text-silver hover:text-gold transition-colors">{t('nav.clientSpace')}</button>
            
            {/* Language Switcher Button */}
            <button 
              onClick={toggleLanguage} 
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/20 bg-white/5 text-[10px] font-bold text-silver uppercase hover:border-gold hover:text-gold transition-all duration-300 cursor-pointer"
            >
              <Globe size={12} className="text-gold" />
              <span>{lang === 'fr' ? 'EN' : 'FR'}</span>
            </button>

            <Button variant="gold" size="sm" onClick={() => navigate('/onboarding')} className="shadow-gold/20">{t('nav.becomeClient')}</Button>
          </div>

          <div className="flex items-center gap-4 md:hidden">
            {/* Language Switcher for Mobile */}
            <button 
              onClick={toggleLanguage} 
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-gold/20 bg-white/5 text-[10px] font-bold text-silver uppercase"
            >
              <Globe size={10} className="text-gold" />
              <span>{lang === 'fr' ? 'EN' : 'FR'}</span>
            </button>

            <button className="text-gold" onClick={() => setIsMenuOpen(!isMenuOpen)}>
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
            <Button variant="gold" onClick={() => navigate('/onboarding')}>{t('nav.mobileOpen')}</Button>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Architectural Pillars Decorations */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-2 items-center opacity-30">
          <div className="w-[1px] h-32 bg-gradient-to-b from-transparent to-gold" />
          <span className="rotate-180 [writing-mode:vertical-lr] text-[10px] tracking-[0.6em] uppercase font-bold text-slate-500">
            {lang === 'fr' ? 'Précision · Fluidité · Excellence' : 'Precision · Fluidity · Excellence'}
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
              <span className="text-gold text-xs font-bold tracking-[0.4em] uppercase">{t('hero.tagline')}</span>
              <h1 className="text-6xl md:text-8xl font-serif font-bold leading-[0.95] tracking-tighter">
                {t('hero.title1')}<br />
                <span className="italic text-gold bg-gradient-to-r from-gold-light via-gold to-gold-light bg-clip-text text-transparent">{t('hero.title2')}</span>
              </h1>
              <p className="text-silver text-lg font-light max-w-lg leading-relaxed">
                {t('hero.subtitle')}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="gold" size="lg" onClick={() => navigate('/onboarding')} className="px-10 py-7 text-lg group">
                  {t('hero.cta')} <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  variant="secondary" 
                  size="lg" 
                  onClick={() => navigate('/login')} 
                  className="px-8 py-7 text-lg glass-button border-gold/20 flex gap-3 items-center group"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-3.27 3.28-8.11 3.28-11.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {t('hero.googleLogin')}
                </Button>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 1, delay: 0.2 }}
              className="hidden lg:block relative"
            >
              <div className="p-10 rounded-[24px] bg-white/[0.03] border border-gold/20 backdrop-blur-xl relative overflow-hidden group">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-1 border border-gold/20 rounded-2xl overflow-hidden mt-20 bg-gold/5 backdrop-blur-sm">
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
              {[
                "T1 / TP-1 Particuliers",
                "T2125 Travailleurs autonomes",
                "TPS / TVQ Conformité",
                "Tenue de livres",
                "Gestion des stocks",
                "Coffre-fort chiffré"
              ].map((text) => (
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
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-20">
          <div className="lg:sticky lg:top-32 h-fit space-y-8">
            <span className="text-gold text-xs font-bold tracking-[0.4em] uppercase">
              {lang === 'fr' ? 'Article I — Le registre' : 'Article I — The Registry'}
            </span>
            <h2 className="text-5xl font-serif font-bold tracking-tight leading-tight">{t('services.title')}</h2>
            <p className="text-silver font-light leading-relaxed">{t('services.subtitle')}</p>
            <Button variant="gold" size="lg" onClick={() => navigate('/onboarding')}>{t('services.composer')}</Button>
          </div>

          <div className="border-t border-gold/30">
            {services.map((svc, i) => (
              <motion.div 
                key={svc.code}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group py-8 border-b border-white/10 flex flex-col md:flex-row md:items-center gap-8 cursor-pointer hover:bg-gold/[0.03] transition-colors px-4 -mx-4 rounded-lg"
                onClick={() => navigate('/onboarding')}
              >
                <span className="text-slate-500 font-serif text-sm tracking-widest">{svc.code}</span>
                <div className="flex-1 space-y-1">
                  <h3 className="text-2xl font-serif group-hover:text-gold transition-colors">{svc.name}</h3>
                  <p className="text-silver text-sm font-light max-w-xl">{svc.desc}</p>
                </div>
                <div className="text-right">
                  <span className="block text-3xl font-serif text-gold border-b-2 border-double border-gold pb-1">{svc.price}</span>
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-2 block">{t('services.perMandate')}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="processus" className="py-32 bg-surface">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-20">
          <div className="space-y-4">
            <span className="text-gold text-xs font-bold tracking-[0.4em] uppercase">{t('process.tagline')}</span>
            <h2 className="text-5xl font-serif font-bold tracking-tight italic">{t('process.title')}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-left relative">
            {/* Connecting line */}
            <div className="absolute top-10 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent hidden lg:block opacity-30" />
            
            {[
              { n: 1, t: t('process.step1Title'), d: t('process.step1Desc') },
              { n: 2, t: t('process.step2Title'), d: t('process.step2Desc') },
              { n: 3, t: t('process.step3Title'), d: t('process.step3Desc') },
              { n: 4, t: t('process.step4Title'), d: t('process.step4Desc') },
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
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-gold rounded-full flex items-center justify-center text-gold font-serif font-bold text-sm">A</div>
            <span className="text-xl font-serif font-bold tracking-tight">A<em className="text-gold not-italic">GY</em></span>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-8 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
            <span>{t('footer.copyright')}</span>
            <span>{t('footer.taxDisclaimer')}</span>
            <button onClick={() => navigate('/privacy')} className="hover:text-gold transition-colors font-bold uppercase tracking-[0.2em]">{t('footer.privacy')}</button>
            <a href="/admin" className="hover:text-gold transition-colors">{t('footer.admin')}</a>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        details > summary::-webkit-details-marker {
          display: none;
        }
      `}</style>

      {showCookieBanner && (
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 inset-x-6 z-[200] max-w-4xl mx-auto p-6 bg-noir/95 border border-gold/30 rounded-2xl shadow-2xl backdrop-blur-lg flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="space-y-1 text-left">
            <h4 className="text-gold font-serif text-lg font-bold flex items-center gap-2">
              {t('cookies.title')}
            </h4>
            <p className="text-silver text-xs font-light max-w-2xl leading-relaxed">
              {t('cookies.desc')}
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <button 
              onClick={() => {
                localStorage.setItem('comptaflow_cookies_accepted', 'false');
                setShowCookieBanner(false);
              }}
              className="px-5 py-2 text-xs font-bold uppercase tracking-widest text-silver hover:text-ivoire border border-white/10 rounded-lg hover:bg-white/5 transition-all"
            >
              {t('cookies.decline')}
            </button>
            <button 
              onClick={() => {
                localStorage.setItem('comptaflow_cookies_accepted', 'true');
                setShowCookieBanner(false);
              }}
              className="px-5 py-2 text-xs font-bold uppercase tracking-widest text-noir bg-gold hover:bg-gold-light rounded-lg transition-all shadow-md shadow-gold/20"
            >
              {t('cookies.accept')}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
