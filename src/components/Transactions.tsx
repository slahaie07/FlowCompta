import { Plus, Search, ArrowUpCircle, ArrowDownCircle, Filter, MoreHorizontal, Receipt, FileText, AlertCircle, CheckCircle2, ShieldAlert, Clock } from 'lucide-react';
import { useState } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Input } from './ui/Input';
import { Transaction, AppMode } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export function Transactions({ currentMode, isAdmin }: { currentMode: AppMode, isAdmin?: boolean }) {
  const { transactions, loading, addTransaction } = useTransactions(undefined, isAdmin);
  const [filter, setFilter] = useState<'all' | 'sale' | 'purchase'>('all');
  const [isAdding, setIsAdding] = useState(false);
  
  // Quick form state
  const [newType, setNewType] = useState<'sale' | 'purchase'>('purchase');
  const [newAmount, setNewAmount] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleAdd = async () => {
    if (!newAmount || !newDesc) return;
    await addTransaction({
      type: newType,
      amount: parseFloat(newAmount),
      description: newDesc,
      date: Date.now(),
      status: 'pending',
      category: 'Général',
      context: currentMode
    });
    setIsAdding(false);
    setNewAmount('');
    setNewDesc('');
  };

  const filtered = transactions.filter(t => 
    (filter === 'all' || t.type === filter) && (t.context === currentMode)
  );

  const totalSales = filtered.filter(t => t.type === 'sale').reduce((acc, t) => acc + t.amount, 0);
  const totalPurchases = filtered.filter(t => t.type === 'purchase').reduce((acc, t) => acc + t.amount, 0);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96 space-y-4">
      <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
      <p className="text-slate-500 font-serif italic text-lg animate-pulse">Synchronisation de vos flux {currentMode === 'business' ? 'professionnels' : 'personnels'}...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-20 md:pb-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-serif font-medium text-silver tracking-tight">Journal {currentMode === 'business' ? 'Business' : 'Personnel'}</h1>
          <p className="text-slate-400 mt-1.5 text-sm font-light uppercase tracking-widest">
            {currentMode === 'business' ? 'Transactions liées à votre NEQ' : 'Dépenses et Revenus Particuliers'}
          </p>
        </div>
        <Button variant="gold" className="gap-2 h-14 md:h-12 shadow-glow" onClick={() => setIsAdding(true)}>
          <Plus size={18}/> Nouvelle Opération
        </Button>
      </header>

      {/* Stats Summary - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
         <Card className="p-6 flex items-center gap-6 group hover:border-sapphire/30" glow="sapphire">
            <div className="w-14 h-14 rounded-2xl bg-sapphire/10 flex items-center justify-center text-sapphire-light border border-sapphire/20 shadow-lg group-hover:scale-110 transition-transform">
               <ArrowUpCircle size={24} />
            </div>
            <div>
               <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Total {currentMode === 'business' ? 'Ventes' : 'Revenus'}</p>
               <p className="text-2xl font-serif text-silver">{totalSales.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $</p>
            </div>
         </Card>
         <Card className="p-6 flex items-center gap-6 group hover:border-gold/30" glow="gold">
            <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center text-gold border border-gold/20 shadow-lg group-hover:scale-110 transition-transform">
               <ArrowDownCircle size={24} />
            </div>
            <div>
               <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Total {currentMode === 'business' ? 'Achats' : 'Dépenses'}</p>
               <p className="text-2xl font-serif text-silver">{totalPurchases.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $</p>
            </div>
         </Card>
         <Card className="p-6 flex items-center gap-6 md:col-span-2 lg:col-span-1">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 border border-white/10">
               <Filter size={24} />
            </div>
            <div className="flex gap-2 w-full">
               {['all', 'sale', 'purchase'].map((f) => (
                 <button 
                   key={f}
                   onClick={() => setFilter(f as any)}
                   className={`flex-1 px-4 py-2 rounded-xl text-[10px] uppercase font-bold tracking-widest border transition-all ${filter === f ? 'bg-gold text-midnight border-gold' : 'bg-white/5 text-slate-500 border-white/10 hover:border-white/20'}`}
                 >
                   {f === 'all' ? 'Tous' : f === 'sale' ? 'Revenus' : 'Dépenses'}
                 </button>
               ))}
            </div>
         </Card>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <Card className="p-8 border-gold/30" glow="gold">
               <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-serif text-silver italic">Saisie Rapide</h3>
                  <button onClick={() => setIsAdding(false)} className="text-slate-500 hover:text-white transition-colors">
                    <Plus size={24} className="rotate-45" />
                  </button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Nature du flux</label>
                    <select className="w-full h-[50px] bg-midnight/50 border border-white/10 rounded-2xl px-4 text-silver outline-none focus:border-gold/50" value={newType} onChange={e => setNewType(e.target.value as any)}>
                        <option value="purchase">Dépense / Achat</option>
                        <option value="sale">Revenu / Vente</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <Input label="Description" placeholder="ex: Amazon AWS, Salaire, Facture #..." value={newDesc} onChange={e => setNewDesc(e.target.value)} />
                  </div>
                  <div>
                    <Input label="Montant ($)" type="number" placeholder="0.00" value={newAmount} onChange={e => setNewAmount(e.target.value)} />
                  </div>
               </div>
               <div className="mt-10 flex flex-col md:flex-row justify-end gap-4">
                  <Button variant="ghost" onClick={() => setIsAdding(false)} className="h-14 md:h-12 order-2 md:order-1">Annuler</Button>
                  <Button variant="gold" onClick={handleAdd} className="h-14 md:h-12 order-1 md:order-2 px-12 font-bold uppercase tracking-widest">Enregistrer</Button>
               </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transactions Visual Grid - Better for Mobile & PC */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
         {filtered.length === 0 && (
           <Card className="p-20 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-slate-700">
                <Receipt size={32} />
              </div>
              <p className="text-slate-500 font-light italic">Aucun flux financier détecté pour ce profil.</p>
           </Card>
         )}
         
         <div className="hidden md:block">
            <Card className="p-0 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/5 text-[10px] uppercase tracking-widest text-slate-500 font-bold border-b border-white/5">
                      <tr>
                        <th className="px-8 py-5">Date</th>
                        <th className="px-8 py-5">Détails</th>
                        <th className="px-8 py-5">Catégorie</th>
                        <th className="px-8 py-5 text-right">Montant</th>
                        <th className="px-8 py-5">Validation</th>
                        <th className="px-8 py-5"></th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                      {filtered.map((t) => (
                        <TransactionRow key={t.id} t={t} />
                      ))}
                  </tbody>
                </table>
            </Card>
         </div>

         {/* Mobile Cards View */}
         <div className="md:hidden space-y-4">
            {filtered.map((t) => (
               <TransactionMobileCard key={t.id} t={t} />
            ))}
         </div>
      </div>
    </div>
  );
}

