import { motion, AnimatePresence } from 'motion/react';
import { Mail, Key, UserPlus, LogIn, ShieldAlert, ArrowLeft, Building2, ArrowRight } from 'lucide-react';
import React, { useState } from 'react';

// Imports recalibrés pour la nouvelle architecture
import { supabase } from '../../lib/supabase';
import { CONFIG } from '../../lib/config';
import { internalApi } from '../../api/api'; // Nouveau chemin de l'API centralisée
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { VaultEntrance } from './VaultEntrance';

interface AuthProps {
  onAuthentication: (email: string) => void;
}

type AuthView = 'choice' | 'login' | 'register';

/**
 * Composant Auth - Architecture Standardisee
 * Gere le choix du mode (Login/Register) et l'authentification (Supabase ou Interne).
 */
export function Auth({ onAuthentication }: AuthProps) {
  const [view, setView] = useState<AuthView>('choice');
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(() => sessionStorage.getItem('cf_vault_unlocked') === 'true');
  const [emailInput, setEmailInput] = useState('');
  const [password, setPassword] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const finalEmail = emailInput.toLowerCase() === 'admin' ? CONFIG.APP.ADMIN_EMAILS[0] : emailInput;
    const redirectUrl = window.location.origin;

    try {
      if (view === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email: finalEmail,
          password,
          options: { emailRedirectTo: redirectUrl }
        });

        if (error || !data.user) {
          // Fallback : Enregistrement interne via API centralisee
          const internalRes = await internalApi.register({ email: finalEmail, password });
          if (internalRes.error) throw new Error(internalRes.error);
          localStorage.setItem('cf_user', JSON.stringify(internalRes.user));
          window.location.reload();
          return;
        }
        setEmailSent(true);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email: finalEmail, password });        

        if (error || !data.user) {
          // Fallback : Connexion interne via API centralisee
          const internalRes = await internalApi.login({ email: finalEmail, password });
          if (internalRes.error) throw new Error(internalRes.error);
          localStorage.setItem('cf_user', JSON.stringify(internalRes.user));
          window.location.reload();
          return;
        }

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
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-y-auto bg-midnight px-6 py-12 w-full">   
      {/* Background Decor - pointer-events-none pour ne pas bloquer les boutons */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-sapphire/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gold/5 rounded-full blur-[140px]" />
      </div>

      <div className="absolute top-8 right-8 z-20">
         <button className="px-4 py-2 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-gold hover:border-gold/30 transition-all">
            FR / EN / AR
         </button>
      </div>

      <AnimatePresence mode="wait">
        {view === 'choice' ? (
          <motion.div 
            key="choice" 
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 1.02 }} 
            className="relative z-10 w-full"
          >
            <VaultEntrance 
              onLoginClick={() => setView('login')}
              onRegisterClick={() => setView('register')}
              isUnlocked={isVaultUnlocked}
              onUnlock={() => {
                setIsVaultUnlocked(true);
                sessionStorage.setItem('cf_vault_unlocked', 'true');
              }}
              onLock={() => {
                setIsVaultUnlocked(false);
                sessionStorage.removeItem('cf_vault_unlocked');
              }}
            />
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="relative z-10 w-full max-w-md">
            <Card className="p-10 relative" glow={view === 'login' ? 'gold' : 'sapphire'}>
              <button
                type="button"
                onClick={() => { setView('choice'); setError(''); setEmailSent(false); }}
                className="absolute left-6 top-6 text-slate-500 hover:text-silver flex items-center gap-2 text-xs uppercase font-bold tracking-widest transition-colors z-20 cursor-pointer"
              >
                 <ArrowLeft size={14} /> Retour
              </button>

              <div className="flex flex-col items-center text-center space-y-8 pt-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${view === 'login' ? 'bg-gold text-midnight' : 'bg-sapphire text-white'}`}>
                  {view === 'login' ? <LogIn size={28} /> : <UserPlus size={28} />}
                </div>

                {!emailSent ? (
                  <div className="w-full space-y-8">
                    <div className="space-y-2">
                      <h2 className="text-3xl font-serif text-silver tracking-tight italic">
                        {view === 'login' ? "Content de vous revoir." : "Bienvenue à bord."}
                      </h2>
                      <p className="text-slate-500 text-[10px] uppercase tracking-[0.2em] font-bold">
                        {view === 'login' ? "Identification Sécurisée" : "Création de Dossier Fiscal"}       
                      </p>
                    </div>

                    {view === 'login' && (
                      <div className="p-3 bg-gold/5 border border-gold/10 rounded-xl text-[10px] text-gold/60 uppercase font-bold tracking-widest">
                        Démo : Utilisez 'admin' / 'admin'
                      </div>
                    )}

                    {error && (
                      <div className="p-4 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-left">
                        <ShieldAlert size={18} className="shrink-0" /> <span>{error}</span>
                      </div>
                    )}

                    <form onSubmit={handlePasswordAuth} className="space-y-4">
                      <Input
                        type="text" 
                        placeholder={view === 'login' ? "Courriel ou 'Admin'" : "Votre courriel"}
                        icon={<Mail size={18}/>}
                        value={emailInput}
                        onChange={e => setEmailInput(e.target.value)}
                        required
                      />
                      <Input
                        type="password"
                        placeholder="Mot de passe"
                        icon={<Key size={18}/>}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        minLength={6}
                      />

                      <Button type="submit" variant={view === 'login' ? 'gold' : 'primary'} className="w-full h-14 gap-2 font-bold uppercase tracking-widest cursor-pointer" isLoading={isLoading}>
                        {view === 'login' ? "Se connecter" : "S'inscrire"} <ArrowRight size={18}/>
                      </Button>
                    </form>
                  </div>
                ) : (
                  <div className="space-y-6 py-4 animate-in fade-in zoom-in-95 duration-500">
                    <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto border border-gold/30">
                      <Mail size={24} className="text-gold animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-serif text-silver italic">Validation requise.</h3>
                      <p className="text-sm text-slate-400 font-light leading-relaxed">Vérifiez vos courriels. Un lien de confirmation a été envoyé à <br/><span className="text-silver font-medium">{emailInput}</span>.</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setEmailSent(false)}>Retour</Button>       
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {!isVaultUnlocked && (
        <div className="absolute bottom-8 text-center w-full z-10 pointer-events-none">
           <p className="text-[9px] text-slate-600 uppercase tracking-[0.4em] font-bold">Technologie de pointe • Conformité Loi 25 • Cabinet A&G</p>
        </div>
      )}
    </div>
  );
}
