/**
 * Réseau national ComptaFlow — source unique pour couverture Canada,
 * conformité légale (PIPEDA, Loi 25) et automatisation régionale.
 */

import type { ProvinceCode } from './financeUtils';
import { SUPPORT_EMAIL } from './config';

export type PrivacyLaw = 'loi25' | 'pipeda' | 'pipeda_bc' | 'pipa_ab';

export interface CanadianRegion {
  code: ProvinceCode;
  nameFr: string;
  nameEn: string;
  timezone: string;
  edgeRegion: string;
  privacyLaw: PrivacyLaw;
  taxLabelFr: string;
  taxLabelEn: string;
  seoSlug: string;
  active: boolean;
}

export interface LegalPattern {
  id: string;
  titleFr: string;
  titleEn: string;
  required: boolean;
  route?: string;
  appliesTo: PrivacyLaw[] | 'all';
}

export const SITE = {
  domain: 'compta-flow.net',
  url: 'https://compta-flow.net',
  supportEmail: SUPPORT_EMAIL,
  privacyEmail: 'privacy@compta-flow.net',
  dataRegion: 'ca-central-1',
  publisher: 'ComptaFlow',
  neq: '2276543210',
  publisherCity: 'Québec, QC, Canada',
} as const;

export const CANADIAN_REGIONS: Record<ProvinceCode, CanadianRegion> = {
  QC: {
    code: 'QC',
    nameFr: 'Québec',
    nameEn: 'Quebec',
    timezone: 'America/Toronto',
    edgeRegion: 'yul1',
    privacyLaw: 'loi25',
    taxLabelFr: 'TPS 5 % + TVQ 9,975 %',
    taxLabelEn: 'GST 5% + QST 9.975%',
    seoSlug: 'quebec',
    active: true,
  },
  ON: {
    code: 'ON',
    nameFr: 'Ontario',
    nameEn: 'Ontario',
    timezone: 'America/Toronto',
    edgeRegion: 'yyz1',
    privacyLaw: 'pipeda',
    taxLabelFr: 'TVH 13 %',
    taxLabelEn: 'HST 13%',
    seoSlug: 'ontario',
    active: true,
  },
  BC: {
    code: 'BC',
    nameFr: 'Colombie-Britannique',
    nameEn: 'British Columbia',
    timezone: 'America/Vancouver',
    edgeRegion: 'yvr1',
    privacyLaw: 'pipeda_bc',
    taxLabelFr: 'TPS 5 % + TVP 7 %',
    taxLabelEn: 'GST 5% + PST 7%',
    seoSlug: 'colombie-britannique',
    active: true,
  },
  AB: {
    code: 'AB',
    nameFr: 'Alberta',
    nameEn: 'Alberta',
    timezone: 'America/Edmonton',
    edgeRegion: 'yyc1',
    privacyLaw: 'pipa_ab',
    taxLabelFr: 'TPS 5 %',
    taxLabelEn: 'GST 5%',
    seoSlug: 'alberta',
    active: true,
  },
  MB: {
    code: 'MB',
    nameFr: 'Manitoba',
    nameEn: 'Manitoba',
    timezone: 'America/Winnipeg',
    edgeRegion: 'ywg1',
    privacyLaw: 'pipeda',
    taxLabelFr: 'TPS 5 % + TVP 7 %',
    taxLabelEn: 'GST 5% + PST 7%',
    seoSlug: 'manitoba',
    active: true,
  },
  SK: {
    code: 'SK',
    nameFr: 'Saskatchewan',
    nameEn: 'Saskatchewan',
    timezone: 'America/Regina',
    edgeRegion: 'yxe1',
    privacyLaw: 'pipeda',
    taxLabelFr: 'TPS 5 % + TVP 6 %',
    taxLabelEn: 'GST 5% + PST 6%',
    seoSlug: 'saskatchewan',
    active: true,
  },
  NB: {
    code: 'NB',
    nameFr: 'Nouveau-Brunswick',
    nameEn: 'New Brunswick',
    timezone: 'America/Moncton',
    edgeRegion: 'yfc1',
    privacyLaw: 'pipeda',
    taxLabelFr: 'TVH 15 %',
    taxLabelEn: 'HST 15%',
    seoSlug: 'nouveau-brunswick',
    active: true,
  },
  NS: {
    code: 'NS',
    nameFr: 'Nouvelle-Écosse',
    nameEn: 'Nova Scotia',
    timezone: 'America/Halifax',
    edgeRegion: 'yhz1',
    privacyLaw: 'pipeda',
    taxLabelFr: 'TVH 15 %',
    taxLabelEn: 'HST 15%',
    seoSlug: 'nouvelle-ecosse',
    active: true,
  },
  PE: {
    code: 'PE',
    nameFr: 'Île-du-Prince-Édouard',
    nameEn: 'Prince Edward Island',
    timezone: 'America/Halifax',
    edgeRegion: 'yhz1',
    privacyLaw: 'pipeda',
    taxLabelFr: 'TVH 15 %',
    taxLabelEn: 'HST 15%',
    seoSlug: 'ipe',
    active: true,
  },
  NL: {
    code: 'NL',
    nameFr: 'Terre-Neuve-et-Labrador',
    nameEn: 'Newfoundland and Labrador',
    timezone: 'America/St_Johns',
    edgeRegion: 'yyt1',
    privacyLaw: 'pipeda',
    taxLabelFr: 'TVH 15 %',
    taxLabelEn: 'HST 15%',
    seoSlug: 'terre-neuve',
    active: true,
  },
  YT: {
    code: 'YT',
    nameFr: 'Yukon',
    nameEn: 'Yukon',
    timezone: 'America/Whitehorse',
    edgeRegion: 'yxy1',
    privacyLaw: 'pipeda',
    taxLabelFr: 'TPS 5 %',
    taxLabelEn: 'GST 5%',
    seoSlug: 'yukon',
    active: true,
  },
  NT: {
    code: 'NT',
    nameFr: 'Territoires du Nord-Ouest',
    nameEn: 'Northwest Territories',
    timezone: 'America/Yellowknife',
    edgeRegion: 'yxy1',
    privacyLaw: 'pipeda',
    taxLabelFr: 'TPS 5 %',
    taxLabelEn: 'GST 5%',
    seoSlug: 'tno',
    active: true,
  },
  NU: {
    code: 'NU',
    nameFr: 'Nunavut',
    nameEn: 'Nunavut',
    timezone: 'America/Iqaluit',
    edgeRegion: 'yxy1',
    privacyLaw: 'pipeda',
    taxLabelFr: 'TPS 5 %',
    taxLabelEn: 'GST 5%',
    seoSlug: 'nunavut',
    active: true,
  },
};

