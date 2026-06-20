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
  return 'invoices';
}

/** Calculateur réservé aux comptables (sub_admin) et super admin. */
export function QuoteEstimate() {
  const [searchParams] = useSearchParams();
  const portalNavigate = usePortalNavigate();
  const { userData } = useAuth();
  const { t } = useLanguage();
  const role = (userData?.role ?? 'client') as PortalRole;

  const serviceFromUrl = searchParams.get('service');
  const initialServiceId: ServiceId | undefined = isServiceId(serviceFromUrl)
    ? serviceFromUrl
    : undefined;

  const handleContinue = (_serviceId: ServiceId) => {
    toast.success(t('pricingQuestionnaire.staff.toastReady'));
    portalNavigate(invoiceRouteForRole(role));
  };

  return (
    <div className="py-10 px-2">
      <PricingQuestionnaire
        variant="staff"
        initialServiceId={initialServiceId}
        onContinue={handleContinue}
      />
    </div>
  );
}
