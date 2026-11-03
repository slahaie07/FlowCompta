import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Cookie } from 'lucide-react';
import { SITE } from '../../lib/canadaNetwork';
import { useLanguage } from '../../hooks/useLanguage';
import { usePageMeta } from '../../hooks/usePageMeta';

export function Cookies() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const isFr = lang === 'fr';

  usePageMeta({
    title: isFr ? 'Témoins (cookies) — Compta-Flow' : 'Cookies — Compta-Flow',
    description: isFr
      ? 'Quels témoins (cookies) Compta-Flow dépose sur votre appareil et pourquoi : des témoins essentiels au fonctionnement du site et du portail, et des témoins analytiques seulement avec votre consentement.'
      : 'Which cookies Compta-Flow places on your device and why: essential cookies that keep the site and portal working, and analytics cookies only with your consent.',
    lang: isFr ? 'fr' : 'en',
    canonical: `${SITE.url}/cookies`,
  });

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
            Pattern légal · Loi 25 / PIPEDA
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold">
            {isFr ? (<>Politique des <span className="text-gold italic">Témoins (Cookies)</span></>) : (<>Cookie <span className="text-gold italic">Policy</span></>)}
          </h1>
        </header>

        <main className="space-y-8 border border-gold/15 bg-white/[0.01] rounded-2xl p-8 md:p-12">
          <section className="space-y-3">
            <h2 className="text-xl font-serif text-gold flex items-center gap-2">
              <Cookie size={20} /> {isFr ? "1. Qu'est-ce qu'un témoin?" : '1. What is a cookie?'}
            </h2>
            <p className="text-silver text-sm font-light leading-relaxed">
              {isFr ? (
                <>Un témoin (cookie) est un petit fichier texte déposé sur votre appareil lors de la visite de {SITE.url}.
              ComptaFlow utilise des témoins essentiels au fonctionnement du portail et, avec votre consentement,
              des témoins analytiques pour améliorer l'expérience utilisateur.</>
              ) : (
                <>A cookie is a small text file placed on your device when you visit {SITE.url}.
              ComptaFlow uses cookies essential to the portal's operation and, with your consent,
              analytics cookies to improve the user experience.</>
              )}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-serif text-gold">{isFr ? '2. Témoins essentiels (obligatoires)' : '2. Essential cookies (required)'}</h2>
            <ul className="list-disc pl-6 text-silver text-sm space-y-2">
              <li>{isFr ? "Session d'authentification sécurisée (Supabase Auth)" : 'Secure authentication session (Supabase Auth)'}</li>
              <li>{isFr ? 'Préférences de langue et de province' : 'Language and province preferences'}</li>
              <li>{isFr ? 'Consentement aux témoins (Loi 25)' : 'Cookie consent (Law 25)'}</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-serif text-gold">{isFr ? '3. Témoins analytiques (optionnels)' : '3. Analytics cookies (optional)'}</h2>
            <p className="text-silver text-sm font-light">
              {isFr ? (
                <>Déployés uniquement après votre consentement explicite via la bannière affichée à votre première visite.
              Vous pouvez retirer votre consentement en supprimant les témoins de votre navigateur ou en nous écrivant à{' '}</>
              ) : (
                <>Deployed only after your explicit consent via the banner shown on your first visit.
              You can withdraw your consent by deleting your browser cookies or by writing to us at{' '}</>
              )}
              <a href={`mailto:${SITE.privacyEmail}`} className="text-gold hover:underline">{SITE.privacyEmail}</a>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-serif text-gold">{isFr ? '4. Base légale' : '4. Legal basis'}</h2>
            <p className="text-silver text-sm font-light">
              {isFr ? (
                <>Conformément à la Loi 25 (Québec) et à la Loi sur la protection des renseignements personnels
              et les documents électroniques (PIPEDA), nous obtenons votre consentement avant tout témoin non essentiel.</>
              ) : (
                <>In accordance with Quebec's Law 25 and the Personal Information Protection and Electronic Documents Act (PIPEDA),
              we obtain your consent before any non-essential cookie.</>
              )}
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
