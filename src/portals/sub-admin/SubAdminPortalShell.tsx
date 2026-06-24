import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Receipt, FolderOpen, BarChart3, Calendar as CalendarIcon, 
  MessageSquare, Tags, Calculator, StickyNote as StickyIcon, Lock, Settings as SettingsIcon,
  Bell, Sun, Cloud, Plus, Search, Trash2, LockOpen, Key, Check, CheckCircle2, 
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
  
  // Date & Weather simulation
  const [dateStr, setDateStr] = useState<string>('');
  const [weather, setWeather] = useState({ city: 'Montréal', temp: 22, icon: '☀️', text: 'Ensoleillé' });

  // Notifications state
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Nouveau reçu Dext', message: 'Stéphanie Laplante a téléversé un reçu de 172.46 $', time: 'Il y a 5 min', unread: true },
    { id: 2, title: 'Dépôt Stripe validé', message: 'Sébastien Roy a payé le dépôt de 325.00 $ pour Le Rattrapage', time: 'Il y a 1h', unread: true },
    { id: 3, title: 'Formulaire étudiant reçu', message: 'Antoine Tremblay a complété son onboarding', time: 'Il y a 3h', unread: false }
  ]);
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
    { id: '5', name: 'Impôts Personnels', description: 'Déclaration de revenus personnelle standard avec crédits canadiens.', price: 99, period: 'unique', category: 'Impôts' },
    { id: '6', name: 'Corporations (T2/CO-17)', description: 'Production complète des déclarations fiscales d\'entreprises provinciales et fédérales.', price: 599, period: 'unique', category: 'Impôts Corp' },
    { id: '7', name: 'États Financiers Annuels', description: 'Génération de bilan, compte de résultat et notes explicatives.', price: 799, period: 'unique', category: 'Comptabilité' }
  ]);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);

  // Finance Tools Calculator state
  const [calcAmount, setCalcAmount] = useState<number>(100);
  const [calcProvince, setCalcProvince] = useState<string>('QC');
  const [marginCost, setMarginCost] = useState<number>(50);
  const [marginPrice, setMarginPrice] = useState<number>(100);

  // Team Chat state
  const [activeChatMember, setActiveChatMember] = useState<string>('Stéphanie Laplante');
  const [chatMessages, setChatMessages] = useState<Record<string, Array<{ sender: string; text: string; time: string }>>>({
    'Stéphanie Laplante': [
      { sender: 'Stéphanie Laplante', text: 'Bonjour, j\'ai déposé mes derniers reçus Bureau en Gros dans mon Dext. Pouvez-vous valider la TPS/TVQ?', time: '14:23' },
      { sender: 'Cabinet', text: 'Bonjour Stéphanie! Oui, je vois les reçus. Je procède à l\'intégration fiscale dans votre portail dès maintenant.', time: '14:30' }
    ],
    'Sylvie Charette-Clément': [
      { sender: 'Sylvie Charette-Clément', text: 'Bonjour, as-tu fini d\'analyser les dossiers de rattrapage de Sébastien Roy?', time: '09:15' },
      { sender: 'Cabinet', text: 'Presque, il manque les relevés Stripe du mois de mars, je viens de lui envoyer une relance.', time: '09:40' }
    ],
    'Eya': [
      { sender: 'Eya', text: 'Le client Antoine Tremblay demande s\'il peut avoir son remboursement d\'impôt étudiant par virement Interac direct.', time: 'Hier' },
      { sender: 'Cabinet', text: 'Oui, son onboarding montre un profil Ontario valide, on peut faire le virement Interac dès la validation de sa T4.', time: 'Hier' }
    ]
  });
  const [newChatMessage, setNewChatMessage] = useState('');

  // Settings state
  const [themeColor, setThemeColor] = useState<'emerald' | 'gold' | 'sapphire'>('gold');
  const [newPassword, setNewPassword] = useState('');
  const [employeePermissions, setEmployeePermissions] = useState({
    sylvie: { read: true, write: true, delete: false },
    eya: { read: true, write: true, delete: false },
    stephanie: { read: true, write: false, delete: false }
  });

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

    // Simulated Weather variations
    const hours = new Date().getHours();
    if (hours > 18 || hours < 6) {
      setWeather({ city: 'Montréal', temp: 17, icon: '🌙', text: 'Dégagé' });
    } else if (Math.random() > 0.5) {
      setWeather({ city: 'Montréal', temp: 22, icon: '☀️', text: 'Ensoleillé' });
    } else {
      setWeather({ city: 'Montréal', temp: 19, icon: '🌤️', text: 'Partiellement nuageux' });
    }

    // Load Sticky Notes from LocalStorage
    const savedNotes = localStorage.getItem(`comptaflow_notes_${userData?.id || 'default'}`);
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    } else {
      const initialNotes: StickyNoteItem[] = [
        { id: '1', text: 'Appeler Sébastien Roy pour ses relevés Stripe manquants.', color: 'yellow', createdAt: new Date().toISOString() },
        { id: '2', text: 'Vérifier la déclaration T4 Ontario d\'Antoine Tremblay.', color: 'green', createdAt: new Date().toISOString() },
        { id: '3', text: 'Préparer la réunion mensuelle de Stéphanie Laplante le 30 juin.', color: 'pink', createdAt: new Date().toISOString() }
      ];
      setNotes(initialNotes);
      localStorage.setItem(`comptaflow_notes_${userData?.id || 'default'}`, JSON.stringify(initialNotes));
    }
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

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const newNote: StickyNoteItem = {
      id: Date.now().toString(),
      text: newNoteText,
      color: newNoteColor,
      createdAt: new Date().toISOString()
    };

    saveNotes([newNote, ...notes]);
    setNewNoteText('');
    toast.success('Note ajoutée !');
  };

  const handleDeleteNote = (id: string) => {
    const filtered = notes.filter(n => n.id !== id);
    saveNotes(filtered);
    toast.success('Note supprimée.');
  };

  // Vault unlocking action
  const handleUnlockVault = (e: React.FormEvent) => {
    e.preventDefault();
    if (vaultPassword === 'admin1234') {
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
    
    // Simulate auto reply after 1.5 seconds
    setTimeout(() => {
      const mockReplies: Record<string, string> = {
        'Stéphanie Laplante': 'Merci pour votre réponse rapide! J\'attends la confirmation de déclaration dans mon dossier.',
        'Sylvie Charette-Clément': 'Parfait, tiens-moi au courant dès que Roy t\'envoie ça.',
        'Eya': 'Super, je m\'occupe de lui faire signer le mandat électronique.'
      };
      
      const responseText = mockReplies[activeChatMember] || 'Merci pour l\'information.';
      
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
    let tps = 0;
    let tvq = 0;
    if (calcProvince === 'QC') {
      tps = calcAmount * 0.05;
      tvq = calcAmount * 0.09975;
    } else if (calcProvince === 'ON') {
      tps = calcAmount * 0.13; // HST 13%
    } else if (calcProvince === 'BC') {
      tps = calcAmount * 0.05;
      tvq = calcAmount * 0.07; // PST 7%
    } else {
      tps = calcAmount * 0.05; // Standard GST 5%
    }
    const total = calcAmount + tps + tvq;
    return { tps, tvq, total };
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
              {userData?.fullName?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black truncate">{userData?.fullName || 'Administrateur'}</p>
              <span className="text-[9px] uppercase tracking-wider text-gold font-bold">Cabinet Associé</span>
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
              Bonjour, <span className={`${activeTheme.accent} ${activeTheme.textGlow}`}>{userData?.fullName || 'Administrateur'}</span>
            </h1>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Cabinet de tenue de livres</p>
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
                    <h3 className="text-xs font-black uppercase tracking-wider">Alertes Production</h3>
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
              1. TABLEAU DE BORD (DASHBOARD)
             ============================================================ */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Overview Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-black tracking-wider">Chiffre d'Affaires</p>
                      <h3 className="text-2xl font-bold mt-2 font-serif text-ivoire">18 450.00 $</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                      <TrendingUp size={20} />
                    </div>
                  </div>
                  <p className="text-xs text-emerald-400 mt-4 flex items-center gap-1">
                    <span className="font-bold">+12.4%</span> ce mois-ci
                  </p>
                </div>

                <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-black tracking-wider">Clients Cabinet</p>
                      <h3 className="text-2xl font-bold mt-2 font-serif text-ivoire">{adminClients.length} Actifs</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                      <Users size={20} />
                    </div>
                  </div>
                  <p className="text-xs text-emerald-400 mt-4 flex items-center gap-1">
                    <span className="font-bold">+3</span> nouveaux dossiers
                  </p>
                </div>

                <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-black tracking-wider">Taux de Complétion</p>
                      <h3 className="text-2xl font-bold mt-2 font-serif text-ivoire">94.8%</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                      <CheckCircle2 size={20} />
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-4">
                    Objectif de dépôt mensuel : 95%
                  </p>
                </div>

                <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-black tracking-wider">TPS / TVQ Estimée</p>
                      <h3 className="text-2xl font-bold mt-2 font-serif text-ivoire">1 259.40 $</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                      <Calculator size={20} />
                    </div>
                  </div>
                  <p className="text-xs text-amber-400 mt-4">
                    TPS: 420.50 $ | TVQ: 838.90 $
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
                  {/* Stéphanie Row */}
                  <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-gold/20 transition-all">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-ivoire">Stéphanie Laplante</span>
                        <span className="text-[10px] px-2 py-0.5 border border-gold/30 text-gold rounded-full uppercase tracking-wider font-semibold">Forfaits Mensuels</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Laplante Design Inc. • QC • 14 Reçus Dext OCR</p>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                      <div className="text-right">
                        <span className="text-[10px] text-emerald-400 font-bold block">✓ Dext lié</span>
                        <span className="text-xs font-serif text-slate-400">TPS: 7.50$ | TVQ: 14.96$</span>
                      </div>
                      <button type="button" className="px-4 py-2 bg-gold text-noir text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-gold-light transition-colors">
                        Traiter
                      </button>
                    </div>
                  </div>

                  {/* Antoine Row */}
                  <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-gold/20 transition-all">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-ivoire">Antoine Tremblay</span>
                        <span className="text-[10px] px-2 py-0.5 border border-blue-500/30 text-blue-400 rounded-full uppercase tracking-wider font-semibold">L'Étudiant</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Ontario • 2025 • Tremblay_T4_Releve8_2025.zip</p>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                      <div className="text-right">
                        <span className="text-[10px] text-amber-400 font-bold block">⚠️ Fichiers reçus</span>
                        <span className="text-xs font-serif text-slate-400">Calculateur T4 Ontario</span>
                      </div>
                      <button type="button" className="px-4 py-2 bg-white/5 border border-white/10 text-ivoire text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-white/10 transition-colors">
                        Télécharger
                      </button>
                    </div>
                  </div>

                  {/* Sébastien Row */}
                  <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-gold/20 transition-all">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-ivoire">Sébastien Roy</span>
                        <span className="text-[10px] px-2 py-0.5 border border-purple-500/30 text-purple-400 rounded-full uppercase tracking-wider font-semibold">Le Rattrapage</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Roy Rénovation • QC • 6 Mois manquants</p>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                      <div className="text-right">
                        <span className="text-[10px] text-emerald-400 font-bold block">✓ Dépôt Stripe payé</span>
                        <span className="text-xs font-serif text-slate-400">Google Drive: Roy_Rattrapage_2025</span>
                      </div>
                      <button type="button" className="px-4 py-2 bg-gold text-noir text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-gold-light transition-colors">
                        Reconcilier
                      </button>
                    </div>
                  </div>
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
                          placeholder="ex: Stéphanie Laplante"
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
                          placeholder="ex: stephanie@comptaflow.com"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider block mb-2">Entreprise (Optionnel)</label>
                        <input
                          type="text"
                          value={newClientCompany}
                          onChange={(e) => setNewClientCompany(e.target.value)}
                          className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs outline-none focus:border-gold transition-colors text-ivoire font-bold"
                          placeholder="ex: Laplante Design Inc."
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
                  <p className="text-xs text-slate-500 mt-1">Dépôts Stripe, remboursements et intégrations de factures fiscales</p>
                </div>
                <div className="flex gap-4">
                  <span className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold">Total Entrées: +24 890 $</span>
                  <span className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold">Total Sorties: -4 120 $</span>
                </div>
              </div>

              {/* Transactions List */}
              <div className="glass-card rounded-3xl overflow-hidden">
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
                    <tr className="hover:bg-white/1">
                      <td className="p-5 text-slate-400 font-semibold">24 Juin 2026</td>
                      <td className="p-5 font-bold">
                        Dépôt Stripe - Sébastien Roy
                        <span className="text-[10px] text-slate-500 block">Service Le Rattrapage (Acompte)</span>
                      </td>
                      <td className="p-5 text-emerald-400 font-bold">Entrée</td>
                      <td className="p-5 font-bold">325.00 $</td>
                      <td className="p-5">
                        <span className="px-2.5 py-0.5 border border-emerald-500/30 text-emerald-400 bg-emerald-500/5 rounded-full font-black uppercase text-[9px] tracking-wider">Payé</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-white/1">
                      <td className="p-5 text-slate-400 font-semibold">23 Juin 2026</td>
                      <td className="p-5 font-bold">
                        Abonnement Dext Premium Partner
                        <span className="text-[10px] text-slate-500 block">Licence mensuelle cabinet</span>
                      </td>
                      <td className="p-5 text-red-400 font-bold">Sortie</td>
                      <td className="p-5 font-bold">149.00 $</td>
                      <td className="p-5">
                        <span className="px-2.5 py-0.5 border border-emerald-500/30 text-emerald-400 bg-emerald-500/5 rounded-full font-black uppercase text-[9px] tracking-wider">Payé</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-white/1">
                      <td className="p-5 text-slate-400 font-semibold">22 Juin 2026</td>
                      <td className="p-5 font-bold">
                        Facture Honoraires - Stéphanie Laplante
                        <span className="text-[10px] text-slate-500 block">Forfaits Mensuels (Tenue de livres Juin)</span>
                      </td>
                      <td className="p-5 text-emerald-400 font-bold">Entrée</td>
                      <td className="p-5 font-bold">199.00 $</td>
                      <td className="p-5">
                        <span className="px-2.5 py-0.5 border border-amber-500/30 text-amber-400 bg-amber-500/5 rounded-full font-black uppercase text-[9px] tracking-wider">En attente</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-white/1">
                      <td className="p-5 text-slate-400 font-semibold">18 Juin 2026</td>
                      <td className="p-5 font-bold">
                        Facture - Roy Rénovation
                        <span className="text-[10px] text-slate-500 block">Rattrapage Comptable (Solde impayé)</span>
                      </td>
                      <td className="p-5 text-emerald-400 font-bold">Entrée</td>
                      <td className="p-5 font-bold">450.00 $</td>
                      <td className="p-5">
                        <span className="px-2.5 py-0.5 border border-red-500/30 text-red-400 bg-red-500/5 rounded-full font-black uppercase text-[9px] tracking-wider">En retard</span>
                      </td>
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
                    <span className="text-[10px] text-slate-500 font-bold">14 Fichiers</span>
                  </div>
                  <h3 className="text-sm font-bold text-ivoire mt-4">Tenue de Livres Mensuelle</h3>
                  <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">Dossier : Dext & Banque</p>
                  <div className="border-t border-white/5 mt-4 pt-4 flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-medium">Stéphanie Laplante</span>
                    <ChevronRight size={14} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Tax Folders */}
                <div className="glass-card p-6 rounded-2xl hover:border-gold/30 cursor-pointer group">
                  <div className="flex justify-between items-start">
                    <FolderOpen size={40} className="text-gold" />
                    <span className="text-[10px] text-slate-500 font-bold">6 Fichiers</span>
                  </div>
                  <h3 className="text-sm font-bold text-ivoire mt-4">Déclarations Fiscales T4</h3>
                  <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">Dossier : Impôts Canada</p>
                  <div className="border-t border-white/5 mt-4 pt-4 flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-medium">Antoine Tremblay</span>
                    <ChevronRight size={14} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Contracts folder */}
                <div className="glass-card p-6 rounded-2xl hover:border-gold/30 cursor-pointer group">
                  <div className="flex justify-between items-start">
                    <FolderOpen size={40} className="text-gold" />
                    <span className="text-[10px] text-slate-500 font-bold">3 Fichiers</span>
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
                        <span className="text-[9px] text-slate-500">Différence Stripe/Dext vs Soldes</span>
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
                    Cliquez sur le bouton ci-dessous pour compiler les rapports financiers. Le système compile les données provenant de Dext et de la base de données Supabase automatiquement.
                  </p>

                  <button
                    onClick={() => {
                      toast.success('Rapport généré avec succès ! Le fichier XLS a été préparé.');
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
                <p className="text-xs text-slate-500 mt-1">Suivi des remises de taxes gouvernementales et rendez-vous clients</p>
              </div>

              {/* Interactive Calendar layout */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                
                {/* Events list */}
                <div className="glass-card p-6 rounded-2xl space-y-4 md:col-span-1">
                  <h3 className="text-xs font-black uppercase tracking-wider border-b border-white/5 pb-2">Dates de remise</h3>
                  
                  <div className="space-y-3">
                    <div className="p-3 bg-red-500/10 border-l-2 border-red-500 rounded-r-xl">
                      <span className="text-[10px] text-slate-400 block font-bold">30 Juin 2026</span>
                      <span className="text-xs font-bold text-ivoire block">Déclaration TPS/TVQ Q2</span>
                    </div>

                    <div className="p-3 bg-amber-500/10 border-l-2 border-amber-500 rounded-r-xl">
                      <span className="text-[10px] text-slate-400 block font-bold">02 Juillet 2026</span>
                      <span className="text-xs font-bold text-ivoire block">Revue Stéphanie Laplante</span>
                    </div>

                    <div className="p-3 bg-blue-500/10 border-l-2 border-blue-500 rounded-r-xl">
                      <span className="text-[10px] text-slate-400 block font-bold">15 Juillet 2026</span>
                      <span className="text-xs font-bold text-ivoire block">Rattrapage Roy final</span>
                    </div>
                  </div>
                </div>

                {/* Calendar grid */}
                <div className="glass-card p-6 rounded-3xl md:col-span-3">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-sm font-bold text-ivoire">Juin 2026</span>
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
                      const hasEvent = day === 15 || day === 30;
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
                <p className="text-xs text-slate-500 mt-1">Espace de communication interne avec les partenaires cabinet et collaborateurs</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 h-[550px] overflow-hidden">
                
                {/* Teammates List */}
                <div className="glass-card p-4 rounded-3xl space-y-4 md:col-span-1 overflow-y-auto">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-4 px-2">Collaborateurs</h3>
                  <div className="space-y-2">
                    {['Stéphanie Laplante', 'Sylvie Charette-Clément', 'Eya'].map(member => (
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
                          <span className="text-[9px] text-slate-500 block">En ligne</span>
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
                      <span className="text-[9px] text-emerald-400 font-bold block mt-0.5">Actif(ve) actuellement</span>
                    </div>
                  </div>

                  {/* Messages log */}
                  <div className="flex-1 overflow-y-auto py-4 space-y-3 custom-scrollbar text-xs">
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
                <p className="text-xs text-slate-500 mt-1">Gestion et mise à jour dynamique de la grille tarifaire des 7 services</p>
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
                <p className="text-xs text-slate-500 mt-1">Accès restreint aux clés API, identifiants Stripe et identifiants Dext clients</p>
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
                      <LockOpen size={16} /> Session déchiffrée - Vos clés d'accès sont actives.
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsVaultUnlocked(false)}
                      className="text-xs font-black uppercase tracking-wider hover:underline"
                    >
                      Verrouiller
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-card p-6 rounded-2xl space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-wider border-b border-white/5 pb-2 text-ivoire flex items-center gap-2">
                        <Key size={14} className="text-gold" /> Identifiants Dext Clients
                      </h4>
                      <div className="space-y-3 text-xs">
                        <div className="flex justify-between p-2 bg-white/2 rounded">
                          <span className="font-bold text-slate-400">Stéphanie Laplante :</span>
                          <span className="font-mono">stephanie@dext.cc (Dext Auto-link)</span>
                        </div>
                        <div className="flex justify-between p-2 bg-white/2 rounded">
                          <span className="font-bold text-slate-400">Sébastien Roy :</span>
                          <span className="font-mono">roy.renov@dext.cc (Dext-API key check)</span>
                        </div>
                      </div>
                    </div>

                    <div className="glass-card p-6 rounded-2xl space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-wider border-b border-white/5 pb-2 text-ivoire flex items-center gap-2">
                        <Shield size={14} className="text-gold" /> Intégration Passerelles (Stripe Live API keys)
                      </h4>
                      <div className="space-y-3 text-xs font-mono">
                        <div className="p-3 bg-white/2 rounded relative group">
                          <span className="text-[10px] text-slate-500 block">STRIPE_SECRET_KEY</span>
                          <span className="block truncate text-amber-400 mt-1">sk_live_51PcfL...••••••••••••••••</span>
                        </div>
                      </div>
                    </div>
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
                <p className="text-xs text-slate-500 mt-1">Personnalisation du cabinet, mot de passe de sécurité et droits collaborateurs</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Theme Customizer Card */}
                <div className="glass-card p-8 rounded-3xl space-y-4">
                  <h3 className="text-sm font-bold text-ivoire uppercase tracking-wider border-b border-white/5 pb-2">Personnalisation visuelle</h3>
                  <p className="text-xs text-slate-500 leading-normal">Sélectionnez la couleur thématique principale pour adapter la palette du cabinet de finance.</p>
                  
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
                        toast.success('Mot de passe mis à jour avec succès.');
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
                      <span>Sylvie Charette-Clément</span>
                      <span className="text-[10px] text-emerald-400 font-bold">Accès Écrit/Lecture</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Eya</span>
                      <span className="text-[10px] text-emerald-400 font-bold">Accès Écrit/Lecture</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Stéphanie Laplante</span>
                      <span className="text-[10px] text-amber-400 font-bold">Accès Lecture seule</span>
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
