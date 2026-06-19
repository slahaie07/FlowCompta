export { PortalDashboard, PortalDashboard as default } from './PortalDashboard';
export { LegacyDashboardRedirect } from './shared/LegacyDashboardRedirect';
export type { PortalRole, PortalNavSection, PortalNavItem, PortalShellProps } from './types';
export {
  getPortalNav,
  getDefaultRoute,
  isPathAllowedForRole,
  CLIENT_PORTAL_NAV,
  SUB_ADMIN_PORTAL_NAV,
  SUPER_ADMIN_PORTAL_NAV,
  getPortalHomePath,
  getPortalPath,
} from './config';
