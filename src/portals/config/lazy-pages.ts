import { lazy } from 'react';

// ——— Client portal ———
export const LazyOverview = lazy(() =>
  import('../client/pages/Overview').then((m) => ({ default: m.Overview }))
);
export const LazyPricing = lazy(() =>
  import('../client/pages/Pricing').then((m) => ({ default: m.Pricing }))
);
export const LazyFAQ = lazy(() => import('../client/pages/FAQ').then((m) => ({ default: m.FAQ })));
export const LazySupport = lazy(() =>
  import('../client/pages/Support').then((m) => ({ default: m.Support }))
);

// ——— Sub-admin portal ———
export const LazyAdminOverview = lazy(() =>
  import('../sub-admin/pages/AdminOverview').then((m) => ({ default: m.AdminOverview }))
);
export const LazyAdminClients = lazy(() =>
  import('../sub-admin/pages/AdminClients').then((m) => ({ default: m.AdminClients }))
);
export const LazyInteracSettings = lazy(() =>
  import('../sub-admin/pages/InteracSettings').then((m) => ({ default: m.InteracSettings }))
);
export const LazySalesLedger = lazy(() =>
  import('../sub-admin/pages/SalesLedger').then((m) => ({ default: m.SalesLedger }))
);
export const LazyServiceReports = lazy(() =>
  import('../sub-admin/pages/ServiceReports').then((m) => ({ default: m.ServiceReports }))
);

// ——— Super admin portal ———
export const LazySuperAdminOverview = lazy(() =>
  import('../super-admin/pages/SuperAdminOverview').then((m) => ({ default: m.SuperAdminOverview }))
);
export const LazySuperAdminSubAdmins = lazy(() =>
  import('../super-admin/pages/SuperAdminSubAdmins').then((m) => ({ default: m.SuperAdminSubAdmins }))
);
export const LazySuperAdminClients = lazy(() =>
  import('../super-admin/pages/SuperAdminClients').then((m) => ({ default: m.SuperAdminClients }))
);
export const LazySuperAdminInvoices = lazy(() =>
  import('../super-admin/pages/SuperAdminInvoices').then((m) => ({ default: m.SuperAdminInvoices }))
);

// ——— Shared features ———
export const LazyTransactions = lazy(() =>
  import('../features/pages/Transactions').then((m) => ({ default: m.Transactions }))
);
export const LazyInvoices = lazy(() =>
  import('../features/pages/Invoices').then((m) => ({ default: m.Invoices }))
);
export const LazyVault = lazy(() => import('../features/pages/Vault').then((m) => ({ default: m.Vault })));
export const LazyMessaging = lazy(() =>
  import('../features/pages/Messaging').then((m) => ({ default: m.Messaging }))
);
