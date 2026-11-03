import { CONFIG } from '../../lib/config';
import { useLanguage } from '../../hooks/useLanguage';

export function SiteFooter() {
  const { lang, t } = useLanguage();

  return (
<footer className="py-16 border-t border-gold/20 bg-noir">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 border border-gold rounded-full flex items-center justify-center text-gold font-serif font-bold text-sm">C</div>
                <span className="text-xl font-serif font-bold tracking-tight">Compta<em className="text-gold not-italic">flow</em></span>
              </div>
              <p className="text-sm text-silver/80 font-light leading-relaxed">
                {lang === 'fr' ? 'Tenue de livres et impôts, 100 % en ligne, partout au Canada. Pas un cabinet de CPA.' : 'Bookkeeping and taxes, 100% online, across Canada. Not a CPA firm.'}
              </p>
              <p className="text-sm text-silver/80 font-light">
                <a href={`mailto:${CONFIG.APP.SUPPORT_EMAIL}`} className="text-gold/90 hover:text-gold transition-colors">{CONFIG.APP.SUPPORT_EMAIL}</a>
                <br />
                <a href="tel:+18736552473" className="hover:text-gold transition-colors">873-655-2473</a>
                <br />
                {lang === 'fr' ? 'Lun–ven, 9 h à 17 h (HE) · Réponse écrite sous 4 h ouvrables' : 'Mon–Fri, 9 a.m.–5 p.m. (ET) · Written reply within 4 business hours'}
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">{lang === 'fr' ? 'Services' : 'Services'}</h3>
              <ul className="space-y-3 text-sm text-silver/85 font-light">
                <li><a href="/tarifs" className="hover:text-gold transition-colors">{lang === 'fr' ? 'Tarifs et forfaits' : 'Pricing & packages'}</a></li>
                <li><a href="/estimate" className="hover:text-gold transition-colors">{lang === 'fr' ? 'Estimation gratuite' : 'Free estimate'}</a></li>
                <li><a href="/calculateur-taxes" className="hover:text-gold transition-colors">{lang === 'fr' ? 'Calculateur de taxes' : 'Tax calculator'}</a></li>
                <li><a href="/ressources" className="hover:text-gold transition-colors">{lang === 'fr' ? 'Ressources et guides' : 'Resources & guides'}</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">{lang === 'fr' ? 'Démarrer' : 'Get started'}</h3>
              <ul className="space-y-3 text-sm text-silver/85 font-light">
                <li><a href={CONFIG.APP.INTAKE_FORM_URL} target="_blank" rel="noreferrer" className="hover:text-gold transition-colors">{lang === 'fr' ? 'Fiche nouveau client (2 min)' : 'New client form (2 min)'}</a></li>
                <li><a href="https://docs.google.com/forms/d/e/1FAIpQLSfwVqeQNjcgGwNtcmjoKzNE2jPdYsvCGAP2B8Bw_MHiSkUUug/viewform" target="_blank" rel="noreferrer" className="hover:text-gold transition-colors">{lang === 'fr' ? 'Pré-inscription impôts 2027' : '2027 tax season pre-registration'}</a></li>
                <li><a href="/confiance" className="hover:text-gold transition-colors">{lang === 'fr' ? 'Confiance et sécurité' : 'Trust & security'}</a></li>
                <li><a href="/login" className="hover:text-gold transition-colors">{lang === 'fr' ? 'Connexion client' : 'Client login'}</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">{lang === 'fr' ? 'Légal' : 'Legal'}</h3>
              <ul className="space-y-3 text-sm text-silver/85 font-light">
                <li><a href="/privacy" className="hover:text-gold transition-colors">{t('footer.privacy')}</a></li>
                <li><a href="/terms" className="hover:text-gold transition-colors">{t('footer.terms')}</a></li>
                <li><a href="/legal" className="hover:text-gold transition-colors">{t('footer.legal')}</a></li>
                <li><a href="/cookies" className="hover:text-gold transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-14 pt-8 border-t border-gold/10 flex flex-col md:flex-row justify-between gap-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
            <span>{t('footer.copyright')}</span>
            <span>{t('footer.taxDisclaimer')}</span>
          </div>
        </div>
      </footer>
  );
}
