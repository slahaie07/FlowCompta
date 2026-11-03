import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight,
  LogIn,
  Laptop,
  Download
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useLanguage } from '../../hooks/useLanguage';
import { ServicesCatalogSection } from './ServicesCatalogSection';
import { PricingGrid } from './PricingGrid';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';
import { TeamAndTools } from './TeamAndTools';
import { usePwaInstall } from '../../hooks/usePwaInstall';
import { getActiveRegions } from '../../lib/canadaNetwork';

export function Landing() {
  const navigate = useNavigate();
  const { lang, toggleLanguage, t } = useLanguage();
  const { isInstallable, install } = usePwaInstall();

  const goToSignup = () => navigate('/login?next=/onboarding&register=1');

  const tickerItems =
    lang === 'en'
      ? [
          'Hourly bookkeeping $35/hr',
          'Monthly packages from $149.99/mo',
          'GST/HST/PST filings',
          'Payroll 1–5 employees',
          'QuickBooks & Sage setup',
          'Encrypted vault',
        ]
      : [
          'Tenue de livres 35 $/h',
          'Forfaits dès 149,99 $/mois',
          'Déclarations taxes (TPS/TVH/TVP)',
          'Paie 1 à 5 employés',
          'Config. QuickBooks & Sage',
          'Coffre-fort chiffré',
        ];

  useEffect(() => {
    const target = sessionStorage.getItem('comptaflow-scroll-target');
    if (target) {
      sessionStorage.removeItem('comptaflow-scroll-target');
      const timer = setTimeout(() => {
        document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="min-h-screen bg-noir text-ivoire font-sans selection:bg-gold selection:text-noir overflow-x-hidden relative">
      <div className="aurora-bg opacity-30 pointer-events-none fixed inset-0" />
      {/* Navigation */}
      <SiteHeader />

      {/* Hero Section */}
      <header className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Bandeau saisonnier — fin d'année */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 mb-12">
          <div className="bg-gold text-noir rounded-2xl px-6 py-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center shadow-[0_16px_48px_rgba(212,175,55,0.25)]">
            <span className="text-sm font-bold">
              {lang === 'fr'
                ? 'Fin d’année 2026 : faites fermer vos livres avant le 31 décembre — rattrapage dès 75 $/mois, feuillets T4 et RL-1 offerts la 1re année aux clients tenue de livres.'
                : 'Year-end 2026: get your books closed before December 31 — catch-up from $75/month, T4 & RL-1 slips included in year 1 for bookkeeping clients.'}
            </span>
            <button onClick={() => navigate('/estimate')} className="text-sm font-black underline underline-offset-4 hover:opacity-70 transition-opacity">
              {lang === 'fr' ? 'Estimer mon forfait →' : 'Estimate my package →'}
            </button>
          </div>
        </div>
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
              <div className="flex flex-wrap gap-3 text-[11px] font-bold uppercase tracking-widest text-gold/90">
                <span className="border border-gold/30 rounded-full px-4 py-2">{lang === 'fr' ? 'Réponse écrite sous 4 h ouvrables' : 'Written reply within 4 business hours'}</span>
                <span className="border border-gold/30 rounded-full px-4 py-2">{lang === 'fr' ? '100 % en ligne, partout au Canada' : '100% online, across Canada'}</span>
                <span className="border border-gold/30 rounded-full px-4 py-2">{lang === 'fr' ? 'Prix fixes, sans surprise' : 'Fixed prices, no surprises'}</span>
              </div>
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
                  {lang === 'en' ? 'Client Login' : 'Connexion Client'}
                </Button>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="hidden lg:block relative"
            >
              {/* Outer decorative ambient glow */}
              <div className="absolute -inset-4 bg-gradient-to-r from-gold/15 to-indigo-500/10 rounded-[32px] blur-3xl opacity-60 pointer-events-none" />

              {/* Main Mock Portal Card */}
              <div className="p-8 rounded-[28px] glass-card premium-border-gold relative overflow-hidden group select-none">
                {/* Corner Accents */}
                <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-gold/40 rounded-tl-[28px]" />
                <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-gold/40 rounded-br-[28px]" />
                
                {/* Mock Portal Header */}
                <div className="flex justify-between items-center border-b border-white/5 pb-5 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold font-mono text-sm font-bold shadow-[0_0_15px_rgba(212,175,55,0.15)] animate-pulse">
                      CF
                    </div>
                    <div>
                      <div className="text-[11px] font-mono tracking-widest text-slate-500 uppercase">Espace Client</div>
                      <div className="text-sm font-serif font-bold text-ivoire">Cabinet ComptaFlow</div>
                    </div>
                  </div>
                  <Badge variant="gold" className="font-bold tracking-widest uppercase text-[9px] px-2.5 py-1 bg-gold/10 border-gold/25">
                    {lang === 'en' ? 'Live Demo' : 'Démo en direct'}
                  </Badge>
                </div>

                <div className="space-y-5">
                  {/* Financial Graph Mock */}
                  <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Trésorerie active</span>
                      <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        +14.8%
                      </span>
                    </div>
                    {/* SVG Line Graph */}
                    <div className="h-16 w-full pt-2">
                      <svg viewBox="0 0 300 60" className="w-full h-full">
                        <defs>
                          <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        {/* Area */}
                        <path 
                          d="M 0 50 Q 50 30 100 45 T 200 15 T 300 10 L 300 60 L 0 60 Z" 
                          fill="url(#chart-glow)" 
                        />
                        {/* Line */}
                        <path 
                          d="M 0 50 Q 50 30 100 45 T 200 15 T 300 10" 
                          fill="none" 
                          stroke="#D4AF37" 
                          strokeWidth="2.5" 
                          strokeLinecap="round"
                          className="drop-shadow-[0_2px_8px_rgba(212,175,55,0.4)]"
                        />
                        {/* Dots */}
                        <circle cx="100" cy="45" r="3.5" fill="#0A0A0A" stroke="#D4AF37" strokeWidth="1.5" />
                        <circle cx="200" cy="15" r="3.5" fill="#0A0A0A" stroke="#D4AF37" strokeWidth="1.5" />
                        <circle cx="300" cy="10" r="4" fill="#D4AF37" />
                      </svg>
                    </div>
                  </div>

                  {/* Smart Reconciliation Row */}
                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gold/5 border border-gold/10 flex items-center justify-center text-gold">
                        <span className="text-[10px] font-mono font-bold">$</span>
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-semibold text-ivoire">Virement Interac Reçu</div>
                        <div className="text-[10px] text-slate-500 font-mono">1,250.00 $ · RBC Banque</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-emerald-400" />
                      Rapproché
                    </span>
                  </div>

                  {/* Notification équipe */}
                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-gold flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-md">
                      CF
                    </div>
                    <div className="text-left space-y-1">
                      <div className="text-xs font-bold text-ivoire flex items-center gap-1.5">
                        <span>Équipe Compta-Flow</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                        <span className="text-[9px] text-gold uppercase tracking-wider font-mono">Tenue de livres</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        {lang === 'en'
                          ? "Your Q2 GST/HST declarations are optimized and ready for electronic signature."
                          : "Vos déclarations de TPS/TVQ du T2 sont optimisées et prêtes pour signature électronique."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Status */}
                <div className="flex justify-between items-center border-t border-white/5 pt-4 mt-5 text-[10px] font-mono text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {lang === 'en' ? 'Server: Connected' : 'Serveur : Connecté'}
                  </span>
                  <span>PIPEDA &amp; Loi 25 Compliant</span>
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
              <div key={i} className="p-10 flex flex-col gap-2 border-b border-gold/10 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
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

      {/* Services & Pricing Section */}
      <section id="services">
        <PricingGrid />
      </section>

      {/* Tools Section */}
      <TeamAndTools />

      {/* Process Section */}
      <section id="processus" className="py-24 bg-surface relative overflow-hidden">
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
      {/* Confiance — aperçu, page complète à /confiance */}
      <section className="py-24 bg-surface relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-6">
          <span className="text-gold text-xs font-black tracking-[0.4em] uppercase">{lang === 'fr' ? 'Confiance et sécurité' : 'Trust & Security'}</span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-ivoire">{lang === 'fr' ? 'Vos documents restent protégés' : 'Your documents stay protected'}</h2>
          <p className="text-silver font-light leading-relaxed max-w-3xl mx-auto">
            {lang === 'fr'
              ? 'Un dossier d’échange sécurisé pour chaque client, un engagement de confidentialité signé par chaque membre de l’équipe, et un accès limité aux seuls dossiers assignés. Nous ne demandons jamais votre NAS à l’inscription — seulement lorsqu’un mandat l’exige réellement.'
              : 'A secure exchange folder for every client, a signed confidentiality agreement for every team member, and access limited to assigned files only. We never ask for your SIN at sign-up — only when a mandate actually requires it.'}
          </p>
          <Button variant="secondary" onClick={() => navigate('/confiance')} className="glass-button border-gold/20">
            {lang === 'fr' ? 'Voir comment on protège vos données' : 'See how we protect your data'}
          </Button>
        </div>
      </section>

      <section id="faq" className="py-24">
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

      {/* App Install Callout (PWA) */}
      {isInstallable && (
        <section className="py-16 border-t border-gold/15 bg-gold/[0.01] relative overflow-hidden">
          <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gold/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="max-w-4xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-14 h-14 rounded-2xl border border-gold/30 bg-gold/5 flex items-center justify-center text-gold shrink-0 shadow-[0_0_20px_rgba(212,175,55,0.1)]">
                <Laptop size={28} />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif font-bold text-ivoire text-xl">
                  {lang === 'en' ? 'Install the ComptaFlow App' : lang === 'ar' ? 'تثبيت تطبيق ComptaFlow' : 'Installer l\'application ComptaFlow'}
                </h4>
                <p className="text-xs text-silver max-w-lg leading-relaxed">
                  {lang === 'en' 
                    ? 'Get instant secure access directly from your desktop dock or mobile homescreen. Optimized offline capabilities.' 
                    : lang === 'ar' 
                    ? 'احصل على وصول آمن وسريع مباشرة من شاشة جهازك المحمول أو سطح المكتب.' 
                    : 'Accédez instantanément à votre espace sécurisé depuis votre PC ou votre écran d\'accueil mobile. Fluidité optimale.'}
                </p>
              </div>
            </div>
            <Button
              variant="gold"
              onClick={install}
              className="gap-2 text-xs font-bold uppercase tracking-widest px-8 h-14 rounded-2xl cursor-pointer shadow-gold/20 hover:scale-[1.02] transition-transform shrink-0"
            >
              <Download size={15} />
              {lang === 'en' ? 'Install App' : lang === 'ar' ? 'تثبيت التطبيق' : 'Installer l\'App'}
            </Button>
          </div>
        </section>
      )}

      {/* Canada Network SEO Section */}
      <section className="py-16 border-t border-gold/15 bg-noir relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 space-y-10">
          {/* Provinces */}
          <div className="text-center space-y-4">
            <h4 className="font-serif font-bold text-ivoire text-lg tracking-wider">
              {lang === 'en' ? 'Bookkeeping Services across Canada' : 'Services de tenue de livres partout au Canada'}
            </h4>
            <p className="text-slate-500 text-xs max-w-2xl mx-auto leading-relaxed">
              {lang === 'en'
                ? 'Our secure client portal and automated bookkeeping system is compliant with local regulations across all provinces.'
                : 'Notre portail sécurisé et notre système de tenue de livres s\'adaptent aux réglementations fiscales et à la protection des données de chaque province.'}
            </p>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 pt-2">
              {getActiveRegions().map((region) => (
                <button
                  key={region.code}
                  onClick={() => navigate(`/ca/${region.seoSlug}`)}
                  className="text-xs font-mono text-silver hover:text-gold transition-colors flex items-center gap-1.5 border border-white/5 hover:border-gold/30 px-3 py-1.5 rounded-full bg-white/[0.01] cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                  {lang === 'en' ? region.nameEn : region.nameFr}
                </button>
              ))}
            </div>
          </div>

          {/* Cities */}
          <div className="text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold/50">
              {lang === 'en' ? 'Major cities' : 'Grandes villes'}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { slug: 'montreal', fr: 'Montréal', en: 'Montreal' },
                { slug: 'toronto', fr: 'Toronto', en: 'Toronto' },
                { slug: 'vancouver', fr: 'Vancouver', en: 'Vancouver' },
                { slug: 'calgary', fr: 'Calgary', en: 'Calgary' },
                { slug: 'ottawa', fr: 'Ottawa', en: 'Ottawa' },
                { slug: 'edmonton', fr: 'Edmonton', en: 'Edmonton' },
                { slug: 'quebec-ville', fr: 'Québec', en: 'Quebec City' },
                { slug: 'winnipeg', fr: 'Winnipeg', en: 'Winnipeg' },
                { slug: 'mississauga', fr: 'Mississauga', en: 'Mississauga' },
                { slug: 'laval', fr: 'Laval', en: 'Laval' },
                { slug: 'halifax', fr: 'Halifax', en: 'Halifax' },
                { slug: 'victoria', fr: 'Victoria', en: 'Victoria' },
              ].map((city) => (
                <button
                  key={city.slug}
                  onClick={() => navigate(`/ca/${city.slug}`)}
                  className="text-xs text-slate-500 hover:text-gold transition-colors px-3 py-1 rounded-full hover:bg-white/[0.03] border border-transparent hover:border-gold/15"
                >
                  {lang === 'en' ? city.en : city.fr}
                </button>
              ))}
            </div>
          </div>

          {/* Blog link */}
          <div className="text-center pt-2 border-t border-white/5">
            <p className="text-xs text-slate-500 mb-3">
              {lang === 'en' ? 'Accounting guides for Canadian entrepreneurs' : 'Guides comptables pour entrepreneurs canadiens'}
            </p>
            <button
              onClick={() => navigate('/ressources')}
              className="text-xs text-gold hover:underline font-semibold"
            >
              {lang === 'en' ? '📚 Browse accounting resources →' : '📚 Consulter les ressources comptables →'}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}
