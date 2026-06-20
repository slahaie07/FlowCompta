import { SERVICE_CATALOG, type ServiceId } from './servicesCatalog';
import type { ProvinceCode } from './financeUtils';

export type VolumeBand = 'low' | 'medium' | 'high';
export type EmployeeBand = 'none' | 'small' | 'medium';
export type ProfileType = 'personal' | 'business' | 'sme';
export type UrgencyLevel = 'standard' | 'priority';

export interface PricingQuestionnaireAnswers {
  serviceId: ServiceId;
  province: ProvinceCode;
  profileType: ProfileType;
  volumeBand: VolumeBand;
  employeeBand: EmployeeBand;
  urgency: UrgencyLevel;
  addOns: ServiceId[];
}

export interface PricingBreakdownLine {
  labelKey: string;
  amount: number;
}

export type BillingUnit = 'hourly' | 'monthly' | 'oneTime' | 'perDeclaration';

export interface PricingEstimateResult {
  serviceId: ServiceId;
  billingUnit: BillingUnit;
  amountMin: number;
  amountMax: number;
  amountTypical: number;
  breakdown: PricingBreakdownLine[];
}

const VOLUME_MULTIPLIER: Record<VolumeBand, number> = {
  low: 0.85,
  medium: 1,
  high: 1.3,
};

const HOURLY_HOURS: Record<VolumeBand, number> = {
  low: 3,
  medium: 6,
  high: 12,
};

const EMPLOYEE_MULTIPLIER: Record<EmployeeBand, number> = {
  none: 1,
  small: 1,
  medium: 1.45,
};

const EMPLOYEE_COUNT: Record<EmployeeBand, number> = {
  none: 1,
  small: 3,
  medium: 10,
};

const PROFILE_MULTIPLIER: Record<ProfileType, number> = {
  personal: 0.9,
  business: 1,
  sme: 1.2,
};

const URGENCY_MULTIPLIER: Record<UrgencyLevel, number> = {
  standard: 1,
  priority: 1.15,
};

function getServiceBaseFee(serviceId: ServiceId): number {
  const service = SERVICE_CATALOG.find((s) => s.id === serviceId);
  return service?.estimateFee ?? 60;
}

function getServiceCategory(serviceId: ServiceId) {
  return SERVICE_CATALOG.find((s) => s.id === serviceId)?.category ?? 'alacarte';
}

function roundAmount(value: number): number {
  return Math.round(value);
}

function applyRange(typical: number, spread = 0.12): { min: number; max: number; typical: number } {
  const min = roundAmount(typical * (1 - spread));
  const max = roundAmount(typical * (1 + spread));
  return { min, max, typical: roundAmount(typical) };
}

