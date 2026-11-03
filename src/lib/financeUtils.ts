/**
 * 🇨🇦 Moteur de Calcul Financier ComptaFlow
 * Gère les taxes canadiennes selon la province et les règles fiscales actuelles.
 */

export type ProvinceCode = 'QC' | 'ON' | 'BC' | 'AB' | 'MB' | 'NB' | 'NL' | 'NS' | 'PE' | 'SK' | 'YT' | 'NT' | 'NU';

export interface TaxResult {
  subtotal: number;
  tps: number; // GST
  tvq: number; // QST / PST (provincial, hors TVH)
  tvh: number; // HST
  total: number;
}

export interface TaxDisplayLine {
  label: string;
  amount: number;
}

export function normalizeProvinceCode(value?: string | null): ProvinceCode {
  const code = (value || 'ON').toUpperCase();
  const allowed: ProvinceCode[] = ['QC', 'ON', 'BC', 'AB', 'MB', 'NB', 'NL', 'NS', 'PE', 'SK', 'YT', 'NT', 'NU'];
  return allowed.includes(code as ProvinceCode) ? (code as ProvinceCode) : 'ON';
}

/**
 * Calcule les taxes pour un montant brut donné selon la province.
 */
export function calculateCanadianTaxes(amount: number, province: ProvinceCode = 'ON'): TaxResult {
  let tpsRate = 0.05;
  let tvqRate = 0;
  let tvhRate = 0;

  switch (province) {
    case 'QC':
      tvqRate = 0.09975;
      break;
    case 'ON':
      tpsRate = 0;
      tvhRate = 0.13;
      break;
    case 'NB':
    case 'NL':
    case 'PE':
      tpsRate = 0;
      tvhRate = 0.15;
      break;
    case 'NS':
      tpsRate = 0;
      tvhRate = 0.14;
      break;
    case 'BC':
      tvqRate = 0.07;
      break;
    case 'SK':
      tvqRate = 0.06;
      break;
    case 'MB':
      tvqRate = 0.07;
      break;
    default:
      tvqRate = 0;
      tvhRate = 0;
  }

  const tps = Number((amount * tpsRate).toFixed(2));
  const tvq = Number((amount * tvqRate).toFixed(2));
  const tvh = Number((amount * tvhRate).toFixed(2));
  const total = Number((amount + tps + tvq + tvh).toFixed(2));

  return {
    subtotal: amount,
    tps,
    tvq,
    tvh,
    total,
  };
}

export function getTaxSubtitle(province: ProvinceCode, lang: 'fr' | 'en' = 'fr'): string {
  const fr = lang === 'fr';
  switch (province) {
    case 'QC':
      return fr ? 'TPS (5 %) + TVQ (9,975 %)' : 'GST (5%) + QST (9.975%)';
    case 'ON':
      return fr ? 'TVH (13 %)' : 'HST (13%)';
    case 'NB':
    case 'NL':
    case 'PE':
      return fr ? 'TVH (15 %)' : 'HST (15%)';
    case 'NS':
      return fr ? 'TVH (14 %)' : 'HST (14%)';
    case 'BC':
      return fr ? 'TPS (5 %) + TVP C.-B. (7 %)' : 'GST (5%) + BC PST (7%)';
    case 'SK':
      return fr ? 'TPS (5 %) + TVP Sask. (6 %)' : 'GST (5%) + SK PST (6%)';
    case 'MB':
      return fr ? 'TPS (5 %) + TVP Man. (7 %)' : 'GST (5%) + MB PST (7%)';
    default:
      return fr ? 'TPS fédérale (5 %)' : 'Federal GST (5%)';
  }
}

