import { ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PricingQuestionnaire } from './PricingQuestionnaire';
import { Button } from '../ui/Button';
import { useLanguage } from '../../hooks/useLanguage';
import { isServiceId } from '../../lib/servicesCatalog';

export function EstimatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const serviceParam = searchParams.get('service');
  const initialServiceId = isServiceId(serviceParam) ? serviceParam : undefined;

  return (
    <div className="min-h-screen bg-noir text-ivoire py-12 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <Button variant="ghost" className="gap-2" onClick={() => navigate('/')}>
          <ArrowLeft size={16} /> {t('back')}
        </Button>
        <PricingQuestionnaire showSignupCta initialServiceId={initialServiceId} />
      </div>
    </div>
  );
}
