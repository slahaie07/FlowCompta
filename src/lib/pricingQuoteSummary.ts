import {
  calculateCanadianTaxes,
  formatCAD,
  getTaxDisplayLines,
} from './financeUtils';
import type { PricingEstimateResult, PricingQuestionnaireAnswers } from './pricingEstimator';
import { getServiceLabel, SERVICE_CATALOG, type ServiceId } from './servicesCatalog';

export type QuoteSummaryRow = {
  label: string;
  value: string;
  emphasis?: boolean;
};

export type QuoteBreakdownRow = {
  label: string;
  value: string;
};

type TranslateFn = (key: string) => string;

function formatMultiplier(value: number, t: TranslateFn): string {
  return t('pricingQuestionnaire.breakdown.multiplier').replace('{value}', value.toFixed(2));
}

function formatBreakdownValue(labelKey: string, amount: number, t: TranslateFn): string {
  if (labelKey === 'hours') {
    return t('pricingQuestionnaire.breakdown.hoursValue').replace('{count}', String(amount));
  }
  if (labelKey === 't4Employees') {
    return t('pricingQuestionnaire.breakdown.employeesValue').replace('{count}', String(amount));
  }
  if (['profile', 'volume', 'employees', 'urgency'].includes(labelKey)) {
    return formatMultiplier(amount, t);
  }
  if (labelKey.startsWith('addon.')) {
    return formatCAD(amount);
  }
  return formatCAD(amount);
}

export function getBreakdownLabel(labelKey: string, t: TranslateFn): string {
  if (labelKey.startsWith('addon.')) {
    const addOnId = labelKey.replace('addon.', '') as ServiceId;
    return getServiceLabel(addOnId, t);
  }
  const key = `pricingQuestionnaire.breakdown.${labelKey}`;
  const translated = t(key);
  return translated !== key ? translated : labelKey;
}

export function buildParameterRows(
  answers: PricingQuestionnaireAnswers,
  t: TranslateFn,
  options?: { showVolume?: boolean; showEmployees?: boolean }
): QuoteSummaryRow[] {
  const rows: QuoteSummaryRow[] = [
    {
      label: t('pricingQuestionnaire.result.table.service'),
      value: getServiceLabel(answers.serviceId, t),
    },
    {
      label: t('pricingQuestionnaire.result.table.province'),
      value: t(`pricingQuestionnaire.provinces.${answers.province}`),
    },
    {
      label: t('pricingQuestionnaire.result.table.profile'),
      value: t(`pricingQuestionnaire.profile.${answers.profileType}.title`),
    },
  ];

  if (options?.showVolume) {
    rows.push({
      label: t('pricingQuestionnaire.result.table.volume'),
      value: t(`pricingQuestionnaire.volume.${answers.volumeBand}.title`),
    });
  }

  if (options?.showEmployees) {
    rows.push({
      label: t('pricingQuestionnaire.result.table.employees'),
      value: t(`pricingQuestionnaire.employees.${answers.employeeBand}.title`),
    });
  }

  if (answers.addOns.length > 0) {
    rows.push({
      label: t('pricingQuestionnaire.result.table.addons'),
      value: answers.addOns.map((id) => getServiceLabel(id, t)).join(', '),
    });
  }

  rows.push({
    label: t('pricingQuestionnaire.result.table.urgency'),
    value: t(`pricingQuestionnaire.urgency.${answers.urgency}.title`),
  });

  return rows;
}

export function buildBreakdownRows(
  result: PricingEstimateResult,
  t: TranslateFn
): QuoteBreakdownRow[] {
  return result.breakdown.map((line) => ({
    label: getBreakdownLabel(line.labelKey, t),
    value: formatBreakdownValue(line.labelKey, line.amount, t),
  }));
}

export function buildPricingRows(
  result: PricingEstimateResult,
  t: TranslateFn
): QuoteSummaryRow[] {
  const unit = t(`pricingQuestionnaire.units.${result.billingUnit}`);
  return [
    {
      label: t('pricingQuestionnaire.result.range'),
      value: `${formatCAD(result.amountMin)} – ${formatCAD(result.amountMax)}`,
      emphasis: true,
    },
    {
      label: t('pricingQuestionnaire.result.typical'),
      value: `${formatCAD(result.amountTypical)} ${unit}`,
      emphasis: true,
    },
  ];
}

export function getServiceCode(serviceId: ServiceId): string {
  return SERVICE_CATALOG.find((s) => s.id === serviceId)?.code ?? '—';
}

