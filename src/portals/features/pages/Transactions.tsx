import { Plus, Search, ArrowUpCircle, ArrowDownCircle, Filter, MoreHorizontal, Receipt, FileText, AlertCircle, CheckCircle2, ShieldAlert, Clock } from 'lucide-react';
import { useState } from 'react';
import { useTransactions } from '../../../hooks/useTransactions';
import { useAdminClients } from '../../../hooks/useAdminClients';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { Transaction, AppMode } from '../../../types';
import { motion, AnimatePresence } from 'motion/react';
import { OrganicLoader } from '../../../components/ui/OrganicLoader';
import { useLanguage } from '../../../hooks/useLanguage';

export function Transactions({ currentMode, isAdmin }: { currentMode: AppMode, isAdmin?: boolean }) {
  const { t } = useLanguage();
  const { transactions, loading, addTransaction } = useTransactions(undefined, isAdmin);
  const { clients } = useAdminClients(!!isAdmin);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [filter, setFilter] = useState<'all' | 'sale' | 'purchase'>('all');
  const [isAdding, setIsAdding] = useState(false);
  
  // Quick form state
  const [newType, setNewType] = useState<'sale' | 'purchase'>('purchase');
  const [newAmount, setNewAmount] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleAdd = async () => {
    if (!newAmount || !newDesc || (isAdmin && !selectedClientId)) return;
    await addTransaction({
      type: newType,
      amount: parseFloat(newAmount),
      description: newDesc,
      date: Date.now(),
      status: 'pending',
      category: 'Général',
      context: currentMode
    }, isAdmin ? selectedClientId : undefined);
    setIsAdding(false);
    setNewAmount('');
    setNewDesc('');
    setSelectedClientId('');
  };

  const filtered = transactions.filter(t => 
    (filter === 'all' || t.type === filter) && (t.context === currentMode)
  );

  const totalSales = filtered.filter(t => t.type === 'sale').reduce((acc, t) => acc + t.amount, 0);
  const totalPurchases = filtered.filter(t => t.type === 'purchase').reduce((acc, t) => acc + t.amount, 0);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-8">
      <OrganicLoader label="F" size="sm" />
      <p className="text-slate-500 font-serif italic text-lg animate-pulse">
        {t('transactions.syncing')} {currentMode === 'business' ? t('transactions.syncingPro') : t('transactions.syncingPersonal')}…
      </p>
    </div>
  );

  return (
    <div className="space-y-10 pb-20 md:pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-5xl font-serif font-bold text-ivoire tracking-tight leading-tight">
            Journal <span className="animated-gradient-text italic">{currentMode === 'business' ? t('transactions.titlePro') : t('transactions.titlePersonal')}</span>
          </h1>
          <div className="flex items-center gap-3 mt-3">
            <span className="w-8 h-[1px] bg-gold/50"></span>
            <p className="text-slate-500 text-xs font-black uppercase tracking-[0.4em]">{t('transactions.subtitle')}</p>
          </div>
        </div>
        <Button variant="gold" className="gap-3 h-16 px-10 shadow-glow font-black uppercase tracking-[0.2em] text-xs rounded-2xl group" onClick={() => setIsAdding(true)}>
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500"/> {t('transactions.addEntry')}
        </Button>
      </header>

      {/* Stats Summary - Premium Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
         <Card className="p-8 flex items-center gap-8 group hover:border-gold/30 premium-border-gold transition-all duration-700" glow="gold">
            <div className="w-20 h-20 rounded-[2rem] bg-gold/5 flex items-center justify-center text-gold border border-gold/10 shadow-[0_0_30px_rgba(212,175,55,0.1)] group-hover:scale-110 group-hover:bg-gold/10 transition-all duration-700">
               <ArrowUpCircle size={32} />
            </div>
            <div>
               <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-2">{currentMode === 'business' ? t('transactions.inflowPro') : t('transactions.inflowPersonal')}</p>
               <p className="text-4xl font-serif font-bold text-ivoire">{totalSales.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $</p>
            </div>
         </Card>

         <Card className="p-8 flex items-center gap-8 group hover:border-ivoire/20 glass-card transition-all duration-700">
            <div className="w-20 h-20 rounded-[2rem] bg-white/5 flex items-center justify-center text-silver border border-white/10 shadow-lg group-hover:scale-110 group-hover:bg-white/10 transition-all duration-700">
               <ArrowDownCircle size={32} />
            </div>
            <div>
               <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-2">{currentMode === 'business' ? t('transactions.outflowPro') : t('transactions.outflowPersonal')}</p>
               <p className="text-4xl font-serif font-bold text-ivoire">{totalPurchases.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $</p>
            </div>
         </Card>

         <Card className="p-8 flex flex-col justify-center gap-6 md:col-span-2 lg:col-span-1 glass-card">
            <div className="flex items-center justify-between">
               <span className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">{t('transactions.smartFilter')}</span>
               <Filter size={16} className="text-gold" />
            </div>
            <div className="flex gap-3 w-full">
               {['all', 'sale', 'purchase'].map((f) => (
                 <button 
                   key={f}
                   onClick={() => setFilter(f as any)}
                   className={`flex-1 h-12 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border transition-all duration-500 ${filter === f ? 'bg-gold text-midnight border-gold shadow-glow-sm' : 'bg-white/5 text-slate-500 border-white/5 hover:border-gold/30 hover:text-ivoire'}`}
                 >
                   {f === 'all' ? t('transactions.filterAll') : f === 'sale' ? t('transactions.filterSale') : t('transactions.filterPurchase')}
                 </button>
               ))}
            </div>
         </Card>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <Card className="p-10 premium-border-gold mb-10" glow="gold">
               <div className="flex justify-between items-center mb-10">
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-ivoire italic">Nouvelle Inscription <span className="text-gold">au Registre.</span></h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1">Saisie certifiée ComptaFlow</p>
                  </div>
                  <button onClick={() => setIsAdding(false)} className="w-12 h-12 rounded-full flex items-center justify-center bg-white/5 text-slate-500 hover:text-gold hover:bg-gold/10 transition-all duration-500">
                    <Plus size={28} className="rotate-45" />
                  </button>
               </div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
                   <div className="md:col-span-3 space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 ml-2">Nature Juridique</label>
                     <select className="w-full h-14 bg-noir/50 border border-white/5 rounded-2xl px-5 text-ivoire font-bold outline-none focus:border-gold/50 transition-all appearance-none cursor-pointer" value={newType} onChange={e => setNewType(e.target.value as any)}>
                         <option value="purchase">↗ Dépense Stratégique</option>
                         <option value="sale">↙ Revenu Opérationnel</option>
                     </select>
                   </div>
                   {isAdmin && (
                     <div className="md:col-span-3 space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 ml-2">Client du Mandat</label>
                       <select 
                         className="w-full h-14 bg-noir/50 border border-white/5 rounded-2xl px-5 text-ivoire font-bold outline-none focus:border-gold/50 transition-all appearance-none cursor-pointer"
                         value={selectedClientId}
                         onChange={e => setSelectedClientId(e.target.value)}
                       >
                         <option value="">Sélectionner...</option>
                         {clients.map(cl => (
                           <option key={cl.id} value={cl.id}>{cl.displayName}</option>
                         ))}
                       </select>
                     </div>
                   )}
                   <div className={isAdmin ? "md:col-span-4" : "md:col-span-6"}>
                     <Input label="Description du Mandat" placeholder="ex: Honoraires, Acquisition Assets, SaaS..." value={newDesc} onChange={e => setNewDesc(e.target.value)} className="h-14 bg-noir/50 border-white/5" />
                   </div>
                   <div className={isAdmin ? "md:col-span-2" : "md:col-span-3"}>
                     <Input label="Quantum ($)" type="number" placeholder="0.00" value={newAmount} onChange={e => setNewAmount(e.target.value)} className="h-14 bg-noir/50 border-white/5 text-gold font-serif text-xl" />
                   </div>
                </div>
               <div className="mt-12 flex flex-col md:flex-row justify-end gap-6">
                  <Button variant="ghost" onClick={() => setIsAdding(false)} className="h-14 px-10 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-ivoire order-2 md:order-1">Abandonner</Button>
                  <Button variant="gold" onClick={handleAdd} className="h-14 px-16 shadow-glow font-black uppercase tracking-[0.2em] text-xs rounded-2xl order-1 md:order-2">Certifier & Enregistrer</Button>
               </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transactions Visual Grid */}
      <div className="space-y-4">
         {filtered.length === 0 && (
           <Card className="p-16 md:p-32 flex flex-col items-center justify-center text-center space-y-6 glass-card">
              <div className="w-16 h-16 md:w-24 md:h-24 bg-white/5 rounded-full flex items-center justify-center text-slate-800 border border-white/5 animate-pulse">
                <Receipt size={32} />
              </div>
              <div>
                <p className="text-silver font-serif text-xl md:text-2xl italic opacity-50">Registre Vierge</p>
                <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.4em] mt-2">En attente de pulsations financières</p>
              </div>
           </Card>
         )}

         {/* Desktop table */}
         {filtered.length > 0 && (
           <div className="hidden md:block">
              <Card className="p-0 overflow-hidden glass-card">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white/[0.03] text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 border-b border-white/5">
                        <tr>
                          <th className="px-10 py-6">Période</th>
                          <th className="px-10 py-6">Entité / Nature</th>
                          <th className="px-10 py-6">Classification</th>
                          <th className="px-10 py-6 text-right">Montant Certifié</th>
                          <th className="px-10 py-6">Statut de Conformité</th>
                          <th className="px-10 py-6"></th>
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
         )}

         {/* Mobile cards */}
         {filtered.length > 0 && (
           <div className="md:hidden space-y-3">
             {filtered.map((t) => (
               <Card key={t.id} className="p-4 glass-card flex items-center gap-4">
                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${t.type === 'sale' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-gold/10 text-gold border-gold/20'}`}>
                   <Receipt size={18} />
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="text-sm font-bold text-ivoire truncate">{t.description}</p>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                     {new Date(t.date).toLocaleDateString('fr-CA')} · {t.category}
                   </p>
                 </div>
                 <div className="text-right shrink-0">
                   <p className={`text-base font-serif font-bold ${t.type === 'sale' ? 'text-green-400' : 'text-gold'}`}>
                     {t.type === 'sale' ? '+' : '-'}{t.amount.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $
                   </p>
                   <p className="text-[9px] text-slate-500 uppercase font-bold mt-0.5">{t.status === 'reconciled' ? '✓ Rapproché' : t.status === 'quarantine' ? '⚠ Litige' : '⏳ Analyse'}</p>
                 </div>
               </Card>
             ))}
           </div>
         )}
      </div>
    </div>
  );
}

