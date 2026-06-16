import React from 'react';
import { Users, FileText, CheckCircle, Clock, ExternalLink, Download, UploadCloud, FileSpreadsheet, Calculator, Database, Server } from 'lucide-react';
import { ClientRecord } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useDocuments } from '../../hooks/useDocuments';
import { ExportService } from '../../lib/exportUtils';
import { useTransactions } from '../../hooks/useTransactions';
import { toast } from 'sonner';

export function AdminClients({ clients, isAdmin }: { clients: ClientRecord[], isAdmin?: boolean }) {
  const { uploadDocument, documents } = useDocuments();
  const { transactions } = useTransactions(undefined, isAdmin);
  
  const handleAdminExport = (client: ClientRecord) => {
    const clientTrans = transactions.filter(t => t.userId === client.id);
    ExportService.exportTransactions(clientTrans, client.displayName);
  };

  const handleQBOPush = async (client: ClientRecord) => {
    toast.info("Synchronisation API vers QuickBooks...");
    try {
      const res = await fetch('/api/qbo/push-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: 'bulk_export',
          amount: 1500,
          date: new Date().toISOString(),
          vendor: client.displayName,
          taxAmount: 225
        })
      });
      const data = await res.json();
      if (data.success) toast.success("Données injectées avec succès dans QuickBooks !");
    } catch (e) {
      toast.error("Erreur de synchronisation QBO.");
    }
  };

  /**
   * 🏛️ EXPORT UNIVERSEL AGY
   */
  const handleUniversalExport = (client: ClientRecord, format: 'excel' | 'qb' | 'sage') => {
    // Note: Dans une version réelle, on filtrerait les documents du client spécifique
    // Pour ce build, on utilise ExportService
    toast.info(`Préparation de l'export ${format.toUpperCase()}...`);
    
    // Simulation de récupération des docs du client pour l'export
    const clientDocs = documents.filter(d => d.userId === client.id);
    
    if (clientDocs.length === 0) {
      toast.error("Aucun document analysé pour cet export.");
      return;
    }

    switch(format) {
      case 'excel': ExportService.exportToExcel(clientDocs); break;
      case 'qb': ExportService.exportToQuickBooks(clientDocs); break;
      case 'sage': ExportService.exportToSage(clientDocs); break;
    }
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
        <h1 className="text-3xl font-serif font-medium text-silver tracking-tight">Gestion des <span className="text-gold italic">Mandats Clients.</span></h1>
        <p className="text-slate-400 mt-1.5 text-sm font-light uppercase tracking-widest">Pilotage des dossiers et conformité</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 flex items-center gap-6 border-gold/10">
           <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center text-gold"><Users size={28}/></div>
           <div>
              <p className="text-2xl font-serif text-silver">{enAttente}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Nouveaux mandats</p>
           </div>
        </Card>
        <Card className="p-6 flex items-center gap-6 border-green-500/10">
           <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500"><CheckCircle size={28}/></div>
           <div>
              <p className="text-2xl font-serif text-silver">{enRegle}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Dossiers en règle</p>
           </div>
        </Card>
        <Card className="p-6 flex items-center gap-6 border-red-500/10">
           <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500"><Clock size={28}/></div>
           <div>
              <p className="text-2xl font-serif text-silver">{aReviser}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Action requise</p>
           </div>
        </Card>
      </div>

      {/* Clients Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Identité Client</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Services Actifs</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Statut Dossier</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions de Production</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-silver font-bold">{client.displayName}</span>
                      <span className="text-xs text-slate-500">{client.companyName || 'Individuel'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-wrap gap-2">
                       {client.needs.bookkeeping && <Badge variant="default" className="text-[9px]">Tenue</Badge>}
                       {client.needs.taxes && <Badge variant="default" className="text-[9px]">Impôts</Badge>}
                       {!client.needs.bookkeeping && !client.needs.taxes && <span className="text-slate-600 text-xs italic">Consultation</span>}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <Badge variant={client.status === 'En règle' ? 'success' : (client.status === 'À réviser' ? 'error' : 'warning')}>
                      {client.status}
                    </Badge>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                       {/* HUB EXPORT UNIVERSEL */}
                       <div className="flex gap-1 bg-noir/50 p-1 rounded-xl border border-white/5">
                          <button onClick={() => handleUniversalExport(client, 'excel')} className="p-2 hover:text-gold transition-colors" title="Export Excel Audit"><FileSpreadsheet size={16}/></button>
                          <button onClick={() => handleUniversalExport(client, 'qb')} className="p-2 hover:text-gold transition-colors" title="Export QuickBooks Import"><Calculator size={16}/></button>
                          <button onClick={() => handleUniversalExport(client, 'sage')} className="p-2 hover:text-gold transition-colors" title="Export Sage Import"><Database size={16}/></button>
                       </div>

                       <Button variant="ghost" size="sm" className="gap-2 text-[10px] uppercase font-bold" onClick={() => handleAdminExport(client)}>
                          <Download size={14}/> Rapport
                       </Button>
                       <label className="cursor-pointer">
                          <div className="h-9 px-4 rounded-xl bg-gold/10 text-gold text-[10px] font-bold uppercase flex items-center gap-2 hover:bg-gold hover:text-noir transition-all">
                             <UploadCloud size={14}/> Livrer
                          </div>
                          <input type="file" className="hidden" onChange={(e) => handleAdminUpload(e, client.id)} />
                       </label>
                    </div>
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
