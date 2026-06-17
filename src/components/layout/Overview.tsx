import { FileText, Clock, AlertCircle, TrendingUp, CheckCircle2, ArrowUpRight, HelpCircle, Mail as MailIcon, UploadCloud, ShieldCheck, Check, DollarSign } from 'lucide-react';
import { UserData, AppMode } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ChangelogBox } from './ChangelogBox';
import { motion } from 'motion/react';
import { useInvoices } from '../../hooks/useInvoices';
import { useDocuments } from '../../hooks/useDocuments';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

export function Overview({ userData, isLoading: authLoading, currentMode, onSignMandate }: { userData: UserData, isLoading: boolean, currentMode: AppMode, onSignMandate?: () => void }) {
  const { invoices, loading: invoicesLoading, declarePaidByClient, refreshInvoices } = useInvoices(undefined, false);
  const { documents, loading: docsLoading, uploadDocument } = useDocuments();
  const [cpaInfo, setCpaInfo] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Charger les coordonnées Interac du CPA attitré
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
          console.warn("Impossible de charger les coordonnées du CPA attitré :", e);
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

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative">
        <div className="relative z-10">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-5xl font-serif font-bold text-ivoire tracking-tight leading-tight"
          >
            Bonjour, <span className="animated-gradient-text italic">{userData.displayName}</span>
          </motion.h1>
          <div className="flex items-center gap-3 mt-3">
            <span className="w-8 h-[1px] bg-gold/50"></span>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Dashboard Elite {currentMode === 'business' ? 'Business' : 'Privé'}</p>
          </div>
        </div>
        <div className="flex gap-4 w-full md:w-auto relative z-10">
           <Button variant="secondary" size="lg" className="flex-1 md:flex-none gap-3 h-14 md:h-12 px-8 glass-button rounded-2xl group" onClick={() => window.location.href=`mailto:${cpaInfo?.email || 's.lahaie07@gmail.com'}`}>
             <MailIcon size={16} className="text-gold group-hover:scale-110 transition-transform"/> 
             <span className="text-xs font-bold uppercase tracking-widest">Contacter mon CPA</span>
           </Button>
           <Button variant="ghost" size="icon" className="h-14 w-14 md:h-12 md:w-12 glass-card rounded-2xl border-white/5 hover:border-gold/20 transition-all">
             <HelpCircle size={20} className="text-slate-400"/>
           </Button>
        </div>
      </header>

      {/* Bento Grid Simplifié */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="p-8 space-y-4 premium-border-gold relative overflow-hidden group" glow="gold">
          <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
            <AlertCircle size={16} className="text-gold" /> Factures à régler
          </div>
          <div className="text-4xl font-serif font-bold text-ivoire">
            {totalDue.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{pendingInvoices.length} facture(s) en attente</p>
        </Card>

        <Card className="p-8 space-y-4 glass-card relative overflow-hidden group">
          <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
            <TrendingUp size={16} className="text-gold" /> Total Honoraires Réglés
          </div>
          <div className="text-4xl font-serif font-bold text-gold">
            {totalPaid.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{paidInvoices.length} facture(s) payée(s)</p>
        </Card>

        <Card className="p-8 space-y-4 glass-card relative overflow-hidden group">
          <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
            <FileText size={16} className="text-gold" /> Coffre-fort Numérique
          </div>
          <div className="text-4xl font-serif font-bold text-ivoire">
            {documents.length} Docs
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Chiffrement AES-256 Actif</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Colonne Gauche: Dépôt et Mandat */}
        <div className="lg:col-span-7 space-y-8">
          {/* Dépôt Direct */}
          <Card className="p-8 space-y-6 premium-border-gold" glow="gold">
            <div>
              <h3 className="text-lg font-serif font-bold text-ivoire flex items-center gap-2">
                <span>📁</span> Dépôt de Document Instantané
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Glissez-déposez vos reçus, relevés ou avis de cotisation pour votre CPA. Notre intelligence artificielle classe et analyse vos pièces automatiquement.
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
              onClick={triggerFileInput}
              className="p-12 border-2 border-dashed border-white/10 hover:border-gold/50 rounded-2xl bg-black/20 hover:bg-gold/[0.02] text-center cursor-pointer transition-all duration-300 group"
            >
              <UploadCloud size={40} className="mx-auto text-slate-600 group-hover:text-gold transition-colors mb-4 group-hover:scale-105" />
              <p className="text-sm font-bold text-silver uppercase tracking-widest">
                {isUploading ? "Téléversement en cours..." : "Téléverser une pièce justificative"}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">PDF, Image ou Excel • Max 4 Mo</p>
            </div>
            
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest justify-center">
              <ShieldCheck size={14} className="text-gold" /> Certifié conforme Loi 25 & Chiffrement de bout en bout
            </div>
          </Card>

          {/* Mandat / Signature */}
          <Card className="p-8 flex flex-col md:flex-row gap-6 hover:bg-white/5 transition-colors group">
            <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center shrink-0 border border-gold/20 shadow-lg">
              <CheckCircle2 size={24} className="text-gold" />
            </div>
            <div className="flex-1">
               <div className="flex justify-between items-start">
                  <p className="text-base font-bold text-silver tracking-tight">Mandat de Gestion Électronique</p>
                  <Badge variant="gold">Actif</Badge>
               </div>
               <p className="text-xs text-slate-500 mt-2 font-light leading-relaxed">
                 Votre mandat de représentation et de gestion avec le cabinet comptable est signé et conforme aux exigences de Revenu Québec.
               </p>
               <Button variant="ghost" className="mt-4 text-[10px] font-bold uppercase tracking-widest gap-2 h-10 border-white/15 text-slate-400 hover:text-gold" onClick={onSignMandate}>
                 Voir le Mandat Signé <ArrowUpRight size={14}/>
               </Button>
            </div>
          </Card>
        </div>

        {/* Colonne Droite: Invoices / Règlements */}
        <div className="lg:col-span-5 space-y-8">
          <Card className="p-0 overflow-hidden glass-card h-full flex flex-col">
            <div className="p-6 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
               <h3 className="text-xs font-black text-silver uppercase tracking-[0.3em]">Facturation & Interac</h3>
            </div>
            <div className="flex-1 divide-y divide-white/5 overflow-y-auto max-h-[450px]">
              {pendingInvoices.length === 0 ? (
                <div className="p-12 text-center text-slate-500 italic space-y-3">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto border border-green-500/20 text-green-400">
                    <Check size={20} />
                  </div>
                  <p className="text-sm font-bold">Votre dossier est à jour</p>
                  <p className="text-[10px] text-slate-600 uppercase tracking-widest">Aucun règlement en attente</p>
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
                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center text-[10px] text-amber-500 uppercase font-black tracking-wider">
                        ⏳ Paiement en cours de validation par votre CPA
                      </div>
                    ) : (
                      <div className="space-y-3 bg-white/[0.02] border border-white/5 p-4 rounded-xl">
                        <div className="text-[10px] space-y-1.5 text-slate-400 font-medium">
                          <div className="flex justify-between">
                            <span>Destinataire Interac :</span>
                            <span className="text-ivoire font-bold">{cpaInfo?.interac_email || cpaInfo?.email || 'virement@compta-flow.net'}</span>
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
                          Déclarer payée après virement
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
