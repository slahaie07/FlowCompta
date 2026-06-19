import { Navigate, useLocation } from 'react-router-dom';
import { useAdminClients } from '../hooks/useAdminClients';
import { PortalShell } from './shared/PortalShell';
import { getPortalHomePath, roleFromPortalSlug } from './config/paths';
import type { PortalShellProps, PortalRole } from './types';

export function PortalDashboard(props: PortalShellProps) {
  const location = useLocation();
  const role = (props.userData.role ?? 'client') as PortalRole;
  const pathParts = location.pathname.split('/').filter(Boolean);
  const urlSlug = pathParts[0] === 'portal' ? pathParts[1] : undefined;
  const urlRole = roleFromPortalSlug(urlSlug);

  if (urlRole !== role) {
    return <Navigate to={getPortalHomePath(role)} replace />;
  }

  const isSubAdmin = role === 'sub_admin';
  const { clients: adminClients, addClient } = useAdminClients(isSubAdmin);

  return (
    <PortalShell
      {...props}
      routeContext={{
        adminClients,
        addClient,
      }}
    />
  );
}

export default PortalDashboard;
