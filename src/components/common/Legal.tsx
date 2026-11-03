import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Info, FileText, Scale, CreditCard, UserCheck, ShieldCheck, Copyright, AlertTriangle, Globe, Mail, Phone } from 'lucide-react';
import { CONFIG } from '../../lib/config';
import { useLanguage } from '../../hooks/useLanguage';
import { usePageMeta } from '../../hooks/usePageMeta';
import { SITE } from '../../lib/canadaNetwork';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';

export function Legal() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const isFr = lang === 'fr';

  usePageMeta({
    title: isFr
      ? 'Conditions de service et mentions légales | Compta-Flow'
      : 'Terms of Service and Legal Notice | Compta-Flow',
    description: isFr
      ? 'Les conditions de service de Compta-Flow : périmètre des services de tenue de livres et d’impôts, prix fixes et modalités de paiement, responsabilités de chacun, droit applicable au Québec et au Canada. Compta-Flow n’est pas un cabinet de CPA.'
      : 'Compta-Flow terms of service: scope of the bookkeeping and tax services, fixed pricing and payment terms, each party’s responsibilities, governing law in Quebec and Canada. Compta-Flow is not a CPA firm.',
    lang: isFr ? 'fr' : 'en',
    canonical: `${SITE.url}/legal`,
  });

  return (
    <div className="min-h-screen bg-noir text-ivoire font-sans selection:bg-gold selection:text-noir overflow-x-hidden">
      <SiteHeader />
      {/* Background radial glow */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-gold/5 to-transparent pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10 pt-32 pb-16">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-silver hover:text-gold transition-colors mb-12 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          {isFr ? 'Retour à l’accueil' : 'Back to home'}
        </button>

        <header className="space-y-4 mb-12">
          <span className="text-gold text-xs font-bold tracking-[0.4em] uppercase">{isFr ? 'Conditions de service • Canada' : 'Terms of Service • Canada'}</span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">
            {isFr ? 'Conditions de service et ' : 'Terms of Service and '}<span className="text-gold italic">{isFr ? 'mentions légales' : 'Legal Notice'}</span>
          </h1>
          <p className="text-silver text-sm font-light leading-relaxed">
            {isFr
              ? 'Dernière mise à jour : 2 novembre 2026. Ces conditions encadrent l’utilisation du site compta-flow.net et la prestation des services de Compta-Flow. Le mandat signé avec chaque client précise en outre les services, les prix et les échéances propres à son dossier.'
              : 'Last updated: November 2, 2026. These terms govern the use of the compta-flow.net website and the delivery of Compta-Flow’s services. The engagement letter signed with each client also sets out the services, pricing and deadlines specific to that client’s file.'}
          </p>
        </header>

        <main className="space-y-10 border border-gold/15 bg-white/[0.01] rounded-2xl p-8 md:p-12 backdrop-blur-sm">
          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-serif text-gold flex items-center gap-3">
              <Info size={22} className="text-gold" />
              {isFr ? '1. Éditeur du site et du service' : '1. Publisher of the website and the service'}
            </h2>
            <p className="text-silver text-sm font-light leading-relaxed">
              {isFr
                ? 'Le site compta-flow.net et les services qui y sont offerts sont exploités par :'
                : 'The compta-flow.net website and the services offered on it are operated by:'}
            </p>
            <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5 space-y-3 text-sm font-light">
              <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4 border-b border-white/5 pb-2">
                <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">{isFr ? 'Nom commercial :' : 'Business name:'}</span>
                <span className="text-ivoire font-bold">Compta-Flow</span>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4 border-b border-white/5 pb-2">
                <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">{isFr ? 'Nature :' : 'Nature:'}</span>
                <span className="text-ivoire font-medium">{isFr ? 'Service de tenue de livres et d’impôts, 100 % en ligne' : 'Bookkeeping and tax service, 100% online'}</span>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4 border-b border-white/5 pb-2">
                <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">{isFr ? 'Zone de service :' : 'Service area:'}</span>
                <span className="text-ivoire">{isFr ? 'Partout au Canada' : 'Across Canada'}</span>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4 border-b border-white/5 pb-2">
                <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">{isFr ? 'Courriel :' : 'Email:'}</span>
                <a href={`mailto:${CONFIG.APP.SUPPORT_EMAIL}`} className="text-gold hover:underline">{CONFIG.APP.SUPPORT_EMAIL}</a>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
                <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">{isFr ? 'Téléphone :' : 'Phone:'}</span>
                <span className="text-ivoire">873-655-2473</span>
              </div>
            </div>
            {isFr ? (
              <p className="text-silver text-sm font-light leading-relaxed">
                <strong>Hébergement</strong> : le site est hébergé par Vercel Inc. (San Francisco, États-Unis) et les données des dossiers clients sont hébergées par Supabase Inc., dans le centre de données AWS Canada-Central, au Canada.
              </p>
            ) : (
              <p className="text-silver text-sm font-light leading-relaxed">
                <strong>Hosting</strong>: the website is hosted by Vercel Inc. (San Francisco, United States) and client file data is hosted by Supabase Inc., in the AWS Canada Central data centre, in Canada.
              </p>
            )}
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-serif text-gold flex items-center gap-3">
              <FileText size={22} className="text-gold" />
              {isFr ? '2. Services offerts' : '2. Services offered'}
            </h2>
            <p className="text-silver text-sm font-light leading-relaxed">
              {isFr
                ? 'Compta-Flow offre, entièrement en ligne et partout au Canada, les services suivants :'
                : 'Compta-Flow offers the following services, entirely online and across Canada:'}
            </p>
            {isFr ? (
              <ul className="list-disc pl-6 text-silver text-sm font-light space-y-2">
                <li><strong>Tenue de livres</strong> mensuelle ou trimestrielle : saisie, classement et conciliation des comptes bancaires et des cartes.</li>
                <li><strong>Rapports de taxes</strong> : préparation des rapports de TPS/TVH et de TVQ selon le régime du client.</li>
                <li><strong>Paie et feuillets</strong> : calcul de la paie, remises gouvernementales et production des feuillets T4 et RL-1.</li>
                <li><strong>Impôts</strong> : préparation des déclarations de revenus des particuliers, des travailleurs autonomes et des sociétés (fin d’année).</li>
                <li><strong>Rattrapage</strong> de livres en retard et <strong>mise en place</strong> de la tenue de livres.</li>
                <li><strong>Service à l’heure</strong> pour les petits dossiers, sur estimation écrite.</li>
              </ul>
            ) : (
              <ul className="list-disc pl-6 text-silver text-sm font-light space-y-2">
                <li><strong>Bookkeeping</strong>, monthly or quarterly: data entry, filing and reconciliation of bank and card accounts.</li>
                <li><strong>Tax returns</strong>: preparation of GST/HST and QST returns based on the client’s filing schedule.</li>
                <li><strong>Payroll and slips</strong>: payroll calculation, government remittances and preparation of T4 and RL-1 slips.</li>
                <li><strong>Income taxes</strong>: preparation of income tax returns for individuals, self-employed workers and corporations (year-end).</li>
                <li><strong>Catch-up</strong> of overdue books and bookkeeping <strong>setup</strong>.</li>
                <li><strong>Hourly service</strong> for small files, based on a written estimate.</li>
              </ul>
            )}
            <p className="text-silver text-sm font-light leading-relaxed">
              {isFr
                ? 'Le périmètre exact de chaque mandat — services inclus, fréquence des livrables, échéances — est décrit dans la soumission et dans le mandat signé par le client.'
                : 'The exact scope of each engagement — services included, deliverable frequency and deadlines — is set out in the quote and in the engagement letter signed by the client.'}
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-serif text-gold flex items-center gap-3">
              <Scale size={22} className="text-gold" />
              {isFr ? '3. Cadre professionnel : ce que Compta-Flow n’offre pas' : '3. Professional framework: what Compta-Flow does not offer'}
            </h2>
            {isFr ? (
              <p className="text-silver text-sm font-light leading-relaxed">
                <strong>Transparence complète : Compta-Flow est un service de tenue de livres et de préparation d’impôts — ce n’est pas un cabinet de CPA</strong>, et personne chez Compta-Flow n’utilise le titre de CPA.
              </p>
            ) : (
              <p className="text-silver text-sm font-light leading-relaxed">
                <strong>Full transparency: Compta-Flow is a bookkeeping and tax preparation service — it is not a CPA firm</strong>, and no one at Compta-Flow uses the CPA title.
              </p>
            )}
            <p className="text-silver text-sm font-light leading-relaxed">
              {isFr
                ? 'Les mandats qui exigent un titre réservé ne sont donc pas offerts : audit, mission d’examen, certification d’états financiers et opinions d’assurance, de même que tout acte réservé aux comptables professionnels agréés par la loi. Si votre dossier exige un tel acte, nous vous le dirons clairement et nous pourrons, avec votre accord, vous orienter vers un CPA partenaire ; le mandat correspondant est alors conclu directement avec ce professionnel.'
                : 'Engagements that require a reserved title are therefore not offered: audits, review engagements, certification of financial statements and assurance opinions, as well as any act reserved by law to Chartered Professional Accountants. If your file requires such an act, we will tell you clearly and, with your agreement, we can refer you to a partner CPA; the corresponding engagement is then entered into directly with that professional.'}
            </p>
            <p className="text-silver text-sm font-light leading-relaxed">
              {isFr
                ? 'Le contenu de ce site — articles, guides, calculateur et estimateur — est fourni à titre d’information générale seulement. Il ne constitue pas un avis comptable ou fiscal personnalisé et ne promet aucun résultat fiscal, aucun remboursement ni aucune cotisation en particulier.'
                : 'The content of this website — articles, guides, calculator and estimator — is provided for general information only. It does not constitute personalized accounting or tax advice and does not promise any particular tax outcome, refund or assessment.'}
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-serif text-gold flex items-center gap-3">
              <CreditCard size={22} className="text-gold" />
              {isFr ? '4. Prix, dépôts et paiement' : '4. Pricing, deposits and payment'}
            </h2>
            {isFr ? (
              <ul className="list-disc pl-6 text-silver text-sm font-light space-y-2">
                <li>Les services sont offerts en <strong>forfaits à prix fixe</strong>, affichés sur la page Tarifs. Les prix s’entendent <strong>avant les taxes applicables</strong>.</li>
                <li>Le forfait Micro commence à <strong>149,99 $ par mois</strong> ; le service à l’heure est offert à <strong>35 $/h</strong> pour les petits dossiers, sur estimation écrite remise avant le début des travaux.</li>
                <li>Des <strong>frais d’ouverture de dossier de 149 $</strong> s’appliquent aux nouveaux mandats de tenue de livres ; ils sont <strong>offerts aux 10 premiers clients</strong>. Aucun frais d’ouverture ne s’applique aux mandats d’impôts seulement.</li>
                <li><strong>Dépôts</strong> : pour un forfait, un dépôt initial indiqué dans la soumission et le mandat est demandé à la signature, et les travaux commencent à sa réception. Pour le service à l’heure, un dépôt de 50 % de l’estimation est demandé. Pour les mandats d’impôts seulement, un acompte de 50 % est demandé à la signature et le solde est payable avant la transmission de la déclaration.</li>
                <li>Le paiement se fait par <strong>virement Interac</strong>, aux coordonnées confirmées dans le mandat.</li>
                <li>L’estimateur en ligne donne une estimation indicative ; en cas d’écart, la soumission écrite et le mandat signé font foi.</li>
              </ul>
            ) : (
              <ul className="list-disc pl-6 text-silver text-sm font-light space-y-2">
                <li>Services are offered as <strong>fixed-price packages</strong>, shown on the Pricing page. Prices are <strong>before applicable taxes</strong>.</li>
                <li>The Micro package starts at <strong>$149.99 per month</strong>; hourly service is offered at <strong>$35/h</strong> for small files, based on a written estimate provided before work begins.</li>
                <li>A <strong>$149 file opening fee</strong> applies to new bookkeeping engagements; it is <strong>waived for the first 10 clients</strong>. No opening fee applies to tax-only engagements.</li>
                <li><strong>Deposits</strong>: for a package, an initial deposit set out in the quote and the engagement letter is required on signing, and work begins once it is received. For hourly service, a deposit of 50% of the estimate is required. For tax-only engagements, a 50% deposit is required on signing and the balance is payable before the return is filed.</li>
                <li>Payment is made by <strong>Interac e-Transfer</strong>, using the details confirmed in the engagement letter.</li>
                <li>The online estimator provides an indicative estimate; in the event of a discrepancy, the written quote and the signed engagement letter prevail.</li>
              </ul>
            )}
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-serif text-gold flex items-center gap-3">
              <UserCheck size={22} className="text-gold" />
              {isFr ? '5. Responsabilités du client' : '5. Client responsibilities'}
            </h2>
            <p className="text-silver text-sm font-light leading-relaxed">
              {isFr
                ? 'Compta-Flow travaille à partir des pièces que le client lui transmet. Le client s’engage donc à :'
                : 'Compta-Flow works from the supporting documents the client provides. The client therefore undertakes to:'}
            </p>
            {isFr ? (
              <ul className="list-disc pl-6 text-silver text-sm font-light space-y-2">
                <li>fournir des pièces <strong>exactes, complètes et lisibles</strong> — relevés, factures, reçus et feuillets — dans les délais convenus au mandat ;</li>
                <li>signaler rapidement tout changement pertinent : coordonnées, situation fiscale, comptes bancaires ou de cartes, structure de l’entreprise ;</li>
                <li>vérifier les sommaires et les déclarations qui lui sont transmis pour approbation avant leur production ou leur transmission.</li>
              </ul>
            ) : (
              <ul className="list-disc pl-6 text-silver text-sm font-light space-y-2">
                <li>provide <strong>accurate, complete and legible</strong> supporting documents — statements, invoices, receipts and slips — within the deadlines set out in the engagement letter;</li>
                <li>promptly report any relevant change: contact information, tax situation, bank or card accounts, business structure;</li>
                <li>review the summaries and returns sent to them for approval before they are produced or filed.</li>
              </ul>
            )}
            <p className="text-silver text-sm font-light leading-relaxed">
              {isFr
                ? 'Si des pièces sont incomplètes, inexactes ou transmises en retard, les échéances peuvent devoir être ajustées, et les pénalités, intérêts ou cotisations qui en découlent ne sont pas imputables à Compta-Flow.'
                : 'If supporting documents are incomplete, inaccurate or provided late, deadlines may need to be adjusted, and any resulting penalties, interest or assessments are not attributable to Compta-Flow.'}
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-serif text-gold flex items-center gap-3">
              <ShieldCheck size={22} className="text-gold" />
              {isFr ? '6. Engagements de Compta-Flow' : '6. Compta-Flow’s commitments'}
            </h2>
            {isFr ? (
              <ul className="list-disc pl-6 text-silver text-sm font-light space-y-2">
                <li><strong>Réponse écrite sous 4 heures ouvrables</strong> à toute demande d’un client, par courriel ou par messagerie.</li>
                <li>Exécuter chaque mandat avec soin, à partir des pièces reçues, et signaler au client ce qui manque pour compléter son dossier.</li>
                <li>Protéger les renseignements du client : échanges par un dossier sécurisé propre à chaque client et accès limité aux dossiers assignés, comme le décrit la page Confiance et la politique de confidentialité.</li>
                <li>Conserver les registres et pièces <strong>6 ans</strong> et les documents fiscaux transmis <strong>7 ans</strong>, conformément aux exigences fiscales applicables ; le détail figure dans la politique de confidentialité.</li>
              </ul>
            ) : (
              <ul className="list-disc pl-6 text-silver text-sm font-light space-y-2">
                <li><strong>Written reply within 4 business hours</strong> to any client request, by email or messaging.</li>
                <li>Carry out each engagement with care, based on the documents received, and let the client know what is missing to complete their file.</li>
                <li>Protect client information: exchanges through a secure folder dedicated to each client and access limited to assigned files, as described on the Trust page and in the Privacy Policy.</li>
                <li>Retain records and supporting documents for <strong>6 years</strong> and filed tax documents for <strong>7 years</strong>, in accordance with applicable tax requirements; details are set out in the Privacy Policy.</li>
              </ul>
            )}
          </section>

          {/* Section 7 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-serif text-gold flex items-center gap-3">
              <Copyright size={22} className="text-gold" />
              {isFr ? '7. Propriété intellectuelle et documents du client' : '7. Intellectual property and client documents'}
            </h2>
            <p className="text-silver text-sm font-light leading-relaxed">
              {isFr
                ? 'Le site, ses textes, son logo et les gabarits créés par Compta-Flow sont la propriété de Compta-Flow. Leur reproduction ou leur réutilisation commerciale est interdite sans autorisation écrite, sauf pour un usage personnel.'
                : 'The website, its content, its logo and the templates created by Compta-Flow are the property of Compta-Flow. Reproducing them or reusing them commercially is prohibited without written authorization, except for personal use.'}
            </p>
            {isFr ? (
              <p className="text-silver text-sm font-light leading-relaxed">
                À l’inverse, <strong>vos livres, vos données comptables et vos documents demeurent votre propriété</strong>. À la fin d’un mandat, Compta-Flow vous remet l’ensemble de vos livres et rapports à jour, sous réserve du règlement des sommes dues.
              </p>
            ) : (
              <p className="text-silver text-sm font-light leading-relaxed">
                Conversely, <strong>your books, your accounting data and your documents remain your property</strong>. At the end of an engagement, Compta-Flow returns all of your books and reports, up to date, subject to payment of amounts owing.
              </p>
            )}
          </section>

          {/* Section 8 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-serif text-gold flex items-center gap-3">
              <AlertTriangle size={22} className="text-gold" />
              {isFr ? '8. Limitation de responsabilité' : '8. Limitation of liability'}
            </h2>
            <p className="text-silver text-sm font-light leading-relaxed">
              {isFr
                ? 'Dans la mesure permise par la loi applicable, la responsabilité de Compta-Flow à l’égard d’un mandat est limitée aux honoraires payés pour ce mandat. Compta-Flow ne peut être tenue responsable des dommages indirects ou consécutifs, ni des pénalités, intérêts ou cotisations découlant de pièces incomplètes, inexactes ou transmises en retard par le client, ni de décisions prises par le client sur la base d’une information générale publiée sur ce site.'
                : 'To the extent permitted by applicable law, Compta-Flow’s liability in respect of an engagement is limited to the fees paid for that engagement. Compta-Flow cannot be held liable for indirect or consequential damages, nor for penalties, interest or assessments arising from supporting documents that are incomplete, inaccurate or provided late by the client, nor for decisions made by the client based on general information published on this website.'}
            </p>
          </section>

          {/* Section 9 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-serif text-gold flex items-center gap-3">
              <Globe size={22} className="text-gold" />
              {isFr ? '9. Droit applicable et modification des conditions' : '9. Governing law and changes to these terms'}
            </h2>
            <p className="text-silver text-sm font-light leading-relaxed">
              {isFr
                ? 'Les présentes conditions sont régies par les lois de la province de Québec et par les lois fédérales du Canada qui s’y appliquent. Tout différend relatif à ces conditions ou à un mandat est soumis aux tribunaux compétents du Québec.'
                : 'These terms are governed by the laws of the Province of Quebec and the federal laws of Canada applicable therein. Any dispute relating to these terms or to an engagement is subject to the competent courts of Quebec.'}
            </p>
            <p className="text-silver text-sm font-light leading-relaxed">
              {isFr
                ? 'Compta-Flow peut mettre à jour ces conditions ; la version en vigueur est celle publiée sur cette page, avec sa date de mise à jour. Les mandats en cours demeurent régis par les conditions acceptées à leur signature, sauf entente écrite contraire.'
                : 'Compta-Flow may update these terms; the current version is the one published on this page, with its update date. Engagements in progress remain governed by the terms accepted when they were signed, unless otherwise agreed in writing.'}
            </p>
          </section>

          {/* Section 10 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-serif text-gold flex items-center gap-3">
              <Mail size={22} className="text-gold" />
              {isFr ? '10. Nous joindre' : '10. Contact us'}
            </h2>
            <p className="text-silver text-sm font-light leading-relaxed">
              {isFr
                ? 'Pour toute question sur ces conditions ou sur un mandat :'
                : 'For any question about these terms or an engagement:'}
            </p>
            <ul className="space-y-2 text-sm text-silver font-light pl-4">
              <li className="flex items-center gap-2"><Mail size={14} className="text-gold" /> {isFr ? 'Courriel :' : 'Email:'} <a href={`mailto:${CONFIG.APP.SUPPORT_EMAIL}`} className="text-gold hover:underline">{CONFIG.APP.SUPPORT_EMAIL}</a></li>
              <li className="flex items-center gap-2"><Phone size={14} className="text-gold" /> {isFr ? 'Téléphone : 873-655-2473' : 'Phone: 873-655-2473'}</li>
            </ul>
            <p className="text-silver text-sm font-light leading-relaxed">
              {isFr
                ? 'Pour vos renseignements personnels, voyez la politique de confidentialité : le responsable de la protection des renseignements y est identifié, avec ses coordonnées.'
                : 'For your personal information, see the Privacy Policy: the person in charge of the protection of personal information is identified there, with their contact details.'}
            </p>
          </section>
        </main>
      </div>
      <SiteFooter />
    </div>
  );
}
