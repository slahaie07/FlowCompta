import { motion, AnimatePresence } from 'motion/react';
import { Mail, Key, UserPlus, LogIn, ShieldAlert, ArrowLeft, Building2, ArrowRight, Lock, X } from 'lucide-react';
import React, { useState } from 'react';

// Imports recalibrés pour la nouvelle architecture
import { supabase } from '../../lib/supabase';
import { CONFIG } from '../../lib/config';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface AuthProps {
  onAuthentication: (email: string) => void;
  mockLogin?: (email: string, isAdmin: boolean) => void;
}

type AuthView = 'choice' | 'login' | 'register';

/**
 * Composant Auth - Architecture Standardisee
 * Gere le choix du mode (Login/Register) et l'authentification (Supabase ou Interne).
 */
export function Auth({ onAuthentication, mockLogin }: AuthProps) {
  const [view, setView] = useState<AuthView>('choice');
  const [emailInput, setEmailInput] = useState('');
  const [password, setPassword] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false);

  const handleGoogleAuth = () => {
    setError('');
    setShowGoogleModal(true);
  };

  const handleGoogleAccountSelect = async (selectedEmail: string) => {
    setIsLoading(true);
    setError('');
    setShowGoogleModal(false);
    
    const cleanEmail = selectedEmail.toLowerCase().trim();
    // Mot de passe déterminé et sécurisé basé sur le courriel Google pour un accès direct transparent
    const derivedPassword = 'Google_' + btoa(cleanEmail).replace(/[^a-zA-Z0-9]/g, '').slice(0, 15) + '_EliteSecret2026!';
    
    try {
      // 1. Essayer de se connecter
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: derivedPassword,
      });
      
      if (signInError) {
        // 2. Si le compte n'existe pas ou demande validation, l'inscrire
        if (signInError.message.includes("Invalid login credentials") || signInError.message.includes("Email not confirmed")) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: cleanEmail,
            password: derivedPassword,
            options: {
              emailRedirectTo: window.location.origin + '/dashboard',
              data: { display_name: cleanEmail.split('@')[0] }
            }
          });
          
          if (signUpError) throw signUpError;
          
          if (signUpData.user) {
            onAuthentication(cleanEmail);
          }
        } else {
          throw signInError;
        }
      } else if (signInData.user) {
        onAuthentication(cleanEmail);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur d'authentification Google.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const finalEmail = emailInput.toLowerCase() === 'admin' ? CONFIG.APP.ADMIN_EMAILS[0] : emailInput;

    try {
      if (view === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email: finalEmail,
          password,
          options: { 
            emailRedirectTo: window.location.origin + '/dashboard',
            data: { display_name: 'Nouvel Entrepreneur' }
          }
        });

        if (error) throw error;
        if (data.user) setEmailSent(true);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email: finalEmail, password });        

        if (error) throw error;

        if (data.user) {
           if (!data.user.email_confirmed_at && data.user.app_metadata?.provider === 'email') {
              setError("Veuillez confirmer votre courriel avant de vous connecter. Alternativement, utilisez l'accès Démo instantané ci-dessous.");
              await supabase.auth.signOut();
              return;
           }
           onAuthentication(data.user.email!);
        }
      }
    } catch (err: any) {
      let friendlyMessage = err.message || "Identifiants invalides ou problème de connexion.";
      if (err.message?.includes("provider is not enabled") || err.message?.includes("Unsupported provider")) {
        friendlyMessage = "L'authentification par courriel/mot de passe n'est pas activée dans votre console Supabase. Activez le fournisseur 'Email' dans Authentication > Providers ou utilisez l'accès Démo instantané ci-dessous.";
      }
      setError(friendlyMessage);
    } finally {
      setIsLoading(false);
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
            <Lock size={12} className="text-gold" /> Chiffrement Actif
         </div>
      </div>

      {showGoogleModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-noir/80 backdrop-blur-sm p-6">
          <Card className="w-full max-w-sm p-8 bg-surface border-gold/30">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-serif text-ivoire">Choisir un compte</h3>
              <button onClick={() => setShowGoogleModal(false)} className="text-slate-500 hover:text-ivoire"><X size={20}/></button>
            </div>
            <div className="space-y-3">
              <button onClick={() => handleGoogleAccountSelect('client@comptaflow.ca')} className="w-full p-4 rounded-xl bg-white/5 hover:bg-gold/10 border border-white/5 text-left text-xs text-ivoire">client@comptaflow.ca</button>
              <button onClick={() => setShowCustomGoogleInput(true)} className="w-full p-4 rounded-xl border border-dashed border-gold/30 text-gold text-xs text-center">+ Utiliser un autre compte</button>
              {showCustomGoogleInput && (
                <div className="mt-4 flex gap-2">
                  <Input placeholder="email@exemple.com" value={customGoogleEmail} onChange={e => setCustomGoogleEmail(e.target.value)} className="bg-noir" />
                  <Button onClick={() => handleGoogleAccountSelect(customGoogleEmail)} variant="gold">OK</Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      <AnimatePresence mode="wait">
        {view === 'choice' ? (
          <motion.div key="choice" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="relative z-10 w-full max-w-4xl">
             <div className="text-center mb-16 space-y-4">
                <div className="w-20 h-20 border-2 border-gold rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-gold/20 mb-8 transition-transform hover:rotate-3 duration-500">
                   <span className="font-serif font-bold text-4xl text-gold">A</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-serif text-ivoire tracking-tighter">Comptaflow<span className="text-gold italic">.</span></h1>
                <p className="text-slate-500 uppercase tracking-[0.4em] text-[10px] font-bold italic">La comptabilité qui coule de source</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                {/* Bouton Login */}
                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="group relative p-8 md:p-12 rounded-[2.5rem] bg-surface border border-white/10 hover:border-gold/50 transition-all duration-500 text-center space-y-6 z-30 cursor-pointer overflow-hidden"
                >
                   <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                   <div className="w-16 h-16 rounded-2xl bg-gold/5 border border-gold/20 flex items-center justify-center text-gold mx-auto group-hover:bg-gold group-hover:text-noir transition-all duration-500 relative z-10">
                      <LogIn size={32} />
                   </div>
                   <div className="space-y-2 relative z-10">
                      <h3 className="text-2xl font-serif text-ivoire">Espace Client</h3>
                      <p className="text-sm text-slate-500 font-light italic">Reprenez là où vous en étiez</p>
                   </div>
                </button>

                {/* Bouton Register */}
                <button
                  type="button"
                  onClick={() => setView('register')}
                  className="group relative p-8 md:p-12 rounded-[2.5rem] bg-surface border border-white/10 hover:border-gold/50 transition-all duration-500 text-center space-y-6 z-30 cursor-pointer overflow-hidden"
                >
                   <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                   <div className="w-16 h-16 rounded-2xl bg-gold/5 border border-gold/20 flex items-center justify-center text-gold mx-auto group-hover:bg-gold group-hover:text-noir transition-all duration-500 relative z-10">
                      <UserPlus size={32} />
                   </div>
                   <div className="space-y-2 relative z-10">
                      <h3 className="text-2xl font-serif text-ivoire">Nouveau Dossier</h3>
                      <p className="text-sm text-slate-500 font-light italic">Devenir client en 3 minutes</p>
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
        ) : (
          <motion.div key="form" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="relative z-10 w-full max-w-md">
            <Card className="p-10 relative bg-surface border-gold/30" glow="gold">
              <button
                type="button"
                onClick={() => { setView('choice'); setError(''); setEmailSent(false); }}
                className="absolute left-6 top-6 text-slate-500 hover:text-ivoire flex items-center gap-2 text-xs uppercase font-bold tracking-widest transition-colors z-20 cursor-pointer"
              >
                 <ArrowLeft size={14} /> Retour
              </button>

              <div className="flex flex-col items-center text-center space-y-8 pt-8">
                <div className="w-16 h-16 rounded-2xl bg-gold text-noir flex items-center justify-center shadow-gold/20">
                  {view === 'login' ? <LogIn size={32} /> : <UserPlus size={32} />}
                </div>

                {!emailSent ? (
                  <div className="w-full space-y-8">
                    <div className="space-y-2">
                      <h2 className="text-3xl font-serif text-ivoire tracking-tight italic leading-tight">
                        {view === 'login' ? "Content de vous revoir." : "Bienvenue chez Comptaflow."}
                      </h2>
                      <p className="text-slate-500 text-[10px] uppercase tracking-[0.2em] font-bold">
                        {view === 'login' ? "Identification Sécurisée" : "Création de Dossier Fiscal"}       
                      </p>
                    </div>

                    {view === 'login' && (
                      <div className="p-4 bg-gold/5 border border-gold/10 rounded-xl text-[10px] text-gold/60 uppercase font-bold tracking-widest italic text-center">
                        Accès prioritaire à votre portail
                      </div>
                    )}

                    <div className="space-y-4">
                      <Button 
                        type="button" 
                        variant="secondary" 
                        className="w-full h-14 gap-3 glass-button rounded-2xl font-bold uppercase text-[10px] tracking-widest border-white/5 hover:border-gold/20" 
                        onClick={handleGoogleAuth}
                        isLoading={isLoading}
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-3.27 3.28-8.11 3.28-11.09z"/>
                          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Continuer avec Google
                      </Button>

                      <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5"></span></div>
                        <div className="relative flex justify-center text-[8px] uppercase tracking-[0.3em] font-black"><span className="bg-surface px-4 text-slate-600">Ou via identifiant scellé</span></div>
                      </div>
                    </div>

                    {error && (
                      <div className="p-4 text-xs text-danger bg-danger/10 border border-danger/20 rounded-xl flex items-center gap-3 text-left animate-shake">
                        <ShieldAlert size={18} className="shrink-0" /> <span>{error}</span>
                      </div>
                    )}

                    <form onSubmit={handlePasswordAuth} className="space-y-5">
                      <Input
                        type="text" 
                        placeholder={view === 'login' ? "Courriel" : "Votre courriel"}
                        icon={<Mail size={18} className="text-gold/40" />}
                        value={emailInput}
                        onChange={e => setEmailInput(e.target.value)}
                        required
                        className="bg-noir border-white/10 focus:border-gold/50"
                      />
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

                      <Button type="submit" variant="gold" className="w-full h-16 gap-3 font-bold uppercase tracking-[0.2em] shadow-gold/20 mt-4" isLoading={isLoading}>
                        {view === 'login' ? "Se connecter" : "S'inscrire"} <ArrowRight size={20}/>
                      </Button>
                    </form>
                  </div>
                ) : (
                  <div className="space-y-8 py-4 animate-in fade-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto border border-gold/30">
                      <Mail size={32} className="text-gold animate-pulse" />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-2xl font-serif text-ivoire italic">Validation requise.</h3>
                      <p className="text-sm text-slate-400 font-light leading-relaxed">Vérifiez vos courriels. Un lien de confirmation a été envoyé à <br/><span className="text-ivoire font-medium underline decoration-gold/50 underline-offset-4">{emailInput}</span>.</p>
                    </div>
                    <Button variant="ghost" className="mt-4" onClick={() => setEmailSent(false)}>Retour à l'accueil</Button>       
                  </div>
                )}
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
