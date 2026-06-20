import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  SERVICE_CATALOG,
  SERVICE_CATEGORIES,
  getServicesByCategory,
  type ServiceCategory,
} from '../../lib/servicesCatalog';

interface ServicesCatalogSectionProps {
  t: (key: string) => string;
  compact?: boolean;
}

function priceUnit(category: ServiceCategory, t: (key: string) => string): string {
  if (category === 'hourly') return t('services.perHour');
  if (category === 'monthly') return t('services.perMonth');
  return t('services.perMandate');
}

export function ServicesCatalogSection({ t, compact = false }: ServicesCatalogSectionProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-24">
      {SERVICE_CATEGORIES.map((category) => {
        const services = getServicesByCategory(category);
        const anchorId =
          category === 'hourly'
            ? 'tarif-horaire'
            : category === 'monthly'
              ? 'forfaits-mensuels'
              : 'services-carte';

        return (
          <div key={category} id={anchorId} className="scroll-mt-32">
            <div className={`${compact ? 'mb-8' : 'mb-12'} space-y-3`}>
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-ivoire">
                {t(`services.categories.${category}.title`)}
              </h3>
              <p className="text-silver font-light text-sm max-w-2xl">
                {t(`services.categories.${category}.subtitle`)}
              </p>
            </div>

            <div className="border-t border-gold/30">
              {services.map((svc, i) => (
                <motion.div
                  key={svc.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group py-6 md:py-8 border-b border-white/10 flex flex-col md:flex-row md:items-center gap-6 cursor-pointer hover:bg-gold/[0.03] transition-colors px-4 -mx-4 rounded-lg"
                  onClick={() => navigate('/login?next=/onboarding&register=1')}
                >
                  <span className="text-slate-500 font-serif text-sm tracking-widest shrink-0">
                    {svc.code}
                  </span>
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold shrink-0">
                      <svc.icon size={18} />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <h4 className="text-xl md:text-2xl font-serif group-hover:text-gold transition-colors">
                        {t(`services.items.${svc.id}.name`)}
                      </h4>
                      <p className="text-silver text-sm font-light leading-relaxed max-w-xl">
                        {t(`services.items.${svc.id}.desc`)}
                      </p>
                    </div>
                  </div>
                  <div className="text-left md:text-right shrink-0">
                    <span className="block text-xl md:text-2xl font-serif text-gold border-b-2 border-double border-gold pb-1">
                      {t(`services.items.${svc.id}.price`)}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-2 block">
                      {priceUnit(category, t)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}

      {!compact && (
        <p className="text-xs text-slate-500 italic border-l-2 border-gold/40 pl-4 max-w-2xl">
          {t('services.estimateNote')}
        </p>
      )}
    </div>
  );
}

export { SERVICE_CATALOG };
