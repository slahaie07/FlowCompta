import { Fragment, useState } from 'react';
import {
  CheckCircle2,
  Circle,
  ChevronRight,
  FileText,
  ClipboardList,
  ExternalLink,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { useLanguage } from '../../../hooks/useLanguage';
import { useAuth } from '../../../hooks/useAuth';
import { usePortalNavigate } from '../../../hooks/usePortalNavigate';
import { useServiceProcedureProgress } from '../../../hooks/useServiceProcedureProgress';
import {
  SERVICE_PROCEDURES,
  getActiveProcedures,
  type ServiceProcedure,
  type ProcedureStep,
} from '../../../lib/serviceProcedures';
import { SERVICE_CATALOG, getServiceLabel, type ServiceId } from '../../../lib/servicesCatalog';

function ProcedureStepCard({
  step,
  done,
  onToggle,
  onNavigate,
  t,
}: {
  step: ProcedureStep;
  done: boolean;
  onToggle: (done: boolean) => void;
  onNavigate: (path: string) => void;
  t: (key: string) => string;
}) {
  return (
    <div
      className={`p-5 rounded-2xl border transition-all ${
        done ? 'bg-green-500/5 border-green-500/20' : 'bg-white/5 border-white/10'
      }`}
    >
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={() => onToggle(!done)}
          className="mt-0.5 shrink-0 text-gold hover:scale-110 transition-transform"
          aria-label={done ? t('procedure.markIncomplete') : t('procedure.markComplete')}
        >
          {done ? <CheckCircle2 size={22} className="text-green-500" /> : <Circle size={22} />}
        </button>
        <div className="flex-1 min-w-0 space-y-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                {t('procedure.step')} {step.order}
              </span>
              {done && <Badge variant="success">{t('procedure.done')}</Badge>}
            </div>
            <h4 className="text-base font-serif text-ivoire mt-1">{t(step.titleKey)}</h4>
            <p className="text-sm text-slate-400 mt-1 leading-relaxed">{t(step.descKey)}</p>
          </div>

          {step.documents.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest flex items-center gap-1.5">
                <FileText size={12} /> {t('procedure.requiredDocs')}
              </p>
              <ul className="space-y-1">
                {step.documents.map((doc) => (
                  <li key={doc.id} className="text-xs text-slate-400 flex items-center gap-2">
                    <span className={doc.required ? 'text-gold' : 'text-slate-600'}>•</span>
                    {t(doc.labelKey)}
                    {!doc.required && (
                      <span className="text-slate-600 italic">({t('procedure.optional')})</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {step.fields.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">
                {t('procedure.requiredInfo')}
              </p>
              <ul className="space-y-1">
                {step.fields.map((field) => (
                  <li key={field.id} className="text-xs text-slate-400 flex items-center gap-2">
                    <span className={field.required ? 'text-gold' : 'text-slate-600'}>•</span>
                    {t(field.labelKey)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {step.portalPath && (
            <Button
              variant="secondary"
              size="sm"
              className="gap-2 mt-1"
              onClick={() => onNavigate(step.portalPath!)}
            >
              {t('procedure.goToStep')} <ExternalLink size={14} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function ServiceProcedurePanel({
  procedure,
  userId,
  t,
  onNavigate,
}: {
  procedure: ServiceProcedure;
  userId?: string;
  t: (key: string) => string;
  onNavigate: (path: string) => void;
}) {
  const { completedSteps, toggleStep, progressPercent, currentStep } = useServiceProcedureProgress(
    userId,
    procedure.serviceId
  );
  const steps = [...procedure.steps].sort((a, b) => a.order - b.order);
  const pct = progressPercent(steps);
  const current = currentStep(steps);
  const serviceDef = SERVICE_CATALOG.find((s) => s.id === procedure.serviceId);

  return (
    <Card className="p-6 space-y-6" glow="gold">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">
            {serviceDef?.code}
          </p>
          <h3 className="text-xl font-serif text-ivoire italic mt-1">
            {getServiceLabel(procedure.serviceId, t)}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {t('procedure.estimatedDays').replace('{days}', String(procedure.estimatedDays))}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-serif text-gold">{pct}%</p>
          <p className="text-[10px] uppercase text-slate-500 tracking-widest">{t('procedure.progress')}</p>
        </div>
      </div>

      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-gold transition-all duration-500 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>

      {current && pct < 100 && (
        <div className="px-4 py-3 bg-gold/5 border border-gold/20 rounded-xl flex items-center gap-3">
          <ChevronRight size={18} className="text-gold shrink-0" />
          <p className="text-sm text-ivoire">
            <span className="text-gold font-medium">{t('procedure.nextStep')}:</span>{' '}
            {t(current.titleKey)}
          </p>
        </div>
      )}

      {pct === 100 && (
        <div className="px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-xl text-sm text-green-400">
          {t('procedure.allComplete')}
        </div>
      )}

      <div className="space-y-4">
        {steps.map((step) => (
          <Fragment key={step.id}>
            <ProcedureStepCard
              step={step}
              done={!!completedSteps[step.id]}
              onToggle={(done) => toggleStep(step.id, done)}
              onNavigate={onNavigate}
              t={t}
            />
          </Fragment>
        ))}
      </div>
    </Card>
  );
}

export function ServiceProcedure() {
  const { t } = useLanguage();
  const { user, userData } = useAuth();
  const portalNavigate = usePortalNavigate();
  const [previewId, setPreviewId] = useState<ServiceId | ''>('');

  const activeProcedures = getActiveProcedures(
    userData?.selectedServiceId,
    userData?.needs as Record<string, boolean>
  );
  const displayProcedures =
    activeProcedures.length > 0
      ? activeProcedures
      : previewId
        ? [SERVICE_PROCEDURES[previewId]]
        : [];

  const handleNavigate = (segment: string) => portalNavigate(segment as Parameters<typeof portalNavigate>[0]);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <header>
        <div className="flex items-center gap-3 text-gold mb-2">
          <ClipboardList size={22} />
          <span className="text-[10px] uppercase font-bold tracking-[0.3em]">{t('procedure.tag')}</span>
        </div>
        <h1 className="text-3xl font-serif font-medium text-ivoire tracking-tight italic">
          {t('procedure.title')} <span className="text-gold">{t('procedure.titleAccent')}</span>
        </h1>
        <p className="text-slate-400 mt-2 text-sm leading-relaxed max-w-2xl">{t('procedure.subtitle')}</p>
      </header>

      {displayProcedures.length === 0 && (
        <Card className="p-8 space-y-4" glow="gold">
          <p className="text-silver text-sm">{t('procedure.noService')}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={previewId}
              onChange={(e) => setPreviewId(e.target.value as ServiceId)}
              className="flex-1 bg-noir border border-white/10 rounded-xl px-4 py-3 text-sm text-ivoire outline-none focus:border-gold/40"
            >
              <option value="">{t('procedure.selectService')}</option>
              {SERVICE_CATALOG.map((s) => (
                <option key={s.id} value={s.id}>
                  {getServiceLabel(s.id, t)}
                </option>
              ))}
            </select>
            <Button variant="gold" disabled={!previewId} onClick={() => previewId && setPreviewId(previewId)}>
              {t('procedure.viewPath')}
            </Button>
          </div>
          <Button variant="secondary" onClick={() => handleNavigate('services')}>
            {t('procedure.browseServices')}
          </Button>
        </Card>
      )}

      {displayProcedures.map((proc) => (
        <Fragment key={proc.serviceId}>
          <ServiceProcedurePanel
            procedure={proc}
            userId={user?.id}
            t={t}
            onNavigate={handleNavigate}
          />
        </Fragment>
      ))}

      <Card className="p-5 bg-white/5 border-white/5">
        <p className="text-xs text-slate-500 leading-relaxed">{t('procedure.cpaNote')}</p>
      </Card>
    </div>
  );
}
