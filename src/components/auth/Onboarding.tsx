import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, ChevronRight, Building, Lock, ShieldCheck, User } from 'lucide-react';
import { toast } from 'sonner';
import { UserData } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { t, LanguageCode } from '../../lib/i18n';
import { useLanguage } from '../../hooks/useLanguage';

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

  const tr = (key: string) => t(selectedLang, key);

  const [data, setData] = useState<UserData & { selectedExpertEmail?: string }>({
    displayName: initialDisplayName || '',
    companyName: '',
    email: initialEmail || '',
    neq: '',
    nas: '',
    incomeBracket: '100k-500k',
    employeeCount: '1-5',
    province: 'QC',
    language: 'fr',
    selectedExpertEmail: 's.lahaie07@gmail.com', // Samuel par défaut
  });

  const stepLabels = [
    tr('onboarding.stepCoords'),
    selectedLang === 'en' ? 'Expert' : 'Expert',
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

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                <div className="text-center space-y-4 max-w-2xl mx-auto">
                  <span className="text-gold text-xs font-bold tracking-[0.4em] uppercase">
                    {selectedLang === 'en' ? 'CO-FOUNDERS & CPAS' : 'CO-FONDATEURS & CPAS'}
                  </span>
                  <h2 className="text-4xl md:text-5xl font-serif text-ivoire tracking-tight italic">
                    {selectedLang === 'en' ? 'Choose your reference' : 'Choisissez votre expert de'} <span className="text-gold">{selectedLang === 'en' ? 'expert' : 'référence'}</span>
                  </h2>
                  <p className="text-silver font-light text-sm italic">
                    {selectedLang === 'en' ? 'Every client space is routed to a dedicated accountant for total isolation and data safety.' : 'Chaque dossier client est dirigé vers un comptable dédié pour une isolation complète de vos données.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto pt-6">
                  {[
                    {
                      id: 'samuel',
                      email: 's.lahaie07@gmail.com',
                      name: 'Samuel Lahaie',
                      role: 'Fondateur / Senior CPA',
                      roleEn: 'Founder / Senior CPA',
                      desc: 'Samuel est le visionnaire derrière Compta-Flow. Avec plus d\'une décennie d\'expérience en restructuration d\'entreprises et stratégies fiscales complexes, il guide les entreprises vers l\'efficacité financière.',
                      descEn: 'Samuel is the visionary behind Compta-Flow. With over a decade of experience in corporate restructuring and high-net-worth tax strategy, he guides businesses toward financial efficiency.'
                    },
                    {
                      id: 'eya',
                      email: 'eya-cpa@outlook.com',
                      name: 'Eya',
                      role: 'Fiscaliste / CPA Indépendante',
                      roleEn: 'Tax Specialist / Independent CPA',
                      desc: 'Eya est une CPA indépendante spécialisée dans les normes fiscales internationales et la conformité multi-juridictionnelle. Elle est l\'experte privilégiée pour les opérations transfrontalières.',
                      descEn: 'Eya is an independent CPA specializing in international tax norms and dual-jurisdiction compliance. She is the expert of choice for cross-border operations and multilingue setups.'
                    },
                    {
                      id: 'sylvie',
                      email: 'viviee28@hotmail.com',
                      name: 'Sylvie Charette-Clément',
                      role: 'Partenaire CPA / Tenue de livres',
                      roleEn: 'CPA Partner / Bookkeeping',
                      desc: 'Sylvie apporte une rigueur absolue à la tenue de livres et aux systèmes de paie. Spécialisée dans les entreprises locales, elle assure une comptabilité quotidienne impeccable.',
                      descEn: 'Sylvie brings rigorous attention to detail to bookkeeping and payroll systems. She specializes in local businesses, ensuring flawless day-to-day accounts.'
                    },
                    {
                      id: 'stephanie',
                      email: 'queen.eth1@outlook.com',
                      name: 'Stéphanie Laplante',
                      role: 'Partenaire CPA / Fiscalité PME',
                      roleEn: 'CPA Partner / SME Tax Strategy',
                      desc: 'Stéphanie se spécialise dans l\'optimisation fiscale et l\'accompagnement des startups québécoises. Elle aide à structurer la croissance des PME en maximisant les crédits d\'impôt.',
                      descEn: 'Stephanie specializes in tax optimization and support for Quebec startups. She helps structure SME growth by maximizing tax credits.'
                    }
                  ].map((expert) => {
                    const isSelected = data.selectedExpertEmail === expert.email;
                    return (
                      <button
                        key={expert.id}
                        type="button"
                        onClick={() => setData({ ...data, selectedExpertEmail: expert.email })}
                        className={`p-6 rounded-3xl bg-surface border transition-all text-left flex flex-col justify-between min-h-[350px] relative group cursor-pointer focus-ring ${
                          isSelected ? 'border-gold shadow-[0_0_30px_rgba(212,175,55,0.15)] bg-gold/[0.02]' : 'border-white/5 hover:border-gold/30 hover:bg-white/[0.01]'
                        }`}
                      >
                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold font-serif font-bold text-xl group-hover:scale-105 transition-transform">
                              {expert.name.charAt(0)}
                            </div>
                            {isSelected && (
                              <Badge variant="gold" className="text-[10px] uppercase font-black tracking-widest">{selectedLang === 'en' ? 'SELECTED' : 'CHOISI'}</Badge>
                            )}
                          </div>
                          <div>
                            <h3 className="text-xl font-serif text-ivoire font-bold group-hover:text-gold transition-colors">{expert.name}</h3>
                            <p className="text-[11px] text-gold/70 font-bold uppercase tracking-wider mt-1">
                              {selectedLang === 'en' ? expert.roleEn : expert.role}
                            </p>
                          </div>
                          <p className="text-xs text-slate-400 font-light leading-relaxed">
                            {selectedLang === 'en' ? expert.descEn : expert.desc}
                          </p>
                        </div>
                        <div className="pt-4 border-t border-white/5 text-[10px] font-mono text-slate-500 truncate w-full">
                          {expert.email}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

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

            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl mx-auto text-center space-y-8">
                <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto border border-gold/20 text-gold">
                  <CheckCircle size={40} />
                </div>
                <h2 className="text-4xl font-serif text-ivoire italic">
                  {tr('onboarding.readyTitle')} <span className="text-gold">{tr('onboarding.readyAccent')}</span>
                </h2>
                <p className="text-silver font-light text-sm italic leading-relaxed">{tr('onboarding.readyDesc')}</p>
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
            <Button variant="gold" className="gap-2 px-12 h-14 shadow-gold/10 font-bold uppercase tracking-widest text-xs" onClick={step === 3 ? () => setStep(4) : nextStep}>
              {step === 3 ? tr('onboarding.skip') : tr('continue')} <ChevronRight size={18} />
            </Button>
          )}
        </footer>
      </div>
    </div>
  );
}
