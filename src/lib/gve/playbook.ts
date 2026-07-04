/**
 * GVE — Générateur de plan d'action (playbook) éthique.
 *
 * Traduit les canaux recommandés en tâches concrètes, récurrentes et
 * *honnêtes*. Chaque action porte un garde-fou d'intégrité rappelant qu'aucune
 * automatisation trompeuse n'est employée.
 */

import type { ActionItem, ActionPriority, OpportunityScore } from './types';

interface ActionTemplate {
  titleFr: string;
  cadence: ActionItem['cadence'];
  effortHours: number;
  kpi: string;
  integrityNote: string;
}

const CHANNEL_PLAYBOOKS: Record<string, ActionTemplate[]> = {
  'seo-blog': [
    {
      titleFr: 'Publier 1 article de fond répondant à une vraie question client',
      cadence: 'weekly',
      effortHours: 4,
      kpi: 'Positions mots-clés / trafic organique',
      integrityNote: 'Contenu original et exact, relu par un CPA. Aucun contenu généré en masse sans valeur.',
    },
    {
      titleFr: 'Mettre à jour un ancien article pour préserver son positionnement',
      cadence: 'biweekly',
      effortHours: 2,
      kpi: 'Rétention des positions Top 10',
      integrityNote: 'Actualisation factuelle (taux, dates) — pas de manipulation.',
    },
  ],
  'local-seo-gbp': [
    {
      titleFr: 'Solliciter un avis Google auprès d\'un client réellement satisfait',
      cadence: 'weekly',
      effortHours: 1,
      kpi: 'Nombre et note moyenne des avis authentiques',
      integrityNote: 'Uniquement de vrais clients. Aucun faux avis (illégal et interdit par Google).',
    },
    {
      titleFr: 'Publier une actualité/offre sur la fiche Google Business',
      cadence: 'weekly',
      effortHours: 1,
      kpi: 'Vues et clics de la fiche',
      integrityNote: 'Informations exactes sur des services réellement offerts.',
    },
  ],
  'community-answers': [
    {
      titleFr: 'Répondre à 3 questions pertinentes avec expertise et divulgation',
      cadence: 'weekly',
      effortHours: 2,
      kpi: 'Trafic référent qualifié',
      integrityNote: 'Un seul compte réel, affiliation divulguée, respect des règles de la communauté. Jamais de faux comptes.',
    },
  ],
  'referral-program': [
    {
      titleFr: 'Relancer les clients satisfaits pour activer le parrainage',
      cadence: 'monthly',
      effortHours: 2,
      kpi: 'Taux de parrainage / clients référés',
      integrityNote: 'Incitatif transparent, consentement LCAP, opt-in explicite.',
    },
  ],
  'email-nurture': [
    {
      titleFr: 'Envoyer une infolettre de valeur (échéances fiscales, conseils)',
      cadence: 'biweekly',
      effortHours: 2,
      kpi: 'Taux d\'ouverture / clics / conversions',
      integrityNote: 'Liste opt-in uniquement, désabonnement en un clic, conforme LCAP.',
    },
  ],
  'linkedin-organic': [
    {
      titleFr: 'Publier 2 posts d\'autorité depuis le profil réel de l\'équipe',
      cadence: 'weekly',
      effortHours: 2,
      kpi: 'Portée / visites de profil / demandes',
      integrityNote: 'Publications humaines depuis de vrais profils. Aucune automatisation d\'engagement.',
    },
  ],
  partnerships: [
    {
      titleFr: 'Initier 1 partenariat de co-marketing avec un acteur complémentaire',
      cadence: 'monthly',
      effortHours: 3,
      kpi: 'Leads issus des partenariats',
      integrityNote: 'Accords réels et divulgués (banques, cabinets juridiques, éditeurs logiciels).',
    },
  ],
  'digital-pr': [
    {
      titleFr: 'Proposer un angle éditorial ou une donnée originale à un média',
      cadence: 'monthly',
      effortHours: 3,
      kpi: 'Citations / backlinks de qualité',
      integrityNote: 'Données véridiques et sourcées. Aucune fausse déclaration.',
    },
  ],
};

function priorityFromScore(score: number): ActionPriority {
  if (score >= 55) return 'critique';
  if (score >= 35) return 'haute';
  return 'moyenne';
}

/** Construit le plan d'action pour les canaux recommandés, ordonné par priorité. */
export function buildPlaybook(
  recommendedChannelIds: string[],
  opportunities: OpportunityScore[]
): ActionItem[] {
  const scoreByChannel = new Map(opportunities.map((o) => [o.channelId, o.score]));
  const items: ActionItem[] = [];

  recommendedChannelIds.forEach((channelId) => {
    const templates = CHANNEL_PLAYBOOKS[channelId] ?? [];
    const priority = priorityFromScore(scoreByChannel.get(channelId) ?? 0);
    templates.forEach((template, index) => {
      items.push({
        id: `${channelId}-${index + 1}`,
        channelId,
        titleFr: template.titleFr,
        cadence: template.cadence,
        priority,
        effortHours: template.effortHours,
        kpi: template.kpi,
        integrityNote: template.integrityNote,
      });
    });
  });

  const order: Record<ActionPriority, number> = { critique: 0, haute: 1, moyenne: 2 };
  items.sort((a, b) => order[a.priority] - order[b.priority]);
  return items;
}
