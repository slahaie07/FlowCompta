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

export interface ApplicablePackage {
  /** Palier de transactions de la grille auquel ce forfait correspond */
  transactionsBand: TransactionsBand;
  /** Prix mensuel exact de la grille (aucun montant calculé ni médian) */
  monthlyPrice: number;
  /**
   * Étiquette précise (clé pricingQuestionnaire.packages.*) quand deux
   * forfaits partagent le même palier — p. ex. Micro et Essentiel en 0-30.
   */
  noteKey?: 'micro' | 'essential';
}

export interface PricingEstimateResult {
  serviceId: ServiceId;
  billingUnit: BillingUnit;
  amountMin: number;
  amountMax: number;
  amountTypical: number;
  breakdown: PricingBreakdownLine[];
  /**
   * Forfaits mensuels de la grille applicables à la bande de volume déclarée.
   * Renseigné quand la question posée porte sur un volume de transactions
   * (parcours horaire) : l'écran de résultat affiche ces forfaits nommés et
   * leurs prix réels plutôt qu'une fourchette calculée.
   */
  packages?: ApplicablePackage[];
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

/**
 * Forfaits mensuels applicables à chaque bande de volume de l'estimateur.
 * Les bandes de volume (« moins de 20 », « 20 à 100 », « plus de 100 »
 * transactions/mois) chevauchent les paliers de la grille : on liste donc
 * les paliers touchés, avec leurs prix exacts tirés de MONTHLY_LADDER / du
 * forfait Micro — jamais de prix interpolé ni de médian.
 */
export const VOLUME_BAND_PACKAGES: Record<VolumeBand, ApplicablePackage[]> = {
  // Moins de 20 transactions/mois : entièrement dans le palier 0-30.
  low: [
    { transactionsBand: 't0_30', monthlyPrice: MICRO_PRICE, noteKey: 'micro' },
    { transactionsBand: 't0_30', monthlyPrice: MONTHLY_LADDER.t0_30, noteKey: 'essential' },
  ],
  // 20 à 100 transactions/mois : paliers 31-75 (Essentiel) et 76-150.
  // (Le segment 20-30 relève du même prix mensuel Essentiel, 249,99 $.)
  medium: [
    { transactionsBand: 't31_75', monthlyPrice: MONTHLY_LADDER.t31_75 },
    { transactionsBand: 't76_150', monthlyPrice: MONTHLY_LADDER.t76_150 },
  ],
  // Plus de 100 transactions/mois : du palier 76-150 jusqu'au plus élevé.
  high: [
    { transactionsBand: 't76_150', monthlyPrice: MONTHLY_LADDER.t76_150 },
    { transactionsBand: 't151_200', monthlyPrice: MONTHLY_LADDER.t151_200 },
    { transactionsBand: 't201_300', monthlyPrice: MONTHLY_LADDER.t201_300 },
    { transactionsBand: 't301_450', monthlyPrice: MONTHLY_LADDER.t301_450 },
    { transactionsBand: 't451_plus', monthlyPrice: MONTHLY_LADDER.t451_plus },
  ],
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
      // Le tarif horaire de la grille est un prix ferme : 35 $/h, avec
      // estimation écrite selon le dossier. On ne multiplie plus par un
      // nombre d'heures deviné (cela produisait un « prix médian » —
      // 210 $ pour la bande modérée — qui n'existe pas dans la grille).
      // Les forfaits mensuels applicables à la bande de volume déclarée
      // sont joints au résultat (voir VOLUME_BAND_PACKAGES) et affichés
      // nommément par l'écran de résultat.
      breakdown.push({ labelKey: 'hours', amount: HOURLY_RATE });
      return { amount: HOURLY_RATE, billingUnit: 'hourly', fixed: true, breakdown };
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

  // La majoration express s'applique au mandat, pas au taux horaire affiché :
  // le tarif de 35 $/h reste le prix de grille dans tous les cas.
  if (answers.urgency === 'priority' && core.billingUnit !== 'hourly') {
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
    ...(answers.serviceId === 'hourlyBookkeeping'
      ? { packages: VOLUME_BAND_PACKAGES[answers.volumeBand] }
      : {}),
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
