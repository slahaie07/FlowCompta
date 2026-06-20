import { useCallback, useMemo, useState } from 'react';
import {
  calculatePricingEstimate,
  getRecommendedAddOns,
  loadPricingAnswers,
  savePricingAnswers,
  type PricingEstimateResult,
  type PricingQuestionnaireAnswers,
  type EmployeeBand,
  type ProfileType,
  type UrgencyLevel,
  type VolumeBand,
} from '../lib/pricingEstimator';
import { normalizeProvinceCode, type ProvinceCode } from '../lib/financeUtils';
import type { ServiceId } from '../lib/servicesCatalog';

const DEFAULT_ANSWERS: PricingQuestionnaireAnswers = {
  serviceId: 'monthlyMicro',
  province: 'QC',
  profileType: 'personal',
  volumeBand: 'medium',
  employeeBand: 'none',
  urgency: 'standard',
  addOns: [],
};

export type PricingStep = 0 | 1 | 2 | 3 | 4 | 5 | 'result';

export function usePricingEstimate(initialServiceId?: ServiceId) {
  const stored = loadPricingAnswers();
  const [step, setStep] = useState<PricingStep>(0);
  const [answers, setAnswers] = useState<PricingQuestionnaireAnswers>(() => ({
    ...DEFAULT_ANSWERS,
    ...stored,
    ...(initialServiceId ? { serviceId: initialServiceId } : {}),
  }));

  const recommendedAddOns = useMemo(
    () => getRecommendedAddOns(answers.serviceId),
    [answers.serviceId]
  );

  const result: PricingEstimateResult | null = useMemo(() => {
    if (step !== 'result') return null;
    return calculatePricingEstimate(answers);
  }, [answers, step]);

  const update = useCallback((patch: Partial<PricingQuestionnaireAnswers>) => {
    setAnswers((prev) => {
      const next = { ...prev, ...patch };
      savePricingAnswers(next);
      return next;
    });
  }, []);

  const setServiceId = (serviceId: ServiceId) => update({ serviceId });
  const setProvince = (province: ProvinceCode) => update({ province: normalizeProvinceCode(province) });
  const setProfileType = (profileType: ProfileType) => update({ profileType });
  const setVolumeBand = (volumeBand: VolumeBand) => update({ volumeBand });
  const setEmployeeBand = (employeeBand: EmployeeBand) => update({ employeeBand });
  const setUrgency = (urgency: UrgencyLevel) => update({ urgency });

  const toggleAddOn = (addOnId: ServiceId) => {
    setAnswers((prev) => {
      const has = prev.addOns.includes(addOnId);
      const addOns = has ? prev.addOns.filter((id) => id !== addOnId) : [...prev.addOns, addOnId];
      const next = { ...prev, addOns };
      savePricingAnswers(next);
      return next;
    });
  };

  const nextStep = () => {
    setStep((s) => {
      if (s === 'result') return 'result';
      if (s === 5) return 'result';
      return ((s as number) + 1) as PricingStep;
    });
  };

  const prevStep = () => {
    setStep((s) => {
      if (s === 'result') return 5;
      if (s === 0) return 0;
      return ((s as number) - 1) as PricingStep;
    });
  };

  const reset = () => {
    setAnswers({ ...DEFAULT_ANSWERS, ...(initialServiceId ? { serviceId: initialServiceId } : {}) });
    setStep(0);
  };

  const totalSteps = 6;

  return {
    step,
    setStep,
    answers,
    result,
    recommendedAddOns,
    totalSteps,
    update,
    setServiceId,
    setProvince,
    setProfileType,
    setVolumeBand,
    setEmployeeBand,
    setUrgency,
    toggleAddOn,
    nextStep,
    prevStep,
    reset,
  };
}
