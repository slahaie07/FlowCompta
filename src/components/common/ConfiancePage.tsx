import { ArrowLeft, ArrowRight, FolderLock, FileSignature, Eye, KeyRound, Scale, Archive, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { useLanguage } from '../../hooks/useLanguage';
import { usePageMeta } from '../../hooks/usePageMeta';
import { SITE } from '../../lib/canadaNetwork';
import { CONFIG } from '../../lib/config';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';

export function ConfiancePage() {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const isFr = lang === 'fr';

  usePageMeta({
    title: isFr
      ? 'Confiance et sécurité — vos documents protégés | Compta-Flow'
      : 'Trust & Security — Your Documents Protected | Compta-Flow',
    description: isFr
      ? 'Comment Compta-Flow protège vos renseignements : dossier d’échange sécurisé, engagement de confidentialité signé, accès limité aux dossiers assignés, aucun NAS demandé à l’inscription.'
      : 'How Compta-Flow protects your information: secure exchange folder, signed confidentiality agreement, access limited to assigned files, no SIN requested at sign-up.',
    lang: isFr ? 'fr' : 'en',
    canonical: `${SITE.url}/confiance`,
  });

  const blocks = [
    {
      icon: FolderLock,
      title: isFr ? 'Un dossier d’échange sécurisé par client' : 'A secure exchange folder for every client',
      text: isFr
        ? 'Vos relevés, factures et feuillets passent par votre dossier d’échange sécurisé, jamais par des pièces jointes ordinaires qui traînent dans une boîte courriel.'
        : 'Your statements, invoices and slips go through your secure exchange folder — never as loose attachments sitting in an email inbox.',
    },
    {
      icon: FileSignature,
      title: isFr ? 'Un engagement de confidentialité signé' : 'A signed confidentiality agreement',
      text: isFr
        ? 'Chaque membre de l’équipe signe un engagement de confidentialité avant de toucher au moindre dossier client. Sans signature, aucun accès.'
        : 'Every team member signs a confidentiality agreement before touching any client file. No signature, no access.',
    },
    {
      icon: Eye,
      title: isFr ? 'Un accès limité aux dossiers assignés' : 'Access limited to assigned files',
      text: isFr
        ? 'Chaque personne voit uniquement les dossiers qui lui sont confiés. Tout document qui part chez un client est révisé avant l’envoi.'
        : 'Each person only sees the files assigned to them. Every document sent to a client is reviewed before it goes out.',
    },
    {
      icon: KeyRound,
      title: isFr ? 'Aucun NAS demandé à l’inscription' : 'No SIN requested at sign-up',
      text: isFr
        ? 'Nous ne collectons pas votre numéro d’assurance sociale pour ouvrir un dossier. Il n’est demandé que lorsqu’un mandat l’exige réellement — par exemple une déclaration à transmettre — et il transite alors par le dossier sécurisé.'
        : 'We do not collect your social insurance number to open a file. It is only requested when a mandate truly requires it — for example a return to be filed — and it then travels through the secure folder.',
    },
    {
      icon: Scale,
      title: isFr ? 'Loi 25 et LPRPDE : vos renseignements restent les vôtres' : 'Privacy law: your information stays yours',
      text: isFr
        ? 'Vos renseignements servent uniquement à exécuter votre mandat. Ils ne sont ni vendus, ni partagés à des fins de marketing, et vous pouvez demander en tout temps ce que nous détenons sur vous.'
        : 'Your information is used only to carry out your mandate. It is never sold or shared for marketing, and you can ask at any time what we hold about you.',
    },
    {
      icon: Archive,
      title: isFr ? 'Conservation claire, puis destruction' : 'Clear retention, then destruction',
      text: isFr
        ? 'Les pièces sont conservées le temps exigé par les règles fiscales, dans un archivage structuré. Au terme de la conservation, les copies de travail sont détruites de façon sécurisée.'
        : 'Records are kept for the period required by tax rules, in structured archives. When the retention period ends, working copies are securely destroyed.',
    },
  ];

  return (
    <div className="min-h-screen bg-noir text-ivoire">
      <SiteHeader />
      <div className="max-w-4xl mx-auto space-y-12 px-6 pt-32 pb-16">
        <Button variant="ghost" className="gap-2" onClick={() => navigate('/')}>
          <ArrowLeft size={16} /> {t('back')}
        </Button>

        <div className="text-center space-y-4">
          <span className="text-gold text-xs font-black tracking-[0.4em] uppercase">
            {isFr ? 'Confiance et sécurité' : 'Trust & Security'}
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">
            {isFr ? 'Vos documents, protégés comme ils le méritent' : 'Your documents, protected the way they should be'}
          </h1>
          <p className="text-silver font-light leading-relaxed max-w-2xl mx-auto">
            {isFr
              ? 'Confier ses livres et ses impôts en ligne demande de la confiance. Voici, concrètement, comment nous la gagnons et la gardons.'
              : 'Handing over your books and taxes online takes trust. Here, concretely, is how we earn it and keep it.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {blocks.map((b) => (
            <div key={b.title} className="border border-gold/20 rounded-2xl p-7 space-y-3 bg-surface h-full">
              <b.icon size={26} className="text-gold" aria-hidden="true" />
              <h2 className="text-lg font-serif font-bold">{b.title}</h2>
              <p className="text-sm text-silver font-light leading-relaxed">{b.text}</p>
            </div>
          ))}
        </div>

        <div className="border border-gold/30 rounded-2xl p-7 flex gap-4 items-start bg-gold/[0.03]">
          <ShieldCheck size={26} className="text-gold shrink-0 mt-1" aria-hidden="true" />
          <p className="text-sm text-silver font-light leading-relaxed">
            {isFr
              ? 'Transparence complète : Compta-Flow est un service de tenue de livres et de préparation d’impôts — pas un cabinet de CPA. Les mandats qui exigent un titre réservé (audit, mission d’examen, opinion) sont confiés à des CPA partenaires, avec votre accord.'
              : 'Full transparency: Compta-Flow is a bookkeeping and tax preparation service — not a CPA firm. Mandates that require a reserved title (audit, review engagement, opinion) are referred to partner CPAs, with your agreement.'}
          </p>
        </div>

        <div className="text-center space-y-6 pb-8">
          <h2 className="text-2xl md:text-3xl font-serif font-bold">
            {isFr ? 'Prêt à passer à l’étape suivante ?' : 'Ready for the next step?'}
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="gold" size="lg" onClick={() => navigate('/estimate')}>
              {isFr ? 'Estimer mon forfait' : 'Estimate my package'} <ArrowRight size={16} className="ml-2" />
            </Button>
            <Button variant="secondary" size="lg" asChild>
              <a href={CONFIG.APP.INTAKE_FORM_URL} target="_blank" rel="noreferrer">
                {isFr ? 'Devenir client (2 minutes)' : 'Become a client (2 minutes)'}
              </a>
            </Button>
          </div>
          <p className="text-sm text-silver font-light">
            {isFr ? 'Une question avant de commencer ? Écrivez-nous : ' : 'A question before you start? Write to us: '}
            <a href={`mailto:${CONFIG.APP.SUPPORT_EMAIL}`} className="text-gold hover:underline whitespace-nowrap focus-ring">
              {CONFIG.APP.SUPPORT_EMAIL}
            </a>
          </p>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
