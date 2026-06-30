import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { SITE } from '../../lib/canadaNetwork';
import { useLanguage } from '../../hooks/useLanguage';
import { usePageMeta } from '../../hooks/usePageMeta';
import type { CanadianCity } from '../../lib/cityData';
import { CANADIAN_CITIES } from '../../lib/cityData';

interface Props {
  city: CanadianCity;
}

const SERVICES_FR = [
  { icon: '📊', title: 'Tenue de livres', desc: 'Saisie, classement, conciliation bancaire mensuelle' },
  { icon: '🧾', title: 'Taxes', desc: 'Déclarations trimestrielles, CTI et remboursements' },
  { icon: '👥', title: 'Paie & T4', desc: 'Retenues, remises ARC, feuillets T4 / Relevé 1' },
  { icon: '📋', title: 'États financiers', desc: 'Bilan, compte de résultat, flux de trésorerie' },
  { icon: '⚙️', title: 'Configuration logiciel', desc: 'QuickBooks, Sage, Wave — mise en place incluse' },
  { icon: '🤖', title: 'IA + Expert humain', desc: 'Automatisation intelligente validée par un comptable' },
];

const SERVICES_EN = [
  { icon: '📊', title: 'Bookkeeping', desc: 'Data entry, filing, monthly bank reconciliation' },
  { icon: '🧾', title: 'Taxes', desc: 'Quarterly or monthly filings, ITC claims and refunds' },
  { icon: '👥', title: 'Payroll & T4', desc: 'Deductions, CRA remittances, T4 slips' },
  { icon: '📋', title: 'Financial Statements', desc: 'Balance sheet, income statement, cash flow' },
  { icon: '⚙️', title: 'Software Setup', desc: 'QuickBooks, Sage, Wave — setup included' },
  { icon: '🤖', title: 'AI + Human Expert', desc: 'Intelligent automation validated by an accountant' },
];

