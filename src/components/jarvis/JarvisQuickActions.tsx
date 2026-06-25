import { Receipt, FolderLock, MessageSquare, TrendingUp, HelpCircle, FileText, BarChart2 } from 'lucide-react';

interface QuickAction {
  label: string;
  icon: React.ElementType;
  message: string;
  roles: string[];
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: 'Mes factures',
    icon: Receipt,
    message: 'Montre-moi le statut de mes factures et paiements en attente.',
    roles: ['client'],
  },
  {
    label: 'Mon coffre-fort',
    icon: FolderLock,
    message: 'Comment accéder à mon coffre-fort et quels documents dois-je y déposer ?',
    roles: ['client'],
  },
  {
    label: 'Parler à mon CPA',
    icon: MessageSquare,
    message: 'Je veux envoyer un message à mon comptable. Comment faire ?',
    roles: ['client'],
  },
  {
    label: 'Mes taxes',
    icon: TrendingUp,
    message: 'Explique-moi mes obligations fiscales actuelles (TPS/TVQ) selon ma province.',
    roles: ['client'],
  },
  {
    label: 'Aide-moi',
    icon: HelpCircle,
    message: 'Quelles sont les fonctionnalités disponibles dans mon portail client ?',
    roles: ['client', 'sub_admin', 'super_admin'],
  },
  {
    label: 'Mes clients',
    icon: FileText,
    message: 'Donne-moi un aperçu de mes clients actifs et des dossiers en cours.',
    roles: ['sub_admin'],
  },
  {
    label: 'Tableau de bord',
    icon: BarChart2,
    message: 'Résume les métriques clés du réseau ComptaFlow pour moi.',
    roles: ['super_admin'],
  },
];

interface JarvisQuickActionsProps {
  role?: string;
  onSelect: (message: string) => void;
  disabled?: boolean;
}

export function JarvisQuickActions({ role = 'client', onSelect, disabled }: JarvisQuickActionsProps) {
  const filtered = QUICK_ACTIONS.filter((a) => a.roles.includes(role));

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none px-4 py-2">
      {filtered.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(action.message)}
            className="flex items-center gap-1.5 whitespace-nowrap px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider border border-gold/20 bg-gold/5 text-gold/80 hover:bg-gold/15 hover:border-gold/40 transition-all shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Icon size={11} />
            {action.label}
          </button>
        );
      })}
    </div>
  );
}
