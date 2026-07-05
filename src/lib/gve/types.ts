/**
 * GVE — Growth & Visibility Engine
 * Moteur d'intelligence de croissance organique pour ComptaFlow.
 *
 * Éthique par conception : le GVE ne crée jamais de faux comptes, n'imite pas
 * d'identités, ne contourne aucune protection anti-robot et ne publie rien de
 * façon automatisée sur des plateformes tierces. Il *priorise*, *projette* et
 * *rédige des briefs* pour des actions de croissance authentiques que des
 * humains exécutent (ou qui passent par des API officielles avec divulgation).
 */

import type { ProvinceCode } from '../financeUtils';

/** Catégories de canaux d'acquisition — toutes légitimes et organiques/à faible coût. */
export type ChannelCategory =
  | 'content-seo'
  | 'local-seo'
  | 'community'
  | 'referral'
  | 'email'
  | 'social-organic'
  | 'partnerships'
  | 'pr';

/** Modèle de coût d'un canal. Le GVE ne recommande que de l'organique ou du faible coût. */
export type CostModel = 'organic' | 'low-cost';

/** Effort humain hebdomadaire typique pour opérer un canal, en heures. */
export type EffortHoursPerWeek = number;

/** Définition catalogue d'un canal de croissance. */
export interface GrowthChannel {
  id: string;
  category: ChannelCategory;
  nameFr: string;
  nameEn: string;
  costModel: CostModel;
  /** Portée qualifiée mensuelle atteignable à maturité, par unité d'effort standard. */
  baseReachPerMonth: number;
  /** Coût mensuel indicatif en CAD (outillage, hébergement contenu, etc.). 0 = purement organique. */
  monthlyCostCad: number;
  /** Modulateur de conversion relatif à la ligne de base du site (1 = neutre). */
  conversionModifier: number;
  /** Nombre de mois avant que le canal n'atteigne ~90 % de sa portée de maturité. */
  rampUpMonths: number;
  /** Effort hebdomadaire typique en heures. */
  effortHoursPerWeek: EffortHoursPerWeek;
  /** Industries/niches où ce canal performe le mieux. */
  fitTags: string[];
  /** Garde-fous d'intégrité — affichés dans chaque brief généré. */
  complianceNotes: string;
}

/** Profil de la cible à faire croître (le cabinet lui-même ou un client). */
export interface GrowthTarget {
  name: string;
  url?: string;
  /** Industrie/niche (ex. « comptabilité PME », « e-commerce », « SaaS »). */
  niche: string;
  province: ProvinceCode;
  language: 'fr' | 'en';
  /** Budget mensuel disponible en CAD (0 = purement organique). */
  monthlyBudgetCad: number;
  /** Sessions mensuelles actuelles du site. */
  currentMonthlySessions: number;
  /** Valeur moyenne d'un client acquis en CAD (LTV ou 1re vente selon usage). */
  avgDealValueCad: number;
  /** Taux de conversion visiteur → client, en pourcentage (ex. 2.5 pour 2,5 %). */
  conversionRatePct: number;
  /** Capacité d'exécution disponible, en heures par semaine. */
  teamCapacityHoursPerWeek: number;
}

/** Score d'opportunité déterministe pour un canal donné appliqué à une cible. */
export interface OpportunityScore {
  channelId: string;
  category: ChannelCategory;
  nameFr: string;
  nameEn: string;
  /** Visiteurs qualifiés mensuels estimés à maturité. */
  reachAtMaturity: number;
  /** Contribution mensuelle estimée au chiffre d'affaires à maturité, en CAD. */
  monthlyRevenueAtMaturity: number;
  /** Confiance dans l'estimation, 0..1. */
  confidence: number;
  /** Effort hebdomadaire requis, en heures. */
  effortHoursPerWeek: EffortHoursPerWeek;
  /** Coût mensuel du canal, en CAD. */
  monthlyCostCad: number;
  /** Score composite normalisé 0..100 (RICE-like : Reach × Impact × Confidence / Effort). */
  score: number;
  /** Rang (1 = meilleure opportunité). */
  rank: number;
}

/** Point de projection mensuel. */
export interface MonthlyProjection {
  month: number;
  incrementalSessions: number;
  totalSessions: number;
  incrementalRevenueCad: number;
  cumulativeRevenueCad: number;
}

/** Synthèse de projection sur l'horizon. */
export interface ProjectionSummary {
  horizonMonths: number;
  sessionsAtHorizon: number;
  cumulativeRevenueCad: number;
  /** Coût total organique/faible coût sur l'horizon (canaux + estimation temps). */
  totalCostCad: number;
  /** Coût d'acquisition mixte estimé, en CAD. */
  blendedCac: number;
  /** Retour sur investissement : (revenu − coût) / coût. */
  roi: number;
  /** CAC de référence en publicité payante pour la niche, en CAD. */
  paidBenchmarkCac: number;
}

/** Cadence d'exécution d'une action. */
export type ActionCadence = 'once' | 'daily' | 'weekly' | 'biweekly' | 'monthly';

/** Priorité dérivée du score du canal parent. */
export type ActionPriority = 'critique' | 'haute' | 'moyenne';

/** Élément concret et éthique du plan d'action. */
export interface ActionItem {
  id: string;
  channelId: string;
  titleFr: string;
  cadence: ActionCadence;
  priority: ActionPriority;
  /** Effort estimé par occurrence, en heures. */
  effortHours: number;
  /** Indicateur clé à suivre pour cette action. */
  kpi: string;
  /** Garde-fou d'intégrité rappelé sur l'action. */
  integrityNote: string;
}

/** Plan de croissance complet produit par le moteur. */
export interface GrowthPlan {
  target: GrowthTarget;
  generatedAt: string;
  opportunities: OpportunityScore[];
  recommendedChannelIds: string[];
  projection: MonthlyProjection[];
  summary: ProjectionSummary;
  playbook: ActionItem[];
  /** Clause d'intégrité globale — jamais de faux comptes ni de contournement. */
  integrityCharter: string;
}
