import { Plus, FileText, Download, Calendar, DollarSign, ArrowRight, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import { useInvoices } from '../hooks/useInvoices';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Input } from './ui/Input';
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
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-3xl font-serif font-medium text-silver tracking-tight">Gestion des <span className="text-gold">Factures.</span></h1>
          <p className="text-slate-500 mt-1.5 text-sm font-light uppercase tracking-widest">Suivi mensuel des encaissements</p>
        </div>
        <Button variant="gold" className="gap-2 h-14 md:h-12 shadow-glow" onClick={() => setIsAdding(true)}>
          <Plus size={18} /> Créer une Facture
        </Button>
      </header>

      <AnimatePresence>
        {isAdding && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <Card className="p-8 border-gold/30" glow="gold">
               <h3 className="text-xl font-serif text-silver mb-8">Détails de la nouvelle facture</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Input label="Numéro" value={newNum} readOnly className="bg-white/5 opacity-50" />
                  <Input label="Nom du Client" placeholder="ex: Client de Services Inc." value={newClient} onChange={e => setNewClient(e.target.value)} />
                  <Input label="Montant Total ($)" type="number" placeholder="0.00" value={newAmount} onChange={e => setNewAmount(e.target.value)} />
               </div>
               <div className="mt-8 flex justify-end gap-4">
                  <Button variant="ghost" onClick={() => setIsAdding(false)}>Annuler</Button>
                  <Button variant="gold" onClick={handleAdd}>Générer la facture</Button>
               </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
         {invoices.length === 0 && (
           <Card className="p-20 text-center space-y-4">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-700">
                <FileText size={32} />
              </div>
              <p className="text-slate-500 italic">Aucune facture émise pour le moment.</p>
           </Card>
         )}

         {invoices.map((inv) => (
           <Card 
             key={inv.id} 
             onClick={() => updateInvoiceStatus(inv.id, inv.status === 'paid' ? 'pending' : 'paid')}
             className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-gold/30 transition-all cursor-pointer"
           >
              <div className="flex items-center gap-6 w-full md:w-auto">
                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 ${inv.status === 'paid' ? 'bg-green-500 text-midnight border-green-500 shadow-glow-sm' : 'bg-gold/10 text-gold border-gold/20'}`}>
                    <FileText size={24} />
                 </div>
                 <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{inv.number}</p>
                    <h4 className="text-lg font-bold text-silver">{inv.clientName}</h4>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold flex items-center gap-2">
                       <Calendar size={10} /> Émis le {new Date(inv.date).toLocaleDateString('fr-CA')}
                    </p>
                 </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-8 w-full md:w-auto border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                 <div className="text-left md:text-right">
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Montant</p>
                    <p className="text-2xl font-serif text-silver">{inv.amount.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $</p>
                 </div>
                 <div className="flex flex-col items-end gap-2">
                    <Badge variant={inv.status === 'paid' ? 'success' : 'warning'}>
                       {inv.status === 'paid' ? 'Payée' : 'En attente'}
                    </Badge>
                    <p className="text-[9px] text-slate-600 font-bold uppercase">Échéance: {new Date(inv.dueDate).toLocaleDateString('fr-CA')}</p>
                 </div>
                 <div className="flex gap-2">
                    <Button variant="secondary" size="sm" className="p-2"><Download size={16} /></Button>
                    <Button variant="ghost" size="sm" className="p-2 text-slate-600"><MoreVertical size={16} /></Button>
                 </div>
              </div>
           </Card>
         ))}
      </div>
    </div>
  );
}
