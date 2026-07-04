/**
 * GVE — Catalogue des canaux de croissance organiques et à faible coût.
 *
 * Chaque canal est *légitime* : contenu de valeur, référencement, participation
 * authentique aux communautés (avec divulgation), partenariats, relations presse.
 * Aucun canal ne repose sur de faux comptes, de l'imitation d'identité ou du
 * contournement de protections anti-robot.
 */

import type { GrowthChannel } from './types';

/**
 * Facteur d'attribution multi-touch : proportion du trafic d'un canal réellement
 * créditée comme revenu net-nouveau. Escompte les visiteurs récurrents, le
 * chevauchement de marque et les parcours multi-canaux, pour éviter de
 * sur-attribuer les conversions à un seul canal (pratique d'attribution saine).
 */
export const REVENUE_ATTRIBUTION = 0.4;

export const GROWTH_CHANNELS: GrowthChannel[] = [
  {
    id: 'seo-blog',
    category: 'content-seo',
    nameFr: 'Contenu SEO evergreen',
    nameEn: 'Evergreen SEO content',
    costModel: 'organic',
    baseReachPerMonth: 1800,
    monthlyCostCad: 0,
    conversionModifier: 1.15,
    rampUpMonths: 6,
    effortHoursPerWeek: 6,
    fitTags: ['comptabilité', 'saas', 'services', 'b2b', 'finance', 'juridique'],
    complianceNotes:
      'Articles utiles répondant à de vraies questions. Aucune ferme de contenu, aucun bourrage de mots-clés.',
  },
  {
    id: 'local-seo-gbp',
    category: 'local-seo',
    nameFr: 'Fiche Google Business & SEO local',
    nameEn: 'Google Business Profile & local SEO',
    costModel: 'organic',
    baseReachPerMonth: 1200,
    monthlyCostCad: 0,
    conversionModifier: 1.6,
    rampUpMonths: 3,
    effortHoursPerWeek: 2,
    fitTags: ['comptabilité', 'services', 'commerce', 'santé', 'local'],
    complianceNotes:
      'Fiche vérifiée réelle, vrais avis de vrais clients. Jamais de faux avis (interdit et illégal).',
  },
  {
    id: 'community-answers',
    category: 'community',
    nameFr: 'Réponses expertes en communauté',
    nameEn: 'Expert community answers',
    costModel: 'organic',
    baseReachPerMonth: 900,
    monthlyCostCad: 0,
    conversionModifier: 1.1,
    rampUpMonths: 4,
    effortHoursPerWeek: 3,
    fitTags: ['saas', 'b2b', 'finance', 'comptabilité', 'tech'],
    complianceNotes:
      'Compte réel unique, divulgation claire de l\'affiliation, valeur d\'abord. Respect strict des règles de chaque communauté.',
  },
  {
    id: 'referral-program',
    category: 'referral',
    nameFr: 'Programme de parrainage client',
    nameEn: 'Customer referral program',
    costModel: 'low-cost',
    baseReachPerMonth: 700,
    monthlyCostCad: 150,
    conversionModifier: 2.2,
    rampUpMonths: 3,
    effortHoursPerWeek: 1,
    fitTags: ['comptabilité', 'services', 'saas', 'b2b'],
    complianceNotes:
      'Incitatifs transparents, opt-in explicite, conforme à la LCAP (loi anti-pourriel canadienne).',
  },
  {
    id: 'email-nurture',
    category: 'email',
    nameFr: 'Infolettre & séquences de valeur',
    nameEn: 'Newsletter & value sequences',
    costModel: 'low-cost',
    baseReachPerMonth: 600,
    monthlyCostCad: 60,
    conversionModifier: 1.8,
    rampUpMonths: 4,
    effortHoursPerWeek: 2,
    fitTags: ['saas', 'b2b', 'services', 'comptabilité', 'e-commerce'],
    complianceNotes:
      'Consentement LCAP obligatoire, désabonnement en un clic, aucune liste achetée.',
  },
  {
    id: 'linkedin-organic',
    category: 'social-organic',
    nameFr: 'Autorité organique LinkedIn',
    nameEn: 'Organic LinkedIn authority',
    costModel: 'organic',
    baseReachPerMonth: 1100,
    monthlyCostCad: 0,
    conversionModifier: 1.05,
    rampUpMonths: 5,
    effortHoursPerWeek: 3,
    fitTags: ['b2b', 'saas', 'comptabilité', 'consulting', 'finance'],
    complianceNotes:
      'Publication depuis des profils réels de l\'équipe. Aucune automatisation d\'engagement ni faux compte.',
  },
  {
    id: 'partnerships',
    category: 'partnerships',
    nameFr: 'Partenariats & co-marketing',
    nameEn: 'Partnerships & co-marketing',
    costModel: 'low-cost',
    baseReachPerMonth: 800,
    monthlyCostCad: 100,
    conversionModifier: 1.9,
    rampUpMonths: 4,
    effortHoursPerWeek: 2,
    fitTags: ['saas', 'b2b', 'comptabilité', 'services', 'fintech'],
    complianceNotes:
      'Accords réels et divulgués avec des partenaires complémentaires (banques, cabinets juridiques, logiciels).',
  },
  {
    id: 'digital-pr',
    category: 'pr',
    nameFr: 'Relations presse & citations',
    nameEn: 'Digital PR & citations',
    costModel: 'low-cost',
    baseReachPerMonth: 1400,
    monthlyCostCad: 120,
    conversionModifier: 0.9,
    rampUpMonths: 6,
    effortHoursPerWeek: 2,
    fitTags: ['saas', 'fintech', 'b2b', 'comptabilité', 'finance'],
    complianceNotes:
      'Angles éditoriaux authentiques, données originales, aucune publication mensongère.',
  },
];

const CHANNEL_INDEX: Record<string, GrowthChannel> = Object.fromEntries(
  GROWTH_CHANNELS.map((c) => [c.id, c])
);

export function getChannel(id: string): GrowthChannel | undefined {
  return CHANNEL_INDEX[id];
}

export function listChannels(): GrowthChannel[] {
  return [...GROWTH_CHANNELS];
}
