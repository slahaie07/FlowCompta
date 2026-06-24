import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Search, ShieldAlert, UserPlus, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { OrganicLoader } from '../../../components/ui/OrganicLoader';
import { useLanguage } from '../../../hooks/useLanguage';
import { LanguageCode } from '../../../lib/i18n';
import { toast } from 'sonner';
import { useDocuments } from '../../../hooks/useDocuments';

const localeMap: Record<LanguageCode, string> = {
  fr: 'fr-CA',
  en: 'en-CA',
  ar: 'ar-CA',
};

interface ClientRow {
  id: string;
  full_name: string | null;
  display_name: string | null;
  email: string | null;
  created_at: string;
  status: string | null;
  needs: any;
  sub_admin_id: string | null;
  sub_admin?: { full_name: string | null; email: string | null } | null;
}

function normalizeClientRow(row: {
  id: string;
  full_name: string | null;
  display_name: string | null;
  email: string | null;
  created_at: string;
  status: string | null;
  needs: any;
  sub_admin_id: string | null;
  sub_admin?: { full_name: string | null; email: string | null } | { full_name: string | null; email: string | null }[] | null;
}): ClientRow {
  const subAdmin = row.sub_admin;
  return {
    ...row,
    sub_admin: Array.isArray(subAdmin) ? subAdmin[0] ?? null : subAdmin ?? null,
  };
}

interface SubAdminOption {
  id: string;
  full_name: string | null;
  email: string | null;
}

