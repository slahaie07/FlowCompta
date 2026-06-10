/**
 * 🇨🇦 Moteur de Calcul Financier ComptaFlow
 * Gère les taxes canadiennes selon la province et les règles fiscales actuelles.
 */

export type ProvinceCode = 'QC' | 'ON' | 'BC' | 'AB' | 'MB' | 'NB' | 'NL' | 'NS' | 'PE' | 'SK' | 'YT' | 'NT' | 'NU';

export interface TaxResult {
  subtotal: number;
  tps: number; // GST
  tvq: number; // QST
  tvh: number; // HST
  total: number;
}

/**
 * Calcule les taxes pour un montant brut donné selon la province.
 */
export function calculateCanadianTaxes(amount: number, province: ProvinceCode = 'QC'): TaxResult {
  let tpsRate = 0.05; // Fédéral (GST)
  let tvqRate = 0;    // Québec (QST)
  let tvhRate = 0;    // Harmonisée (HST)

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
    default:
      // Alberta, BC, Manitoba, Saskatchewan, Territoires : GST only (5%)
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
    total
  };
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
