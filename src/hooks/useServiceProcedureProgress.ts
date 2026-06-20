import { useCallback, useEffect, useState } from 'react';
import type { ServiceId } from '../lib/servicesCatalog';
import { getProcedureProgressKey, type ProcedureStep } from '../lib/serviceProcedures';

export type StepCompletion = Record<string, boolean>;

export function useServiceProcedureProgress(userId: string | undefined, serviceId: ServiceId) {
  const storageKey = userId ? getProcedureProgressKey(userId, serviceId) : null;

  const [completedSteps, setCompletedSteps] = useState<StepCompletion>({});

  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setCompletedSteps(JSON.parse(raw));
    } catch {
      setCompletedSteps({});
    }
  }, [storageKey]);

  const persist = useCallback(
    (next: StepCompletion) => {
      setCompletedSteps(next);
      if (storageKey) localStorage.setItem(storageKey, JSON.stringify(next));
    },
    [storageKey]
  );

  const toggleStep = useCallback(
    (stepId: string, done: boolean) => {
      persist({ ...completedSteps, [stepId]: done });
    },
    [completedSteps, persist]
  );

  const progressPercent = (steps: ProcedureStep[]) => {
    if (!steps.length) return 0;
    const done = steps.filter((s) => completedSteps[s.id]).length;
    return Math.round((done / steps.length) * 100);
  };

  const currentStep = (steps: ProcedureStep[]) =>
    steps.sort((a, b) => a.order - b.order).find((s) => !completedSteps[s.id]);

  return { completedSteps, toggleStep, progressPercent, currentStep };
}