function TransactionRow({ t }: { t: Transaction, key?: any }) {
  return (
    <tr className="hover:bg-white/[0.04] transition-all duration-500 group cursor-pointer">
      <td className="px-10 py-8">
        <p className="text-ivoire font-bold text-base">{new Date(t.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</p>
        <p className="text-[10px] text-slate-600 font-black tracking-widest mt-1">{new Date(t.date).getFullYear()}</p>
      </td>
      <td className="px-10 py-8">
        <div className="flex items-center gap-5">
           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-500 ${t.type === 'sale' ? 'bg-green-500/10 text-green-400' : 'bg-gold/10 text-gold'}`}>
             <Receipt size={18} />
           </div>
           <div>
             <span className="text-ivoire font-bold text-base group-hover:text-gold transition-colors">{t.description}</span>
             <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mt-1">ID: {t.id.slice(0,8)}</p>
           </div>
        </div>
      </td>
      <td className="px-10 py-8">
        <Badge variant="default" className="bg-white/5 text-slate-400 border-white/5 py-1.5 px-4 font-black uppercase text-[9px] tracking-widest">{t.category}</Badge>
      </td>
      <td className={`px-10 py-8 text-right font-serif text-2xl font-bold ${t.type === 'sale' ? 'text-green-400' : 'text-gold'}`}>
        {t.type === 'sale' ? '+' : '-'}{t.amount.toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $
      </td>
      <td className="px-10 py-8">
        <div className="flex flex-col gap-2">
           <div className="flex items-center gap-2">
              {t.status === 'quarantine' ? (
                <Badge variant="error" className="bg-red-500/10 text-red-400 border-red-500/20 py-1.5 px-3 font-black uppercase text-[8px] tracking-widest gap-1.5"><ShieldAlert size={10}/> Litige / Quarantine</Badge>
              ) : t.status === 'reconciled' ? (
                <Badge variant="success" className="bg-green-500/10 text-green-400 border-green-500/20 py-1.5 px-3 font-black uppercase text-[8px] tracking-widest gap-1.5"><CheckCircle2 size={10}/> Rapproché</Badge>
              ) : (
                <Badge variant="default" className="bg-gold/5 text-gold border-gold/10 py-1.5 px-3 font-black uppercase text-[8px] tracking-widest gap-1.5"><Clock size={10}/> Analyse Automatisée</Badge>
              )}
           </div>
           {t.aiConfidence !== undefined && (
             <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden" title={`Indice de correspondance: ${(t.aiConfidence*100).toFixed(0)}%`}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${t.aiConfidence * 100}%` }} className={`h-full ${t.aiConfidence > 0.95 ? 'bg-green-500' : 'bg-gold'}`} />
             </div>
           )}
        </div>
      </td>
      <td className="px-10 py-8 text-right">
        <button className="p-3 hover:bg-white/10 rounded-xl text-slate-600 hover:text-ivoire transition-all duration-500">
          <MoreHorizontal size={20} />
        </button>
      </td>
    </tr>
  );
}
