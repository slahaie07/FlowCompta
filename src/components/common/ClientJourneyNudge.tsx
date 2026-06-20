import { ChevronRight, ClipboardList, Sparkles } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useLanguage } from '../../hooks/useLanguage';
import { usePortalNavigate } from '../../hooks/usePortalNavigate';
import { useServiceProcedureProgress } from '../../hooks/useServiceProcedureProgress';
import { getActiveProcedures } from '../../lib/serviceProcedures';
import type { UserData } from '../../types';
import type { ServiceId } from '../../lib/servicesCatalog';

interface ClientJourneyNudgeProps {
  userData: UserData;
}

export function ClientJourneyNudge({ userData }: ClientJourneyNudgeProps) {
  const { t } = useLanguage();
  const portalNavigate = usePortalNavigate();
  const serviceId = userData.selectedServiceId as ServiceId | undefined;

  if (!serviceId) {
    return (
      <Card className="p-5 border-gold/25 bg-gold/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Sparkles size={20} className="text-gold shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-black text-gold uppercase tracking-[0.25em]">{t('journey.tag')}</p>
            <p className="text-sm text-ivoire mt-1">{t('journey.pickService')}</p>
          </div>
        </div>
      </Card>
    );
  }

  const procedure = getActiveProcedures().find((p) => p.serviceId === serviceId);
  const { progressPercent, currentStep } = useServiceProcedureProgress(userData.id, serviceId);

  if (!procedure) return null;

  const steps = [...procedure.steps].sort((a, b) => a.order - b.order);
  const pct = progressPercent(steps);
  const current = currentStep(steps);

  if (pct >= 100) {
    return (
      <Card className="p-5 border-green-500/20 bg-green-500/5">
        <p className="text-sm text-green-400">{t('procedure.allComplete')}</p>
      </Card>
    );
  }

  return (
    <Card className="p-5 border-gold/25 bg-gold/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3 min-w-0">
        <ClipboardList size={20} className="text-gold shrink-0 mt-0.5" />
        <div className="min-w-0">
          <p className="text-xs font-black text-gold uppercase tracking-[0.25em]">
            {t('journey.tag')} · {pct}%
          </p>
          <p className="text-sm text-ivoire mt-1 truncate">
            <span className="text-gold font-medium">{t('procedure.nextStep')}:</span>{' '}
            {current ? t(current.titleKey) : t('journey.openProcedure')}
          </p>
        </div>
      </div>
      <Button variant="gold" size="sm" className="gap-2 shrink-0" onClick={() => portalNavigate('procedure')}>
        {t('journey.continue')} <ChevronRight size={16} />
      </Button>
    </Card>
  );
}
