import { Shield, CheckCircle, XCircle, AlertTriangle, Scale, BookOpen, Building2, FileText, Users, Calculator, Globe } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { motion } from 'motion/react';

const AUTHORIZED_SERVICES = [
  {
    icon: <BookOpen size={20} />,
    category: 'Tenue de Livres',
    color: 'gold',
    items: [
      'Saisie des revenus et dépenses au grand livre',
      'Conciliation bancaire mensuelle',
      'Suivi des comptes recevables (clients)',
      'Suivi des comptes payables (fournisseurs)',
      'Classement et archivage des pièces justificatives',
    ],
    tools: ['Sage 50', 'Excel', 'ComptaFlow'],
    legalRef: 'LTVQ art. 409 · Loi sur les CPA, art. 17',
  },
  {
    icon: <Users size={20} />,
    category: 'Gestion de la Paie',
    color: 'gold',
    items: [
      'Calcul des heures travaillées et des taux horaires',
      'Application des normes du travail (LSST, LNNT)',
      'Production des talons de paie détaillés',
      'Gestion des avantages imposables',
      'Remises des retenues à la source (DAS) à l\'ARC',
    ],
    tools: ['Sage 50', 'ADP', 'Excel'],
    legalRef: 'LIR art. 153 · LTA · LSST Qc',
  },
  {
    icon: <Globe size={20} />,
    category: 'Rapports Gouvernementaux',
    color: 'gold',
    items: [
      'Calcul et préparation des déclarations TPS/TVQ',
      'Soumission électronique via portails ARC / RQ',
      'Préparation des DAS mensuels ou trimestriels',
      'Déclarations sommaires des employeurs (T4, RL-1)',
      'Suivi des crédits de taxes sur intrants (CTI/RTI)',
    ],
    tools: ['Mon dossier ARC', 'Clic Revenu QC', 'Portail RQ'],
    legalRef: 'LTA Partie IX · LTVQ art. 459',
  },
  {
    icon: <FileText size={20} />,
    category: 'Soutien de Fin d\'Année',
    color: 'gold',
    items: [
      'Préparation de la balance de vérification',
      'Assemblage et organisation de tous les registres',
      'Rapprochement des comptes de bilan',
      'Préparation des données pour la mission CPA',
      'Archivage conforme aux obligations légales (7 ans)',
    ],
    tools: ['Excel', 'Access', 'Google Drive sécurisé'],
    legalRef: 'LIR art. 230 · LTA art. 286',
  },
];

const PROHIBITED_ACTS = [
  {
    icon: <XCircle size={18} />,
    title: 'Signature d\'états financiers officiels',
    detail: 'Les missions de compilation (NI 9200), d\'examen (NI 9100) et d\'audit (NI 5000) sont des actes réservés exclusivement aux membres de l\'Ordre des CPA du Québec.',
    ref: 'Loi sur les CPA, art. 24 · Code des professions, art. 26',
  },
  {
    icon: <XCircle size={18} />,
    title: 'Production des déclarations de revenus corporatifs',
    detail: 'La préparation et la signature des déclarations T2 (fédéral) et CO-17 (Québec) pour des sociétés par actions sont réservées aux CPA ou avocats fiscalistes.',
    ref: 'LIR art. 150(1)(a) · LI Qc art. 1000',
  },
  {
    icon: <XCircle size={18} />,
    title: 'Conseils fiscaux complexes ou planification fiscale',
    detail: 'Toute stratégie de réorganisation fiscale, fractionnement de revenus ou planification de succession implique une obligation de conseil que seul un CPA ou avocat peut légalement assumer.',
    ref: 'Code des professions, art. 36 · Loi sur le Barreau',
  },
  {
    icon: <XCircle size={18} />,
    title: 'Attestation ou certification de données financières',
    detail: 'Il est interdit d\'apposer toute signature, cachet ou formulation impliquant une opinion professionnelle sur la fidélité d\'états financiers.',
    ref: 'Loi sur les CPA, art. 24 al. 2',
  },
];

