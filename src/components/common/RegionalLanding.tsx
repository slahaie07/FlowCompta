import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { getActiveRegions, getRegion, SITE } from '../../lib/canadaNetwork';
import { useLanguage } from '../../hooks/useLanguage';
import { usePageMeta } from '../../hooks/usePageMeta';
import { getCity } from '../../lib/cityData';
import { CityLanding } from './CityLanding';

const PROVINCE_FAQ: Record<string, { q: string; a: string }[]> = {
  QC: [
    { q: 'Dois-je m\'inscrire à la TVQ en plus de la TPS ?', a: 'Oui. Au Québec, la TPS fédérale (5 %) et la TVQ provinciale (9,975 %) sont deux taxes distinctes. Vous faites deux déclarations séparées — à l\'ARC et à Revenu Québec. ComptaFlow gère les deux.' },
    { q: 'Qu\'est-ce que la Loi 25 et comment m\'affecte-t-elle ?', a: 'La Loi 25 impose aux entreprises québécoises de protéger les données personnelles de leurs clients et d\'avoir une politique de confidentialité claire. ComptaFlow est entièrement conforme et héberge vos données au Canada (ca-central-1).' },
    { q: 'Puis-je déduire mes frais comptables ?', a: 'Oui. Les honoraires comptables sont une dépense d\'entreprise déductible. En les confiant à ComptaFlow, vous réduisez votre revenu imposable et optimisez votre charge fiscale.' },
  ],
  ON: [
    { q: 'Quel est le taux de TVH en Ontario ?', a: 'Le taux de TVH en Ontario est de 13 % (5 % fédéral + 8 % provincial). Une seule déclaration est produite à l\'Agence du revenu du Canada. ComptaFlow gère vos remises TVH trimestrielles.' },
    { q: 'Mon entreprise ontarienne doit-elle produire des déclarations provinciales séparées ?', a: 'Pour la TVH, non — tout se fait à l\'ARC depuis 2009. ComptaFlow s\'occupe de l\'ensemble de vos déclarations.' },
    { q: 'ComptaFlow dessert-il toutes les régions de l\'Ontario ?', a: 'Oui. Étant 100 % en ligne, nous servons Toronto, Ottawa, Mississauga, Hamilton, Kitchener, London, Windsor et toutes les autres villes ontariennes sans frais supplémentaires.' },
  ],
  BC: [
    { q: 'Quelle est la différence entre TPS et TVP en Colombie-Britannique ?', a: 'La C.-B. n\'a pas harmonisé sa taxe. TPS (5 %) à l\'ARC + TVP/PST (7 %) séparément au gouvernement provincial. ComptaFlow gère les deux déclarations.' },
    { q: 'Tous les biens et services sont-ils assujettis à la TVP en C.-B. ?', a: 'Non. La TVP de la C.-B. a de nombreuses exemptions (aliments, médicaments sur ordonnance, certains services). Nos comptables vous précisent exactement ce qui est taxable selon votre secteur.' },
    { q: 'ComptaFlow dessert-il Vancouver, Victoria et l\'intérieur de la province ?', a: 'Absolument. Notre service est 100 % en ligne — nous accompagnons les entrepreneurs de tout le territoire de la Colombie-Britannique.' },
  ],
  AB: [
    { q: 'L\'Alberta a-t-elle une taxe de vente provinciale ?', a: 'Non. L\'Alberta est la seule province canadienne sans taxe de vente provinciale. Vous ne payez que la TPS fédérale de 5 % — un avantage compétitif significatif.' },
    { q: 'Dois-je m\'inscrire à la TPS si je suis en Alberta ?', a: 'Oui, si vos revenus taxables dépassent 30 000 $ sur 4 trimestres consécutifs. En dessous, l\'inscription est volontaire mais souvent avantageuse pour récupérer les crédits de taxe sur les intrants.' },
    { q: 'ComptaFlow couvre-t-il Calgary et Edmonton ?', a: 'Oui, et toute la province. Notre portail en ligne n\'a pas de frontières géographiques.' },
  ],
};

