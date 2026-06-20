import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Cookie } from 'lucide-react';
import { SITE } from '../../lib/canadaNetwork';

export function Cookies() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-noir text-ivoire font-sans pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-silver hover:text-gold transition-colors mb-10 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Retour à l'accueil
        </button>

        <header className="space-y-4 mb-12">
          <span className="text-gold text-xs font-bold tracking-[0.4em] uppercase">
            Pattern légal · Loi 25 / PIPEDA
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold">
            Politique des <span className="text-gold italic">Témoins (Cookies)</span>
          </h1>
        </header>

        <main className="space-y-8 border border-gold/15 bg-white/[0.01] rounded-2xl p-8 md:p-12">
          <section className="space-y-3">
            <h2 className="text-xl font-serif text-gold flex items-center gap-2">
              <Cookie size={20} /> 1. Qu'est-ce qu'un témoin?
            </h2>
            <p className="text-silver text-sm font-light leading-relaxed">
              Un témoin (cookie) est un petit fichier texte déposé sur votre appareil lors de la visite de {SITE.url}.
              ComptaFlow utilise des témoins essentiels au fonctionnement du portail et, avec votre consentement,
              des témoins analytiques pour améliorer l'expérience utilisateur.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-serif text-gold">2. Témoins essentiels (obligatoires)</h2>
            <ul className="list-disc pl-6 text-silver text-sm space-y-2">
              <li>Session d'authentification sécurisée (Supabase Auth)</li>
              <li>Préférences de langue et de province</li>
              <li>Consentement aux témoins (Loi 25)</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-serif text-gold">3. Témoins analytiques (optionnels)</h2>
            <p className="text-silver text-sm font-light">
              Déployés uniquement après votre consentement explicite via la bannière affichée à votre première visite.
              Vous pouvez retirer votre consentement en supprimant les témoins de votre navigateur ou en nous écrivant à{' '}
              <a href={`mailto:${SITE.privacyEmail}`} className="text-gold hover:underline">{SITE.privacyEmail}</a>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-serif text-gold">4. Base légale</h2>
            <p className="text-silver text-sm font-light">
              Conformément à la Loi 25 (Québec) et à la Loi sur la protection des renseignements personnels
              et les documents électroniques (PIPEDA), nous obtenons votre consentement avant tout témoin non essentiel.
            </p>
          </section>
        </main>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-12 text-center text-xs text-slate-500"
        >
          ComptaFlow — {SITE.publisherCity} · © 2026
        </motion.footer>
      </div>
    </div>
  );
}
