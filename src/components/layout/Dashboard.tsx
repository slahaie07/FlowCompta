import { Bell, Search, Settings, Shield, LogOut, Menu, X, LayoutDashboard, Receipt, MessageSquare, Vault as VaultIcon, Globe, HelpCircle, FileText, Users, ShieldCheck, PenTool } from 'lucide-react';
import { UserData, Message, AppMode } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { Vault } from './Vault';
import { Messaging } from './Messaging';
import { Overview } from './Overview';
import { AdminClients } from './AdminClients';
import { AdminOverview } from './AdminOverview';
import { Transactions } from './Transactions';
import { Invoices } from './Invoices';
import { FAQ } from './FAQ';
import { Support } from './Support';
import { BiometricVerification } from '../ui/BiometricVerification';
import { EliteSignature } from '../ui/EliteSignature';
import { useAdminClients } from '../../hooks/useAdminClients';
import { useTransactions } from '../../hooks/useTransactions';
import { Button } from '../ui/Button';
import { ModeSwitcher } from '../ui/ModeSwitcher';
import { generateContract } from '../../lib/contractEngine';
import { useLanguage } from '../../hooks/useLanguage';

// Nouveaux composants de rôles
import { SuperAdminOverview } from './SuperAdminOverview';
import { SuperAdminSubAdmins } from './SuperAdminSubAdmins';
import { SuperAdminClients } from './SuperAdminClients';
import { SuperAdminInvoices } from './SuperAdminInvoices';
import { InteracSettings } from './InteracSettings';

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
  const { clients: adminClients, addClient } = useAdminClients(userData.role === 'sub_admin' || userData.role === 'super_admin');
  const { transactions } = useTransactions(undefined, userData.role === 'sub_admin' || userData.role === 'super_admin');
  const { lang, toggleLanguage } = useLanguage();
  
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [showMandateSigning, setShowMandateSigning] = useState(false);

  // Déterminer l'onglet actif et le préfixe de route en fonction du rôle
  const portalPrefix = userData.role === 'super_admin' ? '/super-admin' : userData.role === 'sub_admin' ? '/sub-admin' : '/client';
  const pathSegments = location.pathname.split('/');
  const activeTab = pathSegments[pathSegments.length - 1] || (userData.role === 'super_admin' ? 'super_overview' : userData.role === 'sub_admin' ? 'admin_overview' : 'overview');

  useEffect(() => {
    if (!location.pathname.includes('vault')) {
      setIsVaultUnlocked(false);
    }
  }, [location.pathname]);

  // Définir la navigation selon le rôle exact de l'utilisateur
  const navItems = userData.role === 'super_admin' ? [
    { id: 'super_overview', label: 'Chiffres Clés', icon: LayoutDashboard },
    { id: 'super_subadmins', label: 'Gestion Comptables', icon: Shield },
    { id: 'super_clients', label: 'Tous les Clients', icon: Users },
    { id: 'super_invoices', label: 'Toutes les Factures', icon: FileText },
    { id: 'messaging', label: 'Support Réseau', icon: MessageSquare },
  ] : userData.role === 'sub_admin' ? [
    { id: 'admin_overview', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'admin_clients', label: 'Mes Clients', icon: Users },
    { id: 'transactions', label: 'Journal des flux', icon: Receipt },
    { id: 'invoices', label: 'Factures Clients', icon: FileText },
    { id: 'vault', label: 'Documents Clients', icon: VaultIcon },
    { id: 'interac_settings', label: 'Paramètres Interac', icon: Settings },
    { id: 'messaging', label: 'Canal Messagerie', icon: MessageSquare },
  ] : [
    { id: 'overview', label: 'Ma Situation', icon: LayoutDashboard },
    { id: 'transactions', label: 'Journal des flux', icon: Receipt },
    { id: 'invoices', label: 'Mes Factures', icon: FileText },
    { id: 'vault', label: 'Coffre-fort', icon: VaultIcon },
    { id: 'messaging', label: 'Contacter mon CPA', icon: MessageSquare },
    { id: 'faq', label: 'Sécurité & FAQ', icon: ShieldCheck },
    { id: 'support', label: 'Centre d\'Aide', icon: HelpCircle },
  ];

  const currentContract = generateContract('fr', 'Expertise Comptable ComptaFlow', 249, 'CAD');

  return (
    <div className="min-h-screen flex bg-midnight relative overflow-hidden w-full">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sapphire/5 rounded-full blur-[120px] transition-colors duration-1000 ${currentMode === 'personal' ? 'bg-gold/5' : ''}`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold/5 rounded-full blur-[120px] transition-colors duration-1000 ${currentMode === 'personal' ? 'bg-sapphire/5' : ''}`} />
      </div>

      {/* Sidebar */}
      <motion.nav 
        initial={false}
        animate={{ 
          width: isSidebarOpen ? (window.innerWidth < 768 ? '100%' : 300) : 0,
          x: isSidebarOpen ? 0 : -300
        }}
        className="fixed md:relative h-screen bg-[#050505]/90 backdrop-blur-3xl border-r border-white/5 flex flex-col z-30 overflow-hidden shrink-0"
      >
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-4" onClick={() => navigate(portalPrefix)} style={{ cursor: 'pointer' }}>
             <div className="w-10 h-10 rounded-xl premium-gradient-gold flex items-center justify-center shadow-[0_0_20px_rgba(198,161,91,0.3)]">
               <Shield size={20} className="text-midnight" />
             </div>
             <div>
               <span className="font-serif font-bold text-gold tracking-[0.1em] italic text-2xl animated-gradient-text block leading-none">CF</span>
               <span className="text-[8px] uppercase tracking-[0.3em] text-slate-500 font-black mt-1 block">ComptaFlow Elite</span>
             </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-slate-500 hover:text-gold transition-colors"><X size={24}/></button>
        </div>

        {userData.role === 'client' && (
          <div className="px-8 mb-6">
             <ModeSwitcher mode={currentMode} onToggle={onToggleMode} />
          </div>
        )}

        <div className="flex-1 px-4 py-4 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => navigate(`${portalPrefix}/${item.id}`)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-500 group relative overflow-hidden ${
                activeTab === item.id 
                  ? 'bg-gradient-to-r from-gold/20 to-transparent text-gold border-l-2 border-gold' 
                  : 'text-slate-400 hover:text-ivoire hover:bg-white/5'
              }`}
            >
              <item.icon size={20} className={activeTab === item.id ? 'text-gold' : 'text-slate-500 group-hover:text-gold transition-colors duration-500'} />
              <span className="text-sm font-bold tracking-tight">{item.label}</span>
              {activeTab === item.id && (
                <motion.div layoutId="nav-glow" className="absolute inset-0 bg-gold/5 blur-xl -z-10" />
              )}
            </button>
          ))}
        </div>

        <div className="p-8 border-t border-white/5 space-y-4 bg-black/20">
          {userData.role === 'client' && (
            <Button 
              variant="ghost" 
              className="w-full h-12 rounded-2xl border-gold/20 text-gold text-[9px] uppercase font-black tracking-widest gap-2 hover:bg-gold/5"
              onClick={() => setShowMandateSigning(true)}
            >
              <PenTool size={14} /> Signer Mandat
            </Button>
          )}
          
          <div className="flex items-center gap-4 p-3 glass-card rounded-2xl border border-white/5 hover:border-gold/20 transition-colors group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-gold/20 to-white/5 flex items-center justify-center text-gold font-serif font-bold shrink-0 shadow-lg border border-gold/10 group-hover:scale-105 transition-transform">
              {userData.fullName?.charAt(0) || userData.displayName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-silver truncate group-hover:text-ivoire transition-colors">{userData.fullName || userData.displayName}</p>
              <p className="text-[10px] text-slate-500 uppercase font-black truncate tracking-tighter">
                {userData.role === 'super_admin' ? 'Propriétaire Suprême' : userData.role === 'sub_admin' ? 'Cabinet CPA' : 'Espace Client'}
              </p>
            </div>
          </div>
          
          <Button variant="ghost" size="sm" onClick={onLogout} className="w-full gap-2 hover:border-red-500/30 hover:text-red-400 h-12 rounded-2xl">
            <LogOut size={14} /> Déconnexion
          </Button>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10 w-full">
        <header className="h-20 bg-midnight/40 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 md:px-12 shrink-0">
          <div className="flex items-center gap-6">
             <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-3 text-slate-400 bg-white/5 rounded-2xl hover:text-gold transition-colors"><Menu size={20}/></button>
             <div className="relative hidden md:block w-[450px] group">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-gold transition-colors duration-500" size={18} />
               <input type="text" placeholder="Recherche sémantique sécurisée..." className="w-full bg-white/5 border border-white/5 rounded-2xl pl-14 pr-6 py-3 text-sm focus:ring-1 focus:ring-gold/20 focus:bg-white/10 outline-none transition-all placeholder:text-slate-600 font-medium" />
             </div>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
             <button 
               onClick={toggleLanguage}
               className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:border-gold/30 transition-all text-slate-400 hover:text-gold cursor-pointer"
             >
               <Globe size={12} className="text-gold" />
               <span>{lang.toUpperCase()}</span>
             </button>
            <button className="p-2.5 bg-white/5 border border-white/5 hover:border-gold/30 rounded-xl transition-all relative group">
              <Bell size={18} className="text-slate-400 group-hover:text-gold transition-colors" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-gold rounded-full border-2 border-midnight shadow-glow animate-bounce"></span>
            </button>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar pb-32 md:pb-20 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname + currentMode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="h-full w-full"
            >
              <Routes>
                {/* Redirections initiales */}
                <Route index element={
                  userData.role === 'super_admin' ? <Navigate to="super_overview" replace /> :
                  userData.role === 'sub_admin' ? <Navigate to="admin_overview" replace /> :
                  <Navigate to="overview" replace />
                } />

                {/* 1. Vues Super Admin */}
                <Route path="super_overview" element={<SuperAdminOverview />} />
                <Route path="super_subadmins" element={<SuperAdminSubAdmins />} />
                <Route path="super_clients" element={<SuperAdminClients />} />
                <Route path="super_invoices" element={<SuperAdminInvoices />} />

                {/* 2. Vues Sub Admin */}
                <Route path="admin_overview" element={<AdminOverview />} />
                <Route path="admin_clients" element={<AdminClients clients={adminClients} isAdmin={true} onAddClient={addClient} />} />
                <Route path="interac_settings" element={<InteracSettings userData={userData} />} />

                {/* 3. Vues Client */}
                <Route path="overview" element={<Overview userData={userData} isLoading={false} currentMode={currentMode} onSignMandate={() => setShowMandateSigning(true)} />} />

                {/* Vues Communes mais isolées par RLS */}
                <Route path="transactions" element={<Transactions currentMode={currentMode} isAdmin={userData.role === 'sub_admin' || userData.role === 'super_admin'} />} />
                <Route path="invoices" element={<Invoices isAdmin={userData.role === 'sub_admin' || userData.role === 'super_admin'} />} />
                <Route path="messaging" element={<Messaging userData={userData} />} />
                <Route path="vault" element={
                  !isVaultUnlocked ? <BiometricVerification onVerified={() => setIsVaultUnlocked(true)} /> : <Vault isLoading={false} />
                } />
                <Route path="faq" element={<FAQ />} />
                <Route path="support" element={<Support />} />

                <Route path="*" element={
                  userData.role === 'super_admin' ? <Navigate to="super_overview" replace /> :
                  userData.role === 'sub_admin' ? <Navigate to="admin_overview" replace /> :
                  <Navigate to="overview" replace />
                } />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Signature du Mandat Électronique */}
      {showMandateSigning && (
        <EliteSignature 
          contract={currentContract} 
          onComplete={() => setShowMandateSigning(false)} 
        />
      )}
    </div>
  );
}
export default Dashboard;