const DEFAULT_FAQ = [
  { q: 'Combien coûte la tenue de livres avec ComptaFlow ?', a: 'La tenue de livres mensuelle démarre à 150 $ pour les micro-entreprises, de 300 $ à 500 $ pour les petites entreprises. Les mandats ponctuels sont facturés 45–75 $/h. Ouverture de dossier gratuite.' },
  { q: 'Puis-je accéder à mon dossier à tout moment ?', a: 'Oui. Votre portail client est accessible 24h/24, 7j/7, depuis n\'importe quel appareil. Consultez vos états financiers, téléversez des documents et suivez vos mandats en temps réel.' },
  { q: 'Mes données sont-elles hébergées au Canada ?', a: 'Absolument. Toutes vos données sont hébergées dans des serveurs canadiens (région ca-central-1), conformément à la loi PIPEDA et à la Loi 25 pour les clients québécois.' },
];

const SERVICES_FR = [
  { icon: '📊', title: 'Tenue de livres', desc: 'Saisie, classement, conciliation bancaire mensuelle' },
  { icon: '🧾', title: 'Taxes (TPS/TVQ/TVH)', desc: 'Déclarations trimestrielles, CTI et remboursements' },
  { icon: '👥', title: 'Paie & T4', desc: 'Calcul des retenues, remises ARC, feuillets T4 / Relevé 1' },
  { icon: '📋', title: 'États financiers', desc: 'Bilan, compte de résultat et flux de trésorerie' },
  { icon: '⚙️', title: 'Configuration logiciel', desc: 'QuickBooks, Sage, Wave — mise en place et formation' },
  { icon: '🤖', title: 'IA + Expert humain', desc: 'Automatisation intelligente validée par un comptable attitré' },
];

const SERVICES_EN = [
  { icon: '📊', title: 'Bookkeeping', desc: 'Data entry, filing, monthly bank reconciliation' },
  { icon: '🧾', title: 'Taxes (GST/HST/PST)', desc: 'Quarterly or monthly filings, ITC claims and refunds' },
  { icon: '👥', title: 'Payroll & T4', desc: 'Deduction calculations, CRA remittances, T4 slips' },
  { icon: '📋', title: 'Financial Statements', desc: 'Balance sheet, income statement and cash flow' },
  { icon: '⚙️', title: 'Software Setup', desc: 'QuickBooks, Sage, Wave — setup and training' },
  { icon: '🤖', title: 'AI + Human Expert', desc: 'Intelligent automation validated by a dedicated accountant' },
];

const TRUST_FR = ['🆓 Ouverture gratuite', '🔒 Données au Canada', '⚡ Portail 24/7', '✅ PIPEDA conforme'];
const TRUST_EN = ['🆓 Free file opening', '🔒 Canadian data hosting', '⚡ 24/7 portal', '✅ PIPEDA compliant'];

