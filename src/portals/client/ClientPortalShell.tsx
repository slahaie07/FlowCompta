import React, { useState, useEffect } from 'react';
import { 
  Home, Shield, FolderOpen, MessageSquare, CreditCard, Tags, FileText, 
  HelpCircle, ChevronDown, Send, Paperclip, Clock, Sun, Cloud, Check, 
  Trash2, AlertCircle, Play, FileCheck, ArrowRight, DollarSign, PenTool, X, LogOut, Calendar as CalendarIcon, Search
} from 'lucide-react';
import { EliteSignature } from '../../components/ui/EliteSignature';
import { generateContract } from '../../lib/contractEngine';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';

interface ClientPortalShellProps {
  userData: any;
  onLogout: () => void;
  currentMode: string;
  onToggleMode: () => void;
  onRefreshProfile?: () => void;
  routeContext?: any;
}

interface StickyNoteItem {
  id: string;
  text: string;
  createdAt: string;
}

export function ClientPortalShell({
  userData,
  onLogout,
  onRefreshProfile
}: ClientPortalShellProps) {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<string>('home');

  // Time & Weather state
  const [currentTime, setCurrentTime] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [weather, setWeather] = useState({ city: 'Montréal', temp: 22, icon: '☀️' });

  // Accordion state for FAQ
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [faqSearch, setFaqSearch] = useState('');

  // Mandate signing state
  const [showMandateSigning, setShowMandateSigning] = useState(false);
  const [isMandateSigned, setIsMandateSigned] = useState(false);

  // Client notes
  const [notes, setNotes] = useState<string>('');

  // Invoices list state
  const [invoices, setInvoices] = useState([
    { id: 'inv-1', desc: 'Tenue de livres mensuelle - Juin 2026', amount: 199.00, status: 'À payer', date: '24 Juin 2026' },
    { id: 'inv-2', desc: 'Déclaration d\'impôt étudiant - 2025', amount: 49.00, status: 'Payé', date: '10 Mai 2026' }
  ]);
  const [showPaymentModal, setShowPaymentModal] = useState<any | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Documents/Vault list state
  const [clientDocuments, setClientDocuments] = useState<Array<{ id: string; name: string; size: string; date: string }>>([
    { id: 'doc-1', name: 'Facture_Bureau_En_Gros_Juin.pdf', size: '142 KB', date: 'Hier' },
    { id: 'doc-2', name: 'T4_Revenu_Canada_2025.pdf', size: '890 KB', date: '18 Juin 2026' }
  ]);

  // Tax rates from DB
  const [taxRates, setTaxRates] = useState<any[]>([]);

  // Chat message state
  const [chatMessages, setChatMessages] = useState([
    { sender: 'Cabinet', text: 'Bonjour! Je suis Sylvie, votre comptable assignée. J\'ai bien reçu vos reçus Dext de ce mois-ci. Pouvez-vous signer votre mandat électronique d\'autorisation?', time: '11:20' }
  ]);
  const [newMsg, setNewMsg] = useState('');

  // Calculator state
  const [calcAmount, setCalcAmount] = useState<number>(100);
  const [calcProvince, setCalcProvince] = useState<string>('QC');

  // Load live data from Supabase
  const loadLiveData = async () => {
    if (!userData?.id) return;
    
    // 1. Fetch Invoices
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        setInvoices(data.map(inv => ({
          id: inv.id,
          desc: inv.number + ' - ' + (inv.client_name || 'Service Comptable'),
          amount: Number(inv.amount),
          status: inv.status === 'paid' ? 'Payé' : 'À payer',
          date: new Date(Number(inv.date)).toLocaleDateString('fr-CA')
        })));
      }
    } catch (e) {
      console.warn("Invoices load failed, using local mock.", e);
    }

    // 2. Fetch Documents
    try {
      const { data, error } = await supabase
        .from('documents_uploades')
        .select('*')
        .eq('client_id', userData.id)
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        setClientDocuments(data.map(doc => ({
          id: doc.id,
          name: doc.file_name,
          size: doc.file_size || 'Inconnu',
          date: new Date(Number(doc.upload_date)).toLocaleDateString('fr-CA')
        })));
      }
    } catch (e) {
      console.warn("Documents load failed, using local mock.", e);
    }

    // 3. Fetch Note
    try {
      const { data, error } = await supabase
        .from('quick_notes')
        .select('*')
        .eq('user_id', userData.id)
        .limit(1);
      if (!error && data && data[0]) {
        setNotes(data[0].text);
      }
    } catch (e) {
      console.warn("Notes load failed, using local storage fallback.", e);
    }

    // 4. Fetch Tax Rates
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
  };

  // Update clock & weather
  useEffect(() => {
    // Check if mandate is signed in localStorage
    if (localStorage.getItem(`comptaflow_mandate_signed_${userData?.id}`)) {
      setIsMandateSigned(true);
    }

    // Load client notes (localStorage first as fallback)
    const savedNotes = localStorage.getItem(`comptaflow_client_notes_${userData?.id || 'default'}`);
    if (savedNotes) setNotes(savedNotes);

    loadLiveData();

    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' }));
      
      const date = now.toLocaleDateString('fr-CA', { weekday: 'long', day: 'numeric', month: 'long' });
      setDateStr(date.charAt(0).toUpperCase() + date.slice(1));
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [userData?.id]);

  // Menu items list
  const menuItems = [
    { id: 'home', label: 'Accueil', icon: Home },
    { id: 'services', label: 'Mon Espace Services', icon: Shield },
    { id: 'vault', label: 'Coffre-fort Documentaire', icon: FolderOpen },
    { id: 'messaging', label: 'Messagerie Directe', icon: MessageSquare },
    { id: 'billing', label: 'Factures et Paiements', icon: CreditCard },
    { id: 'catalog', label: 'Catalogue des Services', icon: Tags },
    { id: 'notes', label: 'Mes Notes', icon: FileText },
    { id: 'faq', label: 'Centre d\'Aide & FAQ', icon: HelpCircle }
  ];

  // Mandate signing handler
  const handleSignatureComplete = () => {
    if (userData?.id) {
      localStorage.setItem(`comptaflow_mandate_signed_${userData.id}`, 'true');
    }
    setIsMandateSigned(true);
    setShowMandateSigning(false);
    toast.success('Félicitations! Votre mandat a été signé électroniquement.');
    if (onRefreshProfile) onRefreshProfile();
  };

  // Payment handler with DB update
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardExpiry || !cardCvc) {
      toast.error('Veuillez remplir tous les champs de paiement.');
      return;
    }
    setIsProcessingPayment(true);
    
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'paid' })
        .eq('id', showPaymentModal.id);
        
      if (error) throw error;
      
      toast.success('Paiement validé avec succès! Merci pour votre confiance.');
      setShowPaymentModal(null);
      loadLiveData();
    } catch (err) {
      // Fallback local state update
      setInvoices(prev => prev.map(inv => inv.id === showPaymentModal.id ? { ...inv, status: 'Payé' } : inv));
      toast.success('Paiement simulé en mode local.');
      setShowPaymentModal(null);
    } finally {
      setIsProcessingPayment(false);
      setCardNumber('');
      setCardExpiry('');
      setCardCvc('');
    }
  };

  // File upload with DB insertion
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && userData?.id) {
      const file = e.target.files[0];
      try {
        const newDoc = {
          client_id: userData.id,
          file_name: file.name,
          file_size: (file.size / 1024).toFixed(0) + ' KB',
          url: `https://unvyxfxlzhnutpugjxhe.supabase.co/storage/v1/object/public/documents/${file.name}`,
          upload_date: Date.now(),
          status: 'secure',
          category: 'general',
          source: 'client'
        };
        const { error } = await supabase
          .from('documents_uploades')
          .insert(newDoc);
          
        if (error) throw error;
        
        toast.success(`Fichier ${file.name} téléversé avec succès.`);
        loadLiveData();
      } catch (err: any) {
        console.warn("Database doc upload failed, saving locally.", err);
        const newDoc = {
          id: 'doc-' + Date.now(),
          name: file.name,
          size: (file.size / 1024).toFixed(0) + ' KB',
          date: 'À l\'instant'
        };
        setClientDocuments(prev => [newDoc, ...prev]);
        toast.warning(`Mode hors-ligne : Fichier enregistré temporairement.`);
      }
    }
  };

  // Document deletion with DB sync
  const handleDeleteDocument = async (id: string) => {
    try {
      const { error } = await supabase
        .from('documents_uploades')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Document supprimé du coffre-fort.');
      loadLiveData();
    } catch (e) {
      setClientDocuments(prev => prev.filter(d => d.id !== id));
      toast.success('Document supprimé localement.');
    }
  };

  // Chat send msg
  const handleSendChatMsg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim()) return;

    setChatMessages(prev => [
      ...prev,
      { sender: 'Client', text: newMsg, time: new Date().toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' }) }
    ]);
    setNewMsg('');

    // Simulated reply
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        { sender: 'Cabinet', text: 'Merci pour votre réponse, j\'ai mis à jour votre dossier.', time: new Date().toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' }) }
      ]);
    }, 2000);
  };

  // Notes saver with DB sync
  const handleNotesChange = async (text: string) => {
    setNotes(text);
    localStorage.setItem(`comptaflow_client_notes_${userData?.id || 'default'}`, text);
    try {
      const { data } = await supabase
        .from('quick_notes')
        .select('id')
        .eq('user_id', userData.id)
        .limit(1);
      if (data && data[0]) {
        await supabase
          .from('quick_notes')
          .update({ text })
          .eq('id', data[0].id);
      } else {
        await supabase
          .from('quick_notes')
          .insert({ user_id: userData.id, text, color: 'yellow' });
      }
    } catch (e) {
      console.warn("Quick notes save failed.", e);
    }
  };

  // FAQ entries
  const faqEntries = [
    { q: 'Comment soumettre mes reçus via Dext?', a: 'Vous pouvez utiliser l\'application mobile Dext en prenant une photo de vos reçus, ou envoyer vos factures PDF par courriel à votre adresse de soumission dédiée (ex: client@dext.cc). Les documents s\'importeront automatiquement.' },
    { q: 'Quels sont les délais pour soumettre mes documents d\'impôts?', a: 'Pour les déclarations personnelles de 2025, la date limite de soumission est le 30 Avril 2026. Pour les travailleurs autonomes, vous avez jusqu\'au 15 Juin 2026.' },
    { q: 'Comment fonctionne la facturation Compta-Flow?', a: 'La facturation s\'effectue de façon mensuelle automatique ou par mandat de service unique. Vous pouvez régler vos factures directement par carte bancaire de manière sécurisée dans l\'onglet "Factures et Paiements".' }
  ];

  const filteredFaq = faqEntries.filter(
    f => f.q.toLowerCase().includes(faqSearch.toLowerCase()) || f.a.toLowerCase().includes(faqSearch.toLowerCase())
  );

  // Dynamic tax calculation utilizing DB rates (Twist 2 solution)
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

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans relative w-full">
      {/* 🧭 LEFT SIDEBAR - COLONNE DE GAUCHE */}
      <nav className="w-72 h-screen bg-[#0F1E36] border-r border-slate-200 flex flex-col z-30 shrink-0 select-none text-white">
        
        {/* Brand/Logo */}
        <div className="p-8 border-b border-white/5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center text-[#0F1E36] font-bold shadow-md">
            CF
          </div>
          <div>
            <span className="font-serif font-bold text-amber-300 italic text-xl block tracking-wide">Compta-Flow</span>
            <span className="text-[9px] uppercase tracking-widest text-slate-400 block font-semibold mt-0.5">Espace Client</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-300 group focus:outline-none ${
                  isActive 
                    ? 'bg-white/10 text-amber-300 font-bold border-l-4 border-amber-400 shadow-sm' 
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-amber-300' : 'text-slate-400 group-hover:text-amber-300 transition-colors'} />
                <span className="text-xs tracking-wide text-left">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sidebar Profile Section */}
        <div className="p-6 border-t border-white/5 bg-black/10 flex items-center justify-between">
          <div className="min-w-0 flex-1 pr-3">
            <p className="text-xs font-black truncate">{userData?.fullName || userData?.displayName || 'Client ComptaFlow'}</p>
            <span className="text-[9px] text-slate-400 truncate block">{userData?.email}</span>
          </div>
          <button
            onClick={onLogout}
            type="button"
            className="p-2 hover:bg-white/5 text-slate-400 hover:text-red-400 rounded-lg transition-colors focus:outline-none"
            title="Se déconnecter"
          >
            <LogOut size={16} />
          </button>
        </div>
      </nav>

      {/* 🖥️ MAIN CONTENT - COLONNE DE DROITE */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 w-full relative">
        
        {/* 📋 HEADER - BARRE D'EN-TÊTE */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 shrink-0 shadow-sm">
          {/* Header Left: Greeting */}
          <div className="flex flex-col">
            <h1 className="text-lg font-serif font-black text-[#0F1E36]">
              Bonjour, <span className="text-[#0F1E36] font-bold">{userData?.fullName || userData?.displayName || 'Client'}</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Votre espace comptable sécurisé</p>
          </div>

          {/* Header Right: Clock + Weather Widget */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 px-4 py-2 bg-slate-100 rounded-xl text-xs font-medium text-slate-600">
              <span className="border-r border-slate-200 pr-4">{dateStr}</span>
              <div className="flex items-center gap-1.5 font-bold">
                <Clock size={14} className="text-slate-400" />
                <span>{currentTime}</span>
              </div>
              <div className="flex items-center gap-1 border-l border-slate-200 pl-4">
                <span>{weather.icon}</span>
                <span>{weather.city}</span>
                <span className="text-slate-900 font-bold">{weather.temp}°C</span>
              </div>
            </div>
          </div>
        </header>

        {/* 📦 CONTENT ZONE */}
        <main className="flex-1 overflow-y-auto p-10 custom-scrollbar max-w-6xl mx-auto w-full">
          
          {/* ============================================================
              1. ACCUEIL (TABLEAU DE BORD CLIENT)
             ============================================================ */}
          {activeTab === 'home' && (
            <div className="space-y-8 animate-fadeIn">
              {/* Warm Welcome Banner */}
              <div className="p-8 bg-gradient-to-r from-[#0F1E36] to-[#1a345a] text-white rounded-3xl shadow-lg relative overflow-hidden">
                <div className="relative z-10 space-y-2">
                  <h2 className="text-2xl font-serif font-bold">Bienvenue dans votre Espace Partenaire</h2>
                  <p className="text-slate-300 text-xs max-w-xl">
                    Nous suivons et mettons à jour vos dossiers de taxes et comptabilité en temps réel. Accédez à vos documents et communiquez directement avec votre comptable.
                  </p>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Next Appointment Card */}
                <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                    <CalendarIcon size={20} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs text-slate-400 uppercase font-black tracking-wider">Prochain Rendez-vous</h4>
                    <p className="text-sm font-bold text-slate-800">Rencontre Conseil Mensuelle</p>
                    <p className="text-xs text-slate-500">Mardi, 30 Juin 2026 à 10:00 avec Sylvie Charette-Clément</p>
                  </div>
                </div>

                {/* Shortcut to Messaging */}
                <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-start gap-4 cursor-pointer hover:border-slate-300 transition-colors" onClick={() => setActiveTab('messaging')}>
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                    <MessageSquare size={20} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs text-slate-400 uppercase font-black tracking-wider">Messagerie Directe</h4>
                    <p className="text-sm font-bold text-slate-800">Discuter avec votre comptable</p>
                    <p className="text-xs text-slate-500">Discuter en ligne avec Sylvie</p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ============================================================
              2. MON ESPACE SERVICES (PREMIUM & INTELLIGENT)
             ============================================================ */}
          {activeTab === 'services' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Mémos Intelligents (Alertes douces) */}
              {!isMandateSigned && (
                <div className="p-6 bg-amber-5 border border-amber-200/50 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex gap-3">
                    <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black uppercase text-amber-800 tracking-wider">Action requise</h4>
                      <p className="text-xs text-amber-700 mt-1">Il manque votre signature électronique sur le contrat de mandat comptable ComptaFlow.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowMandateSigning(true)}
                    type="button"
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-[#0F1E36] font-bold text-xs uppercase tracking-wider rounded-xl transition-all whitespace-nowrap shadow-sm"
                  >
                    Signer le Mandat
                  </button>
                </div>
              )}

              {/* Progress Diagrams */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Tax prep progress */}
                <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm text-center space-y-4">
                  <h4 className="text-xs text-slate-400 uppercase font-black tracking-wider text-left border-b border-slate-100 pb-2">Préparation des Impôts 2025</h4>
                  <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="72" cy="72" r="60" className="stroke-slate-100 fill-none" strokeWidth="8" />
                      <circle cx="72" cy="72" r="60" className="stroke-blue-600 fill-none" strokeWidth="8" strokeDasharray="376.8" strokeDashoffset="94.2" />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-2xl font-serif font-black text-slate-800">75%</span>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400">Complété</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">Validation finale des relevés T4 en cours par votre comptable.</p>
                </div>

                {/* Bookkeeping progress */}
                <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm text-center space-y-4">
                  <h4 className="text-xs text-slate-400 uppercase font-black tracking-wider text-left border-b border-slate-100 pb-2">Tenue de Livres - Juin 2026</h4>
                  <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="72" cy="72" r="60" className="stroke-slate-100 fill-none" strokeWidth="8" />
                      <circle cx="72" cy="72" r="60" className="stroke-emerald-500 fill-none" strokeWidth="8" strokeDasharray="376.8" strokeDashoffset="37.68" />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-2xl font-serif font-black text-slate-800">90%</span>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400">Traité</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">Vos factures et reçus réconciliés avec vos transactions bancaires.</p>
                </div>

              </div>

              {/* Timeline (Fil d'activités récentes) */}
              <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6">
                <h4 className="text-xs text-slate-400 uppercase font-black tracking-wider border-b border-slate-100 pb-2">Activités Récentes</h4>
                
                <div className="relative pl-6 border-l border-slate-200 space-y-6 text-xs text-slate-600">
                  <div className="relative">
                    <div className="absolute -left-[30px] top-0 w-4.5 h-4.5 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center text-white" />
                    <span className="text-[10px] text-slate-400 block font-bold">Aujourd'hui à 11:20</span>
                    <p className="text-slate-800 font-bold mt-1">La comptable Sylvie a importé vos factures mensuelles Dext.</p>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[30px] top-0 w-4.5 h-4.5 bg-blue-500 rounded-full border-4 border-white" />
                    <span className="text-[10px] text-slate-400 block font-bold">Hier à 14:05</span>
                    <p className="text-slate-800 font-bold mt-1">Nouveau document téléversé : T4_Revenu_Canada_2025.pdf</p>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[30px] top-0 w-4.5 h-4.5 bg-slate-300 rounded-full border-4 border-white" />
                    <span className="text-[10px] text-slate-400 block font-bold">Lundi, 22 Juin</span>
                    <p className="text-slate-800 font-bold mt-1">Création de votre dossier client et affectation au cabinet.</p>
                  </div>
                </div>
              </div>

              {/* Interactive Mandate Sign Modal */}
              {showMandateSigning && (
                <EliteSignature
                  contract={generateContract('fr', 'Mandat de Gestion Comptable - ComptaFlow', 199, 'CAD')}
                  onComplete={handleSignatureComplete}
                />
              )}

            </div>
          )}

          {/* ============================================================
              3. COFFRE-FORT DOCUMENTAIRE
             ============================================================ */}
          {activeTab === 'vault' && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h2 className="text-xl font-serif font-bold text-[#0F1E36]">Coffre-fort Documentaire</h2>
                <p className="text-xs text-slate-500 mt-1">Stockage crypté et sécurisé pour l'échange de pièces comptables</p>
              </div>

              {/* Drag and Drop zone */}
              <div className="p-8 border-2 border-dashed border-slate-300 rounded-2xl text-center bg-white hover:border-blue-600 transition-colors relative">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <FolderOpen size={36} className="text-slate-400 mx-auto mb-3" />
                <span className="text-xs font-bold text-slate-800 block">Faites glisser vos reçus et feuillets T4 ici</span>
                <span className="text-[10px] text-slate-400 block mt-1">ou cliquez pour parcourir vos fichiers</span>
              </div>

              {/* Files list */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                  <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">Fichiers partagés avec votre comptable ({clientDocuments.length})</h4>
                </div>
                <div className="divide-y divide-slate-100">
                  {clientDocuments.map(doc => (
                    <div key={doc.id} className="p-4 flex justify-between items-center text-xs">
                      <div className="flex items-center gap-3">
                        <FileCheck size={18} className="text-[#0F1E36]" />
                        <div>
                          <span className="font-bold text-slate-800 block">{doc.name}</span>
                          <span className="text-[10px] text-slate-400">{doc.size}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-slate-400 font-semibold mr-4">{doc.date}</span>
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="p-1 text-slate-400 hover:text-red-500 rounded"
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================
              4. MESSAGERIE DIRECTE
             ============================================================ */}
          {activeTab === 'messaging' && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h2 className="text-xl font-serif font-bold text-[#0F1E36]">Messagerie Directe</h2>
                <p className="text-xs text-slate-500 mt-1">Échangez de manière confidentielle avec Sylvie, votre comptable assignée</p>
              </div>

              {/* Chat frame */}
              <div className="bg-white border border-slate-200 rounded-3xl h-[500px] flex flex-col justify-between shadow-sm overflow-hidden">
                
                {/* Header */}
                <div className="px-6 py-4 bg-[#0F1E36] text-white flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider block">Sylvie Charette-Clément</span>
                    <span className="text-[9px] text-slate-300">Comptable Cabinet CF</span>
                  </div>
                </div>

                {/* Messages log */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4 text-xs custom-scrollbar">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex flex-col ${msg.sender === 'Client' ? 'items-end' : 'items-start'}`}>
                      <div className={`p-3 rounded-2xl max-w-md ${
                        msg.sender === 'Client'
                          ? 'bg-[#0F1E36] text-white rounded-tr-none'
                          : 'bg-slate-100 text-slate-800 rounded-tl-none'
                      }`}>
                        <p>{msg.text}</p>
                      </div>
                      <span className="text-[9px] text-slate-400 mt-1">{msg.time}</span>
                    </div>
                  ))}
                </div>

                {/* Input action */}
                <form onSubmit={handleSendChatMsg} className="p-4 border-t border-slate-200 flex gap-2">
                  <button type="button" className="p-3 text-slate-400 hover:text-slate-600">
                    <Paperclip size={16} />
                  </button>
                  <input
                    type="text"
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    placeholder="Tapez un message ou joignez des reçus..."
                    className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 text-xs outline-none text-slate-800"
                  />
                  <button
                    type="submit"
                    className="p-3 bg-[#0F1E36] text-white rounded-xl hover:bg-slate-800 transition-colors"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ============================================================
              5. FACTURES ET PAIEMENTS
             ============================================================ */}
          {activeTab === 'billing' && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h2 className="text-xl font-serif font-bold text-[#0F1E36]">Factures et Paiements</h2>
                <p className="text-xs text-slate-500 mt-1">Réglez vos factures Compta-Flow par passerelle de paiement sécurisée</p>
              </div>

              {/* Invoices list */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="p-5 text-xs text-slate-400 uppercase font-black tracking-wider">Date</th>
                      <th className="p-5 text-xs text-slate-400 uppercase font-black tracking-wider">Description</th>
                      <th className="p-5 text-xs text-slate-400 uppercase font-black tracking-wider">Montant</th>
                      <th className="p-5 text-xs text-slate-400 uppercase font-black tracking-wider">Statut</th>
                      <th className="p-5 text-xs text-slate-400 uppercase font-black tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {invoices.map(inv => (
                      <tr key={inv.id} className="hover:bg-slate-50/50">
                        <td className="p-5 text-slate-500 font-semibold">{inv.date}</td>
                        <td className="p-5 font-bold text-slate-800">{inv.desc}</td>
                        <td className="p-5 text-[#0F1E36] font-bold">{inv.amount.toFixed(2)} $</td>
                        <td className="p-5">
                          <span className={`inline-flex px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full border ${
                            inv.status === 'Payé'
                              ? 'bg-emerald-55 border-emerald-200 text-emerald-600'
                              : 'bg-red-50 border-red-200 text-red-600'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="p-5 text-right">
                          {inv.status === 'À payer' ? (
                            <button
                              type="button"
                              onClick={() => setShowPaymentModal(inv)}
                              className="px-4 py-2 bg-[#0F1E36] hover:bg-slate-800 text-white rounded-lg font-bold text-[10px] uppercase tracking-wider"
                            >
                              Payer maintenant
                            </button>
                          ) : (
                            <span className="text-slate-400 font-semibold">Réglé ✓</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Secure Payment Modal */}
              {showPaymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                  <div className="bg-white max-w-sm w-full p-8 rounded-3xl border border-slate-200 relative shadow-2xl">
                    <button onClick={() => setShowPaymentModal(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
                      <X size={20} />
                    </button>
                    
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2 mb-4">Paiement Sécurisé Stripe</h3>
                    <p className="text-xs text-slate-600 font-semibold mb-6">{showPaymentModal.desc} — <span className="text-emerald-500 font-bold">{showPaymentModal.amount.toFixed(2)} $</span></p>

                    <form onSubmit={handlePaymentSubmit} className="space-y-4 text-xs font-bold text-slate-800">
                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-2">Numéro de carte</label>
                        <input
                          type="text"
                          required
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="4242 4242 4242 4242"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-2">Expiration</label>
                          <input
                            type="text"
                            required
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="MM / AA"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-2">CVC</label>
                          <input
                            type="password"
                            required
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            placeholder="123"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isProcessingPayment}
                        className="w-full py-3 mt-4 bg-emerald-500 hover:bg-emerald-600 text-[#0F1E36] font-black uppercase tracking-wider rounded-xl transition-all shadow"
                      >
                        {isProcessingPayment ? 'Traitement...' : 'Confirmer le règlement'}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================
              6. CATALOGUE DES SERVICES
             ============================================================ */}
          {activeTab === 'catalog' && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h2 className="text-xl font-serif font-bold text-[#0F1E36]">Catalogue des Services</h2>
                <p className="text-xs text-slate-500 mt-1">Faites évoluer votre forfait ou commandez une mission fiscale ponctuelle</p>
              </div>

              {/* Catalog Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Bookkeeping Card */}
                <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <span className="text-[10px] text-blue-600 font-bold border border-blue-200 px-2 py-0.5 rounded-full uppercase">Forfait Mensuel</span>
                    <h3 className="text-sm font-bold text-[#0F1E36] mt-4">Tenue de Livres complète</h3>
                    <p className="text-xs text-slate-500 mt-2">Dext inclus, conciliation bancaire et rapports trimestriels.</p>
                    <ul className="text-xs text-slate-600 mt-4 space-y-2 font-medium">
                      <li>• Importation automatique de factures</li>
                      <li>• Support prioritaire par chat</li>
                      <li>• Rapprochement bancaire illimité</li>
                    </ul>
                  </div>
                  <div className="border-t border-slate-100 mt-6 pt-4 flex justify-between items-center">
                    <span className="text-lg font-serif font-bold text-[#0F1E36]">199 $ / <span className="text-[10px] text-slate-400">mois</span></span>
                    <button
                      onClick={() => toast.success('Votre demande de souscription a été envoyée.')}
                      type="button"
                      className="px-4 py-2 bg-[#0F1E36] text-white rounded-lg text-[10px] font-bold uppercase tracking-wider"
                    >
                      Souscrire
                    </button>
                  </div>
                </div>

                {/* Incorporation Card */}
                <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <span className="text-[10px] text-[#0F1E36] font-bold border border-slate-200 px-2 py-0.5 rounded-full uppercase">Mission unique</span>
                    <h3 className="text-sm font-bold text-[#0F1E36] mt-4">Incorporation Provinciale</h3>
                    <p className="text-xs text-slate-500 mt-2">Création d\'entreprise, livre de société numérique et numéro de NEQ.</p>
                    <ul className="text-xs text-slate-600 mt-4 space-y-2 font-medium">
                      <li>• Enregistrement gouvernemental complet</li>
                      <li>• Consultation juridique initiale</li>
                      <li>• Configuration de compte d\'impôt</li>
                    </ul>
                  </div>
                  <div className="border-t border-slate-100 mt-6 pt-4 flex justify-between items-center">
                    <span className="text-lg font-serif font-bold text-[#0F1E36]">599 $</span>
                    <button
                      onClick={() => toast.success('Votre demande d\'incorporation a été envoyée.')}
                      type="button"
                      className="px-4 py-2 bg-[#0F1E36] text-white rounded-lg text-[10px] font-bold uppercase tracking-wider"
                    >
                      Commander
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ============================================================
              7. MES NOTES
             ============================================================ */}
          {activeTab === 'notes' && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h2 className="text-xl font-serif font-bold text-[#0F1E36]">Mes Notes</h2>
                <p className="text-xs text-slate-500 mt-1">Notez vos questions à l'avance pour votre prochaine rencontre comptable</p>
              </div>

              {/* Textarea editor like Apple Notes */}
              <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                <textarea
                  value={notes}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  placeholder="Commencez à saisir vos idées financières ou questions à poser ici (sauvegarde automatique sur votre compte)..."
                  className="w-full h-80 bg-transparent border-none resize-none focus:outline-none text-xs text-slate-700 leading-relaxed font-medium"
                />
              </div>
            </div>
          )}

          {/* ============================================================
              8. CENTRE D'AIDE & FAQ (AVEC CALCULATEUR DYNAMIQUE)
             ============================================================ */}
          {activeTab === 'faq' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Dynamic Tax Estimator in Help Center */}
              <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
                <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">Simulateur fiscal canadien (Taxes directes)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-2 font-bold">Montant HT</label>
                    <input
                      type="number"
                      value={calcAmount}
                      onChange={(e) => setCalcAmount(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-2 font-bold">Province (Chargement dynamique)</label>
                    <select
                      value={calcProvince}
                      onChange={(e) => setCalcProvince(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold"
                    >
                      <option value="QC">Québec (QC)</option>
                      <option value="ON">Ontario (ON)</option>
                      <option value="BC">Colombie-Britannique (BC)</option>
                      <option value="AB">Alberta (AB)</option>
                    </select>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl text-xs space-y-1 text-slate-700 font-mono">
                    <div className="flex justify-between"><span>Base:</span><span>{calcAmount.toFixed(2)} $</span></div>
                    <div className="flex justify-between">
                      <span>{calcTaxesResults.hstActive ? 'HST' : 'TPS/GST'}:</span>
                      <span>{calcTaxesResults.tps.toFixed(2)} $</span>
                    </div>
                    {!calcTaxesResults.hstActive && calcProvince !== 'AB' && (
                      <div className="flex justify-between">
                        <span>{calcProvince === 'BC' ? 'PST (7%)' : 'TVQ (9.975%)'}:</span>
                        <span>{calcTaxesResults.tvq.toFixed(2)} $</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[#0F1E36] font-bold border-t border-slate-200 pt-1 mt-1">
                      <span>Total TTC:</span>
                      <span>{calcTaxesResults.total.toFixed(2)} $</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  placeholder="Comment pouvons-nous vous aider aujourd'hui?"
                  className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-xs font-bold text-slate-800 shadow-sm"
                />
              </div>

              {/* Accordions list */}
              <div className="space-y-4">
                {filteredFaq.map((faq, index) => {
                  const isOpen = openFaqIndex === index;
                  return (
                    <div key={index} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                        type="button"
                        className="w-full px-6 py-4 flex justify-between items-center text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors focus:outline-none"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown size={16} className={`text-slate-400 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {isOpen && (
                        <div className="px-6 pb-6 pt-2 text-xs text-slate-500 leading-relaxed border-t border-slate-100 font-medium">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

export default ClientPortalShell;
