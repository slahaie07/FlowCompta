import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText, User, Building2, BookOpen, BarChart3, Briefcase,
  CheckCircle, Clock, AlertCircle, ChevronDown, ChevronRight,
  Download, Calendar, Shield, Star, TrendingUp, ArrowRight,
  FileCheck, Layers, DollarSign, ClipboardList, Zap
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ServicePhase {
  phase: string;
  title: string;
  description: string;
  deliverables: string[];
  timeline: string;
  status?: 'complete' | 'active' | 'pending';
}

interface ServiceDefinition {
  id: string;
  icon: React.ReactNode;
  name: string;
  subtitle: string;
  code: string;
  price: string;
  normRef: string;
  description: string;
  scope: string[];
  exclusions: string[];
  pipeline: ServicePhase[];
  reportSections: string[];
  deadlines: { label: string; date: string; critical?: boolean }[];
  color: string;
}

// ─── Service Catalogue ────────────────────────────────────────────────────────

const SERVICES: ServiceDefinition[] = [
  {
    id: 't1',
    icon: <User size={22} />,
    name: 'Déclaration T1 / TP-1',
    subtitle: 'Fiscalité des Particuliers',
    code: 'T1',
    price: '89 $',
    normRef: 'LIR art. 150 · LI Qc art. 1000',
    color: 'sapphire',
    description:
      'Préparation complète et optimisée de votre déclaration de revenus de particulier (T1 fédéral + déclaration provinciale selon votre province) selon les normes de l\'ARC et des administrations fiscales provinciales.',
    scope: [
      'Collecte et analyse de tous les feuillets (T4, T5, T3, T4A, RL-1, RL-3, etc.)',
      'Optimisation des crédits d\'impôt fédéraux et provinciaux',
      'Calcul des reports de pertes et de la déduction pour gains en capital',
      'Inclusion des revenus locatifs (T776), revenus d\'emploi à la commission',
      'Dépenses de bureau à domicile (T777S) pour télétravail',
      'Déduction REER, CELIAPP, CELI — vérification des droits de cotisation',
      'Déclaration pré-faillite si applicable',
      'Transmission électronique IMPÔTNET / NetFile',
    ],
    exclusions: [
      'Revenus d\'entreprise complexes (voir forfait TA)',
      'Réclamations de TPS/TVH/TVP (voir forfait TA)',
      'États financiers certifiés (mandat CPA)',
    ],
    pipeline: [
      {
        phase: '01',
        title: 'Ouverture du dossier',
        description: 'Création de votre dossier sécurisé et collecte des documents.',
        deliverables: ['Mandat signé', 'Liste de vérification personnalisée', 'Accès Coffre-fort'],
        timeline: 'Jour 1',
        status: 'complete',
      },
      {
        phase: '02',
        title: 'Collecte des feuillets',
        description: 'Dépôt de tous vos documents fiscaux via le Coffre-Fort chiffré.',
        deliverables: ['Feuillets T4/RL-1', 'Relevés bancaires', 'Reçus de dons/cotisations'],
        timeline: 'Jours 2–5',
        status: 'active',
      },
      {
        phase: '03',
        title: 'Analyse & Optimisation',
        description: 'Examen approfondi, identification de tous les crédits applicables.',
        deliverables: ['Rapport d\'analyse préliminaire', 'Liste des économies identifiées'],
        timeline: 'Jours 6–10',
        status: 'pending',
      },
      {
        phase: '04',
        title: 'Préparation & Révision',
        description: 'Préparation des déclarations fédérale et provinciale, révision finale.',
        deliverables: ['Brouillon T1/TP-1', 'Résumé des remboursements/soldes'],
        timeline: 'Jours 11–14',
        status: 'pending',
      },
      {
        phase: '05',
        title: 'Transmission & Livraison',
        description: 'Transmission électronique et remise du rapport final client.',
        deliverables: ['Accusés de réception ARC/RQ', 'Rapport fiscal annuel PDF', 'Conseils pour l\'année suivante'],
        timeline: 'Jour 15',
        status: 'pending',
      },
    ],
    reportSections: [
      'Sommaire des revenus et retenues',
      'Optimisation des crédits (total des économies)',
      'Solde à rembourser / à payer',
      'Comparatif année précédente',
      'Recommandations REER / CELIAPP',
      'Calendrier des acomptes provisionnels (si requis)',
    ],
    deadlines: [
      { label: 'Date limite déclaration T1', date: '30 avril', critical: true },
      { label: 'Date limite travailleurs autonomes', date: '15 juin', critical: true },
      { label: 'Solde d\'impôt fédéral dû', date: '30 avril', critical: true },
      { label: 'Dernier REER déductible', date: '1er mars', critical: false },
    ],
  },
  {
    id: 'ta',
    icon: <Zap size={22} />,
    name: 'Travailleur Autonome',
    subtitle: 'T2125 & TPS/TVH/TVP',
    code: 'TA',
    price: '199 $',
    normRef: 'LIR art. 9-37 · LTA art. 165 · LTVQ art. 16',
    color: 'gold',
    description:
      'Gestion complète de la fiscalité des travailleurs autonomes : revenus d\'entreprise, déductions admissibles, déclarations TPS/TVH/TVP trimestrielles et déclaration T2125.',
    scope: [
      'Tenue de livres mensuelle (catégorisation des revenus/dépenses)',
      'Préparation du T2125 — État des résultats des activités d\'une entreprise',
      'Calcul et déclarations TPS/TVH/TVP (mensuelles, trimestrielles ou annuelles)',
      'Optimisation de toutes les dépenses admissibles (bureau à domicile, véhicule, formations)',
      'Méthode rapide de comptabilisation TPS/TVH/TVP si avantageuse',
      'Calcul des déductions pour amortissement (DPA) de classe 10, 12, 50',
      'Planification des acomptes provisionnels trimestriels',
      'Préparation T1 + TP-1 incluant revenus d\'entreprise',
    ],
    exclusions: [
      'Entreprises incorporées (voir forfait T2)',
      'États financiers audités (mandat CPA)',
      'Paie et feuillets T4 pour employés',
    ],
    pipeline: [
      {
        phase: '01',
        title: 'Ouverture & Analyse',
        description: 'Évaluation de la structure d\'affaires et du registre TPS/TVH/TVP.',
        deliverables: ['Numéro TPS/TVH/TVP vérifié', 'Mandat signé', 'Calendrier des remises'],
        timeline: 'Semaine 1',
        status: 'complete',
      },
      {
        phase: '02',
        title: 'Collecte Mensuelle',
        description: 'Réception des relevés et reçus via le Coffre-Fort chiffré.',
        deliverables: ['Relevés bancaires et cartes', 'Factures clients émises', 'Reçus de dépenses'],
        timeline: 'Mensuel (5e du mois)',
        status: 'active',
      },
      {
        phase: '03',
        title: 'Tenue de Livres',
        description: 'Saisie, catégorisation et réconciliation de toutes les transactions.',
        deliverables: ['État des résultats mensuel', 'Rapport de TVA nette', 'Tableau de bord dépenses'],
        timeline: 'Dans les 10 jours',
        status: 'pending',
      },
      {
        phase: '04',
        title: 'Déclarations TPS/TVH/TVP',
        description: 'Préparation et soumission des remises de taxes de vente.',
        deliverables: ['Formulaire GST34', 'Formulaire VD-353', 'Confirmation de soumission'],
        timeline: 'Selon fréquence',
        status: 'pending',
      },
      {
        phase: '05',
        title: 'Bilan Annuel & T2125',
        description: 'Préparation du T2125, optimisation fiscale et déclarations annuelles.',
        deliverables: ['T2125 finalisé', 'T1/TP-1 complet', 'Rapport fiscal annuel premium'],
        timeline: 'Mars–Juin',
        status: 'pending',
      },
    ],
    reportSections: [
      'État des résultats annuel (revenus vs dépenses)',
      'Tableau des déductions admissibles par catégorie',
      'Récapitulatif TPS/TVH/TVP — Collectée vs Payée vs Remise nette',
      'Calcul DPA par classe d\'actifs',
      'Acomptes provisionnels recommandés',
      'Économies fiscales réalisées vs année précédente',
      'Recommandations stratégiques (incorporation, REER, etc.)',
    ],
    deadlines: [
      { label: 'Remise TPS/TVH/TVP trimestrielle Q1', date: '30 avril', critical: true },
      { label: 'Remise TPS/TVH/TVP trimestrielle Q2', date: '31 juillet', critical: true },
      { label: 'Remise TPS/TVH/TVP trimestrielle Q3', date: '31 octobre', critical: true },
      { label: 'Remise TPS/TVH/TVP trimestrielle Q4', date: '31 janvier', critical: true },
      { label: 'Déclaration T1 TA', date: '15 juin', critical: false },
      { label: 'Solde d\'impôt dû', date: '30 avril', critical: false },
    ],
  },
  {
    id: 't2',
    icon: <Building2 size={22} />,
    name: 'Société Incorporée T2',
    subtitle: 'CO-17 & Structure Corporative',
    code: 'T2',
    price: '749 $',
    normRef: 'LIR art. 150(1.1) · LI Qc art. 1000 · CO-17 MRQ',
    color: 'sapphire',
    description:
      'Gestion fiscale complète des petites et moyennes sociétés incorporées : déclaration T2 fédérale, CO-17 provinciale, états financiers non audités, et stratégie rémunération optimale.',
    scope: [
      'Préparation de la déclaration T2 (fédérale) et de la déclaration provinciale des sociétés (selon province)',
      'États financiers annuels — Mission de compilation (non audités)',
      'Tenue de livres annuelle ou trimestrielle de la société',
      'Stratégie optimale dividendes vs salaires vs bonus',
      'Calcul de la déduction accordée aux petites entreprises (DAPE)',
      'Réconciliation des comptes de dividendes en capital (CDC)',
      'Gestion du compte de revenu à taux d\'imposition général (CRTIG)',
      'Préparation des feuillets T5 (dividendes) et T4 si applicable',
      'Déclarations TPS/TVH/TVP de la société',
    ],
    exclusions: [
      'Mission d\'examen ou audit (mandat CPA obligatoire)',
      'Consolidation de groupe de sociétés',
      'Impôt des successions ou planification testamentaire',
    ],
    pipeline: [
      {
        phase: '01',
        title: 'Constitution du dossier',
        description: 'Analyse de la structure corporative et des statuts.',
        deliverables: ['Analyse de la charte', 'Registre des actionnaires', 'Bilan d\'ouverture'],
        timeline: 'Semaine 1',
        status: 'complete',
      },
      {
        phase: '02',
        title: 'Collecte Annuelle',
        description: 'Réception de toutes les données comptables de l\'exercice.',
        deliverables: ['Relevés bancaires d\'entreprise', 'Grand livre des comptes', 'Justificatifs d\'actifs'],
        timeline: 'Après clôture exercice',
        status: 'active',
      },
      {
        phase: '03',
        title: 'États Financiers',
        description: 'Préparation du bilan, état des résultats et flux de trésorerie.',
        deliverables: ['Bilan comparatif', 'État des résultats', 'Notes complémentaires'],
        timeline: 'Semaines 3–6',
        status: 'pending',
      },
      {
        phase: '04',
        title: 'Optimisation Fiscale',
        description: 'Calcul DAPE, stratégie rémunération et analyse des comptes fiscaux.',
        deliverables: ['Analyse CDC/CRTIG', 'Recommandation dividendes/salaires', 'Simulation fiscale'],
        timeline: 'Semaine 7',
        status: 'pending',
      },
      {
        phase: '05',
        title: 'Transmission T2 / CO-17',
        description: 'Production et dépôt électronique des déclarations corporatives.',
        deliverables: ['T2 transmis ARC', 'CO-17 transmis MRQ', 'Rapport fiscal corporatif premium'],
        timeline: 'Dans les 6 mois suivant clôture',
        status: 'pending',
      },
    ],
    reportSections: [
      'États financiers annuels (Bilan + Résultats + Flux)',
      'Analyse de la performance financière (ratios clés)',
      'Rapport fiscal corporatif T2/CO-17',
      'Stratégie de rémunération optimale (dividendes vs salaires)',
      'Comptes fiscaux de la société (CDC, CRTIG, IMRTD)',
      'Obligations fiscales et calendrier des remises',
      'Recommandations stratégiques pour l\'exercice prochain',
    ],
    deadlines: [
      { label: 'T2 — 6 mois après fin d\'exercice', date: 'Variable', critical: true },
      { label: 'CO-17 — même délai', date: 'Variable', critical: true },
      { label: 'Acomptes trimestriels société', date: '15e du mois', critical: false },
      { label: 'T5 dividendes émis', date: '28 février', critical: false },
    ],
  },
  {
    id: 'bookkeeping',
    icon: <BookOpen size={22} />,
    name: 'Tenue de Livres',
    subtitle: 'Mensuelle & Réconciliation',
    code: 'BK',
    price: 'Sur devis',
    normRef: 'NCECF · Manuel CPA Canada · IFRS PME',
    color: 'gold',
    description:
      'Service de tenue de livres mensuelle rigoureuse selon les Normes Comptables pour les Entreprises à Capital Fermé (NCECF). Vos livres sont toujours prêts pour une inspection ou un financement.',
    scope: [
      'Saisie de toutes les transactions (revenus, dépenses, actifs, passifs)',
      'Réconciliation bancaire mensuelle (comptes courants et cartes)',
      'Classement et archivage de toutes les pièces justificatives',
      'Gestion des comptes fournisseurs et clients (A/P et A/R)',
      'Préparation des états financiers mensuels (interne)',
      'Tableau de bord financier mensuel avec indicateurs clés',
      'Préparation des remises de déductions à la source (DAS)',
      'Réconciliation annuelle pour préparation des déclarations',
    ],
    exclusions: [
      'Traitement de la paie (service distinct)',
      'Facturation aux clients de l\'entreprise',
      'Audits ou missions d\'examen (mandat CPA)',
    ],
    pipeline: [
      {
        phase: '01',
        title: 'Intégration',
        description: 'Configuration du plan comptable personnalisé.',
        deliverables: ['Plan comptable adapté', 'Accès aux flux bancaires', 'Procédures personnalisées'],
        timeline: 'Semaine 1',
        status: 'complete',
      },
      {
        phase: '02',
        title: 'Saisie Mensuelle',
        description: 'Saisie de toutes les transactions du mois écoulé.',
        deliverables: ['Journal des entrées', 'Suivi des paiements en attente'],
        timeline: '1–5 du mois suivant',
        status: 'active',
      },
      {
        phase: '03',
        title: 'Réconciliation',
        description: 'Rapprochement de tous les comptes avec les relevés officiels.',
        deliverables: ['États de rapprochement bancaires', 'Écarts identifiés et résolus'],
        timeline: '6–10 du mois',
        status: 'pending',
      },
      {
        phase: '04',
        title: 'Rapport Mensuel',
        description: 'Production et remise du tableau de bord financier.',
        deliverables: ['État des résultats mensuel', 'Bilan intermédiaire', 'KPIs financiers'],
        timeline: '15 du mois',
        status: 'pending',
      },
    ],
    reportSections: [
      'État des résultats mensuel et cumulatif',
      'Bilan à la date de clôture',
      'Rapport de rapprochement bancaire',
      'Analyse des flux de trésorerie',
      'Tableau des indicateurs clés (marge brute, ratios)',
      'Comptes âgés — Clients et Fournisseurs',
    ],
    deadlines: [
      { label: 'Remise DAS (déductions source)', date: '15e du mois', critical: true },
      { label: 'Rapport mensuel livré', date: '15e du mois suivant', critical: false },
      { label: 'Clôture annuelle', date: 'Selon exercice', critical: false },
    ],
  },
  {
    id: 'stocks',
    icon: <BarChart3 size={22} />,
    name: 'Revenus de Placement',
    subtitle: 'T5008 · Gains en Capital',
    code: 'INV',
    price: '149 $',
    normRef: 'LIR art. 38-55 · Bulletin IT-479R · T5008',
    color: 'sapphire',
    description:
      'Traitement fiscal spécialisé de vos revenus de placement : actions, obligations, FNB, cryptomonnaies. Calcul précis des gains et pertes en capital selon les règles d\'appariement de l\'ARC.',
    scope: [
      'Importation et analyse des feuillets T5008 / RL-18',
      'Calcul du prix de base rajusté (PBR) pour chaque titre',
      'Application des règles d\'appariement (30 jours) — pertes superficielles',
      'Gains/pertes réalisés en devises étrangères (conversion taux BoC)',
      'Traitement des crypto-monnaies (Bitcoin, ETH et autres)',
      'Revenus de dividendes canadiens (majorés) et étrangers',
      'Calcul du crédit pour impôt étranger sur dividendes étrangers',
      'Utilisation optimale de l\'exonération cumulative des gains en capital (ECGC)',
      'Report des pertes en capital des années antérieures',
    ],
    exclusions: [
      'Actions de sociétés privées et options d\'achat complexes',
      'Fiducies de placement immobilier (FPI) complexes',
      'Planification de fiducie familiale (mandat CPA spécialisé)',
    ],
    pipeline: [
      {
        phase: '01',
        title: 'Collecte des feuillets',
        description: 'Réception de tous les T5008, T5, RL-18, RL-3.',
        deliverables: ['Inventaire des comptes de placement', 'Historique de transactions'],
        timeline: 'Dès janvier',
        status: 'complete',
      },
      {
        phase: '02',
        title: 'Calcul du PBR',
        description: 'Calcul précis du prix de base rajusté pour chaque titre.',
        deliverables: ['Tableau PBR par titre', 'Identification des pertes superficielles'],
        timeline: 'Semaines 2–3',
        status: 'active',
      },
      {
        phase: '03',
        title: 'Optimisation',
        description: 'Maximisation des pertes reportées et des crédits applicables.',
        deliverables: ['Rapport de gains/pertes nets', 'Recommandations de report'],
        timeline: 'Semaine 4',
        status: 'pending',
      },
      {
        phase: '04',
        title: 'Intégration T1',
        description: 'Inclusion dans la déclaration T1/TP-1 avec annexe 3.',
        deliverables: ['Annexe 3 complétée', 'T1/TP-1 incluant placements', 'Rapport placement PDF'],
        timeline: 'Avant 30 avril',
        status: 'pending',
      },
    ],
    reportSections: [
      'Récapitulatif des gains et pertes en capital réalisés',
      'Tableau PBR par titre (court et long terme)',
      'Revenus de dividendes (canadiens vs étrangers)',
      'Pertes superficielles identifiées',
      'Crédit d\'impôt étranger calculé',
      'Report des pertes antérieures utilisées',
      'Recommandations pour optimisation future',
    ],
    deadlines: [
      { label: 'Feuillets T5008 disponibles', date: '28 février', critical: false },
      { label: 'Déclaration T1 (placements)', date: '30 avril', critical: true },
      { label: 'Récolte de pertes fiscales', date: '31 décembre', critical: false },
    ],
  },
  {
    id: 'cfo',
    icon: <Briefcase size={22} />,
    name: 'CFO Virtuel',
    subtitle: 'Stratégie & Intelligence Financière',
    code: 'CFO',
    price: 'Sur devis',
    normRef: 'NCECF · Loi sur les sociétés canadiennes · IFRS',
    color: 'gold',
    description:
      'Service de Directeur Financier Virtuel (CFO) pour les entreprises en croissance : analyses stratégiques, tableaux de bord BI, budgets prévisionnels et accompagnement décisionnel.',
    scope: [
      'Budget annuel et prévisions financières sur 3–5 ans',
      'Tableau de bord KPI mensuel (marges, liquidités, EBITDA)',
      'Analyse de rentabilité par produit, service ou département',
      'Optimisation du fonds de roulement et gestion des liquidités',
      'Préparation de dossiers de financement (banques, investisseurs)',
      'Analyse de viabilité pour nouvelles lignes d\'affaires',
      'Rapport de conseil mensuel avec recommandations stratégiques',
      'Représentation lors de rencontres avec banquiers ou investisseurs',
    ],
    exclusions: [
      'Gestion opérationnelle quotidienne',
      'Recrutement ou ressources humaines',
      'Services juridiques (collaboration avec notaire/avocat recommandée)',
    ],
    pipeline: [
      {
        phase: '01',
        title: 'Diagnostic Financier',
        description: 'Analyse en profondeur de la santé financière et des processus.',
        deliverables: ['Rapport de diagnostic complet', 'Identification des fuites de liquidité', 'Benchmark sectoriel'],
        timeline: 'Semaines 1–2',
        status: 'complete',
      },
      {
        phase: '02',
        title: 'Plan Financier',
        description: 'Élaboration du budget et des projections sur 3 ans.',
        deliverables: ['Budget annuel détaillé', 'Projections 3 ans (3 scénarios)', 'Plan de trésorerie'],
        timeline: 'Semaines 3–5',
        status: 'active',
      },
      {
        phase: '03',
        title: 'Mise en place BI',
        description: 'Déploiement des tableaux de bord et indicateurs de performance.',
        deliverables: ['Dashboard KPI mensuel', 'Alertes automatiques', 'Accès ComptaFlow BI'],
        timeline: 'Semaine 6',
        status: 'pending',
      },
      {
        phase: '04',
        title: 'Accompagnement Mensuel',
        description: 'Réunion mensuelle, analyse des résultats vs budget, recommandations.',
        deliverables: ['Compte-rendu mensuel', 'Rapport de variance', 'Recommandations prioritaires'],
        timeline: 'Mensuel (1er lundi)',
        status: 'pending',
      },
    ],
    reportSections: [
      'Tableau de bord exécutif (KPIs clés — 1 page)',
      'Analyse de variance Budget vs Réel',
      'Flux de trésorerie prévisionnels 90 jours',
      'Analyse de rentabilité par segment',
      'Ratio d\'endettement et capacité de remboursement',
      'Recommandations stratégiques du mois',
      'Risques identifiés et plan d\'atténuation',
    ],
    deadlines: [
      { label: 'Rapport mensuel CFO', date: '5e du mois', critical: true },
      { label: 'Révision budgétaire trimestrielle', date: 'Trimestrielle', critical: false },
      { label: 'Budget annuel N+1', date: 'Novembre', critical: false },
    ],
  },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function PhaseTracker({ phases }: { phases: ServicePhase[] }) {
  return (
    <div className="space-y-3">
      {phases.map((phase, idx) => (
        <div key={idx} className="flex items-start gap-4">
          <div className="flex flex-col items-center">
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-[10px] font-black shrink-0 border ${
              phase.status === 'complete' ? 'bg-green-500/15 border-green-500/30 text-green-400' :
              phase.status === 'active'   ? 'bg-gold/15 border-gold/30 text-gold' :
                                           'bg-white/5 border-white/10 text-slate-500'
            }`}>
              {phase.status === 'complete' ? <CheckCircle size={14} /> : phase.phase}
            </div>
            {idx < phases.length - 1 && (
              <div className={`w-px flex-1 mt-1 mb-1 min-h-[24px] ${
                phase.status === 'complete' ? 'bg-green-500/20' : 'bg-white/5'
              }`} />
            )}
          </div>
          <div className="pb-4 flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <p className={`text-sm font-bold ${
                phase.status === 'complete' ? 'text-green-400' :
                phase.status === 'active'   ? 'text-gold' : 'text-ivoire'
              }`}>{phase.title}</p>
              <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">{phase.timeline}</span>
              {phase.status === 'active' && (
                <Badge variant="gold" className="text-[9px] py-0 px-2 bg-gold/10 text-gold border-gold/20">En cours</Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{phase.description}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {phase.deliverables.map((d, i) => (
                <span key={i} className="text-[9px] bg-white/5 border border-white/10 rounded-full px-2 py-0.5 text-slate-400 font-medium">
                  {d}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ServiceCard({ service, isSelected, onClick }: { service: ServiceDefinition; isSelected: boolean; onClick: () => void }) {
  const colorMap: Record<string, string> = {
    gold: 'border-gold/40 bg-gold/5 text-gold',
    sapphire: 'border-sapphire/40 bg-sapphire/5 text-sapphire-light',
  };
  const iconColor = colorMap[service.color] || colorMap.gold;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-6 rounded-2xl border transition-all duration-300 ${
        isSelected
          ? (service.color === 'gold' ? 'border-gold bg-gold/10 shadow-glow' : 'border-sapphire bg-sapphire/10 shadow-glow-sapphire')
          : 'border-white/10 bg-white/[0.02] hover:border-white/20'
      }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 border ${iconColor}`}>
        {service.icon}
      </div>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-ivoire leading-tight">{service.name}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">{service.subtitle}</p>
        </div>
        <span className={`text-[10px] font-black px-2 py-1 rounded-full shrink-0 ${
          service.color === 'gold' ? 'bg-gold/10 text-gold' : 'bg-sapphire/10 text-sapphire-light'
        }`}>{service.price}</span>
      </div>
    </button>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function ServiceReports() {
  const [selectedId, setSelectedId] = useState<string>('t1');
  const [activeTab, setActiveTab] = useState<'overview' | 'pipeline' | 'report' | 'deadlines'>('overview');

  const service = SERVICES.find(s => s.id === selectedId)!;

  const tabs = [
    { id: 'overview',  label: 'Vue d\'ensemble',  icon: <Layers size={13} /> },
    { id: 'pipeline',  label: 'Pipeline complet', icon: <ClipboardList size={13} /> },
    { id: 'report',    label: 'Structure rapport', icon: <FileCheck size={13} /> },
    { id: 'deadlines', label: 'Échéancier fiscal', icon: <Calendar size={13} /> },
  ] as const;

  return (
    <div className="space-y-10">
      {/* Header */}
      <header>
        <h1 className="text-5xl font-serif font-bold text-ivoire tracking-tight leading-tight">
          Services <span className="animated-gradient-text italic">Professionnels.</span>
        </h1>
        <div className="flex items-center gap-3 mt-3">
          <span className="w-8 h-[1px] bg-gold/50"></span>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">
            Structure complète & normes ARC · administrations provinciales · CPA Canada
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Service Selector */}
        <div className="lg:col-span-1 space-y-3">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Sélectionner un service</p>
          {SERVICES.map(s => (
            <React.Fragment key={s.id}>
              <ServiceCard
                service={s}
                isSelected={selectedId === s.id}
                onClick={() => { setSelectedId(s.id); setActiveTab('overview'); }}
              />
            </React.Fragment>
          ))}
        </div>

        {/* Service Detail */}
        <div className="lg:col-span-3 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Service Header */}
              <Card className={`p-8 relative overflow-hidden ${service.color === 'gold' ? 'premium-border-gold' : 'border border-sapphire/30'}`} glow={service.color as any}>
                <div className="absolute top-0 right-0 w-48 h-48 bg-gold/5 blur-3xl rounded-full -mr-24 -mt-24" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="gold" className={`text-[9px] font-black uppercase tracking-widest px-3 ${service.color === 'gold' ? 'bg-gold/10 text-gold border-gold/20' : 'bg-sapphire/10 text-sapphire-light border-sapphire/20'}`}>
                          {service.code}
                        </Badge>
                        <span className="text-[9px] text-slate-500 font-mono">{service.normRef}</span>
                      </div>
                      <h2 className="text-3xl font-serif font-bold text-ivoire">{service.name}</h2>
                      <p className="text-slate-400 text-sm mt-1">{service.subtitle}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-3xl font-serif font-bold ${service.color === 'gold' ? 'text-gold' : 'text-sapphire-light'}`}>{service.price}</p>
                      <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black mt-1">par dossier</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 mt-4 leading-relaxed max-w-2xl">{service.description}</p>
                </div>
              </Card>

              {/* Tabs */}
              <div className="flex gap-1 p-1 bg-white/5 rounded-2xl border border-white/5 overflow-x-auto">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 whitespace-nowrap flex-1 justify-center ${
                      activeTab === tab.id
                        ? (service.color === 'gold' ? 'bg-gold/15 text-gold' : 'bg-sapphire/15 text-sapphire-light')
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* ── Vue d\'ensemble ── */}
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <Card className="p-8 glass-card">
                        <h3 className="text-xs font-black text-silver uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                          <CheckCircle size={14} className="text-green-400" /> Ce que comprend ce service
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {service.scope.map((item, i) => (
                            <div key={i} className="flex items-start gap-3 text-xs text-slate-400">
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${service.color === 'gold' ? 'bg-gold/10 border border-gold/20' : 'bg-sapphire/10 border border-sapphire/20'}`}>
                                <CheckCircle size={10} className={service.color === 'gold' ? 'text-gold' : 'text-sapphire-light'} />
                              </div>
                              <span className="leading-relaxed">{item}</span>
                            </div>
                          ))}
                        </div>
                      </Card>
                      <Card className="p-8 glass-card border-amber-500/10">
                        <h3 className="text-xs font-black text-amber-500/70 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                          <AlertCircle size={14} className="text-amber-500" /> Hors périmètre (exclusions)
                        </h3>
                        <div className="space-y-3">
                          {service.exclusions.map((item, i) => (
                            <div key={i} className="flex items-start gap-3 text-xs text-slate-500">
                              <div className="w-4 h-4 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                <AlertCircle size={10} className="text-amber-500/70" />
                              </div>
                              <span className="leading-relaxed">{item}</span>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </div>
                  )}

                  {/* ── Pipeline ── */}
                  {activeTab === 'pipeline' && (
                    <Card className="p-8 glass-card">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xs font-black text-silver uppercase tracking-[0.3em] flex items-center gap-2">
                          <ClipboardList size={14} className={service.color === 'gold' ? 'text-gold' : 'text-sapphire-light'} /> Pipeline de Livraison
                        </h3>
                        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest">
                          <span className="flex items-center gap-1 text-green-400"><div className="w-2 h-2 rounded-full bg-green-400"/> Complété</span>
                          <span className="flex items-center gap-1 text-gold"><div className="w-2 h-2 rounded-full bg-gold"/> En cours</span>
                          <span className="flex items-center gap-1 text-slate-500"><div className="w-2 h-2 rounded-full bg-slate-600"/> À venir</span>
                        </div>
                      </div>
                      <PhaseTracker phases={service.pipeline} />
                    </Card>
                  )}

                  {/* ── Structure rapport ── */}
                  {activeTab === 'report' && (
                    <Card className="p-8 glass-card">
                      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                        <h3 className="text-xs font-black text-silver uppercase tracking-[0.3em] flex items-center gap-2">
                          <FileCheck size={14} className={service.color === 'gold' ? 'text-gold' : 'text-sapphire-light'} /> Structure du Rapport Livrable
                        </h3>
                        <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest gap-2 border border-white/10 hover:border-gold/30">
                          <Download size={13} /> Télécharger modèle
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {service.reportSections.map((section, i) => (
                          <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 hover:border-white/20 ${
                            i === 0 ? (service.color === 'gold' ? 'border-gold/20 bg-gold/5' : 'border-sapphire/20 bg-sapphire/5') : 'border-white/5 bg-white/[0.01]'
                          }`}>
                            <span className={`text-[10px] font-black shrink-0 w-6 text-center ${
                              service.color === 'gold' ? 'text-gold/60' : 'text-sapphire-light/60'
                            }`}>{String(i + 1).padStart(2, '0')}</span>
                            <p className="text-sm text-slate-300 font-medium">{section}</p>
                            {i === 0 && (
                              <Badge variant="gold" className="ml-auto text-[9px] bg-gold/10 text-gold border-gold/20 shrink-0">Résumé exécutif</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="mt-8 p-6 rounded-2xl border border-white/5 bg-white/[0.01]">
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                          <strong className="text-slate-400">Format de livraison :</strong> PDF premium avec en-tête professionnel, table des matières, signatures numériques et archivage dans votre Coffre-Fort sécurisé.
                          Conforme aux normes de présentation CPA Canada et aux exigences de documentation de l\'ARC et administrations fiscales provinciales.
                        </p>
                      </div>
                    </Card>
                  )}

                  {/* ── Échéancier ── */}
                  {activeTab === 'deadlines' && (
                    <Card className="p-8 glass-card">
                      <h3 className="text-xs font-black text-silver uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                        <Calendar size={14} className={service.color === 'gold' ? 'text-gold' : 'text-sapphire-light'} /> Échéancier Fiscal Réglementaire
                      </h3>
                      <div className="space-y-3">
                        {service.deadlines.map((dl, i) => (
                          <div key={i} className={`flex items-center justify-between p-5 rounded-2xl border ${
                            dl.critical ? 'border-red-500/20 bg-red-500/5' : 'border-white/5 bg-white/[0.01]'
                          }`}>
                            <div className="flex items-center gap-4">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                dl.critical ? 'bg-red-500/15' : 'bg-white/5'
                              }`}>
                                {dl.critical ? <AlertCircle size={14} className="text-red-400" /> : <Clock size={14} className="text-slate-500" />}
                              </div>
                              <p className="text-sm text-ivoire font-medium">{dl.label}</p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className={`text-sm font-bold font-mono ${dl.critical ? 'text-red-400' : 'text-slate-400'}`}>{dl.date}</span>
                              {dl.critical && (
                                <Badge variant="default" className="text-[9px] bg-red-500/10 text-red-400 border-red-500/20 font-black uppercase">Critique</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-8 p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                        <p className="text-xs text-amber-400 leading-relaxed">
                          <strong>⚠ Pénalités de retard :</strong> L\'ARC impose une pénalité de 5% du solde impayé plus 1% par mois de retard (max 12 mois) pour les déclarations en retard.
                          administrations fiscales provinciales applique des pénalités similaires selon la Loi sur l\'administration fiscale.
                          Notre service inclut des rappels automatiques 30 et 7 jours avant chaque échéance.
                        </p>
                      </div>
                    </Card>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
