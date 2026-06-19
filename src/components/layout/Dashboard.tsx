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
      {/* Ambient light — subtle, single source */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-[72px] right-0 h-px bg-gradient-to-r from-gold/20 via-gold/5 to-transparent" />
        <div className="absolute top-[-20%] right-[-5%] w-[500px] h-[500px] bg-gold/[0.03] rounded-full blur-[150px]" />
      </div>

      {/* Mobile overlay backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-20 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* ── SIDEBAR DESKTOP: slim icon rail ── */}
      <nav className="hidden md:flex fixed top-0 left-0 h-screen w-[72px] bg-[#060606] border-r border-white/[0.04] flex-col items-center z-30 shrink-0 py-6 gap-2">
        {/* Logo */}
        <button onClick={() => navigate(portalPrefix)} className="mb-6 group">
          <img src="/logo.png" alt="ComptaFlow" className="w-10 h-10 object-contain rounded-xl opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
        </button>

        {/* Nav icons */}
        <div className="flex-1 flex flex-col items-center gap-1 overflow-y-auto w-full px-2 custom-scrollbar">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              title={item.label}
              className={`relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 group ${
                activeTab === item.id
                  ? 'bg-gold/15 text-gold'
                  : 'text-slate-600 hover:text-silver hover:bg-white/5'
              }`}
            >
              <item.icon size={18} />
              {item.id === 'messaging' && msgUnread > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              )}
              {activeTab === item.id && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gold rounded-r-full" />
              )}
              {/* Tooltip */}
              <span className="absolute left-full ml-3 px-2.5 py-1 bg-[#0a0a0a] border border-white/10 rounded-lg text-[10px] font-bold text-silver whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none z-50 shadow-xl">
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* Bottom: user avatar + logout */}
        <div className="flex flex-col items-center gap-2 mt-4">
          {userData.role === 'client' && (
            <button
              title="Signer Mandat"
              onClick={() => setShowMandateSigning(true)}
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-gold/60 hover:text-gold hover:bg-gold/10 transition-all"
            >
              <PenTool size={16} />
            </button>
          )}
          <div
            title={userData.fullName || userData.displayName || 'Compte'}
            className="w-9 h-9 rounded-xl bg-gradient-to-tr from-gold/30 to-gold/10 border border-gold/20 flex items-center justify-center text-gold font-serif font-bold text-sm cursor-default"
          >
            {userData.fullName?.charAt(0) || userData.displayName?.charAt(0) || 'U'}
          </div>
          <button
            title="Déconnexion"
            onClick={onLogout}
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={16} />
          </button>
        </div>
      </nav>

      {/* ── SIDEBAR MOBILE: full drawer ── */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.nav
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="fixed top-0 left-0 h-screen w-[260px] bg-[#060606] border-r border-white/5 flex flex-col z-30 md:hidden"
          >
            <div className="p-5 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="ComptaFlow" className="w-9 h-9 object-contain rounded-lg" />
                <div>
                  <p className="font-serif font-bold text-gold text-lg leading-none italic">ComptaFlow</p>
                  <p className="text-[9px] uppercase tracking-[0.3em] text-slate-500 font-bold mt-0.5">Elite</p>
                </div>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-slate-500 hover:text-gold transition-colors">
                <X size={18}/>
              </button>
            </div>

            {userData.role === 'client' && (
              <div className="px-4 pt-4">
                <ModeSwitcher mode={currentMode} onToggle={onToggleMode} />
              </div>
            )}

            <div className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto custom-scrollbar">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                    activeTab === item.id
                      ? 'bg-gold/10 text-gold'
                      : 'text-slate-500 hover:text-silver hover:bg-white/[0.03]'
                  }`}
                >
                  {activeTab === item.id && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gold rounded-r-full" />}
                  <item.icon size={16} />
                  <span className="text-sm font-semibold tracking-tight">{item.label}</span>
                  {item.id === 'messaging' && msgUnread > 0 && (
                    <span className="ml-auto w-5 h-5 bg-red-500 rounded-full text-[9px] font-black text-white flex items-center justify-center">
                      {msgUnread > 9 ? '9+' : msgUnread}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="p-4 border-t border-white/5 space-y-2">
              {userData.role === 'client' && (
                <Button variant="ghost" className="w-full h-10 text-[9px] uppercase font-black tracking-widest gap-2 text-gold hover:bg-gold/5 border-gold/20" onClick={() => { setShowMandateSigning(true); setIsSidebarOpen(false); }}>
                  <PenTool size={13} /> Signer Mandat
                </Button>
              )}
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-gold/25 to-white/5 flex items-center justify-center text-gold font-serif font-bold text-sm border border-gold/15 shrink-0">
                  {userData.fullName?.charAt(0) || userData.displayName?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-silver truncate">{userData.fullName || userData.displayName}</p>
                  <p className="text-[9px] text-slate-500 uppercase font-bold truncate tracking-tight">
                    {userData.role === 'super_admin' ? 'Suprême' : userData.role === 'sub_admin' ? 'Comptable' : 'Client'}
                  </p>
                </div>
                <button onClick={onLogout} title="Déconnexion" className="p-1.5 text-slate-600 hover:text-red-400 transition-colors">
                  <LogOut size={14} />
                </button>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Main Content — offset by sidebar on desktop */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden relative z-10 w-full md:ml-[72px]">
        {/* Header — minimal */}
        <header className="h-14 md:h-16 bg-[#060606]/80 backdrop-blur-xl border-b border-white/[0.04] flex items-center justify-between px-4 md:px-8 shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-slate-500 hover:text-gold transition-colors md:hidden"
            >
              <Menu size={20}/>
            </button>
            <img src="/logo.png" alt="CF" className="w-7 h-7 object-contain opacity-80 md:hidden" />
            {/* Page title */}
            <span className="hidden md:block text-[11px] uppercase tracking-[0.35em] font-bold text-slate-600">
              {navItems.find(n => n.id === activeTab)?.label || 'ComptaFlow'}
            </span>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            {userData.role === 'client' && (
              <div className="hidden md:block">
                <ModeSwitcher mode={currentMode} onToggle={onToggleMode} />
              </div>
            )}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:text-gold transition-colors text-slate-500 cursor-pointer"
            >
              <Globe size={12} className="text-gold/60" />
              <span className="hidden sm:inline">{lang.toUpperCase()}</span>
            </button>
            <button className="p-2 relative group text-slate-500 hover:text-gold transition-colors">
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-gold rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Page content */}
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

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 md:hidden bg-[#060606]/95 backdrop-blur-3xl border-t border-white/[0.04]">
        <div className="flex items-center justify-around px-1 py-1.5">
          {bottomNavItems.map(item => (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all duration-200 flex-1 min-w-0 relative ${
                activeTab === item.id ? 'text-gold' : 'text-slate-600'
              }`}
            >
              <item.icon size={19} />
              <span className="text-[8px] font-bold uppercase tracking-tight truncate w-full text-center leading-tight opacity-70">
                {item.label.split(' ')[0]}
              </span>
              {activeTab === item.id && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-gold rounded-full" />}
            </button>
          ))}
          {navItems.length > 5 && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all duration-200 flex-1 text-slate-600"
            >
              <Menu size={19} />
              <span className="text-[8px] font-bold uppercase tracking-tight opacity-70">Plus</span>
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
