import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, AlertTriangle, Shield, CheckSquare } from 'lucide-react';

export function Terms() {
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
          <span className="text-gold text-xs font-bold tracking-[0.4em] uppercase">Conditions de Service • ComptaFlow</span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">
            Conditions <span className="text-gold italic">d'Utilisation</span>
          </h1>
          <p className="text-silver text-sm font-light">
            En vigueur le 16 Juin 2026. Veuillez lire attentivement nos conditions générales de service.
          </p>
        </header>

        <main className="space-y-10 border border-gold/15 bg-white/[0.01] rounded-2xl p-8 md:p-12 backdrop-blur-sm">
          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-serif text-gold flex items-center gap-3">
              <BookOpen size={22} className="text-gold" />
              1. Description des Services et Rôle
            </h2>
            <p className="text-silver text-sm font-light leading-relaxed">
              ComptaFlow fournit des services de tenue de livres, de préparation de relevés financiers non certifiés et de préparation d'impôts personnels et autonomes partout au Canada. Nous ne fournissons pas d'opinion d'audit public réservée aux CPA auditeurs. Toutes nos prestations s'effectuent sous un régime d'assistance administrative comptable.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-serif text-gold flex items-center gap-3">
              <AlertTriangle size={22} className="text-gold" />
              2. Responsabilité du Client
            </h2>
            <p className="text-silver text-sm font-light leading-relaxed">
              L'utilisateur s'engage à fournir des informations financières complètes, véridiques et exactes. ComptaFlow ne pourra être tenu responsable des pénalités fiscales imposées par l'ARC ou les administrations fiscales provinciales découlant de pièces justificatives manquantes, de fausses déclarations, ou de délais de dépôt causés par la non-transmission des documents requis dans le coffre-fort dans les temps prescrits.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-serif text-gold flex items-center gap-3">
              <Shield size={22} className="text-gold" />
              3. Protection des Renseignements Personnels
            </h2>
            <p className="text-silver text-sm font-light leading-relaxed">
              Toutes les données déposées sont stockées de façon sécurisée au Canada et chiffrées (AES-256). Nous nous conformons à la LPRPDE (PIPEDA) et, le cas échéant, à la Loi 25 (Québec). Vous pouvez exiger la suppression de votre compte conformément à notre Politique de Confidentialité.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-serif text-gold flex items-center gap-3">
              <CheckSquare size={22} className="text-gold" />
              4. Tarifs, Facturation et Garantie
            </h2>
            <p className="text-silver text-sm font-light leading-relaxed">
              Les tarifs des mandats sont fermes, fixes et affichés (89 $ pour les impôts particuliers, 199 $ pour les travailleurs autonomes, 749 $ pour les sociétés).
            </p>
            <p className="text-silver text-sm font-light leading-relaxed">
              <strong>Garantie satisfait ou remboursé</strong> : Si vous n'êtes pas entièrement satisfait du traitement initial ou de notre premier appel conseil, vous pouvez demander le remboursement complet de votre ouverture de dossier (60 $) avant l'exécution finale des travaux.
            </p>
          </section>
        </main>

        <footer className="mt-12 text-center text-xs text-slate-500 font-light">
          Comptaflow — Conditions de Service © 2026.
        </footer>
      </div>
    </div>
  );
}
