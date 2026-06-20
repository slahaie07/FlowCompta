import { Card } from '../../../components/ui/Card';
import { Users, Shield, FileText, DollarSign, Clock, MapPin, Tags } from 'lucide-react';
import { OrganicLoader } from '../../../components/ui/OrganicLoader';
import { useLanguage } from '../../../hooks/useLanguage';
import { useSuperAdminLiveStats } from '../../../hooks/useSuperAdminLiveStats';

export function SuperAdminOverview() {
  const { t } = useLanguage();
  const { stats, loading } = useSuperAdminLiveStats(true);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-8">
        <OrganicLoader label="SUP" size="sm" />
        <p className="text-slate-500 font-serif italic text-lg animate-pulse">{t('superAdmin.loading')}</p>
      </div>
    );
  }

  const provinceEntries = (Object.entries(stats.byProvince) as [string, number][]).sort(
    (a, b) => b[1] - a[1]
  );
  const serviceEntries = (Object.entries(stats.byService) as [string, number][]).sort(
    (a, b) => b[1] - a[1]
  );

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-serif font-bold text-ivoire tracking-tight leading-tight">
            {t('superAdmin.title')} <span className="animated-gradient-text italic">{t('superAdmin.titleAccent')}</span>
          </h1>
          <div className="flex items-center gap-3 mt-3">
            <span className="w-8 h-[1px] bg-gold/50"></span>
            <p className="text-slate-500 text-xs font-black uppercase tracking-[0.4em]">{t('superAdmin.subtitle')}</p>
          </div>
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400/80 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {t('superAdmin.live')}
        </span>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <Card className="p-8 space-y-4 premium-border-gold relative overflow-hidden group" glow="gold">
          <div className="flex items-center gap-3 text-slate-500 text-xs font-black uppercase tracking-[0.2em]">
            <Shield size={16} className="text-gold" /> {t('superAdmin.subAdmins')}
          </div>
          <div className="text-4xl font-serif font-bold text-ivoire">{stats.subAdminsCount}</div>
        </Card>

        <Card className="p-8 space-y-4 glass-card relative overflow-hidden group">
          <div className="flex items-center gap-3 text-slate-500 text-xs font-black uppercase tracking-[0.2em]">
            <Users size={16} className="text-gold" /> {t('superAdmin.clients')}
          </div>
          <div className="text-4xl font-serif font-bold text-ivoire">{stats.clientsCount}</div>
        </Card>

        <Card className="p-8 space-y-4 glass-card relative overflow-hidden group">
          <div className="flex items-center gap-3 text-slate-500 text-xs font-black uppercase tracking-[0.2em]">
            <FileText size={16} className="text-gold" /> {t('superAdmin.totalInvoices')}
          </div>
          <div className="text-4xl font-serif font-bold text-ivoire">{stats.totalInvoices}</div>
        </Card>

        <Card className="p-8 space-y-4 glass-card relative overflow-hidden group">
          <div className="flex items-center gap-3 text-slate-500 text-xs font-black uppercase tracking-[0.2em]">
            <Clock size={16} className="text-amber-400" /> {t('superAdmin.pendingInvoices')}
          </div>
          <div className="text-4xl font-serif font-bold text-ivoire">{stats.pendingInvoices}</div>
        </Card>

        <Card className="p-8 space-y-4 glass-card relative overflow-hidden group">
          <div className="flex items-center gap-3 text-slate-500 text-xs font-black uppercase tracking-[0.2em]">
            <DollarSign size={16} className="text-gold" /> {t('superAdmin.paidVolume')}
          </div>
          <div className="text-4xl font-serif font-bold text-ivoire">
            {stats.totalRevenue.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
          </div>
        </Card>

        <Card className="p-8 space-y-4 premium-border-gold relative overflow-hidden group" glow="gold">
          <div className="flex items-center gap-3 text-slate-500 text-xs font-black uppercase tracking-[0.2em]">
            <DollarSign size={16} className="text-amber-500" /> {t('superAdmin.networkCommission')}
          </div>
          <div className="text-4xl font-serif font-bold text-gold">
            {(stats.totalRevenue * 0.05).toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-8 glass-card space-y-6">
          <h2 className="text-lg font-serif font-bold text-ivoire flex items-center gap-2">
            <MapPin size={18} className="text-gold" /> {t('superAdmin.byProvince')}
          </h2>
          {provinceEntries.length === 0 ? (
            <p className="text-slate-500 italic text-sm">{t('superAdmin.noBreakdown')}</p>
          ) : (
            <ul className="space-y-3">
              {provinceEntries.map(([province, count]) => (
                <li key={province} className="flex justify-between text-sm">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">{province}</span>
                  <span className="text-ivoire font-serif font-bold">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-8 glass-card space-y-6">
          <h2 className="text-lg font-serif font-bold text-ivoire flex items-center gap-2">
            <Tags size={18} className="text-gold" /> {t('superAdmin.byService')}
          </h2>
          {serviceEntries.length === 0 ? (
            <p className="text-slate-500 italic text-sm">{t('superAdmin.noBreakdown')}</p>
          ) : (
            <ul className="space-y-3">
              {serviceEntries.map(([service, count]) => (
                <li key={service} className="flex justify-between text-sm">
                  <span className="text-slate-400 font-mono text-xs">{service}</span>
                  <span className="text-ivoire font-serif font-bold">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <section className="space-y-6">
        <h2 className="text-xl font-serif font-bold text-ivoire flex items-center gap-2">
          <span>💼</span> {t('superAdmin.partnersTitle')}
        </h2>
        <Card className="p-0 overflow-hidden glass-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.03] text-xs font-black uppercase tracking-[0.3em] text-slate-500 border-b border-white/5">
              <tr>
                <th className="px-8 py-6">{t('superAdmin.colPartner')}</th>
                <th className="px-8 py-6">{t('superAdmin.colEmail')}</th>
                <th className="px-8 py-6 text-center">{t('superAdmin.colClients')}</th>
                <th className="px-8 py-6 text-right">{t('superAdmin.colRevenue')}</th>
                <th className="px-8 py-6 text-right">{t('superAdmin.colRoyalty')}</th>
                <th className="px-8 py-6 text-right">{t('superAdmin.colRegistered')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {stats.partners.length > 0 ? (
                stats.partners.map((sa) => (
                  <tr key={sa.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-8 py-6 font-serif font-bold text-ivoire text-base">{sa.full_name || t('superAdmin.noName')}</td>
                    <td className="px-8 py-6 text-slate-400 font-mono text-xs">{sa.email}</td>
                    <td className="px-8 py-6 text-center text-ivoire font-bold">{sa.clientsCount}</td>
                    <td className="px-8 py-6 text-right font-serif font-bold text-gold">
                      {sa.revenue.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                    </td>
                    <td className="px-8 py-6 text-right font-serif font-bold text-amber-500">
                      {(sa.revenue * 0.05).toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                    </td>
                    <td className="px-8 py-6 text-right text-slate-500 text-xs">
                      {new Date(sa.created_at).toLocaleDateString('fr-CA')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-slate-500 italic">
                    {t('superAdmin.noPartners')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </section>
    </div>
  );
}