/** Pattern légal obligatoire — affiché automatiquement sur toute la plateforme. */
export const LEGAL_PATTERN: LegalPattern[] = [
  {
    id: 'cookie_consent',
    titleFr: 'Consentement aux témoins (Loi 25 / PIPEDA)',
    titleEn: 'Cookie consent (Law 25 / PIPEDA)',
    required: true,
    route: '/cookies',
    appliesTo: 'all',
  },
  {
    id: 'privacy_policy',
    titleFr: 'Politique de confidentialité',
    titleEn: 'Privacy policy',
    required: true,
    route: '/privacy',
    appliesTo: 'all',
  },
  {
    id: 'terms_of_service',
    titleFr: 'Conditions de service',
    titleEn: 'Terms of service',
    required: true,
    route: '/terms',
    appliesTo: 'all',
  },
  {
    id: 'legal_notice',
    titleFr: 'Mentions légales',
    titleEn: 'Legal notice',
    required: true,
    route: '/legal',
    appliesTo: 'all',
  },
  {
    id: 'data_residency',
    titleFr: 'Hébergement des données au Canada',
    titleEn: 'Canadian data residency',
    required: true,
    appliesTo: 'all',
  },
  {
    id: 'cpa_disclaimer',
    titleFr: 'Avis CPA — services de tenue de livres uniquement',
    titleEn: 'CPA notice — bookkeeping services only',
    required: true,
    appliesTo: 'all',
  },
  {
    id: 'loi25_officer',
    titleFr: 'Responsable protection des renseignements personnels',
    titleEn: 'Privacy officer (Law 25)',
    required: true,
    appliesTo: ['loi25'],
  },
];

