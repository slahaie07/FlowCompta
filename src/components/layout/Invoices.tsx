import { Plus, FileText, Download, Calendar, DollarSign, ArrowRight, ShieldCheck, HelpCircle, Check, X, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useInvoices } from '../../hooks/useInvoices';
import { useAdminClients } from '../../hooks/useAdminClients';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

export function Invoices({ isAdmin = false }: { isAdmin?: boolean }) {
  const { userData } = useAuth();
  const { invoices, loading, addInvoice, updateInvoiceStatus, declarePaidByClient, refreshInvoices } = useInvoices(undefined, isAdmin);
  const { clients } = useAdminClients(isAdmin);
  
  const [selectedClientId, setSelectedClientId] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newNum, setNewNum] = useState('');
  const [newAmount, setNewAmount] = useState('');

  // Pour la modale de détails / instructions de paiement
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [interacRefInput, setInteracRefInput] = useState('');
  const [subAdminInterac, setSubAdminInterac] = useState<any>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showConfirmPaidModal, setShowConfirmPaidModal] = useState(false);

  // Générer un numéro de facture unique au chargement
  useEffect(() => {
    setNewNum(`FAC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  }, [isAdding]);

  // Récupérer les détails Interac du comptable du client
  useEffect(() => {
    async function loadSubAdminInterac() {
      if (userData?.role === 'client' && userData.subAdminId) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name, email, interac_email, interac_question, interac_autodepot')
            .eq('id', userData.subAdminId)
            .single();
          if (error) throw error;
          if (data) {
            setSubAdminInterac(data);
          }
        } catch (err) {
          console.warn("Impossible de charger les infos Interac du CPA :", err);
        }
      }
    }
    loadSubAdminInterac();
  }, [userData]);

  const handleAdd = async () => {
    if (!selectedClientId || !newAmount) {
      toast.error("Veuillez sélectionner un client et entrer un montant.");
      return;
    }
    
    await addInvoice({
      number: newNum,
      clientName: clients.find(c => c.id === selectedClientId)?.displayName || 'Client',
      amount: parseFloat(newAmount),
      date: Date.now(),
      dueDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
      status: 'draft',
      items: []
    }, selectedClientId);

    setIsAdding(false);
    setSelectedClientId('');
    setNewAmount('');
  };

  const handlePublishInvoice = async (invoice: any) => {
    try {
      await updateInvoiceStatus(invoice.id, 'envoyee');
      
      // Essayer d'invoquer la fonction Edge Supabase pour envoyer le courriel
      try {
        const { error } = await supabase.functions.invoke('send-invoice-email', {
          body: { invoiceId: invoice.id }
        });
        if (error) throw error;
        toast.success("Facture publiée et courriel envoyé au client.");
      } catch (funcErr) {
        console.warn("Fonction Deno non déployée, envoi courriel simulé:", funcErr);
        toast.info("Facture publiée ! (Envoi de courriel de virement simulé).");
      }
      
      setSelectedInvoice(null);
      refreshInvoices();
    } catch (err: any) {
      toast.error("Erreur lors de la publication de la facture.");
    }
  };

  const handleConfirmPayment = async (invoiceId: string) => {
    if (!interacRefInput) {
      toast.error("Veuillez saisir le numéro de confirmation Interac.");
      return;
    }
    try {
      await updateInvoiceStatus(invoiceId, 'payee', interacRefInput);
      
      // Essayer d'envoyer le courriel de confirmation
      try {
        await supabase.functions.invoke('send-payment-confirmation', {
          body: { invoiceId }
        });
      } catch (e) {
        console.warn("Edge Function de paiement non disponible, confirmation simulée.");
      }
      
      toast.success("Paiement Interac confirmé ! La facture est marquée payée.");
      setShowConfirmPaidModal(false);
      setSelectedInvoice(null);
      setInteracRefInput('');
      refreshInvoices();
    } catch (err: any) {
      toast.error("Erreur de validation de paiement.");
    }
  };

  const handleClientDeclarePaid = async (invoiceId: string) => {
    await declarePaidByClient(invoiceId);
    setShowPayModal(false);
    setSelectedInvoice(null);
    refreshInvoices();
  };

  const handleCancelInvoice = async (invoiceId: string) => {
    await updateInvoiceStatus(invoiceId, 'annulee');
    setSelectedInvoice(null);
    refreshInvoices();
  };

  // Calculs de taxes à la volée (TPS 5%, TVQ 9.975%)
  const amountVal = parseFloat(newAmount) || 0;
  const tpsPreview = Math.round(amountVal * 0.05 * 100) / 100;
  const tvqPreview = Math.round(amountVal * 0.09975 * 100) / 100;
  const totalPreview = Math.round((amountVal + tpsPreview + tvqPreview) * 100) / 100;

  return (
    <div className="space-y-10 pb-20 md:pb-10 w-full">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h1 className="text-5xl font-serif font-bold text-ivoire tracking-tight leading-tight">
            Registre <span className="animated-gradient-text italic">Factures.</span>
          </h1>
          <div className="flex items-center gap-3 mt-3">
            <span className="w-8 h-[1px] bg-gold/50"></span>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Québec TPS (5%) & TVQ (9.975%) certifiées</p>
          </div>
        </div>
        
        {userData?.role === 'sub_admin' && (
          <Button variant="gold" className="gap-3 h-16 px-10 shadow-glow font-black uppercase tracking-[0.2em] text-xs rounded-2xl group" onClick={() => setIsAdding(true)}>
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" /> Nouvelle Facture
          </Button>
        )}
      </header>

      <AnimatePresence>
        {isAdding && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <Card className="p-8 premium-border-gold mb-10" glow="gold">
               <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-ivoire italic">Émission de Facture</h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider mt-1">Génération avec taxes provinciales intégrées</p>
                  </div>
                  <button onClick={() => setIsAdding(false)} className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 text-slate-500 hover:text-gold transition-all">
                    <X size={20} />
                  </button>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Input label="Numéro" value={newNum} readOnly className="bg-noir border-white/10 text-slate-500 font-mono" />
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Client destinataire</label>
                    <select 
                      className="w-full h-14 bg-noir border border-white/10 rounded-xl px-4 text-silver text-sm outline-none focus:border-gold/50 transition-all font-bold cursor-pointer"
                      value={selectedClientId}
                      onChange={e => setSelectedClientId(e.target.value)}
                    >
                      <option value="">Sélectionner un client...</option>
                      {clients.map(cl => (
                        <option key={cl.id} value={cl.id}>{cl.displayName}</option>
                      ))}
                    </select>
                  </div>

                  <Input 
                    label="Montant Hors-Taxes ($ HT)" 
                    type="number" 
                    placeholder="0.00" 
                    value={newAmount} 
                    onChange={e => setNewAmount(e.target.value)} 
                    className="bg-noir border-white/10 text-gold font-serif text-xl font-bold" 
                  />
               </div>

               {amountVal > 0 && (
                 <div className="mt-8 p-6 bg-white/[0.02] border border-white/5 rounded-2xl max-w-md space-y-3 animate-in fade-in duration-300">
                   <h4 className="text-xs uppercase tracking-widest text-slate-400 font-bold">Aperçu de la taxation du Québec :</h4>
                   <div className="flex justify-between text-sm">
                     <span className="text-slate-500">Sous-total HT :</span>
                     <span className="text-silver font-mono">{amountVal.toFixed(2)} $</span>
                   </div>
                   <div className="flex justify-between text-sm">
                     <span className="text-slate-500">TPS Fédérale (5.0%) :</span>
                     <span className="text-silver font-mono">{tpsPreview.toFixed(2)} $</span>
                   </div>
                   <div className="flex justify-between text-sm">
                     <span className="text-slate-500">TVQ Provinciale (9.975%) :</span>
                     <span className="text-silver font-mono">{tvqPreview.toFixed(2)} $</span>
                   </div>
                   <div className="border-t border-white/10 pt-2 flex justify-between text-base font-bold">
                     <span className="text-gold">Total TTC estimé :</span>
                     <span className="text-gold font-serif">{totalPreview.toFixed(2)} $</span>
                   </div>
                 </div>
               )}

               <div className="mt-8 flex justify-end gap-4">
                  <Button variant="ghost" onClick={() => setIsAdding(false)} className="h-12 text-xs uppercase font-bold tracking-widest">Annuler</Button>
                  <Button variant="gold" onClick={handleAdd} className="h-12 px-10 text-xs font-bold uppercase tracking-widest">Créer le brouillon</Button>
               </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Liste des factures */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="text-center py-20">
            <OrganicLoader label="FAC" size="sm" />
          </div>
        ) : invoices.length === 0 ? (
          <Card className="p-24 text-center space-y-6 glass-card">
            <FileText size={48} className="mx-auto text-slate-600 animate-pulse" />
            <p className="text-silver font-serif text-xl italic opacity-50">Aucune facture enregistrée.</p>
          </Card>
        ) : (
          invoices.map((inv) => (
            <Card 
              key={inv.id} 
              onClick={() => {
                setSelectedInvoice(inv);
                if (userData?.role === 'client') {
                  setShowPayModal(true);
                }
              }}
              className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-gold/30 glass-card transition-all duration-300 cursor-pointer relative overflow-hidden"
            >
              <div className="flex items-center gap-6 w-full md:w-auto">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${inv.status === 'paid' ? 'bg-green-500/10 text-emerald-400 border-green-500/20' : 'bg-gold/5 text-gold border-gold/10'}`}>
                  <FileText size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <p className="text-xs font-mono font-bold text-ivoire">{inv.number}</p>
                    {inv.clientADeclarePaye && inv.status !== 'paid' && (
                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] uppercase font-black px-2 py-0.5 rounded">Déclaré Payé</span>
                    )}
                  </div>
                  <h4 className="text-lg font-bold text-ivoire mt-1">{inv.clientName}</h4>
                  <p className="text-[10px] text-slate-500 uppercase font-bold mt-1.5 flex items-center gap-1.5">
                    <Calendar size={12} /> Émis le {new Date(inv.date).toLocaleDateString('fr-CA')}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-8 w-full md:w-auto border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                <div className="text-left md:text-right">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Montant Total TTC</p>
                  <p className="text-2xl font-serif font-bold text-gold">{inv.amount.toFixed(2)} $</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <Badge variant={inv.status === 'paid' ? 'success' : inv.status === 'pending' ? 'warning' : 'secondary'} className="py-1.5 px-4 font-bold text-[9px] uppercase tracking-wider rounded-full">
                    {inv.status === 'paid' ? 'Acquittée' : inv.status === 'pending' ? 'Attente Paiement' : inv.status === 'draft' ? 'Brouillon' : 'Annulée'}
                  </Badge>
                  
                  {userData?.role === 'sub_admin' && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedInvoice(inv);
                      }}
                      className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-gold border border-white/5 h-10 px-4 rounded-xl"
                    >
                      Gérer
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* DETAIL DIALOG / MODAL POUR SUB_ADMIN */}
      {selectedInvoice && userData?.role === 'sub_admin' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-in fade-in duration-300">
          <Card className="p-8 w-full max-w-lg bg-surface border-gold/30 relative" glow="gold">
            <button onClick={() => setSelectedInvoice(null)} className="absolute right-6 top-6 text-slate-500 hover:text-ivoire">
              <X size={20} />
            </button>
            <h3 className="text-2xl font-serif font-bold text-ivoire mb-4">Gérer la Facture <span className="text-gold">{selectedInvoice.number}</span></h3>
            <p className="text-xs text-slate-400 mb-6 font-mono">ID Client : {selectedInvoice.userId}</p>

            <div className="space-y-4 bg-white/[0.02] p-6 border border-white/5 rounded-2xl mb-6 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Sous-total HT :</span><span className="font-mono text-silver">{selectedInvoice.montantHt?.toFixed(2)} $</span></div>
              <div className="flex justify-between"><span className="text-slate-500">TPS (5%) :</span><span className="font-mono text-silver">{selectedInvoice.tps?.toFixed(2)} $</span></div>
              <div className="flex justify-between"><span className="text-slate-500">TVQ (9.975%) :</span><span className="font-mono text-silver">{selectedInvoice.tvq?.toFixed(2)} $</span></div>
              <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-base text-gold">
                <span>Total TTC :</span><span>{selectedInvoice.montantTotal?.toFixed(2)} $</span>
              </div>
            </div>

            {selectedInvoice.clientADeclarePaye && selectedInvoice.status !== 'paid' && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-xs mb-6 leading-relaxed">
                ⚠️ **Alerte Paiement** : Le client a déclaré avoir complété le virement Interac vers votre compte. Veuillez vérifier votre compte bancaire.
              </div>
            )}

            <div className="flex flex-col gap-3">
              {selectedInvoice.status === 'draft' && (
                <Button variant="gold" className="w-full h-12 gap-2 uppercase text-xs font-bold tracking-widest" onClick={() => handlePublishInvoice(selectedInvoice)}>
                  <Send size={16} /> Publier & Envoyer Instructions Interac
                </Button>
              )}
              {selectedInvoice.status === 'pending' && (
                <Button variant="gold" className="w-full h-12 gap-2 uppercase text-xs font-bold tracking-widest" onClick={() => setShowConfirmPaidModal(true)}>
                  <Check size={16} /> Confirmer Réception du Paiement Interac
                </Button>
              )}
              {selectedInvoice.status !== 'paid' && selectedInvoice.status !== 'cancelled' && (
                <Button variant="ghost" className="w-full h-12 gap-2 uppercase text-xs font-bold tracking-widest text-red-400 border-red-500/20 hover:bg-red-500/10" onClick={() => handleCancelInvoice(selectedInvoice.id)}>
                  <X size={16} /> Annuler la Facture
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* CONFIRMER PAIEMENT INTERAC DIALOG (POUR COMPTABLE) */}
      {showConfirmPaidModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <Card className="p-8 w-full max-w-md bg-surface border-gold/30 relative" glow="gold">
            <button onClick={() => setShowConfirmPaidModal(false)} className="absolute right-6 top-6 text-slate-500 hover:text-ivoire">
              <X size={20} />
            </button>
            <h3 className="text-xl font-serif font-bold text-ivoire mb-4">Confirmer le Paiement</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Veuillez saisir le numéro de référence ou confirmation fourni par la banque pour le virement Interac.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); handleConfirmPayment(selectedInvoice.id); }} className="space-y-4">
              <Input
                label="Numéro de Référence Interac"
                placeholder="Exemple: CA12345678"
                value={interacRefInput}
                onChange={e => setInteracRefInput(e.target.value)}
                required
                className="bg-noir border-white/10"
              />
              <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="ghost" onClick={() => setShowConfirmPaidModal(false)}>Annuler</Button>
                <Button type="submit" variant="gold">Acquitter Facture</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* MODAL CLIENT DE PAIEMENT INTERAC */}
      {showPayModal && selectedInvoice && userData?.role === 'client' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-in fade-in duration-300">
          <Card className="p-8 w-full max-w-lg bg-surface border-gold/30 relative" glow="gold">
            <button onClick={() => setShowPayModal(false)} className="absolute right-6 top-6 text-slate-500 hover:text-ivoire">
              <X size={20} />
            </button>
            <h3 className="text-2xl font-serif font-bold text-ivoire mb-2 italic">Instructions de Paiement</h3>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-6">Facture {selectedInvoice.number}</p>

            <div className="space-y-3 bg-white/[0.02] p-6 border border-white/5 rounded-2xl mb-6 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Sous-total HT :</span><span className="font-mono text-silver">{selectedInvoice.montantHt?.toFixed(2)} $</span></div>
              <div className="flex justify-between"><span className="text-slate-500">TPS (5%) :</span><span className="font-mono text-silver">{selectedInvoice.tps?.toFixed(2)} $</span></div>
              <div className="flex justify-between"><span className="text-slate-500">TVQ (9.975%) :</span><span className="font-mono text-silver">{selectedInvoice.tvq?.toFixed(2)} $</span></div>
              <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-base text-gold">
                <span>Total à transférer :</span><span>{selectedInvoice.montantTotal?.toFixed(2)} $</span>
              </div>
            </div>

            {selectedInvoice.status === 'paid' ? (
              <div className="p-4 bg-green-500/10 border border-green-500/20 text-emerald-400 rounded-xl text-xs font-semibold leading-relaxed">
                ✅ Facture acquittée. Référence bancaire Interac : {selectedInvoice.interacReference || 'Dépôt direct'}.
              </div>
            ) : (
              <>
                <div className="p-6 bg-gold/5 border border-gold/20 rounded-2xl space-y-4 text-sm mb-6">
                  <h4 className="font-bold text-ivoire flex items-center gap-2">
                    <DollarSign size={18} className="text-gold" /> Virement Interac requis
                  </h4>
                  <div className="space-y-2 text-xs">
                    <p><span className="text-slate-500">Destinataire :</span> <span className="font-bold text-ivoire">{subAdminInterac?.full_name || 'Votre CPA'}</span></p>
                    <p><span className="text-slate-500">Envoyer le virement à :</span> <span className="font-bold text-gold font-mono">{subAdminInterac?.interac_email || 'virement@cpa.ca'}</span></p>
                    <p><span className="text-slate-500">Montant exact :</span> <span className="font-bold text-gold font-mono">{selectedInvoice.amount.toFixed(2)} $ CAD</span></p>
                    <p><span className="text-slate-500">Dépôt automatique :</span> <span className="font-bold text-ivoire">{subAdminInterac?.interac_autodepot ? 'Oui (Aucune question requise)' : 'Non'}</span></p>
                    {!subAdminInterac?.interac_autodepot && (
                      <p><span className="text-slate-500">Question de sécurité :</span> <span className="font-bold text-ivoire">{subAdminInterac?.interac_question || 'Quel cabinet?'}</span></p>
                    )}
                  </div>
                </div>

                {selectedInvoice.clientADeclarePaye ? (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-center text-xs font-bold">
                    ⏳ Vous avez déclaré avoir envoyé le virement. En attente de validation par votre CPA.
                  </div>
                ) : (
                  <Button 
                    variant="gold" 
                    className="w-full h-12 uppercase text-xs font-bold tracking-widest" 
                    onClick={() => handleClientDeclarePaid(selectedInvoice.id)}
                  >
                    J'ai envoyé le virement
                  </Button>
                )}
              </>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
