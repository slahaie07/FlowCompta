import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PricingQuestionnaire } from './PricingQuestionnaire';
import { Button } from '../ui/Button';
import { useLanguage } from '../../hooks/useLanguage';

export function EstimatePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

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