const HIERARCHY_LEVELS = [
  {
    level: 'NIVEAU 1',
    title: 'Préparateur Comptable Technique',
    role: 'Votre rôle — ComptaFlow',
    color: 'gold',
    bg: 'bg-gold/10 border-gold/30',
    badge: 'bg-gold/15 text-gold border-gold/30',
    icon: <Calculator size={22} />,
    description: 'Saisie, organisation, conciliation, paie, taxes indirectes (TPS/TVQ), DAS. Données parfaites livrées au CPA.',
    authority: 'Autonome sur les tâches de tenue de livres et rapports gouvernementaux de routine.',
  },
  {
    level: 'NIVEAU 2',
    title: 'Comptable Professionnel Agréé (CPA)',
    role: 'Partenaire de clôture',
    color: 'sapphire',
    bg: 'bg-sapphire/10 border-sapphire/30',
    badge: 'bg-sapphire/15 text-sapphire-light border-sapphire/30',
    icon: <Shield size={22} />,
    description: 'Mission de compilation / examen, états financiers certifiés, déclarations T2 / CO-17, planification fiscale.',
    authority: 'Actes réservés en vertu de la Loi sur les CPA et du Code des professions du Québec.',
  },
  {
    level: 'NIVEAU 3',
    title: 'Avocat Fiscaliste',
    role: 'Stratégie avancée & litiges',
    color: 'silver',
    bg: 'bg-white/5 border-white/10',
    badge: 'bg-white/10 text-silver border-white/15',
    icon: <Scale size={22} />,
    description: 'Réorganisations corporatives, fiducies, planification successorale, représentation devant les tribunaux fiscaux.',
    authority: 'Exclusivement réservé aux membres du Barreau du Québec ou de la Chambre des notaires.',
  },
];

export function LegalCharter() {
  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-5xl font-serif font-bold text-ivoire tracking-tight leading-tight">
          Charte <span className="animated-gradient-text italic">Légale.</span>
        </h1>
        <div className="flex items-center gap-3 mt-3">
          <span className="w-8 h-[1px] bg-gold/50" />
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Hiérarchie des services autorisés — Conformité Ordre des CPA du Québec</p>
        </div>
      </header>

      {/* Hierarchy pyramid */}
      <section className="space-y-3">
        <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Pyramide d'autorité professionnelle</h2>
        {HIERARCHY_LEVELS.map((lvl, i) => (
          <motion.div
            key={lvl.level}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{ marginLeft: `${i * 24}px` }}
            className={`border rounded-2xl p-6 ${lvl.bg} transition-all duration-300`}
          >
            <div className="flex items-start gap-5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${lvl.badge} border`}>
                {lvl.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <Badge variant="default" className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 ${lvl.badge}`}>
                    {lvl.level}
                  </Badge>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{lvl.role}</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-ivoire">{lvl.title}</h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">{lvl.description}</p>
                <p className="text-[10px] text-slate-600 mt-3 font-bold uppercase tracking-wider italic">{lvl.authority}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Authorized services */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <CheckCircle size={18} className="text-green-400" />
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Services autorisés — Votre périmètre d'action</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {AUTHORIZED_SERVICES.map((svc, i) => (
            <motion.div
              key={svc.category}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="p-6 glass-card h-full space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
                    {svc.icon}
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-ivoire text-lg">{svc.category}</h3>
                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-wider">{svc.legalRef}</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {svc.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm text-slate-400">
                      <CheckCircle size={13} className="text-green-500/70 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="pt-3 border-t border-white/5 flex flex-wrap gap-1.5">
                  {svc.tools.map(t => (
                    <span key={t} className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-slate-500">
                      {t}
                    </span>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Legal limits */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle size={18} className="text-amber-400" />
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Limites légales — Actes strictement réservés</h2>
        </div>
        <div className="space-y-3">
          {PROHIBITED_ACTS.map((act, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-start gap-5 p-5 rounded-2xl border border-red-500/15 bg-red-500/[0.03] hover:border-red-500/25 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                <XCircle size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-red-300/90 text-sm mb-1">{act.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{act.detail}</p>
                <p className="text-[9px] text-slate-600 font-bold uppercase tracking-wider mt-2 italic">{act.ref}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer note */}
      <Card className="p-6 border border-amber-500/20 bg-amber-500/[0.03]">
        <div className="flex items-start gap-4">
          <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-300/80 mb-1">Clause de conformité</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Ce cabinet opère à titre de préparateur comptable technique non-CPA. En vertu du Code des professions du Québec (L.R.Q., c. C-26) et de la Loi sur les comptables professionnels agréés (L.R.Q., c. C-48.1), nous respectons strictement le périmètre des actes non-réservés. Pour tout acte réservé, nous travaillons en collaboration avec des CPA partenaires agréés.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
