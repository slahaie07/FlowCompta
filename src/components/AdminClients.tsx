import React from 'react';
import { Users, FileText, CheckCircle, Clock, ExternalLink, Download, UploadCloud } from 'lucide-react';
import { ClientRecord } from '../types';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { useDocuments } from '../hooks/useDocuments';
import { exportTransactionsExcel } from '../lib/exportUtils';
import { useTransactions } from '../hooks/useTransactions';
import { toast } from 'sonner';

export function AdminClients({ clients, isAdmin }: { clients: ClientRecord[], isAdmin?: boolean }) {
  const { uploadDocument } = useDocuments();
  const { transactions } = useTransactions(undefined, isAdmin);
  
  const handleAdminExport = (client: ClientRecord) => {
    const clientTrans = transactions.filter(t => t.userId === client.id);
    exportTransactionsExcel(clientTrans, client.displayName);
  };

  const handleAdminUpload = async (e: React.ChangeEvent<HTMLInputElement>, clientId: string) => {
     if (!e.target.files) return;
     const file = e.target.files[0];
     const success = await uploadDocument(file, 'deliverable', clientId);
     if (success) toast.success("Document livré avec succès dans le coffre-fort du client !");
  };

  const enAttente = clients.filter(c => c.status === 'En attente' || c.status.includes('Nouveau')).length;
  const enRegle = clients.filter(c => c.status === 'En règle').length;
  const aReviser = clients.filter(c => c.status === 'À réviser').length;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-serif font-medium text-silver tracking-tight">Supervision <span className="text-gold">Clients</span></h1>
        <p className="text-slate-400 mt-1.5 text-sm font-light uppercase tracking-widest">Gestion centralisée du cabinet</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 space-y-4" glow="sapphire">
          <div className="flex items-center gap-3 text-slate-500 text-[10px] uppercase font-bold tracking-widest"><Users size={14} className="text-sapphire-light" /> Total</div>
          <p className="text-4xl font-serif text-silver">{clients.length}</p>
        </Card>
        <Card className="p-6 space-y-4" glow="gold">
          <div className="flex items-center gap-3 text-slate-500 text-[10px] uppercase font-bold tracking-widest"><Clock size={14} className="text-gold" /> En attente</div>
          <p className="text-4xl font-serif text-silver">{enAttente}</p>
        </Card>
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3 text-slate-500 text-[10px] uppercase font-bold tracking-widest"><CheckCircle size={14} className="text-green-500" /> En règle</div>
          <p className="text-4xl font-serif text-silver">{enRegle}</p>
        </Card>
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3 text-slate-500 text-[10px] uppercase font-bold tracking-widest"><FileText size={14} className="text-red-400" /> À réviser</div>
          <p className="text-4xl font-serif text-silver">{aReviser}</p>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-[10px] uppercase tracking-widest text-slate-500 font-bold border-b border-white/5">
              <tr>
                <th className="px-8 py-5">Client / Entreprise</th>
                <th className="px-8 py-5">Statut</th>
                <th className="px-8 py-5">Fichiers</th>
                <th className="px-8 py-5">Dernière activité</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-5">
                    <p className="font-medium text-silver">{client.displayName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{client.companyName}</p>
                  </td>
                  <td className="px-8 py-5">
                    <Badge variant={client.status === 'En règle' ? 'success' : 'warning'}>{client.status}</Badge>
                  </td>
                  <td className="px-8 py-5 text-slate-400">
                    <div className="flex items-center gap-2 font-light">
                      <FileText size={14} className="text-slate-600" /> Historique
                    </div>
                  </td>
                  <td className="px-8 py-5 text-slate-500 font-light italic">{client.lastActive}</td>
                  <td className="px-8 py-5 text-right flex justify-end gap-2">
                    <Button variant="secondary" size="sm" className="gap-2" onClick={() => handleAdminExport(client)}>
                       Excel <Download size={14} />
                    </Button>
                    <label className="cursor-pointer">
                       <div className="px-3 py-1.5 rounded-2xl bg-gold/10 text-gold text-[10px] font-bold uppercase hover:bg-gold hover:text-midnight transition-all">Livrer PDF</div>
                       <input type="file" className="hidden" onChange={(e) => handleAdminUpload(e, client.id)} />
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
