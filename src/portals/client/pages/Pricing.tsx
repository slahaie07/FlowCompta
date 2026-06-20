import { ArrowRight } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { ServicesCatalogSection } from '../../../components/common/ServicesCatalogSection';
import { useLanguage } from '../../../hooks/useLanguage';
import { ShieldCheck, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Pricing() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="space-y-16 py-10">
      <div className="text-center space-y-4">
        <Badge variant="gold" className="px-4 py-1 text-xs uppercase tracking-[0.3em]">
          {t('pricing.badge')}
        </Badge>
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-ivoire">
          <span className="animated-gradient-text">{t('services.title')}</span>
        </h2>
        <p className="text-slate-500 max-w-2xl mx-auto font-medium">{t('services.subtitle')}</p>
      </div>

      <div className="max-w-5xl mx-auto px-2">
        <ServicesCatalogSection t={t} compact />
      </div>

      <div className="max-w-4xl mx-auto p-12 glass-card premium-border-gold rounded-[2.5rem] relative overflow-hidden">
        <div className="absolute inset-0 bg-gold/[0.01]" />
        <div className="relative z-10 space-y-10">
          <div className="text-center space-y-2">
            <h3 className="font-serif text-3xl font-bold text-ivoire italic">{t('pricing.legalTitle')}</h3>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-black">{t('pricing.legalSubtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-6">
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-green-400">
                <CheckCircle size={24} />
                <h4 className="font-serif text-xl font-bold text-ivoire">{t('pricing.weDo')}</h4>
              </div>
              <ul className="space-y-3 text-sm text-slate-400 font-light">
                <li>• {t('pricing.weDo1')}</li>
                <li>• {t('pricing.weDo2')}</li>
                <li>• {t('pricing.weDo3')}</li>
                <li>• {t('pricing.weDo4')}</li>
              </ul>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3 text-gold">
                <ShieldCheck size={24} />
                <h4 className="font-serif text-xl font-bold text-ivoire">{t('pricing.cpaTitle')}</h4>
              </div>
              <ul className="space-y-3 text-sm text-slate-400 font-light">
                <li>• {t('pricing.cpa1')}</li>
                <li>• {t('pricing.cpa2')}</li>
                <li>• {t('pricing.cpa3')}</li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 text-center">
            <Button variant="gold" className="gap-2" onClick={() => navigate('/login?next=/onboarding&register=1')}>
              {t('services.composer')} <ArrowRight size={14} />
            </Button>
            <p className="mt-6 text-xs text-slate-500 leading-relaxed max-w-2xl mx-auto">
              {t('services.estimateNote')} · {t('footer.taxDisclaimer')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
