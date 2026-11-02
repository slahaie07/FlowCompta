import { SERVICE_CATALOG, type ServiceId } from './servicesCatalog';
import type { ProvinceCode } from './financeUtils';

export type VolumeBand = 'low' | 'medium' | 'high';
export type EmployeeBand = 'none' | 'small' | 'medium';
export type ProfileType = 'personal' | 'business' | 'sme';
export type UrgencyLevel = 'standard' | 'priority';
export type TransactionsBand =
  | 't0_30'
  | 't31_75'
  | 't76_150'
  | 't151_200'
  | 't201_300'
  | 't301_450'
  | 't451_plus';
export type LateMonthsBand = 'm1_6' | 'm7_12' | 'm13_plus';

export interface PricingQuestionnaireAnswers {
  serviceId: ServiceId;
  province: ProvinceCode;
  profileType: ProfileType;
  volumeBand: VolumeBand;
  employeeBand: EmployeeBand;
  urgency: UrgencyLevel;
  addOns: ServiceId[];
  /** Nombre de transactions mensuelles (forfaits de tenue de livres) */
  transactionsBand?: TransactionsBand;
  /** Mois de retard (rattrapage comptable) */
  lateMonthsBand?: LateMonthsBand;
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

/** Grille Compta-Flow — taux horaire ($/h) */
export const HOURLY_RATE = 35;

/** Grille Compta-Flow — forfaits mensuels selon les transactions (livres mensuels) */
export const MONTHLY_LADDER: Record<TransactionsBand, number> = {
  t0_30: 249.99,
  t31_75: 249.99,
  t76_150: 349.99,
  t151_200: 449.99,
  t201_300: 599.99,
  t301_450: 799.99,
  t451_plus: 999.99,
};

/** Grille Compta-Flow — forfait Micro (0 à 30 transactions, livrables trimestriels) */
export const MICRO_PRICE = 149.99;

/** Heures indicatives d'un mandat horaire selon le volume déclaré */
const HOURLY_HOURS: Record<VolumeBand, number> = {
  low: 3,
  medium: 6,
  high: 12,
};

const EMPLOYEE_COUNT: Record<EmployeeBand, number> = {
  none: 1,
  small: 3,
  medium: 10,
};

/** Grille Compta-Flow — rattrapage : tarif par mois de retard et mois typiques par bande */
const CATCH_UP_RATE: Record<LateMonthsBand, number> = {
  m1_6: 75,
  m7_12: 65,
  m13_plus: 60,
};
const CATCH_UP_MONTHS: Record<LateMonthsBand, number> = {
  m1_6: 3,
  m7_12: 9,
  m13_plus: 15,
};

/** Grille Compta-Flow — express ≤ 5 jours ouvrables : +25 % */
const URGENCY_MULTIPLIER: Record<UrgencyLevel, number> = {
  standard: 1,
  priority: 1.25,
};

function getServiceBaseFee(serviceId: ServiceId): number {
  const service = SERVICE_CATALOG.find((s) => s.id === serviceId);
  return service?.estimateFee ?? HOURLY_RATE;
}

function roundAmount(value: number): number {
  return Math.round(value * 100) / 100;
}

function applyRange(
  typical: number,
  fixed: boolean,
  spread = 0.12
): { min: number; max: number; typical: number } {
  const t = roundAmount(typical);
  if (fixed) return { min: t, max: t, typical: t };
  return {
    min: roundAmount(t * (1 - spread)),
    max: roundAmount(t * (1 + spread)),
    typical: t,
  };
}

interface ServiceFee {
  amount: number;
  billingUnit: BillingUnit;
  /** true = prix ferme de la grille (aucune fourchette) */
  fixed: boolean;
  breakdown: PricingBreakdownLine[];
}

/** Prix d'un service selon la grille officielle, sans compléments ni urgence. */
function computeServiceFee(
  serviceId: ServiceId,
  answers: PricingQuestionnaireAnswers
): ServiceFee {
  const base = getServiceBaseFee(serviceId);
  const breakdown: PricingBreakdownLine[] = [{ labelKey: 'base', amount: base }];

  switch (serviceId) {
    case 'hourlyBookkeeping': {
      const hours = HOURLY_HOURS[answers.volumeBand];
      breakdown.push({ labelKey: 'hours', amount: hours });
      return { amount: HOURLY_RATE * hours, billingUnit: 'hourly', fixed: false, breakdown };
    }
    case 'monthlyMicro':
    case 'monthlySmall':
    case 'monthlySme': {
      const band = answers.transactionsBand ?? 't31_75';
      const amount =
        serviceId === 'monthlyMicro' && band === 't0_30'
          ? MICRO_PRICE
          : MONTHLY_LADDER[band];
      breakdown.push({ labelKey: 'transactions', amount });
      return { amount, billingUnit: 'monthly', fixed: true, breakdown };
    }
    case 'gstQst':
      return { amount: 75, billingUnit: 'perDeclaration', fixed: true, breakdown };
    case 'payroll': {
      const count = EMPLOYEE_COUNT[answers.employeeBand];
      breakdown.push({ labelKey: 'employees', amount: count });
      return { amount: 49 + 12 * count, billingUnit: 'monthly', fixed: true, breakdown };
    }
    case 't4Releve1': {
      const count = EMPLOYEE_COUNT[answers.employeeBand];
      breakdown.push({ labelKey: 't4Employees', amount: count });
      return { amount: 15 * count, billingUnit: 'oneTime', fixed: true, breakdown };
    }
    case 'catchUp': {
      const band = answers.lateMonthsBand ?? 'm1_6';
      const rate = CATCH_UP_RATE[band];
      const months = CATCH_UP_MONTHS[band];
      breakdown.push({ labelKey: 'lateMonths', amount: months });
      breakdown.push({ labelKey: 'lateRate', amount: rate });
      return { amount: rate * months, billingUnit: 'oneTime', fixed: false, breakdown };
    }
    case 'softwareSetup':
      return { amount: 199, billingUnit: 'oneTime', fixed: true, breakdown };
    case 'taxHelpAutonomous':
      return { amount: 199.99, billingUnit: 'oneTime', fixed: true, breakdown };
    default:
      return { amount: base, billingUnit: 'oneTime', fixed: true, breakdown };
  }
}

function computeCoreEstimate(answers: PricingQuestionnaireAnswers): {
  typical: number;
  billingUnit: BillingUnit;
  fixed: boolean;
  breakdown: PricingBreakdownLine[];
} {
  const core = computeServiceFee(answers.serviceId, answers);
  let typical = core.amount;
  const breakdown = [...core.breakdown];

  if (answers.urgency === 'priority') {
    typical *= URGENCY_MULTIPLIER.priority;
    breakdown.push({ labelKey: 'urgency', amount: URGENCY_MULTIPLIER.priority });
  }

  let allFixed = core.fixed;
  for (const addOnId of answers.addOns) {
    if (addOnId === answers.serviceId) continue;
    const addOn = computeServiceFee(addOnId, answers);
    typical += addOn.amount;
    allFixed = allFixed && addOn.fixed;
    breakdown.push({ labelKey: `addon.${addOnId}`, amount: addOn.amount });
  }

  return { typical, billingUnit: core.billingUnit, fixed: allFixed, breakdown };
}

export function calculatePricingEstimate(
  answers: PricingQuestionnaireAnswers
): PricingEstimateResult {
  const { typical, billingUnit, fixed, breakdown } = computeCoreEstimate(answers);
  const { min, max, typical: amountTypical } = applyRange(typical, fixed);

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
