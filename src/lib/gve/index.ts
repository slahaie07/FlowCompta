/**
 * GVE — Growth & Visibility Engine (barrel).
 *
 * Moteur d'intelligence de croissance organique pour ComptaFlow. Priorise les
 * canaux légitimes, projette trafic et ROI, et génère un plan d'action éthique.
 * Ne crée jamais de faux comptes ni ne contourne de protections anti-robot.
 */

export * from './types';
export { GROWTH_CHANNELS, getChannel, listChannels } from './channels';
export {
  PROVINCE_REACH_WEIGHT,
  clamp,
  nicheFit,
  reachAtMaturity,
  confidenceFor,
  monthlyRevenueAtMaturity,
  scoreChannel,
  scoreAllChannels,
  selectChannelsWithinCapacity,
} from './scoring';
export { paidBenchmarkCac, maturityFactor, projectGrowth } from './projection';
export { buildPlaybook } from './playbook';
export { INTEGRITY_CHARTER, normalizeTarget, buildGrowthPlan } from './engine';