const PROVINCE_ALIASES: Record<string, ProvinceCode> = {
  QC: 'QC', QUEBEC: 'QC', QUÉBEC: 'QC',
  ON: 'ON', ONTARIO: 'ON',
  BC: 'BC', 'BRITISH COLUMBIA': 'BC', 'COLOMBIE-BRITANNIQUE': 'BC',
  AB: 'AB', ALBERTA: 'AB',
  MB: 'MB', MANITOBA: 'MB',
  SK: 'SK', SASKATCHEWAN: 'SK',
  NB: 'NB', 'NEW BRUNSWICK': 'NB', 'NOUVEAU-BRUNSWICK': 'NB',
  NS: 'NS', 'NOVA SCOTIA': 'NS', 'NOUVELLE-ÉCOSSE': 'NS',
  PE: 'PE', 'PRINCE EDWARD ISLAND': 'PE', 'ÎLE-DU-PRINCE-ÉDOUARD': 'PE',
  NL: 'NL', 'NEWFOUNDLAND AND LABRADOR': 'NL', 'TERRE-NEUVE-ET-LABRADOR': 'NL',
  YT: 'YT', YUKON: 'YT',
  NT: 'NT', 'NORTHWEST TERRITORIES': 'NT', 'TERRITOIRES DU NORD-OUEST': 'NT',
  NU: 'NU', NUNAVUT: 'NU',
};

export function normalizeProvinceCode(input?: string | null): ProvinceCode {
  if (!input) return 'QC';
  const key = input.trim().toUpperCase();
  return PROVINCE_ALIASES[key] ?? 'QC';
}

export function getRegion(code?: string | null): CanadianRegion {
  return CANADIAN_REGIONS[normalizeProvinceCode(code)];
}

export function getActiveRegions(): CanadianRegion[] {
  return Object.values(CANADIAN_REGIONS).filter((r) => r.active);
}

export function getLegalRequirements(region: CanadianRegion): LegalPattern[] {
  return LEGAL_PATTERN.filter(
    (item) =>
      item.appliesTo === 'all' ||
      item.appliesTo.includes(region.privacyLaw)
  );
}

export function buildSitemapUrls(): string[] {
  const base = SITE.url;
  const staticPages = ['/', '/privacy', '/terms', '/legal', '/cookies', '/login', '/showcase'];
  const regionalPages = getActiveRegions().map((r) => `/ca/${r.seoSlug}`);
  return [...staticPages, ...regionalPages].map((path) => `${base}${path}`);
}

export function detectProvinceFromHeaders(headers: Record<string, string | string[] | undefined>): ProvinceCode {
  const vercelRegion = String(headers['x-vercel-ip-country-region'] ?? '');
  if (vercelRegion && PROVINCE_ALIASES[vercelRegion.toUpperCase()]) {
    return normalizeProvinceCode(vercelRegion);
  }

  const cfRegion = String(headers['cf-region-code'] ?? '');
  if (cfRegion && PROVINCE_ALIASES[cfRegion.toUpperCase()]) {
    return normalizeProvinceCode(cfRegion);
  }

  const country = String(headers['x-vercel-ip-country'] ?? headers['cf-ipcountry'] ?? 'CA');
  if (country !== 'CA') return 'QC';

  return 'QC';
}

export interface NetworkStatus {
  domain: string;
  dataRegion: string;
  activeRegions: number;
  legalPatternVersion: string;
  edgeNodes: string[];
  compliance: {
    pipeda: boolean;
    loi25: boolean;
    dataInCanada: boolean;
  };
}

export function getNetworkStatus(): NetworkStatus {
  const regions = getActiveRegions();
  return {
    domain: SITE.domain,
    dataRegion: SITE.dataRegion,
    activeRegions: regions.length,
    legalPatternVersion: '2026.06',
    edgeNodes: [...new Set(regions.map((r) => r.edgeRegion))],
    compliance: {
      pipeda: true,
      loi25: true,
      dataInCanada: true,
    },
  };
}
