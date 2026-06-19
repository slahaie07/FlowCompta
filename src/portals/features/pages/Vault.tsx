import { UploadCloud, FileText, Lock, MoreVertical, Search, Filter, AlertCircle, Download, CheckCircle2 } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useDocuments } from '../../../hooks/useDocuments';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { DocumentCategory } from '../../../types';
import { motion } from 'motion/react';
import { OrganicLoader } from '../../../components/ui/OrganicLoader';
import { useLanguage } from '../../../hooks/useLanguage';

export function Vault({ isLoading: dashboardLoading }: { isLoading: boolean }) {
  const { t } = useLanguage();
  const { documents, loading: docsLoading, uploadDocument, getSecureDownloadUrl } = useDocuments();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | DocumentCategory>('all');
  const [isUploading, setIsProcessing] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, category: DocumentCategory = 'general') => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files) as File[];
    setIsProcessing(true);
    
    let successCount = 0;
    for (const file of files) {
       const success = await uploadDocument(file, category);
       if (success) successCount++;
    }

    if (successCount > 0) {
      toast.success(`${successCount} document(s) téléversé(s) avec succès.`);
    } else if (files.length > 0) {
      toast.error("Échec du téléversement.");
    }
    setIsProcessing(false);
  };

  const handleDownload = async (path: string) => {
    const url = await getSecureDownloadUrl(path);
    if (url) window.open(url, '_blank');
    else toast.error("Lien expiré ou accès refusé.");
  };

  const filteredDocs = documents.filter(doc => 
    doc.fileName.toLowerCase().includes(search.toLowerCase()) && 
    (activeFilter === 'all' || doc.category === activeFilter)
  );

  const deliverables = documents.filter(d => d.source === 'admin');
  const clientFiles = documents.filter(d => d.source === 'client');

  if (dashboardLoading || docsLoading) return <div className="p-20 text-center animate-pulse text-gold uppercase tracking-[0.3em] font-bold">Initialisation sécurisée...</div>;

  return (
    <div className="space-y-12 pb-20 md:pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-10">
        <div>
          <h1 className="text-5xl font-serif font-bold text-ivoire tracking-tight leading-tight">Archives <span className="animated-gradient-text italic">Souveraines.</span></h1>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-gold/10 border border-gold/20 rounded-full">
              <Lock size={12} className="text-gold" />
              <span className="text-gold text-xs font-black uppercase tracking-[0.2em]">{t('vault.encrypted')}</span>
            </div>
            <span className="w-8 h-[1px] bg-white/10"></span>
            <p className="text-slate-600 text-xs font-black uppercase tracking-[0.4em]">{t('vault.subtitle')}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="relative w-80 group">
             <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-gold transition-colors duration-500" size={18} />
             <Input placeholder="Recherche sémantique..." className="h-14 pl-14 bg-white/5 border-white/5 rounded-2xl focus:ring-1 focus:ring-gold/20 font-medium" value={search} onChange={e => setSearch(e.target.value)} />
           </div>
           <Button variant="ghost" size="icon" className="h-14 w-14 glass-button rounded-2xl border-white/5"><Filter size={20}/></Button>
        </div>
      </header>

      {/* Livrables Comptables (Priorité Haute) */}
      <section className="space-y-8">
         <h3 className="text-xs font-black text-gold uppercase tracking-[0.3em] flex items-center gap-3">
            <CheckCircle2 size={18} /> Rapports Certifiés du Cabinet
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {deliverables.length === 0 && (
               <Card className="p-20 text-center border-dashed border-white/5 bg-white/[0.01] col-span-full opacity-40">
                  <p className="text-lg font-serif italic text-slate-500">En attente de la première publication stratégique...</p>
               </Card>
            )}
            {deliverables.map(doc => (
               <DocumentCard key={doc.id} doc={doc} onDownload={() => handleDownload(doc.url || '')} />
            ))}
         </div>
      </section>

      {/* Smart Tasks Section */}
      <section className="space-y-8">
         <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
            <AlertCircle size={18} className="text-red-400" /> Flux de conformité requis
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SmartTask label="Avis de Cotisation (ARC/RQ)" category="FISCAL" onUpload={(e) => handleUpload(e, 'fiscal')} />
            <SmartTask label="Relevé Corporatif Mensuel" category="BANQUE" onUpload={(e) => handleUpload(e, 'bank')} />
         </div>
      </section>

      {/* Main Upload Zone */}
      <Card className="relative p-20 flex flex-col items-center justify-center border-dashed border-white/10 hover:border-gold/40 hover:bg-white/[0.02] transition-all duration-700 group cursor-pointer overflow-hidden premium-border-gold" glow="gold">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold/30 to-transparent animate-pulse" />
        <div className="w-24 h-24 bg-noir/50 rounded-[2.5rem] flex items-center justify-center text-gold mb-8 border border-gold/10 shadow-[0_0_50px_rgba(212,175,55,0.1)] group-hover:scale-110 group-hover:shadow-[0_0_70px_rgba(212,175,55,0.2)] transition-all duration-700">
          {isUploading ? <OrganicLoader label="DEP" size="sm" /> : <UploadCloud size={40} />}
        </div>
        <h3 className="text-3xl font-serif text-ivoire mb-3 italic font-bold">Portail de Dépôt Sécurisé</h3>
        <p className="text-sm text-slate-500 mb-10 text-center max-w-md font-medium leading-relaxed">
          Déposez vos pièces justificatives brutes. <br/>
          Notre IA procède à l'extraction et au scellage numérique AES-256.
        </p>
        <label className="cursor-pointer relative z-10">
           <Button variant="gold" className="px-16 h-16 uppercase tracking-[0.2em] font-black text-xs rounded-2xl shadow-glow group-hover:scale-105 transition-transform" asChild><span>Initier Téléversement</span></Button>
           <input type="file" className="hidden" multiple onChange={(e) => handleUpload(e, 'general')} disabled={isUploading} />
        </label>
      </Card>

      {/* Client History Table */}
      <section className="space-y-8">
         <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
            <FileText size={18} /> Journal des Dépôts Clients
         </h3>
         <Card className="p-0 overflow-hidden glass-card">
            <table className="w-full text-left text-sm">
               <thead className="bg-white/[0.03] text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 border-b border-white/5">
                  <tr>
                     <th className="px-10 py-6">Désignation Digitale</th>
                     <th className="px-10 py-6">Nature</th>
                     <th className="px-10 py-6 text-right">Poids</th>
                     <th className="px-10 py-6 text-right">Horodatage</th>
                     <th className="px-10 py-6"></th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {clientFiles.map(doc => (
                     <tr key={doc.id} className="hover:bg-white/[0.04] transition-all duration-500 group">
                        <td className="px-10 py-8">
                           <div className="flex items-center gap-6">
                              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-gold border border-white/5 group-hover:border-gold/20 transition-all duration-500"><FileText size={20}/></div>
                              <div className="flex flex-col">
                                <span className="text-ivoire font-bold text-base group-hover:text-gold transition-colors">{doc.fileName}</span>
                                {doc.metadata?.type && (
                                  <span className="text-[9px] text-gold font-black uppercase tracking-[0.2em] mt-1.5 px-2 py-0.5 bg-gold/10 rounded-md w-fit">
                                    SYNTHÈSE IA : {doc.metadata.type} {doc.metadata.montant_total ? `— ${doc.metadata.montant_total}$` : ''}
                                  </span>
                                )}
                              </div>
                           </div>
                        </td>
                        <td className="px-10 py-8"><Badge variant="default" className="bg-white/5 text-slate-500 border-white/5 font-black uppercase text-[9px] tracking-widest py-1.5 px-4">{doc.category}</Badge></td>
                        <td className="px-10 py-8 text-right text-slate-500 font-black text-[10px] uppercase tracking-tighter">{doc.fileSize}</td>
                        <td className="px-10 py-8 text-right text-slate-500 font-bold text-[10px] uppercase tracking-widest">{new Date(doc.uploadDate).toLocaleDateString('fr-CA')}</td>
                        <td className="px-10 py-8 text-right">
                           <button onClick={() => handleDownload(doc.url || '')} className="p-3 hover:bg-white/10 rounded-xl text-slate-500 hover:text-gold transition-all duration-500"><Download size={20}/></button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </Card>
      </section>
    </div>
  );
}

function DocumentCard({ doc, onDownload }: { key?: any; doc: any; onDownload: () => void | Promise<void> }) {
  return (
    <Card className="p-10 bg-white/[0.02] border-gold/20 flex flex-col justify-between h-56 group hover:scale-[1.02] hover:border-gold/50 transition-all duration-700 cursor-pointer relative overflow-hidden" onClick={() => onDownload()}>
       <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 blur-2xl rounded-full -mr-12 -mt-12 group-hover:bg-gold/10 transition-colors" />
       <div className="flex justify-between items-start relative z-10">
          <div className="w-16 h-16 rounded-[1.5rem] bg-gold/10 flex items-center justify-center text-gold border border-gold/20 group-hover:bg-gold group-hover:text-midnight transition-all duration-700 shadow-[0_0_20px_rgba(212,175,55,0.1)]">
             <FileText size={32} />
          </div>
          <Badge variant="gold" className="bg-gold text-midnight font-black uppercase text-[8px] tracking-[0.2em] py-1 px-3">Livrable Officiel</Badge>
       </div>
       <div className="space-y-2 relative z-10">
          <p className="text-lg font-black text-ivoire group-hover:text-gold transition-colors truncate">{doc.fileName}</p>
          <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em]">{new Date(doc.uploadDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</p>
       </div>
    </Card>
  );
}

function SmartTask({ label, category, onUpload }: { label: string, category: string, onUpload: (e: any) => void }) {
  return (
    <div className="p-8 rounded-[2rem] bg-white/[0.01] border border-white/5 flex items-center justify-between group hover:border-gold/40 hover:bg-gold/[0.02] transition-all duration-700">
       <div className="flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-red-400/5 flex items-center justify-center text-red-400/40 group-hover:bg-gold/10 group-hover:text-gold border border-transparent group-hover:border-gold/20 transition-all duration-700">
             <FileText size={24} />
          </div>
          <div>
             <p className="text-base font-black text-slate-400 group-hover:text-ivoire transition-colors">{label}</p>
             <p className="text-[9px] text-slate-700 font-black uppercase tracking-[0.3em] mt-1 group-hover:text-gold/50">{category}</p>
          </div>
       </div>
       <label className="cursor-pointer relative overflow-hidden">
          <div className="px-6 py-3 rounded-xl bg-white/5 text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] hover:bg-gold hover:text-midnight hover:shadow-glow-sm transition-all duration-500">Transmettre</div>
          <input type="file" className="hidden" onChange={onUpload} />
       </label>
    </div>
  );
}
