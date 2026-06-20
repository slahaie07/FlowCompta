import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useCanadaNetworkContext } from '../../context/CanadaNetworkProvider';
import { useLanguage } from '../../hooks/useLanguage';

export function LegalCookieBanner() {
  const { cookiesAccepted, acceptCookies, declineCookies } = useCanadaNetworkContext();
  const { t } = useLanguage();

  if (cookiesAccepted !== null) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 z-[200] p-4 md:p-6"
    >
      <div className="max-w-4xl mx-auto bg-noir/95 backdrop-blur-md border border-gold/20 rounded-2xl p-6 shadow-2xl">
        <h3 className="text-gold font-serif text-lg mb-2">{t('cookies.title')}</h3>
        <p className="text-silver text-sm font-light mb-4 leading-relaxed">
          {t('cookies.desc')}{' '}
          <Link to="/cookies" className="text-gold hover:underline">
            {t('footer.privacy')}
          </Link>
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={declineCookies}
            className="px-5 py-2 rounded-full border border-white/10 text-silver text-sm hover:border-gold/40 transition-colors"
          >
            {t('cookies.decline')}
          </button>
          <button
            onClick={acceptCookies}
            className="px-5 py-2 rounded-full bg-gold text-noir text-sm font-bold hover:bg-gold/90 transition-colors"
          >
            {t('cookies.accept')}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
