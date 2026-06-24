import { Bell, Search, Shield, LogOut, Menu, X, Globe, PenTool } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { EliteSignature } from '../../components/ui/EliteSignature';
import { Button } from '../../components/ui/Button';
import { ModeSwitcher } from '../../components/ui/ModeSwitcher';
import { generateContract } from '../../lib/contractEngine';
import { useLanguage } from '../../hooks/useLanguage';
import { PortalNav } from './PortalNav';
import { PortalRoutes } from './PortalRoutes';
import { getPortalNav, isPathAllowedForRole } from '../config';
import { getPortalBasePath, getActiveSegment } from '../config/paths';
import type { PortalShellProps, PortalRole, PortalRouteContext } from '../types';

interface PortalShellComponentProps extends PortalShellProps {
  routeContext: Omit<PortalRouteContext, keyof PortalShellProps | 'isVaultUnlocked' | 'setIsVaultUnlocked' | 'setShowMandateSigning'>;
}

export function PortalShell({
  userData,
  currentMode,
  onLogout,
  onToggleMode,
  onRefreshProfile,
  routeContext,
}: PortalShellComponentProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, toggleLanguage, t } = useLanguage();
  const role = (userData.role ?? 'client') as PortalRole;
  const portalBasePath = getPortalBasePath(role);

  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia('(min-width: 768px)').matches);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.matchMedia('(min-width: 768px)').matches);
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [showMandateSigning, setShowMandateSigning] = useState(false);

  const activePath = getActiveSegment(location.pathname, role);
  const navSections = getPortalNav(role);

  useEffect(() => {
    if (!location.pathname.includes('vault')) {
      setIsVaultUnlocked(false);
    }
    if (!isDesktop) setIsSidebarOpen(false);
  }, [location.pathname, isDesktop]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onResize = () => {
      setIsDesktop(mq.matches);
      if (mq.matches) setIsSidebarOpen(true);
    };
    mq.addEventListener('change', onResize);
    return () => mq.removeEventListener('change', onResize);
  }, []);

  const handleNavigate = (path: string) => {
    if (!isPathAllowedForRole(path, role)) return;
    navigate(`${portalBasePath}/${path}`);
    if (!isDesktop) setIsSidebarOpen(false);
  };

  const portalCtx: PortalRouteContext = {
    userData,
    currentMode,
    onLogout,
    onToggleMode,
    onRefreshProfile,
    isVaultUnlocked,
    setIsVaultUnlocked,
    setShowMandateSigning,
    ...routeContext,
  };

  const currentContract = generateContract('fr', 'Gestion Comptable ComptaFlow', 249, 'CAD');

  return (
    <div className="min-h-screen flex bg-noir relative overflow-hidden w-full">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold/5 rounded-full blur-[120px]" />
      </div>

      {isSidebarOpen && !isDesktop && (
        <button
          type="button"
          aria-label={t('portal.closeMenu')}
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <motion.nav
        initial={false}
        animate={{
          width: isSidebarOpen ? (isDesktop ? 300 : '100%') : 0,
          x: isSidebarOpen ? 0 : -300,
        }}
        className="fixed md:relative h-screen bg-[#050505]/90 backdrop-blur-3xl border-r border-white/5 flex flex-col z-30 overflow-hidden shrink-0"
      >
        <div className="p-8 flex items-center justify-between">
          <button
            type="button"
            className="flex items-center gap-4 text-left"
            onClick={() => navigate(portalBasePath)}
          >
            <div className="w-10 h-10 rounded-xl premium-gradient-gold flex items-center justify-center shadow-[0_0_20px_rgba(198,161,91,0.3)]">
              <Shield size={20} className="text-noir" />
            </div>
            <div>
              <span className="font-serif font-bold text-gold tracking-[0.1em] italic text-2xl animated-gradient-text block leading-none">
                CF
              </span>
              <span className="text-xs uppercase tracking-[0.3em] text-slate-500 font-black mt-1 block">
                {t('portal.brand')}
              </span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            aria-label={t('portal.closeMenu')}
            className="md:hidden p-2 text-slate-500 hover:text-gold transition-colors focus-ring rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        <div className="px-8 mb-2">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-gold/70">
            {t(`portal.roles.${role}`)}
          </p>
        </div>

        {role === 'client' && (
          <div className="px-8 mb-4">
            <ModeSwitcher mode={currentMode} onToggle={onToggleMode} />
          </div>
        )}

        <PortalNav
          sections={navSections}
          activePath={activePath}
          portalPrefix={portalBasePath}
          onNavigate={handleNavigate}
        />

        <div className="p-8 border-t border-white/5 space-y-4 bg-black/20">
          {role === 'client' && (
            <Button
              variant="ghost"
              className="w-full h-12 rounded-2xl border-gold/20 text-gold text-xs uppercase font-black tracking-widest gap-2 hover:bg-gold/5"
              onClick={() => setShowMandateSigning(true)}
            >
              <PenTool size={14} /> {t('portal.signMandate')}
            </Button>
          )}

          <div className="flex items-center gap-4 p-3 glass-card rounded-2xl border border-white/5 hover:border-gold/20 transition-colors group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-gold/20 to-white/5 flex items-center justify-center text-gold font-serif font-bold shrink-0 shadow-lg border border-gold/10 group-hover:scale-105 transition-transform">
              {userData.fullName?.charAt(0) || userData.displayName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-silver truncate group-hover:text-ivoire transition-colors">
                {userData.fullName || userData.displayName}
              </p>
              <p className="text-xs text-slate-500 uppercase font-black truncate tracking-tighter">
                {userData.email}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="w-full gap-2 hover:border-red-500/30 hover:text-red-400 h-12 rounded-2xl"
          >
            <LogOut size={14} /> {t('portal.logout')}
          </Button>
        </div>
      </motion.nav>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10 w-full">
        <header className="h-20 bg-noir/40 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 md:px-12 shrink-0">
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              aria-label={t('portal.openMenu')}
              className="md:hidden p-3 text-slate-400 bg-white/5 rounded-2xl hover:text-gold transition-colors focus-ring"
            >
              <Menu size={20} />
            </button>
            <div className="relative hidden md:block w-[450px] group">
              <label htmlFor="portal-search" className="sr-only">
                {t('portal.search')}
              </label>
              <Search
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-gold transition-colors duration-500"
                size={18}
                aria-hidden
              />
              <input
                id="portal-search"
                type="search"
                placeholder={t('portal.search')}
                className="w-full bg-white/5 border border-white/5 rounded-2xl pl-14 pr-6 py-3 text-sm focus-visible:ring-2 focus-visible:ring-gold/20 focus-visible:bg-white/10 outline-none transition-all placeholder:text-slate-600 font-medium"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <button
              type="button"
              onClick={toggleLanguage}
              aria-label={t('portal.changeLanguage')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/5 rounded-xl text-xs font-bold uppercase tracking-widest hover:border-gold/30 transition-all text-slate-400 hover:text-gold cursor-pointer focus-ring"
            >
              <Globe size={12} className="text-gold" />
              <span>{lang.toUpperCase()}</span>
            </button>
            <button
              type="button"
              aria-label={t('portal.notifications')}
              className="p-2.5 bg-white/5 border border-white/5 hover:border-gold/30 rounded-xl transition-all relative group focus-ring"
            >
              <Bell size={18} className="text-slate-400 group-hover:text-gold transition-colors" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar pb-20 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname + currentMode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="h-full w-full"
            >
              <PortalRoutes ctx={portalCtx} role={role} />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {showMandateSigning && (
        <EliteSignature contract={currentContract} onComplete={() => {
          if (userData?.id) {
            localStorage.setItem(`comptaflow_mandate_signed_${userData.id}`, 'true');
          }
          setShowMandateSigning(false);
          if (onRefreshProfile) onRefreshProfile();
        }} />
      )}
    </div>
  );
}
