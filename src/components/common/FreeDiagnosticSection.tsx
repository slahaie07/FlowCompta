import { Stethoscope } from 'lucide-react';
import { Button } from '../ui/Button';
import { CONFIG } from '../../lib/config';
import { useLanguage } from '../../hooks/useLanguage';
import { trackEvent } from '../../lib/trackEvent';

/**
 * Section « Diagnostic gratuit » (offre validée par Sam le 2026-11-05).
 * Poids visuel volontairement secondaire : c'est le repli du parcours,
 * après l'estimateur et son CTA principal (la fiche). Ne s'affiche que si
 * l'URL du formulaire est configurée dans CONFIG.APP.DIAGNOSTIC_FORM_URL.
 */
export function FreeDiagnosticSection() {
  const { lang } = useLanguage();
  const isFr = lang === 'fr';
  const formUrl = CONFIG.APP.DIAGNOSTIC_FORM_URL;

  if (!formUrl) return null;

  const handleClick = () => {
    trackEvent('diagnostic_click', { source: 'estimate_page', lang });
    window.open(formUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="mt-12 border border-white/10 rounded-3xl p-6 sm:p-8 text-center space-y-4 bg-white/[0.02]">
      <div className="flex items-center justify-center gap-2 text-gold">
        <Stethoscope size={20} aria-hidden />
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-ivoire">
          {isFr
            ? 'Vos livres sont-ils en santé ? Diagnostic gratuit'
            : 'Are your books healthy? Free bookkeeping check-up'}
        </h2>
      </div>
      <p className="text-silver font-light leading-relaxed max-w-2xl mx-auto">
        {isFr
          ? 'Répondez à 8 questions courtes (2 minutes). Nous vous renvoyons une page claire : l’état de vos livres, vos 3 risques, vos 3 gestes prioritaires et le forfait qui vous conviendrait, avec son prix.'
          : "Answer 8 short questions (2 minutes). We'll send back one clear page: where your books stand, your 3 risks, your 3 priority moves, and the plan that would fit you — with its price."}
      </p>
      <p className="text-sm text-slate-400 font-light max-w-2xl mx-auto">
        {isFr
          ? 'Gratuit, sans engagement, et sans nous donner accès à quoi que ce soit. Vous gardez le portrait même si vous ne faites pas affaire avec nous.'
          : "Free, no commitment, and no access to anything required. You keep the report even if you don't hire us."}
      </p>
      <Button variant="secondary" className="min-h-12 px-6" onClick={handleClick}>
        {isFr ? 'Faire mon diagnostic gratuit' : 'Get my free check-up'}
      </Button>
    </section>
  );
}
