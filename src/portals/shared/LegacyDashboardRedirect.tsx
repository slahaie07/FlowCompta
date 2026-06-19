import { Navigate, useLocation } from 'react-router-dom';
import type { PortalRole } from '../types';
import { legacyDashboardToPortalPath } from '../config/paths';

interface LegacyDashboardRedirectProps {
  role: PortalRole;
}

/** Redirects /dashboard/* → /portal/{role}/* for backward compatibility */
export function LegacyDashboardRedirect({ role }: LegacyDashboardRedirectProps) {
  const location = useLocation();
  const target = legacyDashboardToPortalPath(location.pathname, role);
  return <Navigate to={target + location.search + location.hash} replace />;
}
