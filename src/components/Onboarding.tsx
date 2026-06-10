import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { UploadCloud, CheckCircle, ChevronRight, Building, Calculator, Lock, ShieldCheck, CreditCard, User, Wallet, Users, FileText, Languages, Mail } from 'lucide-react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { toast } from 'sonner';
import { UserData, UserNeeds } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { calculateCanadianTaxes, formatCAD, ProvinceCode } from '../lib/financeUtils';
import { t, LanguageCode } from '../lib/i18n';
import { communicationService } from '../lib/communication';
import { CONFIG } from '../lib/config';
import { internalApi } from '../lib/api';

interface OnboardingProps {
  initialEmail: string;
  onComplete: (data: UserData, quoteValue: number) => void;
}

export function Onboarding({ initialEmail, onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [profileType, setProfileType] = useState<'personal' | 'business' | null>(null);
  const [selectedLang, setSelectedLang] = useState<LanguageCode>('fr');
  
  const [data, setData] = useState<UserData>({
    displayName: '',
    companyName: '',
    email: initialEmail || '',
    neq: '',
    nas: '',
    incomeBracket: '100k-500k',
    employeeCount: '1-5',
    needs: { bookkeeping: false, payroll: false, taxes: false, rentabilite: false, consultation: false },
    province: 'QC',
    language: 'fr'
  });

  const calculatePricing = () => {
    const SETUP_FEE = CONFIG.FEES.SETUP;
    let bookkeeping = 0, payroll = 0, taxes = 0;
    
    if (profileType === 'business') {
      if (data.needs.bookkeeping) bookkeeping = CONFIG.FEES.MONTHLY_BUSINESS;
      if (data.needs.payroll) payroll = 100;
      if (data.needs.taxes) taxes = 150;
    } else {
      if (data.needs.taxes) taxes = CONFIG.FEES.PERSONAL_FILE;
      if (data.needs.consultation) bookkeeping = 49;
    }
    
    const initialSubtotal = bookkeeping + payroll + taxes + SETUP_FEE;
    const taxDetails = calculateCanadianTaxes(initialSubtotal, data.province as ProvinceCode);
    
    return { 
      bookkeeping, 
      payroll, 
      taxes, 
      setupFee: SETUP_FEE,
      subtotal: initialSubtotal,
      tps: taxDetails.tps,
      tvq: taxDetails.tvq,
      tvh: taxDetails.tvh,
      total: taxDetails.total
    };
  };

  const pricing = calculatePricing();

  const handleComplete = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      if (!data.displayName) {
        throw new Error(selectedLang === 'fr' ? "Le nom est obligatoire." : "Name is required.");
      }
      if (profileType === 'business' && (!data.companyName || !data.neq)) {
        throw new Error("Infos entreprise manquantes.");
      }

      // 1. Simulation de paiement si les clés Stripe sont absentes
      console.log("Tentative de paiement simulé...");
      const paymentRes = await internalApi.simulatePayment(data, pricing.total);
      
      const userData = { 
        ...data, 
        id: initialEmail || `anon_${Date.now()}`,
        language: selectedLang,
        initialProfileType: profileType || 'personal',
        activeMode: profileType || 'personal'
      };

      // 2. Sauvegarde locale/interne
      await internalApi.saveProfile(userData);

      // 3. Sauvegarde Supabase (si dispo)
      try {
        await onComplete(userData as any, pricing.total);
      } catch(e) {
        console.warn("Supabase non dispo, profil sauvegardé en interne.");
      }
      
      toast.success("Onboarding finalisé avec succès !");
      if (paymentRes.url) window.location.href = paymentRes.url;
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!data.displayName) {
        toast.warning(selectedLang === 'fr' ? "Le nom est obligatoire." : "Name is required.");
        return;
      }
      if (profileType === 'business' && (!data.companyName || !data.neq)) {
        toast.warning("Infos entreprise manquantes.");
        return;
      }
    }
    setStep((p) => p + 1);
  };

  const handlePayPalSuccess = async (details: any) => {
    setIsProcessing(true);
    try {
      await onComplete({ 
        ...data, 
        language: selectedLang,
        initialProfileType: profileType || 'personal',
        activeMode: profileType || 'personal'
      }, pricing.total);
      toast.success("Paiement PayPal validé.");
    } catch (err: any) {
      toast.error("Erreur post-paiement PayPal : " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualPayment = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    try {
      // Notification admin immédiate
      await communicationService.notifyAdminOfManualPayment(data, pricing.total);
      
      // Sauvegarde du profil avec statut en attente
      await onComplete({ 
        ...data, 
        language: selectedLang,
        initialProfileType: profileType || 'personal',
        activeMode: profileType || 'personal',
        status: 'pending_manual_payment'
      } as any, pricing.total);

      toast.success("Demande envoyée. Veuillez effectuer le virement.");
    } catch (err: any) {
      toast.error("Erreur d'initialisation du virement.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-midnight flex flex-col items-center py-16 px-6 relative overflow-hidden text-silver selection:bg-gold/30">
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-sapphire/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-4xl z-10 space-y-12">
        <header className="flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-gradient-to-tr from-gold to-gold-dark rounded-2xl flex items-center justify-center shadow-lg shadow-gold/20">
               <Building className="text-midnight" size={24} />
             </div>
             <h1 className="text-2xl font-serif font-medium text-gold tracking-tight italic text-xl">ComptaFlow</h1>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-slate-400 uppercase tracking-widest">
             <Lock size={14} className="text-gold" /> {t(selectedLang, 'secure_storage')}
          </div>
        </header>

        {step > 0 && (
          <div className="flex justify-between items-center relative max-w-2xl mx-auto">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[1px] bg-white/10 z-0" />
            <motion.div className="absolute left-0 top-1/2 -translate-y-1/2 h-[1px] bg-gold z-0" animate={{ width: `${((step - 1) / 3) * 100}%` }} />
            {['Coordonnées', 'Services', 'Documents', 'Activation'].map((label, i) => (
              <div key={label} className="relative z-10 flex flex-col items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-500 ${step >= i+1 ? 'bg-gold text-midnight shadow-glow' : 'bg-obsidian border border-white/10 text-slate-500'}`}>
                  {step > i+1 ? <CheckCircle size={14} /> : i+1}
                </div>
                <span className={`text-[8px] uppercase tracking-widest font-bold ${step >= i+1 ? 'text-gold' : 'text-slate-600'}`}>{label}</span>
              </div>
            ))}
          </div>
        )}

        <main className="min-h-[450px]">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-12">
                 <div className="text-center space-y-4">
                   <h2 className="text-4xl font-serif text-silver tracking-tight italic">{t(selectedLang, 'welcome')}</h2>
                   <p className="text-slate-500 font-light max-w-lg mx-auto text-sm">{t(selectedLang, 'slogan')}</p>
                 </div>

                 <div className="max-w-2xl mx-auto space-y-8">
                    <div className="space-y-4">
                       <p className="text-[10px] uppercase font-bold text-slate-600 tracking-[0.3em] text-center">Langue de communication / Preferred Language</p>
                       <div className="flex justify-center gap-4">
                          {[
                            { id: 'fr', label: 'Français' },
                            { id: 'en', label: 'English' },
                            { id: 'ar', label: 'العربية' }
                          ].map(lang => (
                            <button 
                              key={lang.id} 
                              onClick={() => setSelectedLang(lang.id as any)}
                              className={`px-6 py-3 rounded-2xl border font-bold text-xs uppercase tracking-widest transition-all ${selectedLang === lang.id ? 'bg-gold text-midnight border-gold shadow-glow' : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/20'}`}
                            >
                               {lang.label}
                            </button>
                          ))}
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <button onClick={() => { setProfileType('personal'); setStep(1); }} className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-sapphire/50 hover:bg-sapphire/5 transition-all group flex flex-col items-center gap-6">
                          <div className="w-16 h-16 rounded-2xl bg-sapphire/10 flex items-center justify-center text-sapphire-light group-hover:scale-110 transition-transform"><User size={32} /></div>
                          <h3 className="text-lg font-serif text-silver font-bold uppercase tracking-widest text-center">{t(selectedLang, 'personal')}</h3>
                       </button>
                       <button onClick={() => { setProfileType('business'); setStep(1); }} className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-gold/50 hover:bg-gold/5 transition-all group flex flex-col items-center gap-6">
                          <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center text-gold group-hover:scale-110 transition-transform"><Building size={32} /></div>
                          <h3 className="text-lg font-serif text-silver font-bold uppercase tracking-widest text-center">{t(selectedLang, 'business')}</h3>
                       </button>
                    </div>
                 </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                 <div className="space-y-6">
                   <div className="flex gap-2">
                      <Badge variant={profileType === 'business' ? 'gold' : 'info'}>{profileType === 'business' ? 'PRO' : 'PERSO'}</Badge>
                      <Badge variant="default" className="bg-white/5 uppercase tracking-tighter">{selectedLang}</Badge>
                   </div>
                   <h2 className="text-4xl font-serif text-silver tracking-tight">Vos <br/><span className="text-gold italic">informations.</span></h2>
                   <p className="text-slate-400 font-light text-sm leading-relaxed italic">
                      {selectedLang === 'fr' ? "Vos données sont traitées en français." : selectedLang === 'en' ? "Your data is processed in English." : "سيتم معالجة بياناتك باللغة العربية."}
                   </p>
                 </div>
                 <Card className="p-8 space-y-5" glow={profileType === 'business' ? 'gold' : 'sapphire'}>
                   <Input label="Votre Nom Complet" placeholder={t(selectedLang, 'name_placeholder')} value={data.displayName} onChange={e => setData({...data, displayName: e.target.value})} required />
                   <div>
                     <label className="text-xs font-bold text-slate-500 ml-1 mb-1.5 block uppercase tracking-widest">Province de résidence</label>
                     <select 
                       className="w-full bg-midnight border border-white/10 rounded-2xl px-4 py-3 text-silver outline-none focus:border-gold/50 transition-all text-sm"
                       value={data.province}
                       onChange={e => setData({...data, province: e.target.value})}
                     >
                       <option value="QC">Québec (TPS + TVQ)</option>
                       <option value="ON">Ontario (TVH 13%)</option>
                       <option value="BC">Colombie-Britannique (TPS)</option>
                       <option value="AB">Alberta (TPS)</option>
                       <option value="MB">Manitoba (TPS)</option>
                       <option value="NB">Nouveau-Brunswick (TVH 15%)</option>
                       <option value="NS">Nouvelle-Écosse (TVH 15%)</option>
                       <option value="SK">Saskatchewan (TPS)</option>
                     </select>
                   </div>
                   {profileType === 'business' && (
                     <>
                        <Input label="Nom de l'Entreprise" placeholder={t(selectedLang, 'company_placeholder')} value={data.companyName} onChange={e => setData({...data, companyName: e.target.value})} required />
                        <Input label="NEQ (10 chiffres)" placeholder="116XXXXXXX" maxLength={10} value={data.neq} onChange={e => setData({...data, neq: e.target.value})} required />
                     </>
                   )}
                   <Input label="NAS (Optionnel)" placeholder="000 000 000" value={data.nas} onChange={e => setData({...data, nas: e.target.value})} />
                 </Card>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                 <div className="text-center space-y-4">
                   <h2 className="text-4xl font-serif text-silver tracking-tight italic">Nos <span className="text-gold">services offerts.</span></h2>
                 </div>
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                   <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profileType === 'business' ? [
                        { id: 'bookkeeping', label: t(selectedLang, 'services.bookkeeping'), icon: Calculator },
                        { id: 'payroll', label: t(selectedLang, 'services.payroll'), icon: Users },
                        { id: 'taxes', label: t(selectedLang, 'services.taxes_biz'), icon: FileText }
                      ].map((s) => (
                        <button key={s.id} onClick={() => setData({...data, needs: {...data.needs, [s.id]: !data.needs[s.id as keyof UserNeeds]}})} className={`p-6 rounded-3xl border text-left transition-all ${data.needs[s.id as keyof UserNeeds] ? 'bg-gold/10 border-gold shadow-glow' : 'bg-white/5 border-white/5 hover:border-white/20'}`}>
                          <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center ${data.needs[s.id as keyof UserNeeds] ? 'bg-gold text-midnight' : 'bg-white/5 text-slate-500'}`}><s.icon size={20}/></div>
                          <p className={`font-bold text-xs uppercase tracking-widest ${data.needs[s.id as keyof UserNeeds] ? 'text-gold' : 'text-silver'}`}>{s.label}</p>
                        </button>
                      )) : [
                        { id: 'taxes', label: t(selectedLang, 'services.taxes_perso'), icon: FileText },
                        { id: 'consultation', label: t(selectedLang, 'services.consulting'), icon: Wallet }
                      ].map((s) => (
                        <button key={s.id} onClick={() => setData({...data, needs: {...data.needs, [s.id]: !data.needs[s.id as keyof UserNeeds]}})} className={`p-6 rounded-3xl border text-left transition-all ${data.needs[s.id as keyof UserNeeds] ? 'bg-sapphire/10 border-sapphire shadow-glow' : 'bg-white/5 border-white/5 hover:border-white/20'}`}>
                          <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center ${data.needs[s.id as keyof UserNeeds] ? 'bg-sapphire text-white' : 'bg-white/5 text-slate-500'}`}><s.icon size={20}/></div>
                          <p className={`font-bold text-xs uppercase tracking-widest ${data.needs[s.id as keyof UserNeeds] ? 'text-sapphire-light' : 'text-silver'}`}>{s.label}</p>
                        </button>
                      ))}
                   </div>
                   <Card className="p-8 border-gold/20 bg-white/[0.02]" glow="gold">
                      <h3 className="text-sm font-bold text-silver mb-8 tracking-widest uppercase flex items-center gap-2 font-jakarta"><Calculator size={14} className="text-gold"/> Devis Initial</h3>
                      <div className="space-y-4 mb-8">
                         {pricing.subtotal > pricing.setupFee && <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500"><span>Services</span><span className="text-silver">{formatCAD(pricing.subtotal - pricing.setupFee)}</span></div>}
                         <div className="flex justify-between text-[10px] uppercase font-bold text-gold/60"><span>{t(selectedLang, 'setup_fee')}</span><span>{formatCAD(pricing.setupFee)}</span></div>
                         <div className="pt-2 border-t border-white/5 space-y-2">
                            <div className="flex justify-between text-[10px] text-slate-500 uppercase"><span>Sous-total</span><span>{formatCAD(pricing.subtotal)}</span></div>
                            {pricing.tps > 0 && <div className="flex justify-between text-[10px] text-slate-500 uppercase"><span>TPS (5%)</span><span>{formatCAD(pricing.tps)}</span></div>}
                            {pricing.tvq > 0 && <div className="flex justify-between text-[10px] text-slate-500 uppercase"><span>TVQ (9.975%)</span><span>{formatCAD(pricing.tvq)}</span></div>}
                            {pricing.tvh > 0 && <div className="flex justify-between text-[10px] text-slate-500 uppercase"><span>TVH</span><span>{formatCAD(pricing.tvh)}</span></div>}
                         </div>
                      </div>
                      <div className="pt-6 border-t border-white/10 text-right">
                         <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">{t(selectedLang, 'total')}</p>
                         <span className="text-4xl font-serif text-gold">{formatCAD(pricing.total)}</span>
                      </div>
                   </Card>
                 </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-2xl mx-auto text-center space-y-10">
                 <h2 className="text-4xl font-serif text-silver tracking-tight italic"><span className="text-gold">Dépôt</span> sécurisé.</h2>
                 <Card className="p-16 border-dashed border-white/10 hover:border-gold/50 transition-all cursor-pointer group bg-white/[0.01]">
                   <UploadCloud size={48} className="mx-auto text-slate-600 group-hover:text-gold transition-colors mb-6" />
                   <p className="text-silver font-bold uppercase tracking-widest text-xs">Transférer mes documents (PDF)</p>
                   <Badge variant="success" className="mt-4">{t(selectedLang, 'audit_active')}</Badge>
                 </Card>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-2xl mx-auto space-y-10">
                 <div className="text-center space-y-4">
                   <h2 className="text-4xl font-serif text-silver tracking-tight uppercase tracking-widest animated-gradient-text font-bold">Activation du <span className="italic">Portail.</span></h2>
                   <p className="text-slate-400 font-light text-sm italic">Choisissez votre méthode de règlement sécurisée.</p>
                 </div>
                 <Card className="p-10 space-y-8 bg-white/[0.02]" glow="gold" withAurora>
                    <div className="flex items-center gap-6 p-6 bg-white/5 rounded-3xl border border-white/5">
                      <div className="w-16 h-16 rounded-2xl bg-sapphire/20 flex items-center justify-center text-sapphire-light shadow-glow-sm"><CreditCard size={32} /></div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-silver uppercase tracking-widest">Montant de l'accès</p>
                        <p className="text-[10px] text-slate-500 uppercase font-bold mt-1">{profileType === 'business' ? 'Plan Entreprise' : 'Plan Particulier'}</p>
                      </div>
                      <div className="text-right"><p className="text-2xl font-serif text-gold font-bold">{formatCAD(pricing.total)}</p></div>
                    </div>

                    <div className="space-y-4">
                      {/* PayPal Integration */}
                      <PayPalButtons 
                        style={{ layout: "vertical", shape: "pill", color: "gold" }}
                        createOrder={async () => {
                          const res = await fetch('/api/paypal/create-order', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ amount: pricing.total })
                          });
                          const order = await res.json();
                          return order.id;
                        }}
                        onApprove={async (data, actions) => {
                          const res = await fetch('/api/paypal/capture-order', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ orderID: data.orderID, customerData: data })
                          });
                          const capture = await res.json();
                          if (capture.status === 'COMPLETED') {
                             handlePayPalSuccess(capture);
                          }
                        }}
                      />

                      <Button variant="secondary" className="w-full h-14 gap-3 font-bold uppercase tracking-widest border-white/10" onClick={handleComplete} isLoading={isProcessing}>
                        <CreditCard size={20} /> Payer par Carte
                      </Button>

                      <div className="flex items-center gap-4 py-4">
                        <div className="flex-1 h-[1px] bg-white/5"></div>
                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.3em]">Ou virement direct</span>
                        <div className="flex-1 h-[1px] bg-white/5"></div>
                      </div>

                      <button 
                        onClick={handleManualPayment}
                        disabled={isProcessing}
                        className="w-full p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-gold/30 transition-all text-left group"
                      >
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-gold/5 flex items-center justify-center text-gold group-hover:scale-110 transition-transform"><Mail size={20}/></div>
                               <div>
                                  <p className="text-xs font-bold text-silver uppercase tracking-widest">Virement Interac / Email</p>
                                  <p className="text-[10px] text-slate-500 mt-0.5">finance@comptaflow.ca</p>
                               </div>
                            </div>
                            <ChevronRight size={18} className="text-slate-600 group-hover:text-gold transition-colors" />
                         </div>
                      </button>
                    </div>

                    <div className="flex gap-4 p-5 bg-green-500/5 rounded-2xl border border-green-500/10 items-center text-left">
                      <ShieldCheck size={24} className="text-green-500 shrink-0" />
                      <p className="text-[9px] text-slate-400 leading-relaxed font-bold uppercase tracking-widest">Confirmation immédiate après réception. Cabinet certifié Canada.</p>
                    </div>
                 </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="pt-12 flex justify-between items-center border-t border-white/5">
           <Button variant="ghost" onClick={() => { if(step === 1) setStep(0); else setStep(s => s - 1); }} className={step === 0 ? 'invisible' : 'h-12 px-8 text-xs font-bold uppercase transition-all'}>{t(selectedLang, 'back')}</Button>
           {step > 0 && (
             step < 4 ? (
               <Button variant="gold" className="gap-2 px-10 h-12 shadow-glow-sm font-bold uppercase tracking-widest text-xs transition-all" onClick={nextStep}>{t(selectedLang, 'continue')} <ChevronRight size={18}/></Button>
             ) : (
               <Button variant="gold" className="gap-3 px-12 h-16 text-lg shadow-glow font-bold uppercase tracking-widest transition-all" onClick={handleComplete} isLoading={isProcessing}>Payer & Activer <CheckCircle size={24}/></Button>
             )
           )}
        </footer>
      </div>
    </div>
  );
}
