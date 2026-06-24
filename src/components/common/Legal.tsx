import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Scale, Info, Mail, MapPin } from 'lucide-react';
import { Button } from '../ui/Button';
import { CONFIG } from '../../lib/config';

export function Legal() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-noir text-ivoire font-sans selection:bg-gold selection:text-noir overflow-x-hidden pt-24 pb-16">
      {/* Background radial glow */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-gold/5 to-transparent pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-sm text-silver hover:text-gold transition-colors mb-12 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </button>

        <header className="space-y-4 mb-12">
          <span className="text-gold text-xs font-bold tracking-[0.4em] uppercase">Cadre Législatif • Canada</span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">
            Mentions <span className="text-gold italic">Légales</span>
          </h1>
          <p className="text-silver text-sm font-light">
            Conformément aux lois applicables au Canada concernant l'identification d'entreprise en ligne.
          </p>
        </header>

        <main className="space-y-10 border border-gold/15 bg-white/[0.01] rounded-2xl p-8 md:p-12 backdrop-blur-sm">
          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-serif text-gold flex items-center gap-3">
              <Info size={22} className="text-gold" />
              1. Éditeur de la Plateforme
            </h2>
            <p className="text-silver text-sm font-light leading-relaxed">
              La plateforme ComptaFlow est éditée et exploitée par :
            </p>
            <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5 space-y-3 text-sm font-light">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">Nom Commercial :</span>
                <span className="text-ivoire font-bold">ComptaFlow (Services de tenue de livres)</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">Directeur de la publication :</span>
                <span className="text-ivoire font-medium">Sébastien Lahaie</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">Numéro d'entreprise :</span>
                <span className="text-ivoire font-mono">2276543210</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">Siège social :</span>
                <span className="text-ivoire">Canada</span>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-serif text-gold flex items-center gap-3">
              <Scale size={22} className="text-gold" />
              2. Nature des services et cadre professionnel
            </h2>
            <p className="text-silver text-sm font-light leading-relaxed">
              ComptaFlow est un service de préparation de déclarations de revenus, de tenue de livres et d'aide comptable. 
            </p>
            <p className="text-silver text-sm font-light leading-relaxed">
              <strong>Mise en garde réglementaire</strong> : ComptaFlow n'est pas un cabinet d'experts-comptables agréés (CPA) et ses employés n'utilisent pas le titre de CPA. Tous les livrables d'états financiers certifiés ou d'audits officiels sont délégués et visés par des <strong>comptables agréés externes partenaires</strong>, conformément aux lois professionnelles applicables dans chaque province.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-serif text-gold flex items-center gap-3">
              <Mail size={22} className="text-gold" />
              3. Contact et Support Client
            </h2>
            <p className="text-silver text-sm font-light leading-relaxed">
              Pour toute demande réglementaire ou support, vous pouvez nous joindre :
            </p>
            <ul className="space-y-2 text-sm text-silver font-light pl-4">
              <li className="flex items-center gap-2">• <Mail size={14} className="text-gold"/> Courriel : <a href={`mailto:${CONFIG.APP.SUPPORT_EMAIL}`} className="text-gold hover:underline">{CONFIG.APP.SUPPORT_EMAIL}</a></li>
              <li className="flex items-center gap-2">• <MapPin size={14} className="text-gold"/> Pays : Canada</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-serif text-gold flex items-center gap-3">
              <Info size={22} className="text-gold" />
              4. Hébergement et Sécurité
            </h2>
            <p className="text-silver text-sm font-light leading-relaxed">
              La plateforme ComptaFlow (site web et serveurs de base de données) est hébergée par :
            </p>
            <ul className="list-disc pl-6 text-silver text-sm font-light space-y-2">
              <li><strong>Hébergement d'application</strong> : Vercel Inc., 650 2nd St, San Francisco, CA 94107, États-Unis.</li>
              <li><strong>Hébergement de données</strong> : Supabase Inc., serveurs localisés dans le centre de données AWS <strong>Canada-Central</strong>.</li>
            </ul>
          </section>
        </main>

        <footer className="mt-12 text-center text-xs text-slate-500 font-light">
          Comptaflow — Tous droits réservés © 2026.
        </footer>
      </div>
    </div>
  );
}
