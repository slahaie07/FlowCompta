import { PricingQuestionnaire } from '../../../components/common/PricingQuestionnaire';
import { usePortalNavigate } from '../../../hooks/usePortalNavigate';
import type { ServiceId } from '../../../lib/servicesCatalog';

export function QuoteEstimate() {
  const portalNavigate = usePortalNavigate();

  const handleContinue = (_serviceId: ServiceId) => {
    portalNavigate('overview');
  };

  return (
    <div className="py-10 px-2">
      <PricingQuestionnaire onContinue={handleContinue} />
    </div>
  );
}
