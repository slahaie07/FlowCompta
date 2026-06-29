import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, Unlock, ShieldCheck, ArrowRight, 
  Building2, LockKeyhole, DollarSign, CheckCircle2, 
  FileSpreadsheet
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { CONFIG } from '../../lib/config';
import { useLanguage } from '../../hooks/useLanguage';

interface VaultEntranceProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
  isUnlocked: boolean;
  onUnlock: () => void;
  onLock: () => void;
}

export function VaultEntrance({ 
  onLoginClick, 
  onRegisterClick, 
  isUnlocked, 
  onUnlock, 
  onLock 
}: VaultEntranceProps) {
  const { lang } = useLanguage();
  const isEn = lang === 'en';

  const [unlockingState, setUnlockingState] = useState<'idle' | 'spinning' | 'handshake' | 'decrypting' | 'granted'>('idle');
  const [consoleMessage, setConsoleMessage] = useState(isEn ? 'SYS.STATUS: SECURE_LOCK_ACTIVE' : 'SYS.STATUT : VERROU_SÉCURISÉ_ACTIF');
  const [glowColor, setGlowColor] = useState<'red' | 'amber' | 'green'>('red');

  useEffect(() => {
    if (isUnlocked) {
      setUnlockingState('granted');
      setConsoleMessage(isEn ? 'SYS.STATUS: ACCESS_GRANTED_OPEN' : 'SYS.STATUT : ACCÈS_AUTORISÉ_OUVERT');
      setGlowColor('green');
    } else {
      setUnlockingState('idle');
      setConsoleMessage(isEn ? 'SYS.STATUS: SECURE_LOCK_ACTIVE' : 'SYS.STATUT : VERROU_SÉCURISÉ_ACTIF');
      setGlowColor('red');
    }
  }, [isUnlocked, isEn]);

  const triggerUnlockSequence = () => {
    if (unlockingState !== 'idle') return;

    setUnlockingState('spinning');
    setConsoleMessage(isEn ? 'SYS.DIAL: ROTATING_VALVES...' : 'SYS.CADRAN : ROTATION_DES_SOUPAPES...');
    setGlowColor('amber');

    // Spin dial for 1.2s, then start digital handshake
    setTimeout(() => {
      setUnlockingState('handshake');
      setConsoleMessage(isEn ? 'SYS.AUTH: INITIATING SECURE HANDSHAKE...' : 'SYS.AUTH : INITIALISATION DE LA LIAISON SÉCURISÉE...');
      
      setTimeout(() => {
        setUnlockingState('decrypting');
        setConsoleMessage(isEn ? 'SYS.KEY: DECRYPTING SHA-256 LEDGER...' : 'SYS.CLÉ : DÉCRYPTAGE DU REGISTRE SHA-256...');
        
        setTimeout(() => {
          setUnlockingState('granted');
          setConsoleMessage(isEn ? 'SYS.STATUS: ACCESS_GRANTED - WELCOME TO COMPTAFLOW' : 'SYS.STATUT : ACCÈS AUTORISÉ - BIENVENUE CHEZ COMPTAFLOW');
          setGlowColor('green');
          
          // Let the user see the "granted" state for 600ms before opening
          setTimeout(() => {
            onUnlock();
          }, 600);
        }, 1000);
      }, 1000);
    }, 1200);
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-4 px-4 flex flex-col items-center justify-center min-h-[75vh] relative z-10">
      
      {/* Dynamic Status Bar - Top Navigation */}
      <div className="w-full flex items-center justify-between border-b border-white/5 pb-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-gold to-gold-dark flex items-center justify-center shadow-lg shadow-gold/10">
            <Building2 size={16} className="text-noir" />
          </div>
          <span className="font-serif font-medium text-gold tracking-tight italic text-xl">ComptaFlow<span className="text-ivoire">.</span></span>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-4 text-[10px] tracking-widest font-bold text-slate-500 uppercase">
            <span className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-gold" /> {isEn ? 'LAW 25 COMPLIANT' : 'CONFORME LOI 25'}</span>
            <span className="w-1 h-1 bg-white/10 rounded-full" />
            <span className="flex items-center gap-1.5"><LockKeyhole size={12} className="text-gold" /> AES-256 ENCRYPTED</span>
          </div>
          {isUnlocked && (
            <button 
              onClick={onLock}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/5 hover:border-gold/30 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-gold transition-all"
            >
              <Lock size={10} /> {isEn ? 'Lock portal' : 'Verrouiller le portail'}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!isUnlocked ? (
          <motion.div 
            key="vault-door"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl bg-surface border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden"
          >
            {/* Ambient Background Glows */}
            <div className="absolute inset-0 pointer-events-none z-0">
              {glowColor === 'red' && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-red-500/5 rounded-full blur-[100px] transition-all duration-1000" />}
              {glowColor === 'amber' && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/5 rounded-full blur-[100px] transition-all duration-1000" />}
              {glowColor === 'green' && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-green-500/5 rounded-full blur-[100px] transition-all duration-1000" />}
            </div>

            {/* Cinematic Header inside Vault Panel */}
            <div className="text-center mb-8 relative z-10 space-y-2">
              <h2 className="text-2xl md:text-3xl font-serif text-ivoire tracking-tight">
                {isEn ? 'Secure Entrance Gate ' : 'Portail de Sécurité '}
                <span className="text-gold italic">ComptaFlow.</span>
              </h2>
              <p className="text-slate-500 uppercase tracking-[0.25em] text-[9px] font-bold">
                {isEn ? 'High-End Digital CPA Workspace' : 'Cabinet Comptable Numérique de Pointe'}
              </p>
            </div>

            {/* Vault Mechanism visual representation */}
            <div className="flex flex-col items-center justify-center py-6 relative z-10">
              
              {/* Lock Indicator Light */}
              <div className="mb-8 flex items-center gap-2 px-4 py-2 bg-black/40 rounded-full border border-white/5 backdrop-blur-md">
                <span className={`w-2.5 h-2.5 rounded-full relative ${
                  glowColor === 'red' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.7)] animate-pulse' :
                  glowColor === 'amber' ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.7)] animate-spin' :
                  'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.7)]'
                }`}>
                  {glowColor === 'amber' && (
                    <span className="absolute inset-0 rounded-full border border-t-white animate-spin"></span>
                  )}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-widest font-mono ${
                  glowColor === 'red' ? 'text-red-400' :
                  glowColor === 'amber' ? 'text-amber-400' :
                  'text-green-400'
                }`}>
                  {glowColor === 'red' && (isEn ? 'SECURE PORTAL - LOCKED' : 'PORTAIL SÉCURISÉ - VERROUILLÉ')}
                  {glowColor === 'amber' && (isEn ? 'DECRYPTING ACCESS...' : 'DÉVERROUILLAGE EN COURS...')}
                  {glowColor === 'green' && (isEn ? 'GRANTED - OPENING' : 'AUTORISÉ - OUVERTURE')}
                </span>
              </div>

              {/* Interactive Safe Wheel (3D-like Custom SVG) */}
              <div 
                className="relative cursor-pointer select-none group"
                onClick={triggerUnlockSequence}
              >
                {/* Outer shadow aura */}
                <div className="absolute inset-[-15px] rounded-full bg-gradient-to-tr from-gold/10 to-transparent blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                {/* Outer Rim */}
                <div className="w-52 h-52 md:w-60 md:h-60 rounded-full bg-gradient-to-tr from-[#121620] to-[#0a0d15] border-4 border-double border-white/10 flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.5),_inset_0_2px_4px_rgba(255,255,255,0.05)] relative">
                  
                  {/* Outer Rivets */}
                  {[...Array(12)].map((_, i) => (
                    <div 
                      key={i} 
                      className="absolute w-2 h-2 rounded-full bg-white/10 border border-black/30"
                      style={{ 
                        transform: `rotate(${i * 30}deg) translateY(-105px)`,
                        transformOrigin: 'center center'
                      }}
                    />
                  ))}

                  {/* Golden Rotating Spokes & Center Dial */}
                  <motion.div 
                    className="w-40 h-40 md:w-48 md:h-48 rounded-full flex items-center justify-center relative"
                    animate={
                      unlockingState === 'spinning' 
                        ? { rotate: 720 } 
                        : unlockingState === 'handshake' || unlockingState === 'decrypting'
                        ? { rotate: [720, 700, 710, 705] }
                        : unlockingState === 'granted'
                        ? { rotate: 765 }
                        : { rotate: 0 }
                    }
                    transition={{
                      duration: unlockingState === 'spinning' ? 1.2 : 0.8,
                      ease: "easeInOut"
                    }}
                  >
                    {/* Golden Handles (Spokes) */}
                    {[...Array(4)].map((_, i) => (
                      <div 
                        key={i} 
                        className="absolute w-4 h-full flex flex-col justify-between py-1 items-center"
                        style={{ transform: `rotate(${i * 45}deg)` }}
                      >
                        <div className="w-4 h-6 rounded bg-gradient-to-b from-gold via-gold-dark to-yellow-600 border border-gold/40 shadow-md shadow-black/40" />
                        <div className="w-4 h-6 rounded bg-gradient-to-t from-gold via-gold-dark to-yellow-600 border border-gold/40 shadow-md shadow-black/40" />
                      </div>
                    ))}

                    {/* Safe Wheel Center Dial */}
                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-tr from-[#1c2230] to-[#252f44] border-2 border-gold/40 flex items-center justify-center shadow-lg relative z-10">
                      {/* Heavy Golden Core */}
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-tr from-gold to-gold-dark flex flex-col items-center justify-center shadow-inner relative border border-gold/30">
                        <Lock size={20} className="text-noir group-hover:scale-110 transition-transform duration-300" />
                        <span className="text-[7px] text-noir font-bold tracking-widest mt-1">SECURE</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Digital LED Screen displaying live code operations */}
              <div className="w-full max-w-md mt-10 bg-black/60 border border-white/5 rounded-2xl p-4 font-mono text-[10px] text-gold/80 shadow-inner relative overflow-hidden">
                <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-gold/5 to-transparent pointer-events-none" />
                <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2 text-slate-500">
                  <span>{isEn ? 'CONSOLE DE COMMANDEMENT v5.0' : 'CONSOLE DE COMMANDEMENT v5.0'}</span>
                  <span className="animate-pulse">ONLINE</span>
                </div>
                <div className="space-y-1">
                  <div className="text-slate-400">&gt; {consoleMessage}</div>
                  <div className="text-slate-600">
                    {unlockingState === 'spinning' && (isEn ? 'OPERATING VALVES: [180° - 360° - 720°] OK' : 'SOUPAPES EN ACTION: [180° - 360° - 720°] OK')}
                    {unlockingState === 'handshake' && (isEn ? 'CIPHER EXCHANGE: ECDH_P256_AES_GCM_SHA256' : 'ÉCHANGE DE CHIFFREMENT: ECDH_P256_AES_GCM_SHA256')}
                    {unlockingState === 'decrypting' && (isEn ? 'COMPLETING SYNC WITH DATABASE: LOCAL_DB.JSON...' : 'FIN DE SYNCHRO BASE DE DONNÉES: LOCAL_DB.JSON...')}
                    {unlockingState === 'granted' && (isEn ? 'SESSION CREATED. INJECTING WORKSPACE.' : 'SESSION CRÉÉE. CHARGEMENT DE L\'ESPACE CLIENT.')}
                    {unlockingState === 'idle' && (isEn ? 'CLICK WHEEL OR BUTTON TO DECRYPT PLATFORM' : 'TOURNEZ LA POIGNÉE OU APPUYEZ POUR DÉVERROUILLER')}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Trigger Button */}
            <div className="mt-8 flex flex-col items-center gap-3 relative z-10">
              <Button 
                onClick={triggerUnlockSequence} 
                variant="gold"
                className="w-full h-14 font-bold uppercase tracking-widest text-xs gap-2 shadow-glow hover:shadow-glow-sm cursor-pointer"
                isLoading={unlockingState !== 'idle' && unlockingState !== 'granted'}
              >
                {isEn ? 'Unlock the Secure Vault' : 'Déverrouiller le Coffre-Fort'} <ArrowRight size={16} />
              </Button>
              <button 
                onClick={onUnlock}
                className="text-[9px] text-slate-500 uppercase tracking-widest hover:text-ivoire transition-colors cursor-pointer pt-2"
              >
                {isEn ? 'Skip opening animation' : "Passer l'animation d'ouverture"}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="unlocked-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, type: 'spring', damping: 25 }}
            className="w-full space-y-12"
          >
            {/* Split Screen Concept: Choice Cards (Action Hub) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              
              {/* Login Card */}
              <Card 
                className="group relative p-8 md:p-12 rounded-[2.5rem] bg-surface border-white/5 hover:border-gold/30 hover:bg-gold/5 transition-all duration-500 text-center space-y-6 flex flex-col justify-between"
                glow="gold"
              >
                <div className="space-y-6">
                  <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center text-gold mx-auto group-hover:scale-110 transition-transform">
                    <Unlock size={24} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-serif text-ivoire">{isEn ? 'Existing Client' : 'Déjà Client'}</h3>
                    <p className="text-xs text-slate-400 font-light leading-relaxed max-w-xs mx-auto">
                      {isEn ? 'Access your financial dashboards, upload receipts, and chat live with your assigned CPA.' : 'Accédez à vos tableaux de bord financiers, déposez vos reçus et discutez en direct avec votre CPA attitré.'}
                    </p>
                  </div>
                </div>
                <div className="pt-6">
                  <Button 
                    onClick={onLoginClick} 
                    variant="gold"
                    className="w-full h-12 uppercase tracking-widest font-bold text-xs cursor-pointer"
                  >
                    {isEn ? 'Enter my workspace' : 'Entrer dans mon espace'}
                  </Button>
                </div>
              </Card>

              {/* Register Card */}
              <Card 
                className="group relative p-8 md:p-12 rounded-[2.5rem] bg-surface border-white/5 hover:border-sapphire/30 hover:bg-sapphire/5 transition-all duration-500 text-center space-y-6 flex flex-col justify-between"
                glow="sapphire"
              >
                <div className="space-y-6">
                  <div className="w-14 h-14 rounded-2xl bg-sapphire/10 flex items-center justify-center text-sapphire-light mx-auto group-hover:scale-110 transition-transform">
                    <Building2 size={24} className="text-sapphire-light" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-serif text-ivoire">{isEn ? 'New Workspace' : 'Nouveau Cabinet'}</h3>
                    <p className="text-xs text-slate-400 font-light leading-relaxed max-w-xs mx-auto">
                      {isEn ? 'Estimate your custom accounting quote in 2 minutes and launch your "White Glove" onboarding.' : 'Simulez votre devis comptable personnalisé en 2 minutes et lancez votre onboarding numérique "Gant Blanc".'}
                    </p>
                  </div>
                </div>
                <div className="pt-6">
                  <Button 
                    onClick={onRegisterClick} 
                    className="w-full h-12 uppercase tracking-widest font-bold text-xs bg-[#0b0c14] border border-slate-800 text-ivoire hover:bg-slate-900 cursor-pointer"
                  >
                    {isEn ? 'Start onboarding' : "Démarrer l'onboarding"}
                  </Button>
                </div>
              </Card>
            </div>

            {/* Hybrid Landing Section: Services & Pricing Grid */}
            <div className="border-t border-white/5 pt-12 space-y-8">
              <div className="text-center max-w-md mx-auto space-y-2">
                <h3 className="text-xl font-serif text-ivoire">{isEn ? 'Clear pricing with no surprises.' : 'Une tarification claire et sans surprise.'}</h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                  {isEn ? 'Certified CPA Firm & State-of-the-Art Technology' : 'Cabinet Comptable Agrée & Technologie de pointe'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {/* Bookkeeping Service Column */}
                <div className="p-6 rounded-3xl bg-surface border border-white/5 hover:border-white/10 transition-all space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-gold/5 flex items-center justify-center text-gold border border-gold/10">
                    <FileSpreadsheet size={18} />
                  </div>
                  <h4 className="text-base font-bold text-ivoire">{isEn ? 'Global Bookkeeping' : 'Comptabilité Globale'}</h4>
                  <p className="text-xs text-slate-400 font-light leading-relaxed">
                    {isEn 
                      ? 'Monthly entries, bank reconciliation, and live financial statements. Year-end taxes and government reports (GST/QST) fully handled.'
                      : 'Saisie mensuelle, conciliation bancaire et états financiers en direct. Vos impôts de fin d\'année et vos rapports gouvernementaux (TPS/TVQ) entièrement pris en charge.'}
                  </p>
                  <div className="pt-2 text-xs font-bold text-gold">
                    {isEn ? 'Included in the monthly plan' : 'Inclus dans la formule mensuelle'}
                  </div>
                </div>

                {/* Pricing Column */}
                <div className="p-6 rounded-3xl bg-gold/5 border border-gold/20 relative overflow-hidden space-y-4">
                  <div className="absolute top-4 right-4 px-2 py-0.5 bg-gold text-noir text-[8px] font-bold tracking-widest uppercase rounded">POPULAIRE</div>
                  <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold border border-gold/20">
                    <DollarSign size={18} />
                  </div>
                  <h4 className="text-base font-bold text-ivoire">{isEn ? 'PME Monthly Plan' : 'Formule Mensuelle PME'}</h4>
                  <div className="space-y-1">
                    <div className="text-2xl font-serif text-gold font-bold">449,00 $ <span className="text-xs font-sans text-slate-400 font-light">/ {isEn ? 'month' : 'mois'}</span></div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                      {isEn ? 'Initial setup fee' : 'Frais de dossier initial'} : {CONFIG.FEES.SETUP.toFixed(2)} $
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 font-light leading-relaxed">
                    {isEn
                      ? 'A turn-key CPA service tailored for your business, coupled with our 24/7 secure cloud platform.'
                      : 'Un service CPA clé en main adapté à votre entreprise, couplé à notre plateforme cloud sécurisée accessible 24h/24.'}
                  </p>
                </div>

                {/* Security Guarantee Column */}
                <div className="p-6 rounded-3xl bg-surface border border-white/5 hover:border-white/10 transition-all space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-gold/5 flex items-center justify-center text-gold border border-gold/10">
                    <ShieldCheck size={18} />
                  </div>
                  <h4 className="text-base font-bold text-ivoire font-sans">{isEn ? 'Banking Security' : 'Sécurité Bancaire'}</h4>
                  <p className="text-xs text-slate-400 font-light leading-relaxed">
                    {isEn
                      ? 'Your supporting documents are stored in a premium, certified AES-256 bit digital vault. Local redundancy and continuous secure sync.'
                      : 'Vos documents justificatifs sont stockés dans un coffre-fort haut de gamme certifié AES-256 bits. Redondance locale et synchronisation sécurisée permanente.'}
                  </p>
                  <div className="pt-2 text-xs font-bold text-green-400">
                    {isEn ? 'Law 25 Compliant' : 'Certifié conforme Loi 25'}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
