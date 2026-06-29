import { motion, AnimatePresence } from 'motion/react';
import { Mail, Key, UserPlus, LogIn, ShieldAlert, ArrowLeft, ArrowRight, RefreshCw, User } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { toast } from 'sonner';
import { useLanguage } from '../../hooks/useLanguage';
import { getAuthRedirectUrl } from '../../lib/authOAuth';
import { mapSupabaseAuthError } from '../../lib/authErrors';
import { buildClientSignupMetadata } from '../../lib/clientSignup';
import { VaultEntrance } from './VaultEntrance';

interface AuthProps {
  onAuthentication: (email: string) => void;
  mockLogin?: (email: string, role: 'super_admin' | 'sub_admin' | 'client') => void;
}

type AuthView = 'choice' | 'login' | 'register';

export function Auth({ onAuthentication, mockLogin }: AuthProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, lang } = useLanguage();
  const nextPath = searchParams.get('next') || '/portal';
  const [view, setView] = useState<AuthView>(() =>
    searchParams.get('register') === '1' ? 'register' : 'choice'
  );
  
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(() => sessionStorage.getItem('cf_vault_unlocked') === 'true');

  useEffect(() => {
    if (searchParams.get('register') === '1') {
      setView('register');
    }
  }, [searchParams]);
  const [emailInput, setEmailInput] = useState('');
  const [password, setPassword] = useState('');
  const [fullNameInput, setFullNameInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);
  const [resending, setResending] = useState(false);

  const checkIsMock = (email: string) => {
    return email.toLowerCase().includes('mock') || !window.navigator.onLine;
  };

  const handleResendConfirmation = async () => {
    setResending(true);
    try {
      const cleanEmail = emailInput.toLowerCase().trim();
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: cleanEmail
      });
      if (error) {
        const mapped = mapSupabaseAuthError(error, lang);
        throw new Error(mapped.message);
      }
      toast.success(
        lang === 'en'
          ? 'Confirmation email sent!'
          : 'Le courriel de confirmation a été renvoyé !'
      );
      setEmailNotConfirmed(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur de renvoi.';
      toast.error(message);
    } finally {
      setResending(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setEmailNotConfirmed(false);

    const cleanEmail = emailInput.toLowerCase().trim();
    const isMock = checkIsMock(cleanEmail);

    if (isMock) {
      setTimeout(() => {
        setIsLoading(false);
        const finalRole = cleanEmail.includes('super') ? 'super_admin' : cleanEmail.includes('sub') ? 'sub_admin' : 'client';
        if (mockLogin) {
          mockLogin(cleanEmail, finalRole);
        }
        onAuthentication(cleanEmail);
        toast.success("Connexion de démonstration réussie.");
        navigate(nextPath);
      }, 1200);
      return;
    }

    try {
      if (view === 'register') {
        if (!fullNameInput.trim()) {
          throw new Error(lang === 'en' ? 'Please enter your full name.' : 'Veuillez saisir votre nom complet.');
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            emailRedirectTo: getAuthRedirectUrl(nextPath),
            data: buildClientSignupMetadata(fullNameInput),
          },
        });

        if (signUpError) {
          const mapped = mapSupabaseAuthError(signUpError, lang);
          if (mapped.emailNotConfirmed) setEmailNotConfirmed(true);
          throw new Error(mapped.message);
        }

        if (data.session) {
          onAuthentication(cleanEmail);
          toast.success(
            lang === 'en' ? 'Account created! Welcome.' : 'Compte créé ! Bienvenue.'
          );
          navigate(nextPath.startsWith('/') ? nextPath : `/${nextPath}`);
          return;
        }

        if (data.user) {
          toast.success(
            lang === 'en'
              ? 'Account created! Confirm your email to activate access.'
              : "Compte initié avec succès ! Confirmez votre courriel pour activer l'accès."
          );
          setView('login');
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password
        });

        if (signInError) {
          const mapped = mapSupabaseAuthError(signInError, lang);
          if (mapped.emailNotConfirmed) setEmailNotConfirmed(true);
          throw new Error(mapped.message);
        }

        if (data.user) {
          onAuthentication(data.user.email!);
          toast.success(lang === 'en' ? 'Signed in successfully.' : 'Session authentifiée.');
          navigate(nextPath.startsWith('/') ? nextPath : `/${nextPath}`);
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message) {
        setError(err.message);
      } else {
        const mapped = mapSupabaseAuthError(
          err && typeof err === 'object' && 'message' in err
            ? (err as { message?: string; status?: number })
            : undefined,
          lang
        );
        setError(mapped.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-noir text-ivoire flex flex-col items-center justify-center py-20 px-6 overflow-y-auto w-full">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-gold/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-sapphire/5 rounded-full blur-[150px] pointer-events-none" />

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
          <motion.div
            key="form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="relative z-10 w-full max-w-md"
          >
            <Card className="p-10 relative bg-surface border-gold/20 shadow-2xl" glow="gold">
              <button
                type="button"
                onClick={() => { setView('choice'); setError(''); setEmailNotConfirmed(false); }}
                className="absolute left-6 top-6 text-slate-500 hover:text-ivoire flex items-center gap-2 text-xs uppercase font-bold tracking-widest transition-colors z-20 cursor-pointer"
              >
                 <ArrowLeft size={14} /> {t('back')}
              </button>

              <div className="flex flex-col items-center text-center space-y-6 pt-6">
                <div className="w-14 h-14 rounded-2xl bg-gold text-noir flex items-center justify-center shadow-lg shadow-gold/10">
                  {view === 'login' ? <LogIn size={26} /> : <UserPlus size={26} />}
                </div>

                <div className="w-full space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-serif text-ivoire tracking-tight italic leading-tight">
                      {view === 'login' ? t('auth.loginTitle') : t('auth.registerTitle')}
                    </h2>
                    <p className="text-slate-500 text-xs uppercase tracking-[0.2em] font-black">
                      {view === 'login' ? t('auth.loginSubtitle') : t('auth.registerSubtitle')}
                    </p>
                  </div>

                  {error && (
                    <div className="p-4 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl flex flex-col gap-3 text-left">
                      <div className="flex items-center gap-2">
                        <ShieldAlert size={18} className="shrink-0 text-red-500" />
                        <span>{error}</span>
                      </div>
                      {emailNotConfirmed && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={handleResendConfirmation}
                          isLoading={resending}
                          className="w-full h-10 text-[10px] mt-2 border-red-500/30 text-red-400 font-bold uppercase tracking-widest"
                        >
                          <RefreshCw size={12} className="mr-1" /> {t('auth.resendEmail')}
                        </Button>
                      )}
                    </div>
                  )}

                  <form onSubmit={handleAuthSubmit} className="space-y-5 text-left">
                    {view === 'register' && (
                      <>
                        <Input
                          type="text"
                          label={t('auth.fullName')}
                          placeholder={t('name_placeholder')}
                          icon={<User size={18} className="text-gold/40" />}
                          value={fullNameInput}
                          onChange={e => setFullNameInput(e.target.value)}
                          required
                          className="bg-noir border-white/5 focus:border-gold/50"
                        />
                        <p className="text-xs text-slate-500 leading-relaxed border-l-2 border-gold/30 pl-3">
                          {t('auth.registerClientNote')}
                        </p>
                      </>
                    )}

                    <Input
                      type="email"
                      label={t('auth.email')}
                      placeholder="courriel@exemple.com"
                      icon={<Mail size={18} className="text-gold/40" />}
                      value={emailInput}
                      onChange={e => setEmailInput(e.target.value)}
                      required
                      autoComplete="email"
                      className="bg-noir border-white/5 focus:border-gold/50"
                    />

                    <Input
                      type="password"
                      label={t('auth.password')}
                      placeholder="••••••••"
                      icon={<Key size={18} className="text-gold/40" />}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      minLength={6}
                      autoComplete={view === 'login' ? 'current-password' : 'new-password'}
                      className="bg-noir border-white/5 focus:border-gold/50"
                    />

                    <Button
                      type="submit"
                      variant="gold"
                      className="w-full h-16 gap-3 font-bold uppercase tracking-[0.2em] shadow-gold/20 mt-4 cursor-pointer"
                      isLoading={isLoading}
                    >
                      {view === 'login' ? t('auth.submitLogin') : t('auth.submitRegister')} <ArrowRight size={20}/>
                    </Button>
                  </form>

                  <div className="pt-4 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setView(view === 'login' ? 'register' : 'login');
                        setError('');
                        setEmailNotConfirmed(false);
                      }}
                      className="text-[10px] text-slate-500 hover:text-gold uppercase tracking-widest font-black transition-colors cursor-pointer"
                    >
                      {view === 'login' ? t('auth.switchToRegister') : t('auth.switchToLogin')}
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {!isVaultUnlocked && (
        <div className="absolute bottom-8 text-center w-full z-10 px-6 pointer-events-none">
           <p className="text-xs text-slate-600 uppercase tracking-[0.4em] font-bold">{t('auth.footer')}</p>
        </div>
      )}
    </div>
  );
}
