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
  bookkeeping: boolean;
  payroll: boolean;
  taxes: boolean;
  rentabilite: boolean;
  consultation: boolean;
}

export interface UserData {
  displayName: string;
  companyName: string;
  email: string;
  neq?: string;
  nas?: string;
  incomeBracket: string;
  employeeCount: number | string;
  needs: UserNeeds;
  isAdmin?: boolean;
  createdAt?: number;
  activeMode?: AppMode;
  initialProfileType?: 'personal' | 'business';
  province?: string;
  language: 'fr' | 'en' | 'ar';
}

export interface ClientRecord {
  id: string;
  displayName: string;
  companyName: string;
  status: string;
  documents: number;
  lastActive: string;
  email?: string;
}

export type DocumentCategory = 'fiscal' | 'payroll' | 'bank' | 'deliverable' | 'internal' | 'general';
export type DocumentSource = 'client' | 'admin';

export interface Document {
  id: string;
  fileName: string;
  fileSize: string;
  uploadDate: number;
  status: 'secure' | 'processing';
  url?: string;
  category: DocumentCategory;
  source: DocumentSource;
  userId: string;
}

export interface Message {
  id: string;
  sender: 'client' | 'cpa' | 'system';
  text: string;
  timestamp: string;
  clientName?: string;
}
