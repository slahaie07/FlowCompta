import { PricingQuestionnaire } from './PricingQuestionnaire';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';
import { useLanguage } from '../../hooks/useLanguage';
import { usePageMeta } from '../../hooks/usePageMeta';
import { SITE } from '../../lib/canadaNetwork';

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
        <PricingQuestionnaire showSignupCta />
      </div>
      <SiteFooter />
    </div>
  );
}