export function CityLanding({ city }: Props) {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const isFr = lang === 'fr';

  const cityName = isFr ? city.nameFr : city.nameEn;
  const provinceName = isFr ? city.provinceNameFr : city.provinceNameEn;
  const taxNote = isFr ? city.taxNoteFr : city.taxNoteEn;
  const services = isFr ? SERVICES_FR : SERVICES_EN;

  const titleFr = `Comptabilité en ligne ${city.nameFr} | ComptaFlow`;
  const titleEn = `Online Accounting ${city.nameEn} | ComptaFlow`;
  const descFr = `ComptaFlow : tenue de livres, ${city.taxNoteFr} et paie pour entrepreneurs de ${city.nameFr} (${city.provinceNameFr}). Portail client sécurisé, données au Canada. Ouverture gratuite.`;
  const descEn = `ComptaFlow: bookkeeping, ${city.taxNoteEn} filings and payroll for ${city.nameEn} (${city.provinceNameEn}) entrepreneurs. Secure portal, Canadian data. Free account opening.`;

  usePageMeta({
    title: isFr ? titleFr : titleEn,
    description: isFr ? descFr : descEn,
    canonical: `${SITE.url}/ca/${city.slug}`,
    keywords: isFr
      ? `comptable en ligne ${city.nameFr}, tenue de livres ${city.nameFr}, comptabilité PME ${city.nameFr}, ${city.taxNoteFr}`
      : `online accountant ${city.nameEn}, bookkeeping ${city.nameEn}, SMB accounting ${city.nameEn}`,
    geoRegion: `CA-${city.provinceCode}`,
    geoPlacename: cityName,
  });

  const faq = [
    {
      q: isFr ? `ComptaFlow dessert-il ${city.nameFr} ?` : `Does ComptaFlow serve ${city.nameEn}?`,
      a: isFr
        ? `Absolument. ComptaFlow est 100 % en ligne — nous accompagnons tous les entrepreneurs de ${city.nameFr} et ${city.provinceNameFr}, sans frais de déplacement ni contrainte géographique.`
        : `Absolutely. ComptaFlow is 100% online — we serve all ${city.nameEn} and ${city.provinceNameEn} entrepreneurs, with no travel fees or geographic constraints.`,
    },
    {
      q: isFr ? `Quel est le régime de taxes à ${city.nameFr} ?` : `What is the tax regime in ${city.nameEn}?`,
      a: isFr
        ? `${city.nameFr} est en ${city.provinceNameFr}. Le régime applicable est : ${city.taxNoteFr}. ComptaFlow gère vos déclarations selon les règles provinciales exactes de votre situation.`
        : `${city.nameEn} is in ${city.provinceNameEn}. The applicable tax regime is: ${city.taxNoteEn}. ComptaFlow handles your filings according to your exact provincial rules.`,
    },
    {
      q: isFr ? 'Mes données sont-elles sécurisées ?' : 'Is my data secure?',
      a: isFr
        ? `Oui. Toutes vos données sont hébergées au Canada (région ca-central-1), chiffrées en transit (TLS) et au repos. Conformité PIPEDA garantie${city.provinceCode === 'QC' ? ' et Loi 25' : ''}.`
        : `Yes. All your data is hosted in Canada (ca-central-1 region), encrypted in transit (TLS) and at rest. PIPEDA compliance guaranteed.`,
    },
    {
      q: isFr ? 'Combien coûte la tenue de livres ?' : 'How much does bookkeeping cost?',
      a: isFr
        ? 'La tenue de livres mensuelle démarre à 150 $/mois pour les micro-entreprises et les mandats ponctuels sont facturés entre 45 $ et 75 $/h. Ouverture de dossier 100 % gratuite.'
        : 'Monthly bookkeeping starts at $150/month for micro-businesses. One-time mandates are billed $45–$75/hr. File opening is 100% free.',
    },
  ];

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
    name: `ComptaFlow — ${cityName}`,
    url: `${SITE.url}/ca/${city.slug}`,
    description: isFr ? descFr : descEn,
    areaServed: {
      '@type': 'City',
      name: cityName,
      containedInPlace: { '@type': 'State', name: provinceName, containedInPlace: { '@type': 'Country', name: 'Canada' } },
    },
    priceRange: '$$',
    availableLanguage: ['French', 'English'],
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ComptaFlow', item: SITE.url },
      { '@type': 'ListItem', position: 2, name: provinceName, item: `${SITE.url}/ca/${city.provinceSlug}` },
      { '@type': 'ListItem', position: 3, name: cityName, item: `${SITE.url}/ca/${city.slug}` },
    ],
  };

  const sameProvinceCities = CANADIAN_CITIES.filter((c) => c.provinceCode === city.provinceCode && c.slug !== city.slug);

  return (
    <div className="min-h-screen bg-noir text-ivoire font-sans">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Hero */}
      <div className="bg-gradient-to-b from-[#111008] to-noir pt-8 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-8 text-sm text-silver">
            <button onClick={() => navigate('/')} className="hover:text-gold transition-colors">ComptaFlow</button>
            <span>/</span>
            <button onClick={() => navigate(`/ca/${city.provinceSlug}`)} className="hover:text-gold transition-colors">{provinceName}</button>
            <span>/</span>
            <span className="text-gold">{cityName}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs font-bold tracking-widest uppercase text-gold/70 border border-gold/20 px-3 py-1 rounded-full">
              ComptaFlow · {cityName}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-300 font-bold">
              {city.provinceCode === 'QC' ? 'Loi 25 + PIPEDA' : 'PIPEDA'}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-serif font-bold leading-tight mb-4">
            {isFr
              ? <>Comptable en ligne à <span className="text-gold italic">{city.nameFr}</span></>
              : <>Online Accountant in <span className="text-gold italic">{city.nameEn}</span></>
            }
          </h1>

          <p className="text-silver text-lg font-light max-w-2xl mb-6 leading-relaxed">
            {isFr ? city.descriptionFr : city.descriptionEn}
          </p>

          <div className="flex flex-wrap gap-2 mb-8">
            {[
              isFr ? '🆓 Ouverture gratuite' : '🆓 Free file opening',
              taxNote,
              isFr ? '🔒 Données au Canada' : '🔒 Canadian data',
              isFr ? '⚡ Portail 24/7' : '⚡ 24/7 portal',
            ].map((t) => (
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
            {isFr ? `Services comptables à ${city.nameFr}` : `Accounting Services in ${city.nameEn}`}
          </h2>
          <p className="text-silver text-sm mb-8">{taxNote}</p>
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

      {/* Why online */}
      <section className="py-14 px-4 bg-[#0d0c0a]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-serif font-bold text-white mb-6">
            {isFr
              ? `Pourquoi choisir un comptable en ligne à ${city.nameFr} ?`
              : `Why choose an online accountant in ${city.nameEn}?`
            }
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {(isFr ? [
              { title: 'Disponibilité 24/7', desc: 'Accédez à vos documents, factures et états financiers à n\'importe quelle heure, depuis votre téléphone ou ordinateur.' },
              { title: 'Zéro déplacement', desc: `Pas besoin de prendre rendez-vous dans un bureau à ${city.nameFr}. Tout se passe en ligne, en toute sécurité.` },
              { title: 'Tarifs transparents', desc: 'Pas de surprise sur la facture. Nos forfaits et tarifs horaires sont affichés clairement à l\'avance.' },
              { title: 'Données hébergées au Canada', desc: `Conformité PIPEDA${city.provinceCode === 'QC' ? ' et Loi 25' : ''} — vos données personnelles ne quittent jamais le Canada.` },
            ] : [
              { title: '24/7 Availability', desc: 'Access your documents, invoices and financial statements anytime, from your phone or computer.' },
              { title: 'No commuting', desc: `No need to schedule in-person appointments in ${city.nameEn}. Everything happens online, securely.` },
              { title: 'Transparent pricing', desc: 'No billing surprises. Our packages and hourly rates are clearly posted upfront.' },
              { title: 'Canadian data hosting', desc: 'PIPEDA compliant — your personal data never leaves Canada.' },
            ]).map((item) => (
              <div key={item.title} className="flex gap-4 p-5 rounded-2xl border border-white/8 bg-white/[0.01]">
                <CheckCircle size={18} className="text-gold mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                  <p className="text-silver text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-8">
            {isFr ? `FAQ — Comptabilité à ${city.nameFr}` : `FAQ — Accounting in ${city.nameEn}`}
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
      <section className="py-20 px-4 text-center bg-[#0d0c0a]">
        <div className="max-w-xl mx-auto">
          <div className="text-4xl mb-4">🍁</div>
          <h2 className="text-3xl font-serif font-bold text-white mb-3">
            {isFr ? `Commencez à ${city.nameFr} dès aujourd'hui` : `Start in ${city.nameEn} Today`}
          </h2>
          <p className="text-silver mb-8">
            {isFr ? 'Ouverture gratuite · Aucun engagement · Données au Canada' : 'Free opening · No commitment · Canadian data'}
          </p>
          <Button onClick={() => navigate('/login?next=/onboarding&register=1')} variant="gold" size="lg">
            {isFr ? 'Ouvrir mon dossier →' : 'Open My File →'}
          </Button>
        </div>
      </section>

      {/* City links in same province */}
      {sameProvinceCities.length > 0 && (
        <section className="py-10 px-4 border-t border-white/5">
          <div className="max-w-5xl mx-auto">
            <p className="text-xs text-silver/40 uppercase tracking-widest font-bold mb-3">
              {isFr ? `Autres villes en ${city.provinceNameFr}` : `Other cities in ${city.provinceNameEn}`}
            </p>
            <div className="flex flex-wrap gap-2">
              {sameProvinceCities.map((c) => (
                <button
                  key={c.slug}
                  onClick={() => navigate(`/ca/${c.slug}`)}
                  className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-silver hover:border-gold/40 hover:text-gold transition-colors"
                >
                  {isFr ? c.nameFr : c.nameEn}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
