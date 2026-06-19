import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Card } from '../../../components/ui/Card';
import { Search, ShieldAlert } from 'lucide-react';
import { OrganicLoader } from '../../../components/ui/OrganicLoader';
import { useLanguage } from '../../../hooks/useLanguage';
import { LanguageCode } from '../../../lib/i18n';

const localeMap: Record<LanguageCode, string> = {
  fr: 'fr-CA',
  en: 'en-CA',
  ar: 'ar-CA',
};

export function SuperAdminClients() {
  const { t, lang } = useLanguage();
  const locale = localeMap[lang] || 'fr-CA';
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadClients() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*, sub_admin:profiles!sub_admin_id(full_name, email)')
          .eq('role', 'client')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setClients(data || []);
      } catch (err) {
        console.error('Erreur lors de la récupération globale des clients :', err);
      } finally {
        setLoading(false);
      }
    }
    loadClients();
  }, []);

  const filteredClients = clients.filter((c) => {
    const query = searchQuery.toLowerCase();
    return (
      (c.full_name || '').toLowerCase().includes(query) ||
      (c.email || '').toLowerCase().includes(query) ||
      (c.sub_admin?.full_name || '').toLowerCase().includes(query)
    );
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

        <div className="relative w-full md:w-[350px]">
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center text-slate-500 italic">
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