export function printPricingQuotePdf(
  answers: PricingQuestionnaireAnswers,
  result: PricingEstimateResult,
  t: TranslateFn,
  lang: 'fr' | 'en',
  options?: { showVolume?: boolean; showEmployees?: boolean; variant?: 'client' | 'staff' }
): boolean {
  const win = window.open('', '_blank');
  if (!win) return false;

  const taxPreview = calculateCanadianTaxes(result.amountTypical, answers.province);
  const taxLines = getTaxDisplayLines(taxPreview, answers.province, lang);
  const parameterRows = buildParameterRows(answers, t, options);
  const breakdownRows = buildBreakdownRows(result, t);
  const pricingRows = buildPricingRows(result, t);
  const serviceCode = getServiceCode(result.serviceId);
  const dateStr = new Date().toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const title =
    options?.variant === 'staff'
      ? t('pricingQuestionnaire.staff.result.title')
      : t('pricingQuestionnaire.result.title');

  const disclaimer =
    options?.variant === 'staff'
      ? t('pricingQuestionnaire.staff.disclaimer')
      : t('pricingQuestionnaire.disclaimer');

  const renderTableRows = (rows: { label: string; value: string; emphasis?: boolean }[]) =>
    rows
      .map(
        (row) => `
      <tr>
        <td>${row.label}</td>
        <td class="${row.emphasis ? 'emphasis' : ''}">${row.value}</td>
      </tr>`
      )
      .join('');

  win.document.write(`<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8"/>
  <title>${title} — ComptaFlow</title>
  <style>
    @page { size: A4; margin: 18mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Georgia, serif; color: #111; background: #fff; font-size: 12px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 20px; border-bottom: 2px solid #C6A15B; margin-bottom: 24px; }
    .brand { font-size: 26px; font-weight: bold; color: #C6A15B; letter-spacing: 2px; }
    .brand-sub { font-size: 8px; letter-spacing: 3px; color: #888; font-family: Arial, sans-serif; margin-top: 4px; text-transform: uppercase; }
    .meta { text-align: right; font-family: Arial, sans-serif; font-size: 11px; color: #666; }
    .doc-title { font-size: 20px; font-weight: bold; color: #111; margin-bottom: 4px; }
    .doc-code { font-family: 'Courier New', monospace; font-size: 11px; color: #C6A15B; }
    .section { margin-bottom: 22px; }
    .section-title { font-size: 9px; letter-spacing: 2px; color: #888; font-family: Arial, sans-serif; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
    th { background: #faf7f0; padding: 9px 14px; text-align: left; font-size: 8px; letter-spacing: 1.5px; color: #888; font-family: Arial, sans-serif; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #e8e0d0; }
    td { padding: 10px 14px; font-size: 12px; border-bottom: 1px solid #f0ebe3; font-family: Arial, sans-serif; vertical-align: top; }
    td:first-child { color: #555; width: 42%; }
    td:last-child { text-align: right; color: #111; font-weight: 500; }
    td.emphasis { color: #C6A15B; font-weight: bold; }
    .highlight-box { background: #faf7f0; border: 1px solid #C6A15B44; border-radius: 8px; padding: 16px 18px; margin: 18px 0; }
    .highlight-range { font-size: 22px; font-weight: bold; color: #111; font-family: Georgia, serif; text-align: center; }
    .highlight-typical { font-size: 12px; color: #666; text-align: center; margin-top: 6px; font-family: Arial, sans-serif; }
    .totals { max-width: 340px; margin-left: auto; }
    .total-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 12px; color: #555; font-family: Arial, sans-serif; }
    .total-final { display: flex; justify-content: space-between; padding: 10px 0; font-size: 16px; font-weight: bold; color: #111; border-top: 2px solid #C6A15B; margin-top: 4px; }
    .total-final span:last-child { color: #C6A15B; }
    .disclaimer { font-size: 10px; color: #888; font-style: italic; border-left: 3px solid #C6A15B; padding-left: 12px; margin-top: 20px; line-height: 1.5; }
    .footer { margin-top: 36px; padding-top: 14px; border-top: 1px solid #eee; font-size: 9px; color: #aaa; font-family: Arial, sans-serif; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">ComptaFlow</div>
      <div class="brand-sub">${t('pricingQuestionnaire.pdf.brandSub')}</div>
    </div>
    <div class="meta">
      <div class="doc-title">${title}</div>
      <div class="doc-code">${serviceCode}</div>
      <div style="margin-top:8px;">${dateStr}</div>
      <div>${getServiceLabel(result.serviceId, t)}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">${t('pricingQuestionnaire.result.table.parameters')}</div>
    <table>
      <thead><tr><th>${t('pricingQuestionnaire.result.table.columnLabel')}</th><th>${t('pricingQuestionnaire.result.table.columnValue')}</th></tr></thead>
      <tbody>${renderTableRows(parameterRows)}</tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">${t('pricingQuestionnaire.result.table.breakdown')}</div>
    <table>
      <thead><tr><th>${t('pricingQuestionnaire.result.table.columnLabel')}</th><th>${t('pricingQuestionnaire.result.table.columnValue')}</th></tr></thead>
      <tbody>
        ${breakdownRows
          .map(
            (row) => `
        <tr><td>${row.label}</td><td>${row.value}</td></tr>`
          )
          .join('')}
      </tbody>
    </table>
  </div>

  <div class="highlight-box">
    <div class="highlight-range">${formatCAD(result.amountMin)} – ${formatCAD(result.amountMax)}</div>
    <div class="highlight-typical">${t('pricingQuestionnaire.result.typical')}: ${formatCAD(result.amountTypical)} ${t(`pricingQuestionnaire.units.${result.billingUnit}`)}</div>
  </div>

  <div class="section">
    <div class="section-title">${t('pricingQuestionnaire.result.table.pricing')}</div>
    <table>
      <tbody>${renderTableRows(pricingRows)}</tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">${t('pricingQuestionnaire.result.taxesHint')}</div>
    <div class="totals">
      ${taxLines
        .map(
          (line) => `
      <div class="total-row"><span>${line.label}</span><span>${formatCAD(line.amount)}</span></div>`
        )
        .join('')}
      <div class="total-final"><span>${t('pricingQuestionnaire.result.totalWithTax')}</span><span>${formatCAD(taxPreview.total)}</span></div>
    </div>
  </div>

  <p class="disclaimer">${disclaimer}</p>
  <div class="footer">ComptaFlow — compta-flow.net — ${t('pricingQuestionnaire.pdf.footer')}</div>
  <script>window.onload=()=>{window.print();}</script>
</body>
</html>`);
  win.document.close();
  return true;
}
