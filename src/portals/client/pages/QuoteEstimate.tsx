import { useSearchParams } from 'react-router-dom';
import { PricingQuestionnaire } from '../../../components/common/PricingQuestionnaire';
import { usePortalNavigate } from '../../../hooks/usePortalNavigate';
import { useAuth } from '../../../hooks/useAuth';
import { useLanguage } from '../../../hooks/useLanguage';
import { toast } from 'sonner';
import { isServiceId, type ServiceId } from '../../../lib/servicesCatalog';
import type { PortalRole } from '../../types';

function invoiceRouteForRole(role: PortalRole): string {
  if (role === 'super_admin') return 'super_invoices';
  if (role === 'sub_admin') return 'invoices';
  return 'overview';
}

export function QuoteEstimate() {
  const [searchParams] = useSearchParams();
  const portalNavigate = usePortalNavigate();
  const { userData } = useAuth();
  const { t } = useLanguage();
  const role = (userData?.role ?? 'client') as PortalRole;
  const isStaff = role === 'sub_admin' || role === 'super_admin';

  const serviceFromUrl = searchParams.get('service');
  const selectedFromProfile = userData?.selectedServiceId;
  const initialServiceId: ServiceId | undefined = isServiceId(serviceFromUrl)
    ? serviceFromUrl
    : isServiceId(selectedFromProfile)
      ? selectedFromProfile
      : undefined;

  const handleContinue = (_serviceId: ServiceId) => {
    if (isStaff) {
      toast.success(t('pricingQuestionnaire.staff.toastReady'));
      portalNavigate(invoiceRouteForRole(role));
      return;
    }
    portalNavigate('overview');
  };

  return (
    <div className="py-10 px-2">
      <PricingQuestionnaire
        variant={isStaff ? 'staff' : 'client'}
        initialServiceId={initialServiceId}
        onContinue={handleContinue}
      />
    </div>
  );
}
