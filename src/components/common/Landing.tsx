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
  X
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export function Landing() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const services = [
    { code: "T1 / TP-1", name: "Impôts — Particulier", price: "89 $", desc: "Déclaration complète, optimisation des crédits (REER, frais médicaux, frais de garde) et transmission électronique à l'ARC et à Revenu Québec." },
    { code: "T2125", name: "Impôts — Travailleur autonome", price: "199 $", desc: "Revenus d'entreprise, dépenses admissibles, TPS/TVQ et acomptes provisionnels calculés pour vous éviter toute pénalité." },
    { code: "T2 / CO-17", name: "Impôts — Société", price: "749 $", desc: "Déclarations fédérale et provinciale, états financiers de fin d'exercice et stratégie salaire-dividendes pour l'actionnaire-dirigeant." },
    { code: "GL-01", name: "Tenue de livres", price: "249 $", desc: "Classement mensuel des transactions, conciliations bancaires, rapports de taxes et états des résultats livrés dans votre portail." },
    { code: "INV-02", name: "Gestion des stocks", price: "179 $", desc: "Suivi des inventaires, coût des marchandises vendues, marges par produit et alertes de rupture — vos stocks deviennent des données." },
    { code: "CFO-03", name: "Finances d'entreprise", price: "499 $", desc: "Direction financière externe : budgets, prévisions de trésorerie, tableaux de bord et accompagnement décisionnel chaque mois." },
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
            <a href="#services" className="text-sm font-medium text-silver hover:text-gold transition-colors">Services</a>
            <a href="#processus" className="text-sm font-medium text-silver hover:text-gold transition-colors">Processus</a>
            <a href="#faq" className="text-sm font-medium text-silver hover:text-gold transition-colors">FAQ</a>
            <button onClick={() => navigate('/login')} className="text-sm font-medium text-silver hover:text-gold transition-colors">Espace client</button>
            <Button variant="gold" size="sm" onClick={() => navigate('/onboarding')} className="shadow-gold/20">Devenir client</Button>
          </div>

          <button className="md:hidden text-gold" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="md:hidden absolute top-full left-0 right-0 bg-noir border-b border-gold/20 p-6 flex flex-col gap-6"
          >
            <a href="#services" onClick={() => setIsMenuOpen(false)} className="text-lg font-serif">Le registre des services</a>
            <a href="#processus" onClick={() => setIsMenuOpen(false)} className="text-lg font-serif">Le flux</a>
            <a href="#faq" onClick={() => setIsMenuOpen(false)} className="text-lg font-serif">Questions fréquentes</a>
            <button onClick={() => navigate('/login')} className="text-lg font-serif text-left">→ Espace client</button>
            <Button variant="gold" onClick={() => navigate('/onboarding')}>Ouvrir mon dossier</Button>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Architectural Pillars Decorations */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-2 items-center opacity-30">
          <div className="w-[1px] h-32 bg-gradient-to-b from-transparent to-gold" />
          <span className="rotate-180 [writing-mode:vertical-lr] text-[10px] tracking-[0.6em] uppercase font-bold text-slate-500">Précision · Fluidité · Excellence</span>
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
              <span className="text-gold text-xs font-bold tracking-[0.4em] uppercase">Cabinet comptable · Québec · MMXXVI</span>
              <h1 className="text-6xl md:text-8xl font-serif font-bold leading-[0.95] tracking-tighter">
                La comptabilité qui<br />
                <span className="italic text-gold bg-gradient-to-r from-gold-light via-gold to-gold-light bg-clip-text text-transparent">coule de source.</span>
              </h1>
              <p className="text-silver text-lg font-light max-w-lg leading-relaxed">
                Comptaflow réunit vos impôts, votre tenue de livres et vos finances d'entreprise dans un seul flux : un portail, des prix fermes, zéro paperasse.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="gold" size="lg" onClick={() => navigate('/onboarding')} className="px-10 py-7 text-lg group">
                  Ouvrir mon dossier — 60 $ <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
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
                  Connexion Google
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
                
                <Badge variant="gold" className="absolute top-6 right-6 font-bold tracking-widest uppercase text-[10px]">Aperçu client</Badge>
                
                <div className="space-y-6 pt-4">
                  {[
                    { label: "Déclaration T1 — transmise à l'ARC", value: "✓" },
                    { label: "Documents reçus au coffre-fort", value: "12" },
                    { label: "Tenue de livres — mai 2026", value: "Conciliée" },
                    { label: "Remboursement estimé", value: "1 847,00 $" },
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
                    <span className="text-lg font-serif">Tranquillité d'esprit</span>
                    <span className="text-2xl font-serif text-gold border-b-[3px] border-double border-gold pb-1">Totale</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-1 border border-gold/20 rounded-2xl overflow-hidden mt-20 bg-gold/5 backdrop-blur-sm">
            {[
              { val: "24", unit: "h", desc: "Délai de réponse garanti, jours ouvrables" },
              { val: "100", unit: "%", desc: "En ligne — du paiement au livrable final" },
              { val: "0", unit: "$", desc: "de surprise : le prix affiché est le prix facturé" },
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
                "T2 / CO-17 Sociétés",
                "TPS / TVQ Conformité",
                "Tenue de livres",
                "Gestion des stocks",
                "Direction financière",
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
            <span className="text-gold text-xs font-bold tracking-[0.4em] uppercase">Article I — Le registre</span>
            <h2 className="text-5xl font-serif font-bold tracking-tight leading-tight">Six services,<br /><span className="text-gold italic">six prix nets.</span></h2>
            <p className="text-silver font-light leading-relaxed">Chaque mandat est inscrit au registre avec son tarif ferme. Sélectionnez, payez, suivez — tout part d'ici.</p>
            <Button variant="gold" size="lg" onClick={() => navigate('/onboarding')}>Composer mon mandat</Button>
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
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-2 block">Net par mandat</span>
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
            <span className="text-gold text-xs font-bold tracking-[0.4em] uppercase">Article II — Le flux</span>
            <h2 className="text-5xl font-serif font-bold tracking-tight italic">Quatre étapes. Un seul flux.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-left relative">
            {/* Connecting line */}
            <div className="absolute top-10 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent hidden lg:block opacity-30" />
            
            {[
              { n: 1, t: "Composez", d: "Sélectionnez vos mandats en ligne. Le frais d'ouverture de 60 $ crée votre espace sécurisé." },
              { n: 2, t: "Payez", d: "Paiement par carte ou Interac. Compte créé instantanément, reçu officiel à l'appui." },
              { n: 3, t: "Déposez", d: "T4, relevés, factures : glissez-déposez le tout dans votre coffre-fort numérique chiffré." },
              { n: 4, t: "Recevez", d: "Suivez l'avancement en temps réel et récupérez vos livrables directement dans le portail." },
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
            <span className="text-gold text-xs font-bold tracking-[0.4em] uppercase">Article V — Questions fréquentes</span>
            <h2 className="text-5xl font-serif font-bold tracking-tight">Avant de nous confier vos chiffres.</h2>
          </div>

          <div className="space-y-4">
            {[
              { q: "À quoi sert le frais d'ouverture de dossier de 60 $ ?", a: "Il couvre la création de votre espace client sécurisé, la vérification initiale de votre dossier fiscal et la configuration de votre coffre-fort de documents. Il n'est facturé qu'une seule fois." },
              { q: "Mes documents sont-ils en sécurité ?", a: "Oui. Vos fichiers sont transmis chiffrés (TLS) et stockés dans une base de données hébergée au Canada, accessible uniquement par vous et votre comptable. Aucun document ne transite par courriel." },
              { q: "Quels formats de documents puis-je déposer ?", a: "PDF, images (photos de reçus), fichiers Excel et CSV — jusqu'à 4 Mo par fichier. Une photo nette de votre T4 prise au téléphone fait parfaitement l'affaire." },
              { q: "Comment suivre l'avancement de mon dossier ?", a: "Chaque mandat a un statut visible en temps réel dans votre portail : en attente de vos documents, à traiter, en cours, puis terminé. Vous recevez vos livrables directement au même endroit." },
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
            <span>© 2026 Comptaflow — Québec, Canada</span>
            <span>Les prix affichés sont hors taxes (TPS 5 % et TVQ 9,975 % en sus).</span>
            <a href="/admin" className="hover:text-gold transition-colors">Administration</a>
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
    </div>
  );
}
