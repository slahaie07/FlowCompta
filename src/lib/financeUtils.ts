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
    case 'NS':
    case 'PE':
      tpsRate = 0;
      tvhRate = 0.15;
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
    case 'NS':
    case 'PE':
      return fr ? 'TVH (15 %)' : 'HST (15%)';
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
    const rate = province === 'ON' ? '13' : '15';
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
