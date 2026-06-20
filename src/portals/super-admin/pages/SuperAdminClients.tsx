import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Search, ShieldAlert, UserPlus } from 'lucide-react';
import { OrganicLoader } from '../../../components/ui/OrganicLoader';
import { useLanguage } from '../../../hooks/useLanguage';
import { LanguageCode } from '../../../lib/i18n';
import { toast } from 'sonner';

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
  sub_admin_id: string | null;
  sub_admin?: { full_name: string | null; email: string | null } | null;
}

function normalizeClientRow(row: {
  id: string;
  full_name: string | null;
  display_name: string | null;
  email: string | null;
  created_at: string;
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

  const loadClients = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: clientData, error }, { data: partnerData }] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, full_name, display_name, email, created_at, sub_admin_id, sub_admin:profiles!sub_admin_id(full_name, email)')
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
                filteredClients.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-8 py-6 font-serif font-bold text-ivoire text-base">
                      {c.full_name || c.display_name || t('superAdmin.noName')}
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
                ))
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
