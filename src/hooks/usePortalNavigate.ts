import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { getPortalPath } from '../portals/config/paths';
import type { PortalRole } from '../portals/types';

export function usePortalNavigate() {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const role = (userData?.role ?? 'client') as PortalRole;

  return (segment: string) => navigate(getPortalPath(role, segment));
}

export function usePortalPath() {
  const { userData } = useAuth();
  const role = (userData?.role ?? 'client') as PortalRole;
  return (segment: string) => getPortalPath(role, segment);
}