function TransactionRow({ t }: { t: Transaction, key?: any }) {
  return (
    <tr className="hover:bg-white/5 transition-colors group">
      <td className="px-8 py-5">
        <p className="text-silver font-medium">{new Date(t.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</p>
        <p className="text-[10px] text-slate-600 font-bold">{new Date(t.date).getFullYear()}</p>
      </td>
      <td className="px-8 py-5">
        <div className="flex items-center gap-3">
           <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.type === 'sale' ? 'bg-sapphire/20 text-sapphire-light' : 'bg-gold/20 text-gold'}`}>
             <Receipt size={14} />
           </div>
           <span className="text-silver font-medium">{t.description}</span>
        </div>
      </td>
      <td className="px-8 py-5">
        <Badge variant="default">{t.category}</Badge>
      </td>
      <td className={`px-8 py-5 text-right font-serif text-lg ${t.type === 'sale' ? 'text-sapphire-light' : 'text-gold'}`}>
        {t.type === 'sale' ? '+' : '-'}{t.amount.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $
      </td>
      <td className="px-8 py-5">
        <div className="flex items-center gap-2">
           {t.status === 'quarantine' ? (
             <Badge variant="error" className="gap-1.5"><ShieldAlert size={10}/> Quarantaine</Badge>
           ) : t.status === 'reconciled' ? (
             <Badge variant="success" className="gap-1.5"><CheckCircle2 size={10}/> Validé</Badge>
           ) : (
             <Badge variant="default" className="gap-1.5"><Clock size={10}/> En attente</Badge>
           )}
           {t.aiConfidence !== undefined && (
             <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden" title={`Confiance IA: ${(t.aiConfidence*100).toFixed(0)}%`}>
                <div className={`h-full ${t.aiConfidence > 0.95 ? 'bg-green-500' : 'bg-orange-500'}`} style={{ width: `${t.aiConfidence * 100}%` }} />
             </div>
           )}
        </div>
      </td>
      <td className="px-8 py-5 text-right">
        <button className="p-2 hover:bg-white/5 rounded-lg text-slate-600 transition-colors">
          <MoreHorizontal size={18} />
        </button>
      </td>
    </tr>
  );
}

function TransactionMobileCard({ t }: { t: Transaction, key?: any }) {
  return (
    <Card className="p-5 space-y-4">
       <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
             <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'sale' ? 'bg-sapphire/20 text-sapphire-light' : 'bg-gold/20 text-gold'}`}>
               <Receipt size={18} />
             </div>
             <div>
                <p className="text-sm font-bold text-silver">{t.description}</p>
                <p className="text-[10px] text-slate-500 font-medium">{new Date(t.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
             </div>
          </div>
          <button className="p-2 text-slate-600"><MoreHorizontal size={18}/></button>
       </div>
       <div className="flex justify-between items-end">
          <div className="space-y-2">
             <Badge variant="default">{t.category}</Badge>
             <div className="flex items-center gap-2">
                {t.status === 'quarantine' ? (
                   <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest flex items-center gap-1"><ShieldAlert size={10}/> À vérifier</span>
                ) : (
                   <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1"><Clock size={10}/> En attente</span>
                )}
             </div>
          </div>
          <p className={`text-2xl font-serif ${t.type === 'sale' ? 'text-sapphire-light' : 'text-gold'}`}>
             {t.type === 'sale' ? '+' : '-'}{t.amount.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $
          </p>
       </div>
    </Card>
  );
}
