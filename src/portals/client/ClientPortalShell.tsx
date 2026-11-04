import React, { useState, useEffect } from 'react';
import { 
  Home, Shield, FolderOpen, MessageSquare, CreditCard, Tags, FileText, 
  HelpCircle, ChevronDown, Send, Paperclip, Clock, Check, 
  Trash2, AlertCircle, Play, FileCheck, ArrowRight, DollarSign, PenTool, X, LogOut, Search
} from 'lucide-react';
import { EliteSignature } from '../../components/ui/EliteSignature';
import { generateContract } from '../../lib/contractEngine';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { useDocuments } from '../../hooks/useDocuments';

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

  // Accordion state for FAQ
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [faqSearch, setFaqSearch] = useState('');

  // Mandate signing state
  const [showMandateSigning, setShowMandateSigning] = useState(false);
  const [isMandateSigned, setIsMandateSigned] = useState(false);

  // Client notes
  const [notes, setNotes] = useState<string>('');

  // Invoices list state — vide au départ, rempli par les vraies données (loadLiveData)
  const [invoices, setInvoices] = useState<any[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState<any | null>(null);

  // Documents/Vault list state
  const [clientDocuments, setClientDocuments] = useState<Array<{ id: string; name: string; size: string; date: string }>>([]);

  // Vrai flux de dépôt : octets → bucket privé « vault », chemin → table « documents »
  const { uploadDocument } = useDocuments();

  // Tax rates from DB
  const [taxRates, setTaxRates] = useState<any[]>([]);

  // Chat message state — aucun message pré-rempli : la conversation démarre vide
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>([]);
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
          status: inv.status === 'paid' ? 'Payé' : inv.client_a_declare_paye ? 'Déclaré — en validation' : 'À payer',
          date: new Date(Number(inv.date)).toLocaleDateString('fr-CA')
        })));
      }
    } catch (e) {
      console.warn("Invoices load failed, using local mock.", e);
    }

    // 2. Fetch Documents
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userData.id)
        .order('upload_date', { ascending: false });
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

  // Update clock
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

  // Règlement par virement Interac seulement — aucune carte n'est recueillie.
  // Le client déclare son virement (client_a_declare_paye, comme useInvoices) ;
  // le statut « Payé » n'est jamais écrit ici : la validation finale appartient
  // au comptable, à la réception du virement.
  const handleDeclarePaid = async () => {
    if (!showPaymentModal) return;
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ client_a_declare_paye: true })
        .eq('id', showPaymentModal.id);
      if (error) throw error;
    } catch (err) {
      // Mode local : la déclaration reste affichée dans la liste.
    }
    setInvoices(prev => prev.map(inv => inv.id === showPaymentModal.id ? { ...inv, status: 'Déclaré — en validation' } : inv));
    toast.success('Virement déclaré. Votre comptable valide le paiement dès sa réception.');
    setShowPaymentModal(null);
  };

  // File upload — vrai flux via useDocuments : les octets partent dans le bucket
  // privé « vault » et le chemin est inscrit dans la table « documents »
  // (même flux que Vault.tsx et les autres écrans). Aucune URL fabriquée,
  // aucun faux enregistrement local en cas d'échec : le hook signale l'erreur.
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !userData?.id) return;

    const success = await uploadDocument(file, 'general');
    if (success) {
      // Le document est réellement stocké (bucket vault + table documents) :
      // on le montre tout de suite dans la liste de l'écran.
      setClientDocuments(prev => [
        {
          id: 'doc-' + Date.now(),
          name: file.name,
          size: (file.size / 1024).toFixed(0) + ' KB',
          date: new Date().toLocaleDateString('fr-CA')
        },
        ...prev
      ]);
    }
  };

  // Document deletion with DB sync — table « documents » (même source que les
  // dépôts via useDocuments) ; l'objet du bucket « vault » est retiré au passage.
  const handleDeleteDocument = async (id: string) => {
    try {
      const { data: docRow } = await supabase
        .from('documents')
        .select('url')
        .eq('id', id)
        .maybeSingle();
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);
      if (error) throw error;
      if (docRow?.url) {
        await supabase.storage.from('vault').remove([docRow.url]).catch(() => undefined);
      }
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
    // Aucune réponse automatique simulée : l'équipe répond par écrit sous 4 h ouvrables.
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
    { q: 'Comment soumettre mes reçus et mes pièces?', a: 'Prenez vos reçus en photo ou numérisez-les, puis déposez-les dans votre coffre-fort documentaire (onglet « Coffre-fort Documentaire »). Vous pouvez aussi nous les faire parvenir par courriel à contact@compta-flow.net. Nous vous écrivons dès qu\'il manque une pièce.' },
    { q: 'Quels sont les délais pour transmettre mes documents d\'impôts?', a: 'Pour une déclaration de particulier (T1), la date limite de production est le 30 avril. Pour les travailleurs autonomes, la production va jusqu\'au 15 juin, mais tout solde dû doit être payé au plus tard le 30 avril. Déposez vos feuillets tôt dans le coffre-fort : plus ils arrivent tôt, plus la préparation est rapide.' },
    { q: 'Comment fonctionne la facturation Compta-Flow?', a: 'Votre forfait mensuel est facturé au prix fixe convenu, taxes applicables en sus. Les paiements se font par virement Interac à compta-flow@outlook.com. Pour un mandat d\'impôts seulement, un acompte de 50 % est demandé à la signature et le solde doit être reçu avant la transmission de la déclaration.' }
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
      <nav className="w-72 h-screen bg-[#16324F] border-r border-slate-200 hidden lg:flex flex-col z-30 shrink-0 select-none text-white">
        
        {/* Brand/Logo */}
        <div className="p-8 border-b border-white/5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center text-[#16324F] font-bold shadow-md">
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
            <h1 className="text-lg font-serif font-black text-[#16324F]">
              Bonjour, <span className="text-[#16324F] font-bold">{userData?.fullName || userData?.displayName || 'Client'}</span>
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
            </div>
          </div>
        </header>

        {/* Navigation mobile (barre d'onglets horizontale) */}
        <div className="lg:hidden bg-white border-b border-slate-200 px-3 py-2 flex gap-2 overflow-x-auto custom-scrollbar shrink-0">
          {menuItems.map((item) => {
            const IconComp = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-colors min-h-[44px] ${
                  isActive ? 'bg-[#16324F] text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <IconComp size={14} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* 📦 CONTENT ZONE */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 custom-scrollbar max-w-6xl mx-auto w-full">
          
          {/* ============================================================
              1. ACCUEIL (TABLEAU DE BORD CLIENT)
             ============================================================ */}
          {activeTab === 'home' && (
            <div className="space-y-8 animate-fadeIn">
              {/* Warm Welcome Banner */}
              <div className="p-8 bg-gradient-to-r from-[#16324F] to-[#1a345a] text-white rounded-3xl shadow-lg relative overflow-hidden">
                <div className="relative z-10 space-y-2">
                  <h2 className="text-2xl font-serif font-bold">Bienvenue dans votre Espace Partenaire</h2>
                  <p className="text-slate-300 text-xs max-w-xl">
                    Nous suivons et mettons à jour vos dossiers de taxes et de comptabilité. Accédez à vos documents et communiquez directement avec votre équipe Compta-Flow — tout se fait par écrit, au même endroit.
                  </p>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Next Step Card — service 100 % en ligne, par écrit */}
                <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-start gap-4 cursor-pointer hover:border-slate-300 transition-colors" onClick={() => setActiveTab('vault')}>
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                    <FolderOpen size={20} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs text-slate-400 uppercase font-black tracking-wider">Prochaine Étape</h4>
                    <p className="text-sm font-bold text-slate-800">Déposez vos documents du mois</p>
                    <p className="text-xs text-slate-500">Reçus, relevés et feuillets : tout passe par votre coffre-fort. Aucun rendez-vous nécessaire — tout se fait par écrit.</p>
                  </div>
                </div>

                {/* Shortcut to Messaging */}
                <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-start gap-4 cursor-pointer hover:border-slate-300 transition-colors" onClick={() => setActiveTab('messaging')}>
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                    <MessageSquare size={20} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs text-slate-400 uppercase font-black tracking-wider">Messagerie Directe</h4>
                    <p className="text-sm font-bold text-slate-800">Discuter avec votre équipe</p>
                    <p className="text-xs text-slate-500">Réponse écrite sous 4 h ouvrables</p>
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
                <div className="p-6 bg-amber-50 border border-amber-200/50 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-[#16324F] font-bold text-xs uppercase tracking-wider rounded-xl transition-all whitespace-nowrap shadow-sm"
                  >
                    Signer le Mandat
                  </button>
                </div>
              )}

              {/* Parcours client — étapes réelles, aucun avancement inventé */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
                  <div className="w-10 h-10 bg-[#16324F]/5 rounded-xl flex items-center justify-center text-[#16324F]">
                    <PenTool size={20} />
                  </div>
                  <h4 className="text-xs text-slate-400 uppercase font-black tracking-wider">Étape 1 — Votre mandat</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {isMandateSigned
                      ? 'Votre mandat est signé. Merci — votre dossier est actif.'
                      : 'Signez votre mandat de services pour activer votre dossier (alerte ci-dessus).'}
                  </p>
                </div>

                <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
                  <div className="w-10 h-10 bg-[#16324F]/5 rounded-xl flex items-center justify-center text-[#16324F]">
                    <FolderOpen size={20} />
                  </div>
                  <h4 className="text-xs text-slate-400 uppercase font-black tracking-wider">Étape 2 — Vos documents</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">Déposez vos reçus, relevés bancaires et feuillets dans le coffre-fort, au fur et à mesure.</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('vault')}
                    className="text-xs font-bold text-[#2A9D8F] hover:underline"
                  >
                    Ouvrir le coffre-fort →
                  </button>
                </div>

                <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
                  <div className="w-10 h-10 bg-[#16324F]/5 rounded-xl flex items-center justify-center text-[#16324F]">
                    <FileCheck size={20} />
                  </div>
                  <h4 className="text-xs text-slate-400 uppercase font-black tracking-wider">Étape 3 — Le traitement</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">Conciliations, rapports de taxes et suivis se font ici, par écrit. Une question? L'onglet Messagerie est là pour ça.</p>
                </div>

              </div>

              {/* Activités récentes — état vide honnête tant qu'aucune activité réelle n'est enregistrée */}
              <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
                <h4 className="text-xs text-slate-400 uppercase font-black tracking-wider border-b border-slate-100 pb-2">Activités Récentes</h4>
                <p className="text-xs text-slate-500">Aucune activité pour le moment. Vos dépôts de documents et les suivis de votre équipe apparaîtront ici.</p>
              </div>

              {/* Interactive Mandate Sign Modal */}
              {showMandateSigning && (
                <EliteSignature
                  contract={generateContract('fr', 'Mandat de Gestion Comptable - ComptaFlow', 149, 'CAD')}
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
                <h2 className="text-xl font-serif font-bold text-[#16324F]">Coffre-fort Documentaire</h2>
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
                  <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">Fichiers partagés avec votre équipe ({clientDocuments.length})</h4>
                </div>
                <div className="divide-y divide-slate-100">
                  {clientDocuments.length === 0 && (
                    <div className="p-8 text-center">
                      <p className="text-xs font-bold text-slate-700">Aucun document pour le moment</p>
                      <p className="text-[11px] text-slate-500 mt-1">Déposez vos reçus, relevés et feuillets dans la zone ci-dessus — ils apparaîtront ici, en sécurité.</p>
                    </div>
                  )}
                  {clientDocuments.map(doc => (
                    <div key={doc.id} className="p-4 flex justify-between items-center text-xs">
                      <div className="flex items-center gap-3">
                        <FileCheck size={18} className="text-[#16324F]" />
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
                <h2 className="text-xl font-serif font-bold text-[#16324F]">Messagerie Directe</h2>
                <p className="text-xs text-slate-500 mt-1">Échangez de manière confidentielle avec votre équipe Compta-Flow attitrée</p>
              </div>

              {/* Chat frame */}
              <div className="bg-white border border-slate-200 rounded-3xl h-[500px] flex flex-col justify-between shadow-sm overflow-hidden">
                
                {/* Header */}
                <div className="px-6 py-4 bg-[#16324F] text-white flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider block">Équipe Compta-Flow</span>
                    <span className="text-[9px] text-slate-300">Votre équipe attitrée — réponse écrite sous 4 h ouvrables</span>
                  </div>
                </div>

                {/* Messages log */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4 text-xs custom-scrollbar">
                  {chatMessages.length === 0 && (
                    <div className="text-center text-slate-400 py-10">
                      <p className="font-bold text-slate-500">Aucun message pour le moment</p>
                      <p className="mt-1">Écrivez-nous ci-dessous — nous répondons par écrit sous 4 h ouvrables.</p>
                    </div>
                  )}
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex flex-col ${msg.sender === 'Client' ? 'items-end' : 'items-start'}`}>
                      <div className={`p-3 rounded-2xl max-w-md ${
                        msg.sender === 'Client'
                          ? 'bg-[#16324F] text-white rounded-tr-none'
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
                    className="p-3 bg-[#16324F] text-white rounded-xl hover:bg-slate-800 transition-colors"
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
                <h2 className="text-xl font-serif font-bold text-[#16324F]">Factures et Paiements</h2>
                <p className="text-xs text-slate-500 mt-1">Vos factures Compta-Flow — paiement par virement Interac à compta-flow@outlook.com</p>
              </div>

              {/* Invoices list */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-x-auto">
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
                    {invoices.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500 font-semibold">Aucune facture pour le moment. Vos factures apparaîtront ici dès leur émission.</td>
                      </tr>
                    )}
                    {invoices.map(inv => (
                      <tr key={inv.id} className="hover:bg-slate-50/50">
                        <td className="p-5 text-slate-500 font-semibold">{inv.date}</td>
                        <td className="p-5 font-bold text-slate-800">{inv.desc}</td>
                        <td className="p-5 text-[#16324F] font-bold">{inv.amount.toFixed(2)} $</td>
                        <td className="p-5">
                          <span className={`inline-flex px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full border ${
                            inv.status === 'Payé'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                              : inv.status === 'À payer'
                                ? 'bg-red-50 border-red-200 text-red-600'
                                : 'bg-amber-50 border-amber-200 text-amber-600'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="p-5 text-right">
                          {inv.status === 'À payer' ? (
                            <button
                              type="button"
                              onClick={() => setShowPaymentModal(inv)}
                              className="px-4 py-2 bg-[#16324F] hover:bg-slate-800 text-white rounded-lg font-bold text-[10px] uppercase tracking-wider"
                            >
                              Régler par Interac
                            </button>
                          ) : inv.status === 'Déclaré — en validation' ? (
                            <span className="text-amber-600 font-semibold">En validation</span>
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
                    
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2 mb-4">Règlement de la facture</h3>
                    <p className="text-xs text-slate-600 font-semibold mb-6">{showPaymentModal.desc} — <span className="text-emerald-500 font-bold">{showPaymentModal.amount.toFixed(2)} $</span></p>

                    <div className="space-y-4 text-xs font-bold text-slate-800">
                      <p className="font-semibold text-slate-600 leading-relaxed">
                        Les paiements Compta-Flow se font uniquement par virement Interac — aucune carte n'est demandée.
                      </p>
                      <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 space-y-2">
                        <p>Envoyez votre virement à : <span className="text-[#16324F]">compta-flow@outlook.com</span></p>
                        <p>Indiquez en référence : <span className="text-[#16324F]">{showPaymentModal.desc}</span></p>
                        <p>Montant : <span className="text-[#16324F]">{showPaymentModal.amount.toFixed(2)} $</span></p>
                      </div>
                      <p className="font-medium text-slate-500 leading-relaxed">
                        Une fois le virement envoyé, déclarez-le ici : votre facture passe en cours de validation par votre comptable, qui la marque « Payé » à la réception des fonds.
                      </p>
                      <button
                        type="button"
                        onClick={handleDeclarePaid}
                        className="w-full py-3 mt-4 bg-emerald-500 hover:bg-emerald-600 text-[#16324F] font-black uppercase tracking-wider rounded-xl transition-all shadow"
                      >
                        Déclarer payée après virement
                      </button>
                    </div>
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
                <h2 className="text-xl font-serif font-bold text-[#16324F]">Catalogue des Services</h2>
                <p className="text-xs text-slate-500 mt-1">Faites évoluer votre forfait ou commandez une mission fiscale ponctuelle</p>
              </div>

              {/* Catalog Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Bookkeeping Card */}
                <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <span className="text-[10px] text-blue-600 font-bold border border-blue-200 px-2 py-0.5 rounded-full uppercase">Forfait Mensuel</span>
                    <h3 className="text-sm font-bold text-[#16324F] mt-4">Tenue de Livres complète</h3>
                    <p className="text-xs text-slate-500 mt-2">Dépôt de vos pièces par photo ou courriel, conciliation bancaire et rapports de taxes.</p>
                    <ul className="text-xs text-slate-600 mt-4 space-y-2 font-medium">
                      <li>• Classement de vos factures et reçus</li>
                      <li>• Support par écrit, sous 4 h ouvrables</li>
                      <li>• Rapprochement bancaire de vos comptes</li>
                    </ul>
                  </div>
                  <div className="border-t border-slate-100 mt-6 pt-4 flex justify-between items-center">
                    <span className="text-lg font-serif font-bold text-[#16324F]">Dès 149,99 $ / <span className="text-[10px] text-slate-400">mois</span></span>
                    <button
                      onClick={() => toast.info('Pour activer un service, écrivez-nous dans l\'onglet Messagerie — nous vous répondons par écrit sous 4 h ouvrables.')}
                      type="button"
                      className="px-4 py-2 bg-[#16324F] text-white rounded-lg text-[10px] font-bold uppercase tracking-wider"
                    >
                      Souscrire
                    </button>
                  </div>
                </div>

                {/* Incorporation Card */}
                <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <span className="text-[10px] text-[#16324F] font-bold border border-slate-200 px-2 py-0.5 rounded-full uppercase">Mission unique</span>
                    <h3 className="text-sm font-bold text-[#16324F] mt-4">Incorporation Provinciale</h3>
                    <p className="text-xs text-slate-500 mt-2">Création d\'entreprise, livre de société numérique et numéro de NEQ.</p>
                    <ul className="text-xs text-slate-600 mt-4 space-y-2 font-medium">
                      <li>• Enregistrement gouvernemental complet</li>
                      <li>• Ouverture des comptes de taxes (TPS/TVQ)</li>
                      <li>• Configuration de compte d\'impôt</li>
                    </ul>
                  </div>
                  <div className="border-t border-slate-100 mt-6 pt-4 flex justify-between items-center">
                    <span className="text-lg font-serif font-bold text-[#16324F]">599 $</span>
                    <button
                      onClick={() => toast.info('Pour commander une mission ponctuelle, écrivez-nous dans l\'onglet Messagerie — nous vous répondons par écrit sous 4 h ouvrables.')}
                      type="button"
                      className="px-4 py-2 bg-[#16324F] text-white rounded-lg text-[10px] font-bold uppercase tracking-wider"
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
                <h2 className="text-xl font-serif font-bold text-[#16324F]">Mes Notes</h2>
                <p className="text-xs text-slate-500 mt-1">Notez vos questions et vos idées — elles restent sauvegardées dans votre espace</p>
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
                    <div className="flex justify-between text-[#16324F] font-bold border-t border-slate-200 pt-1 mt-1">
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
