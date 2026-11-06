import { useEffect, useMemo, useRef, type FC, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, Calculator, CheckCircle2, Mail } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { useLanguage } from '../../hooks/useLanguage';
import { usePricingEstimate } from '../../hooks/usePricingEstimate';
import {
  SERVICE_CATEGORIES,
  getServiceLabel,
  getServicesByCategory,
  type ServiceId,
} from '../../lib/servicesCatalog';
import { formatCAD, getTaxDisplayLines, calculateCanadianTaxes, type ProvinceCode } from '../../lib/financeUtils';
import type { ApplicablePackage, BillingUnit } from '../../lib/pricingEstimator';
import type { PricingStep } from '../../hooks/usePricingEstimate';
import { CONFIG } from '../../lib/config';
import { trackEvent } from '../../lib/trackEvent';

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
  const steps = [0, 1, 2];
  if (['monthlyMicro', 'monthlySmall', 'monthlySme'].includes(serviceId)) {
    steps.push(6);
  } else if (serviceId === 'catchUp') {
    steps.push(7);
  } else if (!['softwareSetup', 'taxHelpAutonomous', 't4Releve1'].includes(serviceId)) {
    steps.push(3);
  }
  if (['payroll', 't4Releve1', 'monthlySme'].includes(serviceId)) {
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

function packageLabel(pkg: ApplicablePackage, t: (key: string) => string): string {
  return pkg.noteKey
    ? t(`pricingQuestionnaire.packages.${pkg.noteKey}`)
    : t(`pricingQuestionnaire.transactions.${pkg.transactionsBand}.desc`);
}

function buildQuoteMailto(
  result: {
    serviceId: ServiceId;
    amountMin: number;
    amountMax: number;
    amountTypical: number;
    billingUnit: BillingUnit;
    packages?: ApplicablePackage[];
  },
  answers: { province: ProvinceCode },
  t: (key: string) => string,
  lang: string
): string {
  const subject =
    lang === 'en'
      ? 'ComptaFlow — quote request'
      : lang === 'ar'
        ? 'ComptaFlow — طلب عرض سعر'
        : 'ComptaFlow — demande de soumission';
  const lines = [
    lang === 'en' ? 'Hello,' : lang === 'ar' ? 'مرحباً،' : 'Bonjour,',
    '',
    lang === 'en' ? 'I completed the price estimator on compta-flow.net.' : 'J\'ai complété l\'estimateur sur compta-flow.net.',
    '',
    `${lang === 'en' ? 'Service' : 'Service'}: ${getServiceLabel(result.serviceId, t)}`,
    `${lang === 'en' ? 'Province' : 'Province'}: ${answers.province}`,
  ];
  if (result.packages?.length) {
    // Parcours par volume : on cite les forfaits réels de la grille, pas une fourchette.
    lines.push(`${t('pricingQuestionnaire.result.packagesTitle')}:`);
    for (const pkg of result.packages) {
      const total = calculateCanadianTaxes(pkg.monthlyPrice, answers.province).total;
      lines.push(
        `- ${t(`pricingQuestionnaire.transactions.${pkg.transactionsBand}.title`)} — ${packageLabel(pkg, t)}: ${formatCAD(pkg.monthlyPrice)} ${t('pricingQuestionnaire.units.monthly')} (${t('pricingQuestionnaire.result.totalWithTax')}: ${formatCAD(total)})`
      );
    }
    lines.push(
      t('pricingQuestionnaire.result.hourlyOption').replace('{rate}', formatCAD(result.amountTypical))
    );
  } else {
    lines.push(
      `${lang === 'en' ? 'Estimated range' : 'Fourchette estimée'}: ${formatCAD(result.amountMin)} – ${formatCAD(result.amountMax)}`,
      `${lang === 'en' ? 'Typical amount' : 'Montant typique'}: ${formatCAD(result.amountTypical)} ${billingUnitSuffix(result.billingUnit, t)}`
    );
  }
  lines.push(
    '',
    lang === 'en' ? 'Please contact me to finalize a quote.' : 'Merci de me contacter pour finaliser une soumission.'
  );
  return `mailto:${CONFIG.APP.SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
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
    setTransactionsBand,
    setLateMonthsBand,
    toggleAddOn,
    reset,
  } = usePricingEstimate(initialServiceId);

  // Lot A11 : l'estimateur terminé n'est mesuré que sur le parcours public
  // (showSignupCta), une fois par résultat distinct affiché.
  const trackedResultKey = useRef<string | null>(null);
  useEffect(() => {
    if (!showSignupCta || step !== 'result' || !result) return;
    const key = `${result.serviceId}:${result.amountTypical}`;
    if (trackedResultKey.current === key) return;
    trackedResultKey.current = key;
    trackEvent('estimate_completed', { serviceId: result.serviceId, lang });
  }, [showSignupCta, step, result, lang]);

  const questionSteps = useMemo(() => buildQuestionSteps(answers.serviceId), [answers.serviceId]);
  const totalSteps = questionSteps.length;
  const stepIndex = step === 'result' ? totalSteps : questionSteps.indexOf(step as number);
  const progress = step === 'result' ? 100 : Math.round(((stepIndex + 1) / totalSteps) * 100);
  const showEmployeeStep = questionSteps.includes(4);
  const showVolumeStep = questionSteps.includes(3);
  const showTransactionsStep = questionSteps.includes(6);
  const showLateMonthsStep = questionSteps.includes(7);
  const isLastQuestion = step !== 'result' && stepIndex === totalSteps - 1;

  const handleNext = () => {
    if (isLastQuestion) {
      setStep('result');
      return;
    }
    const next = questionSteps[stepIndex + 1];
    if (next !== undefined) setStep(next as PricingStep);
  };

  const handlePrev = () => {
    if (step === 'result') {
      const lastQuestion = questionSteps[questionSteps.length - 1];
      if (lastQuestion !== undefined) setStep(lastQuestion as PricingStep);
      return;
    }
    const prev = questionSteps[stepIndex - 1];
    if (prev !== undefined) setStep(prev as PricingStep);
  };

  const canProceed = () => {
    if (step === 0) return Boolean(answers.serviceId);
    return true;
  };

  const resultPackages = result?.packages?.length ? result.packages : null;

  // Quand le résultat joint les forfaits de la grille (parcours par volume),
  // les totaux avec taxes sont calculés par forfait ; le bloc « montant
  // médian » générique ne s'applique pas.
  const taxPreview =
    result && !resultPackages
      ? calculateCanadianTaxes(result.amountTypical, answers.province)
      : null;

  const taxLang = lang === 'ar' ? 'fr' : lang;

  const containerRef = useRef<HTMLDivElement>(null);
  const isFirstStepRender = useRef(true);

  // Au changement d'étape, ramener le haut de la carte juste sous l'en-tête fixe
  // (le conteneur porte scroll-mt-28) pour que le titre de la question reste visible.
  useEffect(() => {
    if (isFirstStepRender.current) {
      isFirstStepRender.current = false;
      return;
    }
    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [step]);

  return (
    <div ref={containerRef} className={`space-y-8 scroll-mt-28 ${compact ? '' : 'max-w-2xl mx-auto'}`}>
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
              <div className="space-y-4 max-h-[560px] overflow-y-auto pr-1">
                {SERVICE_CATEGORIES.map((category) => (
                  <div key={category} className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-gold/80">
                      {t(`services.categories.${category}.title`)}
                    </p>
                    {getServicesByCategory(category).map((s) => (
                      <OptionButton
                        key={s.id}
                        selected={answers.serviceId === s.id}
                        onClick={() => setServiceId(s.id)}
                      >
                        <span className="font-medium">{getServiceLabel(s.id, t)}</span>
                        <span className="block text-xs mt-1 opacity-70">{t(`services.items.${s.id}.price`)}</span>
                      </OptionButton>
                    ))}
                  </div>
                ))}
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

          {step === 6 && showTransactionsStep && (
            <motion.div key="q-transactions" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="space-y-4">
              <h3 className="font-serif text-xl text-ivoire">{t('pricingQuestionnaire.q.transactions')}</h3>
              {(['t0_30', 't31_75', 't76_150', 't151_200', 't201_300', 't301_450', 't451_plus'] as const).map((id) => (
                <OptionButton key={id} selected={answers.transactionsBand === id} onClick={() => setTransactionsBand(id)}>
                  <span className="font-medium">{t(`pricingQuestionnaire.transactions.${id}.title`)}</span>
                  <span className="block text-xs mt-1 opacity-70">{t(`pricingQuestionnaire.transactions.${id}.desc`)}</span>
                </OptionButton>
              ))}
            </motion.div>
          )}

          {step === 7 && showLateMonthsStep && (
            <motion.div key="q-late" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="space-y-4">
              <h3 className="font-serif text-xl text-ivoire">{t('pricingQuestionnaire.q.lateMonths')}</h3>
              {(['m1_6', 'm7_12', 'm13_plus'] as const).map((id) => (
                <OptionButton key={id} selected={answers.lateMonthsBand === id} onClick={() => setLateMonthsBand(id)}>
                  <span className="font-medium">{t(`pricingQuestionnaire.lateMonths.${id}.title`)}</span>
                  <span className="block text-xs mt-1 opacity-70">{t(`pricingQuestionnaire.lateMonths.${id}.desc`)}</span>
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

              {resultPackages ? (
                <div className="space-y-4">
                  <div className="p-6 rounded-2xl bg-gold/5 border border-gold/20 space-y-4">
                    <p className="text-xs uppercase tracking-widest text-gold font-bold text-center">
                      {t('pricingQuestionnaire.result.packagesTitle')}
                    </p>
                    <div className="space-y-3">
                      {resultPackages.map((pkg, i) => {
                        const pkgTotal = calculateCanadianTaxes(pkg.monthlyPrice, answers.province).total;
                        return (
                          <div
                            key={`${pkg.transactionsBand}-${pkg.monthlyPrice}-${i}`}
                            className="flex flex-wrap justify-between items-baseline gap-x-4 gap-y-1 border-b border-white/5 pb-3 last:border-0 last:pb-0"
                          >
                            <div className="min-w-0">
                              <p className="text-ivoire font-medium">
                                {t(`pricingQuestionnaire.transactions.${pkg.transactionsBand}.title`)}
                              </p>
                              <p className="text-xs text-slate-400">{packageLabel(pkg, t)}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-xl font-serif text-ivoire">
                                {formatCAD(pkg.monthlyPrice)}
                                <span className="text-sm text-slate-400"> {t('pricingQuestionnaire.units.monthly')}</span>
                              </p>
                              <p className="text-xs text-slate-500">
                                {t('pricingQuestionnaire.result.totalWithTax')}: {formatCAD(pkgTotal)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-gold/80 font-semibold text-center">
                      {lang === 'en'
                        ? 'Fixed prices, posted upfront — adjustable to your needs.'
                        : 'Prix fixes affichés — ajustables selon vos besoins.'}
                    </p>
                  </div>
                  <p className="text-sm text-slate-400 text-center">
                    {t('pricingQuestionnaire.result.hourlyOption').replace(
                      '{rate}',
                      formatCAD(result.amountTypical)
                    )}
                  </p>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-gold/5 border border-gold/20 text-center space-y-2">
                  <p className="text-xs uppercase tracking-widest text-gold font-bold">{t('pricingQuestionnaire.result.range')}</p>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-serif text-ivoire break-words">
                    {formatCAD(result.amountMin)} – {formatCAD(result.amountMax)}
                  </p>
                  <p className="text-sm text-slate-400">
                    {t('pricingQuestionnaire.result.typical')}: {formatCAD(result.amountTypical)}{' '}
                    {billingUnitSuffix(result.billingUnit, t)}
                  </p>
                  <p className="text-xs text-gold/80 font-semibold">
                    {lang === 'en'
                      ? 'Fixed prices, posted upfront — adjustable to your needs.'
                      : 'Prix fixes affichés — ajustables selon vos besoins.'}
                  </p>
                </div>
              )}

              {taxPreview && (
                <div className="space-y-2 text-sm">
                  <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">
                    {t('pricingQuestionnaire.result.taxesHint')}
                  </p>
                  {getTaxDisplayLines(taxPreview, answers.province, taxLang).map((line) => (
                    <div key={line.label} className="flex justify-between gap-4 text-slate-400">
                      <span>{line.label}</span>
                      <span className="shrink-0">{formatCAD(line.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between gap-4 text-ivoire font-medium pt-2 border-t border-white/5">
                    <span>{t('pricingQuestionnaire.result.totalWithTax')}</span>
                    <span>{formatCAD(taxPreview.total)}</span>
                  </div>
                </div>
              )}

              <p className="text-xs text-slate-500 italic leading-relaxed border-l-2 border-gold/30 pl-3">
                {pricingKey(t, variant, 'disclaimer')}
              </p>

              {showSignupCta && variant === 'client' && (
                <p className="text-sm text-silver leading-relaxed">
                  <span className="text-gold font-semibold">{lang === 'en' ? 'Next step: ' : 'Prochaine étape : '}</span>
                  {lang === 'en'
                    ? 'complete the new client form (2 minutes) — we reply in writing within 4 business hours.'
                    : 'remplissez la fiche nouveau client (2 minutes) — nous vous répondons par écrit sous 4 h ouvrables.'}
                </p>
              )}

              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
                {onContinue && (
                  <Button variant="gold" className="flex-1 min-h-12 gap-2 text-center" onClick={() => onContinue(result.serviceId)}>
                    {variant === 'staff'
                      ? pricingKey(t, variant, 'cta.invoices')
                      : t('pricingQuestionnaire.cta.continue')}
                    <ArrowRight size={16} className="shrink-0" />
                  </Button>
                )}
                {showSignupCta && variant === 'client' && (
                  <Button variant="gold" className="flex-1 min-h-12" asChild>
                    <a href={CONFIG.APP.INTAKE_FORM_URL} target="_blank" rel="noreferrer" onClick={() => trackEvent('intake_click', { serviceId: result.serviceId, source: 'estimate_result', lang })} className="flex items-center justify-center gap-2 px-2 text-center">
                      {t('pricingQuestionnaire.cta.requestQuote')} <Mail size={16} className="shrink-0" />
                    </a>
                  </Button>
                )}
              </div>

              <div className="text-center space-y-2">
                {showSignupCta && variant === 'client' && (
                  <p>
                    <a
                      href="/login?next=/onboarding&register=1"
                      className="text-xs text-slate-400 hover:text-gold underline underline-offset-4 transition-colors"
                    >
                      {lang === 'en' ? 'Already a client? Create your portal account' : 'Déjà client ? Créez votre compte portail'}
                    </a>
                  </p>
                )}
                <button
                  type="button"
                  onClick={reset}
                  className="text-xs text-slate-500 hover:text-gold underline underline-offset-4 transition-colors"
                >
                  {variant === 'staff'
                    ? pricingKey(t, variant, 'cta.restart')
                    : t('pricingQuestionnaire.cta.restart')}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {step !== 'result' && (
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <Button
              variant="secondary"
              className="flex-1 min-h-12"
              onClick={handlePrev}
              disabled={stepIndex <= 0}
            >
              <ArrowLeft size={16} className="mr-2" /> {t('back')}
            </Button>
            <Button
              variant="gold"
              className="flex-1 min-h-12"
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
