import { PricingQuestionnaire } from './PricingQuestionnaire';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';
import { useLanguage } from '../../hooks/useLanguage';
import { usePageMeta } from '../../hooks/usePageMeta';
import { SITE } from '../../lib/canadaNetwork';
import { CONFIG } from '../../lib/config';

export function EstimatePage() {
  const { lang } = useLanguage();
  const isFr = lang === 'fr';

  usePageMeta({
    title: isFr
      ? 'Estimation gratuite de tenue de livres | ComptaFlow'
      : 'Free Bookkeeping Estimate | ComptaFlow',
    description: isFr
      ? 'Obtenez une estimation gratuite et personnalisée pour vos services de tenue de livres, taxes et paie au Canada. Réponse rapide, sans engagement.'
      : 'Get a free, personalized estimate for your bookkeeping, tax and payroll services in Canada. Fast response, no commitment.',
    lang: isFr ? 'fr' : 'en',
    canonical: `${SITE.url}/estimate`,
  });

  return (
    <div className="min-h-screen bg-noir text-ivoire">
      <SiteHeader />
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-32">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-ivoire text-center mb-10">
          {isFr ? 'Estimez votre forfait en 1 minute' : 'Estimate your plan in 1 minute'}
        </h1>
        <PricingQuestionnaire showSignupCta />
        <p className="mt-10 pt-8 border-t border-white/5 text-center text-sm text-silver font-light leading-relaxed">
          {isFr ? 'Vous préférez nous écrire directement ? Écrivez à ' : 'Prefer to write to us directly? Email '}
          <a href={`mailto:${CONFIG.APP.SUPPORT_EMAIL}`} className="text-gold hover:underline whitespace-nowrap">
            {CONFIG.APP.SUPPORT_EMAIL}
          </a>
          {isFr
            ? ' — réponse écrite sous 4 h ouvrables, sans aucun appel requis.'
            : ' — written reply within 4 business hours, no phone call required.'}
        </p>
      </div>
      <SiteFooter />
    </div>
  );
}
