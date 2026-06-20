import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Key, FileLock, UserCheck } from 'lucide-react';
import { Button } from '../ui/Button';

export function Privacy() {
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
          <span className="text-gold text-xs font-bold tracking-[0.4em] uppercase">Conformité PIPEDA · Loi 25 (QC) · Canada</span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">
            Politique de Confidentialité et<br />
            <span className="text-gold italic">Protection des Renseignements Personnels</span>
          </h1>
          <p className="text-silver text-sm font-light">
            Dernière mise à jour : 16 Juin 2026. Cette politique décrit nos engagements conformément à la Loi sur la protection des renseignements personnels et les documents électroniques (PIPEDA) au Canada, ainsi qu'à la Loi 25 au Québec le cas échéant.
          </p>
        </header>

        <main className="space-y-10 border border-gold/15 bg-white/[0.01] rounded-2xl p-8 md:p-12 backdrop-blur-sm">
          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-serif text-gold flex items-center gap-3">
              <Shield size={22} className="text-gold" />
              1. Collecte des Renseignements Personnels
            </h2>
            <p className="text-silver text-sm font-light leading-relaxed">
              Dans le cadre de nos mandats de tenue de livres, d'impôts et de direction financière, nous collectons uniquement les informations nécessaires à l'exécution de ces services :
            </p>
            <ul className="list-disc pl-6 text-silver text-sm font-light space-y-2">
              <li><strong>Informations d'identité et de contact</strong> : Nom, courriel, téléphone, adresse résidentielle.</li>
              <li><strong>Informations d'entreprise</strong> : Nom commercial, numéro d'entreprise provincial (NEQ, BN, etc.).</li>
              <li><strong>Renseignements fiscaux</strong> : NAS (Numéro d'Assurance Sociale) uniquement pour les déclarations d'impôts de particuliers (T1), revenus d'entreprise, factures, pièces justificatives.</li>
              <li><strong>Données financières</strong> : Relevés de transactions, informations de paiement chiffrées via Stripe.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-serif text-gold flex items-center gap-3">
              <Key size={22} className="text-gold" />
              2. Finalité et Utilisation des Données
            </h2>
            <p className="text-silver text-sm font-light leading-relaxed">
              Les renseignements personnels collectés sont exclusivement utilisés pour :
            </p>
            <ul className="list-disc pl-6 text-silver text-sm font-light space-y-2">
              <li>Traiter et télétransmettre vos déclarations d'impôts à l'ARC (Agence du revenu du Canada) et aux administrations fiscales provinciales compétentes.</li>
              <li>Effectuer vos rapprochements bancaires et livrer vos rapports de tenue de livres mensuels.</li>
              <li>Gérer votre abonnement client et traiter vos facturations chiffrées.</li>
              <li>Assurer un support client rapide et sécurisé avec votre préparateur attitré.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-serif text-gold flex items-center gap-3">
              <FileLock size={22} className="text-gold" />
              3. Sécurité, Stockage et Hébergement
            </h2>
            <p className="text-silver text-sm font-light leading-relaxed">
              Nous appliquons des mesures de sécurité de grade bancaire :
            </p>
            <ul className="list-disc pl-6 text-silver text-sm font-light space-y-2">
              <li><strong>Hébergement au Canada</strong> : Toutes les données et pièces justificatives déposées dans le coffre-fort numérique sont hébergées au Canada.</li>
              <li><strong>Chiffrement de pointe</strong> : Vos fichiers sont chiffrés en transit (chiffrement TLS/SSL) et au repos (AES-256).</li>
              <li><strong>Double Intégrité (SHA-256)</strong> : Chaque document versé au coffre-fort possède une empreinte numérique SHA-256 unique pour en garantir l'inviolabilité.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-serif text-gold flex items-center gap-3">
              <UserCheck size={22} className="text-gold" />
              4. Vos Droits et Consentement (Droit à l'Oubli)
            </h2>
            <p className="text-silver text-sm font-light leading-relaxed">
              Conformément à la Loi 25, vous disposez du droit d'accéder à vos informations, de les corriger ou d'en demander la suppression (droit à l'oubli) :
            </p>
            <ul className="list-disc pl-6 text-silver text-sm font-light space-y-2">
              <li><strong>Rétractation du Consentement</strong> : Vous pouvez fermer votre espace client et exiger le retrait de vos renseignements personnels à tout moment.</li>
              <li><strong>Réglementation Fiscale</strong> : Veuillez noter que les documents comptables et déclarations fiscales transmis officiellement doivent être conservés pendant une période légale obligatoire de <strong>sept (7) ans</strong> suivant la fin de l'année d'imposition concernée, conformément aux normes de l'ARC, des administrations fiscales provinciales et des lois fiscales en vigueur au Canada.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-4 pt-6 border-t border-gold/15">
            <h2 className="text-xl font-serif text-gold">
              5. Responsable de la Protection des Renseignements Personnels (DPO)
            </h2>
            <p className="text-silver text-sm font-light leading-relaxed">
              Pour toute question relative à cette politique, pour modifier vos consentements ou pour exercer vos droits d'accès et de rectification, veuillez contacter le responsable :
            </p>
            <div className="p-6 rounded-xl bg-white/[0.02] border border-gold/10 space-y-2 mt-4 text-sm font-light">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">Responsable :</span>
                <span className="text-ivoire font-medium">Sébastien Lahaie</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">Titre :</span>
                <span className="text-ivoire">Directeur et Responsable de la Protection des Données</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">Courriel :</span>
                <a href="mailto:s.lahaie07@gmail.com" className="text-gold hover:underline">s.lahaie07@gmail.com</a>
              </div>
            </div>
          </section>
        </main>

        <footer className="mt-12 text-center text-xs text-slate-500 font-light">
          Comptaflow est une plateforme technologique dédiée aux services de tenue de livres et d'aide comptable partout au Canada.
        </footer>
      </div>
    </div>
  );
}
