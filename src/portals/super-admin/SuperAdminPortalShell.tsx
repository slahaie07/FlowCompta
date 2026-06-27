import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Receipt, FolderOpen, BarChart3, Calendar as CalendarIcon, 
  MessageSquare, Tags, Calculator, StickyNote as StickyIcon, Lock, Settings as SettingsIcon,
  Bell, Sun, Cloud, Plus, Search, Trash2, LockOpen, Key, Check, CheckCircle2, 
  AlertTriangle, TrendingUp, LogOut, Send, Eye, Edit3, Filter, Shield, 
  DollarSign, ChevronRight, Download, RefreshCw, X, FileText, LockKeyhole, Landmark
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ClientRecord } from '../../types';
import { toast } from 'sonner';
import { useLanguage } from '../../hooks/useLanguage';

interface SuperAdminPortalShellProps {
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

export function SuperAdminPortalShell({
  userData,
  onLogout,
  routeContext
}: SuperAdminPortalShellProps) {
  const { t } = useLanguage();
  const { adminClients, addClient } = routeContext;

  // Active Tab state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Date & Weather simulation
  const [dateStr, setDateStr] = useState<string>('');
  const [weather, setWeather] = useState({ city: 'Ottawa', temp: 21, icon: '🌤️', text: 'Partiellement nuageux' });

  // Notifications state
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Cabinet Eya actif', message: 'Eya a validé 3 T4 d\'étudiants en Ontario', time: 'Il y a 10 min', unread: true },
    { id: 2, title: 'Nouveau cabinet provisionné', message: 'Stéphanie Laplante a complété sa première clôture mensuelle', time: 'Il y a 2h', unread: true },
    { id: 3, title: 'Abonnement réseau reçu', message: 'Paiement Stripe reçu pour compta-flow.net SaaS', time: 'Il y a 4h', unread: false }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Sub-admins List (Cabinets)
  const [subAdmins, setSubAdmins] = useState([
    { id: '1', name: 'Sylvie Charette-Clément', email: 'viviee28@hotmail.com', clientsCount: 8, status: 'Actif', load: 'Optimale' },
    { id: '2', name: 'Eya', email: 'eya-cpa@outlook.com', clientsCount: 12, status: 'Actif', load: 'Maximale' },
    { id: '3', name: 'Stéphanie Laplante', email: 'stephanie@comptaflow.com', clientsCount: 5, status: 'Actif', load: 'Modérée' }
  ]);

  // Clients network tab state
  const [clientSearch, setClientSearch] = useState('');
  const [clientsList, setClientsList] = useState<any[]>([
    { id: 'c1', name: 'Stéphanie Laplante', company: 'Laplante Design Inc.', email: 'stephanie@comptaflow.com', assignedTo: 'Stéphanie Laplante', status: 'Actif' },
    { id: 'c2', name: 'Antoine Tremblay', company: 'Particulier', email: 'antoine.tremblay@gmail.com', assignedTo: 'Eya', status: 'Actif' },
    { id: 'c3', name: 'Sébastien Roy', company: 'Roy Rénovation', email: 's.roy@renovroy.ca', assignedTo: 'Sylvie Charette-Clément', status: 'Actif' },
    { id: 'c4', name: 'Marie-Claude Coté', company: 'Coté Conseil Inc.', email: 'mccote@conseilcote.ca', assignedTo: 'Sylvie Charette-Clément', status: 'Actif' }
  ]);

  // Sticky notes state
  const [notes, setNotes] = useState<StickyNoteItem[]>([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteColor, setNewNoteColor] = useState<'yellow' | 'green' | 'pink' | 'blue'>('yellow');

  // Tax rates from DB
  const [taxRates, setTaxRates] = useState<any[]>([]);

  // Vault state
  const [vaultPassword, setVaultPassword] = useState('');
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [vaultAttempts, setVaultAttempts] = useState(0);

  // Services catalog state
  const [services, setServices] = useState<ServiceItem[]>([
    { id: '1', name: 'Forfaits Mensuels', description: 'Tenue de livres mensuelle complète avec Dext et support régulier.', price: 199, period: 'mois', category: 'Tenue de livres' },
    { id: '2', name: 'L\'Étudiant', description: 'Déclaration d\'impôt simplifiée pour étudiants admissibles.', price: 49, period: 'unique', category: 'Impôts' },
    { id: '3', name: 'Le Rattrapage', description: 'Mise à jour de tenue de livres en retard, tarif par mois rétroactif.', price: 99, period: 'mois', category: 'Tenue de livres' },
    { id: '4', name: 'Le Setup Onboarding', description: 'Configuration initiale de Supabase, Stripe, et raccordement bancaire.', price: 299, period: 'unique', category: 'Configuration' },
    { id: '5', name: 'Impôts Personnels', description: 'Déclaration de revenus personnelle standard avec crédits canadiens.', price: 99, period: 'unique', category: 'Impôts' }
  ]);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);

