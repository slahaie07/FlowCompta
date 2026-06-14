import { Plus, FileText, Download, Calendar, DollarSign, ArrowRight, MoreVertical, Clock } from 'lucide-react';
import { useState } from 'react';
import { useInvoices } from '../../hooks/useInvoices';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { motion, AnimatePresence } from 'motion/react';

export function Invoices() {
  const { invoices, loading, addInvoice, updateInvoiceStatus } = useInvoices();
  const [isAdding, setIsAdding] = useState(false);

  // New Invoice State
  const [newNum, setNewNum] = useState(`FAC-2026-${(invoices.length + 1).toString().padStart(3, '0')}`);
  const [newClient, setNewClient] = useState('');
  const [newAmount, setNewAmount] = useState('');

  const handleAdd = async () => {
    if (!newClient || !newAmount) return;
    await addInvoice({
      number: newNum,
      clientName: newClient,
      amount: parseFloat(newAmount),
      date: Date.now(),
      dueDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
      status: 'pending',
      items: [{ description: 'Prestation de services', quantity: 1, price: parseFloat(newAmount) }]
    });
    setIsAdding(false);
    setNewClient('');
    setNewAmount('');
  };

  if (loading) return <div className="p-8 text-center animate-pulse font-serif text-xl text-slate-500 italic">Chargement du registre de facturation...</div>;

  return (
    <div className="space-y-10 pb-20 md:pb-10">
      <header className="flex flex-col md:flex-row justify-between items-center gap-8">
        <div>
          <h1 className="text-5xl font-serif font-bold text-ivoire tracking-tight leading-tight">Registre <span className="animated-gradient-text italic">Facturation.</span></h1>
          <div className="flex items-center gap-3 mt-3">
            <span className="w-8 h-[1px] bg-gold/50"></span>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Gestion Certifiée des Encaissements</p>
          </div>
        </div>
        <Button variant="gold" className="gap-3 h-16 px-10 shadow-glow font-black uppercase tracking-[0.2em] text-xs rounded-2xl group" onClick={() => setIsAdding(true)}>
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" /> Émettre Mandat
        </Button>
      </header>

      <AnimatePresence>
        {isAdding && (
          <motion.div initial={{ opacity: 0, y: -20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.98 }}>
            <Card className="p-10 premium-border-gold mb-10" glow="gold">
               <div className="flex justify-between items-center mb-10">
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-ivoire italic">Génération de <span className="text-gold">Facture Elite.</span></h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1">Séquençage automatique ComptaFlow</p>
                  </div>
                  <button onClick={() => setIsAdding(false)} className="w-12 h-12 rounded-full flex items-center justify-center bg-white/5 text-slate-500 hover:text-gold transition-all duration-500">
                    <Plus size={28} className="rotate-45" />
                  </button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <Input label="Numérotation Scellée" value={newNum} readOnly className="h-14 bg-noir/50 border-white/5 text-slate-500 font-mono" />
                  <Input label="Raison Sociale du Client" placeholder="ex: Groupe Visionnaire Inc." value={newClient} onChange={e => setNewClient(e.target.value)} className="h-14 bg-noir/50 border-white/5 font-bold" />
                  <Input label="Quantum de la Prestation ($)" type="number" placeholder="0.00" value={newAmount} onChange={e => setNewAmount(e.target.value)} className="h-14 bg-noir/50 border-white/5 text-gold font-serif text-xl" />
               </div>
               <div className="mt-12 flex justify-end gap-6">
                  <Button variant="ghost" onClick={() => setIsAdding(false)} className="h-14 px-10 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-ivoire">Annuler</Button>
                  <Button variant="gold" onClick={handleAdd} className="h-14 px-16 shadow-glow font-black uppercase tracking-[0.2em] text-xs rounded-2xl">Certifier & Publier</Button>
               </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-6">
         {invoices.length === 0 && (
           <Card className="p-32 text-center space-y-6 glass-card">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-800 border border-white/5 animate-pulse">
                <FileText size={48} />
              </div>
              <div>
                <p className="text-silver font-serif text-2xl italic opacity-50">Registre de Facturation Vierge</p>
                <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.4em] mt-2">Prêt pour votre première émission</p>
              </div>
           </Card>
         )}

         {invoices.map((inv) => (
           <Card 
             key={inv.id} 
             onClick={() => updateInvoiceStatus(inv.id, inv.status === 'paid' ? 'pending' : 'paid')}
             className="p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-10 group hover:border-gold/30 glass-card transition-all duration-700 cursor-pointer relative overflow-hidden"
           >
              <div className="absolute top-0 left-0 w-1 h-full bg-gold/20 group-hover:bg-gold transition-colors duration-700" />
              
              <div className="flex items-center gap-8 w-full md:w-auto relative z-10">
                 <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center border transition-all duration-700 ${inv.status === 'paid' ? 'bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.1)]' : 'bg-gold/5 text-gold border-gold/10'}`}>
                    <FileText size={32} />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">{inv.number}</p>
                    <h4 className="text-2xl font-black text-ivoire group-hover:text-gold transition-colors duration-500 tracking-tight">{inv.clientName}</h4>
                    <div className="flex items-center gap-4 mt-3">
                       <p className="text-[10px] text-slate-500 uppercase font-black flex items-center gap-2 tracking-widest">
                          <Calendar size={12} className="text-gold/50" /> Émis le {new Date(inv.date).toLocaleDateString('fr-CA')}
                       </p>
                       <span className="w-1 h-1 rounded-full bg-slate-700" />
                       <p className="text-[10px] text-slate-500 uppercase font-black flex items-center gap-2 tracking-widest">
                          <Clock size={12} className="text-gold/50" /> Échéance 30j
                       </p>
                    </div>
                 </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-12 w-full md:w-auto border-t md:border-t-0 border-white/5 pt-8 md:pt-0 relative z-10">
                 <div className="text-left md:text-right">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Quantum Certifié</p>
                    <p className="text-4xl font-serif font-bold text-ivoire">{inv.amount.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $</p>
                 </div>
                 <div className="flex flex-col items-end gap-3">
                    <Badge variant={inv.status === 'paid' ? 'success' : 'warning'} className={`py-2 px-5 font-black uppercase text-[10px] tracking-[0.2em] rounded-full border ${inv.status === 'paid' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-gold/10 text-gold border-gold/20'}`}>
                       {inv.status === 'paid' ? 'Règlement Effectué' : 'Attente Fonds'}
                    </Badge>
                    <p className="text-[9px] text-slate-600 font-black uppercase tracking-tighter">Limité au: {new Date(inv.dueDate).toLocaleDateString('fr-CA')}</p>
                 </div>
                 <div className="flex gap-3">
                    <Button variant="secondary" size="icon" className="h-12 w-12 glass-button rounded-xl border-white/10"><Download size={18} /></Button>
                    <Button variant="ghost" size="icon" className="h-12 w-12 hover:text-gold transition-colors"><MoreVertical size={18} /></Button>
                 </div>
              </div>
           </Card>
         ))}
      </div>
    </div>
  );
}
