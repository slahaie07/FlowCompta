export type AppMode = 'personal' | 'business';
export type AppState = 'login' | 'onboarding' | 'success' | 'dashboard';
export type DashboardTab = 'overview' | 'transactions' | 'invoices' | 'messaging' | 'vault' | 'integrations' | 'support' | 'pricing' | 'faq' | 'admin_overview' | 'admin_clients';

export interface Invoice {
  id: string;
  number: string;
  clientName: string;
  amount: number;
  date: number;
  dueDate: number;
  status: 'paid' | 'pending' | 'overdue' | 'draft';
  userId: string;
  items: { description: string; quantity: number; price: number }[];
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
  t1: boolean;
  ta: boolean;
  t2: boolean;
  bookkeeping: boolean;
  stocks: boolean;
  cfo: boolean;
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
}
