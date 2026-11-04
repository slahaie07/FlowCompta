import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Receipt, FolderOpen, BarChart3, Calendar as CalendarIcon, 
  MessageSquare, Tags, Calculator, StickyNote as StickyIcon, Lock, Settings as SettingsIcon,
  Bell, Plus, Search, Trash2, LockOpen, Key, Check, CheckCircle2, 
  AlertTriangle, TrendingUp, LogOut, Send, Eye, Edit3, Filter, Shield, 
  DollarSign, ChevronRight, Download, RefreshCw, X, FileText, LockKeyhole
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ClientRecord } from '../../types';
import { toast } from 'sonner';
import { useLanguage } from '../../hooks/useLanguage';

interface SubAdminPortalShellProps {
  userData: any;
  onLogout: () => void;
  currentMode: string;
  onToggleMode: () => void;
  onRefreshProfile?: () => void;
  routeContext: {
    adminClients: ClientRecord[];
    addClient: (newClient: Omit<ClientRecord, 'id' | 'documents' | 'lastActive'>) => Promise<boolean>;
  };
}

interface StickyNoteItem {
  id: string;
  text: string;
  color: 'yellow' | 'green' | 'pink' | 'blue';
  createdAt: string;
}

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  period: 'mois' | 'unique' | 'an';
  category: string;
}

