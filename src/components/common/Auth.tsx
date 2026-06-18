import { motion, AnimatePresence } from 'motion/react';
import { Mail, Key, UserPlus, LogIn, ShieldAlert, ArrowLeft, ArrowRight, ShieldCheck, RefreshCw, User } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { CONFIG } from '../../lib/config';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { toast } from 'sonner';

interface AuthProps {
  onAuthentication: (email: string) => void;
  mockLogin?: (email: string, role: 'super_admin' | 'sub_admin' | 'client') => void;
}

type AuthView = 'choice' | 'login' | 'register';

export function Auth({ onAuthentication, mockLogin }: AuthProps) {
  const [view, setView] = useState<AuthView>('choice');
  const [emailInput, setEmailInput] = useState('');
  const [password, setPassword] = useState('');
  const [fullNameInput, setFullNameInput] = useState('');
  const [roleInput, setRoleInput] = useState<'sub_admin' | 'client'>('client');
  const [subAdminIdInput, setSubAdminIdInput] = useState('');
  const [subAdminsList, setSubAdminsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);
  const [resending, setResending] = useState(false);

  // Charger la liste des comptables partenaires (sub_admins) pour les nouveaux clients
  useEffect(() => {
    async function loadSubAdmins() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .eq('role', 'sub_admin');
        if (data) {
          setSubAdminsList(data);
          if (data.length > 0) {
            setSubAdminIdInput(data[0].id);
          }
        }
      } catch (err) {
        console.error("Impossible de charger les sub-admins :", err);
      }
    }
    if (view === 'register') {
      loadSubAdmins();
    }
  }, [view]);

  // Mode de détection démo/local
  const checkIsMock = (email: string) => {
    return email.toLowerCase().includes('mock') || !window.navigator.onLine;
  };

  // Resend confirmation email
  const handleResendConfirmation = async () => {
    setResending(true);
    try {
      const cleanEmail = emailInput.toLowerCase().trim();
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: cleanEmail
      });
      if (error) throw error;
      toast.success("Le courriel de confirmation a été renvoyé !");
      setEmailNotConfirmed(false);
    } catch (err: any) {
      toast.error(err.message || "Erreur de renvoi.");
    } finally {
      setResending(false);
    }
  };

  // Soumission du formulaire (Connexion / Inscription)
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
      }, 1200);
      return;
    }

    try {
      if (view === 'register') {
        if (!fullNameInput) {
          throw new Error("Veuillez saisir votre nom complet.");
        }
        if (roleInput === 'client' && !subAdminIdInput) {
          throw new Error("Veuillez sélectionner votre comptable partenaire.");
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            emailRedirectTo: window.location.origin + '/dashboard',
            data: {
              full_name: fullNameInput,
              role: roleInput,
              sub_admin_id: roleInput === 'client' ? subAdminIdInput : null
            }
          }
        });

        if (signUpError) throw signUpError;
        
        if (data.user) {
          toast.success("Compte initié avec succès ! Confirmez votre courriel pour activer l'accès.");
          setView('login');
        }
      } else {
        // Connexion
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password
        });

        if (signInError) {
          if (signInError.message?.includes("Email not confirmed") || signInError.status === 400 && signInError.message?.includes("confirm")) {
            setEmailNotConfirmed(true);
            throw new Error("Votre adresse courriel n'a pas encore été confirmée. Veuillez vérifier votre boîte de réception.");
          }
          throw signInError;
        }

        if (data.user) {
          onAuthentication(data.user.email!);
          toast.success("Session authentifiée.");
        }
      }
    } catch (err: any) {
      setError(err.message || "Échec de l'authentification.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-midnight text-silver flex items-center justify-center py-20 px-6 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-gold/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-sapphire/5 rounded-full blur-[150px] pointer-events-none" />

      <AnimatePresence mode="wait">
        {view === 'choice' ? (
          <motion.div
            key="choice"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="w-full max-w-2xl text-center space-y-12 relative z-10"
          >
             <div className="space-y-4">
                <span className="text-xs uppercase tracking-[0.4em] font-black text-gold">Québec • Aide Comptable & Tenue de Livres</span>
                <h1 className="text-6xl md:text-7xl font-serif font-bold text-ivoire tracking-tight italic leading-tight">
                  Portail <span className="animated-gradient-text">ComptaFlow.</span>
                </h1>
                <p className="text-slate-400 font-light text-base max-w-lg mx-auto leading-relaxed">
                  Système de gestion financière et fiscale hautement sécurisé pour entrepreneurs canadiens.
                </p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-xl mx-auto pt-6">
                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="group relative p-8 md:p-12 rounded-[2.5rem] bg-surface border border-white/5 hover:border-gold/30 transition-all duration-500 text-center space-y-6 z-30 cursor-pointer overflow-hidden shadow-xl"
                >
                   <div className="absolute inset-0 bg-gold/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
                   <div className="w-16 h-16 rounded-2xl bg-gold/5 border border-gold/10 flex items-center justify-center text-gold mx-auto group-hover:bg-gold group-hover:text-noir transition-all duration-500 relative z-10">
                      <LogIn size={32} />
                   </div>
                   <div className="space-y-2 relative z-10">
                      <h3 className="text-2xl font-serif text-ivoire">Espace Privé</h3>
                      <p className="text-sm text-slate-500 font-light italic">S'identifier et accéder à ses portails</p>
                   </div>
                </button>

                <button
                  type="button"
                  onClick={() => setView('register')}
                  className="group relative p-8 md:p-12 rounded-[2.5rem] bg-surface border border-white/5 hover:border-gold/30 transition-all duration-500 text-center space-y-6 z-30 cursor-pointer overflow-hidden shadow-xl"
                >
                   <div className="absolute inset-0 bg-gold/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
                   <div className="w-16 h-16 rounded-2xl bg-gold/5 border border-gold/10 flex items-center justify-center text-gold mx-auto group-hover:bg-gold group-hover:text-noir transition-all duration-500 relative z-10">
                      <UserPlus size={32} />
                   </div>
                   <div className="space-y-2 relative z-10">
                      <h3 className="text-2xl font-serif text-ivoire">Créer un Dossier</h3>
                      <p className="text-sm text-slate-500 font-light italic">Nouveau comptable ou client final</p>
                   </div>
                </button>
             </div>
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
                 <ArrowLeft size={14} /> Retour
              </button>

              <div className="flex flex-col items-center text-center space-y-6 pt-6">
                <div className="w-14 h-14 rounded-2xl bg-gold text-noir flex items-center justify-center shadow-lg shadow-gold/10">
                  {view === 'login' ? <LogIn size={26} /> : <UserPlus size={26} />}
                </div>

                <div className="w-full space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-serif text-ivoire tracking-tight italic leading-tight">
                      {view === 'login' ? "S'identifier." : "Nouveau Dossier."}
                    </h2>
                    <p className="text-slate-500 text-[9px] uppercase tracking-[0.2em] font-black">
                      {view === 'login' ? "Rapprocher vos flux financiers" : "Formulaire d'enregistrement fiscal"}
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
                          <RefreshCw size={12} className="mr-1" /> Renvoyer le courriel de validation
                        </Button>
                      )}
                    </div>
                  )}

                  <form onSubmit={handleAuthSubmit} className="space-y-5 text-left">
                    {view === 'register' && (
                      <>
                        <Input
                          type="text"
                          placeholder="Nom complet"
                          icon={<User size={18} className="text-gold/40" />}
                          value={fullNameInput}
                          onChange={e => setFullNameInput(e.target.value)}
                          required
                          className="bg-noir border-white/5 focus:border-gold/50"
                        />

                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 block">Votre statut d'accès</label>
                          <select
                            value={roleInput}
                            onChange={e => setRoleInput(e.target.value as 'sub_admin' | 'client')}
                            className="w-full h-14 bg-noir border border-white/10 rounded-xl px-5 text-sm font-semibold text-ivoire outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all cursor-pointer"
                          >
                            <option value="client">Client final (Entreprise/Individu)</option>
                            <option value="sub_admin">Préparateur Partenaire (Tenue de livres)</option>
                          </select>
                        </div>

                        {roleInput === 'client' && (
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 block">Comptable Partenaire</label>
                            {subAdminsList.length > 0 ? (
                              <select
                                value={subAdminIdInput}
                                onChange={e => setSubAdminIdInput(e.target.value)}
                                className="w-full h-14 bg-noir border border-white/10 rounded-xl px-5 text-sm font-semibold text-ivoire outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all cursor-pointer"
                              >
                                {subAdminsList.map(sa => (
                                  <option key={sa.id} value={sa.id}>
                                    {sa.full_name} ({sa.email})
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <div className="text-xs text-amber-500 italic p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl leading-relaxed">
                                ⚠️ Aucun comptable partenaire n'est enregistré. Créez d'abord un compte comptable (Sub Admin) ou connectez-vous comme Super Admin pour en créer.
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}

                    <Input
                      type="email"
                      placeholder="Adresse courriel"
                      icon={<Mail size={18} className="text-gold/40" />}
                      value={emailInput}
                      onChange={e => setEmailInput(e.target.value)}
                      required
                      className="bg-noir border-white/5 focus:border-gold/50"
                    />

                    <Input
                      type="password"
                      placeholder="Mot de passe"
                      icon={<Key size={18} className="text-gold/40" />}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="bg-noir border-white/5 focus:border-gold/50"
                    />

                    <Button
                      type="submit"
                      variant="gold"
                      className="w-full h-16 gap-3 font-bold uppercase tracking-[0.2em] shadow-gold/20 mt-4"
                      isLoading={isLoading}
                    >
                      {view === 'login' ? "S'identifier" : "Créer le compte"} <ArrowRight size={20}/>
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
                      {view === 'login' ? "👉 Pas encore inscrit ? Créer un dossier" : "👉 Déjà inscrit ? S'identifier"}
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-8 text-center w-full z-10 px-6">
         <p className="text-[9px] text-slate-600 uppercase tracking-[0.4em] font-bold">Portail ComptaFlow • Québec • MMXXVI</p>
      </div>
    </div>
  );
}