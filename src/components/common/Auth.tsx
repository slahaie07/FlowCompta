import { motion, AnimatePresence } from 'motion/react';
import { Mail, Key, UserPlus, LogIn, ShieldAlert, ArrowLeft, ArrowRight, Lock, X, ShieldCheck, RefreshCw } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';

// Imports recalibrés pour la nouvelle architecture
import { supabase } from '../../lib/supabase';
import { CONFIG } from '../../lib/config';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { toast } from 'sonner';

interface AuthProps {
  onAuthentication: (email: string) => void;
  mockLogin?: (email: string, isAdmin: boolean) => void;
}

type AuthView = 'choice' | 'login' | 'register' | 'otp_verify';

export function Auth({ onAuthentication, mockLogin }: AuthProps) {
  const [view, setView] = useState<AuthView>('choice');
  const [emailInput, setEmailInput] = useState('');
  const [password, setPassword] = useState('');
  const [useOtp, setUseOtp] = useState(false);
  const [otpCode, setOtpCode] = useState<string[]>(Array(6).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [showDemoTip, setShowDemoTip] = useState(false);
  
  const otpInputsRef = useRef<HTMLInputElement[]>([]);

  // Gestion du compte à rebours pour le renvoi de l'OTP
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Autofocus premier input OTP
  useEffect(() => {
    if (view === 'otp_verify' && otpInputsRef.current[0]) {
      setTimeout(() => otpInputsRef.current[0]?.focus(), 100);
    }
  }, [view]);

  // Mode de détection hors-ligne ou session fictive
  const checkIsMock = (email: string) => {
    const localSession = localStorage.getItem('comptaflow_mock_session');
    if (localSession) return true;
    return email.toLowerCase().includes('comptaflow.ca') || email.toLowerCase().includes('mock') || !window.navigator.onLine;
  };

  // Envoi de l'OTP
  const handleSendOtp = async (email: string) => {
    setIsLoading(true);
    setError('');
    const cleanEmail = email.toLowerCase().trim();
    const isMock = checkIsMock(cleanEmail);

    if (isMock) {
      setTimeout(() => {
        setIsLoading(false);
        setView('otp_verify');
        setCountdown(60);
        setShowDemoTip(true);
        toast.info("🔐 Mode Démo : Saisissez le code '123456' pour vous connecter.");
      }, 1000);
      return;
    }

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: view === 'register',
          emailRedirectTo: window.location.origin + '/dashboard',
        }
      });

      if (otpError) throw otpError;

      setView('otp_verify');
      setCountdown(60);
      toast.success("Code d'accès envoyé avec succès !");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Impossible d'envoyer le code d'accès.");
    } finally {
      setIsLoading(false);
    }
  };

  // Validation de l'OTP
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError('');

    const token = otpCode.join('');
    if (token.length < 6) {
      setError("Veuillez saisir le code complet de 6 chiffres.");
      setIsLoading(false);
      return;
    }

    const cleanEmail = emailInput.toLowerCase().trim();
    const isMock = checkIsMock(cleanEmail);

    if (isMock) {
      setTimeout(() => {
        setIsLoading(false);
        if (token === '123456') {
          const isAdmin = cleanEmail.includes('admin');
          if (mockLogin) {
            mockLogin(cleanEmail, isAdmin);
          }
          onAuthentication(cleanEmail);
          toast.success("Authentification démo réussie.");
        } else {
          setError("Code incorrect. (Indice de démo : 123456)");
        }
      }, 1000);
      return;
    }

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token,
        type: 'email'
      });

      if (verifyError) throw verifyError;

      if (data.user) {
        onAuthentication(data.user.email!);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Code de validation incorrect ou expiré.");
    } finally {
      setIsLoading(false);
    }
  };

  // Connexion Classique par Mot de Passe
  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const cleanEmail = emailInput.toLowerCase().trim();
    const finalEmail = cleanEmail === 'admin' ? CONFIG.APP.ADMIN_EMAILS[0] : cleanEmail;
    const isMock = checkIsMock(finalEmail);

    if (isMock) {
      setTimeout(() => {
        setIsLoading(false);
        const isAdmin = finalEmail.includes('admin') || CONFIG.APP.ADMIN_EMAILS.includes(finalEmail);
        if (mockLogin) {
          mockLogin(finalEmail, isAdmin);
        }
        onAuthentication(finalEmail);
      }, 1500);
      return;
    }

    try {
      if (view === 'register') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: finalEmail,
          password,
          options: {
            emailRedirectTo: window.location.origin + '/dashboard',
            data: { display_name: 'Nouvel Entrepreneur' }
          }
        });

        if (signUpError) throw signUpError;
        if (data.user) {
          toast.success("Veuillez confirmer votre compte par courriel.");
          setView('choice');
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: finalEmail,
          password
        });

        if (signInError) throw signInError;

        if (data.user) {
          if (!data.user.email_confirmed_at && data.user.app_metadata?.provider === 'email') {
            setError("Veuillez confirmer votre courriel avant de vous connecter.");
            await supabase.auth.signOut();
            return;
          }
          onAuthentication(data.user.email!);
        }
      }
    } catch (err: any) {
      let friendlyMessage = err.message || "Identifiants invalides.";
      if (err.message?.includes("provider is not enabled")) {
        friendlyMessage = "Le mot de passe n'est pas activé. Connectez-vous avec l'accès direct sans mot de passe (OTP).";
      }
      setError(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion de la saisie OTP dans les cases
  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return; // N'accepter que les chiffres
    
    const newOtp = [...otpCode];
    newOtp[index] = value.substring(value.length - 1);
    setOtpCode(newOtp);

    // Auto-focus vers l'input suivant
    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (pastedData.length === 6 && !isNaN(Number(pastedData))) {
      const newOtp = pastedData.split('');
      setOtpCode(newOtp);
      otpInputsRef.current[5]?.focus();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-noir px-6 font-sans">   
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-gold/5 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gold/5 rounded-full blur-[140px]" />
      </div>

      <div className="absolute top-8 right-8 z-20">
         <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-gold/20 rounded-full text-[10px] font-bold text-silver uppercase tracking-[0.2em]">
            <Lock size={12} className="text-gold" /> Chiffrement Souverain
         </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'choice' ? (
          <motion.div key="choice" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="relative z-10 w-full max-w-4xl">
             <div className="text-center mb-16 space-y-4">
                <div className="w-20 h-20 border-2 border-gold rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-gold/20 mb-8 transition-transform hover:rotate-3 duration-500">
                   <span className="font-serif font-bold text-4xl text-gold">C</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-serif text-ivoire tracking-tighter">Comptaflow<span className="text-gold italic">.</span></h1>
                <p className="text-slate-500 uppercase tracking-[0.4em] text-[10px] font-bold italic">La comptabilité qui coule de source</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                {/* Bouton Login */}
                <button
                  type="button"
                  onClick={() => { setView('login'); setUseOtp(true); }}
                  className="group relative p-8 md:p-12 rounded-[2.5rem] bg-surface border border-white/10 hover:border-gold/50 transition-all duration-500 text-center space-y-6 z-30 cursor-pointer overflow-hidden shadow-2xl"
                >
                   <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                   <div className="w-16 h-16 rounded-2xl bg-gold/5 border border-gold/20 flex items-center justify-center text-gold mx-auto group-hover:bg-gold group-hover:text-noir transition-all duration-500 relative z-10">
                      <LogIn size={32} />
                   </div>
                   <div className="space-y-2 relative z-10">
                      <h3 className="text-2xl font-serif text-ivoire">Espace Client</h3>
                      <p className="text-sm text-slate-500 font-light italic">Authentification d'élite par clé d'accès unique</p>
                   </div>
                </button>

                {/* Bouton Register */}
                <button
                  type="button"
                  onClick={() => { setView('register'); setUseOtp(true); }}
                  className="group relative p-8 md:p-12 rounded-[2.5rem] bg-surface border border-white/10 hover:border-gold/50 transition-all duration-500 text-center space-y-6 z-30 cursor-pointer overflow-hidden shadow-2xl"
                >
                   <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                   <div className="w-16 h-16 rounded-2xl bg-gold/5 border border-gold/20 flex items-center justify-center text-gold mx-auto group-hover:bg-gold group-hover:text-noir transition-all duration-500 relative z-10">
                      <UserPlus size={32} />
                   </div>
                   <div className="space-y-2 relative z-10">
                      <h3 className="text-2xl font-serif text-ivoire">Nouveau Dossier</h3>
                      <p className="text-sm text-slate-500 font-light italic">Créer un profil professionnel en 3 minutes</p>
                   </div>
                </button>
             </div>

             {/* Accès Démo Instantané */}
             <div className="mt-12 text-center space-y-5 relative z-30">
                <div className="relative py-2 max-w-md mx-auto">
                   <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10"></span></div>
                   <div className="relative flex justify-center text-[9px] uppercase tracking-[0.3em] font-black"><span className="bg-noir px-4 text-slate-500">Accès Démo Instantané</span></div>
                </div>
                <div className="flex flex-wrap justify-center gap-4">
                   <button
                     type="button"
                     onClick={() => {
                       if (mockLogin) {
                         mockLogin('client@comptaflow.ca', false);
                         onAuthentication('client@comptaflow.ca');
                       }
                     }}
                     className="px-8 py-4 rounded-[1.5rem] bg-white/5 border border-gold/30 hover:border-gold hover:bg-gold/10 transition-all duration-300 text-gold text-xs uppercase font-bold tracking-widest cursor-pointer shadow-lg shadow-gold/5 flex items-center gap-2"
                   >
                     <span>🚀</span> Mode Client Démo
                   </button>
                   <button
                     type="button"
                     onClick={() => {
                       if (mockLogin) {
                         mockLogin('admin@comptaflow.ca', true);
                         onAuthentication('admin@comptaflow.ca');
                       }
                     }}
                     className="px-8 py-4 rounded-[1.5rem] bg-gold/10 border border-gold/50 hover:border-gold hover:bg-gold/20 transition-all duration-300 text-gold text-xs uppercase font-bold tracking-widest cursor-pointer shadow-lg shadow-gold/15 flex items-center gap-2"
                   >
                     <span>👑</span> Mode Admin Cabinet
                   </button>
                </div>
             </div>
          </motion.div>
        ) : view === 'otp_verify' ? (
          <motion.div key="otp_verify" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="relative z-10 w-full max-w-md">
            <Card className="p-10 relative bg-surface border-gold/30" glow="gold">
              <button
                type="button"
                onClick={() => { setView('login'); setError(''); setShowDemoTip(false); }}
                className="absolute left-6 top-6 text-slate-500 hover:text-ivoire flex items-center gap-2 text-xs uppercase font-bold tracking-widest transition-colors z-20 cursor-pointer"
              >
                 <ArrowLeft size={14} /> Retour
              </button>

              <div className="flex flex-col items-center text-center space-y-8 pt-8">
                <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold text-gold flex items-center justify-center shadow-lg shadow-gold/10">
                  <ShieldCheck size={32} />
                </div>

                <div className="space-y-2">
                  <h2 className="text-3xl font-serif text-ivoire tracking-tight italic">Clé d'Accès.</h2>
                  <p className="text-slate-500 text-[10px] uppercase tracking-[0.2em] font-bold">
                    Saisissez le code de validation reçu
                  </p>
                </div>

                {showDemoTip && (
                  <div className="w-full p-4 bg-gold/5 border border-gold/20 text-gold text-xs rounded-xl font-light italic">
                    🔐 Compte démo actif : Veuillez utiliser le code <span className="font-bold font-mono text-sm underline decoration-wavy">123456</span> pour valider votre entrée.
                  </div>
                )}

                {error && (
                  <div className="w-full p-4 text-xs text-danger bg-danger/10 border border-danger/20 rounded-xl flex items-center gap-3 text-left">
                    <ShieldAlert size={18} className="shrink-0" /> <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleVerifyOtp} className="w-full space-y-8">
                  {/* PIN Input de Haute Sécurité */}
                  <div className="flex justify-between gap-2">
                    {otpCode.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={el => { if (el) otpInputsRef.current[idx] = el; }}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(idx, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(idx, e)}
                        onPaste={handleOtpPaste}
                        className="w-12 h-14 bg-noir border border-white/10 rounded-xl text-center text-xl font-serif font-bold text-gold focus:border-gold focus:ring-1 focus:ring-gold/30 outline-none transition-all shadow-inner"
                      />
                    ))}
                  </div>

                  <Button type="submit" variant="gold" className="w-full h-16 gap-3 font-bold uppercase tracking-[0.2em] shadow-gold/20" isLoading={isLoading}>
                    Valider le code d'accès <ArrowRight size={20}/>
                  </Button>
                </form>

                <div className="pt-2 text-center">
                  {countdown > 0 ? (
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">
                      Renvoyer un code dans {countdown}s
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendOtp(emailInput)}
                      className="text-[10px] text-gold hover:text-ivoire font-black uppercase tracking-widest flex items-center gap-2 mx-auto cursor-pointer transition-colors"
                      disabled={isLoading}
                    >
                      <RefreshCw size={12} /> Renvoyer un code d'accès
                    </button>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="relative z-10 w-full max-w-md">
            <Card className="p-10 relative bg-surface border-gold/30" glow="gold">
              <button
                type="button"
                onClick={() => { setView('choice'); setError(''); }}
                className="absolute left-6 top-6 text-slate-500 hover:text-ivoire flex items-center gap-2 text-xs uppercase font-bold tracking-widest transition-colors z-20 cursor-pointer"
              >
                 <ArrowLeft size={14} /> Retour
              </button>

              <div className="flex flex-col items-center text-center space-y-8 pt-8">
                <div className="w-16 h-16 rounded-2xl bg-gold text-noir flex items-center justify-center shadow-gold/20">
                  {view === 'login' ? <LogIn size={32} /> : <UserPlus size={32} />}
                </div>

                <div className="w-full space-y-8">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-serif text-ivoire tracking-tight italic leading-tight">
                      {view === 'login' ? "Identité Cabinet." : "Nouveau Dossier."}
                    </h2>
                    <p className="text-slate-500 text-[10px] uppercase tracking-[0.2em] font-bold">
                      {useOtp ? "Connexion haute sécurité sans mot de passe" : "Identification classique"}
                    </p>
                  </div>

                  {error && (
                    <div className="p-4 text-xs text-danger bg-danger/10 border border-danger/20 rounded-xl flex items-center gap-3 text-left animate-shake">
                      <ShieldAlert size={18} className="shrink-0" /> <span>{error}</span>
                    </div>
                  )}

                  <div className="space-y-5">
                    <Input
                      type="email" 
                      placeholder="Votre adresse courriel"
                      icon={<Mail size={18} className="text-gold/40" />}
                      value={emailInput}
                      onChange={e => setEmailInput(e.target.value)}
                      required
                      className="bg-noir border-white/10 focus:border-gold/50"
                    />

                    {!useOtp && (
                      <Input
                        type="password"
                        placeholder="Mot de passe"
                        icon={<Key size={18} className="text-gold/40" />}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="bg-noir border-white/10 focus:border-gold/50"
                      />
                    )}

                    {useOtp ? (
                      <Button 
                        onClick={() => handleSendOtp(emailInput)} 
                        variant="gold" 
                        className="w-full h-16 gap-3 font-bold uppercase tracking-[0.2em] shadow-gold/20 mt-4 animate-in fade-in duration-300"
                        isLoading={isLoading}
                        disabled={!emailInput}
                      >
                        Recevoir mon code d'accès <ArrowRight size={20}/>
                      </Button>
                    ) : (
                      <form onSubmit={handlePasswordAuth} className="space-y-5">
                        <Button 
                          type="submit" 
                          variant="gold" 
                          className="w-full h-16 gap-3 font-bold uppercase tracking-[0.2em] shadow-gold/20 mt-4" 
                          isLoading={isLoading}
                        >
                          Se connecter <ArrowRight size={20}/>
                        </Button>
                      </form>
                    )}

                    <div className="pt-4 text-center">
                      <button
                        type="button"
                        onClick={() => { setUseOtp(!useOtp); setError(''); }}
                        className="text-[10px] text-slate-500 hover:text-gold uppercase tracking-widest font-black transition-colors cursor-pointer"
                      >
                        {useOtp ? "👉 Se connecter avec mot de passe" : "👉 Connexion sans mot de passe (Code OTP)"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-8 text-center w-full z-10 px-6">
         <p className="text-[9px] text-slate-600 uppercase tracking-[0.4em] font-bold">Cabinet Comptaflow • Québec • MMXXVI</p>
      </div>
    </div>
  );
}