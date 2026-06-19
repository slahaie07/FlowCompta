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
  type LucideIcon,
} from 'lucide-react';
import type { UserNeeds } from '../types';

export type ServiceCategory = 'hourly' | 'monthly' | 'alacarte';

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
];

export const SERVICE_CATEGORIES: ServiceCategory[] = ['hourly', 'monthly', 'alacarte'];

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
