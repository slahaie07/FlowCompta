import { FileText, AlertCircle, TrendingUp, CheckCircle2, ArrowUpRight, HelpCircle, Mail as MailIcon, UploadCloud, ShieldCheck, Check } from 'lucide-react';
import { UserData, AppMode } from '../../../types';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { TaxPredictor } from './TaxPredictor';
import { ServiceSelector } from '../../../components/common/ServiceSelector';
import { ClientJourneyNudge } from '../../../components/common/ClientJourneyNudge';
import { motion } from 'motion/react';
import { useInvoices } from '../../../hooks/useInvoices';
import { useDocuments } from '../../../hooks/useDocuments';
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';
import { useLanguage } from '../../../hooks/useLanguage';
import { usePortalNavigate } from '../../../hooks/usePortalNavigate';
import { CONFIG } from '../../../lib/config';

export function Overview({ userData, isLoading: authLoading, currentMode, onSignMandate, onRefreshProfile }: { userData: UserData, isLoading: boolean, currentMode: AppMode, onSignMandate?: () => void, onRefreshProfile?: () => void }) {
  const { t } = useLanguage();
  const portalNavigate = usePortalNavigate();
  const { invoices, loading: invoicesLoading, declarePaidByClient, refreshInvoices } = useInvoices(undefined, false);
  const { documents, loading: docsLoading, uploadDocument } = useDocuments();
  const [cpaInfo, setCpaInfo] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const checklistFileInputRef = useRef<HTMLInputElement>(null);
  const uploadCategoryRef = useRef<any>('general');
  const [isMandateSigned, setIsMandateSigned] = useState(() => {
    if (!userData?.id) return false;
    return localStorage.getItem(`comptaflow_mandate_signed_${userData.id}`) === 'true';
  });

  const handleChecklistFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setIsUploading(true);
      const cat = uploadCategoryRef.current;
      try {
        const success = await uploadDocument(file, cat);
        if (success) {
          toast.success(`Le document ${file.name} a été classé dans la catégorie "${cat}" avec succès.`);
        }
      } catch (err) {
        toast.error("Échec du dépôt.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const triggerChecklistUpload = (category: string) => {
    uploadCategoryRef.current = category;
    checklistFileInputRef.current?.click();
  };

  useEffect(() => {
    if (userData?.id) {
      setIsMandateSigned(localStorage.getItem(`comptaflow_mandate_signed_${userData.id}`) === 'true');
    }
  }, [userData]);

  // Charger les coordonnées Interac du comptable attitré
  useEffect(() => {
    async function loadCpaInfo() {
      if (userData?.subAdminId) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name, email, interac_email, interac_question, interac_autodepot')
            .eq('id', userData.subAdminId)
            .single();
          if (data) {
            setCpaInfo(data);
          }
        } catch (e) {
          console.warn("Impossible de charger les coordonnées du comptable attitré :", e);
        }
      }
    }
    loadCpaInfo();
  }, [userData]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setIsUploading(true);
      try {
        const success = await uploadDocument(file, 'general');
        if (success) {
          toast.success(`Le document ${file.name} a été déposé avec succès.`);
        }
      } catch (err) {
        toast.error("Échec du dépôt.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (authLoading || invoicesLoading || docsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-10">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-48 bg-white/5 rounded-3xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  const pendingInvoices = invoices.filter(i => i.status === 'pending');
  const paidInvoices = invoices.filter(i => i.status === 'paid');
  const totalDue = pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  const handleDeclarePaid = async (invoiceId: string) => {
    await declarePaidByClient(invoiceId);
    refreshInvoices();
  };

  // Calculs du Guide de Démarrage
  const activeNeeds = userData.needs && typeof userData.needs === 'object' ? userData.needs : { [userData.selectedServiceId || '']: true };
  const checklistItems = getRequiredChecklistForServices(activeNeeds);
  const uploadedRequiredCount = checklistItems.filter(item => documents.some(doc => doc.category === item.category)).length;
  const isDocsComplete = checklistItems.length > 0 ? uploadedRequiredCount === checklistItems.length : true;
  const isBillingComplete = pendingInvoices.length === 0;

  const step1Progress = isMandateSigned ? 100 : 0;
  const step2Progress = checklistItems.length > 0 ? Math.round((uploadedRequiredCount / checklistItems.length) * 100) : 100;
  const step3Progress = isBillingComplete ? 100 : 0;
  const overallProgress = Math.round((step1Progress + step2Progress + step3Progress) / 3);

  return (
    <div className="space-y-10">
      {/* Input de dépôt classé */}
      <input 
        type="file" 
        ref={checklistFileInputRef} 
        onChange={handleChecklistFileChange} 
        className="hidden" 
        accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls,.doc,.docx" 
      />

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative">
        <div className="absolute -top-16 -left-8 w-64 h-64 bg-gold/[0.04] rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-5xl font-serif font-bold text-ivoire tracking-tight leading-tight"
          >
            {t('portal.overview.greeting')} <span className="animated-gradient-text italic">{userData.displayName}</span>
          </motion.h1>
          <div className="flex items-center gap-3 mt-3">
            <span className="w-8 h-[1px] bg-gold/50"></span>
            <p className="text-slate-500 text-xs font-black uppercase tracking-[0.4em]">{t('portal.overview.subtitle')} · {currentMode === 'business' ? t('business') : t('personal')}</p>
          </div>
        </div>
        <div className="flex gap-4 w-full md:w-auto relative z-10">
           <Button variant="secondary" size="lg" className="flex-1 md:flex-none gap-3 h-14 md:h-12 px-8 glass-button rounded-2xl group" onClick={() => window.location.href=`mailto:${cpaInfo?.email || CONFIG.APP.SUPPORT_EMAIL}`}>
             <MailIcon size={16} className="text-gold group-hover:scale-110 transition-transform"/> 
             <span className="text-xs font-bold uppercase tracking-widest">{t('portal.overview.contactCpa')}</span>
           </Button>
           <Button variant="ghost" size="icon" aria-label={t('portal.overview.help')} className="h-14 w-14 md:h-12 md:w-12 glass-card rounded-2xl border-white/5 hover:border-gold/20 transition-all" onClick={() => portalNavigate('support')}>
             <HelpCircle size={20} className="text-slate-400"/>
           </Button>
        </div>
      </header>

      {/* 🚀 Guide Rapide de Prise en Charge */}
      {userData.selectedServiceId && (
        <Card className="p-8 premium-border-gold bg-gradient-to-tr from-gold/[0.02] to-transparent space-y-6" glow="gold">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
            <div>
              <h3 className="text-xl font-serif font-bold text-ivoire flex items-center gap-2">
                <span>🚀</span> Guide de Prise en Charge Interactif
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Complétez ces 3 étapes simples pour permettre à notre cabinet de démarrer votre comptabilité.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 uppercase font-black tracking-widest">
                Progression globale :
              </span>
              <Badge variant={overallProgress === 100 ? "success" : "gold"} className="h-7 px-3 text-xs font-bold">
                {overallProgress}%
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Étape 1 : Signature du Mandat */}
            <div className={`p-5 rounded-2xl border transition-all ${isMandateSigned ? 'bg-green-500/5 border-green-500/20' : 'bg-white/5 border-white/10'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Étape 1</span>
                  <h4 className="text-sm font-bold text-ivoire font-serif italic">Mandat & Engagement</h4>
                </div>
                {isMandateSigned ? (
                  <span className="text-green-400 text-xs font-bold bg-green-500/10 px-2.5 py-1 rounded-lg border border-green-500/20">✓ Signé</span>
                ) : (
                  <span className="text-gold text-xs font-bold bg-gold/10 px-2.5 py-1 rounded-lg border border-gold/20">À faire</span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                Autorisez formellement nos comptables agréés à représenter votre dossier auprès des autorités fiscales.
              </p>
              {!isMandateSigned && (
                <Button variant="gold" size="sm" className="w-full mt-4 text-[10px] uppercase font-black tracking-wider h-9" onClick={onSignMandate}>
                  Signer le mandat
                </Button>
              )}
            </div>

            {/* Étape 2 : Dépôt des Documents */}
            <div className={`p-5 rounded-2xl border transition-all ${isDocsComplete ? 'bg-green-500/5 border-green-500/20' : 'bg-white/5 border-white/10'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Étape 2</span>
                  <h4 className="text-sm font-bold text-ivoire font-serif italic">Dépôt des Pièces</h4>
                </div>
                {isDocsComplete ? (
                  <span className="text-green-400 text-xs font-bold bg-green-500/10 px-2.5 py-1 rounded-lg border border-green-500/20">✓ Complet</span>
                ) : (
                  <span className="text-gold text-xs font-bold bg-gold/10 px-2.5 py-1 rounded-lg border border-gold/20">
                    {uploadedRequiredCount}/{checklistItems.length} Reçus
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                Fournissez les documents requis selon les services actifs sur votre dossier pour vérification.
              </p>
              
              <div className="mt-4 space-y-2 border-t border-white/5 pt-3">
                {checklistItems.map(item => {
                  const docFound = documents.find(d => d.category === item.category);
                  return (
                    <div key={item.id} className="flex justify-between items-center bg-black/25 p-2.5 rounded-xl border border-white/5">
                      <div className="min-w-0 pr-2">
                        <p className="text-[10px] font-bold text-silver truncate" title={item.label}>
                          {item.label}
                        </p>
                        {docFound ? (
                          <p className="text-[9px] text-green-400 truncate">{docFound.fileName}</p>
                        ) : (
                          <p className="text-[9px] text-slate-500">Document Requis</p>
                        )}
                      </div>
                      {docFound ? (
                        <span className="text-[9px] text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">Reçu</span>
                      ) : (
                        <button 
                          onClick={() => triggerChecklistUpload(item.category)}
                          className="text-[9px] text-gold font-bold hover:bg-gold hover:text-black border border-gold/30 px-2 py-0.5 rounded transition-all shrink-0"
                        >
                          Déposer
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Étape 3 : Facturation & Lancement */}
            <div className={`p-5 rounded-2xl border transition-all ${isBillingComplete ? 'bg-green-500/5 border-green-500/20' : 'bg-white/5 border-white/10'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Étape 3</span>
                  <h4 className="text-sm font-bold text-ivoire font-serif italic">Règlement & Lancement</h4>
                </div>
                {isBillingComplete ? (
                  <span className="text-green-400 text-xs font-bold bg-green-500/10 px-2.5 py-1 rounded-lg border border-green-500/20">✓ Payé</span>
                ) : (
                  <span className="text-gold text-xs font-bold bg-gold/10 px-2.5 py-1 rounded-lg border border-gold/20">Facture en attente</span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                Réglez le forfait initial ou versez l'acompte de démarrage par transfert Interac sécurisé.
              </p>
              {!isBillingComplete && (
                <Button variant="secondary" size="sm" className="w-full mt-4 text-[10px] uppercase font-black tracking-wider h-9" onClick={() => portalNavigate('invoices')}>
                  Voir les factures
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      <ClientJourneyNudge userData={userData} />

      <ServiceSelector userData={userData} onSaved={onRefreshProfile} />

      {/* Bento Grid Simplifié */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="p-8 space-y-4 premium-border-gold relative overflow-hidden group" glow="gold">
          <div className="flex items-center gap-3 text-slate-500 text-xs font-black uppercase tracking-[0.2em]">
            <AlertCircle size={16} className="text-gold" /> {t('portal.overview.pendingInvoices')}
          </div>
          <div className="text-4xl font-serif font-bold text-ivoire">
            {totalDue.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
          </div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{pendingInvoices.length} {t('portal.overview.pendingCount')}</p>
        </Card>

        <Card className="p-8 space-y-4 glass-card relative overflow-hidden group">
          <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
            <TrendingUp size={16} className="text-gold" /> {t('portal.overview.totalPaid')}
          </div>
          <div className="text-4xl font-serif font-bold text-gold">
            {totalPaid.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
          </div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{paidInvoices.length} {t('portal.overview.paidCount')}</p>
        </Card>

        <Card className="p-8 space-y-4 glass-card relative overflow-hidden group">
          <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
            <FileText size={16} className="text-gold" /> {t('portal.overview.vault')}
          </div>
          <div className="text-4xl font-serif font-bold text-ivoire">
            {documents.length} {t('portal.overview.vaultDocs')}
          </div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{t('portal.overview.vaultEncryption')}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Colonne Gauche: Dépôt et Mandat */}
        <div className="lg:col-span-7 space-y-8">
          {/* Radar Fiscal Prédictif (AI/Tax Integration) */}
          {userData.id ? <TaxPredictor userId={userData.id} /> : null}

          {/* Dépôt Direct */}
          <Card className="p-8 space-y-6 premium-border-gold" glow="gold">
            <div>
              <h3 className="text-lg font-serif font-bold text-ivoire flex items-center gap-2">
                <span>📁</span> {t('portal.overview.uploadTitle')}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {t('portal.overview.uploadDesc')}
              </p>
            </div>

            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls" 
            />

            <div 
              role="button"
              tabIndex={0}
              aria-label={t('portal.overview.uploadCta')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); triggerFileInput(); } }}
              onClick={triggerFileInput}
              className="p-12 border-2 border-dashed border-white/10 hover:border-gold/50 rounded-2xl bg-black/20 hover:bg-gold/[0.02] text-center cursor-pointer transition-all duration-300 group focus-ring"
            >
              <UploadCloud size={40} className="mx-auto text-slate-600 group-hover:text-gold transition-colors mb-4 group-hover:scale-105" />
              <p className="text-sm font-bold text-silver uppercase tracking-widest">
                {isUploading ? t('portal.overview.uploading') : t('portal.overview.uploadCta')}
              </p>
              <p className="text-xs text-slate-500 mt-1">{t('portal.overview.uploadHint')}</p>
            </div>
            
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest justify-center">
              <ShieldCheck size={14} className="text-gold" /> Certifié conforme PIPEDA, Loi 25 (QC) & chiffrement de bout en bout
            </div>
          </Card>

          {/* Mandat / Signature */}
          <Card className="p-8 flex flex-col md:flex-row gap-6 hover:bg-white/5 transition-colors group">
            <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center shrink-0 border border-gold/20 shadow-lg">
              <CheckCircle2 size={24} className="text-gold" />
            </div>
            <div className="flex-1">
               <div className="flex justify-between items-start">
                  <p className="text-base font-bold text-silver tracking-tight">{t('portal.overview.mandateTitle')}</p>
                  <Badge variant="gold">Actif</Badge>
               </div>
               <p className="text-xs text-slate-500 mt-2 font-light leading-relaxed">
                 {t('portal.overview.mandateDesc')}
               </p>
               <Button variant="ghost" className="mt-4 text-xs font-bold uppercase tracking-widest gap-2 h-10 border-white/15 text-slate-400 hover:text-gold" onClick={onSignMandate}>
                 {t('portal.overview.viewMandate')} <ArrowUpRight size={14}/>
               </Button>
            </div>
          </Card>
        </div>

        {/* Colonne Droite: Invoices / Règlements */}
        <div className="lg:col-span-5 space-y-8">
          <Card className="p-0 overflow-hidden glass-card h-full flex flex-col">
            <div className="p-6 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
               <h3 className="text-xs font-black text-silver uppercase tracking-[0.3em]">{t('portal.overview.billing')}</h3>
            </div>
            <div className="flex-1 divide-y divide-white/5 overflow-y-auto max-h-[450px]">
              {pendingInvoices.length === 0 ? (
                <div className="p-12 text-center text-slate-500 italic space-y-3">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto border border-green-500/20 text-green-400">
                    <Check size={20} />
                  </div>
                  <p className="text-sm font-bold">{t('portal.overview.upToDate')}</p>
                  <p className="text-xs text-slate-600 uppercase tracking-widest">{t('portal.overview.noPending')}</p>
                </div>
              ) : (
                pendingInvoices.map((inv) => (
                  <div key={inv.id} className="p-6 space-y-4 hover:bg-white/[0.01] transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-bold text-ivoire">{inv.number}</p>
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">Émise le {new Date(inv.date).toLocaleDateString('fr-CA')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-serif font-bold text-gold">{inv.amount.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</p>
                        <p className="text-[9px] text-slate-500 font-bold mt-1 uppercase tracking-tighter">Échéance {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('fr-CA') : 'N/A'}</p>
                      </div>
                    </div>

                    {inv.clientADeclarePaye ? (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center text-xs text-amber-500 uppercase font-black tracking-wider">
                        ⏳ {t('portal.overview.paymentPending')}
                      </div>
                    ) : (
                      <div className="space-y-3 bg-white/[0.02] border border-white/5 p-4 rounded-xl">
                        <div className="text-[10px] space-y-1.5 text-slate-400 font-medium">
                          <div className="flex justify-between">
                            <span>Destinataire Interac :</span>
                            <span className="text-ivoire font-bold">{cpaInfo?.interac_email || cpaInfo?.email || CONFIG.APP.INTERAC_EMAIL}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Réf / Message :</span>
                            <span className="text-ivoire font-mono font-bold tracking-widest px-1.5 bg-white/5 rounded">{inv.number}</span>
                          </div>
                          {cpaInfo?.interac_question && (
                            <div className="flex justify-between">
                              <span>Question / Réponse :</span>
                              <span className="text-ivoire font-bold">{cpaInfo.interac_question}</span>
                            </div>
                          )}
                        </div>
                        <Button 
                          variant="gold" 
                          className="w-full h-10 text-[10px] font-black uppercase tracking-wider"
                          onClick={() => handleDeclarePaid(inv.id)}
                        >
                          {t('portal.overview.declarePaid')}
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

interface ChecklistItem {
  id: string;
  label: string;
  category: 'bank' | 'general' | 'payroll' | 'fiscal' | 'tax' | 'legal';
  required: boolean;
}

function getRequiredChecklistForServices(needs: any): ChecklistItem[] {
  const list: ChecklistItem[] = [];
  
  const activeNeeds: Record<string, boolean> = {};
  if (Array.isArray(needs)) {
    needs.forEach(k => { activeNeeds[k] = true; });
  } else if (needs && typeof needs === 'object') {
    Object.assign(activeNeeds, needs);
  }

  const hasNeed = (keys: string[]) => keys.some(key => activeNeeds[key] === true);

  if (hasNeed(['hourlyBookkeeping', 'monthlyMicro', 'monthlySmall', 'monthlySme', 'catchUp'])) {
    list.push({
      id: 'bank',
      label: 'Relevés Bancaires (PDF/CSV)',
      category: 'bank',
      required: true
    });
    list.push({
      id: 'general',
      label: 'Factures de Vente & Reçus de Dépenses',
      category: 'general',
      required: true
    });
  }

  if (hasNeed(['payroll', 't4Releve1'])) {
    list.push({
      id: 'payroll',
      label: 'Registre des Employés & Heures de Paie',
      category: 'payroll',
      required: true
    });
  }

  if (hasNeed(['gstQst'])) {
    list.push({
      id: 'fiscal',
      label: 'Rapports des Ventes / Taxes (TPS/TVQ)',
      category: 'fiscal',
      required: true
    });
  }

  if (hasNeed(['taxHelpAutonomous'])) {
    list.push({
      id: 'tax',
      label: 'Feuillets Fiscaux (T4, T5, T3) & Cotisations',
      category: 'tax',
      required: true
    });
  }

  if (list.length === 0) {
    list.push({
      id: 'legal',
      label: 'Pièce d’identité officielle (Loi 25)',
      category: 'legal',
      required: true
    });
    list.push({
      id: 'general',
      label: 'Documents comptables divers',
      category: 'general',
      required: false
    });
  }

  return list;
}

