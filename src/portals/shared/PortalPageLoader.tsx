import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { OrganicLoader } from '../../components/ui/OrganicLoader';
import { useLanguage } from '../../hooks/useLanguage';

export function PortalPageLoader() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6">
      <OrganicLoader label="CF" size="sm" />
      <p className="text-slate-500 font-serif italic animate-pulse">{t('portal.loading')}</p>
    </div>
  );
}

export function withPortalSuspense(node: ReactNode) {
  return <Suspense fallback={<PortalPageLoader />}>{node}</Suspense>;
}