export function SubAdminPortalShell({
  userData,
  onLogout,
  routeContext
}: SubAdminPortalShellProps) {
  const { t } = useLanguage();
  const { adminClients, addClient } = routeContext;

  // Active Tab state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Date
  const [dateStr, setDateStr] = useState<string>('');

  // Notifications state — vide au départ : aucune notification fictive
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Clients tab state
  const [clientSearch, setClientSearch] = useState('');
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientCompany, setNewClientCompany] = useState('');
  const [newClientProvince, setNewClientProvince] = useState('QC');
  const [newClientStatus, setNewClientStatus] = useState('Actif');
  const [isSavingClient, setIsSavingClient] = useState(false);

  // Sticky notes state
  const [notes, setNotes] = useState<StickyNoteItem[]>([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteColor, setNewNoteColor] = useState<'yellow' | 'green' | 'pink' | 'blue'>('yellow');

  // Tax rates from DB
  const [taxRates, setTaxRates] = useState<any[]>([]);

  // DB client files (services)
  const [dbServices, setDbServices] = useState<any[]>([]);

  // Helper for services display label
  const getServiceLabel = (type: string) => {
    switch (type) {
      case 'monthly_bookkeeping': return 'Forfaits Mensuels';
      case 'student_tax': return "L'Étudiant";
      case 'catchup_bookkeeping': return 'Le Rattrapage';
      case 'setup_onboarding': return 'Le Setup Onboarding';
      case 'personal_tax': return 'Impôts Personnels';
      case 'autonomous_tax': return 'Travailleurs Autonomes';
      case 'corporate_tax': return 'Impôts de Sociétés';
      default: return type;
    }
  };

  // Vault state
  const [vaultPassword, setVaultPassword] = useState('');
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [vaultAttempts, setVaultAttempts] = useState(0);

  // Services catalog state
  const [services, setServices] = useState<ServiceItem[]>([
    { id: '1', name: 'Forfaits Mensuels', description: 'Tenue de livres mensuelle complète, dépôt de pièces par photo ou courriel et support régulier. Grille selon le volume de transactions : Micro 149,99 $ (0-30), Essentiel 249,99 $ (31-75), 349,99 $ (76-150), Croissance 449,99 $ (151-200), 599,99 $ (201-300), 799,99 $ (301-450), 999,99 $ (451+).', price: 249.99, period: 'mois', category: 'Tenue de livres' },
    { id: '2', name: 'L\'Étudiant', description: 'Déclaration d\'impôt simplifiée pour étudiants admissibles.', price: 49.99, period: 'unique', category: 'Impôts' },
    { id: '3', name: 'Le Rattrapage', description: 'Mise à jour de tenue de livres en retard, tarif par mois rétroactif : 75 $ (1-6 mois), 65 $ (7-12 mois), 60 $ (13 mois et plus, minimum 900 $).', price: 75, period: 'mois', category: 'Tenue de livres' },
    { id: '4', name: 'Le Setup Onboarding', description: 'Configuration initiale du dossier client, des outils comptables et du raccordement bancaire.', price: 199, period: 'unique', category: 'Configuration' },
    { id: '5', name: 'Impôts Personnels', description: 'Déclaration de revenus personnelle standard avec crédits canadiens.', price: 89.99, period: 'unique', category: 'Impôts' },
    { id: '6', name: 'Corporations (T2/CO-17)', description: 'Fin d\'année et production complète des déclarations fiscales d\'entreprises provinciales et fédérales : 1 199 $ si les livres sont tenus par Compta-Flow, 1 499 $ sinon (états financiers inclus).', price: 1199, period: 'unique', category: 'Impôts Corp' },
  ]);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);

  // Finance Tools Calculator state
  const [calcAmount, setCalcAmount] = useState<number>(100);
  const [calcProvince, setCalcProvince] = useState<string>('QC');
  const [marginCost, setMarginCost] = useState<number>(50);
  const [marginPrice, setMarginPrice] = useState<number>(100);

  // Team Chat state
  const [activeChatMember, setActiveChatMember] = useState<string>('Samuel Lahaie');
  const [chatMessages, setChatMessages] = useState<Record<string, Array<{ sender: string; text: string; time: string }>>>({
    'Samuel Lahaie': [],
    'Simon Gagné': [],
    'Sylvie Charette': []
  });
  const [newChatMessage, setNewChatMessage] = useState('');

  // Settings state
  const [themeColor, setThemeColor] = useState<'emerald' | 'gold' | 'sapphire'>('gold');
  const [newPassword, setNewPassword] = useState('');
  const [employeePermissions, setEmployeePermissions] = useState({
    simon: { read: true, write: true, delete: false },
    sylvie: { read: true, write: true, delete: false }
  });

  // Load live data from Supabase
  const loadLiveData = async () => {
    if (!userData?.id) return;

    // 1. Fetch quick notes from DB
    try {
      const { data, error } = await supabase
        .from('quick_notes')
        .select('*')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        setNotes(data.map(note => ({
          id: note.id,
          text: note.text,
          color: (note.color || 'yellow') as 'yellow' | 'green' | 'pink' | 'blue',
          createdAt: note.created_at || new Date().toISOString()
        })));
      }
    } catch (e) {
      console.warn("Quick notes load failed, using local fallback.", e);
    }

    // 2. Fetch tax rates from DB
    try {
      const { data, error } = await supabase
        .from('tax_rates')
        .select('*');
      if (!error && data) {
        setTaxRates(data);
      }
    } catch (e) {
      console.warn("Tax rates load failed, using fallback static rates.", e);
    }

    // 3. Fetch client services queue from DB
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*, client:client_id(full_name, display_name, company_name, email, metadata)')
        .eq('sub_admin_id', userData.id)
        .order('created_at', { ascending: false });
      if (!error && data) {
        setDbServices(data);
      }
    } catch (e) {
      console.warn("Services load failed, using mock queue.", e);
    }
  };

  // Load Date, Weather, and Notes
  useEffect(() => {
    // Local date formatted in French
    const date = new Intl.DateTimeFormat('fr-CA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date());
    setDateStr(date.charAt(0).toUpperCase() + date.slice(1));

    // Load Sticky Notes from LocalStorage — aucune note fictive au départ
    const savedNotes = localStorage.getItem(`comptaflow_notes_${userData?.id || 'default'}`);
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }

    loadLiveData();
  }, [userData?.id]);

  // Sidebar item configuration
  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'clients', label: 'Clients et Dossiers', icon: Users },
    { id: 'transactions', label: 'Suivi des Transactions', icon: Receipt },
    { id: 'documents', label: 'Documents et Formulaires', icon: FolderOpen },
    { id: 'analysis', label: 'Outils d\'Analyse', icon: BarChart3 },
    { id: 'calendar', label: 'Calendrier', icon: CalendarIcon },
    { id: 'messaging', label: 'Messagerie d\'équipe', icon: MessageSquare },
    { id: 'services', label: 'Tarifs et Services', icon: Tags },
    { id: 'calculators', label: 'Outils Financiers', icon: Calculator },
    { id: 'notes', label: 'Notes Rapides', icon: StickyIcon },
    { id: 'vault', label: 'Coffre-fort', icon: Lock },
    { id: 'settings', label: 'Paramètres', icon: SettingsIcon },
  ];

  // Colors theme classes mapping
  const colorThemes = {
    gold: {
      accent: 'text-gold',
      bgAccent: 'bg-gold',
      borderAccent: 'border-gold',
      gradient: 'premium-gradient-gold',
      hoverBg: 'hover:bg-gold/10',
      activeTab: 'bg-gradient-to-r from-gold/20 to-transparent text-gold border-l-2 border-gold',
      textGlow: 'drop-shadow-[0_0_8px_rgba(212,175,55,0.3)]',
      glassHover: 'hover:border-gold/30 hover:shadow-[0_0_20px_rgba(198,161,91,0.15)]'
    },
    emerald: {
      accent: 'text-emerald-400',
      bgAccent: 'bg-emerald-500',
      borderAccent: 'border-emerald-500',
      gradient: 'bg-gradient-to-tr from-emerald-500 to-teal-400',
      hoverBg: 'hover:bg-emerald-500/10',
      activeTab: 'bg-gradient-to-r from-emerald-500/20 to-transparent text-emerald-400 border-l-2 border-emerald-500',
      textGlow: 'drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]',
      glassHover: 'hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]'
    },
    sapphire: {
      accent: 'text-sky-400',
      bgAccent: 'bg-sky-500',
      borderAccent: 'border-sky-500',
      gradient: 'bg-gradient-to-tr from-sky-500 to-cyan-400',
      hoverBg: 'hover:bg-sky-500/10',
      activeTab: 'bg-gradient-to-r from-sky-500/20 to-transparent text-sky-400 border-l-2 border-sky-500',
      textGlow: 'drop-shadow-[0_0_8px_rgba(56,189,248,0.3)]',
      glassHover: 'hover:border-sky-500/30 hover:shadow-[0_0_20px_rgba(56,189,248,0.15)]'
    }
  };

  const activeTheme = colorThemes[themeColor];

  // Actions
  const handleAddClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newClientEmail) {
      toast.error('Veuillez remplir le nom et le courriel.');
      return;
    }
    setIsSavingClient(true);
    try {
      const success = await addClient({
        displayName: newClientName,
        email: newClientEmail,
        companyName: newClientCompany || 'Particulier',
        status: newClientStatus,
        province: newClientProvince,
        needs: []
      });

      if (success) {
        setNewClientName('');
        setNewClientEmail('');
        setNewClientCompany('');
        setNewClientProvince('QC');
        setNewClientStatus('Actif');
        setShowAddClientModal(false);
      }
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la création du client.');
    } finally {
      setIsSavingClient(false);
    }
  };

  // Sticky notes actions
  const saveNotes = (updatedNotes: StickyNoteItem[]) => {
    setNotes(updatedNotes);
    localStorage.setItem(`comptaflow_notes_${userData?.id || 'default'}`, JSON.stringify(updatedNotes));
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !userData?.id) return;

    const localId = Date.now().toString();
    const newNote: StickyNoteItem = {
      id: localId,
      text: newNoteText,
      color: newNoteColor,
      createdAt: new Date().toISOString()
    };

    const updated = [newNote, ...notes];
    setNotes(updated);
    localStorage.setItem(`comptaflow_notes_${userData.id}`, JSON.stringify(updated));
    setNewNoteText('');

    try {
      const { data, error } = await supabase
        .from('quick_notes')
        .insert({
          user_id: userData.id,
          text: newNoteText,
          color: newNoteColor
        })
        .select();
      if (error) throw error;
      if (data && data[0]) {
        setNotes(prev => prev.map(n => n.id === localId ? {
          id: data[0].id,
          text: data[0].text,
          color: data[0].color,
          createdAt: data[0].created_at || new Date().toISOString()
        } : n));
      }
      toast.success('Note ajoutée !');
    } catch (err) {
      console.warn("Failed to insert note to DB, saved to localStorage.", err);
      toast.warning("Mode hors-ligne : Note enregistrée localement.");
    }
  };

  const handleDeleteNote = async (id: string) => {
    const filtered = notes.filter(n => n.id !== id);
    setNotes(filtered);
    if (userData?.id) {
      localStorage.setItem(`comptaflow_notes_${userData.id}`, JSON.stringify(filtered));
    }

    try {
      if (id.includes('-')) {
        const { error } = await supabase
          .from('quick_notes')
          .delete()
          .eq('id', id);
        if (error) throw error;
      }
      toast.success('Note supprimée.');
    } catch (err) {
      console.warn("Failed to delete note from DB.", err);
      toast.success('Note supprimée localement.');
    }
  };

  // Vault unlocking action
  const handleUnlockVault = (e: React.FormEvent) => {
    e.preventDefault();
    if (vaultPassword === (import.meta.env.VITE_VAULT_UNLOCK_CODE as string) /* Verrou d'écran seulement — la vraie barrière est l'authentification Supabase + RLS. Code défini dans Vercel (VITE_VAULT_UNLOCK_CODE), jamais dans le code. */) {
      setIsVaultUnlocked(true);
      toast.success('Accès autorisé au Coffre-fort.');
      setVaultPassword('');
    } else {
      setVaultAttempts(prev => prev + 1);
      toast.error('Mot de passe incorrect.');
      if (vaultAttempts >= 2) {
        toast.warning('Alerte de sécurité : Tentatives d\'intrusion journalisées.');
      }
    }
  };

  // Pricing Editor Actions
  const handleEditPrice = (serviceId: string, currentPrice: number) => {
    setEditingServiceId(serviceId);
    setEditPrice(currentPrice);
  };

  const handleSavePrice = (serviceId: string) => {
    setServices(prev => prev.map(s => s.id === serviceId ? { ...s, price: editPrice } : s));
    setEditingServiceId(null);
    toast.success('Tarif mis à jour avec succès.');
  };

  // Chat send message
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatMessage.trim()) return;

    const messages = chatMessages[activeChatMember] || [];
    const updatedMessages = [
      ...messages,
      { sender: 'Cabinet', text: newChatMessage, time: new Date().toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' }) }
    ];

    setChatMessages({
      ...chatMessages,
      [activeChatMember]: updatedMessages
    });

    setNewChatMessage('');
    // Aucune réponse automatique simulée : les messages restent tels qu'écrits.
  };

  // Calculators helper
  const calculateTaxes = () => {
    const rateObj = taxRates.find(r => r.province_code === calcProvince);
    let gst = 0.05;
    let pst = 0.00;
    let hst = 0.00;
    
    if (rateObj) {
      gst = Number(rateObj.gst_rate);
      pst = Number(rateObj.pst_qst_rate);
      hst = Number(rateObj.hst_rate);
    } else {
      if (calcProvince === 'QC') {
        gst = 0.05;
        pst = 0.09975;
      } else if (calcProvince === 'ON') {
        gst = 0.00;
        pst = 0.00;
        hst = 0.13;
      } else if (calcProvince === 'BC') {
        gst = 0.05;
        pst = 0.07;
      } else {
        gst = 0.05;
      }
    }
    
    let tps = 0;
    let tvq = 0;
    
    if (hst > 0) {
      tps = calcAmount * hst;
    } else {
      tps = calcAmount * gst;
      tvq = calcAmount * pst;
    }
    
    const total = calcAmount + tps + tvq;
    return { tps, tvq, total, hstActive: hst > 0 };
  };

  const calcTaxesResults = calculateTaxes();

  const calculateMargin = () => {
    const profit = marginPrice - marginCost;
    const margin = marginPrice > 0 ? (profit / marginPrice) * 100 : 0;
    const markup = marginCost > 0 ? (profit / marginCost) * 100 : 0;
    return { profit, margin, markup };
  };

  const calcMarginResults = calculateMargin();

  return (
    <div className="min-h-screen flex bg-noir text-ivoire font-sans relative overflow-hidden w-full">
      {/* 🌌 Animated Background Aurora */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-15%] left-[-15%] w-[45%] h-[45%] bg-gold/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-15%] right-[-15%] w-[45%] h-[45%] bg-gold/5 rounded-full blur-[140px]" />
      </div>

      {/* 🧭 SIDEBAR - MENU LATÉRAL */}
      <nav className="w-80 h-screen bg-[#060606] border-r border-white/5 hidden lg:flex flex-col z-30 shrink-0 select-none">
        {/* Brand Header */}
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-4 text-left">
            <div className={`w-10 h-10 rounded-xl ${activeTheme.gradient} flex items-center justify-center shadow-lg`}>
              <Shield size={20} className="text-noir" />
            </div>
            <div>
              <span className={`font-serif font-bold ${activeTheme.accent} tracking-[0.1em] italic text-2xl animated-gradient-text block leading-none`}>
                CF
              </span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black mt-1 block">
                Compta-Flow
              </span>
            </div>
          </div>
        </div>

        {/* Profile badge & Role */}
        <div className="px-8 mb-6">
          <div className="p-3 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg ${activeTheme.gradient} text-noir font-serif font-bold flex items-center justify-center text-sm`}>
              {userData?.fullName?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black truncate">{userData?.fullName || 'Administrateur'}</p>
              <span className="text-[9px] uppercase tracking-wider text-gold font-bold">Équipe Compta-Flow</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.id !== 'vault') setIsVaultUnlocked(false);
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-300 group relative focus:outline-none ${
                  isActive ? activeTheme.activeTab : 'text-slate-400 hover:text-ivoire hover:bg-white/5'
                }`}
              >
                <Icon size={18} className={isActive ? activeTheme.accent : 'text-slate-500 group-hover:text-gold transition-colors'} />
                <span className="text-xs font-bold uppercase tracking-wider">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer Logout */}
        <div className="p-6 border-t border-white/5 bg-black/20">
          <button
            onClick={onLogout}
            type="button"
            className="w-full flex items-center justify-center gap-2 py-3 border border-red-500/20 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-xs font-bold uppercase tracking-wider"
          >
            <LogOut size={14} /> Déconnexion
          </button>
        </div>
      </nav>

      {/* 🖥️ MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10 w-full">
        
        {/* 📋 HEADER - BARRE D'EN-TÊTE */}
        <header className="h-20 bg-noir/50 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 md:px-10 shrink-0">
          
          {/* Header Left: Greeting */}
          <div className="flex flex-col">
            <h1 className="text-xl font-serif font-bold text-ivoire">
              Bonjour, <span className={`${activeTheme.accent} ${activeTheme.textGlow}`}>{userData?.fullName || 'Administrateur'}</span>
            </h1>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Tenue de livres et impôts — 100 % en ligne</p>
          </div>

          {/* Header Right: Date, Notifications */}
          <div className="flex items-center gap-6">
            
            {/* Date Widget */}
            <div className="hidden sm:flex items-center gap-4 px-4 py-2 bg-white/5 border border-white/5 rounded-2xl text-xs font-medium">
              <span className="text-slate-400">{dateStr}</span>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-3 bg-white/5 border border-white/5 rounded-xl hover:border-gold/30 hover:bg-white/10 transition-all relative group focus:outline-none"
              >
                <Bell size={18} className="text-slate-400 group-hover:text-gold transition-colors" />
                {notifications.some(n => n.unread) && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 glass-card rounded-2xl z-50 p-4 border border-white/10 shadow-2xl">
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/5">
                    <h3 className="text-xs font-black uppercase tracking-wider">Alertes Production</h3>
                    <button 
                      onClick={() => setNotifications(prev => prev.map(n => ({ ...n, unread: false })))}
                      className="text-[10px] text-gold hover:underline"
                    >
                      Tout lire
                    </button>
                  </div>
                  <div className="space-y-3">
                    {notifications.length === 0 && (
                      <p className="text-[11px] text-slate-500 text-center py-3">Aucune notification pour le moment.</p>
                    )}
                    {notifications.map(n => (
                      <div key={n.id} className={`p-2.5 rounded-xl transition-colors ${n.unread ? 'bg-gold/10' : 'bg-white/5'}`}>
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-bold text-ivoire">{n.title}</span>
                          <span className="text-[9px] text-slate-500">{n.time}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 leading-normal">{n.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Navigation mobile (barre d'onglets horizontale) */}
        <div className="lg:hidden bg-[#0a0a0a] border-b border-white/5 px-3 py-2 flex gap-2 overflow-x-auto custom-scrollbar shrink-0">
          {menuItems.map((item) => {
            const IconComp = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.id !== 'vault') setIsVaultUnlocked(false);
                }}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-colors min-h-[44px] ${
                  isActive ? 'bg-gold/15 text-gold border border-gold/30' : 'bg-white/5 text-slate-400 border border-transparent'
                }`}
              >
                <IconComp size={14} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* 📦 CONTENT ZONE */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          
          {/* ============================================================
              1. TABLEAU DE BORD (DASHBOARD)
             ============================================================ */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Overview Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-black tracking-wider">Dossiers en file</p>
                      <h3 className="text-2xl font-bold mt-2 font-serif text-ivoire">{dbServices.length}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                      <TrendingUp size={20} />
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-4">
                    Services assignés à traiter
                  </p>
                </div>

                <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-black tracking-wider">Clients du cabinet</p>
                      <h3 className="text-2xl font-bold mt-2 font-serif text-ivoire">{adminClients.length} Actifs</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                      <Users size={20} />
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-4">
                    Dossiers clients suivis dans cet espace
                  </p>
                </div>

                <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-black tracking-wider">Dossiers terminés</p>
                      <h3 className="text-2xl font-bold mt-2 font-serif text-ivoire">{dbServices.filter(s => s.status === 'Terminé').length}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                      <CheckCircle2 size={20} />
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-4">
                    Dans la file de production
                  </p>
                </div>

                <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-black tracking-wider">Dossiers en suspens</p>
                      <h3 className="text-2xl font-bold mt-2 font-serif text-ivoire">{dbServices.filter(s => s.status === 'En suspens').length}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                      <AlertTriangle size={20} />
                    </div>
                  </div>
                  <p className="text-xs text-amber-400 mt-4">
                    À relancer en priorité
                  </p>
                </div>

              </div>

              {/* Co-Pilot Production Queue Widget */}
              <div className="glass-card p-8 rounded-3xl border border-white/5">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-lg font-serif font-bold text-ivoire flex items-center gap-2">
                      <TrendingUp size={20} className="text-gold" /> File d'attente de production Co-Pilote
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Classification des priorités et statuts par service client</p>
                  </div>
                  
                  {/* Status Indicator filter */}
                  <div className="flex gap-2">
                    {['tous', 'En traitement', 'Prêt à traiter', 'En suspens'].map((filt) => (
                      <button
                        key={filt}
                        type="button"
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors"
                      >
                        {filt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  {dbServices.length > 0 ? (
                    dbServices.map((service) => {
                      const clientName = service.client?.full_name || service.client?.display_name || 'Client sans nom';
                      const company = service.client?.company_name || 'Particulier';
                      const province = service.client?.metadata?.province || 'QC';
                      const serviceLabel = getServiceLabel(service.service_type);
                      const status = service.status;
                      
                      let actionText = 'Traiter';
                      if (status === 'Terminé') actionText = 'Dossier Terminé';
                      else if (service.service_type === 'student_tax') actionText = 'Télécharger';
                      else if (service.service_type === 'catchup_bookkeeping') actionText = 'Reconcilier';
                      
                      return (
                        <div key={service.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-gold/20 transition-all">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-ivoire">{clientName}</span>
                              <span className="text-[10px] px-2 py-0.5 border border-gold/30 text-gold rounded-full uppercase tracking-wider font-semibold">
                                {serviceLabel}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                              {company} • {province} • Statut: {status}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                            <div className="text-right">
                              <span className="text-[10px] text-emerald-400 font-bold block">✓ Actif</span>
                              <span className="text-xs font-serif text-slate-400">Créé le {new Date(service.created_at).toLocaleDateString('fr-CA')}</span>
                            </div>
                            <button
                              onClick={() => {
                                toast.success(`Traitement initié pour le dossier de ${clientName}`);
                              }}
                              type="button"
                              className="px-4 py-2 bg-gold text-noir text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-gold-light transition-colors"
                            >
                              {actionText}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 bg-white/5 border border-white/5 rounded-2xl text-center">
                      <p className="text-sm font-bold text-ivoire">Aucun dossier en file pour le moment</p>
                      <p className="text-xs text-slate-500 mt-1">Les services assignés à votre compte apparaîtront ici, prêts à traiter.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* ============================================================
              2. CLIENTS ET DOSSIERS (CLIENTS)
             ============================================================ */}
          {activeTab === 'clients' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Clients Header Control */}
              <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    type="text"
                    placeholder="Rechercher un client..."
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-xs focus-visible:ring-1 focus-visible:ring-gold outline-none transition-all placeholder:text-slate-600 font-bold"
                  />
                </div>
                
                <button
                  type="button"
                  onClick={() => setShowAddClientModal(true)}
                  className="flex items-center gap-2 px-5 py-3 bg-gold text-noir text-xs font-black uppercase tracking-wider rounded-2xl hover:bg-gold-light transition-all shadow-lg"
                >
                  <Plus size={16} /> Ajouter un client
                </button>
              </div>

              {/* Clients Table */}
              <div className="glass-card rounded-3xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/2">
                        <th className="p-5 text-xs text-slate-500 uppercase font-black tracking-wider">Client / Entreprise</th>
                        <th className="p-5 text-xs text-slate-500 uppercase font-black tracking-wider">Courriel</th>
                        <th className="p-5 text-xs text-slate-500 uppercase font-black tracking-wider">Région</th>
                        <th className="p-5 text-xs text-slate-500 uppercase font-black tracking-wider">Statut</th>
                        <th className="p-5 text-xs text-slate-500 uppercase font-black tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {adminClients.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-xs text-slate-500 font-semibold">Aucun dossier client pour le moment. Ajoutez votre premier client avec le bouton ci-dessus.</td>
                        </tr>
                      )}
                      {adminClients
                        .filter(c => c.displayName.toLowerCase().includes(clientSearch.toLowerCase()) || (c.companyName || '').toLowerCase().includes(clientSearch.toLowerCase()))
                        .map(client => (
                          <tr key={client.id} className="hover:bg-white/1 transition-colors">
                            <td className="p-5">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center text-gold font-bold">
                                  {client.displayName.charAt(0)}
                                </div>
                                <div>
                                  <span className="text-sm font-bold text-ivoire block">{client.displayName}</span>
                                  <span className="text-[10px] text-slate-500 block">{client.companyName || 'Particulier'}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-5 text-xs text-slate-400 font-semibold">{client.email}</td>
                            <td className="p-5 text-xs text-slate-400 font-semibold">{client.province || 'QC'}</td>
                            <td className="p-5">
                              <span className={`inline-flex px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full border ${
                                client.status === 'Actif' || client.status === 'active'
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                              }`}>
                                {client.status}
                              </span>
                            </td>
                            <td className="p-5 text-right">
                              <div className="flex gap-2 justify-end">
                                <button type="button" className="p-2 hover:bg-white/5 text-slate-400 hover:text-gold rounded-lg transition-colors">
                                  <Eye size={16} />
                                </button>
                                <button type="button" className="p-2 hover:bg-white/5 text-slate-400 hover:text-gold rounded-lg transition-colors">
                                  <FolderOpen size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Add Client Modal */}
              {showAddClientModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                  <div className="glass-card w-full max-w-md p-8 rounded-3xl border border-white/10 relative">
                    <button
                      type="button"
                      onClick={() => setShowAddClientModal(false)}
                      className="absolute top-6 right-6 text-slate-400 hover:text-ivoire transition-colors"
                    >
                      <X size={20} />
                    </button>
                    <h3 className="text-lg font-serif font-bold mb-6 text-ivoire">Nouveau Dossier Client</h3>
                    
                    <form onSubmit={handleAddClientSubmit} className="space-y-4">
                      <div>
                        <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider block mb-2">Nom Complet</label>
                        <input
                          type="text"
                          required
                          value={newClientName}
                          onChange={(e) => setNewClientName(e.target.value)}
                          className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs outline-none focus:border-gold transition-colors text-ivoire font-bold"
                          placeholder="ex : Nom complet du client"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider block mb-2">Courriel</label>
                        <input
                          type="email"
                          required
                          value={newClientEmail}
                          onChange={(e) => setNewClientEmail(e.target.value)}
                          className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs outline-none focus:border-gold transition-colors text-ivoire font-bold"
                          placeholder="ex : client@exemple.ca"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider block mb-2">Entreprise (Optionnel)</label>
                        <input
                          type="text"
                          value={newClientCompany}
                          onChange={(e) => setNewClientCompany(e.target.value)}
                          className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs outline-none focus:border-gold transition-colors text-ivoire font-bold"
                          placeholder="ex : Nom de l'entreprise"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider block mb-2">Province</label>
                          <select
                            value={newClientProvince}
                            onChange={(e) => setNewClientProvince(e.target.value)}
                            className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3 text-xs outline-none focus:border-gold transition-colors text-ivoire font-bold"
                          >
                            <option value="QC">Québec (QC)</option>
                            <option value="ON">Ontario (ON)</option>
                            <option value="BC">Colombie-Britannique (BC)</option>
                            <option value="AB">Alberta (AB)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider block mb-2">Statut Initial</label>
                          <select
                            value={newClientStatus}
                            onChange={(e) => setNewClientStatus(e.target.value)}
                            className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3 text-xs outline-none focus:border-gold transition-colors text-ivoire font-bold"
                          >
                            <option value="Actif">Actif</option>
                            <option value="En attente">En attente</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSavingClient}
                        className="w-full mt-4 py-3 bg-gold text-noir text-xs font-black uppercase tracking-widest rounded-xl hover:bg-gold-light transition-colors flex items-center justify-center"
                      >
                        {isSavingClient ? 'Enregistrement...' : 'Enregistrer le Dossier'}
                      </button>
                    </form>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ============================================================
              3. SUIVI DES TRANSACTIONS
             ============================================================ */}
          {activeTab === 'transactions' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-serif font-bold text-ivoire">Suivi des Transactions</h2>
                  <p className="text-xs text-slate-500 mt-1">Virements Interac, dépôts et factures des dossiers du cabinet</p>
                </div>
              </div>

              {/* Transactions List */}
              <div className="glass-card rounded-3xl overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/2">
                      <th className="p-5 text-xs text-slate-500 uppercase font-black tracking-wider">Date</th>
                      <th className="p-5 text-xs text-slate-500 uppercase font-black tracking-wider">Description / Client</th>
                      <th className="p-5 text-xs text-slate-500 uppercase font-black tracking-wider">Flux</th>
                      <th className="p-5 text-xs text-slate-500 uppercase font-black tracking-wider">Montant</th>
                      <th className="p-5 text-xs text-slate-500 uppercase font-black tracking-wider">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500 font-semibold">Aucune transaction à afficher pour le moment. Les dépôts et factures de vos dossiers apparaîtront ici.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================
              4. DOCUMENTS ET FORMULAIRES
             ============================================================ */}
          {activeTab === 'documents' && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h2 className="text-xl font-serif font-bold text-ivoire">Documents et Formulaires</h2>
                <p className="text-xs text-slate-500 mt-1">Explorateur sécurisé des dossiers fiscaux et des contrats clients</p>
              </div>

              {/* Folders tree interface */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Bookkeeping folder */}
                <div className="glass-card p-6 rounded-2xl hover:border-gold/30 cursor-pointer group">
                  <div className="flex justify-between items-start">
                    <FolderOpen size={40} className="text-gold" />
                    <span className="text-[10px] text-slate-500 font-bold">Par client</span>
                  </div>
                  <h3 className="text-sm font-bold text-ivoire mt-4">Tenue de Livres Mensuelle</h3>
                  <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">Dossier : Pièces et relevés</p>
                  <div className="border-t border-white/5 mt-4 pt-4 flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-medium">Dossiers clients</span>
                    <ChevronRight size={14} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Tax Folders */}
                <div className="glass-card p-6 rounded-2xl hover:border-gold/30 cursor-pointer group">
                  <div className="flex justify-between items-start">
                    <FolderOpen size={40} className="text-gold" />
                    <span className="text-[10px] text-slate-500 font-bold">Par exercice</span>
                  </div>
                  <h3 className="text-sm font-bold text-ivoire mt-4">Déclarations Fiscales T4</h3>
                  <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">Dossier : Impôts Canada</p>
                  <div className="border-t border-white/5 mt-4 pt-4 flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-medium">Dossiers clients</span>
                    <ChevronRight size={14} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Contracts folder */}
                <div className="glass-card p-6 rounded-2xl hover:border-gold/30 cursor-pointer group">
                  <div className="flex justify-between items-start">
                    <FolderOpen size={40} className="text-gold" />
                    <span className="text-[10px] text-slate-500 font-bold">Signés</span>
                  </div>
                  <h3 className="text-sm font-bold text-ivoire mt-4">Mandats Électroniques</h3>
                  <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">Dossier : Signatures</p>
                  <div className="border-t border-white/5 mt-4 pt-4 flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-medium">Tous les clients</span>
                    <ChevronRight size={14} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

              </div>

              {/* Upload area simulation */}
              <div className="p-8 border border-dashed border-white/10 rounded-2xl text-center hover:border-gold/30 transition-colors">
                <FolderOpen size={32} className="text-slate-500 mx-auto mb-4" />
                <span className="text-xs font-bold text-ivoire block">Déposer des fichiers fiscaux ou contrats ici</span>
                <span className="text-[10px] text-slate-500 block mt-2">Glisser-déposer ou cliquer pour naviguer</span>
              </div>
            </div>
          )}

          {/* ============================================================
              5. OUTILS D'ANALYSE
             ============================================================ */}
          {activeTab === 'analysis' && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h2 className="text-xl font-serif font-bold text-ivoire">Outils d'Analyse</h2>
                <p className="text-xs text-slate-500 mt-1">Production de rapports comptables et calculs de taxes canadiens en un clic</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Reports Card */}
                <div className="glass-card p-8 rounded-3xl space-y-6">
                  <h3 className="text-sm font-bold text-ivoire uppercase tracking-wider border-b border-white/5 pb-2">Rapports Disponibles</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white/2 border border-white/5 rounded-xl">
                      <div>
                        <span className="text-xs font-bold block">Déclaration de TPS/TVQ Cumulée</span>
                        <span className="text-[9px] text-slate-500">Calcul basé sur la TPS (5%) et la TVQ (9.975%)</span>
                      </div>
                      <button type="button" className="p-2 hover:bg-gold/10 text-gold rounded-lg transition-all">
                        <Download size={16} />
                      </button>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-white/2 border border-white/5 rounded-xl">
                      <div>
                        <span className="text-xs font-bold block">Grand Livre Général</span>
                        <span className="text-[9px] text-slate-500">Bilan comptable global du cabinet</span>
                      </div>
                      <button type="button" className="p-2 hover:bg-gold/10 text-gold rounded-lg transition-all">
                        <Download size={16} />
                      </button>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-white/2 border border-white/5 rounded-xl">
                      <div>
                        <span className="text-xs font-bold block">État de rapprochement bancaire</span>
                        <span className="text-[9px] text-slate-500">Écarts dépôts reçus vs soldes</span>
                      </div>
                      <button type="button" className="p-2 hover:bg-gold/10 text-gold rounded-lg transition-all">
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Automation triggers */}
                <div className="glass-card p-8 rounded-3xl space-y-6">
                  <h3 className="text-sm font-bold text-ivoire uppercase tracking-wider border-b border-white/5 pb-2">Calculateur de Rapports instantané</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Cliquez sur le bouton ci-dessous pour compiler les rapports financiers à partir des données de vos dossiers clients.
                  </p>

                  <button
                    onClick={() => {
                      toast.info('La génération automatique de rapports n\'est pas encore active dans cet espace.');
                    }}
                    type="button"
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gold text-noir text-xs font-black uppercase tracking-widest rounded-xl hover:bg-gold-light transition-colors"
                  >
                    <BarChart3 size={16} /> Générer le rapport global (XLS)
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* ============================================================
              6. CALENDRIER
             ============================================================ */}
          {activeTab === 'calendar' && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h2 className="text-xl font-serif font-bold text-ivoire">Calendrier Fiscal & Réunions</h2>
                <p className="text-xs text-slate-500 mt-1">Suivi des remises de taxes gouvernementales et des échéances de vos dossiers</p>
              </div>

              {/* Interactive Calendar layout */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                
                {/* Events list */}
                <div className="glass-card p-6 rounded-2xl space-y-4 md:col-span-1">
                  <h3 className="text-xs font-black uppercase tracking-wider border-b border-white/5 pb-2">Dates de remise</h3>
                  
                  <div className="space-y-3">
                    <p className="text-xs text-slate-500">Aucun événement planifié pour le moment. Les dates de remise de vos dossiers apparaîtront ici.</p>
                  </div>
                </div>

                {/* Calendar grid */}
                <div className="glass-card p-6 rounded-3xl md:col-span-3">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-sm font-bold text-ivoire">{(() => { const s2 = new Date().toLocaleDateString('fr-CA', { month: 'long', year: 'numeric' }); return s2.charAt(0).toUpperCase() + s2.slice(1); })()}</span>
                    <div className="flex gap-2">
                      <button type="button" className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-bold hover:bg-white/10">Préc.</button>
                      <button type="button" className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-bold hover:bg-white/10">Suiv.</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold border-b border-white/5 pb-2 mb-2 text-slate-500">
                    <div>Dim</div><div>Lun</div><div>Mar</div><div>Mer</div><div>Jeu</div><div>Ven</div><div>Sam</div>
                  </div>
                  
                  {/* Days grid simulation */}
                  <div className="grid grid-cols-7 gap-2 h-72">
                    {Array.from({ length: 30 }).map((_, idx) => {
                      const day = idx + 1;
                      const hasEvent = false;
                      return (
                        <div key={day} className={`p-2 rounded-xl flex flex-col justify-between items-center cursor-pointer transition-colors ${
                          hasEvent ? 'bg-gold/20 border border-gold/40 text-gold' : 'hover:bg-white/5 bg-white/2 text-slate-400'
                        }`}>
                          <span className="text-xs font-bold">{day}</span>
                          {hasEvent && <span className="w-1.5 h-1.5 bg-gold rounded-full" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ============================================================
              7. MESSAGERIE D'ÉQUIPE
             ============================================================ */}
          {activeTab === 'messaging' && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h2 className="text-xl font-serif font-bold text-ivoire">Messagerie d'équipe</h2>
                <p className="text-xs text-slate-500 mt-1">Espace de communication interne de l'équipe Compta-Flow</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 h-[550px] overflow-hidden">
                
                {/* Teammates List */}
                <div className="glass-card p-4 rounded-3xl space-y-4 md:col-span-1 overflow-y-auto">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-4 px-2">Collaborateurs</h3>
                  <div className="space-y-2">
                    {['Samuel Lahaie', 'Simon Gagné', 'Sylvie Charette'].map(member => (
                      <button
                        key={member}
                        type="button"
                        onClick={() => setActiveChatMember(member)}
                        className={`w-full text-left p-3 rounded-2xl transition-all border flex items-center gap-3 ${
                          activeChatMember === member
                            ? 'bg-gold/10 border-gold/30 text-ivoire'
                            : 'bg-white/2 border-transparent text-slate-400 hover:bg-white/5 hover:text-ivoire'
                        }`}
                      >
                        <div className={`w-3 h-3 rounded-full bg-emerald-400`} />
                        <div>
                          <p className="text-xs font-bold">{member}</p>
                          <span className="text-[9px] text-slate-500 block">{member === 'Samuel Lahaie' ? 'Super Admin' : member === 'Simon Gagné' ? 'Saisie de factures' : 'Production comptable'}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chat conversation area */}
                <div className="glass-card p-6 rounded-3xl md:col-span-3 flex flex-col justify-between h-full bg-[#070707]">
                  <div className="border-b border-white/5 pb-3 flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-ivoire">{activeChatMember}</h4>
                      <span className="text-[9px] text-slate-500 font-bold block mt-0.5">Équipe Compta-Flow</span>
                    </div>
                  </div>

                  {/* Messages log */}
                  <div className="flex-1 overflow-y-auto py-4 space-y-3 custom-scrollbar text-xs">
                    {(chatMessages[activeChatMember] || []).length === 0 && (
                      <div className="text-center text-slate-500 py-10">
                        <p className="font-bold text-slate-400">Aucun message pour le moment</p>
                        <p className="mt-1">Écrivez le premier message à ce collaborateur.</p>
                      </div>
                    )}
                    {(chatMessages[activeChatMember] || []).map((msg, i) => (
                      <div key={i} className={`flex flex-col ${msg.sender === 'Cabinet' ? 'items-end' : 'items-start'}`}>
                        <div className={`p-3 rounded-2xl max-w-md ${
                          msg.sender === 'Cabinet'
                            ? 'bg-gold text-noir font-semibold rounded-tr-none'
                            : 'bg-white/5 text-ivoire rounded-tl-none border border-white/5'
                        }`}>
                          <p className="leading-relaxed">{msg.text}</p>
                        </div>
                        <span className="text-[9px] text-slate-600 mt-1">{msg.time}</span>
                      </div>
                    ))}
                  </div>

                  {/* Message Input form */}
                  <form onSubmit={handleSendChatMessage} className="border-t border-white/5 pt-4 flex gap-2">
                    <input
                      type="text"
                      value={newChatMessage}
                      onChange={(e) => setNewChatMessage(e.target.value)}
                      placeholder="Saisissez votre message interne..."
                      className="flex-1 bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs outline-none focus:border-gold text-ivoire font-bold"
                    />
                    <button
                      type="submit"
                      className="p-3 bg-gold text-noir rounded-xl hover:bg-gold-light transition-colors"
                    >
                      <Send size={16} />
                    </button>
                  </form>
                </div>

              </div>
            </div>
          )}

          {/* ============================================================
              8. TARIFS ET SERVICES
             ============================================================ */}
          {activeTab === 'services' && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h2 className="text-xl font-serif font-bold text-ivoire">Tarifs et Services Compta-Flow</h2>
                <p className="text-xs text-slate-500 mt-1">Gestion et mise à jour dynamique de la grille tarifaire des 6 services</p>
              </div>

              {/* Services cards grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {services.map(service => (
                  <div key={service.id} className="glass-card p-6 rounded-2xl flex flex-col justify-between hover:border-gold/30 transition-all relative">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] px-2 py-0.5 border border-gold/30 text-gold rounded-full font-black uppercase tracking-wider">{service.category}</span>
                        <Tags size={16} className="text-slate-500" />
                      </div>
                      <h3 className="text-sm font-bold text-ivoire mt-4">{service.name}</h3>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">{service.description}</p>
                    </div>

                    <div className="border-t border-white/5 mt-6 pt-4 flex justify-between items-center">
                      <div>
                        {editingServiceId === service.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={editPrice}
                              onChange={(e) => setEditPrice(Number(e.target.value))}
                              className="w-20 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-ivoire font-bold"
                            />
                            <span className="text-xs text-slate-500">$</span>
                          </div>
                        ) : (
                          <span className="text-lg font-serif font-bold text-gold">{service.price} $ <span className="text-[10px] text-slate-500">/ {service.period}</span></span>
                        )}
                      </div>

                      {editingServiceId === service.id ? (
                        <button
                          type="button"
                          onClick={() => handleSavePrice(service.id)}
                          className="px-3 py-1.5 bg-emerald-500 text-noir text-[10px] font-black uppercase tracking-wider rounded-lg"
                        >
                          Sauver
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleEditPrice(service.id, service.price)}
                          className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-gold transition-colors"
                        >
                          <Edit3 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================
              9. OUTILS FINANCIERS (CALCULATRICE)
             ============================================================ */}
          {activeTab === 'calculators' && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h2 className="text-xl font-serif font-bold text-ivoire">Outils Financiers</h2>
                <p className="text-xs text-slate-500 mt-1">Calculateurs de taxes canadiens, marges et déductions d'impôts directes</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* GST / QST Tax calculator */}
                <div className="glass-card p-8 rounded-3xl space-y-6">
                  <h3 className="text-sm font-bold text-ivoire uppercase tracking-wider border-b border-white/5 pb-2">Calculateur de taxes (TPS / TVQ)</h3>
                  
                  <div className="space-y-4 text-xs font-bold">
                    <div>
                      <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-2">Montant de base (Hors-taxe)</label>
                      <input
                        type="number"
                        value={calcAmount}
                        onChange={(e) => setCalcAmount(Number(e.target.value))}
                        className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs outline-none focus:border-gold text-ivoire"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-2">Province / Règle Fiscale</label>
                      <select
                        value={calcProvince}
                        onChange={(e) => setCalcProvince(e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3 text-xs outline-none focus:border-gold text-ivoire"
                      >
                        <option value="QC">Québec (TPS 5% + TVQ 9.975%)</option>
                        <option value="ON">Ontario (HST 13%)</option>
                        <option value="BC">Colombie-Britannique (GST 5% + PST 7%)</option>
                        <option value="AB">Alberta (GST 5% uniquement)</option>
                      </select>
                    </div>

                    {/* Results */}
                    <div className="p-4 bg-white/2 border border-white/5 rounded-xl space-y-2 font-mono">
                      <div className="flex justify-between">
                        <span>Base :</span>
                        <span>{calcAmount.toFixed(2)} $</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>TPS ({calcProvince === 'ON' ? 'HST' : '5%'}) :</span>
                        <span>{calcTaxesResults.tps.toFixed(2)} $</span>
                      </div>
                      {calcProvince !== 'ON' && calcProvince !== 'AB' && (
                        <div className="flex justify-between text-slate-400">
                          <span>{calcProvince === 'BC' ? 'PST (7%)' : 'TVQ (9.975%)'} :</span>
                          <span>{calcTaxesResults.tvq.toFixed(2)} $</span>
                        </div>
                      )}
                      <div className="flex justify-between text-gold border-t border-white/5 pt-2 text-sm font-bold">
                        <span>Total (TTC) :</span>
                        <span>{calcTaxesResults.total.toFixed(2)} $</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profit Margin Calculator */}
                <div className="glass-card p-8 rounded-3xl space-y-6">
                  <h3 className="text-sm font-bold text-ivoire uppercase tracking-wider border-b border-white/5 pb-2">Calculateur de Marge Bénéficiaire</h3>
                  
                  <div className="space-y-4 text-xs font-bold">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-2">Coût de revient</label>
                        <input
                          type="number"
                          value={marginCost}
                          onChange={(e) => setMarginCost(Number(e.target.value))}
                          className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs outline-none focus:border-gold text-ivoire"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-2">Prix de vente</label>
                        <input
                          type="number"
                          value={marginPrice}
                          onChange={(e) => setMarginPrice(Number(e.target.value))}
                          className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs outline-none focus:border-gold text-ivoire"
                        />
                      </div>
                    </div>

                    {/* Results */}
                    <div className="p-4 bg-white/2 border border-white/5 rounded-xl space-y-2 font-mono">
                      <div className="flex justify-between">
                        <span>Bénéfice Brut :</span>
                        <span className="text-emerald-400">{marginPrice - marginCost >= 0 ? '+' : ''}{(marginPrice - marginCost).toFixed(2)} $</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Marge (sur Vente) :</span>
                        <span>{calcMarginResults.margin.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Taux de marque (Markup) :</span>
                        <span>{calcMarginResults.markup.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ============================================================
              10. NOTES RAPIDES (STICKY NOTES)
             ============================================================ */}
          {activeTab === 'notes' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-serif font-bold text-ivoire">Notes Rapides</h2>
                  <p className="text-xs text-slate-500 mt-1">Bloc-notes adhésifs persistants pour noter des rappels ou des tâches en attente</p>
                </div>
              </div>

              {/* Add Note form */}
              <form onSubmit={handleAddNote} className="glass-card p-6 rounded-2xl flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider block mb-2">Contenu de la note</label>
                  <input
                    type="text"
                    required
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Écrivez un rappel rapide..."
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs outline-none focus:border-gold text-ivoire font-bold"
                  />
                </div>
                
                <div className="flex gap-4 items-center w-full md:w-auto">
                  <div className="flex gap-2">
                    {['yellow', 'green', 'pink', 'blue'].map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewNoteColor(color as any)}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${
                          newNoteColor === color ? 'border-white scale-110 shadow-lg' : 'border-transparent'
                        } ${
                          color === 'yellow' ? 'bg-[#ffeb3b]/40' : color === 'green' ? 'bg-[#4caf50]/40' : color === 'pink' ? 'bg-[#e91e63]/40' : 'bg-[#2196f3]/40'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <button
                    type="submit"
                    className="px-5 py-3 bg-gold text-noir text-xs font-black uppercase tracking-wider rounded-xl hover:bg-gold-light transition-colors whitespace-nowrap"
                  >
                    Ajouter Note
                  </button>
                </div>
              </form>

              {/* Sticky Notes Grid Layout */}
              {notes.length === 0 && (
                <p className="text-xs text-slate-500">Aucune note pour le moment. Écrivez votre premier rappel ci-dessus.</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {notes.map(note => {
                  const colorClasses = {
                    yellow: 'bg-[#FFF9C4] text-slate-800 border-l-4 border-amber-400',
                    green: 'bg-[#C8E6C9] text-slate-800 border-l-4 border-emerald-500',
                    pink: 'bg-[#F8BBD0] text-slate-800 border-l-4 border-pink-500',
                    blue: 'bg-[#B3E5FC] text-slate-800 border-l-4 border-sky-500'
                  };
                  return (
                    <div key={note.id} className={`p-5 rounded-2xl flex flex-col justify-between h-48 shadow-lg transition-transform hover:scale-102 ${colorClasses[note.color]}`}>
                      <p className="text-xs font-semibold leading-relaxed overflow-y-auto custom-scrollbar">{note.text}</p>
                      <div className="flex justify-between items-center border-t border-black/5 mt-4 pt-2">
                        <span className="text-[9px] text-slate-500 font-bold">{new Date(note.createdAt).toLocaleDateString('fr-CA')}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1 hover:bg-black/5 text-slate-500 hover:text-red-500 rounded transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================
              11. COFFRE-FORT (BANQUE DE DONNÉES SÉCURISÉE)
             ============================================================ */}
          {activeTab === 'vault' && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h2 className="text-xl font-serif font-bold text-ivoire">Coffre-fort Sécurisé</h2>
                <p className="text-xs text-slate-500 mt-1">Accès restreint aux informations sensibles du cabinet</p>
              </div>

              {!isVaultUnlocked ? (
                /* Unlocking Gate */
                <div className="glass-card max-w-md mx-auto p-8 rounded-3xl text-center space-y-6 border border-white/10 shadow-2xl">
                  <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto text-red-400">
                    <LockKeyhole size={32} className="animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-ivoire">Coffre-fort Verrouillé</h3>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                      Saisissez le mot de passe maître de l'administrateur pour déchiffrer les données sensibles.
                    </p>
                  </div>

                  <form onSubmit={handleUnlockVault} className="space-y-4">
                    <input
                      type="password"
                      required
                      value={vaultPassword}
                      onChange={(e) => setVaultPassword(e.target.value)}
                      placeholder="Mot de passe maître..."
                      className="w-full text-center bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs outline-none focus:border-red-500 transition-colors text-ivoire font-bold"
                    />
                    <button
                      type="submit"
                      className="w-full py-3 bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-500/30 transition-all"
                    >
                      Déchiffrer
                    </button>
                  </form>
                </div>
              ) : (
                /* Unlocked Vault Database */
                <div className="space-y-6 animate-scaleIn">
                  <div className="flex justify-between items-center p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                    <span className="text-xs font-bold flex items-center gap-2">
                      <LockOpen size={16} /> Session déverrouillée
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsVaultUnlocked(false)}
                      className="text-xs font-black uppercase tracking-wider hover:underline"
                    >
                      Verrouiller
                    </button>
                  </div>

                  <div className="glass-card p-8 rounded-2xl space-y-3 text-center">
                    <h4 className="text-xs font-black uppercase tracking-wider text-ivoire flex items-center justify-center gap-2">
                      <Key size={14} className="text-gold" /> Identifiants enregistrés
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
                      Aucun identifiant n'est conservé dans cet espace. Les accès sensibles et les clés de production restent dans le coffre-fort sécurisé de l'entreprise — jamais affichés dans l'interface.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================
              12. PARAMÈTRES
             ============================================================ */}
          {activeTab === 'settings' && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h2 className="text-xl font-serif font-bold text-ivoire">Paramètres Administrateur</h2>
                <p className="text-xs text-slate-500 mt-1">Personnalisation de l'espace, mot de passe de sécurité et droits des collaborateurs</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Theme Customizer Card */}
                <div className="glass-card p-8 rounded-3xl space-y-4">
                  <h3 className="text-sm font-bold text-ivoire uppercase tracking-wider border-b border-white/5 pb-2">Personnalisation visuelle</h3>
                  <p className="text-xs text-slate-500 leading-normal">Sélectionnez la couleur thématique principale pour adapter la palette de votre espace.</p>
                  
                  <div className="flex gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => setThemeColor('gold')}
                      className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all ${
                        themeColor === 'gold' ? 'border-gold text-gold bg-gold/10' : 'border-white/5 text-slate-400'
                      }`}
                    >
                      Or ComptaFlow
                    </button>
                    <button
                      type="button"
                      onClick={() => setThemeColor('emerald')}
                      className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all ${
                        themeColor === 'emerald' ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' : 'border-white/5 text-slate-400'
                      }`}
                    >
                      Émeraude
                    </button>
                    <button
                      type="button"
                      onClick={() => setThemeColor('sapphire')}
                      className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all ${
                        themeColor === 'sapphire' ? 'border-sky-400 text-sky-400 bg-sky-400/10' : 'border-white/5 text-slate-400'
                      }`}
                    >
                      Saphir
                    </button>
                  </div>
                </div>

                {/* Password editor card */}
                <div className="glass-card p-8 rounded-3xl space-y-4">
                  <h3 className="text-sm font-bold text-ivoire uppercase tracking-wider border-b border-white/5 pb-2">Mot de passe de sécurité</h3>
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider block mb-2">Nouveau mot de passe de compte</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nouveau mot de passe..."
                      className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs outline-none focus:border-gold text-ivoire font-bold"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (newPassword.length < 8) {
                        toast.error('Le mot de passe doit faire au moins 8 caractères.');
                      } else {
                        toast.info('Pour modifier votre mot de passe, utilisez « Mot de passe oublié » à la connexion — un lien sécurisé vous sera envoyé par courriel.');
                        setNewPassword('');
                      }
                    }}
                    type="button"
                    className="w-full py-3 bg-gold text-noir text-xs font-black uppercase tracking-widest rounded-xl hover:bg-gold-light transition-colors"
                  >
                    Mettre à jour le mot de passe
                  </button>
                </div>

                {/* Team authorizations card */}
                <div className="glass-card p-8 rounded-3xl space-y-4">
                  <h3 className="text-sm font-bold text-ivoire uppercase tracking-wider border-b border-white/5 pb-2">Accès & Collaborateurs</h3>
                  
                  <div className="space-y-3 text-xs font-bold">
                    <div className="flex justify-between items-center">
                      <span>Samuel Lahaie</span>
                      <span className="text-[10px] text-gold font-bold">Super Admin — accès complet</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Simon Gagné</span>
                      <span className="text-[10px] text-emerald-400 font-bold">Équipe — Saisie de factures</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Sylvie Charette</span>
                      <span className="text-[10px] text-emerald-400 font-bold">Équipe — Production comptable</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

export default SubAdminPortalShell;