function computeCoreEstimate(answers: PricingQuestionnaireAnswers): {
  typical: number;
  billingUnit: BillingUnit;
  breakdown: PricingBreakdownLine[];
} {
  const base = getServiceBaseFee(answers.serviceId);
  const category = getServiceCategory(answers.serviceId);
  const profileMul = PROFILE_MULTIPLIER[answers.profileType];
  const volumeMul = VOLUME_MULTIPLIER[answers.volumeBand];
  const breakdown: PricingBreakdownLine[] = [
    { labelKey: 'base', amount: base },
  ];

  let typical = base;
  let billingUnit: BillingUnit = 'oneTime';

  if (category === 'hourly' || answers.serviceId === 'catchUp') {
    const hours = HOURLY_HOURS[answers.volumeBand];
    typical = base * hours * profileMul;
    billingUnit = 'hourly';
    breakdown.push({ labelKey: 'hours', amount: hours });
    breakdown.push({ labelKey: 'profile', amount: profileMul });
  } else if (category === 'monthly') {
    typical = base * volumeMul * profileMul;
    billingUnit = 'monthly';
    breakdown.push({ labelKey: 'volume', amount: volumeMul });
    breakdown.push({ labelKey: 'profile', amount: profileMul });
  } else {
    switch (answers.serviceId) {
      case 'gstQst':
        typical = base * (answers.volumeBand === 'high' ? 1.25 : answers.volumeBand === 'medium' ? 1.1 : 1);
        billingUnit = 'perDeclaration';
        break;
      case 'payroll':
        typical = base * EMPLOYEE_MULTIPLIER[answers.employeeBand] * profileMul;
        billingUnit = 'monthly';
        breakdown.push({ labelKey: 'employees', amount: EMPLOYEE_MULTIPLIER[answers.employeeBand] });
        break;
      case 't4Releve1': {
        const count = EMPLOYEE_COUNT[answers.employeeBand];
        typical = 50 + 25 * count;
        billingUnit = 'oneTime';
        breakdown.push({ labelKey: 't4Employees', amount: count });
        break;
      }
      case 'personalTaxT1':
      case 'investmentStocks':
        typical = base * profileMul;
        billingUnit = 'oneTime';
        breakdown.push({ labelKey: 'profile', amount: profileMul });
        break;
      case 'selfEmployedTa':
        typical = base * volumeMul * profileMul;
        billingUnit = 'oneTime';
        breakdown.push({ labelKey: 'volume', amount: volumeMul });
        breakdown.push({ labelKey: 'profile', amount: profileMul });
        break;
      case 'corporateT2':
        typical = base * volumeMul * profileMul * EMPLOYEE_MULTIPLIER[answers.employeeBand];
        billingUnit = 'oneTime';
        breakdown.push({ labelKey: 'volume', amount: volumeMul });
        breakdown.push({ labelKey: 'profile', amount: profileMul });
        breakdown.push({ labelKey: 'employees', amount: EMPLOYEE_MULTIPLIER[answers.employeeBand] });
        break;
      case 'bookkeepingManaged':
        typical = base * volumeMul * profileMul;
        billingUnit = 'monthly';
        breakdown.push({ labelKey: 'volume', amount: volumeMul });
        breakdown.push({ labelKey: 'profile', amount: profileMul });
        break;
      case 'virtualCfo':
        typical = base * volumeMul * profileMul * EMPLOYEE_MULTIPLIER[answers.employeeBand];
        billingUnit = 'monthly';
        breakdown.push({ labelKey: 'volume', amount: volumeMul });
        breakdown.push({ labelKey: 'profile', amount: profileMul });
        breakdown.push({ labelKey: 'employees', amount: EMPLOYEE_MULTIPLIER[answers.employeeBand] });
        break;
      case 'softwareSetup':
      case 'taxHelpAutonomous':
        typical = base * profileMul;
        billingUnit = 'oneTime';
        breakdown.push({ labelKey: 'profile', amount: profileMul });
        break;
      default:
        typical = base * volumeMul * profileMul;
        billingUnit = 'oneTime';
    }
  }

  if (answers.urgency === 'priority') {
    typical *= URGENCY_MULTIPLIER.priority;
    breakdown.push({ labelKey: 'urgency', amount: URGENCY_MULTIPLIER.priority });
  }

  for (const addOnId of answers.addOns) {
    if (addOnId === answers.serviceId) continue;
    const addOnFee = getServiceBaseFee(addOnId);
    typical += addOnFee;
    breakdown.push({ labelKey: `addon.${addOnId}`, amount: addOnFee });
  }

  return { typical, billingUnit, breakdown };
}

export function calculatePricingEstimate(
  answers: PricingQuestionnaireAnswers
): PricingEstimateResult {
  const { typical, billingUnit, breakdown } = computeCoreEstimate(answers);
  const { min, max, typical: amountTypical } = applyRange(typical);

  return {
    serviceId: answers.serviceId,
    billingUnit,
    amountMin: min,
    amountMax: max,
    amountTypical,
    breakdown,
  };
}

export function getRecommendedAddOns(serviceId: ServiceId): ServiceId[] {
  const map: Partial<Record<ServiceId, ServiceId[]>> = {
    monthlyMicro: ['gstQst'],
    monthlySmall: ['gstQst', 'payroll'],
    monthlySme: ['payroll', 'gstQst'],
    hourlyBookkeeping: ['catchUp'],
    payroll: ['t4Releve1'],
    personalTaxT1: ['investmentStocks'],
    selfEmployedTa: ['gstQst', 'catchUp'],
    corporateT2: ['payroll', 'gstQst'],
    bookkeepingManaged: ['gstQst', 'payroll'],
    virtualCfo: ['bookkeepingManaged'],
  };
  return map[serviceId] ?? [];
}

export const PRICING_STORAGE_KEY = 'comptaflow_pricing_estimate';

export function savePricingAnswers(answers: PricingQuestionnaireAnswers): void {
  try {
    localStorage.setItem(PRICING_STORAGE_KEY, JSON.stringify(answers));
  } catch {
    /* ignore quota errors */
  }
}

export function loadPricingAnswers(): PricingQuestionnaireAnswers | null {
  try {
    const raw = localStorage.getItem(PRICING_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PricingQuestionnaireAnswers;
  } catch {
    return null;
  }
}

export function clearPricingAnswers(): void {
  try {
    localStorage.removeItem(PRICING_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
