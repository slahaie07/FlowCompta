import { useMemo, type FC, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, Calculator, CheckCircle2, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { useLanguage } from '../../hooks/useLanguage';
import { usePricingEstimate } from '../../hooks/usePricingEstimate';
import {
  SERVICE_CATEGORIES,
  getServiceLabel,
  getServicePriceDisplay,
  getServicesByCategory,
  type ServiceId,
} from '../../lib/servicesCatalog';
import { formatCAD, getTaxDisplayLines, calculateCanadianTaxes, type ProvinceCode } from '../../lib/financeUtils';
import type { BillingUnit } from '../../lib/pricingEstimator';
import {
  buildBreakdownRows,
  buildParameterRows,
  printPricingQuotePdf,
} from '../../lib/pricingQuoteSummary';

const PROVINCES: ProvinceCode[] = ['QC', 'ON', 'BC', 'AB', 'MB', 'NB', 'NL', 'NS', 'PE', 'SK'];

interface PricingQuestionnaireProps {
  initialServiceId?: ServiceId;
  onContinue?: (serviceId: ServiceId) => void;
  showSignupCta?: boolean;
  compact?: boolean;
  /** client = parcours client ; staff = comptables / super admin */
  variant?: 'client' | 'staff';
}

function pricingKey(t: (key: string) => string, variant: 'client' | 'staff', key: string): string {
  if (variant === 'staff') {
    const staff = t(`pricingQuestionnaire.staff.${key}`);
    if (staff !== `pricingQuestionnaire.staff.${key}`) return staff;
  }
  return t(`pricingQuestionnaire.${key}`);
}

const OptionButton: FC<{
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}> = ({ selected, onClick, children }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-xl border transition-all focus-visible:ring-2 focus-visible:ring-gold/40 ${
        selected
          ? 'border-gold/50 bg-gold/10 text-ivoire'
          : 'border-white/10 bg-white/[0.02] text-slate-400 hover:border-gold/25 hover:text-ivoire'
      }`}
    >
      {children}
    </button>
  );
}

function buildQuestionSteps(serviceId: ServiceId): number[] {
  const skipVolume = [
    'softwareSetup',
    'taxHelpAutonomous',
    't4Releve1',
    'personalTaxT1',
    'investmentStocks',
  ];
  const withEmployees = ['payroll', 't4Releve1', 'monthlySme', 'corporateT2', 'virtualCfo'];

  const steps = [0, 1, 2];
  if (!skipVolume.includes(serviceId)) {
    steps.push(3);
  }
  if (withEmployees.includes(serviceId)) {
    steps.push(4);
  }
  steps.push(5);
  return steps;
}

function billingUnitSuffix(unit: BillingUnit, t: (key: string) => string): string {
  const map: Record<BillingUnit, string> = {
    hourly: t('pricingQuestionnaire.units.hourly'),
    monthly: t('pricingQuestionnaire.units.monthly'),
    oneTime: t('pricingQuestionnaire.units.oneTime'),
    perDeclaration: t('pricingQuestionnaire.units.perDeclaration'),
  };
  return map[unit];
}

export function PricingQuestionnaire({
  initialServiceId,
  onContinue,
  showSignupCta = false,
  compact = false,
  variant = 'client',
}: PricingQuestionnaireProps) {
  const { t, lang } = useLanguage();
  const {
    step,
    setStep,
    answers,
    result,
    recommendedAddOns,
    setServiceId,
    setProvince,
    setProfileType,
    setVolumeBand,
    setEmployeeBand,
    setUrgency,
    toggleAddOn,
    reset,
  } = usePricingEstimate(initialServiceId);

  const questionSteps = useMemo(() => buildQuestionSteps(answers.serviceId), [answers.serviceId]);
  const totalSteps = questionSteps.length;
  const stepIndex = step === 'result' ? totalSteps : questionSteps.indexOf(step as number);
  const progress = step === 'result' ? 100 : Math.round(((stepIndex + 1) / totalSteps) * 100);
  const showEmployeeStep = questionSteps.includes(4);
  const showVolumeStep = questionSteps.includes(3);
  const isLastQuestion = step !== 'result' && stepIndex === totalSteps - 1;

  const handleNext = () => {
    if (isLastQuestion) {
      setStep('result');
      return;
    }
    const next = questionSteps[stepIndex + 1];
    if (next !== undefined) setStep(next as typeof step);
  };

  const handlePrev = () => {
    if (step === 'result') {
      setStep(questionSteps[questionSteps.length - 1] as typeof step);
      return;
    }
    const prev = questionSteps[stepIndex - 1];
    if (prev !== undefined) setStep(prev as typeof step);
  };

  const canProceed = () => {
    if (step === 0) return Boolean(answers.serviceId);
    return true;
  };

  const taxPreview = result
    ? calculateCanadianTaxes(result.amountTypical, answers.province)
    : null;

  const taxLang = lang === 'ar' ? 'fr' : lang;

  const parameterRows = useMemo(() => {
    if (!result) return [];
    return buildParameterRows(answers, t, {
      showVolume: showVolumeStep,
      showEmployees: showEmployeeStep,
    });
  }, [answers, result, t, showVolumeStep, showEmployeeStep]);

  const breakdownRows = useMemo(() => {
    if (!result) return [];
    return buildBreakdownRows(result, t);
  }, [result, t]);

  const handleDownloadPdf = () => {
    if (!result) return;
    const opened = printPricingQuotePdf(answers, result, t, taxLang, {
      showVolume: showVolumeStep,
      showEmployees: showEmployeeStep,
      variant,
    });
    if (!opened) {
      toast.error(t('pricingQuestionnaire.pdf.popupBlocked'));
    }
  };

  const selectedServicePrice = getServicePriceDisplay(answers.serviceId, t);

  return (
    <div className={`space-y-8 ${compact ? '' : 'max-w-2xl mx-auto'}`}>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl border border-gold/30 flex items-center justify-center text-gold">
            <Calculator size={20} />
          </div>
          <div>
            <Badge variant="gold" className="text-[10px] uppercase tracking-[0.25em] mb-1">
              {pricingKey(t, variant, 'badge')}
            </Badge>
            <h2 className="text-2xl md:text-3xl font-serif text-ivoire">{pricingKey(t, variant, 'title')}</h2>
          </div>
        </div>
        <p className="text-sm text-slate-500 leading-relaxed">{pricingKey(t, variant, 'subtitle')}</p>
        {step !== 'result' && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-500">
              <span>
                {t('pricingQuestionnaire.progress')
                  .replace('{current}', String(stepIndex + 1))
                  .replace('{total}', String(totalSteps))}
              </span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                className="h-full bg-gold"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}
      </div>

      <Card className="p-6 md:p-8 space-y-6 premium-border-gold" glow="gold">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="q-service" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="space-y-4">
              <h3 className="font-serif text-xl text-ivoire">{t('pricingQuestionnaire.q.service')}</h3>
              <p className="text-sm text-slate-500">{t('pricingQuestionnaire.serviceSelectHint')}</p>
              <div className="space-y-2">
                <label htmlFor="pricing-service-select" className="sr-only">
                  {t('pricingQuestionnaire.q.service')}
                </label>
                <select
                  id="pricing-service-select"
                  value={answers.serviceId}
                  onChange={(e) => setServiceId(e.target.value as ServiceId)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-ivoire focus:border-gold/40 focus:outline-none focus:ring-2 focus:ring-gold/20 appearance-none cursor-pointer"
                >
                  {SERVICE_CATEGORIES.map((category) => (
                    <optgroup key={category} label={t(`services.categories.${category}.title`)}>
                      {getServicesByCategory(category).map((s) => (
                        <option key={s.id} value={s.id}>
                          {getServiceLabel(s.id, t)} — {getServicePriceDisplay(s.id, t)}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {answers.serviceId && (
                  <p className="text-xs text-slate-500 px-1">{selectedServicePrice}</p>
                )}
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="q-province" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="space-y-4">
              <h3 className="font-serif text-xl text-ivoire">{t('pricingQuestionnaire.q.province')}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PROVINCES.map((code) => (
                  <OptionButton key={code} selected={answers.province === code} onClick={() => setProvince(code)}>
                    {t(`pricingQuestionnaire.provinces.${code}`)}
                  </OptionButton>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="q-profile" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="space-y-4">
              <h3 className="font-serif text-xl text-ivoire">{t('pricingQuestionnaire.q.profile')}</h3>
              {(['personal', 'business', 'sme'] as const).map((id) => (
                <OptionButton key={id} selected={answers.profileType === id} onClick={() => setProfileType(id)}>
                  <span className="font-medium">{t(`pricingQuestionnaire.profile.${id}.title`)}</span>
                  <span className="block text-xs mt-1 opacity-70">{t(`pricingQuestionnaire.profile.${id}.desc`)}</span>
                </OptionButton>
              ))}
            </motion.div>
          )}

          {step === 3 && showVolumeStep && (
            <motion.div key="q-volume" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="space-y-4">
              <h3 className="font-serif text-xl text-ivoire">{t('pricingQuestionnaire.q.volume')}</h3>
              {(['low', 'medium', 'high'] as const).map((id) => (
                <OptionButton key={id} selected={answers.volumeBand === id} onClick={() => setVolumeBand(id)}>
                  <span className="font-medium">{t(`pricingQuestionnaire.volume.${id}.title`)}</span>
                  <span className="block text-xs mt-1 opacity-70">{t(`pricingQuestionnaire.volume.${id}.desc`)}</span>
                </OptionButton>
              ))}
            </motion.div>
          )}

          {step === 4 && showEmployeeStep && (
            <motion.div key="q-employees" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="space-y-4">
              <h3 className="font-serif text-xl text-ivoire">{t('pricingQuestionnaire.q.employees')}</h3>
              {(['none', 'small', 'medium'] as const).map((id) => (
                <OptionButton key={id} selected={answers.employeeBand === id} onClick={() => setEmployeeBand(id)}>
                  <span className="font-medium">{t(`pricingQuestionnaire.employees.${id}.title`)}</span>
                  <span className="block text-xs mt-1 opacity-70">{t(`pricingQuestionnaire.employees.${id}.desc`)}</span>
                </OptionButton>
              ))}
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="q-urgency" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="space-y-4">
              <div className="space-y-4 pb-4 border-b border-white/5">
                <h3 className="font-serif text-xl text-ivoire">{t('pricingQuestionnaire.q.addons')}</h3>
                {recommendedAddOns.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">{t('pricingQuestionnaire.noAddons')}</p>
                ) : (
                  recommendedAddOns.map((id) => (
                    <OptionButton
                      key={id}
                      selected={answers.addOns.includes(id)}
                      onClick={() => toggleAddOn(id)}
                    >
                      <span className="font-medium">{getServiceLabel(id, t)}</span>
                      <span className="block text-xs mt-1 opacity-70">{t(`services.items.${id}.price`)}</span>
                    </OptionButton>
                  ))
                )}
              </div>
              <h3 className="font-serif text-xl text-ivoire">{t('pricingQuestionnaire.q.urgency')}</h3>
              {(['standard', 'priority'] as const).map((id) => (
                <OptionButton key={id} selected={answers.urgency === id} onClick={() => setUrgency(id)}>
                  <span className="font-medium">{t(`pricingQuestionnaire.urgency.${id}.title`)}</span>
                  <span className="block text-xs mt-1 opacity-70">{t(`pricingQuestionnaire.urgency.${id}.desc`)}</span>
                </OptionButton>
              ))}
            </motion.div>
          )}

          {step === 'result' && result && (
            <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="text-center space-y-2">
                <CheckCircle2 className="mx-auto text-gold" size={36} />
                <h3 className="font-serif text-2xl text-ivoire">
                  {variant === 'staff'
                    ? pricingKey(t, variant, 'result.title')
                    : t('pricingQuestionnaire.result.title')}
                </h3>
                <p className="text-sm text-slate-500">{getServiceLabel(result.serviceId, t)}</p>
              </div>

              <div className="p-6 rounded-2xl bg-gold/5 border border-gold/20 text-center space-y-2">
                <p className="text-xs uppercase tracking-widest text-gold font-bold">{t('pricingQuestionnaire.result.range')}</p>
                <p className="text-3xl md:text-4xl font-serif text-ivoire">
                  {formatCAD(result.amountMin)} – {formatCAD(result.amountMax)}
                </p>
                <p className="text-sm text-slate-400">
                  {t('pricingQuestionnaire.result.typical')}: {formatCAD(result.amountTypical)}{' '}
                  {billingUnitSuffix(result.billingUnit, t)}
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">
                    {t('pricingQuestionnaire.result.table.parameters')}
                  </p>
                  <div className="overflow-x-auto rounded-xl border border-white/10">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/[0.02]">
                          <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-slate-500 font-bold">
                            {t('pricingQuestionnaire.result.table.columnLabel')}
                          </th>
                          <th className="px-4 py-3 text-right text-xs uppercase tracking-wider text-slate-500 font-bold">
                            {t('pricingQuestionnaire.result.table.columnValue')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {parameterRows.map((row) => (
                          <tr key={row.label} className="border-b border-white/5 last:border-0">
                            <td className="px-4 py-3 text-slate-400">{row.label}</td>
                            <td className="px-4 py-3 text-right text-ivoire font-medium">{row.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">
                    {t('pricingQuestionnaire.result.table.breakdown')}
                  </p>
                  <div className="overflow-x-auto rounded-xl border border-white/10">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/[0.02]">
                          <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-slate-500 font-bold">
                            {t('pricingQuestionnaire.result.table.columnLabel')}
                          </th>
                          <th className="px-4 py-3 text-right text-xs uppercase tracking-wider text-slate-500 font-bold">
                            {t('pricingQuestionnaire.result.table.amount')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {breakdownRows.map((row) => (
                          <tr key={row.label} className="border-b border-white/5 last:border-0">
                            <td className="px-4 py-3 text-slate-400">{row.label}</td>
                            <td className="px-4 py-3 text-right text-ivoire font-medium">{row.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {taxPreview && (
                <div className="space-y-2 text-sm">
                  <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">
                    {t('pricingQuestionnaire.result.taxesHint')}
                  </p>
                  {getTaxDisplayLines(taxPreview, answers.province, taxLang).map((line) => (
                    <div key={line.label} className="flex justify-between text-slate-400">
                      <span>{line.label}</span>
                      <span>{formatCAD(line.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-ivoire font-medium pt-2 border-t border-white/5">
                    <span>{t('pricingQuestionnaire.result.totalWithTax')}</span>
                    <span>{formatCAD(taxPreview.total)}</span>
                  </div>
                </div>
              )}

              <p className="text-xs text-slate-500 italic leading-relaxed border-l-2 border-gold/30 pl-3">
                {pricingKey(t, variant, 'disclaimer')}
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="secondary" className="flex-1 h-12" onClick={handleDownloadPdf}>
                  <Download size={16} className="mr-2" />
                  {t('pricingQuestionnaire.pdf.download')}
                </Button>
                {onContinue && (
                  <Button variant="gold" className="flex-1 h-12" onClick={() => onContinue(result.serviceId)}>
                    {variant === 'staff'
                      ? pricingKey(t, variant, 'cta.invoices')
                      : t('pricingQuestionnaire.cta.continue')}{' '}
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                )}
                {showSignupCta && variant === 'client' && (
                  <Button variant="gold" className="flex-1 h-12" asChild>
                    <a href="/login?next=/onboarding&register=1">
                      {t('pricingQuestionnaire.cta.signup')} <ArrowRight size={16} className="ml-2" />
                    </a>
                  </Button>
                )}
                <Button variant="secondary" className="flex-1 h-12" onClick={reset}>
                  {variant === 'staff'
                    ? pricingKey(t, variant, 'cta.restart')
                    : t('pricingQuestionnaire.cta.restart')}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {step !== 'result' && (
          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={handlePrev}
              disabled={stepIndex <= 0}
            >
              <ArrowLeft size={16} className="mr-2" /> {t('back')}
            </Button>
            <Button
              variant="gold"
              className="flex-1"
              onClick={handleNext}
              disabled={!canProceed()}
            >
              {isLastQuestion ? t('pricingQuestionnaire.showEstimate') : t('continue')}{' '}
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
