import { UploadCloud, FileText, Lock, MoreVertical, Search, Filter, AlertCircle, Download, CheckCircle2 } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useDocuments } from '../hooks/useDocuments';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { DocumentCategory } from '../types';

export function Vault({ isLoading: dashboardLoading }: { isLoading: boolean }) {
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
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-serif font-medium text-silver tracking-tight">Coffre-fort <span className="text-gold italic">Numérique.</span></h1>
          <p className="text-slate-500 mt-1.5 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <Lock size={12} className="text-gold" /> Chiffrement AES-256 Actif
          </p>
        </div>
        <div className="flex items-center gap-3">
           <div className="w-64">
             <Input placeholder="Rechercher..." icon={<Search size={18}/>} value={search} onChange={e => setSearch(e.target.value)} />
           </div>
           <Button variant="secondary" className="gap-2"><Filter size={18}/> Filtres</Button>
        </div>
      </header>

      {/* CPA Deliverables (High Priority) */}
      <section className="space-y-6">
         <h3 className="text-sm font-bold text-gold uppercase tracking-widest flex items-center gap-2">
            <CheckCircle2 size={16} /> Livrables du Cabinet
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deliverables.length === 0 && (
               <Card className="p-10 text-center border-dashed border-white/5 opacity-50 col-span-full">
                  <p className="text-xs text-slate-600 uppercase font-bold italic">Aucun document final n'a encore été déposé par votre CPA.</p>
               </Card>
            )}
            {deliverables.map(doc => (
               <DocumentCard key={doc.id} doc={doc} onDownload={() => handleDownload(doc.url || '')} />
            ))}
         </div>
      </section>

      {/* Smart Tasks Section */}
      <section className="space-y-6">
         <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <AlertCircle size={16} className="text-red-400" /> Actions requises
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SmartTask label="Dernier Avis de Cotisation" category="fiscal" onUpload={(e) => handleUpload(e, 'fiscal')} />
            <SmartTask label="Relevé Bancaire (Mois dernier)" category="bank" onUpload={(e) => handleUpload(e, 'bank')} />
         </div>
      </section>

      {/* Main Upload Zone */}
      <Card className="relative p-12 flex flex-col items-center justify-center border-dashed border-white/10 hover:border-gold/30 hover:bg-white/[0.01] transition-all group cursor-pointer" glow="gold">
        <div className="w-20 h-20 bg-midnight rounded-full flex items-center justify-center text-gold mb-6 border border-white/5 shadow-2xl group-hover:scale-110 transition-transform">
          {isUploading ? <div className="w-8 h-8 border-2 border-gold border-t-transparent animate-spin rounded-full" /> : <UploadCloud size={32} />}
        </div>
        <h3 className="text-xl font-serif text-silver mb-2 italic">Dépôt libre sécurisé</h3>
        <p className="text-xs text-slate-500 mb-8 text-center max-w-sm font-light">Téléversez tout document complémentaire. <br/>Signature numérique appliquée automatiquement.</p>
        <label className="cursor-pointer">
           <Button variant="gold" className="px-10 h-14 uppercase tracking-widest font-bold text-xs" asChild><span>Choisir des fichiers</span></Button>
           <input type="file" className="hidden" multiple onChange={(e) => handleUpload(e, 'general')} disabled={isUploading} />
        </label>
      </Card>

      {/* Client History Table */}
      <section className="space-y-6">
         <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <FileText size={16} /> Archives de mes envois
         </h3>
         <Card className="p-0 overflow-hidden">
            <table className="w-full text-left text-sm">
               <thead className="bg-white/5 text-[10px] uppercase tracking-widest text-slate-500 font-bold border-b border-white/5">
                  <tr>
                     <th className="px-8 py-5">Fichier</th>
                     <th className="px-8 py-5">Catégorie</th>
                     <th className="px-8 py-5 text-right">Taille</th>
                     <th className="px-8 py-5 text-right">Date</th>
                     <th className="px-8 py-5"></th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {clientFiles.map(doc => (
                     <tr key={doc.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-8 py-5">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-gold transition-colors"><FileText size={18}/></div>
                              <span className="text-silver font-medium">{doc.fileName}</span>
                           </div>
                        </td>
                        <td className="px-8 py-5"><Badge variant="default">{doc.category}</Badge></td>
                        <td className="px-8 py-5 text-right text-slate-500 font-light">{doc.fileSize}</td>
                        <td className="px-8 py-5 text-right text-slate-500 font-light">{new Date(doc.uploadDate).toLocaleDateString('fr-CA')}</td>
                        <td className="px-8 py-5 text-right">
                           <button onClick={() => handleDownload(doc.url || '')} className="p-2 hover:bg-white/10 rounded-lg text-slate-600 hover:text-gold transition-all"><Download size={18}/></button>
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

function DocumentCard({ doc, onDownload, key }: { doc: any, onDownload: () => void | Promise<void>, key?: any }) {
  return (
    <Card className="p-6 bg-white/[0.02] border-gold/20 flex flex-col justify-between h-48 group hover:scale-[1.02] transition-all cursor-pointer" onClick={() => onDownload()}>
       <div className="flex justify-between items-start">
          <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold border border-gold/20 group-hover:bg-gold group-hover:text-midnight transition-all">
             <FileText size={24} />
          </div>
          <Badge variant="gold">Livrable CPA</Badge>
       </div>
       <div className="space-y-1">
          <p className="text-sm font-bold text-silver truncate">{doc.fileName}</p>
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">{new Date(doc.uploadDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</p>
       </div>
    </Card>
  );
}

function SmartTask({ label, category, onUpload }: { label: string, category: string, onUpload: (e: any) => void }) {
  return (
    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:border-red-400/30 transition-all">
       <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-400/5 flex items-center justify-center text-red-400/40 group-hover:text-red-400 transition-colors">
             <FileText size={20} />
          </div>
          <div>
             <p className="text-sm font-bold text-slate-300">{label}</p>
             <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter">{category}</p>
          </div>
       </div>
       <label className="cursor-pointer">
          <div className="px-4 py-2 rounded-xl bg-white/5 text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:bg-gold hover:text-midnight transition-all">Déposer</div>
          <input type="file" className="hidden" onChange={onUpload} />
       </label>
    </div>
  );
}
