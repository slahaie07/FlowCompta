import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Target, FileSignature, Share2, Archive, Lock, UserCheck, Cookie, RefreshCw, Mail } from 'lucide-react';
import { CONFIG } from '../../lib/config';
import { useLanguage } from '../../hooks/useLanguage';
import { usePageMeta } from '../../hooks/usePageMeta';
import { SITE } from '../../lib/canadaNetwork';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';

export function Privacy() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const isFr = lang === 'fr';

  usePageMeta({
    title: isFr
      ? 'Politique de confidentialité | Compta-Flow'
      : 'Privacy Policy | Compta-Flow',
    description: isFr
      ? 'Comment Compta-Flow recueille, utilise, communique et conserve vos renseignements personnels, conformément à la Loi 25 du Québec et à la LPRPDE : finalités, partage, conservation de 6 et 7 ans, sécurité et vos droits.'
      : 'How Compta-Flow collects, uses, shares and retains your personal information under Quebec’s Law 25 and PIPEDA: purposes, sharing, 6- and 7-year retention, security and your rights.',
    lang: isFr ? 'fr' : 'en',
    canonical: `${SITE.url}/privacy`,
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
          <span className="text-gold text-xs font-bold tracking-[0.4em] uppercase">{isFr ? 'Conformité LPRPDE · Loi 25 (QC) · Canada' : 'PIPEDA · Act 25 (QC) Compliance · Canada'}</span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">
            {isFr ? 'Politique de confidentialité et' : 'Privacy Policy and'}<br />
            <span className="text-gold italic">{isFr ? 'protection des renseignements personnels' : 'Protection of Personal Information'}</span>
          </h1>
          <p className="text-silver text-sm font-light leading-relaxed">
            {isFr
              ? 'Dernière mise à jour : 2 novembre 2026. Cette politique décrit comment Compta-Flow recueille, utilise, communique et conserve les renseignements personnels, conformément à la Loi sur la protection des renseignements personnels et les documents électroniques (LPRPDE) à l’échelle fédérale et à la Loi 25 au Québec.'
              : 'Last updated: November 2, 2026. This policy describes how Compta-Flow collects, uses, discloses and retains personal information, in accordance with the Personal Information Protection and Electronic Documents Act (PIPEDA) at the federal level and Act 25 in Quebec.'}
          </p>
        </header>

        <main className="space-y-10 border border-gold/15 bg-white/[0.01] rounded-2xl p-8 md:p-12 backdrop-blur-sm">
          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-serif text-gold flex items-center gap-3">
              <Shield size={22} className="text-gold" />
              {isFr ? '1. Renseignements que nous recueillons' : '1. Information we collect'}
            </h2>
            <p className="text-silver text-sm font-light leading-relaxed">
              {isFr
                ? 'Nous recueillons uniquement les renseignements nécessaires à l’ouverture de votre dossier et à l’exécution de vos mandats :'
                : 'We collect only the information needed to open your file and carry out your engagements:'}
            </p>
            {isFr ? (
              <ul className="list-disc pl-6 text-silver text-sm font-light space-y-2">
                <li><strong>Identité et coordonnées</strong> : nom, courriel, téléphone et adresse.</li>
                <li><strong>Renseignements d’entreprise</strong> : nom commercial, forme juridique et, lorsque le mandat l’exige, numéros d’entreprise et comptes de taxes.</li>
                <li><strong>Pièces et données financières</strong> : relevés bancaires et de cartes, factures, reçus, registres de paie et feuillets fiscaux que vous nous transmettez pour vos livres et vos déclarations.</li>
                <li><strong>Numéro d’assurance sociale</strong> : il n’est <strong>jamais demandé à l’inscription</strong>. Il n’est demandé que lorsqu’un mandat l’exige réellement — par exemple la transmission d’une déclaration de revenus — et il transite alors par votre dossier d’échange sécurisé.</li>
                <li><strong>Données de navigation</strong> : renseignements techniques liés à l’utilisation du site, décrits à la section sur les témoins.</li>
              </ul>
            ) : (
              <ul className="list-disc pl-6 text-silver text-sm font-light space-y-2">
                <li><strong>Identity and contact information</strong>: name, email, phone number and address.</li>
                <li><strong>Business information</strong>: business name, legal form and, where the engagement requires it, business numbers and tax accounts.</li>
                <li><strong>Financial documents and data</strong>: bank and card statements, invoices, receipts, payroll records and tax slips that you send us for your books and returns.</li>
                <li><strong>Social Insurance Number</strong>: it is <strong>never requested at registration</strong>. It is only requested where an engagement genuinely requires it — for example, filing an income tax return — and it then goes through your secure exchange folder.</li>
                <li><strong>Browsing data</strong>: technical information related to use of the website, described in the cookies section.</li>
              </ul>
            )}
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-serif text-gold flex items-center gap-3">
              <Target size={22} className="text-gold" />
              {isFr ? '2. Finalités de la collecte' : '2. Purposes of collection'}
            </h2>
            <p className="text-silver text-sm font-light leading-relaxed">
              {isFr
                ? 'Vos renseignements servent uniquement à :'
                : 'Your information is used only to:'}
            </p>
            {isFr ? (
              <ul className="list-disc pl-6 text-silver text-sm font-light space-y-2">
                <li>ouvrir et administrer votre dossier client et vos mandats ;</li>
                <li>tenir vos livres, préparer vos rapports de taxes et vos paies ;</li>
                <li>préparer vos déclarations de revenus et, avec votre autorisation, les transmettre à l’Agence du revenu du Canada et à Revenu Québec ;</li>
                <li>facturer les services et recevoir vos paiements par virement Interac ;</li>
                <li>répondre à vos demandes et assurer le suivi de votre dossier ;</li>
                <li>respecter nos obligations légales, notamment en matière fiscale.</li>
              </ul>
            ) : (
              <ul className="list-disc pl-6 text-silver text-sm font-light space-y-2">
                <li>open and manage your client file and engagements;</li>
                <li>keep your books and prepare your tax returns and payroll;</li>
                <li>prepare your income tax returns and, with your authorization, file them with the Canada Revenue Agency and Revenu Québec;</li>
                <li>invoice the services and receive your payments by Interac e-Transfer;</li>
                <li>respond to your requests and follow up on your file;</li>
                <li>meet our legal obligations, particularly in tax matters.</li>
              </ul>
            )}
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-serif text-gold flex items-center gap-3">
              <FileSignature size={22} className="text-gold" />
              {isFr ? '3. Consentement et fondement de la collecte' : '3. Consent and basis for collection'}
            </h2>
            <p className="text-silver text-sm font-light leading-relaxed">
              {isFr
                ? 'En nous transmettant vos renseignements et en signant un mandat, vous consentez à leur utilisation aux fins décrites dans cette politique. Certains renseignements sont recueillis parce qu’ils sont nécessaires à l’exécution du mandat, et d’autres parce qu’une loi l’exige — notamment les règles fiscales de conservation.'
                : 'By sending us your information and signing an engagement letter, you consent to its use for the purposes described in this policy. Some information is collected because it is necessary to carry out the engagement, and other information because the law requires it — in particular the tax retention rules.'}
            </p>
            <p className="text-silver text-sm font-light leading-relaxed">
              {isFr
                ? 'Vous pouvez retirer votre consentement, comme l’explique la section sur vos droits ; ce retrait peut toutefois nous empêcher de poursuivre un mandat qui dépend des renseignements visés, et il ne supprime pas les renseignements que la loi nous oblige à conserver.'
                : 'You may withdraw your consent, as explained in the section on your rights; however, withdrawing it may prevent us from continuing an engagement that depends on the information concerned, and it does not remove information that the law requires us to retain.'}
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-serif text-gold flex items-center gap-3">
              <Share2 size={22} className="text-gold" />
              {isFr ? '4. Communication et sous-traitants' : '4. Disclosure and service providers'}
            </h2>
            {isFr ? (
              <p className="text-silver text-sm font-light leading-relaxed">
                <strong>Nous ne vendons ni ne louons vos renseignements personnels, et nous ne les partageons jamais à des fins commerciales.</strong> Ils ne sont communiqués que dans les cas suivants :
              </p>
            ) : (
              <p className="text-silver text-sm font-light leading-relaxed">
                <strong>We do not sell or rent your personal information, and we never share it for commercial purposes.</strong> It is disclosed only in the following cases:
              </p>
            )}
            {isFr ? (
              <ul className="list-disc pl-6 text-silver text-sm font-light space-y-2">
                <li><strong>Sous-traitants technologiques nécessaires au service</strong> — hébergement du site et des données, messagerie courriel et logiciels comptables utilisés pour votre dossier : leur accès est limité à ce que le service exige.</li>
                <li><strong>Administrations fiscales</strong> : l’Agence du revenu du Canada et Revenu Québec reçoivent uniquement ce que vous nous autorisez à leur transmettre, dans le cadre de vos déclarations.</li>
                <li><strong>CPA partenaire</strong> : seulement avec votre accord, lorsqu’un mandat qui exige un titre réservé lui est confié.</li>
                <li><strong>Exigences légales</strong> : si une loi ou un tribunal l’exige.</li>
              </ul>
            ) : (
              <ul className="list-disc pl-6 text-silver text-sm font-light space-y-2">
                <li><strong>Technology service providers needed to deliver the service</strong> — website and data hosting, email services and accounting software used for your file: their access is limited to what the service requires.</li>
                <li><strong>Tax authorities</strong>: the Canada Revenue Agency and Revenu Québec receive only what you authorize us to send them, as part of your returns.</li>
                <li><strong>Partner CPA</strong>: only with your agreement, when an engagement requiring a reserved title is entrusted to them.</li>
                <li><strong>Legal requirements</strong>: where a law or a court requires it.</li>
              </ul>
            )}
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-serif text-gold flex items-center gap-3">
              <Archive size={22} className="text-gold" />
              {isFr ? '5. Conservation et destruction' : '5. Retention and destruction'}
            </h2>
            {isFr ? (
              <ul className="list-disc pl-6 text-silver text-sm font-light space-y-2">
                <li><strong>Registres et pièces</strong> : les registres comptables et les pièces justificatives sont conservés <strong>6 ans</strong>, selon la règle générale de l’Agence du revenu du Canada.</li>
                <li><strong>Documents fiscaux transmis</strong> : les déclarations transmises officiellement et leurs documents à l’appui sont conservés <strong>7 ans</strong> suivant la fin de l’année d’imposition concernée, conformément aux exigences de l’Agence du revenu du Canada, de Revenu Québec et des lois fiscales en vigueur au Canada.</li>
                <li><strong>Destruction</strong> : au terme de la période de conservation, les renseignements sont détruits de façon sécurisée ou anonymisés. Les copies de travail sont détruites de la même manière dès qu’elles ne sont plus utiles au mandat.</li>
              </ul>
            ) : (
              <ul className="list-disc pl-6 text-silver text-sm font-light space-y-2">
                <li><strong>Records and supporting documents</strong>: accounting records and supporting documents are retained for <strong>6 years</strong>, in accordance with the Canada Revenue Agency’s general rule.</li>
                <li><strong>Filed tax documents</strong>: officially filed returns and their supporting documents are retained for <strong>7 years</strong> following the end of the taxation year concerned, in accordance with the requirements of the Canada Revenue Agency, Revenu Québec and the tax laws in force in Canada.</li>
                <li><strong>Destruction</strong>: at the end of the retention period, information is securely destroyed or anonymized. Working copies are destroyed in the same way as soon as they are no longer needed for the engagement.</li>
              </ul>
            )}
          </section>

          {/* Section 6 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-serif text-gold flex items-center gap-3">
              <Lock size={22} className="text-gold" />
              {isFr ? '6. Sécurité' : '6. Security'}
            </h2>
            {isFr ? (
              <ul className="list-disc pl-6 text-silver text-sm font-light space-y-2">
                <li><strong>Dossier d’échange sécurisé</strong> : chaque client dispose de son propre dossier sécurisé pour transmettre ses pièces, plutôt que de les laisser circuler en pièces jointes ordinaires.</li>
                <li><strong>Accès limité</strong> : chaque membre de l’équipe signe un engagement de confidentialité et ne voit que les dossiers qui lui sont assignés.</li>
                <li><strong>Chiffrement</strong> : les échanges sont chiffrés en transit (TLS) et les données sont chiffrées au repos.</li>
                <li><strong>Hébergement au Canada</strong> : les données des dossiers clients sont hébergées dans le centre de données AWS Canada-Central.</li>
              </ul>
            ) : (
              <ul className="list-disc pl-6 text-silver text-sm font-light space-y-2">
                <li><strong>Secure exchange folder</strong>: each client has their own secure folder for sending documents, rather than letting them circulate as ordinary email attachments.</li>
                <li><strong>Limited access</strong>: each team member signs a confidentiality undertaking and sees only the files assigned to them.</li>
                <li><strong>Encryption</strong>: exchanges are encrypted in transit (TLS) and data is encrypted at rest.</li>
                <li><strong>Hosting in Canada</strong>: client file data is hosted in the AWS Canada Central data centre.</li>
              </ul>
            )}
          </section>

          {/* Section 7 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-serif text-gold flex items-center gap-3">
              <UserCheck size={22} className="text-gold" />
              {isFr ? '7. Vos droits' : '7. Your rights'}
            </h2>
            <p className="text-silver text-sm font-light leading-relaxed">
              {isFr
                ? 'Conformément à la Loi 25 et à la LPRPDE, vous pouvez :'
                : 'In accordance with Act 25 and PIPEDA, you may:'}
            </p>
            {isFr ? (
              <ul className="list-disc pl-6 text-silver text-sm font-light space-y-2">
                <li><strong>Accéder</strong> aux renseignements que nous détenons sur vous et en obtenir copie ;</li>
                <li>faire <strong>rectifier</strong> tout renseignement inexact ou incomplet ;</li>
                <li><strong>retirer votre consentement</strong> à l’utilisation de vos renseignements, sous réserve des obligations légales de conservation et des mandats en cours ;</li>
                <li>demander la <strong>suppression</strong> des renseignements dont la conservation n’est plus requise par la loi.</li>
              </ul>
            ) : (
              <ul className="list-disc pl-6 text-silver text-sm font-light space-y-2">
                <li><strong>Access</strong> the information we hold about you and obtain a copy of it;</li>
                <li>have any inaccurate or incomplete information <strong>rectified</strong>;</li>
                <li><strong>withdraw your consent</strong> to the use of your information, subject to legal retention obligations and engagements in progress;</li>
                <li>request the <strong>deletion</strong> of information that the law no longer requires us to retain.</li>
              </ul>
            )}
            <p className="text-silver text-sm font-light leading-relaxed">
              {isFr
                ? 'Adressez votre demande au responsable identifié à la dernière section : nous y répondons dans les 30 jours, comme le prévoient la Loi 25 et la LPRPDE. Si la réponse ne vous satisfait pas, vous pouvez porter plainte auprès de la Commission d’accès à l’information du Québec ou du Commissariat à la protection de la vie privée du Canada.'
                : 'Send your request to the person in charge identified in the last section: we will respond within 30 days, as provided by Act 25 and PIPEDA. If the response is not satisfactory, you may file a complaint with the Commission d’accès à l’information du Québec or the Office of the Privacy Commissioner of Canada.'}
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-serif text-gold flex items-center gap-3">
              <Cookie size={22} className="text-gold" />
              {isFr ? '8. Témoins (cookies)' : '8. Cookies'}
            </h2>
            {isFr ? (
              <ul className="list-disc pl-6 text-silver text-sm font-light space-y-2">
                <li>Un <strong>bandeau de consentement</strong> vous permet d’accepter ou de refuser les témoins non essentiels dès votre arrivée sur le site.</li>
                <li>Les témoins <strong>nécessaires</strong> servent au fonctionnement et à la sécurité du site, par exemple à votre session et à vos préférences de langue.</li>
                <li>Le site n’utilise <strong>aucun témoin publicitaire</strong> ni de suivi à des fins commerciales.</li>
                <li>Si un outil de <strong>mesure d’audience</strong> est activé, il ne servira qu’à des statistiques globales d’utilisation, et la présente politique sera mise à jour pour le nommer.</li>
                <li>Vous pouvez aussi gérer les témoins dans les réglages de votre navigateur ; le refus des témoins nécessaires peut toutefois limiter certaines fonctions du site.</li>
              </ul>
            ) : (
              <ul className="list-disc pl-6 text-silver text-sm font-light space-y-2">
                <li>A <strong>consent banner</strong> lets you accept or refuse non-essential cookies as soon as you arrive on the website.</li>
                <li><strong>Necessary</strong> cookies support the operation and security of the website, for example your session and language preferences.</li>
                <li>The website uses <strong>no advertising cookies</strong> and no tracking for commercial purposes.</li>
                <li>If an <strong>audience measurement</strong> tool is enabled, it will be used only for overall usage statistics, and this policy will be updated to name it.</li>
                <li>You can also manage cookies in your browser settings; however, refusing necessary cookies may limit some functions of the website.</li>
              </ul>
            )}
          </section>

          {/* Section 9 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-serif text-gold flex items-center gap-3">
              <RefreshCw size={22} className="text-gold" />
              {isFr ? '9. Modification de cette politique' : '9. Changes to this policy'}
            </h2>
            <p className="text-silver text-sm font-light leading-relaxed">
              {isFr
                ? 'Nous pouvons mettre à jour cette politique pour suivre l’évolution de nos services et des lois applicables. La version en vigueur est celle publiée sur cette page, avec sa date de mise à jour ; tout changement important y sera indiqué.'
                : 'We may update this policy to keep pace with changes in our services and applicable laws. The current version is the one published on this page, with its update date; any significant change will be noted there.'}
            </p>
          </section>

          {/* Section 10 */}
          <section className="space-y-4 pt-6 border-t border-gold/15">
            <h2 className="text-xl font-serif text-gold flex items-center gap-3">
              <Mail size={22} className="text-gold" />
              {isFr ? '10. Responsable de la protection des renseignements personnels' : '10. Person in charge of the protection of personal information'}
            </h2>
            <p className="text-silver text-sm font-light leading-relaxed">
              {isFr
                ? 'Pour toute question sur cette politique, pour exercer vos droits ou pour porter plainte à l’interne, contactez le responsable :'
                : 'For any question about this policy, to exercise your rights or to file an internal complaint, contact the person in charge:'}
            </p>
            <div className="p-6 rounded-xl bg-white/[0.02] border border-gold/10 space-y-2 mt-4 text-sm font-light">
              <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4 border-b border-white/5 pb-2">
                <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">{isFr ? 'Responsable :' : 'Person in charge:'}</span>
                <span className="text-ivoire font-medium">{isFr ? 'Compta-Flow (direction)' : 'Compta-Flow (management)'}</span>
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
          </section>
        </main>
      </div>
      <SiteFooter />
    </div>
  );
}