export function getTaxDisplayLines(
  result: TaxResult,
  province: ProvinceCode,
  lang: 'fr' | 'en' = 'fr'
): TaxDisplayLine[] {
  const fr = lang === 'fr';
  const lines: TaxDisplayLine[] = [];

  if (result.tvh > 0) {
    const rate = province === 'ON' ? '13' : province === 'NS' ? '14' : '15';
    lines.push({
      label: fr ? `TVH harmonisée (${rate} %)` : `Harmonized HST (${rate}%)`,
      amount: result.tvh,
    });
    return lines;
  }

  if (result.tps > 0) {
    lines.push({
      label: fr ? 'TPS fédérale (5 %)' : 'Federal GST (5%)',
      amount: result.tps,
    });
  }

  if (result.tvq > 0) {
    const label =
      province === 'QC'
        ? fr ? 'TVQ provinciale (9,975 %)' : 'Provincial QST (9.975%)'
        : province === 'BC'
          ? fr ? 'TVP C.-B. (7 %)' : 'BC PST (7%)'
          : province === 'SK'
            ? fr ? 'TVP Sask. (6 %)' : 'SK PST (6%)'
            : province === 'MB'
              ? fr ? 'TVP Man. (7 %)' : 'MB PST (7%)'
              : fr ? 'Taxe provinciale' : 'Provincial tax';
    lines.push({ label, amount: result.tvq });
  }

  return lines;
}

/**
 * Formate un montant en dollars canadiens.
 */
export const formatCAD = (amount: number) => {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(amount);
};

/**
 * ─────────────────────────────────────────────────────────────
 * Moteur détaillé pour la calculatrice publique de taxes.
 * Calculs effectués en cents, avec les taux exprimés en fractions
 * entières : les arrondis au cent sont exacts, y compris le cas
 * limite de la TVQ (9,975 % → 399/4000).
 * ─────────────────────────────────────────────────────────────
 */

export type TaxComponentKind = 'GST' | 'HST' | 'QST' | 'PST' | 'RST';

export interface TaxComponentDef {
  kind: TaxComponentKind;
  /** Taux = rateNum / rateDen (ex. TVQ : 399 / 4000 = 9,975 %). */
  rateNum: number;
  rateDen: number;
  rateLabelFr: string;
  rateLabelEn: string;
  labelFr: string;
  labelEn: string;
}

const GST_COMPONENT: TaxComponentDef = {
  kind: 'GST',
  rateNum: 1,
  rateDen: 20,
  rateLabelFr: '5 %',
  rateLabelEn: '5%',
  labelFr: 'TPS',
  labelEn: 'GST',
};

const QST_COMPONENT: TaxComponentDef = {
  kind: 'QST',
  rateNum: 399,
  rateDen: 4000,
  rateLabelFr: '9,975 %',
  rateLabelEn: '9.975%',
  labelFr: 'TVQ',
  labelEn: 'QST',
};

function hstComponent(rateNum: number, rateDen: number, rateLabelFr: string, rateLabelEn: string): TaxComponentDef {
  return {
    kind: 'HST',
    rateNum,
    rateDen,
    rateLabelFr,
    rateLabelEn,
    labelFr: 'TVH',
    labelEn: 'HST',
  };
}

/**
 * Composantes de taxes applicables dans chaque province et territoire.
 * Québec : la TVQ est calculée sur le montant SANS la TPS.
 * Nouvelle-Écosse : TVH de 14 % en vigueur depuis le 1er avril 2025.
 * Alberta, Yukon, Territoires du Nord-Ouest, Nunavut : TPS seule.
 */
