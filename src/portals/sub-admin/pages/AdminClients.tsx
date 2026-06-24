import React, { useState } from 'react';
import { Users, FileText, CheckCircle, Clock, ExternalLink, Download, UploadCloud, FileSpreadsheet, Calculator, Database, Server, Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import { ClientRecord } from '../../../types';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { useDocuments } from '../../../hooks/useDocuments';
import { ExportService } from '../../../lib/exportUtils';
import { SERVICE_CATALOG } from '../../../lib/servicesCatalog';
import { useTransactions } from '../../../hooks/useTransactions';
import { toast } from 'sonner';
import { useLanguage } from '../../../hooks/useLanguage';
import { supabase } from '../../../lib/supabase';

export function AdminClients({ 
  clients, 
  isAdmin, 
  onAddClient 
}: { 
  clients: ClientRecord[], 
  isAdmin?: boolean, 
  onAddClient?: (newClient: Omit<ClientRecord, 'id' | 'documents' | 'lastActive'>) => Promise<boolean> 
}) {
  const { t } = useLanguage();
  const { uploadDocument, documents } = useDocuments();
  const { transactions } = useTransactions(undefined, isAdmin);
  
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);

  const handleUpdateStatus = async (clientId: string, nextStatus: string) => {
    try {
      const { error: pErr } = await supabase
        .from('profiles')
        .update({ status: nextStatus })
        .eq('id', clientId);

      const { error: cErr } = await supabase
        .from('clients')
        .update({ status: nextStatus })
        .eq('id', clientId);

      if (pErr && cErr) {
        throw new Error("Impossible de mettre à jour le statut.");
      }

      toast.success(`Le statut du dossier a été mis à jour à : ${nextStatus}`);
    } catch (e: any) {
      toast.error(e.message || "Erreur de mise à jour.");
    }
  };

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newStatus, setNewStatus] = useState('En attente');
  const [newNeeds, setNewNeeds] = useState({ bookkeeping: true, taxes: true });

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

  const handleUniversalExport = (client: ClientRecord, format: 'excel' | 'qb' | 'sage') => {
    toast.info(`Préparation de l'export ${format.toUpperCase()}...`);
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

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newEmail) {
      toast.error("Veuillez saisir au moins le nom et le courriel.");
      return;
    }
    if (onAddClient) {
      const needsArray = [];
      if (newNeeds.bookkeeping) needsArray.push('Tenue de livres');
      if (newNeeds.taxes) needsArray.push('Impôts');
      
      const success = await onAddClient({
        displayName: newClientName,
        companyName: newCompanyName || 'Particulier',
        email: newEmail,
        status: newStatus,
        needs: needsArray
      });

      if (success) {
        setShowAddModal(false);
        setNewClientName('');
        setNewCompanyName('');
        setNewEmail('');
        setNewStatus('En attente');
      }
    }
  };

  const renderNeeds = (client: ClientRecord) => {
    if (!client.needs) return <span className="text-slate-600 text-xs italic">{t('adminClients.consultation')}</span>;
    if (Array.isArray(client.needs)) {
      if (client.needs.length === 0) return <span className="text-slate-600 text-xs italic">{t('adminClients.consultation')}</span>;
      return client.needs.map(n => (
        <span key={n} className="inline-block mr-1">
          <Badge variant="default" className="text-xs">{n}</Badge>
        </span>
      ));
    }
    if (typeof client.needs === 'object') {
      const badges = [];
      for (const svc of SERVICE_CATALOG) {
        if ((client.needs as Record<string, boolean>)[svc.id]) {
          badges.push(
            <span key={svc.id} className="inline-block mr-1">
              <Badge variant="default" className="text-xs">
                {svc.code}
              </Badge>
            </span>
          );
        }
      }
      if (badges.length === 0) return <span className="text-slate-600 text-xs italic">{t('adminClients.consultation')}</span>;
      return badges;
    }
    return <Badge variant="default" className="text-[9px]">{String(client.needs)}</Badge>;
  };

  const enAttente = clients.filter(c => c.status === 'En attente' || c.status.includes('Nouveau') || c.status.includes('attente')).length;
  const enRegle = clients.filter(c => c.status === 'En règle' || c.status === 'Actif').length;
  const aReviser = clients.filter(c => c.status === 'À réviser').length;

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-serif font-medium text-ivoire tracking-tight">{t('adminClients.title')} <span className="text-gold italic">{t('adminClients.titleAccent')}</span></h1>
          <p className="text-slate-400 mt-1.5 text-sm font-light uppercase tracking-widest">{t('adminClients.subtitle')}</p>
        </div>
        {onAddClient && (
          <Button variant="gold" className="gap-2 h-12 rounded-2xl text-xs font-black uppercase tracking-widest shadow-glow" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> {t('adminClients.newClient')}
          </Button>
        )}
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 flex items-center gap-6 border-gold/10">
           <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center text-gold"><Users size={28}/></div>
           <div>
              <p className="text-2xl font-serif text-silver">{enAttente}</p>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{t('adminClients.newMandates')}</p>
           </div>
        </Card>
        <Card className="p-6 flex items-center gap-6 border-green-500/10">
           <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500"><CheckCircle size={28}/></div>
           <div>
              <p className="text-2xl font-serif text-silver">{enRegle}</p>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{t('adminClients.compliant')}</p>
           </div>
        </Card>
        <Card className="p-6 flex items-center gap-6 border-red-500/10">
           <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500"><Clock size={28}/></div>
           <div>
              <p className="text-2xl font-serif text-silver">{aReviser}</p>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{t('adminClients.actionRequired')}</p>
           </div>
        </Card>
      </div>

      {/* Clients Table — desktop */}
      <Card className="p-0 overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">{t('adminClients.colIdentity')}</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">{t('adminClients.colServices')}</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">{t('adminClients.colStatus')}</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">{t('adminClients.colActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {clients.map((client) => {
                const isExpanded = expandedClientId === client.id;
                return (
                  <React.Fragment key={client.id}>
                    <tr className={`hover:bg-white/5 transition-colors group ${isExpanded ? 'bg-white/[0.02]' : ''}`}>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => setExpandedClientId(prev => prev === client.id ? null : client.id)}
                            className="p-1.5 rounded-xl hover:bg-white/5 text-slate-500 hover:text-gold transition-all"
                            title={isExpanded ? "Réduire" : "Vérifier les fichiers"}
                          >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                          <div className="flex flex-col">
                            <span 
                              className="text-silver font-bold cursor-pointer hover:text-gold transition-colors"
                              onClick={() => setExpandedClientId(prev => prev === client.id ? null : client.id)}
                            >
                              {client.displayName}
                            </span>
                            <span className="text-xs text-slate-500">{client.companyName || t('adminClients.individual')}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-wrap gap-2">{renderNeeds(client)}</div>
                      </td>
                      <td className="px-8 py-6">
                        <Badge variant={client.status === 'En règle' || client.status === 'Actif' ? 'success' : (client.status === 'À réviser' ? 'error' : 'warning')}>
                          {client.status}
                        </Badge>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                           <div className="flex gap-1 bg-noir/50 p-1 rounded-xl border border-white/5">
                              <button onClick={() => handleUniversalExport(client, 'excel')} className="p-2 hover:text-gold transition-colors" title="Export Excel"><FileSpreadsheet size={16}/></button>
                              <button onClick={() => handleUniversalExport(client, 'qb')} className="p-2 hover:text-gold transition-colors" title="Export QuickBooks"><Calculator size={16}/></button>
                              <button onClick={() => handleUniversalExport(client, 'sage')} className="p-2 hover:text-gold transition-colors" title="Export Sage"><Database size={16}/></button>
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
                    {isExpanded && (
                      <tr className="bg-black/35">
                        <td colSpan={4} className="px-8 py-6">
                          <ClientFileAuditSection client={client} onUpdateStatus={handleUpdateStatus} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Clients Cards — mobile */}
      <div className="md:hidden space-y-4">
        {clients.map((client) => {
          const isExpanded = expandedClientId === client.id;
          return (
            <Card key={client.id} className="p-5 space-y-4 glass-card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setExpandedClientId(prev => prev === client.id ? null : client.id)}
                    className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-gold transition-colors"
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <div>
                    <p 
                      className="font-bold text-silver cursor-pointer hover:text-gold"
                      onClick={() => setExpandedClientId(prev => prev === client.id ? null : client.id)}
                    >
                      {client.displayName}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{client.companyName || 'Individuel'}</p>
                  </div>
                </div>
                <Badge variant={client.status === 'En règle' || client.status === 'Actif' ? 'success' : (client.status === 'À réviser' ? 'error' : 'warning')}>
                  {client.status}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">{renderNeeds(client)}</div>
              <div className="flex items-center gap-2 pt-2 border-t border-white/5 flex-wrap">
                <div className="flex gap-1 bg-noir/50 p-1 rounded-xl border border-white/5">
                  <button onClick={() => handleUniversalExport(client, 'excel')} className="p-2 hover:text-gold transition-colors text-slate-500" title="Excel"><FileSpreadsheet size={15}/></button>
                  <button onClick={() => handleUniversalExport(client, 'qb')} className="p-2 hover:text-gold transition-colors text-slate-500" title="QuickBooks"><Calculator size={15}/></button>
                  <button onClick={() => handleUniversalExport(client, 'sage')} className="p-2 hover:text-gold transition-colors text-slate-500" title="Sage"><Database size={15}/></button>
                </div>
                <Button variant="ghost" size="sm" className="gap-1.5 text-[10px] uppercase font-bold h-9 px-3 flex-1" onClick={() => handleAdminExport(client)}>
                  <Download size={13}/> Rapport
                </Button>
                <label className="cursor-pointer flex-1">
                  <div className="h-9 px-3 rounded-xl bg-gold/10 text-gold text-[10px] font-bold uppercase flex items-center justify-center gap-1.5 hover:bg-gold hover:text-noir transition-all">
                    <UploadCloud size={13}/> Livrer
                  </div>
                  <input type="file" className="hidden" onChange={(e) => handleAdminUpload(e, client.id)} />
                </label>
              </div>
              {isExpanded && (
                <div className="pt-4 border-t border-white/5">
                  <ClientFileAuditSection client={client} onUpdateStatus={handleUpdateStatus} />
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] bg-noir/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="max-w-xl w-full">
            <Card className="p-8 premium-border-gold relative" glow="gold">
              <button 
                onClick={() => setShowAddModal(false)} 
                className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center bg-white/5 text-slate-400 hover:text-gold transition-all"
              >
                <X size={20} />
              </button>
              
              <h3 className="text-2xl font-serif font-bold text-ivoire italic mb-6">Nouveau <span className="text-gold">Mandat Client</span></h3>
              
              <form onSubmit={handleCreateClient} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">Nom Complet</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="ex: Jean Tremblay" 
                    className="w-full h-12 bg-midnight border border-white/10 rounded-xl px-4 text-silver text-sm outline-none focus:border-gold/50 transition-all"
                    value={newClientName}
                    onChange={e => setNewClientName(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">Raison Sociale (Optionnel)</label>
                  <input 
                    type="text" 
                    placeholder="ex: Tremblay Holdings Inc." 
                    className="w-full h-12 bg-midnight border border-white/10 rounded-xl px-4 text-silver text-sm outline-none focus:border-gold/50 transition-all"
                    value={newCompanyName}
                    onChange={e => setNewCompanyName(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">Courriel</label>
                  <input 
                    type="email" 
                    required 
                    placeholder="ex: jean@tremblay.ca" 
                    className="w-full h-12 bg-midnight border border-white/10 rounded-xl px-4 text-silver text-sm outline-none focus:border-gold/50 transition-all"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400">Statut Dossier</label>
                    <select 
                      className="w-full h-12 bg-midnight border border-white/10 rounded-xl px-4 text-silver text-sm outline-none focus:border-gold/50 transition-all"
                      value={newStatus}
                      onChange={e => setNewStatus(e.target.value)}
                    >
                      <option value="En règle">En règle</option>
                      <option value="En attente">En attente</option>
                      <option value="À réviser">À réviser</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 block">Besoins du Mandat</label>
                    <div className="flex gap-4 items-center h-10">
                      <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={newNeeds.bookkeeping} 
                          onChange={e => setNewNeeds(prev => ({ ...prev, bookkeeping: e.target.checked }))}
                          className="accent-gold"
                        />
                        Tenue
                      </label>
                      <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={newNeeds.taxes} 
                          onChange={e => setNewNeeds(prev => ({ ...prev, taxes: e.target.checked }))}
                          className="accent-gold"
                        />
                        Impôts
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-6 flex justify-end gap-4">
                  <Button variant="ghost" type="button" onClick={() => setShowAddModal(false)} className="h-12 px-6 text-xs uppercase font-bold text-slate-500">Annuler</Button>
                  <Button variant="gold" type="submit" className="h-12 px-10 text-xs uppercase font-bold shadow-glow">Enregistrer Client</Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      )}
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
  } else if (typeof needs === 'string') {
    activeNeeds[needs] = true;
  }

  const hasNeed = (keys: string[]) => keys.some(key => 
    activeNeeds[key] === true || 
    (typeof needs === 'string' && keys.some(k => needs.toLowerCase().includes(k.toLowerCase()))) ||
    (Array.isArray(needs) && needs.some(val => keys.some(k => String(val).toLowerCase().includes(k.toLowerCase()))))
  );

  if (hasNeed(['bookkeeping', 'hourlyBookkeeping', 'monthlyMicro', 'monthlySmall', 'monthlySme', 'catchUp', 'tenue', 'livres'])) {
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

  if (hasNeed(['payroll', 't4Releve1', 'paie', 'salaires'])) {
    list.push({
      id: 'payroll',
      label: 'Registre des Employés & Heures de Paie',
      category: 'payroll',
      required: true
    });
  }

  if (hasNeed(['gstQst', 'taxes', 'tps', 'tvq'])) {
    list.push({
      id: 'fiscal',
      label: 'Rapports des Ventes / Taxes (TPS/TVQ)',
      category: 'fiscal',
      required: true
    });
  }

  if (hasNeed(['taxHelpAutonomous', 'taxes_biz', 'taxes_perso', 'impôt', 'impot'])) {
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

function ClientFileAuditSection({ 
  client,
  onUpdateStatus
}: { 
  client: ClientRecord,
  onUpdateStatus: (clientId: string, nextStatus: string) => Promise<void>
}) {
  const { documents, loading, getSecureDownloadUrl } = useDocuments(client.id);
  const [updating, setUpdating] = useState(false);

  const handleDownload = async (urlPath: string, fileName: string) => {
    const signedUrl = await getSecureDownloadUrl(urlPath);
    if (signedUrl) {
      window.open(signedUrl, '_blank');
    } else {
      toast.error("Impossible de récupérer l'URL de téléchargement sécurisé.");
    }
  };

  const handleLocalStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUpdating(true);
    await onUpdateStatus(client.id, e.target.value);
    setUpdating(false);
  };

  const checklistItems = getRequiredChecklistForServices(client.needs);
  
  return (
    <div className="bg-black/40 p-6 rounded-2xl border border-white/5 space-y-6 text-left my-2 animate-in fade-in duration-300">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <h4 className="text-base font-serif font-bold text-ivoire">📁 Audit & Vérification des Pièces Comptables</h4>
          <p className="text-xs text-slate-400 mt-0.5">Vérifiez les pièces justificatives fournies par le client pour lancer son dossier.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-400">Statut Dossier :</label>
          <select 
            value={client.status} 
            onChange={handleLocalStatusChange}
            disabled={updating}
            className="bg-midnight border border-white/10 rounded-xl px-3 py-1.5 text-xs text-silver outline-none focus:border-gold/50 transition-all font-bold"
          >
            <option value="En règle">En règle</option>
            <option value="En attente">En attente</option>
            <option value="À réviser">À réviser</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Checklist des pièces */}
        <div className="space-y-3">
          <h5 className="text-xs font-bold text-gold uppercase tracking-widest">Checklist de Conformité</h5>
          <div className="space-y-2.5">
            {checklistItems.map(item => {
              const docFound = documents.find(d => d.category === item.category);
              return (
                <div key={item.id} className="flex justify-between items-center bg-[#0d0d0d] p-3.5 rounded-xl border border-white/5">
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-silver">{item.label}</p>
                    {docFound ? (
                      <p className="text-[10px] text-green-400 truncate mt-0.5">✓ Fichier : {docFound.fileName}</p>
                    ) : (
                      <p className="text-[10px] text-amber-500 mt-0.5">⚠ Manquant</p>
                    )}
                  </div>
                  {docFound ? (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 text-[10px] gap-1 px-3 border-green-500/20 text-green-400 hover:bg-green-500/10 hover:text-green-300"
                      onClick={() => handleDownload(docFound.url || '', docFound.fileName)}
                    >
                      <Download size={12}/> Télécharger
                    </Button>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 shrink-0">
                      En attente
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tous les documents du client */}
        <div className="space-y-3">
          <h5 className="text-xs font-bold text-gold uppercase tracking-widest">Coffre-fort client ({documents.length} fichiers)</h5>
          {loading ? (
            <p className="text-xs text-slate-500 italic">Chargement du coffre-fort...</p>
          ) : documents.length === 0 ? (
            <p className="text-xs text-slate-500 italic">Aucun document déposé dans le coffre-fort pour le moment.</p>
          ) : (
            <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar">
              {documents.map(doc => (
                <div key={doc.id} className="flex justify-between items-center bg-[#0d0d0d] p-2.5 rounded-xl border border-white/5">
                  <div className="min-w-0 pr-2">
                    <p className="text-xs text-silver truncate font-medium">{doc.fileName}</p>
                    <div className="flex gap-2 text-[9px] text-slate-500 mt-0.5 uppercase tracking-wider">
                      <span>Catégorie: <strong className="text-gold">{doc.category}</strong></span>
                      <span>•</span>
                      <span>Taille: {doc.fileSize}</span>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 text-[9px] gap-1 px-2.5 border-white/10 text-slate-400 hover:text-gold"
                    onClick={() => handleDownload(doc.url || '', doc.fileName)}
                  >
                    <Download size={10}/> Télécharger
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

