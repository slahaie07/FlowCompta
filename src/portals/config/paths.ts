import type { PortalRole } from '../types';
import { getDefaultRoute } from './navigation';

/** URL slug per portal (e.g. /portal/client, /portal/admin, /portal/owner) */
export const PORTAL_SLUG_BY_ROLE: Record<PortalRole, string> = {
  client: 'client',
  sub_admin: 'admin',
  super_admin: 'owner',
};

export function getPortalSlug(role: PortalRole): string {
  return PORTAL_SLUG_BY_ROLE[role];
}

export function roleFromPortalSlug(slug: string | undefined): PortalRole | null {
  if (!slug) return null;
  const match = (Object.entries(PORTAL_SLUG_BY_ROLE) as [PortalRole, string][]).find(
    ([, portalSlug]) => portalSlug === slug
  );
  return match?.[0] ?? null;
}

export function getPortalBasePath(role: PortalRole): string {
  return `/portal/${getPortalSlug(role)}`;
}

export function getPortalPath(role: PortalRole, segment?: string): string {
  const tab = segment ?? getDefaultRoute(role);
  return `${getPortalBasePath(role)}/${tab}`;
}

export function getPortalHomePath(role: PortalRole): string {
  return getPortalPath(role, getDefaultRoute(role));
}

/** Active route segment from a portal URL (e.g. /portal/client/invoices → invoices) */
export function getActiveSegment(pathname: string, role: PortalRole): string {
  const base = getPortalBasePath(role);
  if (pathname === base || pathname === `${base}/`) {
    return getDefaultRoute(role);
  }
  if (pathname.startsWith(`${base}/`)) {
    return pathname.slice(base.length + 1).split('/')[0] || getDefaultRoute(role);
  }
  return getDefaultRoute(role);
}

/** Map legacy /dashboard/* paths to new portal paths */
export function legacyDashboardToPortalPath(pathname: string, role: PortalRole): string {
  const legacySegment = pathname.replace(/^\/dashboard\/?/, '') || getDefaultRoute(role);
  // Old pricing route → client services
  const segment = legacySegment === 'pricing' ? 'services' : legacySegment;
  return getPortalPath(role, segment);
}
