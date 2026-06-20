import { Navigate } from 'react-router-dom';
import { BiometricVerification } from '../../components/ui/BiometricVerification';
import type { PortalRouteContext, PortalRouteDefinition } from '../types';
import {
  LazyOverview,
  LazyPricing,
  LazyFAQ,
  LazySupport,
  LazyServiceProcedure,
  LazyAdminOverview,
  LazyAdminClients,
  LazyInteracSettings,
  LazySalesLedger,
  LazyServiceReports,
  LazySuperAdminOverview,
  LazySuperAdminSubAdmins,
  LazySuperAdminClients,
  LazySuperAdminInvoices,
  LazyTransactions,
  LazyInvoices,
  LazyVault,
  LazyMessaging,
} from './lazy-pages';

export const PORTAL_ROUTES: PortalRouteDefinition[] = [
  // ——— Client ———
  {
    path: 'overview',
    roles: ['client'],
    render: (ctx) => (
      <LazyOverview
        userData={ctx.userData}
        isLoading={false}
        currentMode={ctx.currentMode}
        onSignMandate={() => ctx.setShowMandateSigning(true)}
        onRefreshProfile={ctx.onRefreshProfile}
      />
    ),
  },
  {
    path: 'procedure',
    roles: ['client'],
    render: () => <LazyServiceProcedure />,
  },
  {
    path: 'services',
    roles: ['client'],
    render: () => <LazyPricing />,
  },

  // ——— Sub-admin ———
  {
    path: 'admin_overview',
    roles: ['sub_admin'],
    render: () => <LazyAdminOverview />,
  },
  {
    path: 'admin_clients',
    roles: ['sub_admin'],
    render: (ctx) => (
      <LazyAdminClients clients={ctx.adminClients} isAdmin onAddClient={ctx.addClient} />
    ),
  },
  {
    path: 'interac_settings',
    roles: ['sub_admin'],
    render: (ctx) => <LazyInteracSettings userData={ctx.userData} />,
  },
  {
    path: 'sales_ledger',
    roles: ['sub_admin', 'super_admin'],
    render: () => <LazySalesLedger />,
  },
  {
    path: 'service_reports',
    roles: ['sub_admin'],
    render: () => <LazyServiceReports />,
  },

  // ——— Super admin ———
  {
    path: 'super_overview',
    roles: ['super_admin'],
    render: () => <LazySuperAdminOverview />,
  },
  {
    path: 'super_subadmins',
    roles: ['super_admin'],
    render: () => <LazySuperAdminSubAdmins />,
  },
  {
    path: 'super_clients',
    roles: ['super_admin'],
    render: () => <LazySuperAdminClients />,
  },
  {
    path: 'super_invoices',
    roles: ['super_admin'],
    render: () => <LazySuperAdminInvoices />,
  },

  // ——— Shared (role-scoped via config) ———
  {
    path: 'transactions',
    roles: ['client', 'sub_admin'],
    render: (ctx) => (
      <LazyTransactions
        currentMode={ctx.currentMode}
        isAdmin={ctx.userData.role === 'sub_admin'}
      />
    ),
  },
  {
    path: 'invoices',
    roles: ['client', 'sub_admin'],
    render: (ctx) => <LazyInvoices isAdmin={ctx.userData.role === 'sub_admin'} />,
  },
  {
    path: 'vault',
    roles: ['client', 'sub_admin'],
    render: (ctx) =>
      !ctx.isVaultUnlocked ? (
        <BiometricVerification onVerified={() => ctx.setIsVaultUnlocked(true)} />
      ) : (
        <LazyVault isLoading={false} />
      ),
  },
  {
    path: 'messaging',
    roles: ['client', 'sub_admin', 'super_admin'],
    render: (ctx) => <LazyMessaging userData={ctx.userData} />,
  },
  {
    path: 'faq',
    roles: ['client', 'super_admin'],
    render: () => <LazyFAQ />,
  },
  {
    path: 'support',
    roles: ['client', 'super_admin'],
    render: () => <LazySupport />,
  },
];

export function getRouteDefinition(path: string): PortalRouteDefinition | undefined {
  return PORTAL_ROUTES.find((route) => route.path === path);
}

export function renderPortalRoute(path: string, ctx: PortalRouteContext) {
  const route = getRouteDefinition(path);
  const role = ctx.userData.role ?? 'client';

  if (!route || !route.roles.includes(role)) {
    return <Navigate to={getDefaultRedirect(role)} replace />;
  }

  return route.render(ctx);
}

function getDefaultRedirect(role: PortalRouteContext['userData']['role']) {
  if (role === 'super_admin') return 'super_overview';
  if (role === 'sub_admin') return 'admin_overview';
  return 'overview';
}
