import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calculator, Copy, Check, Info, ArrowRight, Eraser } from 'lucide-react';
import { Button } from '../ui/Button';
import {
  type ProvinceCode,
  calculateTaxFromNet,
  calculateTaxFromGross,
  getTaxSubtitle,
  formatMoney,
} from '../../lib/financeUtils';
import { CANADIAN_REGIONS, SITE } from '../../lib/canadaNetwork';
import { CONFIG } from '../../lib/config';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';
import { useLanguage } from '../../hooks/useLanguage';
import { usePageMeta } from '../../hooks/usePageMeta';

type CalcMode = 'net' | 'gross';

/** Accepte « 1 234,56 », « 1234.56 » ou « 1234,56 » ; tout le reste vaut 0. */
const parseAmount = (raw: string): number => {
  const value = parseFloat(raw.replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(value) && value > 0 ? value : 0;
};

/** Note explicative des taux, par province ou territoire. */
function getRateNote(province: ProvinceCode): { fr: string; en: string } {
  switch (province) {
    case 'QC':
      return {
        fr: 'Le Québec applique la TPS fédérale de 5 % et la TVQ de 9,975 %, calculée sur le montant avant taxes (sans la TPS).',
        en: 'Quebec applies the 5% federal GST and the 9.975% QST, calculated on the amount before taxes (without the GST).',
      };
    case 'ON':
      return {
        fr: 'L’Ontario applique une TVH unique de 13 %, qui combine les parts fédérale et provinciale.',
        en: 'Ontario applies a single 13% HST, combining the federal and provincial portions.',
      };
    case 'NB':
    case 'NL':
    case 'PE':
      return {
        fr: 'Cette province applique une TVH unique de 15 %.',
        en: 'This province applies a single 15% HST.',
      };
    case 'NS':
      return {
        fr: 'La Nouvelle-Écosse applique une TVH unique de 14 %, taux en vigueur depuis le 1er avril 2025.',
        en: 'Nova Scotia applies a single 14% HST, in effect since April 1, 2025.',
      };
    case 'BC':
      return {
        fr: 'La Colombie-Britannique applique la TPS de 5 % et la TVP de 7 %, chacune calculée séparément sur le montant avant taxes.',
        en: 'British Columbia applies the 5% GST and a 7% PST, each calculated separately on the amount before taxes.',
      };
    case 'SK':
      return {
        fr: 'La Saskatchewan applique la TPS de 5 % et la TVP de 6 %, chacune calculée séparément sur le montant avant taxes.',
        en: 'Saskatchewan applies the 5% GST and a 6% PST, each calculated separately on the amount before taxes.',
      };
    case 'MB':
      return {
        fr: 'Le Manitoba applique la TPS de 5 % et la TVD (taxe de vente au détail) de 7 %, chacune calculée séparément sur le montant avant taxes.',
        en: 'Manitoba applies the 5% GST and a 7% RST (retail sales tax), each calculated separately on the amount before taxes.',
      };
    case 'AB':
      return {
        fr: 'L’Alberta n’a aucune taxe de vente provinciale : seule la TPS fédérale de 5 % s’applique.',
        en: 'Alberta has no provincial sales tax: only the 5% federal GST applies.',
      };
    default:
      return {
        fr: 'Ce territoire n’a aucune taxe de vente territoriale : seule la TPS fédérale de 5 % s’applique.',
        en: 'This territory has no territorial sales tax: only the 5% federal GST applies.',
      };
  }
}

export function TaxCalculator() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const isFr = lang === 'fr';
  const langKey: 'fr' | 'en' = isFr ? 'fr' : 'en';

  usePageMeta({
    title: isFr
      ? 'Calculateur de taxes TPS/TVQ/TVH par province | ComptaFlow'
      : 'GST/QST/HST Tax Calculator by Province | ComptaFlow',
    description: isFr
      ? 'Calculez rapidement les taxes de vente (TPS, TVQ, TVH, TVP) applicables dans chaque province et territoire du Canada. Outil gratuit et instantané.'
      : 'Quickly calculate sales taxes (GST, QST, HST, PST) for every Canadian province and territory. Free, instant tool.',
    lang: isFr ? 'fr' : 'en',
    canonical: `${SITE.url}/calculateur-taxes`,
  });

  const [amountInput, setAmountInput] = useState<string>('100');
  const [selectedProvince, setSelectedProvince] = useState<ProvinceCode>('QC');
  const [mode, setMode] = useState<CalcMode>('net');
  const [copied, setCopied] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Calcul instantané, recalculé à chaque frappe ou changement.
  const result = useMemo(() => {
    const amount = parseAmount(amountInput);
    return mode === 'net'
      ? calculateTaxFromNet(amount, selectedProvince)
      : calculateTaxFromGross(amount, selectedProvince);
  }, [amountInput, selectedProvince, mode]);

  const region = CANADIAN_REGIONS[selectedProvince];
  const rateNote = getRateNote(selectedProvince);

  const handleClear = () => {
    setAmountInput('');
    inputRef.current?.focus();
  };

  const handleCopy = async () => {
    const provinceName = isFr ? region.nameFr : region.nameEn;
    const taxLines = result.lines
      .map(
        (line) =>
          `${isFr ? line.labelFr : line.labelEn} (${isFr ? line.rateLabelFr : line.rateLabelEn}) : ${formatMoney(line.amount, langKey)}`
      )
      .join('\n');
    const text = isFr
      ? `Calcul de taxes — Compta-Flow
Province : ${provinceName} (${getTaxSubtitle(selectedProvince, 'fr')})
Montant avant taxes : ${formatMoney(result.net, 'fr')}
${taxLines}
Total : ${formatMoney(result.gross, 'fr')}
Outil indicatif — https://compta-flow.net/calculateur-taxes`
      : `Tax calculation — Compta-Flow
Province: ${provinceName} (${getTaxSubtitle(selectedProvince, 'en')})
Amount before taxes: ${formatMoney(result.net, 'en')}
${taxLines}
Total: ${formatMoney(result.gross, 'en')}
Guidance tool — https://compta-flow.net/calculateur-taxes`;

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-noir text-ivoire font-sans pt-28 pb-16">
      <SiteHeader />
      <div className="max-w-4xl mx-auto px-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-silver hover:text-gold transition-colors mb-8 group cursor-pointer"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          {isFr ? 'Retour à l’accueil' : 'Back to home'}
        </button>

        <header className="space-y-4 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-mono uppercase tracking-widest">
            <Calculator size={12} />
            {isFr ? 'Calculateur gratuit' : 'Free Tool'}
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold">
            {isFr ? 'Calculateur de taxes' : 'Sales Tax Calculator'}{' '}
            <span className="text-gold italic">Canada</span>
          </h1>
          <p className="text-silver text-sm font-light max-w-xl">
            {isFr
              ? 'Ajoutez les taxes à un montant, ou extrayez-les d’un total : le calcul se fait en direct pendant que vous tapez, pour chaque province et territoire du Canada. Idéal pour valider une facture ou préparer vos rapports de taxes.'
              : 'Add taxes to an amount, or extract them from a total — calculated live as you type, for every Canadian province and territory. Ideal for checking an invoice or preparing your tax reports.'}
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Side */}
          <div className="lg:col-span-6 p-8 rounded-2xl border border-gold/15 bg-white/[0.02] backdrop-blur-md space-y-6">
            {/* Mode Toggle */}
            <div className="flex bg-black/40 p-1.5 rounded-xl border border-white/5">
              <button
                onClick={() => setMode('net')}
                aria-pressed={mode === 'net'}
                className={`flex-1 text-center py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${mode === 'net' ? 'bg-gold text-noir' : 'text-silver hover:text-ivoire'}`}
              >
                {isFr ? 'Ajouter les taxes' : 'Add taxes'}
              </button>
              <button
                onClick={() => setMode('gross')}
                aria-pressed={mode === 'gross'}
                className={`flex-1 text-center py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${mode === 'gross' ? 'bg-gold text-noir' : 'text-silver hover:text-ivoire'}`}
              >
                {isFr ? 'Taxes incluses' : 'Taxes included'}
              </button>
            </div>

            {/* Input Amount */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">
                {mode === 'gross'
                  ? isFr
                    ? 'Montant total (taxes incluses)'
                    : 'Total amount (taxes included)'
                  : isFr
                    ? 'Montant avant taxes'
                    : 'Amount before taxes'}
              </label>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value.replace(/[^0-9.,]/g, ''))}
                  className="w-full bg-black/50 border border-gold/25 focus:border-gold rounded-xl py-4 px-5 pr-12 text-3xl font-mono focus:outline-none focus:ring-1 focus:ring-gold text-ivoire transition-all"
                  placeholder="0"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 font-mono text-xl text-gold">$</span>
              </div>
              {/* Quick amounts + clear */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  onClick={() => setAmountInput('100')}
                  className="px-3.5 py-2.5 rounded-lg border border-white/10 hover:border-gold/40 text-xs font-mono text-silver hover:text-gold transition-colors bg-white/5 cursor-pointer"
                >
                  {isFr ? '100 $' : '$100'}
                </button>
                <button
                  onClick={() => setAmountInput('1000')}
                  className="px-3.5 py-2.5 rounded-lg border border-white/10 hover:border-gold/40 text-xs font-mono text-silver hover:text-gold transition-colors bg-white/5 cursor-pointer"
                >
                  {isFr ? '1 000 $' : '$1,000'}
                </button>
                <button
                  onClick={handleClear}
                  className="ml-auto inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-white/10 hover:border-gold/40 text-xs text-silver hover:text-gold transition-colors bg-white/5 cursor-pointer"
                >
                  <Eraser size={12} />
                  {isFr ? 'Effacer' : 'Clear'}
                </button>
              </div>
            </div>

            {/* Province Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">
                {isFr ? 'Province ou territoire' : 'Province or territory'}
              </label>
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value as ProvinceCode)}
                className="w-full bg-black/50 border border-gold/25 focus:border-gold rounded-xl py-3.5 px-4 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-gold text-ivoire transition-all appearance-none cursor-pointer"
              >
                {Object.entries(CANADIAN_REGIONS).map(([code, reg]) => (
                  <option key={code} value={code} className="bg-noir text-ivoire">
                    {isFr ? reg.nameFr : reg.nameEn} ({code}) — {isFr ? reg.taxLabelFr : reg.taxLabelEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Rates Explanation Panel */}
            <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-2 text-xs text-silver">
              <div className="flex items-center gap-2 text-gold font-bold font-mono">
                <Info size={12} />
                <span>{isFr ? 'Taux en vigueur' : 'Current rates'}</span>
              </div>
              <p className="leading-relaxed">{isFr ? rateNote.fr : rateNote.en}</p>
            </div>
          </div>

          {/* Results Side */}
          <div className="lg:col-span-6 space-y-6">
            <div className="p-8 rounded-2xl border border-gold/15 bg-gold/[0.02] backdrop-blur-md space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full blur-2xl" />

              <div className="flex justify-between items-center">
                <h2 className="font-serif text-lg font-bold">
                  {isFr ? 'Détail du calcul' : 'Tax Details'}
                </h2>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs text-silver hover:text-gold transition-colors border border-white/10 hover:border-gold/30 px-3 py-2 rounded-lg bg-white/5 cursor-pointer"
                >
                  {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>
                    {copied
                      ? isFr
                        ? 'Copié'
                        : 'Copied'
                      : isFr
                        ? 'Copier le résumé'
                        : 'Copy summary'}
                  </span>
                </button>
              </div>

              <div className="space-y-4 font-mono text-sm">
                <div className="flex justify-between border-b border-white/5 pb-3.5">
                  <span className="text-slate-400">
                    {mode === 'gross'
                      ? isFr
                        ? 'Montant avant taxes (extrait)'
                        : 'Amount before taxes (extracted)'
                      : isFr
                        ? 'Montant avant taxes'
                        : 'Amount before taxes'}
                  </span>
                  <span className="text-ivoire">{formatMoney(result.net, langKey)}</span>
                </div>

                {result.lines.map((line) => (
                  <div key={line.kind} className="flex justify-between border-b border-white/5 pb-3.5">
                    <span className="text-slate-400">
                      {isFr ? line.labelFr : line.labelEn} ({isFr ? line.rateLabelFr : line.rateLabelEn})
                    </span>
                    <span className="text-ivoire">+{formatMoney(line.amount, langKey)}</span>
                  </div>
                ))}

                <div className="flex justify-between border-b border-white/5 pb-3.5">
                  <span className="text-slate-400">{isFr ? 'Total des taxes' : 'Total taxes'}</span>
                  <span className="text-ivoire">{formatMoney(result.taxTotal, langKey)}</span>
                </div>

                <div className="flex justify-between items-baseline pt-4">
                  <span className="text-gold font-serif text-lg font-bold">
                    {isFr ? 'Total (taxes incluses)' : 'Total (taxes included)'}
                  </span>
                  <span className="text-gold font-serif text-2xl font-bold">
                    {formatMoney(result.gross, langKey)}
                  </span>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <p className="flex gap-2 text-[11px] leading-relaxed text-slate-400 px-1">
              <Info size={12} className="shrink-0 mt-0.5 text-gold/70" />
              <span>
                {isFr
                  ? 'Outil indicatif seulement : les règles d’arrondi officielles et certains cas particuliers (biens détaxés ou exonérés, pourboires, échanges) peuvent faire varier le montant réel. Pour vos rapports de taxes, fiez-vous à vos livres.'
                  : 'Guidance only: official rounding rules and special cases (zero-rated or exempt supplies, tips, trade-ins) may change the actual amount. For tax reporting, rely on your books.'}
              </span>
            </p>

            {/* CTA Box */}
            <div className="p-8 rounded-2xl border border-white/5 bg-black/30 space-y-6">
              <h4 className="font-serif font-bold text-ivoire">
                {isFr ? 'Simplifiez votre gestion fiscale' : 'Simplify your tax management'}
              </h4>
              <p className="text-xs text-silver leading-relaxed">
                {isFr
                  ? 'Fini le casse-tête de la tenue de livres et des déclarations de TPS/TVQ/TVH. ComptaFlow automatise vos conciliations bancaires et génère vos rapports de taxes dans les règles de l’art.'
                  : 'Say goodbye to bookkeeping stress and complex tax filing. ComptaFlow automates bank reconciliation and generates compliant tax reports.'}
              </p>
              <div className="space-y-3">
                <Button
                  variant="gold"
                  onClick={() => navigate('/estimate')}
                  className="w-full py-4 text-xs font-bold uppercase tracking-wider group"
                >
                  {isFr ? 'Estimer mon forfait' : 'Estimate my package'}{' '}
                  <ArrowRight size={13} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  variant="secondary"
                  asChild
                  className="w-full py-4 text-xs font-bold uppercase tracking-wider"
                >
                  <a href={CONFIG.APP.INTAKE_FORM_URL} target="_blank" rel="noreferrer">
                    {isFr ? 'Devenir client (2 minutes)' : 'Become a client (2 minutes)'}
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
      <SiteFooter />
    </div>
  );
}