export function RegionalLanding() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const isFr = lang === 'fr';

  const city = getCity(slug ?? '');
  if (city) return <CityLanding city={city} />;

  const region = getActiveRegions().find((r) => r.seoSlug === slug) ?? getRegion('QC');
  const regionName = isFr ? region.nameFr : region.nameEn;
  const faq = PROVINCE_FAQ[region.code] ?? DEFAULT_FAQ;
  const services = isFr ? SERVICES_FR : SERVICES_EN;
  const trust = isFr ? TRUST_FR : TRUST_EN;

  const titleFr = `Tenue de livres en ligne — ${region.nameFr} | ComptaFlow`;
  const titleEn = `Online Bookkeeping — ${region.nameEn} | ComptaFlow`;
  const descFr = `ComptaFlow : comptabilité et tenue de livres pour entrepreneurs de ${region.nameFr}. ${region.taxLabelFr}, paie, T4. Portail client sécurisé, données au Canada. Ouverture gratuite.`;
  const descEn = `ComptaFlow: accounting and bookkeeping for ${region.nameEn} entrepreneurs. ${region.taxLabelEn} filings, payroll, T4. Secure client portal, Canadian data. Free account opening.`;

  usePageMeta({
    title: isFr ? titleFr : titleEn,
    description: isFr ? descFr : descEn,
    canonical: `${SITE.url}/ca/${region.seoSlug}`,
    keywords: isFr
      ? `comptable en ligne ${region.nameFr}, tenue de livres ${region.nameFr}, comptabilité PME ${region.nameFr}, ${region.taxLabelFr}`
      : `online accountant ${region.nameEn}, bookkeeping ${region.nameEn}, SMB accounting ${region.nameEn}`,
    geoRegion: `CA-${region.code}`,
    geoPlacename: isFr ? region.nameFr : region.nameEn,
  });

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': ['AccountingService', 'ProfessionalService'],
    name: `ComptaFlow — ${regionName}`,
    url: `${SITE.url}/ca/${region.seoSlug}`,
    description: isFr ? descFr : descEn,
    areaServed: { '@type': 'State', name: regionName, containedInPlace: { '@type': 'Country', name: 'Canada' } },
    serviceType: isFr
      ? ['Tenue de livres', 'Déclarations fiscales', 'Paie', 'États financiers']
      : ['Bookkeeping', 'Tax Filings', 'Payroll', 'Financial Statements'],
    priceRange: '$$',
    availableLanguage: ['French', 'English'],
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ComptaFlow', item: SITE.url },
      { '@type': 'ListItem', position: 2, name: regionName, item: `${SITE.url}/ca/${region.seoSlug}` },
    ],
  };

  return (
    <div className="min-h-screen bg-noir text-ivoire font-sans">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Hero */}
      <div className="bg-gradient-to-b from-[#111008] to-noir pt-8 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-silver hover:text-gold transition-colors mb-8 group"
          >
            <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
            {isFr ? "Retour à l'accueil" : 'Back to home'}
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs font-bold tracking-[0.35em] uppercase text-gold/70 border border-gold/20 px-3 py-1 rounded-full">
              ComptaFlow · Canada
            </span>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${region.privacyLaw === 'loi25' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'}`}>
              {region.privacyLaw === 'loi25' ? 'Loi 25 + PIPEDA' : 'PIPEDA'}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-serif font-bold leading-tight mb-4">
            {isFr
              ? <>{isFr ? 'Comptabilité en ligne pour ' : 'Online Accounting for '}<span className="text-gold italic">{region.nameFr}</span></>
              : <>{'Online Accounting for '}<span className="text-gold italic">{region.nameEn}</span></>
            }
          </h1>

          <p className="text-silver text-lg font-light max-w-2xl mb-6 leading-relaxed">
            {isFr
              ? `Tenue de livres, déclarations ${region.taxLabelFr} et paie pour entrepreneurs de ${region.nameFr} — portail sécurisé, données hébergées au Canada, sans rendez-vous.`
              : `Bookkeeping, ${region.taxLabelEn} filings and payroll for ${region.nameEn} entrepreneurs — secure portal, Canadian data hosting, no appointments needed.`
            }
          </p>

          <div className="flex flex-wrap gap-2 mb-8">
            {trust.map((t) => (
              <span key={t} className="text-xs text-silver bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">{t}</span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={() => navigate('/login?next=/onboarding&register=1')} variant="gold" size="lg">
              {isFr ? 'Ouvrir mon dossier (Gratuit)' : 'Open My File (Free)'} <ArrowRight size={16} />
            </Button>
            <Button onClick={() => navigate('/estimate')} variant="outline" size="lg">
              {isFr ? 'Obtenir un devis' : 'Get a Quote'}
            </Button>
          </div>
        </div>
      </div>

      {/* Services */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-2">
            {isFr ? `Nos services en ${region.nameFr}` : `Our services in ${region.nameEn}`}
          </h2>
          <p className="text-silver text-sm mb-8">{isFr ? region.taxLabelFr : region.taxLabelEn}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((s) => (
              <div key={s.title} className="p-5 rounded-2xl border border-gold/10 bg-white/[0.02] hover:border-gold/25 transition-colors">
                <div className="text-2xl mb-3">{s.icon}</div>
                <h3 className="font-semibold text-white mb-1">{s.title}</h3>
                <p className="text-silver text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tax info */}
      <section className="py-14 px-4 bg-[#0d0c0a]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-serif font-bold text-white mb-8">
            {isFr ? `Taxes applicables en ${region.nameFr}` : `Applicable Taxes in ${region.nameEn}`}
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            <div className="p-6 rounded-2xl border border-gold/15 bg-white/[0.02]">
              <p className="text-xs text-gold uppercase tracking-widest font-bold mb-2">{isFr ? 'Régime fiscal' : 'Tax Regime'}</p>
              <p className="text-xl font-semibold text-white">{isFr ? region.taxLabelFr : region.taxLabelEn}</p>
            </div>
            <div className="p-6 rounded-2xl border border-gold/15 bg-white/[0.02]">
              <p className="text-xs text-gold uppercase tracking-widest font-bold mb-2">{isFr ? 'Loi sur la vie privée' : 'Privacy Law'}</p>
              <p className="text-xl font-semibold text-white">
                {region.privacyLaw === 'loi25' ? 'Loi 25 + PIPEDA' : region.privacyLaw === 'pipeda_bc' ? 'PIPEDA + PIPA (BC)' : region.privacyLaw === 'pipa_ab' ? 'PIPEDA + PIPA (AB)' : 'PIPEDA'}
              </p>
            </div>
            <div className="p-6 rounded-2xl border border-gold/15 bg-white/[0.02]">
              <p className="text-xs text-gold uppercase tracking-widest font-bold mb-2">{isFr ? 'Données hébergées' : 'Data Hosted'}</p>
              <p className="text-xl font-semibold text-white">Canada ({SITE.dataRegion})</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-8">
            {isFr ? 'Tarifs transparents' : 'Transparent Pricing'}
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { label: isFr ? 'Horaire' : 'Hourly', price: '45–75$', unit: isFr ? '/h' : '/hr', desc: isFr ? 'Mandats ponctuels, saisie, conciliation' : 'One-time mandates, data entry, reconciliation' },
              { label: isFr ? 'Micro-entreprise' : 'Micro-business', price: '150–250$', unit: isFr ? '/mois' : '/month', desc: isFr ? 'Volume faible, sans employé' : 'Low volume, no employees', highlight: true },
              { label: isFr ? 'PME' : 'SMB', price: '300–800$+', unit: isFr ? '/mois' : '/month', desc: isFr ? 'Volume élevé, paie, états financiers' : 'High volume, payroll, financial statements' },
            ].map((p) => (
              <div key={p.label} className={`p-6 rounded-2xl border ${p.highlight ? 'border-gold/40 bg-gold/5' : 'border-white/10 bg-white/[0.02]'}`}>
                <p className="text-xs font-bold uppercase tracking-widest text-gold mb-1">{p.label}</p>
                <p className="text-3xl font-serif font-bold text-white">{p.price}<span className="text-sm text-silver">{p.unit}</span></p>
                <p className="text-silver text-sm mt-2 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-silver/50 mt-4 text-center">
            {isFr ? '* Tous les tarifs sont hors taxes. Ouverture de dossier gratuite.' : '* All prices are before taxes. Free file opening.'}
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-[#0d0c0a]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-8">
            {isFr ? `Questions fréquentes — ${region.nameFr}` : `FAQ — ${region.nameEn}`}
          </h2>
          <div className="space-y-5">
            {faq.map((f, i) => (
              <div key={i} className="p-5 rounded-2xl border border-white/8 bg-white/[0.02]">
                <h3 className="font-semibold text-white mb-2 flex items-start gap-2">
                  <CheckCircle size={16} className="text-gold mt-0.5 shrink-0" />
                  {f.q}
                </h3>
                <p className="text-silver text-sm leading-relaxed pl-6">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <div className="text-4xl mb-4">🍁</div>
          <h2 className="text-3xl font-serif font-bold text-white mb-3">
            {isFr ? `Prêt pour ${region.nameFr} ?` : `Ready for ${region.nameEn}?`}
          </h2>
          <p className="text-silver mb-8">
            {isFr ? 'Ouverture gratuite · Aucun engagement · Données au Canada' : 'Free opening · No commitment · Canadian data'}
          </p>
          <Button onClick={() => navigate('/login?next=/onboarding&register=1')} variant="gold" size="lg">
            {isFr ? 'Ouvrir mon dossier →' : 'Open My File →'}
          </Button>
        </div>
      </section>

      {/* Region links */}
      <section className="py-12 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs text-silver/40 uppercase tracking-widest font-bold mb-4">
            {isFr ? 'Toutes les provinces et territoires' : 'All provinces and territories'}
          </p>
          <div className="flex flex-wrap gap-2">
            {getActiveRegions().map((r) => (
              <button
                key={r.code}
                onClick={() => navigate(`/ca/${r.seoSlug}`)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${r.code === region.code ? 'border-gold/50 text-gold bg-gold/10' : 'border-white/10 text-silver hover:border-white/30 hover:text-white'}`}
              >
                {isFr ? r.nameFr : r.nameEn}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
