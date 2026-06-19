import { useState } from 'react';
import { ChevronDown, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { UserData } from '../../types';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../hooks/useLanguage';
import {
  SERVICE_CATALOG,
  SERVICE_CATEGORIES,
  createEmptyUserNeeds,
  getServiceLabel,
  getServicesByCategory,
  type ServiceId,
} from '../../lib/servicesCatalog';

interface ServiceSelectorProps {
  userData: UserData;
  onSaved?: () => void;
}

export function ServiceSelector({ userData, onSaved }: ServiceSelectorProps) {
  const { t: translate } = useLanguage();
  const currentId = userData.selectedServiceId || '';
  const [selected, setSelected] = useState<ServiceId | ''>(currentId);
  const [saving, setSaving] = useState(false);

  const selectedService = SERVICE_CATALOG.find((s) => s.id === (selected || currentId));

  const handleSave = async () => {
    if (!selected || !userData.id) {
      toast.warning(translate('serviceSelector.selectWarning'));
      return;
    }
    setSaving(true);
    try {
      const needs = createEmptyUserNeeds();
      needs[selected] = true;

      const { error } = await supabase
        .from('profiles')
        .update({
          needs,
          metadata: {
            ...(userData.province ? { province: userData.province } : {}),
            selectedServiceId: selected,
            selectedAt: new Date().toISOString(),
          },
        })
        .eq('id', userData.id);

      if (error) throw error;
      toast.success(translate('serviceSelector.saved'));
      onSaved?.();
    } catch (err: any) {
      toast.error(err.message || translate('serviceSelector.selectWarning'));
    } finally {
      setSaving(false);
    }
  };

  if (currentId && selectedService) {
    return (
      <Card className="p-8 space-y-4 premium-border-gold" glow="gold">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-black text-gold uppercase tracking-[0.3em] mb-2">
              {translate('serviceSelector.activeLabel')}
            </p>
            <h3 className="text-xl font-serif text-ivoire">
              {getServiceLabel(selectedService.id, translate)}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {translate(`services.items.${selectedService.id}.price`)}
            </p>
          </div>
          <Badge variant="gold" className="gap-1">
            <CheckCircle size={12} /> {translate('serviceSelector.confirmed')}
          </Badge>
        </div>
        <p className="text-xs text-slate-500 italic">
          {translate('serviceSelector.changeHint')}
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-8 space-y-6 premium-border-gold" glow="gold">
      <div>
        <p className="text-xs font-black text-gold uppercase tracking-[0.3em] mb-2">
          {translate('serviceSelector.chooseLabel')}
        </p>
        <h3 className="text-2xl font-serif text-ivoire">{translate('serviceSelector.chooseTitle')}</h3>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          {translate('serviceSelector.chooseDesc')}
        </p>
      </div>

      <div className="relative">
        <label htmlFor="service-select" className="sr-only">{translate('serviceSelector.chooseTitle')}</label>
        <select
          id="service-select"
          value={selected}
          onChange={(e) => setSelected(e.target.value as ServiceId | '')}
          className="w-full appearance-none bg-noir border border-white/10 rounded-xl px-4 py-4 pr-12 text-ivoire outline-none focus-visible:border-gold/50 focus-visible:ring-2 focus-visible:ring-gold/20 transition-all text-sm"
        >
          <option value="">{translate('serviceSelector.placeholder')}</option>
          {SERVICE_CATEGORIES.map((category) => (
            <optgroup key={category} label={translate(`services.categories.${category}.title`)}>
              {getServicesByCategory(category).map((s) => (
                <option key={s.id} value={s.id}>
                  {getServiceLabel(s.id, translate)}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <ChevronDown
          size={18}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gold pointer-events-none"
        />
      </div>

      {selected && (
        <div className="p-4 rounded-xl bg-gold/5 border border-gold/15 space-y-2">
          <p className="text-sm text-ivoire font-medium">
            {getServiceLabel(selected, translate)}
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            {translate(`services.items.${selected}.desc`)}
          </p>
          <p className="text-sm text-gold font-serif">
            {translate(`services.items.${selected}.price`)}
          </p>
        </div>
      )}

      <Button variant="gold" className="w-full h-12" onClick={handleSave} isLoading={saving}>
        {translate('serviceSelector.confirm')}
      </Button>
    </Card>
  );
}
