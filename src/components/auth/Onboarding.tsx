import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef, useEffect } from 'react';
import { UploadCloud, CheckCircle, ChevronRight, Building, Lock, ShieldCheck, User, Shield, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { UserData } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { t, LanguageCode } from '../../lib/i18n';
import { useLanguage } from '../../hooks/useLanguage';
import { supabase } from '../../lib/supabase';

interface SubAdminOption {
  id: string;
  full_name: string | null;
  email: string | null;
  metadata?: { bio?: string; specialty?: string; phone?: string } | null;
}

interface OnboardingProps {
  initialEmail: string;
  initialDisplayName?: string;
  onComplete: (data: UserData) => Promise<void> | void;
}

export function Onboarding({ initialEmail, initialDisplayName = '', onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [profileType, setProfileType] = useState<'personal' | 'business' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { lang: globalLang, changeLanguage } = useLanguage();
  const [selectedLang, setSelectedLang] = useState<LanguageCode>(globalLang);

  const [subAdmins, setSubAdmins] = useState<SubAdminOption[]>([]);
  const [selectedSubAdminId, setSelectedSubAdminId] = useState<string | null>(null);
  const [phone, setPhone] = useState('');

  useEffect(() => {
    setSelectedLang(globalLang);
  }, [globalLang]);

  // Load sub_admins once on mount
  useEffect(() => {
    supabase
      .from('profiles')
      .select('id, full_name, email, metadata')
      .eq('role', 'sub_admin')
      .then(({ data }) => {
        if (data) setSubAdmins(data.filter((sa) => !(sa.metadata as any)?.suspended));
      });
  }, []);

  const tr = (key: string) => t(selectedLang, key);

  const [data, setData] = useState<UserData>({
    displayName: initialDisplayName || '',
    companyName: '',
    email: initialEmail || '',
    neq: '',
    nas: '',
    incomeBracket: '100k-500k',
    employeeCount: '1-5',
    province: 'QC',
    language: 'fr',
  });

  // Steps: 0=welcome, 1=coords, 2=supervisor, 3=vault, 4=confirm
  const stepLabels = [
    tr('onboarding.stepCoords'),
    'Superviseur',
    tr('onboarding.stepDocs'),
    tr('onboarding.stepConfirm'),
  ];

  const finishAccount = async () => {
    if (isProcessing) return;
    if (!data.displayName?.trim()) {
      toast.warning(tr('onboarding.nameRequired'));
      return;
    }
    setIsProcessing(true);
    try {
      await onComplete({
        ...data,
        fullName: data.displayName,
        language: selectedLang,
        initialProfileType: profileType || 'personal',
        activeMode: profileType === 'business' ? 'business' : 'personal',
        subAdminId: selectedSubAdminId || undefined,
        // Pass phone so App.tsx can send it with the notification
        ...(phone ? { phone } : {}),
      });
    } catch (err: any) {
      toast.error(err.message || tr('onboarding.accountError'));
    } finally {
      setIsProcessing(false);
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!data.displayName?.trim()) {
        toast.warning(tr('onboarding.nameRequired'));
        return;
      }
      if (profileType === 'business' && (!data.companyName || !data.neq)) {
        toast.warning(tr('onboarding.businessRequired'));
        return;
      }
      if (data.neq && !/^\d{10}$/.test(data.neq)) {
        toast.warning(tr('onboarding.neqInvalid') || 'Le NEQ doit contenir exactement 10 chiffres.');
        return;
      }
    }
    setStep((p) => p + 1);
  };

  return (
    <div className="min-h-screen bg-noir flex flex-col items-center py-16 px-6 relative overflow-hidden text-ivoire selection:bg-gold/30 font-sans">
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-gold/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-4xl z-10 space-y-12">
        <header className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 border-2 border-gold rounded-2xl flex items-center justify-center text-gold shadow-lg shadow-gold/10">
              <span className="font-serif font-bold text-2xl">C</span>
            </div>
            <h1 className="text-2xl font-serif font-medium text-ivoire tracking-tight italic">
              Compta<em className="text-gold not-italic">flow</em>
            </h1>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-gold/20 rounded-full text-xs font-bold text-silver uppercase tracking-[0.2em]">
            <Lock size={14} className="text-gold" /> {tr('secure_storage')}
          </div>
        </header>

        {step > 0 && (
          <div className="flex justify-between items-center relative max-w-xl mx-auto px-4">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[1px] bg-white/10 z-0" />
            <motion.div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-[1px] bg-gold z-0"
              animate={{ width: `${((step - 1) / (stepLabels.length - 1)) * 100}%` }}
            />
            {stepLabels.map((label, i) => (
              <div key={label} className="relative z-10 flex flex-col items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                    step >= i + 1 ? 'bg-gold text-noir shadow-gold/20' : 'bg-surface border border-white/10 text-slate-500'
                  }`}
                >
                  {step > i + 1 ? <CheckCircle size={14} /> : i + 1}
                </div>
                <span className={`text-xs uppercase tracking-widest font-bold ${step >= i + 1 ? 'text-gold' : 'text-slate-600'}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        )}

        <main className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {/* STEP 0 — Language + Profile type */}
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-12 text-center">
                <div className="space-y-4">
                  <h2 className="text-4xl md:text-5xl font-serif text-ivoire tracking-tight italic">
                    {tr('onboarding.welcomeTitle')} <span className="text-gold">Comptaflow.</span>
                  </h2>
                  <p className="text-silver font-light max-w-lg mx-auto text-sm italic">{tr('onboarding.welcomeDesc')}</p>
                </div>

                <div className="max-w-2xl mx-auto space-y-12">
                  <div className="space-y-6">
                    <p className="text-xs uppercase font-bold text-slate-600 tracking-[0.4em]">{tr('onboarding.langLabel')}</p>
                    <div className="flex justify-center gap-4">
                      {[
                        { id: 'fr', label: 'Français' },
                        { id: 'en', label: 'English' },
                      ].map((langItem) => (
                        <button
                          key={langItem.id}
                          type="button"
                          onClick={() => {
                            setSelectedLang(langItem.id as LanguageCode);
                            changeLanguage(langItem.id as LanguageCode);
                          }}
                          className={`px-8 py-3 rounded-full border font-bold text-xs uppercase tracking-widest transition-all focus-ring ${
                            selectedLang === langItem.id
                              ? 'bg-gold text-noir border-gold shadow-gold/20'
                              : 'bg-white/5 border-white/10 text-slate-500 hover:border-gold/30'
                          }`}
                        >
                          {langItem.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <button
                      type="button"
                      onClick={() => { setProfileType('personal'); setStep(1); }}
                      className="p-10 rounded-3xl bg-surface border border-white/10 hover:border-gold/50 transition-all group flex flex-col items-center gap-8 focus-ring"
                    >
                      <div className="w-20 h-20 rounded-full bg-gold/5 border border-gold/20 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-noir transition-all duration-500">
                        <User size={40} />
                      </div>
                      <div className="space-y-2 text-center">
                        <h3 className="text-xl font-serif text-ivoire">{tr('personal')}</h3>
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-widest leading-relaxed">{tr('onboarding.personalDesc')}</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setProfileType('business'); setStep(1); }}
                      className="p-10 rounded-3xl bg-surface border border-white/10 hover:border-gold/50 transition-all group flex flex-col items-center gap-8 focus-ring"
                    >
                      <div className="w-20 h-20 rounded-full bg-gold/5 border border-gold/20 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-noir transition-all duration-500">
                        <Building size={40} />
                      </div>
                      <div className="space-y-2 text-center">
                        <h3 className="text-xl font-serif text-ivoire">{tr('business')}</h3>
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-widest leading-relaxed">{tr('onboarding.businessDesc')}</p>
                      </div>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 1 — Coordinates */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                  <div className="flex gap-3">
                    <Badge variant="gold" className="uppercase tracking-widest">{profileType === 'business' ? 'PRO' : 'PERSO'}</Badge>
                    <Badge variant="default" className="border-white/20 uppercase tracking-widest opacity-50">{selectedLang}</Badge>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-serif text-ivoire tracking-tight italic leading-tight">
                    {tr('onboarding.coordsTitle')} <br /><span className="text-gold">{tr('onboarding.coordsAccent')}</span>
                  </h2>
                  <p className="text-silver font-light text-base leading-relaxed italic">{tr('onboarding.coordsDesc')}</p>
                </div>
                <div className="p-10 rounded-3xl bg-surface border border-gold/20 space-y-6">
                  <Input
                    label={tr('onboarding.fullName')}
                    placeholder={tr('name_placeholder')}
                    value={data.displayName}
                    onChange={(e) => setData({ ...data, displayName: e.target.value })}
                    required
                  />
                  <div>
                    <label htmlFor="onboarding-phone" className="text-xs font-bold text-slate-500 ml-1 mb-2 block uppercase tracking-widest">
                      Téléphone <span className="text-slate-600 normal-case font-normal">(facultatif — pour SMS)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/40">
                        <Phone size={16} />
                      </span>
                      <input
                        id="onboarding-phone"
                        type="tel"
                        placeholder="+1 (514) 000-0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-noir border border-white/10 rounded-xl pl-10 pr-4 py-4 text-ivoire outline-none focus-visible:border-gold/50 focus-visible:ring-2 focus-visible:ring-gold/20 transition-all text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="onboarding-province" className="text-xs font-bold text-slate-500 ml-1 mb-2 block uppercase tracking-widest">{tr('onboarding.province')}</label>
                    <select
                      id="onboarding-province"
                      className="w-full bg-noir border border-white/10 rounded-xl px-4 py-4 text-ivoire outline-none focus-visible:border-gold/50 focus-visible:ring-2 focus-visible:ring-gold/20 transition-all text-sm appearance-none"
                      value={data.province}
                      onChange={(e) => setData({ ...data, province: e.target.value })}
                    >
                      <option value="QC">Québec (TPS + TVQ)</option>
                      <option value="ON">Ontario (TVH 13 %)</option>
                      <option value="BC">Colombie-Britannique (TPS + TVP 7 %)</option>
                      <option value="AB">Alberta (TPS 5 %)</option>
                      <option value="MB">Manitoba (TPS + TVP 7 %)</option>
                      <option value="NB">Nouveau-Brunswick (TVH 15 %)</option>
                      <option value="NL">Terre-Neuve-et-Labrador (TVH 15 %)</option>
                      <option value="NS">Nouvelle-Écosse (TVH 15 %)</option>
                      <option value="PE">Île-du-Prince-Édouard (TVH 15 %)</option>
                      <option value="SK">Saskatchewan (TPS + TVP 6 %)</option>
                      <option value="YT">Yukon (TPS 5 %)</option>
                      <option value="NT">Territoires du Nord-Ouest (TPS 5 %)</option>
                      <option value="NU">Nunavut (TPS 5 %)</option>
                    </select>
                  </div>
                  {profileType === 'business' && (
                    <>
                      <Input label={tr('onboarding.companyName')} placeholder={tr('company_placeholder')} value={data.companyName} onChange={(e) => setData({ ...data, companyName: e.target.value })} required />
                      <Input label={tr('onboarding.neq')} placeholder="116XXXXXXX" maxLength={10} value={data.neq} onChange={(e) => setData({ ...data, neq: e.target.value })} required />
                    </>
                  )}
                  <Input label={tr('onboarding.nas')} placeholder="000 000 000" value={data.nas} onChange={(e) => setData({ ...data, nas: e.target.value })} />
                </div>
              </motion.div>
            )}

            {/* STEP 2 — Supervisor selection */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-2xl mx-auto space-y-8">
                <div className="text-center space-y-3">
                  <span className="text-gold text-xs font-bold tracking-[0.4em] uppercase flex items-center justify-center gap-2">
                    <Shield size={14} /> Équipe ComptaFlow
                  </span>
                  <h2 className="text-4xl md:text-5xl font-serif text-ivoire tracking-tight italic">
                    Choisissez votre <span className="text-gold">superviseur</span>
                  </h2>
                  <p className="text-silver text-sm font-light italic">
                    Votre comptable attitré gérera votre dossier et sera notifié immédiatement de votre inscription.
                  </p>
                </div>

                {subAdmins.length === 0 ? (
                  <div className="p-10 rounded-3xl bg-surface border border-white/10 text-center space-y-4">
                    <p className="text-slate-500 italic text-sm">Aucun comptable disponible pour le moment.</p>
                    <p className="text-xs text-slate-600">Un superviseur vous sera assigné manuellement après inscription.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {subAdmins.map((sa) => {
                      const selected = selectedSubAdminId === sa.id;
                      return (
                        <button
                          key={sa.id}
                          type="button"
                          onClick={() => setSelectedSubAdminId(selected ? null : sa.id)}
                          className={`w-full p-6 rounded-2xl border text-left transition-all duration-300 focus-ring ${
                            selected
                              ? 'border-gold bg-gold/10 shadow-lg shadow-gold/10'
                              : 'border-white/10 bg-surface hover:border-gold/40'
                          }`}
                        >
                          <div className="flex items-center gap-5">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all ${selected ? 'bg-gold text-noir' : 'bg-gold/10 border border-gold/20 text-gold'}`}>
                              <Shield size={24} />
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-3">
                                <h3 className="font-serif font-bold text-lg text-ivoire">{sa.full_name || 'Comptable'}</h3>
                                {selected && (
                                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gold text-noir uppercase tracking-wider">
                                    Sélectionné ✓
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400 font-mono">{sa.email}</p>
                              {(sa.metadata as any)?.specialty && (
                                <p className="text-xs text-slate-500 italic">{(sa.metadata as any).specialty}</p>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                    <p className="text-[11px] text-slate-600 text-center pt-2 italic">
                      Ce choix peut être modifié ultérieurement par votre administrateur.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 3 — Vault (documents) */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-2xl mx-auto text-center space-y-12">
                <div className="space-y-4">
                  <span className="text-gold text-xs font-bold tracking-[0.4em] uppercase">{tr('onboarding.vaultTag')}</span>
                  <h2 className="text-4xl md:text-5xl font-serif text-ivoire tracking-tight italic">
                    {tr('onboarding.vaultTitle')} <span className="text-gold">{tr('onboarding.vaultAccent')}</span> {tr('onboarding.vaultOptional')}
                  </h2>
                  <p className="text-silver text-sm font-light italic">{tr('onboarding.vaultDesc')}</p>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls" />
                <div
                  role="button"
                  tabIndex={0}
                  aria-label={tr('onboarding.vaultDrop')}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
                  onClick={() => fileInputRef.current?.click()}
                  className="p-20 rounded-3xl bg-surface border-2 border-dashed border-gold/20 hover:border-gold/60 transition-all cursor-pointer group relative overflow-hidden focus-ring"
                >
                  <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <UploadCloud size={64} className="mx-auto text-gold/40 group-hover:text-gold transition-all duration-500 mb-8 group-hover:scale-110" />
                  <p className="text-ivoire font-bold uppercase tracking-widest text-sm mb-2">{tr('onboarding.vaultDrop')}</p>
                  <p className="text-silver text-xs font-light">{tr('onboarding.vaultBrowse')}</p>
                  <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 text-success text-xs font-bold uppercase tracking-widest">
                    <ShieldCheck size={14} /> {tr('onboarding.vaultEncrypted')}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4 — Confirm */}
            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl mx-auto text-center space-y-8">
                <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto border border-gold/20 text-gold">
                  <CheckCircle size={40} />
                </div>
                <h2 className="text-4xl font-serif text-ivoire italic">
                  {tr('onboarding.readyTitle')} <span className="text-gold">{tr('onboarding.readyAccent')}</span>
                </h2>
                <p className="text-silver font-light text-sm italic leading-relaxed">{tr('onboarding.readyDesc')}</p>

                {selectedSubAdminId && (
                  <div className="p-4 rounded-xl border border-gold/20 bg-gold/5 text-sm text-left space-y-1">
                    <p className="text-[10px] uppercase tracking-widest text-gold/60 font-bold">Superviseur sélectionné</p>
                    <p className="font-serif font-bold text-ivoire">
                      {subAdmins.find((sa) => sa.id === selectedSubAdminId)?.full_name || 'Comptable'}
                    </p>
                    <p className="text-xs text-slate-400 font-mono">
                      {subAdmins.find((sa) => sa.id === selectedSubAdminId)?.email}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">Il sera notifié par courriel et SMS dès la création de votre compte.</p>
                  </div>
                )}

                <Button variant="gold" size="lg" className="w-full h-14" onClick={finishAccount} isLoading={isProcessing}>
                  {tr('onboarding.accessPortal')}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="pt-12 flex justify-between items-center border-t border-white/5">
          <Button
            variant="ghost"
            onClick={() => { if (step === 1) setStep(0); else setStep((s) => s - 1); }}
            className={step === 0 ? 'invisible opacity-0' : 'h-14 px-10 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-ivoire transition-all'}
          >
            ← {tr('back')}
          </Button>
          {step > 0 && step < 4 && (
            <Button
              variant="gold"
              className="gap-2 px-12 h-14 shadow-gold/10 font-bold uppercase tracking-widest text-xs"
              onClick={step === 3 ? () => setStep(4) : step === 2 ? () => setStep(3) : nextStep}
            >
              {step === 3 ? tr('onboarding.skip') : step === 2 && !selectedSubAdminId ? 'Passer' : tr('continue')} <ChevronRight size={18} />
            </Button>
          )}
        </footer>
      </div>
    </div>
  );
}