  // Finance Tools Calculator state
  const [calcAmount, setCalcAmount] = useState<number>(100);
  const [calcProvince, setCalcProvince] = useState<string>('QC');
  const [marginCost, setMarginCost] = useState<number>(50);
  const [marginPrice, setMarginPrice] = useState<number>(100);

  // Team Chat state
  const [activeChatMember, setActiveChatMember] = useState<string>('Sylvie Charette-Clément');
  const [chatMessages, setChatMessages] = useState<Record<string, Array<{ sender: string; text: string; time: string }>>>({
    'Sylvie Charette-Clément': [
      { sender: 'Sylvie Charette-Clément', text: 'Bonjour Samuel, la synchronisation Stripe sur compta-flow.net fonctionne à merveille.', time: '11:05' },
      { sender: 'Owner', text: 'Excellent! N\'hésite pas à me remonter s\'il y a la moindre lenteur sur les webhooks de prod.', time: '11:15' }
    ],
    'Eya': [
      { sender: 'Eya', text: 'Bonjour, j\'ai affecté Antoine Tremblay à mon cabinet de support Ontario.', time: 'Hier' },
      { sender: 'Owner', text: 'Parfait, le calculateur fiscal canadien s\'adaptera automatiquement aux taxes de l\'Ontario (HST 13%).', time: 'Hier' }
    ],
    'Stéphanie Laplante': [
      { sender: 'Stéphanie Laplante', text: 'Merci pour la configuration de mon compte de cabinet, je vois bien tous mes dossiers.', time: 'Hier' },
      { sender: 'Owner', text: 'De rien Stéphanie, bon début de traitement sur le panel !', time: 'Hier' }
    ]
  });
  const [newChatMessage, setNewChatMessage] = useState('');

  // Settings state
  const [themeColor, setThemeColor] = useState<'emerald' | 'gold' | 'sapphire'>('gold');
  const [newPassword, setNewPassword] = useState('');

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

    // 3. Fetch subAdmins (Cabinets) and Clients List from DB
    try {
      // Fetch sub_admins
      const { data: saData, error: saErr } = await supabase
        .from('profiles')
        .select('id, full_name, display_name, email, status')
        .eq('role', 'sub_admin');
      
      // Fetch client profiles
      const { data: clData, error: clErr } = await supabase
        .from('profiles')
        .select('id, full_name, display_name, company_name, email, status, sub_admin_id')
        .eq('role', 'client');

      if (!saErr && saData && saData.length > 0) {
        // Calculate dynamic load & clientsCount for subAdmins
        const updatedSubAdmins = saData.map(sa => {
          const count = clData ? clData.filter(cl => cl.sub_admin_id === sa.id).length : 0;
          let loadStr = 'Modérée';
          if (count > 10) loadStr = 'Maximale';
          else if (count > 5) loadStr = 'Optimale';
          
          return {
            id: sa.id,
            name: sa.full_name || sa.display_name || 'Cabinet',
            email: sa.email || '',
            clientsCount: count,
            status: sa.status === 'active' ? 'Actif' : 'Inactif',
            load: loadStr
          };
        });
        setSubAdmins(updatedSubAdmins);

        // Map sub_admin names for assignedTo field in clientsList
        const saNameMap = new Map(saData.map(sa => [sa.id, sa.full_name || sa.display_name || 'Cabinet']));
        
        if (!clErr && clData) {
          const updatedClients = clData.map(cl => ({
            id: cl.id,
            name: cl.full_name || cl.display_name || 'Client',
            company: cl.company_name || 'Particulier',
            email: cl.email || '',
            assignedTo: cl.sub_admin_id ? (saNameMap.get(cl.sub_admin_id) || 'Non assigné') : 'Non assigné',
            status: cl.status === 'active' ? 'Actif' : 'Inactif'
          }));
          setClientsList(updatedClients);
        }
      }
    } catch (e) {
      console.warn("Sub-admins and clients network load failed, using mock data.", e);
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

    // Ottawa Weather simulation (Canada Capital)
    setWeather({ city: 'Ottawa', temp: 20, icon: '🌤️', text: 'Nuageux' });

    // Load Sticky Notes from LocalStorage
    const savedNotes = localStorage.getItem(`comptaflow_super_notes_${userData?.id || 'default'}`);
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    } else {
      const initialNotes: StickyNoteItem[] = [
        { id: '1', text: 'Vérifier la performance du webhook Stripe de dépôt.', color: 'blue', createdAt: new Date().toISOString() },
        { id: '2', text: 'Valider la conformité Loi 25 sur les fichiers du Coffre-fort.', color: 'green', createdAt: new Date().toISOString() },
        { id: '3', text: 'Provisionner un nouveau cabinet si la charge d\'Eya dépasse 15 clients.', color: 'yellow', createdAt: new Date().toISOString() }
      ];
      setNotes(initialNotes);
      localStorage.setItem(`comptaflow_super_notes_${userData?.id || 'default'}`, JSON.stringify(initialNotes));
    }

