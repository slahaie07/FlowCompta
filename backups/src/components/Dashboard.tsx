import { Bell, Search, Settings, Shield, LogOut, Menu, X, LayoutDashboard, Receipt, MessageSquare, Vault as VaultIcon, Globe, HelpCircle, FileText, DollarSign, ShieldCheck } from 'lucide-react';
import { UserData, Message, AppMode } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { Vault } from './Vault';
import { Messaging } from './Messaging';
import { Overview } from './Overview';
import { AdminClients } from './AdminClients';
import { AdminOverview } from './AdminOverview';
import { Integrations } from './Integrations';
import { Transactions } from './Transactions';
import { Support } from './Support';
import { Invoices } from './Invoices';
import { Pricing } from './Pricing';
import { FAQ } from './FAQ';
import { useAdminClients } from '../hooks/useAdminClients';
import { Button } from './ui/Button';
import { ModeSwitcher } from './ui/ModeSwitcher';

interface DashboardProps {
  userData: UserData;
  adminMessages: Message[];
  onSendMessage: (text: string) => void;
  onLogout: () => void;
  currentMode: AppMode;
  onToggleMode: () => void;
}

export function Dashboard({ userData, adminMessages, onSendMessage, onLogout, currentMode, onToggleMode }: DashboardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const { clients: adminClients } = useAdminClients(!!userData.isAdmin);

  // Determine active tab from URL
  const pathSegments = location.pathname.split('/');
  const activeTab = pathSegments[pathSegments.length - 1] || (userData.isAdmin ? 'admin_overview' : 'overview');

  useEffect(() => {
    // Auto-close sidebar on mobile when route changes
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  const navItems = userData.isAdmin ? [
    { id: 'admin_overview', label: 'Cabinet Hub', icon: LayoutDashboard },
    { id: 'admin_clients', label: 'Gestion Clients', icon: Shield },
    { id: 'transactions', label: 'Flux Global', icon: Receipt },
    { id: 'invoices', label: 'Registre Factures', icon: FileText },
    { id: 'pricing', label: 'Grille Tarifs', icon: DollarSign },
    { id: 'messaging', label: 'Canal Direct', icon: MessageSquare },
    { id: 'vault', label: 'Archives Globales', icon: VaultIcon },
  ] : [
    { id: 'overview', label: 'Ma Situation', icon: LayoutDashboard },
    { id: 'transactions', label: 'Journal des flux', icon: Receipt },
    { id: 'invoices', label: 'Mes Factures', icon: FileText },
    { id: 'pricing', label: 'Tarifs & Services', icon: DollarSign },
    { id: 'faq', label: 'Sécurité & FAQ', icon: ShieldCheck },
    { id: 'messaging', label: 'Support CPA', icon: MessageSquare },
    { id: 'vault', label: 'Coffre-fort', icon: VaultIcon },
    { id: 'integrations', label: 'Connecteurs Cloud', icon: Globe },
    { id: 'support', label: 'Centre d\'Aide', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen flex bg-midnight relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sapphire/5 rounded-full blur-[120px] transition-colors duration-1000 ${currentMode === 'personal' ? 'bg-gold/5' : ''}`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold/5 rounded-full blur-[120px] transition-colors duration-1000 ${currentMode === 'personal' ? 'bg-sapphire/5' : ''}`} />
      </div>

      {/* Mobile Backdrop */}
      {isSidebarOpen && (
         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <motion.nav 
        initial={false}
        animate={{ 
          width: isSidebarOpen ? (window.innerWidth < 768 ? '100%' : 280) : 0,
          x: isSidebarOpen ? 0 : -280
        }}
        className="fixed md:relative h-screen bg-obsidian/60 backdrop-blur-3xl border-r border-white/5 flex flex-col z-30 overflow-hidden"
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
             <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-gold to-gold-dark flex items-center justify-center shadow-lg shadow-gold/20">
               <Shield size={16} className="text-midnight" />
             </div>
             <span className="font-serif font-medium text-gold tracking-tight italic text-xl animated-gradient-text">ComptaFlow</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-slate-500"><X size={24}/></button>
        </div>

        <div className="px-6 mb-4">
           <ModeSwitcher mode={currentMode} onToggle={onToggleMode} />
        </div>

        <div className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => navigate(`/dashboard/${item.id}`)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group ${
                activeTab === item.id ? 'bg-gold text-midnight shadow-glow-sm' : 'text-slate-400 hover:text-silver hover:bg-white/5'
              }`}
            >
              <item.icon size={18} className={activeTab === item.id ? 'text-midnight' : 'text-slate-500 group-hover:text-gold transition-colors'} />
              <span className="text-sm font-bold tracking-tight">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6 border-t border-white/5 space-y-4">
          <div className="flex items-center gap-4 p-2 bg-white/5 rounded-2xl border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sapphire to-sapphire-light flex items-center justify-center text-white font-serif shrink-0 shadow-lg shadow-sapphire/20">
              {userData.displayName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-silver truncate">{userData.displayName}</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold truncate tracking-tighter">{userData.companyName}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout} className="w-full gap-2 hover:border-red-500/30 hover:text-red-400 h-12">
            <LogOut size={14} /> Déconnexion
          </Button>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        <header className="h-[72px] bg-midnight/40 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-4">
             <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-slate-400 bg-white/5 rounded-xl"><Menu size={20}/></button>
             <div className="relative hidden md:block w-96 group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-gold transition-colors" size={18} />
               <input type="text" placeholder="IA Recherche sémantique..." className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-gold/30 outline-none transition-all placeholder:text-slate-600" />
             </div>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              className="flex items-center gap-1 px-3 py-1.5 bg-white/5 border border-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:border-gold/30 transition-all text-slate-400 hover:text-gold"
              onClick={() => console.info("Changement de langue : Les traductions dynamiques sont chargées via i18n.")}
            >
              FR / EN / AR
            </button>
            <div className="hidden lg:flex flex-col text-right mr-2">
               <p className="text-[9px] uppercase font-bold text-slate-500 tracking-widest">Latence Serveur</p>
               <p className="text-[10px] font-bold text-green-500 flex items-center gap-1 justify-end">24ms <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span></p>
            </div>
            <button className="p-2.5 bg-white/5 border border-white/5 hover:border-gold/30 rounded-xl transition-all relative group">
              <Bell size={18} className="text-slate-400 group-hover:text-gold transition-colors" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-gold rounded-full border-2 border-midnight shadow-glow animate-bounce"></span>
            </button>
            <button className="p-2.5 bg-white/5 border border-white/5 hover:border-gold/30 rounded-xl transition-all text-slate-400">
              <Settings size={18} />
            </button>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar pb-24 md:pb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname + currentMode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <Routes>
                <Route index element={userData.isAdmin ? <Navigate to="admin_overview" replace /> : <Navigate to="overview" replace />} />
                <Route path="overview" element={<Overview userData={userData} isLoading={false} currentMode={currentMode} />} />
                <Route path="admin_overview" element={<AdminOverview />} />
                <Route path="admin_clients" element={<AdminClients clients={adminClients} isAdmin={userData.isAdmin} />} />
                <Route path="messaging" element={<Messaging externalMessages={adminMessages} userData={userData} onSendMessage={onSendMessage} />} />
                <Route path="vault" element={<Vault isLoading={false} />} />
                <Route path="transactions" element={<Transactions currentMode={currentMode} isAdmin={userData.isAdmin} />} />
                <Route path="invoices" element={<Invoices />} />
                <Route path="pricing" element={<Pricing />} />
                <Route path="faq" element={<FAQ />} />
                <Route path="support" element={<Support />} />
                <Route path="integrations" element={<Integrations />} />
                <Route path="*" element={<Navigate to={userData.isAdmin ? "admin_overview" : "overview"} replace />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
