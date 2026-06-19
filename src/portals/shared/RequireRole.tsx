import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import type { PortalRole } from '../types';
import { getPortalHomePath } from '../config/paths';

interface RequireRoleProps {
  role: PortalRole | undefined;
  allowed: PortalRole[];
  children: ReactNode;
}

export function RequireRole({ role, allowed, children }: RequireRoleProps) {
  if (!role || !allowed.includes(role)) {
    return <Navigate to={getPortalHomePath(role ?? 'client')} replace />;
  }
  return <>{children}</>;
}
