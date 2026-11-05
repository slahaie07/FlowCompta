import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PricingGrid } from './PricingGrid';
import { Button } from '../ui/Button';
import { useLanguage } from '../../hooks/useLanguage';
import { usePageMeta } from '../../hooks/usePageMeta';
import { SITE } from '../../lib/canadaNetwork';
import { CONFIG } from '../../lib/config';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';

export function TarifsPage() {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const isFr = lang === 'fr';

  usePageMeta({
    title: isFr
      ? 'Tarifs et forfaits — tenue de livres et impôts | Compta-Flow'
      : 'Pricing & Packages — Bookkeeping and Taxes | Compta-Flow',
    description: isFr
      ? 'Grille de prix publique et fixe : tenue de livres dès 149,99 $/mois, service à l’heure à 35 $/h, impôts dès 49,99 $. Aucun frais caché, partout au Canada.'
      : 'Public, fixed pricing: bookkeeping from $149.99/month, hourly service at $35/h, taxes from $49.99. No hidden fees, across Canada.',
    lang: isFr ? 'fr' : 'en',
    canonical: `${SITE.url}/tarifs`,
  });

  return (
    <div className="min-h-screen bg-noir text-ivoire">
      <SiteHeader />
      <h1 className="sr-only">{isFr ? 'Tarifs et forfaits — tenue de livres et impôts' : 'Pricing & Packages — Bookkeeping and Taxes'}</h1>
      <div className="max-w-7xl mx-auto px-6 pt-32">
        <Button variant="ghost" className="gap-2" onClick={() => navigate('/')}>
          <ArrowLeft size={16} /> {t('back')}
        </Button>
      </div>

      <PricingGrid />

      <div className="max-w-5xl mx-auto px-6 pb-24 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="border border-gold/20 rounded-2xl p-6 space-y-2">
            <p className="text-gold font-serif font-bold text-2xl whitespace-nowrap">35 $/h</p>
            <p className="text-sm text-silver font-light">
              {isFr
                ? 'Service à l’heure pour les petits dossiers : estimation écrite avant de commencer, dépôt de 50 %.'
                : 'Hourly service for small files: written estimate before we start, 50% deposit.'}
            </p>
          </div>
          <div className="border border-gold/20 rounded-2xl p-6 space-y-2">
            <p className="text-gold font-serif font-bold text-2xl whitespace-nowrap">{isFr ? 'Dès 75 $/mois' : 'From $75/month'}</p>
            <p className="text-sm text-silver font-light">
              {isFr
                ? 'Rattrapage de livres en retard : 75 $/mois (1 à 6 mois), 65 $ (7 à 12), 60 $ (13 et plus).'
                : 'Catch-up for late books: $75/month (1–6 months), $65 (7–12), $60 (13+).'}
            </p>
          </div>
          <div className="border border-gold/20 rounded-2xl p-6 space-y-2">
            <p className="text-gold font-serif font-bold text-2xl whitespace-nowrap">149 $</p>
            <p className="text-sm text-silver font-light">
              {isFr
                ? 'Ouverture de dossier — offerte aux 10 premiers clients. Aucun frais d’ouverture pour les impôts seulement.'
                : 'File opening fee — waived for the first 10 clients. No opening fee for tax-only files.'}
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-silver/70 font-light">
          {isFr
            ? 'Taxes applicables en sus. Paie : 49 $ + 12 $ par employé par mois ; feuillets T4 et RL-1 à 15 $ par employé, offerts la première année aux clients tenue de livres.'
            : 'Applicable taxes extra. Payroll: $49 + $12 per employee per month; T4 and RL-1 slips at $15 per employee, included in year 1 for bookkeeping clients.'}
        </p>

        <section className="space-y-6">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-center">
            {isFr ? 'Impôts de sociétés et fin d’année' : 'Corporate Taxes & Year-End'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gold/20 rounded-2xl p-6 space-y-2 text-center">
              <p className="text-gold font-serif font-bold text-2xl whitespace-nowrap">499 $</p>
              <p className="font-semibold text-ivoire">{isFr ? 'Société inactive' : 'Inactive corporation'}</p>
              <p className="text-sm text-silver font-light">
                {isFr
                  ? 'Déclaration annuelle d’une société sans activité. T2 et CO-17 inclus.'
                  : 'Annual return for a corporation with no activity. T2 and CO-17 included.'}
              </p>
            </div>
            <div className="border border-gold/20 rounded-2xl p-6 space-y-2 text-center">
              <p className="text-gold font-serif font-bold text-2xl whitespace-nowrap">{isFr ? '1 199 $' : '$1,199'}</p>
              <p className="font-semibold text-ivoire">{isFr ? 'Fin d’année — société active' : 'Year-end — active corporation'}</p>
              <p className="text-sm text-silver font-light">
                {isFr
                  ? 'Fin d’année complète si vos livres sont tenus par Compta-Flow ; dès 1 499 $ sinon. T2 et CO-17 inclus.'
                  : 'Full year-end if your books are kept by Compta-Flow; from $1,499 otherwise. T2 and CO-17 included.'}
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-center">
            {isFr ? 'Démarrage d’entreprise' : 'Business Start-Up'}
          </h2>
          <div className="border border-gold/20 rounded-2xl p-6 space-y-2 text-center max-w-2xl mx-auto">
            <p className="text-gold font-serif font-bold text-2xl whitespace-nowrap">{isFr ? 'Dès 199 $' : 'From $199'}</p>
            <p className="text-sm text-silver font-light">
              {isFr
                ? 'Aide à l’ouverture de compagnie : immatriculation, numéros de taxes et mise en place comptable, pour partir sur des bases propres.'
                : 'Help opening your company: registration, tax numbers and accounting setup, so you start on solid ground.'}
            </p>
          </div>
        </section>

        <div className="text-center space-y-3">
          <h2 className="text-2xl md:text-3xl font-serif font-bold">
            {isFr ? 'Prêt à passer à l’étape suivante ?' : 'Ready for the next step?'}
          </h2>
          <p className="text-silver font-light max-w-xl mx-auto">
            {isFr
              ? 'Estimez votre forfait en une minute, ou devenez client dès maintenant — nous vous répondons par écrit sous 4 h ouvrables.'
              : 'Estimate your package in one minute, or become a client right now — we reply in writing within 4 business hours.'}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="gold" size="lg" className="whitespace-nowrap" onClick={() => navigate('/estimate')}>
            {isFr ? 'Estimer mon forfait' : 'Estimate my package'} <ArrowRight size={16} className="ml-2" />
          </Button>
          <Button variant="secondary" size="lg" asChild>
            <a href={CONFIG.APP.INTAKE_FORM_URL} target="_blank" rel="noreferrer">
              {isFr ? 'Devenir client (2 minutes)' : 'Become a client (2 minutes)'}
            </a>
          </Button>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
