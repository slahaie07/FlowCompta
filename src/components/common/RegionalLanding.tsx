import { motion } from 'motion/react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Scale, Shield } from 'lucide-react';
import { Button } from '../ui/Button';
import { getActiveRegions, getRegion, SITE } from '../../lib/canadaNetwork';
import { useLanguage } from '../../hooks/useLanguage';

export function RegionalLanding() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { lang } = useLanguage();

  const region = getActiveRegions().find((r) => r.seoSlug === slug);
  if (!region) return <Navigate to="/" replace />;
  const isFr = lang === 'fr';

  return (
    <div className="min-h-screen bg-noir text-ivoire font-sans pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-silver hover:text-gold transition-colors mb-10 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          {isFr ? "Retour à l'accueil" : 'Back to home'}
        </button>

        <header className="space-y-4 mb-12">
          <span className="text-gold text-xs font-bold tracking-[0.4em] uppercase">
            {isFr ? 'Réseau ComptaFlow · Canada' : 'ComptaFlow Network · Canada'}
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold">
            {isFr ? 'Tenue de livres' : 'Bookkeeping'}{' '}
            <span className="text-gold italic">
              {isFr ? region.nameFr : region.nameEn}
            </span>
          </h1>
          <p className="text-silver text-sm font-light max-w-2xl">
            {isFr
              ? `ComptaFlow dessert les entrepreneurs de ${region.nameFr} avec un portail sécurisé, des tarifs transparents et un hébergement de données au Canada (${SITE.dataRegion}).`
              : `ComptaFlow serves ${region.nameEn} entrepreneurs with a secure portal, transparent pricing, and Canadian data hosting (${SITE.dataRegion}).`}
          </p>
        </header>

        <main className="grid md:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl border border-gold/15 bg-white/[0.02]"
          >
            <MapPin className="text-gold mb-3" size={22} />
            <h2 className="font-serif text-lg mb-2">{isFr ? 'Région active' : 'Active region'}</h2>
            <p className="text-silver text-sm">{isFr ? region.nameFr : region.nameEn}</p>
            <p className="text-xs text-slate-500 mt-2">Edge: {region.edgeRegion}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="p-6 rounded-2xl border border-gold/15 bg-white/[0.02]"
          >
            <Scale className="text-gold mb-3" size={22} />
            <h2 className="font-serif text-lg mb-2">{isFr ? 'Taxes applicables' : 'Applicable taxes'}</h2>
            <p className="text-silver text-sm">
              {isFr ? region.taxLabelFr : region.taxLabelEn}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl border border-gold/15 bg-white/[0.02]"
          >
            <Shield className="text-gold mb-3" size={22} />
            <h2 className="font-serif text-lg mb-2">{isFr ? 'Conformité' : 'Compliance'}</h2>
            <p className="text-silver text-sm">
              {region.privacyLaw === 'loi25'
                ? isFr ? 'Loi 25 (Québec) + PIPEDA' : 'Law 25 (Quebec) + PIPEDA'
                : isFr ? 'PIPEDA — données au Canada' : 'PIPEDA — data in Canada'}
            </p>
          </motion.div>
        </main>

        <div className="flex flex-wrap gap-4">
          <Button variant="gold" onClick={() => navigate('/login?next=/onboarding&register=1')}>
            {isFr ? 'Ouvrir mon dossier' : 'Open my file'}
          </Button>
          <Button variant="secondary" onClick={() => navigate('/#services')}>
            {isFr ? 'Voir les tarifs' : 'View pricing'}
          </Button>
        </div>
      </div>
    </div>
  );
}
