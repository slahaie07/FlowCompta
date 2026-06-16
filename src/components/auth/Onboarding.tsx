import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { UploadCloud, CheckCircle, ChevronRight, Building, Calculator, Lock, ShieldCheck, CreditCard, User, Wallet, Users, FileText, Languages, Mail, Package, PieChart } from 'lucide-react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { toast } from 'sonner';
import { UserData, UserNeeds } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { useNavigate } from 'react-router-dom';
import { calculateCanadianTaxes, formatCAD, ProvinceCode } from '../../lib/financeUtils';
import { t, LanguageCode } from '../../lib/i18n';
import { communicationService } from '../../lib/communication';
import { CONFIG } from '../../lib/config';

interface OnboardingProps {
  initialEmail: string;
  onComplete: (data: UserData, quoteValue: number) => void;
}

export function Onboarding({ initialEmail, onComplete }: OnboardingProps) {
  const navigate = useNavigate();
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
    needs: { t1: false, ta: false, t2: false, bookkeeping: false, stocks: false, cfo: false },
    province: 'QC',
    language: 'fr'
  });

  const calculatePricing = () => {
    const FEES = CONFIG.FEES;
    let subtotal = FEES.SETUP;
    
    if (data.needs.t1) subtotal += FEES.T1;
    if (data.needs.ta) subtotal += FEES.TA;
    if (data.needs.t2) subtotal += FEES.T2;
    if (data.needs.bookkeeping) subtotal += FEES.BOOKKEEPING;
    if (data.needs.stocks) subtotal += FEES.STOCKS;
    if (data.needs.cfo) subtotal += FEES.CFO;
    
    const taxDetails = calculateCanadianTaxes(subtotal, data.province as ProvinceCode);
    
    return { 
      setupFee: FEES.SETUP,
      subtotal,
      tps: taxDetails.tps,
      tvq: taxDetails.tvq,
      tvh: taxDetails.tvh,
      total: taxDetails.total
    };
  };

  const pricing = calculatePricing();

  const [showInterac, setShowInterac] = useState(false);
  const [interacRef, setInteracRef] = useState('');

  const handleStripePayment = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    try {
      const services = Object.entries(data.needs)
        .filter(([_, v]) => v)
        .map(([k, _]) => {
          const s = [
            {id: 't1', label: "Impôts — Particulier", p: 89},
            {id: 'ta', label: "Impôts — Travailleur autonome", p: 199},
            {id: 't2', label: "Impôts — Société", p: 749},
            {id: 'bookkeeping', label: "Tenue de livres", p: 249},
            {id: 'stocks', label: "Gestion des stocks", p: 179},
            {id: 'cfo', label: "Finances d'entreprise", p: 499}
          ].find(x => x.id === k);
          return { name: s?.label, price: s?.p || 0 };
        });

      const ref = `Comptaflow-${Date.now().toString().slice(-6)}`;
      
      const res = await fetch('/api/payment/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: services,
          customerEmail: data.email,
          customerName: data.displayName,
          method: 'card',
          reference: ref,
          metadata: {
             companyName: data.companyName,
             needs: JSON.stringify(data.needs)
          }
        })
      });

      const result = await res.json();
      
      if (result.url) {
        window.location.href = result.url;
      } else {
        throw new Error(result.error || "Impossible de créer la session de paiement.");
      }
    } catch (err: any) {
      toast.error("Erreur de paiement Stripe : " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleComplete = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      if (!data.displayName) throw new Error("Le nom est obligatoire.");
      
      const services = Object.entries(data.needs)
        .filter(([_, v]) => v)
        .map(([k, _]) => {
          const s = [
            {id: 't1', label: "Impôts — Particulier", p: 89},
            {id: 'ta', label: "Impôts — Travailleur autonome", p: 199},
            {id: 't2', label: "Impôts — Société", p: 749},
            {id: 'bookkeeping', label: "Tenue de livres", p: 249},
            {id: 'stocks', label: "Gestion des stocks", p: 179},
            {id: 'cfo', label: "Finances d'entreprise", p: 499}
          ].find(x => x.id === k);
          return { name: s?.label, price: s?.p };
        });

      // Si pas de Stripe, on bascule sur la création de commande Interac
      const ref = `Comptaflow-${Date.now().toString().slice(-6)}`;
      setInteracRef(ref);

      const res = await fetch('/api/payment/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: services,
          customerEmail: data.email,
          customerName: data.displayName,
          method: 'interac',
          reference: ref,
          metadata: {
             companyName: data.companyName,
             needs: JSON.stringify(data.needs)
          }
        })
      });

      const result = await res.json();
      
      if (result.url && !result.manual) {
        // Redirection Stripe (si configuré un jour)
        window.location.href = result.url;
      } else {
        // Mode Interac / Manuel activé
        await onComplete({ ...data, status: 'pending_payment' } as any, pricing.total);
        setShowInterac(true);
      }
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
    if (step === 2 && !Object.values(data.needs).some(v => v)) {
      toast.warning("Veuillez sélectionner au moins un service.");
      return;
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
    <div className="min-h-screen bg-noir flex flex-col items-center py-16 px-6 relative overflow-hidden text-ivoire selection:bg-gold/30 font-sans">
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-gold/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-4xl z-10 space-y-12">
        <header className="flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 border-2 border-gold rounded-2xl flex items-center justify-center text-gold shadow-lg shadow-gold/10">
               <span className="font-serif font-bold text-2xl">C</span>
             </div>
             <h1 className="text-2xl font-serif font-medium text-ivoire tracking-tight italic">Compta<em className="text-gold not-italic">flow</em></h1>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-gold/20 rounded-full text-[10px] font-bold text-silver uppercase tracking-[0.2em]">
             <Lock size={14} className="text-gold" /> {t(selectedLang, 'secure_storage')}
          </div>
        </header>

        {step > 0 && (
          <div className="flex justify-between items-center relative max-w-2xl mx-auto px-4">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[1px] bg-white/10 z-0" />
            <motion.div className="absolute left-0 top-1/2 -translate-y-1/2 h-[1px] bg-gold z-0" animate={{ width: `${((step - 1) / 3) * 100}%` }} />
            {['Coordonnées', 'Services', 'Documents', 'Activation'].map((label, i) => (
              <div key={label} className="relative z-10 flex flex-col items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-500 ${step >= i+1 ? 'bg-gold text-noir shadow-gold/20' : 'bg-surface border border-white/10 text-slate-500'}`}>
                  {step > i+1 ? <CheckCircle size={14} /> : i+1}
                </div>
                <span className={`text-[9px] uppercase tracking-widest font-bold ${step >= i+1 ? 'text-gold' : 'text-slate-600'}`}>{label}</span>
              </div>
            ))}
          </div>
        )}

        <main className="min-h-[450px]">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-12 text-center">
                 <div className="space-y-4">
                   <h2 className="text-5xl font-serif text-ivoire tracking-tight italic">Bienvenue chez <span className="text-gold">Comptaflow.</span></h2>
                   <p className="text-silver font-light max-w-lg mx-auto text-sm italic">Ouvrez votre dossier en trois minutes — votre comptable prend le relais dès le premier document déposé.</p>
                 </div>

                 <div className="max-w-2xl mx-auto space-y-12">
                    <div className="space-y-6">
                       <p className="text-[10px] uppercase font-bold text-slate-600 tracking-[0.4em]">Langue de communication</p>
                       <div className="flex justify-center gap-4">
                          {[
                            { id: 'fr', label: 'Français' },
                            { id: 'en', label: 'English' }
                          ].map(lang => (
                            <button 
                              key={lang.id} 
                              onClick={() => setSelectedLang(lang.id as any)}
                              className={`px-8 py-3 rounded-full border font-bold text-xs uppercase tracking-widest transition-all ${selectedLang === lang.id ? 'bg-gold text-noir border-gold shadow-gold/20' : 'bg-white/5 border-white/10 text-slate-500 hover:border-gold/30'}`}
                            >
                               {lang.label}
                            </button>
                          ))}
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <button onClick={() => { setProfileType('personal'); setData({...data, needs: {...data.needs, t1: true}}); setStep(1); }} className="p-10 rounded-3xl bg-surface border border-white/10 hover:border-gold/50 transition-all group flex flex-col items-center gap-8">
                          <div className="w-20 h-20 rounded-full bg-gold/5 border border-gold/20 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-noir transition-all duration-500"><User size={40} /></div>
                          <div className="space-y-2 text-center">
                             <h3 className="text-xl font-serif text-ivoire">Particulier</h3>
                             <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest leading-relaxed">Salarié, étudiant, retraité</p>
                          </div>
                       </button>
                       <button onClick={() => { setProfileType('business'); setStep(1); }} className="p-10 rounded-3xl bg-surface border border-white/10 hover:border-gold/50 transition-all group flex flex-col items-center gap-8">
                          <div className="w-20 h-20 rounded-full bg-gold/5 border border-gold/20 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-noir transition-all duration-500"><Building size={40} /></div>
                          <div className="space-y-2 text-center">
                             <h3 className="text-xl font-serif text-ivoire">Entreprise / Autonome</h3>
                             <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest leading-relaxed">Pigiste, PME, Incorporé</p>
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
                   <h2 className="text-5xl font-serif text-ivoire tracking-tight italic leading-tight">Identité du <br/><span className="text-gold">mandat.</span></h2>
                   <p className="text-silver font-light text-base leading-relaxed italic">
                      Ces informations créent votre compte client sécurisé et permettent la facturation conforme.
                   </p>
                 </div>
                 <div className="p-10 rounded-3xl bg-surface border border-gold/20 space-y-6">
                   <Input label="Votre Nom Complet" placeholder="Marie Tremblay" value={data.displayName} onChange={e => setData({...data, displayName: e.target.value})} required />
                   <div>
                     <label className="text-[10px] font-bold text-slate-500 ml-1 mb-2 block uppercase tracking-widest">Province de résidence</label>
                     <select 
                       className="w-full bg-noir border border-white/10 rounded-xl px-4 py-4 text-ivoire outline-none focus:border-gold/50 transition-all text-sm appearance-none"
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
                        <Input label="Nom de l'Entreprise" placeholder="Tremblay Design inc." value={data.companyName} onChange={e => setData({...data, companyName: e.target.value})} required />
                        <Input label="NEQ (10 chiffres)" placeholder="116XXXXXXX" maxLength={10} value={data.neq} onChange={e => setData({...data, neq: e.target.value})} required />
                     </>
                   )}
                   <Input label="NAS (Optionnel)" placeholder="000 000 000" value={data.nas} onChange={e => setData({...data, nas: e.target.value})} />
                 </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                 <div className="text-center space-y-4">
                   <span className="text-gold text-[10px] font-bold tracking-[0.4em] uppercase">Le registre des services</span>
                   <h2 className="text-5xl font-serif text-ivoire tracking-tight italic">Composez votre <span className="text-gold">mandat.</span></h2>
                 </div>
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                   <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profileType === 'business' ? [
                        { id: 't2', label: "Impôts — Société", price: 749, icon: Building },
                        { id: 'ta', label: "Impôts — Travailleur autonome", price: 199, icon: Users },
                        { id: 'bookkeeping', label: "Tenue de livres", price: 249, icon: Calculator },
                        { id: 'stocks', label: "Gestion des stocks", price: 179, icon: Package },
                        { id: 'cfo', label: "Finances d'entreprise", price: 499, icon: PieChart }
                      ].map((s) => (
                        <button 
                          key={s.id} 
                          onClick={() => setData({...data, needs: {...data.needs, [s.id]: !data.needs[s.id as keyof UserNeeds]}})} 
                          className={`p-6 rounded-2xl border text-left transition-all duration-300 ${data.needs[s.id as keyof UserNeeds] ? 'bg-gold/10 border-gold shadow-gold/20' : 'bg-surface border-white/10 hover:border-gold/30'}`}
                        >
                          <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center transition-colors ${data.needs[s.id as keyof UserNeeds] ? 'bg-gold text-noir' : 'bg-noir text-gold/60'}`}><s.icon size={20}/></div>
                          <div className="flex justify-between items-baseline gap-2">
                            <p className="font-serif text-base text-ivoire">{s.label}</p>
                            <span className="text-gold font-serif text-lg">{s.price} $</span>
                          </div>
                        </button>
                      )) : [
                        { id: 't1', label: "Impôts — Particulier", price: 89, icon: FileText }
                      ].map((s) => (
                        <button 
                          key={s.id} 
                          onClick={() => setData({...data, needs: {...data.needs, [s.id]: !data.needs[s.id as keyof UserNeeds]}})} 
                          className={`p-10 rounded-2xl border text-left transition-all duration-300 ${data.needs[s.id as keyof UserNeeds] ? 'bg-gold/10 border-gold shadow-gold/20' : 'bg-surface border-white/10 hover:border-gold/30'}`}
                        >
                          <div className={`w-12 h-12 rounded-xl mb-6 flex items-center justify-center transition-colors ${data.needs[s.id as keyof UserNeeds] ? 'bg-gold text-noir' : 'bg-noir text-gold/60'}`}><s.icon size={24}/></div>
                          <div className="flex justify-between items-baseline gap-4">
                            <p className="font-serif text-xl text-ivoire">{s.label}</p>
                            <span className="text-gold font-serif text-2xl">{s.price} $</span>
                          </div>
                        </button>
                      ))}
                   </div>
                   <div className="p-10 rounded-3xl bg-surface border border-gold/30 sticky top-24">
                      <h3 className="text-[10px] font-bold text-silver mb-8 tracking-[0.2em] uppercase flex items-center gap-2">Récapitulatif</h3>
                      <div className="space-y-5 mb-8">
                         {Object.entries(data.needs).map(([k, v]) => {
                           if (!v) return null;
                           const svc = [
                             {id: 't1', label: "Impôts — Particulier", p: 89},
                             {id: 'ta', label: "Impôts — Travailleur autonome", p: 199},
                             {id: 't2', label: "Impôts — Société", p: 749},
                             {id: 'bookkeeping', label: "Tenue de livres", p: 249},
                             {id: 'stocks', label: "Gestion des stocks", p: 179},
                             {id: 'cfo', label: "Finances d'entreprise", p: 499}
                           ].find(x => x.id === k);
                           return (
                             <div key={k} className="flex justify-between text-xs font-medium text-silver">
                               <span>{svc?.label}</span>
                               <span className="text-gold font-serif">{formatCAD(svc?.p || 0)}</span>
                             </div>
                           );
                         })}
                         <div className="flex justify-between text-xs font-medium text-slate-500 italic">
                            <span>Frais d'ouverture unique</span>
                            <span className="text-gold font-serif">{formatCAD(pricing.setupFee)}</span>
                         </div>
                         <div className="pt-4 border-t border-white/10 space-y-3">
                            <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold tracking-widest"><span>Sous-total</span><span>{formatCAD(pricing.subtotal)}</span></div>
                            {pricing.tps > 0 && <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold tracking-widest"><span>TPS (5%)</span><span>{formatCAD(pricing.tps)}</span></div>}
                            {pricing.tvq > 0 && <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold tracking-widest"><span>TVQ (9.975%)</span><span>{formatCAD(pricing.tvq)}</span></div>}
                         </div>
                      </div>
                      <div className="pt-6 border-t border-white/20 text-right">
                         <p className="text-[10px] text-slate-500 font-bold uppercase mb-2 tracking-widest">Total à payer</p>
                         <span className="text-4xl font-serif text-gold border-b-4 border-double border-gold pb-1">{formatCAD(pricing.total)}</span>
                      </div>
                   </div>
                 </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-2xl mx-auto text-center space-y-12">
                 <div className="space-y-4">
                   <span className="text-gold text-[10px] font-bold tracking-[0.4em] uppercase">Le coffre-fort</span>
                   <h2 className="text-5xl font-serif text-ivoire tracking-tight italic">Premier <span className="text-gold">dépôt.</span></h2>
                 </div>
                 <div className="p-20 rounded-3xl bg-surface border-2 border-dashed border-gold/20 hover:border-gold/60 transition-all cursor-pointer group relative overflow-hidden">
                   <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                   <UploadCloud size={64} className="mx-auto text-gold/40 group-hover:text-gold transition-all duration-500 mb-8 group-hover:scale-110" />
                   <p className="text-ivoire font-bold uppercase tracking-widest text-sm mb-2">Glissez vos documents ici</p>
                   <p className="text-silver text-xs font-light">ou cliquez pour parcourir — PDF, images, Excel · 4 Mo max</p>
                   <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 text-success text-[10px] font-bold uppercase tracking-widest">
                     <ShieldCheck size={14} /> Chiffrement AES-256 actif
                   </div>
                 </div>
              </motion.div>
            )}

            {step === 4 && !showInterac && (
              <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-2xl mx-auto space-y-10">
                 <div className="text-center space-y-4">
                   <h2 className="text-5xl font-serif text-ivoire tracking-tight italic">Activation du <span className="text-gold">mandat.</span></h2>
                   <p className="text-silver font-light text-base italic">Choisissez votre méthode de règlement sécurisée.</p>
                 </div>
                 <div className="p-10 rounded-3xl bg-surface border border-gold/30 space-y-8 relative overflow-hidden shadow-2xl shadow-gold/5">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl rounded-full" />
                    
                    <div className="flex items-center gap-6 p-6 bg-noir rounded-2xl border border-white/5">
                      <div className="w-16 h-16 rounded-xl bg-gold/10 flex items-center justify-center text-gold shadow-gold/20"><CreditCard size={32} /></div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-silver uppercase tracking-widest">Total de la commande</p>
                        <p className="text-[10px] text-slate-500 uppercase font-bold mt-1 tracking-widest">{profileType === 'business' ? 'Dossier Professionnel' : 'Dossier Particulier'}</p>
                      </div>
                      <div className="text-right"><p className="text-3xl font-serif text-gold font-bold">{formatCAD(pricing.total)}</p></div>
                    </div>

                    <div className="space-y-4">
                      {/* Stripe Credit Card Integration */}
                      <button 
                        onClick={handleStripePayment}
                        disabled={isProcessing}
                        className="w-full p-6 rounded-2xl bg-gradient-to-r from-gold/15 to-noir border border-gold/30 hover:border-gold/60 hover:scale-[1.01] transition-all text-left group shadow-lg shadow-gold/5"
                      >
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-5">
                               <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-noir transition-all duration-500"><CreditCard size={24}/></div>
                               <div>
                                  <p className="text-sm font-serif text-ivoire font-bold">Carte de crédit (Visa, Mastercard, Amex)</p>
                                  <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold italic">Règlement instantané sécurisé par Stripe</p>
                               </div>
                            </div>
                            <ChevronRight size={20} className="text-gold/60 group-hover:text-gold transition-colors" />
                         </div>
                      </button>

                      {/* PayPal Integration */}
                      <div className="relative group">
                         <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                         <PayPalButtons 
                            style={{ layout: "vertical", shape: "rect", color: "gold", height: 55 }}
                            disabled={isProcessing}
                            onApprove={async (data, actions) => {
                               handlePayPalSuccess(data);
                            }}
                         />
                      </div>

                      <div className="flex items-center gap-4 py-4">
                        <div className="flex-1 h-[1px] bg-white/5"></div>
                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.3em]">Ou Virement Interac</span>
                        <div className="flex-1 h-[1px] bg-white/5"></div>
                      </div>

                      <button 
                        onClick={handleComplete}
                        disabled={isProcessing}
                        className="w-full p-6 rounded-2xl bg-noir border border-white/5 hover:border-gold/40 transition-all text-left group"
                      >
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-5">
                               <div className="w-12 h-12 rounded-xl bg-gold/5 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-noir transition-all duration-500"><Wallet size={24}/></div>
                               <div>
                                  <p className="text-sm font-serif text-ivoire font-bold">Virement Interac (Recommandé)</p>
                                  <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold italic">Activation instantanée après réception</p>
                               </div>
                            </div>
                            <ChevronRight size={20} className="text-slate-600 group-hover:text-gold transition-colors" />
                         </div>
                      </button>
                    </div>

                    <div className="flex gap-4 p-5 bg-gold/5 rounded-2xl border border-gold/10 items-center text-left">
                      <ShieldCheck size={28} className="text-gold shrink-0" />
                      <p className="text-[10px] text-silver leading-relaxed font-bold uppercase tracking-widest opacity-60 italic">Activation immédiate après validation. Cabinet certifié Comptaflow.</p>
                    </div>
                 </div>
              </motion.div>
            )}

            {showInterac && (
              <motion.div key="interac" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto space-y-10 text-center">
                 <div className="space-y-4">
                   <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto border border-gold/20 text-gold mb-6 shadow-2xl shadow-gold/10">
                      <Mail size={40} className="animate-pulse" />
                   </div>
                   <h2 className="text-4xl font-serif text-ivoire italic">Dernière étape : <br/><span className="text-gold">Le virement.</span></h2>
                   <p className="text-silver font-light text-sm italic">Votre accès au portail est créé. Vos mandats s'activeront dès la réception du virement Interac.</p>
                 </div>

                 <Card className="p-10 bg-surface border-gold/30 text-left space-y-8 relative overflow-hidden" glow="gold">
                    <div className="space-y-6 relative z-10">
                       <div className="flex justify-between items-center border-b border-white/5 pb-4">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Destinataire</span>
                          <span className="text-ivoire font-bold">{CONFIG.APP.INTERAC_EMAIL}</span>
                       </div>
                       <div className="flex justify-between items-center border-b border-white/5 pb-4">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Montant Exact</span>
                          <span className="text-gold font-serif text-2xl font-bold">{formatCAD(pricing.total)}</span>
                       </div>
                       <div className="flex justify-between items-center border-b border-white/5 pb-4">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Message / Référence</span>
                          <span className="text-ivoire font-mono font-bold tracking-widest px-3 py-1 bg-white/5 rounded-lg">{interacRef}</span>
                       </div>
                    </div>
                    <div className="p-4 bg-gold/5 rounded-xl border border-gold/10">
                       <p className="text-[10px] text-gold font-bold uppercase tracking-widest leading-relaxed italic text-center">
                          Veuillez utiliser la référence ci-dessus dans le champ "Message" de votre virement pour une activation automatique.
                       </p>
                    </div>
                    <Button variant="gold" className="w-full h-14 font-bold uppercase tracking-widest text-xs" onClick={() => navigate('/dashboard')}>Accéder à mon portail →</Button>
                 </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="pt-12 flex justify-between items-center border-t border-white/5">
           <Button variant="ghost" onClick={() => { if(step === 1) setStep(0); else setStep(s => s - 1); }} className={step === 0 ? 'invisible opacity-0' : 'h-14 px-10 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-ivoire transition-all'}>← Retour</Button>
           {step > 0 && (
             step < 4 ? (
               <Button variant="gold" className="gap-2 px-12 h-14 shadow-gold/10 font-bold uppercase tracking-widest text-xs transition-all" onClick={nextStep}>Continuer <ChevronRight size={18}/></Button>
             ) : (
               <Button variant="gold" className="gap-3 px-16 h-16 text-lg shadow-gold/20 font-bold uppercase tracking-widest transition-all" onClick={handleComplete} isLoading={isProcessing}>Confirmer le mandat <CheckCircle size={24}/></Button>
             )
           )}
        </footer>
      </div>
    </div>
  );
}
