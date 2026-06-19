import { Bell, Search, Settings, Shield, LogOut, Menu, X, LayoutDashboard, Receipt, MessageSquare, Vault as VaultIcon, Globe, HelpCircle, FileText, Users, ShieldCheck, PenTool, Brain, Puzzle } from 'lucide-react';
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
import { useUnreadMessages } from '../../hooks/useUnreadMessages';
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
import { SalesLedger } from './SalesLedger';
import { ServiceReports } from './ServiceReports';
import { EliteIntelligence } from './EliteIntelligence';
import { Integrations } from './Integrations';
import { BookOpen, Briefcase } from 'lucide-react';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { clients: adminClients, addClient } = useAdminClients(userData.role === 'sub_admin' || userData.role === 'super_admin');
  const { transactions } = useTransactions(undefined, userData.role === 'sub_admin' || userData.role === 'super_admin');
  const { lang, toggleLanguage } = useLanguage();

  const { unreadCount: msgUnread, markAllRead } = useUnreadMessages(userData.id, userData.isAdmin);
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [showMandateSigning, setShowMandateSigning] = useState(false);

  // Préfixe de portail unifié
  const portalPrefix = '/dashboard';
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
    { id: 'sales_ledger', label: 'Grand Livre Global', icon: BookOpen },
    { id: 'service_reports', label: 'Services & Normes', icon: Briefcase },
    { id: 'messaging', label: 'Support Réseau', icon: MessageSquare },
  ] : userData.role === 'sub_admin' ? [
    { id: 'admin_overview', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'admin_clients', label: 'Mes Clients', icon: Users },
    { id: 'transactions', label: 'Journal des flux', icon: Receipt },
    { id: 'invoices', label: 'Factures Clients', icon: FileText },
    { id: 'vault', label: 'Documents Clients', icon: VaultIcon },
    { id: 'sales_ledger', label: 'Grand Livre Ventes', icon: BookOpen },
    { id: 'service_reports', label: 'Services Professionnels', icon: Briefcase },
    { id: 'elite_intelligence', label: 'Intelligence Fiscale IA', icon: Brain },
    { id: 'integrations', label: 'Automatisations', icon: Puzzle },
    { id: 'interac_settings', label: 'Paramètres Interac', icon: Settings },
    { id: 'messaging', label: 'Canal Messagerie', icon: MessageSquare },
  ] : [
    { id: 'overview', label: 'Ma Situation', icon: LayoutDashboard },
    { id: 'transactions', label: 'Journal des flux', icon: Receipt },
    { id: 'invoices', label: 'Mes Factures', icon: FileText },
    { id: 'vault', label: 'Coffre-fort', icon: VaultIcon },
    { id: 'messaging', label: 'Contacter mon comptable', icon: MessageSquare },
    { id: 'faq', label: 'Sécurité & FAQ', icon: ShieldCheck },
    { id: 'support', label: 'Centre d\'Aide', icon: HelpCircle },
  ];

  const currentContract = generateContract('fr', 'Gestion Comptable ComptaFlow', 249, 'CAD');

  const navigateTo = (id: string) => {
    if (id === 'messaging') markAllRead();
    navigate(`${portalPrefix}/${id}`);
    setIsSidebarOpen(false);
  };

  // Bottom nav: max 5 items for mobile
  const bottomNavItems = navItems.slice(0, 5);

  return (
    <div className="min-h-screen flex bg-midnight relative overflow-hidden w-full">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sapphire/5 rounded-full blur-[120px] transition-colors duration-1000 ${currentMode === 'personal' ? 'bg-gold/5' : ''}`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold/5 rounded-full blur-[120px] transition-colors duration-1000 ${currentMode === 'personal' ? 'bg-sapphire/5' : ''}`} />
      </div>

      {/* Mobile overlay backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar — desktop always visible, mobile as drawer */}
      <motion.nav
        initial={false}
        animate={{ x: isSidebarOpen ? 0 : -320 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed md:sticky top-0 h-screen w-[280px] md:w-[300px] bg-[#050505]/95 backdrop-blur-3xl border-r border-white/5 flex flex-col z-30 shrink-0"
      >
        <div className="p-6 md:p-8 flex items-center justify-between">
          <div className="flex items-center gap-4" onClick={() => navigate(portalPrefix)} style={{ cursor: 'pointer' }}>
             <div className="w-10 h-10 rounded-xl premium-gradient-gold flex items-center justify-center shadow-[0_0_20px_rgba(198,161,91,0.3)]">
               <Shield size={20} className="text-midnight" />
             </div>
             <div>
               <span className="font-serif font-bold text-gold tracking-[0.1em] italic text-2xl animated-gradient-text block leading-none">CF</span>
               <span className="text-[8px] uppercase tracking-[0.3em] text-slate-500 font-black mt-1 block">ComptaFlow Elite</span>
             </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-slate-500 hover:text-gold transition-colors"><X size={22}/></button>
        </div>

        {userData.role === 'client' && (
          <div className="px-6 md:px-8 mb-6">
             <ModeSwitcher mode={currentMode} onToggle={onToggleMode} />
          </div>
        )}

        <div className="flex-1 px-3 md:px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              className={`w-full flex items-center gap-4 px-4 md:px-5 py-3.5 md:py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-gold/20 to-transparent text-gold border-l-2 border-gold'
                  : 'text-slate-400 hover:text-ivoire hover:bg-white/5'
              }`}
            >
              <span className="relative">
                <item.icon size={18} className={activeTab === item.id ? 'text-gold' : 'text-slate-500 group-hover:text-gold transition-colors duration-300'} />
                {item.id === 'messaging' && msgUnread > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-[8px] font-black text-white flex items-center justify-center shadow-lg">
                    {msgUnread > 9 ? '9+' : msgUnread}
                  </span>
                )}
              </span>
              <span className="text-sm font-bold tracking-tight">{item.label}</span>
              {item.id === 'messaging' && msgUnread > 0 && (
                <span className="ml-auto bg-red-500/20 text-red-400 text-[9px] font-black px-1.5 py-0.5 rounded-full">{msgUnread}</span>
              )}
              {activeTab === item.id && (
                <motion.div layoutId="nav-glow" className="absolute inset-0 bg-gold/5 blur-xl -z-10" />
              )}
            </button>
          ))}
        </div>

        <div className="p-6 md:p-8 border-t border-white/5 space-y-3 bg-black/20">
          {userData.role === 'client' && (
            <Button
              variant="ghost"
              className="w-full h-11 rounded-2xl border-gold/20 text-gold text-[9px] uppercase font-black tracking-widest gap-2 hover:bg-gold/5"
              onClick={() => { setShowMandateSigning(true); setIsSidebarOpen(false); }}
            >
              <PenTool size={14} /> Signer Mandat
            </Button>
          )}

          <div className="flex items-center gap-3 p-3 glass-card rounded-2xl border border-white/5 hover:border-gold/20 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-gold/20 to-white/5 flex items-center justify-center text-gold font-serif font-bold shrink-0 shadow-lg border border-gold/10">
              {userData.fullName?.charAt(0) || userData.displayName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-silver truncate">{userData.fullName || userData.displayName}</p>
              <p className="text-[9px] text-slate-500 uppercase font-black truncate tracking-tighter">
                {userData.role === 'super_admin' ? 'Propriétaire Suprême' : userData.role === 'sub_admin' ? 'Préparateur Partenaire' : 'Espace Client'}
              </p>
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={onLogout} className="w-full gap-2 hover:border-red-500/30 hover:text-red-400 h-11 rounded-2xl">
            <LogOut size={14} /> Déconnexion
          </Button>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden relative z-10 w-full md:w-[calc(100%-300px)]">
        {/* Header */}
        <header className="h-16 md:h-20 bg-midnight/60 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 md:px-12 shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-3 md:gap-6">
             <button
               onClick={() => setIsSidebarOpen(true)}
               className="p-2.5 text-slate-400 bg-white/5 rounded-xl hover:text-gold transition-colors md:hidden"
             >
               <Menu size={20}/>
             </button>
             <div className="relative hidden md:block w-[400px] group">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-gold transition-colors duration-500" size={18} />
               <input type="text" placeholder="Recherche sémantique sécurisée..." className="w-full bg-white/5 border border-white/5 rounded-2xl pl-14 pr-6 py-3 text-sm focus:ring-1 focus:ring-gold/20 focus:bg-white/10 outline-none transition-all placeholder:text-slate-600 font-medium" />
             </div>
             {/* Mobile logo */}
             <span className="md:hidden font-serif font-bold text-gold tracking-[0.1em] italic text-xl animated-gradient-text">CF</span>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
             <button
               onClick={toggleLanguage}
               className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 border border-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:border-gold/30 transition-all text-slate-400 hover:text-gold cursor-pointer"
             >
               <Globe size={12} className="text-gold" />
               <span className="hidden sm:inline">{lang.toUpperCase()}</span>
             </button>
            <button className="p-2.5 bg-white/5 border border-white/5 hover:border-gold/30 rounded-xl transition-all relative group">
              <Bell size={18} className="text-slate-400 group-hover:text-gold transition-colors" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-gold rounded-full border-2 border-midnight shadow-glow animate-bounce"></span>
            </button>
          </div>
        </header>

        {/* Page content — extra bottom padding on mobile for bottom nav */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar pb-24 md:pb-10 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname + currentMode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="w-full"
            >
              <Routes>
                {/* Redirections initiales */}
                <Route index element={
                  userData.role === 'super_admin' ? <Navigate to="super_overview" replace /> :
                  userData.role === 'sub_admin' ? <Navigate to="admin_overview" replace /> :
                  <Navigate to="overview" replace />
                } />

                {/* 1. Vues Super Admin */}
                <Route path="super_overview" element={
                  userData.role === 'super_admin' ? <SuperAdminOverview /> : <Navigate to="/dashboard" replace />
                } />
                <Route path="super_subadmins" element={
                  userData.role === 'super_admin' ? <SuperAdminSubAdmins /> : <Navigate to="/dashboard" replace />
                } />
                <Route path="super_clients" element={
                  userData.role === 'super_admin' ? <SuperAdminClients /> : <Navigate to="/dashboard" replace />
                } />
                <Route path="super_invoices" element={
                  userData.role === 'super_admin' ? <SuperAdminInvoices /> : <Navigate to="/dashboard" replace />
                } />

                {/* 2. Vues Sub Admin */}
                <Route path="admin_overview" element={
                  userData.role === 'sub_admin' ? <AdminOverview /> : <Navigate to="/dashboard" replace />
                } />
                <Route path="admin_clients" element={
                  userData.role === 'sub_admin' ? <AdminClients clients={adminClients} isAdmin={true} onAddClient={addClient} /> : <Navigate to="/dashboard" replace />
                } />
                <Route path="sales_ledger" element={
                  (userData.role === 'sub_admin' || userData.role === 'super_admin') ? <SalesLedger /> : <Navigate to="/dashboard" replace />
                } />
                <Route path="service_reports" element={
                  (userData.role === 'sub_admin' || userData.role === 'super_admin') ? <ServiceReports /> : <Navigate to="/dashboard" replace />
                } />
                <Route path="elite_intelligence" element={
                  userData.role === 'sub_admin' ? <EliteIntelligence transactions={transactions} userData={userData} /> : <Navigate to="/dashboard" replace />
                } />
                <Route path="integrations" element={
                  userData.role === 'sub_admin' ? <Integrations /> : <Navigate to="/dashboard" replace />
                } />
                <Route path="interac_settings" element={
                  userData.role === 'sub_admin' ? <InteracSettings userData={userData} /> : <Navigate to="/dashboard" replace />
                } />

                {/* 3. Vues Client */}
                <Route path="overview" element={
                  userData.role === 'client' ? <Overview userData={userData} isLoading={false} currentMode={currentMode} onSignMandate={() => setShowMandateSigning(true)} /> : <Navigate to="/dashboard" replace />
                } />

                {/* Vues Communes */}
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

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 md:hidden bg-[#050505]/95 backdrop-blur-3xl border-t border-white/5 safe-area-inset-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {bottomNavItems.map(item => (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 flex-1 min-w-0 ${
                activeTab === item.id ? 'text-gold' : 'text-slate-500'
              }`}
            >
              <item.icon size={20} className={activeTab === item.id ? 'text-gold' : ''} />
              <span className="text-[9px] font-black uppercase tracking-tight truncate w-full text-center leading-tight">
                {item.label.split(' ')[0]}
              </span>
              {activeTab === item.id && (
                <span className="absolute bottom-0 w-1 h-1 rounded-full bg-gold" />
              )}
            </button>
          ))}
          {/* More button if more than 5 nav items */}
          {navItems.length > 5 && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 flex-1 text-slate-500"
            >
              <Menu size={20} />
              <span className="text-[9px] font-black uppercase tracking-tight">Plus</span>
            </button>
          )}
        </div>
      </nav>

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