    loadLiveData();
  }, [userData?.id]);

  // Sidebar item configuration
  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'cabinets', label: 'Gestion des Cabinets', icon: Shield },
    { id: 'clients', label: 'Clients Réseau', icon: Users },
    { id: 'transactions', label: 'Suivi des Transactions', icon: Receipt },
    { id: 'documents', label: 'Documents et Formulaires', icon: FolderOpen },
    { id: 'analysis', label: 'Outils d\'Analyse', icon: BarChart3 },
    { id: 'calendar', label: 'Calendrier Global', icon: CalendarIcon },
    { id: 'messaging', label: 'Messagerie d\'équipe', icon: MessageSquare },
    { id: 'services', label: 'Tarifs et Services', icon: Tags },
    { id: 'calculators', label: 'Outils Financiers', icon: Calculator },
    { id: 'notes', label: 'Notes Rapides', icon: StickyIcon },
    { id: 'vault', label: 'Coffre-fort Réseau', icon: Lock },
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

  // Sticky notes actions
  const saveNotes = (updatedNotes: StickyNoteItem[]) => {
    setNotes(updatedNotes);
    localStorage.setItem(`comptaflow_super_notes_${userData?.id || 'default'}`, JSON.stringify(updatedNotes));
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
    localStorage.setItem(`comptaflow_super_notes_${userData.id}`, JSON.stringify(updated));
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
      toast.success('Note ajoutée au tableau de bord réseau !');
    } catch (err) {
      console.warn("Failed to insert note to DB, saved to localStorage.", err);
      toast.warning("Mode hors-ligne : Note enregistrée localement.");
    }
  };

  const handleDeleteNote = async (id: string) => {
    const filtered = notes.filter(n => n.id !== id);
    setNotes(filtered);
    if (userData?.id) {
      localStorage.setItem(`comptaflow_super_notes_${userData.id}`, JSON.stringify(filtered));
    }

    try {
      if (id.includes('-')) {
        const { error } = await supabase
          .from('quick_notes')
          .delete()
          .eq('id', id);
        if (error) throw error;
      }
      toast.success('Note réseau supprimée.');
    } catch (err) {
      console.warn("Failed to delete note from DB.", err);
      toast.success('Note réseau supprimée localement.');
    }
  };

  // Vault unlocking action
  const handleUnlockVault = (e: React.FormEvent) => {
    e.preventDefault();
    if (vaultPassword === 'admin1234') {
      setIsVaultUnlocked(true);
      toast.success('Accès autorisé au Coffre-fort global.');
      setVaultPassword('');
    } else {
      setVaultAttempts(prev => prev + 1);
      toast.error('Mot de passe incorrect.');
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
    toast.success('Tarif réseau mis à jour.');
  };

  // Chat send message
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatMessage.trim()) return;

    const messages = chatMessages[activeChatMember] || [];
    const updatedMessages = [
      ...messages,
      { sender: 'Owner', text: newChatMessage, time: new Date().toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' }) }
    ];

    setChatMessages({
      ...chatMessages,
      [activeChatMember]: updatedMessages
    });

    setNewChatMessage('');
    
    // Simulate auto reply after 1.5 seconds
    setTimeout(() => {
      const responseText = 'Parfait Samuel, je m\'occupe de valider cela dans mes dossiers actifs.';
      setChatMessages(prev => {
        const memberMessages = prev[activeChatMember] || [];
        return {
          ...prev,
          [activeChatMember]: [
            ...memberMessages,
            { sender: activeChatMember, text: responseText, time: new Date().toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' }) }
          ]
        };
      });
    }, 1500);
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
      <nav className="w-80 h-screen bg-[#060606] border-r border-white/5 flex flex-col z-30 shrink-0 select-none">
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
              {userData?.fullName?.charAt(0) || 'S'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black truncate">{userData?.fullName || 'Samuel Lahaie'}</p>
              <span className="text-[9px] uppercase tracking-wider text-gold font-bold">Super Admin (Owner)</span>
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
        <header className="h-20 bg-noir/50 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-10 shrink-0">
          
          {/* Header Left: Greeting */}
          <div className="flex flex-col">
            <h1 className="text-xl font-serif font-bold text-ivoire">
              Bonjour, <span className={`${activeTheme.accent} ${activeTheme.textGlow}`}>{userData?.fullName || 'Samuel Lahaie'}</span>
            </h1>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Panneau de Contrôle Réseau</p>
          </div>

          {/* Header Right: Date, Weather, Notifications */}
          <div className="flex items-center gap-6">
            
            {/* Elegant Date/Weather Widget */}
            <div className="flex items-center gap-4 px-4 py-2 bg-white/5 border border-white/5 rounded-2xl text-xs font-medium">
              <span className="text-slate-400 border-r border-white/10 pr-4">{dateStr}</span>
              <div className="flex items-center gap-1.5 text-ivoire">
                <span>{weather.icon}</span>
                <span className="font-bold">{weather.city}</span>
                <span className="text-gold font-bold">{weather.temp}°C</span>
              </div>
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
                    <h3 className="text-xs font-black uppercase tracking-wider">Alertes Réseau</h3>
                    <button 
                      onClick={() => setNotifications(prev => prev.map(n => ({ ...n, unread: false })))}
                      className="text-[10px] text-gold hover:underline"
                    >
                      Tout lire
                    </button>
                  </div>
                  <div className="space-y-3">
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

        {/* 📦 CONTENT ZONE */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
          {/* ============================================================
              1. TABLEAU DE BORD (SUPER OVERVIEW)
             ============================================================ */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Network Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                <div className="glass-card p-6 rounded-2xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-black tracking-wider">Revenus Réseau (ARR)</p>
                      <h3 className="text-2xl font-bold mt-2 font-serif text-ivoire">248 900.00 $</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                      <TrendingUp size={20} />
                    </div>
                  </div>
                  <p className="text-xs text-emerald-400 mt-4 font-bold">+18.5% croissance annuelle</p>
                </div>

                <div className="glass-card p-6 rounded-2xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-black tracking-wider">Cabinets Actifs</p>
                      <h3 className="text-2xl font-bold mt-2 font-serif text-ivoire">3 Partenaires</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                      <Shield size={20} />
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-4">Sylvie, Eya, Stéphanie Laplante</p>
                </div>

                <div className="glass-card p-6 rounded-2xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-black tracking-wider">Clients Totaux</p>
                      <h3 className="text-2xl font-bold mt-2 font-serif text-ivoire">25 Clients</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                      <Users size={20} />
                    </div>
                  </div>
                  <p className="text-xs text-emerald-400 mt-4 font-bold">100% de complétion Loi 25</p>
                </div>

                <div className="glass-card p-6 rounded-2xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-black tracking-wider">Taux de Rétention</p>
                      <h3 className="text-2xl font-bold mt-2 font-serif text-ivoire">99.2%</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                      <CheckCircle2 size={20} />
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-4">Objectif réseau : 98%</p>
                </div>

              </div>

              {/* Sub-admins overview widget */}
              <div className="glass-card p-8 rounded-3xl">
                <h2 className="text-lg font-serif font-bold text-ivoire mb-6 flex items-center gap-2">
                  <Landmark size={20} className="text-gold" /> Performance et Charge des Cabinets
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {subAdmins.map(sub => (
                    <div key={sub.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-4">
                      <div>
                        <span className="text-xs font-bold block">{sub.name}</span>
                        <span className="text-[10px] text-slate-500">{sub.email}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Clients affectés :</span>
                        <span className="font-bold text-gold">{sub.clientsCount}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Charge de travail :</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          sub.load === 'Maximale' ? 'bg-red-500/10 text-red-400' : sub.load === 'Modérée' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'
                        }`}>{sub.load}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ============================================================
              2. GESTION DES CABINETS (SUB-ADMINS)
             ============================================================ */}
          {activeTab === 'cabinets' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-serif font-bold text-ivoire">Gestion des Cabinets (Sub-admins)</h2>
                  <p className="text-xs text-slate-500 mt-1">Supervision des accès et assignation de dossiers des 3 comptables</p>
                </div>
              </div>

              <div className="glass-card rounded-3xl overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/2">
                      <th className="p-5 text-xs text-slate-500 uppercase font-black tracking-wider">Comptable / Cabinet</th>
                      <th className="p-5 text-xs text-slate-500 uppercase font-black tracking-wider">Courriel</th>
                      <th className="p-5 text-xs text-slate-500 uppercase font-black tracking-wider">Clients</th>
                      <th className="p-5 text-xs text-slate-500 uppercase font-black tracking-wider">Charge</th>
                      <th className="p-5 text-xs text-slate-500 uppercase font-black tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs font-semibold">
                    {subAdmins.map(sub => (
                      <tr key={sub.id} className="hover:bg-white/1">
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-gold/10 flex items-center justify-center text-gold font-bold">
                              {sub.name.charAt(0)}
                            </div>
                            <span className="font-bold">{sub.name}</span>
                          </div>
                        </td>
                        <td className="p-5 text-slate-400">{sub.email}</td>
                        <td className="p-5 font-bold text-gold">{sub.clientsCount} clients</td>
                        <td className="p-5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            sub.load === 'Maximale' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                          }`}>{sub.load}</span>
                        </td>
                        <td className="p-5 text-right">
                          <button type="button" className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] uppercase font-bold text-slate-300">
                            Gérer Profil
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================
              3. CLIENTS RÉSEAU
             ============================================================ */}
          {activeTab === 'clients' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex justify-between items-center">
                <div className="relative w-96">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    type="text"
                    placeholder="Rechercher dans tout le réseau..."
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-xs outline-none focus:border-gold font-bold text-ivoire"
                  />
                </div>
              </div>

              <div className="glass-card rounded-3xl overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/2">
                      <th className="p-5 text-xs text-slate-500 uppercase font-black tracking-wider">Client</th>
                      <th className="p-5 text-xs text-slate-500 uppercase font-black tracking-wider">Entreprise</th>
                      <th className="p-5 text-xs text-slate-500 uppercase font-black tracking-wider">Cabinet Assigné</th>
                      <th className="p-5 text-xs text-slate-500 uppercase font-black tracking-wider">Courriel</th>
                      <th className="p-5 text-xs text-slate-500 uppercase font-black tracking-wider text-right">Réassigner</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs font-semibold">
                    {clientsList
                      .filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()) || c.company.toLowerCase().includes(clientSearch.toLowerCase()))
                      .map(c => (
                        <tr key={c.id} className="hover:bg-white/1">
                          <td className="p-5 font-bold">{c.name}</td>
                          <td className="p-5 text-slate-400">{c.company}</td>
                          <td className="p-5 text-gold font-bold">{c.assignedTo}</td>
                          <td className="p-5 text-slate-400">{c.email}</td>
                          <td className="p-5 text-right">
                            <button
                              onClick={() => {
                                toast.success(`Dossier ${c.name} réassigné avec succès.`);
                              }}
                              type="button"
                              className="px-2.5 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-[10px] uppercase font-bold"
                            >
                              Réassigner
                            </button>
                          </td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================
              4. SUIVI DES TRANSACTIONS
             ============================================================ */}
          {activeTab === 'transactions' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-serif font-bold text-ivoire">Transactions Globales Réseau</h2>
                  <p className="text-xs text-slate-500 mt-1">Audit des paiements de tous les cabinets canadiens</p>
                </div>
              </div>

              <div className="glass-card rounded-3xl overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/2">
                      <th className="p-5 text-xs text-slate-500 uppercase font-black tracking-wider">Date</th>
                      <th className="p-5 text-xs text-slate-500 uppercase font-black tracking-wider">Cabinet</th>
                      <th className="p-5 text-xs text-slate-500 uppercase font-black tracking-wider">Client</th>
                      <th className="p-5 text-xs text-slate-500 uppercase font-black tracking-wider">Montant</th>
                      <th className="p-5 text-xs text-slate-500 uppercase font-black tracking-wider">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs font-semibold">
                    <tr className="hover:bg-white/1">
                      <td className="p-5 text-slate-400">24 Juin 2026</td>
                      <td className="p-5 font-bold">Stéphanie Laplante</td>
                      <td className="p-5">Stéphanie Laplante</td>
                      <td className="p-5 text-gold">199.00 $</td>
                      <td className="p-5"><span className="text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded bg-emerald-500/5 uppercase font-bold text-[9px]">Payé</span></td>
                    </tr>
                    <tr className="hover:bg-white/1">
                      <td className="p-5 text-slate-400">23 Juin 2026</td>
                      <td className="p-5 font-bold">Eya</td>
                      <td className="p-5">Antoine Tremblay</td>
                      <td className="p-5 text-gold">49.00 $</td>
                      <td className="p-5"><span className="text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded bg-emerald-500/5 uppercase font-bold text-[9px]">Payé</span></td>
                    </tr>
                    <tr className="hover:bg-white/1">
                      <td className="p-5 text-slate-400">22 Juin 2026</td>
                      <td className="p-5 font-bold">Sylvie Charette-Clément</td>
                      <td className="p-5">Sébastien Roy</td>
                      <td className="p-5 text-gold">325.00 $</td>
                      <td className="p-5"><span className="text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded bg-emerald-500/5 uppercase font-bold text-[9px]">Payé</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================
              5. DOCUMENTS ET FORMULAIRES
             ============================================================ */}
          {activeTab === 'documents' && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h2 className="text-xl font-serif font-bold text-ivoire">Coffre de Documents Global</h2>
                <p className="text-xs text-slate-500 mt-1">Visualisation et stockage des mandats de tous les cabinets associés</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 rounded-2xl hover:border-gold/30 cursor-pointer">
                  <FolderOpen size={36} className="text-gold mb-4" />
                  <span className="text-xs font-bold block">Mandats de Cabinet</span>
                  <p className="text-[10px] text-slate-500 mt-1">3 fichiers signés</p>
                </div>
                <div className="glass-card p-6 rounded-2xl hover:border-gold/30 cursor-pointer">
                  <FolderOpen size={36} className="text-gold mb-4" />
                  <span className="text-xs font-bold block">Déclarations T2 Générales</span>
                  <p className="text-[10px] text-slate-500 mt-1">12 fichiers archivés</p>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================
              6. OUTILS D'ANALYSE
             ============================================================ */}
          {activeTab === 'analysis' && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h2 className="text-xl font-serif font-bold text-ivoire">Outils d'Analyse Réseau</h2>
                <p className="text-xs text-slate-500 mt-1">Consolidation fiscale du cabinet national Compta-Flow</p>
              </div>

              <div className="glass-card p-8 rounded-3xl space-y-6">
                <h3 className="text-sm font-bold text-ivoire uppercase border-b border-white/5 pb-2">TPS / TVQ Consolide Canada</h3>
                <p className="text-xs text-slate-400">Cliquez pour compiler tous les rapports de taxes collectés par vos 3 cabinets.</p>
                <button
                  onClick={() => {
                    toast.success('Rapport annuel consolidé exporté.');
                  }}
                  type="button"
                  className="px-6 py-3 bg-gold text-noir text-xs font-black uppercase tracking-wider rounded-xl hover:bg-gold-light"
                >
                  Générer rapport consolidé (XLS)
                </button>
              </div>
            </div>
          )}

          {/* ============================================================
              7. CALENDRIER
             ============================================================ */}
          {activeTab === 'calendar' && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h2 className="text-xl font-serif font-bold text-ivoire">Calendrier Réseau National</h2>
                <p className="text-xs text-slate-500 mt-1">Jalons des déclarations de revenus provinciales et fédérales au Canada</p>
              </div>

              <div className="glass-card p-6 rounded-3xl text-center py-20 text-slate-500">
                <CalendarIcon size={48} className="mx-auto text-slate-600 mb-4" />
                <span className="text-xs font-bold text-ivoire block">Calendrier de Réseau Actif</span>
                <span className="text-[10px] text-slate-600 block mt-1">Prochaine date de remise : 30 Juin 2026 (TPS/TVQ Québec)</span>
              </div>
            </div>
          )}

          {/* ============================================================
              8. MESSAGERIE D'ÉQUIPE
             ============================================================ */}
          {activeTab === 'messaging' && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h2 className="text-xl font-serif font-bold text-ivoire">Messagerie Réseau</h2>
                <p className="text-xs text-slate-500 mt-1">Communication directe avec vos administrateurs et comptables associés</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 h-[500px]">
                {/* Teammates List */}
                <div className="glass-card p-4 rounded-3xl overflow-y-auto space-y-2 md:col-span-1">
                  {['Sylvie Charette-Clément', 'Eya', 'Stéphanie Laplante'].map(name => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setActiveChatMember(name)}
                      className={`w-full text-left p-3 rounded-2xl transition-all border flex items-center gap-3 ${
                        activeChatMember === name ? 'bg-gold/10 border-gold/30 text-ivoire' : 'bg-white/2 border-transparent text-slate-400'
                      }`}
                    >
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-xs font-bold">{name}</span>
                    </button>
                  ))}
                </div>

                {/* Conversation area */}
                <div className="glass-card p-6 rounded-3xl md:col-span-3 flex flex-col justify-between bg-[#070707]">
                  <h4 className="text-xs font-black uppercase tracking-wider text-ivoire border-b border-white/5 pb-2">{activeChatMember}</h4>
                  
                  <div className="flex-1 overflow-y-auto py-4 space-y-3 text-xs custom-scrollbar">
                    {(chatMessages[activeChatMember] || []).map((msg, i) => (
                      <div key={i} className={`flex flex-col ${msg.sender === 'Owner' ? 'items-end' : 'items-start'}`}>
                        <div className={`p-3 rounded-2xl max-w-md ${
                          msg.sender === 'Owner' ? 'bg-gold text-noir font-semibold rounded-tr-none' : 'bg-white/5 text-ivoire border border-white/5 rounded-tl-none'
                        }`}>
                          <p>{msg.text}</p>
                        </div>
                        <span className="text-[9px] text-slate-600 mt-1">{msg.time}</span>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSendChatMessage} className="border-t border-white/5 pt-4 flex gap-2">
                    <input
                      type="text"
                      value={newChatMessage}
                      onChange={(e) => setNewChatMessage(e.target.value)}
                      placeholder="Tapez votre message..."
                      className="flex-1 bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs outline-none focus:border-gold font-bold text-ivoire"
                    />
                    <button type="submit" className="p-3 bg-gold text-noir rounded-xl"><Send size={16} /></button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================
              9. TARIFS ET SERVICES
             ============================================================ */}
          {activeTab === 'services' && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h2 className="text-xl font-serif font-bold text-ivoire">Grille Tarifaire Réseau</h2>
                <p className="text-xs text-slate-500 mt-1">Ajustement global des tarifs de vente Compta-Flow</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {services.map(service => (
                  <div key={service.id} className="glass-card p-6 rounded-2xl flex flex-col justify-between hover:border-gold/30">
                    <div>
                      <span className="text-[9px] px-2 py-0.5 border border-gold/30 text-gold rounded-full font-black uppercase tracking-wider">{service.category}</span>
                      <h3 className="text-sm font-bold text-ivoire mt-4">{service.name}</h3>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">{service.description}</p>
                    </div>

                    <div className="border-t border-white/5 mt-6 pt-4 flex justify-between items-center">
                      <div>
                        {editingServiceId === service.id ? (
                          <input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(Number(e.target.value))}
                            className="w-20 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs font-bold text-ivoire"
                          />
                        ) : (
                          <span className="text-lg font-serif font-bold text-gold">{service.price} $ <span className="text-[10px] text-slate-500">/ {service.period}</span></span>
                        )}
                      </div>

                      {editingServiceId === service.id ? (
                        <button type="button" onClick={() => handleSavePrice(service.id)} className="px-3 py-1 bg-emerald-500 text-noir text-[10px] font-black uppercase tracking-wider rounded-lg">Sauver</button>
                      ) : (
                        <button type="button" onClick={() => handleEditPrice(service.id, service.price)} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-gold"><Edit3 size={14} /></button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================
              10. OUTILS FINANCIERS (CALCULATRICE)
             ============================================================ */}
          {activeTab === 'calculators' && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h2 className="text-xl font-serif font-bold text-ivoire">Outils de Simulation Fiscale</h2>
                <p className="text-xs text-slate-500 mt-1">Calculateurs de taxes provinciales (TPS/TVQ/HST) et marges globales</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Tax Calculator */}
                <div className="glass-card p-8 rounded-3xl space-y-4">
                  <h3 className="text-sm font-bold text-ivoire uppercase tracking-wider border-b border-white/5 pb-2">Taxes Canada</h3>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-2 font-bold uppercase">Montant HT</label>
                    <input type="number" value={calcAmount} onChange={(e) => setCalcAmount(Number(e.target.value))} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs outline-none focus:border-gold text-ivoire font-bold" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-2 font-bold uppercase">Région</label>
                    <select value={calcProvince} onChange={(e) => setCalcProvince(e.target.value)} className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3 text-xs outline-none focus:border-gold text-ivoire font-bold">
                      <option value="QC">Québec (TPS 5% + TVQ 9.975%)</option>
                      <option value="ON">Ontario (HST 13%)</option>
                    </select>
                  </div>
                  <div className="p-4 bg-white/2 rounded font-mono text-xs space-y-2">
                    <div className="flex justify-between"><span>Base HT:</span><span>{calcAmount.toFixed(2)} $</span></div>
                    <div className="flex justify-between text-slate-500"><span>TPS/HST:</span><span>{calcTaxesResults.tps.toFixed(2)} $</span></div>
                    {calcProvince === 'QC' && <div className="flex justify-between text-slate-500"><span>TVQ:</span><span>{calcTaxesResults.tvq.toFixed(2)} $</span></div>}
                    <div className="flex justify-between text-gold font-bold border-t border-white/5 pt-2"><span>Total TTC:</span><span>{calcTaxesResults.total.toFixed(2)} $</span></div>
                  </div>
                </div>

                {/* Margins */}
                <div className="glass-card p-8 rounded-3xl space-y-4">
                  <h3 className="text-sm font-bold text-ivoire uppercase tracking-wider border-b border-white/5 pb-2">Simulateur de Marges</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-2 font-bold uppercase">Coût</label>
                      <input type="number" value={marginCost} onChange={(e) => setMarginCost(Number(e.target.value))} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs outline-none focus:border-gold text-ivoire font-bold" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-2 font-bold uppercase">Vente</label>
                      <input type="number" value={marginPrice} onChange={(e) => setMarginPrice(Number(e.target.value))} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs outline-none focus:border-gold text-ivoire font-bold" />
                    </div>
                  </div>
                  <div className="p-4 bg-white/2 rounded font-mono text-xs space-y-2">
                    <div className="flex justify-between"><span>Profit :</span><span className="text-emerald-400">{(marginPrice - marginCost).toFixed(2)} $</span></div>
                    <div className="flex justify-between text-slate-500"><span>Marge :</span><span>{calcMarginResults.margin.toFixed(1)}%</span></div>
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
              <div>
                <h2 className="text-xl font-serif font-bold text-ivoire">Notes Réseau</h2>
                <p className="text-xs text-slate-500 mt-1">Notes collantes partagées ou privées pour le suivi réseau</p>
              </div>

              <form onSubmit={handleAddNote} className="glass-card p-6 rounded-2xl flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider block mb-2">Contenu de la note réseau</label>
                  <input
                    type="text"
                    required
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="ex: Mettre à jour la clé API Stripe..."
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs outline-none focus:border-gold text-ivoire font-bold"
                  />
                </div>
                <button type="submit" className="px-6 py-3 bg-gold text-noir text-xs font-black uppercase tracking-wider rounded-xl">Ajouter</button>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {notes.map(note => {
                  const colorClasses = {
                    yellow: 'bg-[#FFF9C4] text-slate-800 border-l-4 border-amber-400',
                    green: 'bg-[#C8E6C9] text-slate-800 border-l-4 border-emerald-500',
                    pink: 'bg-[#F8BBD0] text-slate-800 border-l-4 border-pink-500',
                    blue: 'bg-[#B3E5FC] text-slate-800 border-l-4 border-sky-500'
                  };
                  return (
                    <div key={note.id} className={`p-5 rounded-2xl flex flex-col justify-between h-48 shadow-lg ${colorClasses[note.color]}`}>
                      <p className="text-xs font-semibold leading-relaxed overflow-y-auto">{note.text}</p>
                      <div className="flex justify-between items-center border-t border-black/5 mt-4 pt-2">
                        <span className="text-[9px] text-slate-500 font-bold">{new Date(note.createdAt).toLocaleDateString('fr-CA')}</span>
                        <button type="button" onClick={() => handleDeleteNote(note.id)} className="text-slate-500 hover:text-red-500"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================
              11. COFFRE-FORT RÉSEAU
             ============================================================ */}
          {activeTab === 'vault' && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h2 className="text-xl font-serif font-bold text-ivoire">Coffre-fort Réseau Global</h2>
                <p className="text-xs text-slate-500 mt-1">Accès sécurisé à l'infrastructure d'hébergement, aux clés de production et identifiants Stripe</p>
              </div>

              {!isVaultUnlocked ? (
                <div className="glass-card max-w-md mx-auto p-8 rounded-3xl text-center space-y-6">
                  <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto text-red-400"><LockKeyhole size={32} /></div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-ivoire">Coffre maître</h3>
                  <form onSubmit={handleUnlockVault} className="space-y-4">
                    <input type="password" required value={vaultPassword} onChange={(e) => setVaultPassword(e.target.value)} placeholder="Mot de passe réseau..." className="w-full text-center bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs outline-none focus:border-red-500 text-ivoire font-bold" />
                    <button type="submit" className="w-full py-3 bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-500/30">Déchiffrer</button>
                  </form>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                    <span className="text-xs font-bold flex items-center gap-2"><LockOpen size={16} /> Clés secrètes déchiffrées</span>
                    <button type="button" onClick={() => setIsVaultUnlocked(false)} className="text-xs font-bold hover:underline">Verrouiller</button>
                  </div>
                  <div className="glass-card p-6 rounded-2xl space-y-3 font-mono text-xs">
                    <div className="p-2 bg-white/2 rounded"><span>SUPABASE_SERVICE_ROLE_KEY :</span> <span className="text-amber-400">sb_service_role_Platform_Secret...••••••••</span></div>
                    <div className="p-2 bg-white/2 rounded"><span>STRIPE_WEBHOOK_SECRET :</span> <span className="text-amber-400">whsec_ca_central_51A8f...••••••••</span></div>
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
                <h2 className="text-xl font-serif font-bold text-ivoire">Configuration Système</h2>
                <p className="text-xs text-slate-500 mt-1">Préférences du réseau compta-flow.net et autorisations globales</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-card p-8 rounded-3xl space-y-4">
                  <h3 className="text-sm font-bold text-ivoire uppercase border-b border-white/5 pb-2">Couleur Réseau</h3>
                  <div className="flex gap-4">
                    {['gold', 'emerald', 'sapphire'].map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setThemeColor(color as any)}
                        className={`px-4 py-2 border rounded-xl text-xs font-bold uppercase transition-all ${
                          themeColor === color ? 'border-gold text-gold bg-gold/10' : 'border-white/5 text-slate-400'
                        }`}
                      >
                        {color === 'gold' ? 'Or ComptaFlow' : color === 'emerald' ? 'Émeraude' : 'Saphir'}
                      </button>
                    ))}
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

export default SuperAdminPortalShell;