export function SuperAdminClients() {
  const { t, lang } = useLanguage();
  const locale = localeMap[lang] || 'fr-CA';
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [subAdmins, setSubAdmins] = useState<SubAdminOption[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [partnerFilter, setPartnerFilter] = useState<string>('all');
  const [assignDraft, setAssignDraft] = useState<Record<string, string>>({});
  const [assigningId, setAssigningId] = useState<string | null>(null);

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

      toast.success(`Le statut a été mis à jour à : ${nextStatus}`);
      await loadClients();
    } catch (e: any) {
      toast.error(e.message || "Erreur de mise à jour.");
    }
  };

  const loadClients = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: clientData, error }, { data: partnerData }] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, full_name, display_name, email, status, needs, created_at, sub_admin_id, sub_admin:profiles!sub_admin_id(full_name, email)')
          .eq('role', 'client')
          .order('created_at', { ascending: false }),
        supabase.from('profiles').select('id, full_name, email').eq('role', 'sub_admin').order('full_name'),
      ]);

      if (error) throw error;
      setClients((clientData || []).map(normalizeClientRow));
      setSubAdmins(partnerData || []);
    } catch (err) {
      console.error('Erreur lors de la récupération globale des clients :', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients();

    const channel = supabase
      .channel('super_admin_clients')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => loadClients())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadClients]);

  const handleAssign = async (clientId: string) => {
    const subAdminId = assignDraft[clientId];
    if (!subAdminId) {
      toast.error(t('superAdminClients.selectPartnerFirst'));
      return;
    }

    setAssigningId(clientId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ sub_admin_id: subAdminId })
        .eq('id', clientId)
        .eq('role', 'client');

      if (error) throw error;
      toast.success(t('superAdminClients.assignSuccess'));
      await loadClients();
    } catch (err) {
      console.error(err);
      toast.error(t('superAdminClients.assignError'));
    } finally {
      setAssigningId(null);
    }
  };

  const filteredClients = clients.filter((c) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (c.full_name || '').toLowerCase().includes(query) ||
      (c.email || '').toLowerCase().includes(query) ||
      (c.sub_admin?.full_name || '').toLowerCase().includes(query);

    const matchesPartner =
      partnerFilter === 'all' ||
      (partnerFilter === 'orphan' ? !c.sub_admin_id : c.sub_admin_id === partnerFilter);

    return matchesSearch && matchesPartner;
  });

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-serif font-bold text-ivoire tracking-tight leading-tight">
            {t('superAdminClients.title')}{' '}
            <span className="animated-gradient-text italic">{t('superAdminClients.titleAccent')}</span>
          </h1>
          <div className="flex items-center gap-3 mt-3">
            <span className="w-8 h-[1px] bg-gold/50"></span>
            <p className="text-slate-500 text-xs font-black uppercase tracking-[0.4em]">
              {t('superAdminClients.subtitle')}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <select
            value={partnerFilter}
            onChange={(e) => setPartnerFilter(e.target.value)}
            aria-label={t('superAdminClients.filterPartner')}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-gold/50 outline-none font-medium text-ivoire"
          >
            <option value="all">{t('superAdminClients.allPartners')}</option>
            <option value="orphan">{t('superAdminClients.orphanOnly')}</option>
            {subAdmins.map((sa) => (
              <option key={sa.id} value={sa.id}>
                {sa.full_name || sa.email}
              </option>
            ))}
          </select>

          <div className="relative w-full md:w-[320px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} aria-hidden />
            <input
              type="search"
              placeholder={t('superAdminClients.searchPlaceholder')}
              aria-label={t('superAdminClients.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-gold/50 outline-none transition-all placeholder:text-slate-600 font-medium"
            />
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <OrganicLoader label="CLI" size="sm" />
        </div>
      ) : (
        <Card className="p-0 overflow-hidden glass-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.03] text-xs font-black uppercase tracking-[0.3em] text-slate-500 border-b border-white/5">
              <tr>
                <th className="px-8 py-6">{t('superAdminClients.colClient')}</th>
                <th className="px-8 py-6">{t('superAdminClients.colEmail')}</th>
                <th className="px-8 py-6">{t('superAdminClients.colPartner')}</th>
                <th className="px-8 py-6 text-right">{t('superAdminClients.colCreated')}</th>
                <th className="px-8 py-6 text-right">{t('superAdminClients.colAssign')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredClients.length > 0 ? (
                filteredClients.map((c) => {
                  const isExpanded = expandedClientId === c.id;
                  return (
                    <React.Fragment key={c.id}>
                      <tr className={`hover:bg-white/[0.01] transition-colors ${isExpanded ? 'bg-white/[0.02]' : ''}`}>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => setExpandedClientId(prev => prev === c.id ? null : c.id)}
                              className="p-1 rounded-lg hover:bg-white/5 text-slate-500 hover:text-gold transition-colors"
                              title={isExpanded ? "Réduire" : "Vérifier le dossier"}
                            >
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                            <span 
                              className="font-serif font-bold text-ivoire text-base cursor-pointer hover:text-gold transition-colors"
                              onClick={() => setExpandedClientId(prev => prev === c.id ? null : c.id)}
                            >
                              {c.full_name || c.display_name || t('superAdmin.noName')}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-slate-400 font-mono text-xs">{c.email}</td>
                        <td className="px-8 py-6">
                          {c.sub_admin ? (
                            <div className="space-y-0.5">
                              <p className="text-ivoire font-semibold text-sm">{c.sub_admin.full_name}</p>
                              <p className="text-xs text-slate-500 font-mono">{c.sub_admin.email}</p>
                            </div>
                          ) : (
                            <span className="text-amber-500 text-xs italic flex items-center gap-1">
                              <ShieldAlert size={12} aria-hidden /> {t('superAdminClients.orphan')}
                            </span>
                          )}
                        </td>
                        <td className="px-8 py-6 text-right text-slate-500 text-xs">
                          {new Date(c.created_at).toLocaleDateString(locale)}
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center justify-end gap-2">
                            <select
                              value={assignDraft[c.id] ?? c.sub_admin_id ?? ''}
                              onChange={(e) =>
                                setAssignDraft((prev) => ({ ...prev, [c.id]: e.target.value }))
                              }
                              aria-label={t('superAdminClients.assignPartner')}
                              className="bg-noir border border-white/10 rounded-lg px-3 py-2 text-xs text-ivoire max-w-[180px]"
                            >
                              <option value="">{t('superAdminClients.choosePartner')}</option>
                              {subAdmins.map((sa) => (
                                <option key={sa.id} value={sa.id}>
                                  {sa.full_name || sa.email}
                                </option>
                              ))}
                            </select>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1 text-gold border border-gold/20"
                              isLoading={assigningId === c.id}
                              onClick={() => handleAssign(c.id)}
                            >
                              <UserPlus size={14} />
                              {t('superAdminClients.assign')}
                            </Button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-black/35">
                          <td colSpan={5} className="px-8 py-6">
                            <ClientFileAuditSection client={c} onUpdateStatus={handleUpdateStatus} />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-slate-500 italic">
                    {t('superAdminClients.noResults')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
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
  client: any,
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
            value={client.status || 'En attente'} 
            onChange={handleLocalStatusChange}
            disabled={updating}
            className="bg-midnight border border-white/10 rounded-xl px-3 py-1.5 text-xs text-silver outline-none focus:border-gold/50 transition-all font-bold text-ivoire"
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
          <h5 className="text-xs font-bold text-gold uppercase tracking-widest font-sans">Checklist de Conformité</h5>
          <div className="space-y-2.5">
            {checklistItems.map(item => {
              const docFound = documents.find(d => d.category === item.category);
              return (
                <div key={item.id} className="flex justify-between items-center bg-[#0d0d0d]/80 p-3.5 rounded-xl border border-white/5">
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
          <h5 className="text-xs font-bold text-gold uppercase tracking-widest font-sans">Coffre-fort client ({documents.length} fichiers)</h5>
          {loading ? (
            <p className="text-xs text-slate-500 italic">Chargement du coffre-fort...</p>
          ) : documents.length === 0 ? (
            <p className="text-xs text-slate-500 italic">Aucun document déposé dans le coffre-fort pour le moment.</p>
          ) : (
            <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar">
              {documents.map(doc => (
                <div key={doc.id} className="flex justify-between items-center bg-[#0d0d0d]/80 p-2.5 rounded-xl border border-white/5">
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

