import {
  LayoutDashboard,
  Receipt,
  MessageSquare,
  Vault as VaultIcon,
  HelpCircle,
  FileText,
  Users,
  ShieldCheck,
  Tags,
  Settings,
  Shield,
  BookOpen,
  BarChart3,
  ClipboardList,
  Calculator,
} from 'lucide-react';
import type { PortalNavSection, PortalRole } from '../types';

export const CLIENT_PORTAL_NAV: PortalNavSection[] = [
  {
    sectionKey: 'workspace',
    items: [
      { path: 'overview', labelKey: 'overview', icon: LayoutDashboard },
      { path: 'quote', labelKey: 'quote', icon: Calculator },
      { path: 'services', labelKey: 'services', icon: Tags },
      { path: 'procedure', labelKey: 'procedure', icon: ClipboardList },
    ],
  },
  {
    sectionKey: 'finance',
    items: [
      { path: 'transactions', labelKey: 'transactions', icon: Receipt },
      { path: 'invoices', labelKey: 'invoices', icon: FileText },
    ],
  },
  {
    sectionKey: 'documents',
    items: [{ path: 'vault', labelKey: 'vault', icon: VaultIcon }],
  },
  {
    sectionKey: 'help',
    items: [
      { path: 'messaging', labelKey: 'client_messaging', icon: MessageSquare },
      { path: 'faq', labelKey: 'faq', icon: ShieldCheck },
      { path: 'support', labelKey: 'support', icon: HelpCircle },
    ],
  },
];

export const SUB_ADMIN_PORTAL_NAV: PortalNavSection[] = [
  {
    sectionKey: 'firm',
    items: [
      { path: 'admin_overview', labelKey: 'admin_overview', icon: LayoutDashboard },
      { path: 'admin_clients', labelKey: 'admin_clients', icon: Users },
    ],
  },
  {
    sectionKey: 'production',
    items: [
      { path: 'transactions', labelKey: 'transactions', icon: Receipt },
      { path: 'invoices', labelKey: 'invoices', icon: FileText },
      { path: 'sales_ledger', labelKey: 'sales_ledger', icon: BookOpen },
      { path: 'service_reports', labelKey: 'service_reports', icon: BarChart3 },
      { path: 'vault', labelKey: 'vault', icon: VaultIcon },
    ],
  },
  {
    sectionKey: 'payments',
    items: [{ path: 'interac_settings', labelKey: 'interac_settings', icon: Settings }],
  },
  {
    sectionKey: 'communication',
    items: [{ path: 'messaging', labelKey: 'messaging', icon: MessageSquare }],
  },
];

export const SUPER_ADMIN_PORTAL_NAV: PortalNavSection[] = [
  {
    sectionKey: 'network',
    items: [
      { path: 'super_overview', labelKey: 'super_overview', icon: LayoutDashboard },
      { path: 'super_subadmins', labelKey: 'super_subadmins', icon: Shield },
      { path: 'super_clients', labelKey: 'super_clients', icon: Users },
      { path: 'super_invoices', labelKey: 'super_invoices', icon: FileText },
      { path: 'sales_ledger', labelKey: 'sales_ledger_global', icon: BookOpen },
    ],
  },
  {
    sectionKey: 'communication',
    items: [{ path: 'messaging', labelKey: 'messaging', icon: MessageSquare }],
  },
  {
    sectionKey: 'help',
    items: [
      { path: 'faq', labelKey: 'faq', icon: ShieldCheck },
      { path: 'support', labelKey: 'support', icon: HelpCircle },
    ],
  },
];

export const PORTAL_NAV_BY_ROLE: Record<PortalRole, PortalNavSection[]> = {
  client: CLIENT_PORTAL_NAV,
  sub_admin: SUB_ADMIN_PORTAL_NAV,
  super_admin: SUPER_ADMIN_PORTAL_NAV,
};

export const DEFAULT_ROUTE_BY_ROLE: Record<PortalRole, string> = {
  client: 'overview',
  sub_admin: 'admin_overview',
  super_admin: 'super_overview',
};

export function getPortalNav(role: PortalRole): PortalNavSection[] {
  return PORTAL_NAV_BY_ROLE[role] ?? CLIENT_PORTAL_NAV;
}

export function getDefaultRoute(role: PortalRole): string {
  return DEFAULT_ROUTE_BY_ROLE[role] ?? 'overview';
}

export function flattenNavPaths(sections: PortalNavSection[]): string[] {
  return sections.flatMap((section) => section.items.map((item) => item.path));
}

export function isPathAllowedForRole(path: string, role: PortalRole): boolean {
  return flattenNavPaths(getPortalNav(role)).includes(path);
}
