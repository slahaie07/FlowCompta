import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { AppMode, UserData } from '../types';

export type PortalRole = 'client' | 'sub_admin' | 'super_admin';

export interface PortalNavItem {
  path: string;
  labelKey: string;
  icon: LucideIcon;
}

export interface PortalNavSection {
  sectionKey: string;
  items: PortalNavItem[];
}

export interface PortalShellProps {
  userData: UserData;
  currentMode: AppMode;
  onLogout: () => void;
  onToggleMode: () => void;
  onRefreshProfile?: () => void;
}

export interface PortalRouteContext extends PortalShellProps {
  isVaultUnlocked: boolean;
  setIsVaultUnlocked: (value: boolean) => void;
  setShowMandateSigning: (value: boolean) => void;
  adminClients: ReturnType<typeof import('../hooks/useAdminClients').useAdminClients>['clients'];
  addClient: ReturnType<typeof import('../hooks/useAdminClients').useAdminClients>['addClient'];
}

export interface PortalRouteDefinition {
  path: string;
  roles: PortalRole[];
  render: (ctx: PortalRouteContext) => ReactNode;
}