export function getProvinceTaxComponents(province: ProvinceCode): TaxComponentDef[] {
  switch (province) {
    case 'QC':
      return [GST_COMPONENT, QST_COMPONENT];
    case 'ON':
      return [hstComponent(13, 100, '13 %', '13%')];
    case 'NB':
    case 'NL':
    case 'PE':
      return [hstComponent(3, 20, '15 %', '15%')];
    case 'NS':
      return [hstComponent(7, 50, '14 %', '14%')];
    case 'BC':
      return [
        GST_COMPONENT,
        {
          kind: 'PST',
          rateNum: 7,
          rateDen: 100,
          rateLabelFr: '7 %',
          rateLabelEn: '7%',
          labelFr: 'TVP C.-B.',
          labelEn: 'BC PST',
        },
      ];
    case 'SK':
      return [
        GST_COMPONENT,
        {
          kind: 'PST',
          rateNum: 3,
          rateDen: 50,
          rateLabelFr: '6 %',
          rateLabelEn: '6%',
          labelFr: 'TVP Sask.',
          labelEn: 'SK PST',
        },
      ];
    case 'MB':
      return [
        GST_COMPONENT,
        {
          kind: 'RST',
          rateNum: 7,
          rateDen: 100,
          rateLabelFr: '7 %',
          rateLabelEn: '7%',
          labelFr: 'TVD Man.',
          labelEn: 'MB RST',
        },
      ];
    default:
      return [GST_COMPONENT];
  }
}

export interface DetailedTaxLine extends TaxComponentDef {
  amount: number;
}

export interface DetailedTaxResult {
  province: ProvinceCode;
  /** Montant avant taxes. */
  net: number;
  /** Une ligne par taxe applicable — jamais de taxe étrangère à la province. */
  lines: DetailedTaxLine[];
  /** Somme des taxes. */
  taxTotal: number;
  /** Montant total, taxes incluses. */
  gross: number;
}

const toCents = (amount: number): number =>
  Math.round((Number.isFinite(amount) ? amount : 0) * 100);

const componentCents = (netCents: number, def: TaxComponentDef): number =>
  Math.round((netCents * def.rateNum) / def.rateDen);

function buildDetailedResult(
  province: ProvinceCode,
  netCents: number,
  lineCents: number[],
  grossCents: number
): DetailedTaxResult {
  const defs = getProvinceTaxComponents(province);
  return {
    province,
    net: netCents / 100,
    lines: defs.map((def, i) => ({ ...def, amount: (lineCents[i] ?? 0) / 100 })),
    taxTotal: (grossCents - netCents) / 100,
    gross: grossCents / 100,
  };
}

/** Mode « Ajouter les taxes » : montant net → détail des taxes → total. */
export function calculateTaxFromNet(amount: number, province: ProvinceCode): DetailedTaxResult {
  const netCents = toCents(amount);
  const lineCents = getProvinceTaxComponents(province).map((def) => componentCents(netCents, def));
  const grossCents = netCents + lineCents.reduce((sum, c) => sum + c, 0);
  return buildDetailedResult(province, netCents, lineCents, grossCents);
}

/** Mode « Taxes incluses » : montant total → extraction du net et de chaque taxe. */
export function calculateTaxFromGross(amount: number, province: ProvinceCode): DetailedTaxResult {
  const grossCents = toCents(amount);
  const defs = getProvinceTaxComponents(province);
  const combinedRate = defs.reduce((sum, def) => sum + def.rateNum / def.rateDen, 0);
  const netCents = Math.round(grossCents / (1 + combinedRate));
  const lineCents = defs.map((def) => componentCents(netCents, def));
  // Réconciliation au cent : tout écart d'arrondi est appliqué à la ligne de
  // taxe la plus importante, pour que net + taxes = total, exactement.
  const residual = grossCents - netCents - lineCents.reduce((sum, c) => sum + c, 0);
  if (residual !== 0 && lineCents.length > 0) {
    let idx = 0;
    lineCents.forEach((cents, i) => {
      if (cents > lineCents[idx]) idx = i;
    });
    lineCents[idx] += residual;
  }
  return buildDetailedResult(province, netCents, lineCents, grossCents);
}

const moneyFormatters: Record<'fr' | 'en', Intl.NumberFormat> = {
  fr: new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }),
  en: new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }),
};

/** Formate un montant selon la langue (FR : 1 234,56 $ ; EN : $1,234.56). */
export function formatMoney(amount: number, lang: 'fr' | 'en' = 'fr'): string {
  return moneyFormatters[lang].format(amount);
}
