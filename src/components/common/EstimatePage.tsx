import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PricingQuestionnaire } from './PricingQuestionnaire';
import { Button } from '../ui/Button';
import { useLanguage } from '../../hooks/useLanguage';
import { usePageMeta } from '../../hooks/usePageMeta';
import { SITE } from '../../lib/canadaNetwork';

export function EstimatePage() {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
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
    <div className="min-h-screen bg-noir text-ivoire py-12 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <Button variant="ghost" className="gap-2" onClick={() => navigate('/')}>
          <ArrowLeft size={16} /> {t('back')}
        </Button>
        <PricingQuestionnaire showSignupCta />
      </div>
    </div>
  );
}
