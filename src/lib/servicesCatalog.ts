import {
  Clock,
  Building2,
  Store,
  Factory,
  Receipt,
  Wallet,
  FileText,
  RefreshCw,
  Monitor,
  HelpCircle,
  User,
  Zap,
  BookOpen,
  BarChart3,
  Briefcase,
  type LucideIcon,
} from 'lucide-react';
import type { UserNeeds } from '../types';

export type ServiceCategory = 'hourly' | 'monthly' | 'alacarte' | 'fiscal';

export type ServiceId = keyof UserNeeds;

export interface ServiceDefinition {
  id: ServiceId;
  code: string;
  category: ServiceCategory;
  /** Estimation pour le panier onboarding (null = tarif horaire variable) */
  estimateFee: number | null;
  icon: LucideIcon;
}

export const SERVICE_CATALOG: ServiceDefinition[] = [
  {
    id: 'hourlyBookkeeping',
    code: 'HR-01',
    category: 'hourly',
    estimateFee: 60,
    icon: Clock,
  },
  {
    id: 'monthlyMicro',
    code: 'FM-01',
    category: 'monthly',
    estimateFee: 200,
    icon: Building2,
  },
  {
    id: 'monthlySmall',
    code: 'FM-02',
    category: 'monthly',
    estimateFee: 400,
    icon: Store,
  },
  {
    id: 'monthlySme',
    code: 'FM-03',
    category: 'monthly',
    estimateFee: 650,
    icon: Factory,
  },
  {
    id: 'gstQst',
    code: 'AC-01',
    category: 'alacarte',
    estimateFee: 48,
    icon: Receipt,
  },
  {
    id: 'payroll',
    code: 'AC-02',
    category: 'alacarte',
    estimateFee: 65,
    icon: Wallet,
  },
  {
    id: 't4Releve1',
    code: 'AC-03',
    category: 'alacarte',
    estimateFee: 75,
    icon: FileText,
  },
  {
    id: 'catchUp',
    code: 'AC-04',
    category: 'alacarte',
    estimateFee: 60,
    icon: RefreshCw,
  },
  {
    id: 'softwareSetup',
    code: 'AC-05',
    category: 'alacarte',
    estimateFee: 225,
    icon: Monitor,
  },
  {
    id: 'taxHelpAutonomous',
    code: 'AC-06',
    category: 'alacarte',
    estimateFee: 225,
    icon: HelpCircle,
  },
  {
    id: 'personalTaxT1',
    code: 'T1',
    category: 'fiscal',
    estimateFee: 89,
    icon: User,
  },
  {
    id: 'selfEmployedTa',
    code: 'TA',
    category: 'fiscal',
    estimateFee: 199,
    icon: Zap,
  },
  {
    id: 'corporateT2',
    code: 'T2',
    category: 'fiscal',
    estimateFee: 749,
    icon: Building2,
  },
  {
    id: 'bookkeepingManaged',
    code: 'BK',
    category: 'fiscal',
    estimateFee: 350,
    icon: BookOpen,
  },
  {
    id: 'investmentStocks',
    code: 'INV',
    category: 'fiscal',
    estimateFee: 149,
    icon: BarChart3,
  },
  {
    id: 'virtualCfo',
    code: 'CFO',
    category: 'fiscal',
    estimateFee: 1500,
    icon: Briefcase,
  },
];

/** IDs utilisés dans Rapports services (sub-admin) → catalogue calculateur */
export const REPORT_SERVICE_TO_CATALOG: Record<string, ServiceId> = {
  t1: 'personalTaxT1',
  ta: 'selfEmployedTa',
  t2: 'corporateT2',
  bookkeeping: 'bookkeepingManaged',
  stocks: 'investmentStocks',
  cfo: 'virtualCfo',
};

export const SERVICE_CATEGORIES: ServiceCategory[] = ['hourly', 'monthly', 'alacarte', 'fiscal'];

export function isServiceId(value: string | null | undefined): value is ServiceId {
  if (!value) return false;
  return SERVICE_CATALOG.some((s) => s.id === value);
}

export function createEmptyUserNeeds(): UserNeeds {
  return {
    hourlyBookkeeping: false,
    monthlyMicro: false,
    monthlySmall: false,
    monthlySme: false,
    gstQst: false,
    payroll: false,
    t4Releve1: false,
    catchUp: false,
    softwareSetup: false,
    taxHelpAutonomous: false,
    personalTaxT1: false,
    selfEmployedTa: false,
    corporateT2: false,
    bookkeepingManaged: false,
    investmentStocks: false,
    virtualCfo: false,
  };
}

export function getServicesByCategory(category: ServiceCategory): ServiceDefinition[] {
  return SERVICE_CATALOG.filter((s) => s.category === category);
}

export function getSelectedServices(needs: UserNeeds): ServiceDefinition[] {
  return SERVICE_CATALOG.filter((s) => needs[s.id]);
}

export function calculateServicesSubtotal(needs: UserNeeds): number {
  return getSelectedServices(needs).reduce((sum, s) => sum + (s.estimateFee ?? 0), 0);
}

export function getServiceLabel(
  id: ServiceId,
  t: (key: string) => string
): string {
  return t(`services.items.${id}.name`);
}

export function getServicePriceDisplay(
  id: ServiceId,
  t: (key: string) => string
): string {
  return t(`services.items.${id}.price`);
}
