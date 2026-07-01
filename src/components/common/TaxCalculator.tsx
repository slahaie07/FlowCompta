import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calculator, Copy, Check, Info, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { 
  ProvinceCode, 
  calculateCanadianTaxes, 
  getTaxSubtitle, 
  getTaxDisplayLines, 
  formatCAD 
} from '../../lib/financeUtils';
import { CANADIAN_REGIONS, SITE } from '../../lib/canadaNetwork';
import { useLanguage } from '../../hooks/useLanguage';
import { usePageMeta } from '../../hooks/usePageMeta';

export function TaxCalculator() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const isFr = lang === 'fr';

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

  const [amountInput, setAmountInput] = useState<string>('100.00');
  const [selectedProvince, setSelectedProvince] = useState<ProvinceCode>('QC');
  const [isInverse, setIsInverse] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const [results, setResults] = useState({
    subtotal: 100,
    tps: 5,
    tvq: 9.98,
    tvh: 0,
    total: 114.98
  });

  // Rates definitions for explanation box
  const getRates = (prov: ProvinceCode) => {
    switch (prov) {
      case 'QC': return { tps: 5, prov: 9.975, label: 'TVQ' };
      case 'ON': return { tps: 0, prov: 13, label: 'TVH' };
      case 'BC': return { tps: 5, prov: 7, label: 'TVP' };
      case 'AB': return { tps: 5, prov: 0, label: 'TVP' };
      case 'SK': return { tps: 5, prov: 6, label: 'TVP' };
      case 'MB': return { tps: 5, prov: 7, label: 'TVP' };
      case 'NB':
      case 'NL':
      case 'NS':
      case 'PE': return { tps: 0, prov: 15, label: 'TVH' };
      default: return { tps: 5, prov: 0, label: '' };
    }
  };

  useEffect(() => {
    const numericAmount = parseFloat(amountInput) || 0;
    
    if (!isInverse) {
      // Direct calculation (subtotal to total)
      const res = calculateCanadianTaxes(numericAmount, selectedProvince);
      setResults(res);
    } else {
      // Inverse calculation (total to subtotal)
      const rates = getRates(selectedProvince);
      const combinedRate = (rates.tps + rates.prov) / 100;
      
      const subtotal = numericAmount / (1 + combinedRate);
      const tps = subtotal * (rates.tps / 100);
      const provTax = subtotal * (rates.prov / 100);
      
      if (selectedProvince === 'ON' || ['NB', 'NL', 'NS', 'PE'].includes(selectedProvince)) {
        setResults({
          subtotal: Number(subtotal.toFixed(2)),
          tps: 0,
          tvq: 0,
          tvh: Number(provTax.toFixed(2)),
          total: numericAmount
        });
      } else {
        setResults({
          subtotal: Number(subtotal.toFixed(2)),
          tps: Number(tps.toFixed(2)),
          tvq: Number(provTax.toFixed(2)),
          tvh: 0,
          total: numericAmount
        });
      }
    }
  }, [amountInput, selectedProvince, isInverse]);

  const handleCopy = () => {
    const text = isFr 
      ? `Calcul de taxes ComptaFlow (${selectedProvince}) :
Montant de base : ${formatCAD(results.subtotal)}
TPS : ${formatCAD(results.tps)}
${getRates(selectedProvince).label} : ${formatCAD(results.tvq || results.tvh)}
Total : ${formatCAD(results.total)}`
      : `ComptaFlow Tax Calculation (${selectedProvince}):
Base Amount: ${formatCAD(results.subtotal)}
GST: ${formatCAD(results.tps)}
${getRates(selectedProvince).label === 'TVQ' ? 'QST' : getRates(selectedProvince).label === 'TVP' ? 'PST' : 'HST'}: ${formatCAD(results.tvq || results.tvh)}
Total: ${formatCAD(results.total)}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const rates = getRates(selectedProvince);

  return (
    <div className="min-h-screen bg-noir text-ivoire font-sans pt-28 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-silver hover:text-gold transition-colors mb-8 group cursor-pointer"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          {isFr ? "Retour à l'accueil" : 'Back to home'}
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
              ? 'Calculez instantanément la TPS, TVQ, TVP et TVH selon la province canadienne. Idéal pour valider vos factures de fournisseurs ou préparer vos factures clients.'
              : 'Calculate GST, PST, QST, and HST across Canadian provinces. Ideal for auditing invoices or preparing client billing.'}
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Side */}
          <div className="lg:col-span-6 p-8 rounded-2xl border border-gold/15 bg-white/[0.02] backdrop-blur-md space-y-6">
            {/* Direct vs Inverse Toggle */}
            <div className="flex bg-black/40 p-1.5 rounded-xl border border-white/5">
              <button
                onClick={() => setIsInverse(false)}
                className={`flex-1 text-center py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${!isInverse ? 'bg-gold text-noir' : 'text-silver hover:text-ivoire'}`}
              >
                {isFr ? 'Ajouter les taxes' : 'Add Taxes'}
              </button>
              <button
                onClick={() => setIsInverse(true)}
                className={`flex-1 text-center py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${isInverse ? 'bg-gold text-noir' : 'text-silver hover:text-ivoire'}`}
              >
                {isFr ? 'Enlever les taxes' : 'Remove Taxes'}
              </button>
            </div>

            {/* Input Amount */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">
                {isInverse 
                  ? (isFr ? 'Montant total (TTC)' : 'Total amount (with taxes)')
                  : (isFr ? 'Montant de base (Hors taxes)' : 'Base amount (before taxes)')}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="w-full bg-black/50 border border-gold/25 focus:border-gold rounded-xl py-3.5 px-4 text-lg font-mono focus:outline-none focus:ring-1 focus:ring-gold text-ivoire transition-all"
                  placeholder="0.00"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-sm text-gold">$</span>
              </div>
            </div>

            {/* Province Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">
                {isFr ? 'Province canadienne' : 'Canadian Province'}
              </label>
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value as ProvinceCode)}
                className="w-full bg-black/50 border border-gold/25 focus:border-gold rounded-xl py-3.5 px-4 font-mono text-sm focus:outline-none text-ivoire transition-all appearance-none cursor-pointer"
              >
                {Object.entries(CANADIAN_REGIONS).map(([code, reg]) => (
                  <option key={code} value={code} className="bg-noir text-ivoire">
                    {reg.nameFr} ({code}) — {reg.taxLabelFr}
                  </option>
                ))}
              </select>
            </div>

            {/* Detailed Explanation Panel */}
            <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-2 text-xs text-silver">
              <div className="flex items-center gap-2 text-gold font-bold font-mono">
                <Info size={12} />
                <span>{isFr ? 'Taux fiscaux en vigueur' : 'Current Tax Rates'}</span>
              </div>
              <p className="leading-relaxed">
                {selectedProvince === 'QC' && (
                  isFr 
                    ? 'Le Québec applique une TPS fédérale de 5 % et une TVQ de 9,975 % calculée directement sur le montant brut.'
                    : 'Quebec applies a 5% federal GST and a 9.975% QST calculated directly on the subtotal.'
                )}
                {selectedProvince === 'ON' && (
                  isFr
                    ? 'L\'Ontario applique une TVH unique et harmonisée de 13 % (qui combine les portions fédérale et provinciale).'
                    : 'Ontario applies a single 13% Harmonized Sales Tax (HST) which combines the federal and provincial portions.'
                )}
                {['NB', 'NL', 'NS', 'PE'].includes(selectedProvince) && (
                  isFr
                    ? 'Cette province applique une TVH unique et harmonisée de 15 %.'
                    : 'This province applies a single 15% Harmonized Sales Tax (HST).'
                )}
                {['BC', 'SK', 'MB'].includes(selectedProvince) && (
                  isFr
                    ? `Cette province applique une TPS fédérale de 5 % et une TVP (taxe de vente provinciale) locale de ${rates.prov} %.`
                    : `This province applies a 5% federal GST and a local ${rates.prov}% PST (provincial sales tax).`
                )}
                {selectedProvince === 'AB' && (
                  isFr
                    ? 'L\'Alberta n\'applique aucune taxe provinciale. Seule la TPS fédérale de 5 % s\'applique.'
                    : 'Alberta applies no provincial sales tax. Only the 5% federal GST applies.'
                )}
              </p>
            </div>
          </div>

          {/* Results Side */}
          <div className="lg:col-span-6 space-y-6">
            <div className="p-8 rounded-2xl border border-gold/15 bg-gold/[0.02] backdrop-blur-md space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full blur-2xl" />
              
              <div className="flex justify-between items-center">
                <h3 className="font-serif text-lg font-bold">
                  {isFr ? 'Détail du calcul' : 'Tax Details'}
                </h3>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs text-silver hover:text-gold transition-colors border border-white/10 hover:border-gold/30 px-3 py-1.5 rounded-lg bg-white/5 cursor-pointer"
                >
                  {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copied ? (isFr ? 'Copié' : 'Copied') : (isFr ? 'Copier' : 'Copy')}</span>
                </button>
              </div>

              <div className="space-y-4 font-mono text-sm">
                <div className="flex justify-between border-b border-white/5 pb-3.5">
                  <span className="text-slate-400">{isFr ? 'Montant hors taxes' : 'Subtotal'}</span>
                  <span className="text-ivoire">{formatCAD(results.subtotal)}</span>
                </div>

                {results.tps > 0 && (
                  <div className="flex justify-between border-b border-white/5 pb-3.5">
                    <span className="text-slate-400">TPS (5%)</span>
                    <span className="text-ivoire">+{formatCAD(results.tps)}</span>
                  </div>
                )}

                {results.tvq > 0 && (
                  <div className="flex justify-between border-b border-white/5 pb-3.5">
                    <span className="text-slate-400">
                      {rates.label} ({rates.prov}%)
                    </span>
                    <span className="text-ivoire">+{formatCAD(results.tvq)}</span>
                  </div>
                )}

                {results.tvh > 0 && (
                  <div className="flex justify-between border-b border-white/5 pb-3.5">
                    <span className="text-slate-400">
                      TVH ({rates.prov}%)
                    </span>
                    <span className="text-ivoire">+{formatCAD(results.tvh)}</span>
                  </div>
                )}

                <div className="flex justify-between pt-4 text-lg font-bold font-serif">
                  <span className="text-gold">{isFr ? 'Total TTC' : 'Total (with taxes)'}</span>
                  <span className="text-gold border-b border-gold/40 pb-0.5">{formatCAD(results.total)}</span>
                </div>
              </div>
            </div>

            {/* CTA Box */}
            <div className="p-8 rounded-2xl border border-white/5 bg-black/30 space-y-6">
              <h4 className="font-serif font-bold text-ivoire">
                {isFr ? 'Simplifiez votre gestion fiscale' : 'Simplify your tax management'}
              </h4>
              <p className="text-xs text-silver leading-relaxed">
                {isFr
                  ? 'Fini le casse-tête de la tenue de livres et des déclarations de TPS/TVQ/TVH. ComptaFlow automatise vos conciliations bancaires et génère vos rapports de taxes dans les règles de l\'art.'
                  : 'Say goodbye to bookkeeping stress and complex tax filing. ComptaFlow automates bank reconciliation and generates compliant tax reports.'}
              </p>
              <Button
                variant="gold"
                onClick={() => navigate('/login?next=/onboarding&register=1')}
                className="w-full py-4 text-xs font-bold uppercase tracking-wider group"
              >
                {isFr ? 'Ouvrir mon dossier (Gratuit)' : 'Get Started (Free)'}{' '}
                <ArrowRight size={13} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
