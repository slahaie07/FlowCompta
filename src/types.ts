export type AppMode = 'personal' | 'business';
export type AppState = 'login' | 'onboarding' | 'success' | 'dashboard';
export type PortalRole = 'client' | 'sub_admin' | 'super_admin';
export type DashboardTab =
  | 'overview'
  | 'services'
  | 'transactions'
  | 'invoices'
  | 'messaging'
  | 'vault'
  | 'support'
  | 'faq'
  | 'admin_overview'
  | 'admin_clients'
  | 'interac_settings'
  | 'super_overview'
  | 'super_subadmins'
  | 'super_clients'
  | 'super_invoices';

export interface Invoice {
  id: string;
  number: string;
  clientName: string;
  clientEmail?: string;
  amount: number;
  date: number;
  dueDate: number;
  status: 'paid' | 'pending' | 'overdue' | 'draft' | 'cancelled';
  userId: string;
  subAdminId?: string;
  items: { description: string; quantity: number; price: number }[];
  // Taxes Canada (TPS / TVH / TVQ / TVP)
  montantHt?: number;
  tps?: number;
  tvq?: number;
  tvh?: number;
  montantTotal?: number;
  // Flux Interac
  clientADeclarePaye?: boolean;
  interacReference?: string;
  datePaiement?: string | null;
}

export interface Transaction {
  id: string;
  type: 'sale' | 'purchase';
  amount: number;
  taxes?: { tps: number; tvq?: number; tvh?: number };
  description: string;
  date: number;
  status: 'pending' | 'reconciled' | 'error' | 'quarantine';
  aiConfidence?: number;
  category: string;
  userId: string;
  documentUrl?: string;
  documentId?: string;
  context: AppMode;
}

export interface NewsUpdate {
  id: string;
  title: string;
  content: string;
  date: number;
  type: 'feature' | 'tax' | 'legal';
}

export interface UserNeeds {
  hourlyBookkeeping: boolean;
  monthlyMicro: boolean;
  monthlySmall: boolean;
  monthlySme: boolean;
  gstQst: boolean;
  payroll: boolean;
  t4Releve1: boolean;
  catchUp: boolean;
  softwareSetup: boolean;
  taxHelpAutonomous: boolean;
}

export interface UserData {
  id?: string;
  fullName?: string;
  displayName?: string;
  companyName?: string;
  email: string;
  role?: 'super_admin' | 'sub_admin' | 'client';
  subAdminId?: string;
  interacEmail?: string;
  interacQuestion?: string;
  interacAutodepot?: boolean;
  neq?: string;
  nas?: string;
  incomeBracket?: string;
  employeeCount?: number | string;
  needs?: UserNeeds | string[] | any;
  selectedServiceId?: string;
  isAdmin?: boolean;
  createdAt?: number;
  activeMode?: AppMode;
  initialProfileType?: 'personal' | 'business';
  province?: string;
  language?: 'fr' | 'en' | 'ar';
}

export interface ClientRecord {
  id: string;
  displayName: string;
  companyName: string;
  status: string;
  documents: number;
  lastActive: string;
  email?: string;
  province?: string;
  needs?: any;
}

export type DocumentCategory = 'fiscal' | 'payroll' | 'bank' | 'deliverable' | 'internal' | 'general' | 'tax' | 'legal';
export type DocumentSource = 'client' | 'admin';

export interface Document {
  id: string;
  fileName: string;
  fileSize: string;
  uploadDate: number;
  status: 'secure' | 'processing' | 'error';
  url?: string;
  category: DocumentCategory;
  source: DocumentSource;
  userId: string;
  metadata?: {
    type?: string;
    amount?: number;
    date?: string;
    emetteur?: string;
    description?: string;
    montant_total?: number;
    categorie_depense?: string;
    tps?: number;
    tvq?: number;
  };
}

export interface Message {
  id: string;
  sender: 'client' | 'cpa' | 'system';
  text: string;
  timestamp: string;
  clientName?: string;
  createdAt?: number;
}
