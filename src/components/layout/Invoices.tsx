import { Plus, FileText, Calendar, DollarSign, Check, X, Send, Printer, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useInvoices } from '../../hooks/useInvoices';
import { useAdminClients } from '../../hooks/useAdminClients';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { OrganicLoader } from '../ui/OrganicLoader';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

// ─── Impression PDF native ────────────────────────────────────────────────────
function printInvoice(invoice: any, subAdminInterac: any) {
  const win = window.open('', '_blank');
  if (!win) {
    toast.error("Veuillez autoriser les fenêtres contextuelles pour imprimer.");
    return;
  }
  const dateEmission = new Date(invoice.date).toLocaleDateString('fr-CA');
  const dateEcheance = invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('fr-CA') : '—';
  const statusLabel =
    invoice.status === 'paid' ? 'ACQUITTÉE' :
    invoice.status === 'pending' ? 'EN ATTENTE' :
    invoice.status === 'draft' ? 'BROUILLON' : 'ANNULÉE';

  win.document.write(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <title>Facture ${invoice.number}</title>
  <style>
    @page { size: A4; margin: 20mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Georgia', serif; color: #111; background: #fff; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; border-bottom: 2px solid #C6A15B; margin-bottom: 32px; }
    .brand { font-size: 28px; font-weight: bold; color: #C6A15B; letter-spacing: 2px; }
    .brand-sub { font-size: 9px; letter-spacing: 4px; color: #888; font-family: Arial, sans-serif; margin-top: 4px; }
    .invoice-meta { text-align: right; }
    .invoice-num { font-size: 22px; font-weight: bold; color: #111; font-family: 'Courier New', monospace; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 9px; letter-spacing: 2px; font-family: Arial, sans-serif; font-weight: bold; margin-top: 6px;
      background: ${invoice.status === 'paid' ? '#d1fae5' : invoice.status === 'pending' ? '#fef3c7' : '#f3f4f6'};
      color: ${invoice.status === 'paid' ? '#065f46' : invoice.status === 'pending' ? '#92400e' : '#374151'};
    }
    .section-title { font-size: 9px; letter-spacing: 3px; color: #888; font-family: Arial, sans-serif; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; }
    .client-section { display: flex; justify-content: space-between; margin-bottom: 32px; }
    .client-block { min-width: 180px; }
    .client-name { font-size: 16px; font-weight: bold; color: #111; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th { background: #faf7f0; padding: 10px 16px; text-align: left; font-size: 9px; letter-spacing: 2px; color: #888; font-family: Arial, sans-serif; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #eee; }
    td { padding: 12px 16px; font-size: 13px; border-bottom: 1px solid #f5f5f5; }
    td:last-child, th:last-child { text-align: right; }
    .totals { max-width: 320px; margin-left: auto; }
    .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #555; font-family: Arial, sans-serif; }
    .total-final { display: flex; justify-content: space-between; padding: 10px 0; font-size: 18px; font-weight: bold; color: #111; border-top: 2px solid #C6A15B; margin-top: 4px; }
    .total-final span:last-child { color: #C6A15B; }
    .interac-box { background: #faf7f0; border: 1px solid #C6A15B55; border-radius: 8px; padding: 20px; margin-top: 32px; }
    .interac-title { font-size: 11px; font-weight: bold; letter-spacing: 2px; color: #C6A15B; font-family: Arial, sans-serif; text-transform: uppercase; margin-bottom: 12px; }
    .interac-row { font-size: 12px; font-family: Arial, sans-serif; color: #444; margin-bottom: 6px; }
    .interac-row strong { color: #111; }
    .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #eee; font-size: 10px; color: #aaa; font-family: Arial, sans-serif; text-align: center; }
    .ref-box { background: #f0fdf4; border: 1px solid #86efac; border-radius: 6px; padding: 12px 16px; margin-top: 16px; font-family: Arial, sans-serif; font-size: 11px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">ComptaFlow</div>
      <div class="brand-sub">PLATEFORME COMPTABLE CERTIFIÉE QUÉBEC</div>
    </div>
    <div class="invoice-meta">
      <div class="invoice-num">${invoice.number}</div>
      <div><span class="badge">${statusLabel}</span></div>
      <div style="font-size:11px;color:#888;font-family:Arial,sans-serif;margin-top:8px;">
        Émise le ${dateEmission}<br/>Échéance : ${dateEcheance}
      </div>
    </div>
  </div>

  <div class="client-section">
    <div class="client-block">
      <div class="section-title">Facturé à</div>
      <div class="client-name">${invoice.clientName}</div>
    </div>
    ${subAdminInterac?.full_name ? `<div class="client-block" style="text-align:right">
      <div class="section-title">Émis par</div>
      <div class="client-name">${subAdminInterac.full_name}</div>
      ${subAdminInterac.interac_email ? `<div style="font-size:12px;color:#888;font-family:Arial,sans-serif;margin-top:4px;">${subAdminInterac.interac_email}</div>` : ''}
    </div>` : ''}
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Montant</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Services comptables professionnels</td>
        <td>${(invoice.montantHt ?? invoice.amount).toFixed(2)} $</td>
      </tr>
    </tbody>
  </table>

  <div class="totals">
    <div class="total-row"><span>Sous-total HT</span><span>${(invoice.montantHt ?? 0).toFixed(2)} $</span></div>
    <div class="total-row"><span>TPS fédérale (5%)</span><span>${(invoice.tps ?? 0).toFixed(2)} $</span></div>
    <div class="total-row"><span>TVQ provinciale (9.975%)</span><span>${(invoice.tvq ?? 0).toFixed(2)} $</span></div>
    <div class="total-final"><span>Total TTC</span><span>${(invoice.montantTotal ?? invoice.amount).toFixed(2)} $</span></div>
  </div>

  ${invoice.status !== 'paid' && subAdminInterac?.interac_email ? `
  <div class="interac-box">
    <div class="interac-title">Instructions de paiement — Virement Interac</div>
    <div class="interac-row"><strong>Destinataire :</strong> ${subAdminInterac.full_name || 'Votre comptable'}</div>
    <div class="interac-row"><strong>Adresse de virement :</strong> ${subAdminInterac.interac_email}</div>
    <div class="interac-row"><strong>Montant exact :</strong> ${(invoice.montantTotal ?? invoice.amount).toFixed(2)} $ CAD</div>
    <div class="interac-row"><strong>Dépôt automatique :</strong> ${subAdminInterac.interac_autodepot ? 'Oui (aucune question requise)' : 'Non'}</div>
    ${!subAdminInterac.interac_autodepot && subAdminInterac.interac_question ? `<div class="interac-row"><strong>Question de sécurité :</strong> ${subAdminInterac.interac_question}</div>` : ''}
  </div>` : ''}

  ${invoice.status === 'paid' ? `
  <div class="ref-box">
    ✅ Facture acquittée — Référence Interac : <strong>${invoice.interacReference || 'Dépôt direct'}</strong>
    ${invoice.datePaiement ? ` — Payée le ${new Date(invoice.datePaiement).toLocaleDateString('fr-CA')}` : ''}
  </div>` : ''}

  <div class="footer">ComptaFlow — compta-flow.net — TPS/TVQ conformes Revenu Québec</div>
  <script>window.onload=()=>{window.print();}</script>
</body>
</html>`);
  win.document.close();
}

// ─── Validation référence Interac ─────────────────────────────────────────────
function validateInteracRef(ref: string): boolean {
  return ref.trim().length >= 6;
}

// ─── Composant principal ──────────────────────────────────────────────────────
export function Invoices({ isAdmin = false }: { isAdmin?: boolean }) {
  const { userData } = useAuth();
  const { invoices, loading, addInvoice, updateInvoiceStatus, declarePaidByClient, refreshInvoices } = useInvoices(undefined, isAdmin);
  const { clients } = useAdminClients(isAdmin);

  const [selectedClientId, setSelectedClientId] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newNum, setNewNum] = useState('');
  const [newAmount, setNewAmount] = useState('');

  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [interacRefInput, setInteracRefInput] = useState('');
  const [subAdminInterac, setSubAdminInterac] = useState<any>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showConfirmPaidModal, setShowConfirmPaidModal] = useState(false);
  const [refError, setRefError] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    setNewNum(`FAC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  }, [isAdding]);

  // Charger les infos Interac du comptable (pour client) ou du sub_admin sélectionné (pour modal admin)
  useEffect(() => {
    async function loadSubAdminInterac() {
      const targetId = userData?.role === 'client'
        ? userData.subAdminId
        : selectedInvoice?.subAdminId;

      if (!targetId) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, email, interac_email, interac_question, interac_autodepot')
          .eq('id', targetId)
          .single();
        if (!error && data) setSubAdminInterac(data);
      } catch {
        // silencieux
      }
    }
    loadSubAdminInterac();
  }, [userData, selectedInvoice]);

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
    setPublishing(true);
    try {
      await updateInvoiceStatus(invoice.id, 'envoyee');
      try {
        const { error } = await supabase.functions.invoke('send-invoice-email', {
          body: { invoiceId: invoice.id }
        });
        if (error) throw error;
        toast.success("Facture publiée — courriel Interac envoyé au client.");
      } catch {
        toast.info("Facture publiée. (Courriel non envoyé — configurez RESEND_API_KEY)");
      }
      setSelectedInvoice(null);
      refreshInvoices();
    } catch {
      toast.error("Erreur lors de la publication de la facture.");
    } finally {
      setPublishing(false);
    }
  };

  const handleConfirmPayment = async (invoiceId: string) => {
    setRefError('');
    if (!interacRefInput.trim()) {
      setRefError("Veuillez saisir le numéro de référence Interac.");
      return;
    }
    if (!validateInteracRef(interacRefInput)) {
      setRefError("La référence doit contenir au moins 6 caractères.");
      return;
    }
    setConfirming(true);
    try {
      await updateInvoiceStatus(invoiceId, 'payee', interacRefInput.trim());
      try {
        await supabase.functions.invoke('send-payment-confirmation', {
          body: { invoiceId }
        });
      } catch {
        console.warn("Courriel de confirmation non envoyé.");
      }
      toast.success("Paiement Interac confirmé — facture acquittée.");
      setShowConfirmPaidModal(false);
      setSelectedInvoice(null);
      setInteracRefInput('');
      refreshInvoices();
    } catch {
      toast.error("Erreur de validation du paiement.");
    } finally {
      setConfirming(false);
    }
  };

  const handleClientDeclarePaid = async (invoiceId: string) => {
    await declarePaidByClient(invoiceId);
    setShowPayModal(false);
    setSelectedInvoice(null);
  };

  const handleCancelInvoice = async (invoiceId: string) => {
    await updateInvoiceStatus(invoiceId, 'annulee');
    setSelectedInvoice(null);
    refreshInvoices();
  };

  // Calculs taxes à la volée
  const amountVal = parseFloat(newAmount) || 0;
  const tpsPreview = Math.round(amountVal * 0.05 * 100) / 100;
  const tvqPreview = Math.round(amountVal * 0.09975 * 100) / 100;
  const totalPreview = Math.round((amountVal + tpsPreview + tvqPreview) * 100) / 100;

  // Compter les alertes "déclaré payé" pour le sous-admin
  const pendingDeclarations = invoices.filter(i => i.clientADeclarePaye && i.status === 'pending').length;

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
          <div className="flex items-center gap-4">
            {pendingDeclarations > 0 && (
              <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-2 rounded-xl text-xs font-bold animate-pulse">
                <AlertTriangle size={14} />
                {pendingDeclarations} virement{pendingDeclarations > 1 ? 's' : ''} à valider
              </div>
            )}
            <Button variant="gold" className="gap-3 h-16 px-10 shadow-glow font-black uppercase tracking-[0.2em] text-xs rounded-2xl group" onClick={() => setIsAdding(true)}>
              <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" /> Nouvelle Facture
            </Button>
          </div>
        )}
      </header>

      {/* Formulaire nouvelle facture */}
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
                  <h4 className="text-xs uppercase tracking-widest text-slate-400 font-bold">Aperçu taxation Québec :</h4>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Sous-total HT :</span><span className="text-silver font-mono">{amountVal.toFixed(2)} $</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">TPS Fédérale (5.0%) :</span><span className="text-silver font-mono">{tpsPreview.toFixed(2)} $</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">TVQ Provinciale (9.975%) :</span><span className="text-silver font-mono">{tvqPreview.toFixed(2)} $</span></div>
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
          <div className="text-center py-20"><OrganicLoader label="FAC" size="sm" /></div>
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
                if (userData?.role === 'client') setShowPayModal(true);
              }}
              className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-gold/30 glass-card transition-all duration-300 cursor-pointer relative overflow-hidden"
            >
              <div className="flex items-center gap-6 w-full md:w-auto">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${inv.status === 'paid' ? 'bg-green-500/10 text-emerald-400 border-green-500/20' : 'bg-gold/5 text-gold border-gold/10'}`}>
                  <FileText size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-xs font-mono font-bold text-ivoire">{inv.number}</p>
                    {inv.clientADeclarePaye && inv.status === 'pending' && (
                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] uppercase font-black px-2 py-0.5 rounded flex items-center gap-1">
                        <AlertTriangle size={10} /> Virement déclaré
                      </span>
                    )}
                  </div>
                  <h4 className="text-lg font-bold text-ivoire mt-1">{inv.clientName}</h4>
                  <p className="text-[10px] text-slate-500 uppercase font-bold mt-1.5 flex items-center gap-1.5">
                    <Calendar size={12} /> Émis le {new Date(inv.date).toLocaleDateString('fr-CA')}
                    {inv.datePaiement && (
                      <span className="text-emerald-500 ml-3">· Payée le {new Date(inv.datePaiement).toLocaleDateString('fr-CA')}</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-8 w-full md:w-auto border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                <div className="text-left md:text-right">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Montant Total TTC</p>
                  <p className="text-2xl font-serif font-bold text-gold">{(inv.montantTotal ?? inv.amount).toFixed(2)} $</p>
                </div>

                <div className="flex items-center gap-4">
                  <Badge variant={inv.status === 'paid' ? 'success' : inv.status === 'pending' ? 'warning' : 'secondary'} className="py-1.5 px-4 font-bold text-[9px] uppercase tracking-wider rounded-full">
                    {inv.status === 'paid' ? 'Acquittée' : inv.status === 'pending' ? 'En attente' : inv.status === 'draft' ? 'Brouillon' : 'Annulée'}
                  </Badge>

                  {userData?.role === 'sub_admin' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); setSelectedInvoice(inv); }}
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

      {/* ── MODAL GESTION SUB_ADMIN ── */}
      {selectedInvoice && userData?.role === 'sub_admin' && !showConfirmPaidModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-in fade-in duration-300">
          <Card className="p-8 w-full max-w-lg bg-surface border-gold/30 relative" glow="gold">
            <button onClick={() => setSelectedInvoice(null)} className="absolute right-6 top-6 text-slate-500 hover:text-ivoire">
              <X size={20} />
            </button>
            <h3 className="text-2xl font-serif font-bold text-ivoire mb-1">Facture <span className="text-gold">{selectedInvoice.number}</span></h3>
            <p className="text-xs text-slate-500 mb-6 font-mono">Client : {selectedInvoice.clientName}</p>

            <div className="space-y-3 bg-white/[0.02] p-6 border border-white/5 rounded-2xl mb-6 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Sous-total HT :</span><span className="font-mono text-silver">{(selectedInvoice.montantHt ?? 0).toFixed(2)} $</span></div>
              <div className="flex justify-between"><span className="text-slate-500">TPS (5%) :</span><span className="font-mono text-silver">{(selectedInvoice.tps ?? 0).toFixed(2)} $</span></div>
              <div className="flex justify-between"><span className="text-slate-500">TVQ (9.975%) :</span><span className="font-mono text-silver">{(selectedInvoice.tvq ?? 0).toFixed(2)} $</span></div>
              <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-base text-gold">
                <span>Total TTC :</span><span>{(selectedInvoice.montantTotal ?? selectedInvoice.amount).toFixed(2)} $</span>
              </div>
              {selectedInvoice.interacReference && (
                <div className="flex justify-between text-xs"><span className="text-slate-500">Référence Interac :</span><span className="font-mono text-emerald-400">{selectedInvoice.interacReference}</span></div>
              )}
            </div>

            {selectedInvoice.clientADeclarePaye && selectedInvoice.status === 'pending' && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl text-xs mb-6 leading-relaxed flex items-start gap-2">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <span><strong>Alerte :</strong> Le client a déclaré avoir envoyé le virement Interac. Vérifiez votre compte bancaire puis confirmez ci-dessous.</span>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {/* Imprimer PDF toujours disponible */}
              <Button
                variant="ghost"
                className="w-full h-12 gap-2 uppercase text-xs font-bold tracking-widest border-white/10 hover:border-gold/30"
                onClick={() => printInvoice(selectedInvoice, subAdminInterac)}
              >
                <Printer size={16} /> Imprimer / Télécharger PDF
              </Button>

              {selectedInvoice.status === 'draft' && (
                <Button
                  variant="gold"
                  className="w-full h-12 gap-2 uppercase text-xs font-bold tracking-widest"
                  onClick={() => handlePublishInvoice(selectedInvoice)}
                  isLoading={publishing}
                >
                  <Send size={16} /> Publier & Envoyer Instructions Interac
                </Button>
              )}
              {selectedInvoice.status === 'pending' && (
                <Button
                  variant="gold"
                  className="w-full h-12 gap-2 uppercase text-xs font-bold tracking-widest"
                  onClick={() => setShowConfirmPaidModal(true)}
                >
                  <Check size={16} /> Confirmer Réception du Virement
                </Button>
              )}
              {selectedInvoice.status !== 'paid' && selectedInvoice.status !== 'cancelled' && selectedInvoice.status !== 'annulee' && (
                <Button
                  variant="ghost"
                  className="w-full h-12 gap-2 uppercase text-xs font-bold tracking-widest text-red-400 border-red-500/20 hover:bg-red-500/10"
                  onClick={() => handleCancelInvoice(selectedInvoice.id)}
                >
                  <X size={16} /> Annuler la Facture
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* ── MODAL CONFIRMATION PAIEMENT (COMPTABLE) ── */}
      {showConfirmPaidModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <Card className="p-8 w-full max-w-md bg-surface border-gold/30 relative" glow="gold">
            <button onClick={() => { setShowConfirmPaidModal(false); setRefError(''); }} className="absolute right-6 top-6 text-slate-500 hover:text-ivoire">
              <X size={20} />
            </button>
            <h3 className="text-xl font-serif font-bold text-ivoire mb-2">Confirmer le Paiement</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Saisissez le numéro de référence ou de confirmation fourni par votre institution bancaire pour le virement Interac reçu.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); handleConfirmPayment(selectedInvoice.id); }} className="space-y-4">
              <div>
                <Input
                  label="Numéro de Référence Interac"
                  placeholder="Ex : CA12345678 ou DEP-20240615"
                  value={interacRefInput}
                  onChange={e => { setInteracRefInput(e.target.value); setRefError(''); }}
                  className="bg-noir border-white/10"
                />
                {refError && <p className="text-red-400 text-xs mt-1">{refError}</p>}
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="ghost" onClick={() => { setShowConfirmPaidModal(false); setRefError(''); }}>Annuler</Button>
                <Button type="submit" variant="gold" isLoading={confirming}>Acquitter Facture</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* ── MODAL PAIEMENT CLIENT ── */}
      {showPayModal && selectedInvoice && userData?.role === 'client' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-in fade-in duration-300">
          <Card className="p-8 w-full max-w-lg bg-surface border-gold/30 relative" glow="gold">
            <button onClick={() => { setShowPayModal(false); setSelectedInvoice(null); }} className="absolute right-6 top-6 text-slate-500 hover:text-ivoire">
              <X size={20} />
            </button>
            <h3 className="text-2xl font-serif font-bold text-ivoire mb-2 italic">Instructions de Paiement</h3>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-6">Facture {selectedInvoice.number}</p>

            <div className="space-y-3 bg-white/[0.02] p-6 border border-white/5 rounded-2xl mb-6 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Sous-total HT :</span><span className="font-mono text-silver">{(selectedInvoice.montantHt ?? 0).toFixed(2)} $</span></div>
              <div className="flex justify-between"><span className="text-slate-500">TPS (5%) :</span><span className="font-mono text-silver">{(selectedInvoice.tps ?? 0).toFixed(2)} $</span></div>
              <div className="flex justify-between"><span className="text-slate-500">TVQ (9.975%) :</span><span className="font-mono text-silver">{(selectedInvoice.tvq ?? 0).toFixed(2)} $</span></div>
              <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-base text-gold">
                <span>Total à transférer :</span><span>{(selectedInvoice.montantTotal ?? selectedInvoice.amount).toFixed(2)} $</span>
              </div>
            </div>

            {selectedInvoice.status === 'paid' ? (
              <div className="p-4 bg-green-500/10 border border-green-500/20 text-emerald-400 rounded-xl text-sm font-semibold leading-relaxed">
                ✅ Facture acquittée. Référence Interac : <span className="font-mono">{selectedInvoice.interacReference || 'Dépôt direct'}</span>
                {selectedInvoice.datePaiement && <span className="block text-xs mt-1 text-emerald-500/70">Payée le {new Date(selectedInvoice.datePaiement).toLocaleDateString('fr-CA')}</span>}
              </div>
            ) : (
              <>
                {subAdminInterac?.interac_email ? (
                  <div className="p-6 bg-gold/5 border border-gold/20 rounded-2xl space-y-3 text-sm mb-6">
                    <h4 className="font-bold text-ivoire flex items-center gap-2">
                      <DollarSign size={18} className="text-gold" /> Virement Interac
                    </h4>
                    <div className="space-y-2 text-xs">
                      <p><span className="text-slate-500">Destinataire :</span> <span className="font-bold text-ivoire">{subAdminInterac.full_name || 'Votre comptable'}</span></p>
                      <p><span className="text-slate-500">Adresse de virement :</span> <span className="font-bold text-gold font-mono">{subAdminInterac.interac_email}</span></p>
                      <p><span className="text-slate-500">Montant exact :</span> <span className="font-bold text-gold font-mono">{(selectedInvoice.montantTotal ?? selectedInvoice.amount).toFixed(2)} $ CAD</span></p>
                      <p><span className="text-slate-500">Dépôt automatique :</span> <span className="font-bold text-ivoire">{subAdminInterac.interac_autodepot ? 'Oui (aucune question requise)' : 'Non'}</span></p>
                      {!subAdminInterac.interac_autodepot && subAdminInterac.interac_question && (
                        <p><span className="text-slate-500">Question de sécurité :</span> <span className="font-bold text-ivoire">{subAdminInterac.interac_question}</span></p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-400 mb-6">
                    Contactez votre comptable pour obtenir les instructions de virement.
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    className="flex-1 h-12 gap-2 uppercase text-xs font-bold tracking-widest"
                    onClick={() => printInvoice(selectedInvoice, subAdminInterac)}
                  >
                    <Printer size={14} /> Imprimer
                  </Button>

                  {selectedInvoice.clientADeclarePaye ? (
                    <div className="flex-1 p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-center text-xs font-bold flex items-center justify-center">
                      ⏳ En attente de validation par votre comptable.
                    </div>
                  ) : (
                    <Button
                      variant="gold"
                      className="flex-1 h-12 uppercase text-xs font-bold tracking-widest"
                      onClick={() => handleClientDeclarePaid(selectedInvoice.id)}
                    >
                      J'ai envoyé le virement
                    </Button>
                  )}
                </div>
              </>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
