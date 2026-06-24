import { Card } from '../../../components/ui/Card';
import { Users, Shield, FileText, DollarSign, Clock, MapPin, Tags, Calculator, TrendingUp, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { OrganicLoader } from '../../../components/ui/OrganicLoader';
import { useLanguage } from '../../../hooks/useLanguage';
import { useSuperAdminLiveStats } from '../../../hooks/useSuperAdminLiveStats';
import { getPortalPath } from '../../config/paths';
import { RevenueBarChart } from '../../shared/RevenueBarChart';
import { TaxRemittancePanel } from '../../shared/TaxRemittancePanel';

function ProgressBar({ value, max, color = '#D4AF37' }: { value: number; max: number; color?: string }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[10px] font-black text-slate-500 w-8 text-right">{pct}%</span>
    </div>
  );
}

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

  const provinceEntries = (Object.entries(stats.byProvince) as [string, number][]).sort((a, b) => b[1] - a[1]);
  const serviceEntries = (Object.entries(stats.byService) as [string, number][]).sort((a, b) => b[1] - a[1]);
  const maxProvince = Math.max(...provinceEntries.map((e) => e[1]), 1);
  const maxService = Math.max(...serviceEntries.map((e) => e[1]), 1);
  const maxPartnerRevenue = Math.max(...stats.partners.map((p) => p.revenue), 1);

  const SERVICE_LABELS: Record<string, string> = {
    tax_return: 'Déclarations fiscales',
    bookkeeping: 'Tenue de livres',
    payroll: 'Paie',
    incorporation: 'Incorporation',
    financial_statements: 'États financiers',
    tax_planning: 'Planification fiscale',
    gst_hst: 'TPS/TVQ',
    consulting: 'Consultation',
  };

  const totalPaid = stats.paidInvoices;
  const totalAll = stats.totalInvoices;
  const paymentRate = totalAll === 0 ? 0 : Math.round((totalPaid / totalAll) * 100);
  const avgRevenuePerPartner = stats.partners.length > 0 ? stats.totalRevenue / stats.partners.length : 0;
  const topPartner = stats.partners.reduce(
    (best, p) => (p.revenue > (best?.revenue ?? -1) ? p : best),
    null as typeof stats.partners[0] | null,
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

      {/* Calculator CTA */}
      <Link
        to={getPortalPath('super_admin', 'quote')}
        className="flex items-center justify-between gap-4 rounded-2xl border border-gold/30 bg-gold/5 px-6 py-5 transition hover:bg-gold/10 group"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold group-hover:scale-105 transition-transform">
            <Calculator size={22} />
          </div>
          <div>
            <p className="font-bold text-ivoire">{t('superAdmin.calculatorTitle')}</p>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-xl">{t('superAdmin.calculatorDesc')}</p>
          </div>
        </div>
        <span className="text-xs font-black uppercase tracking-widest text-gold shrink-0">
          {t('superAdmin.openCalculator')} →
        </span>
      </Link>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="p-6 space-y-3 premium-border-gold relative overflow-hidden group" glow="gold">
          <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
            <Shield size={14} className="text-gold" /> {t('superAdmin.subAdmins')}
          </div>
          <div className="text-3xl font-serif font-bold text-ivoire">{stats.subAdminsCount}</div>
        </Card>
        <Card className="p-6 space-y-3 glass-card">
          <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
            <Users size={14} className="text-gold" /> {t('superAdmin.clients')}
          </div>
          <div className="text-3xl font-serif font-bold text-ivoire">{stats.clientsCount}</div>
        </Card>
        <Card className="p-6 space-y-3 glass-card">
          <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
            <FileText size={14} className="text-gold" /> {t('superAdmin.totalInvoices')}
          </div>
          <div className="text-3xl font-serif font-bold text-ivoire">{stats.totalInvoices}</div>
          <div className="text-[10px] text-slate-500">{paymentRate}% encaissées</div>
        </Card>
        <Card className="p-6 space-y-3 glass-card">
          <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
            <Clock size={14} className="text-amber-400" /> {t('superAdmin.pendingInvoices')}
          </div>
          <div className="text-3xl font-serif font-bold text-amber-300">{stats.pendingInvoices}</div>
          <div className="text-[10px] text-slate-500">
            {stats.pendingRevenue.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })} à percevoir
          </div>
        </Card>
        <Card className="p-6 space-y-3 glass-card">
          <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
            <DollarSign size={14} className="text-gold" /> {t('superAdmin.paidVolume')}
          </div>
          <div className="text-2xl font-serif font-bold text-ivoire">
            {stats.totalRevenue.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
          </div>
        </Card>
        <Card className="p-6 space-y-3 premium-border-gold" glow="gold">
          <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
            <DollarSign size={14} className="text-amber-500" /> {t('superAdmin.networkCommission')}
          </div>
          <div className="text-2xl font-serif font-bold text-gold">
            {(stats.totalRevenue * 0.05).toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
          </div>
        </Card>
      </div>

      {/* Revenue Chart + Tax Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6 glass-card space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-gold" />
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Revenus réseau — 6 mois</h2>
          </div>
          <RevenueBarChart data={stats.monthlyRevenue} height={140} highlightColor="#D4AF37" />
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/5">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Moy. mensuelle</p>
              <p className="text-sm font-serif font-bold text-ivoire mt-1">
                {stats.monthlyRevenue.length > 0
                  ? (stats.monthlyRevenue.reduce((s, d) => s + d.revenue, 0) / stats.monthlyRevenue.length).toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Mois record</p>
              <p className="text-sm font-serif font-bold text-gold mt-1">
                {stats.monthlyRevenue.length > 0
                  ? Math.max(...stats.monthlyRevenue.map((d) => d.revenue)).toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Moy/comptable</p>
              <p className="text-sm font-serif font-bold text-ivoire mt-1">
                {avgRevenuePerPartner > 0
                  ? avgRevenuePerPartner.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })
                  : '—'}
              </p>
            </div>
          </div>
        </Card>

        <TaxRemittancePanel netRevenue={stats.totalRevenue} province="QC" />
      </div>

      {/* Province + Service breakdown with visual bars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6 glass-card space-y-5">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
            <MapPin size={14} className="text-gold" /> {t('superAdmin.byProvince')}
          </h2>
          {provinceEntries.length === 0 ? (
            <p className="text-slate-500 italic text-sm">{t('superAdmin.noBreakdown')}</p>
          ) : (
            <div className="space-y-3">
              {provinceEntries.map(([province, count]) => (
                <div key={province} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-bold uppercase tracking-wider">{province}</span>
                    <span className="text-ivoire font-serif font-bold">{count} client{count > 1 ? 's' : ''}</span>
                  </div>
                  <ProgressBar value={count} max={maxProvince} color="#D4AF37" />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6 glass-card space-y-5">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
            <Tags size={14} className="text-gold" /> {t('superAdmin.byService')}
          </h2>
          {serviceEntries.length === 0 ? (
            <p className="text-slate-500 italic text-sm">{t('superAdmin.noBreakdown')}</p>
          ) : (
            <div className="space-y-3">
              {serviceEntries.map(([service, count]) => (
                <div key={service} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-bold">{SERVICE_LABELS[service] || service}</span>
                    <span className="text-ivoire font-serif font-bold">{count}</span>
                  </div>
                  <ProgressBar value={count} max={maxService} color="#7C9FD4" />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Partners performance */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-serif font-bold text-ivoire flex items-center gap-2">
            <Award size={18} className="text-gold" /> {t('superAdmin.partnersTitle')}
          </h2>
          {topPartner && (
            <div className="text-[10px] font-black uppercase tracking-widest text-gold/70 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              Top: {topPartner.full_name || topPartner.email}
            </div>
          )}
        </div>
        <Card className="p-0 overflow-hidden glass-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.03] text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 border-b border-white/5">
              <tr>
                <th className="px-6 py-5">{t('superAdmin.colPartner')}</th>
                <th className="px-6 py-5 text-center">{t('superAdmin.colClients')}</th>
                <th className="px-6 py-5">{t('superAdmin.colRevenue')}</th>
                <th className="px-6 py-5 text-right">{t('superAdmin.colRoyalty')}</th>
                <th className="px-6 py-5 text-right">{t('superAdmin.colRegistered')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {stats.partners.length > 0 ? (
                stats.partners
                  .sort((a, b) => b.revenue - a.revenue)
                  .map((sa, idx) => (
                    <tr key={sa.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          {idx === 0 && <span className="text-gold text-xs">★</span>}
                          <div>
                            <p className="font-serif font-bold text-ivoire">{sa.full_name || t('superAdmin.noName')}</p>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">{sa.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center font-bold text-ivoire">{sa.clientsCount}</td>
                      <td className="px-6 py-5 w-64">
                        <div className="space-y-1">
                          <p className="font-serif font-bold text-gold text-sm">
                            {sa.revenue.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                          </p>
                          <ProgressBar value={sa.revenue} max={maxPartnerRevenue} color="#D4AF37" />
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right font-serif font-bold text-amber-500 text-sm">
                        {(sa.revenue * 0.05).toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                      </td>
                      <td className="px-6 py-5 text-right text-slate-500 text-xs">
                        {new Date(sa.created_at).toLocaleDateString('fr-CA')}
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                    {t('superAdmin.noPartners')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </section>

      {/* Protocole de collaboration */}
      <section className="space-y-6 mt-4">
        <h2 className="text-xl font-serif font-bold text-ivoire flex items-center gap-2">
          <span>🏛️</span> PROTOCOLE DE COLLABORATION CABINET (MMXXVI)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[
            {
              step: 'Étape 1', tag: 'Accueil',
              title: "1. L’Accueil (Intake)",
              desc: "Dès qu’un client dit « Je veux vos services ». Ouvrez le dossier informatique, ajoutez le client dans Excel, envoyez le contrat et la liste des documents requis.",
              action: 'Inscrivez votre nom sous « Pris en charge par » et passez le statut à',
              status: 'En attente de documents', statusColor: 'text-amber-400',
            },
            {
              step: 'Étape 2', tag: 'Attente',
              title: '2. La Récolte (Documents)',
              desc: 'En attente des documents. Si des fichiers sont téléversés, mettez Excel à jour. Après une semaine sans nouvelles, envoyez un rappel amical par courriel.',
              action: 'Dès que tous les documents sont reçus, passez le statut à',
              status: 'Prêt à traiter', statusColor: 'text-sky-400',
            },
            {
              step: 'Étape 3', tag: 'Production',
              title: "3. L'Action (Chiffres)",
              desc: 'Toi ou Sylvie débutez la production dans le logiciel comptable (Sage/Quickbooks/Impôt). Regroupez vos questions en un seul envoi pour limiter le dérangement.',
              action: 'Inscrivez votre nom sous « Pris en charge par » et passez le statut à',
              status: 'En cours de production', statusColor: 'text-sky-400',
            },
            {
              step: 'Étape 4', tag: 'Clôture',
              title: '4. La Finale (Facture & Envoi)',
              desc: 'Production complétée. Envoyez le brouillon pour signature électronique (DocuSign) et la facture de services (Interac). Ne transmettez rien avant approbation et paiement.',
              action: 'Statut',
              status: 'En attente de paiement/signature', statusColor: 'text-amber-400',
            },
          ].map((card) => (
            <Card key={card.step} className="p-6 space-y-4 glass-card">
              <div className="flex items-center justify-between">
                <span className="text-gold font-bold text-xs uppercase tracking-widest">{card.step}</span>
                <span className="text-slate-500 text-xs font-mono">{card.tag}</span>
              </div>
              <h3 className="font-serif font-bold text-base text-ivoire">{card.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{card.desc}</p>
              <div className="text-[11px] bg-white/5 p-3 rounded-lg text-slate-400 border border-white/5">
                <strong>Action d'équipe :</strong> {card.action}{' '}
                <span className={`${card.statusColor} font-bold`}>{card.status}</span>.
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6 premium-border-gold" glow="gold">
          <h3 className="font-serif font-bold text-base text-ivoire mb-4">🎨 Code Couleur de Suivi des Statuts (Excel)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {[
              { color: 'bg-amber-500', border: 'border-amber-500/20', bg: 'bg-amber-500/10', label: 'Jaune : En Attente', labelColor: 'text-amber-200', desc: 'Le ballon est dans le camp du client (documents manquants, signatures, paiement).' },
              { color: 'bg-sky-500', border: 'border-sky-500/20', bg: 'bg-sky-500/10', label: 'Bleu : Prêt / En Cours', labelColor: 'text-sky-200', desc: 'Le ballon est chez ComptaFlow (traitement, saisie et révision comptable).' },
              { color: 'bg-green-500', border: 'border-green-500/20', bg: 'bg-green-500/10', label: 'Vert : Terminé', labelColor: 'text-green-200', desc: 'Dossier officiellement fermé, déclarations transmises aux gouvernements.' },
              { color: 'bg-red-500', border: 'border-red-500/20', bg: 'bg-red-500/10', label: 'Rouge : Bloqué', labelColor: 'text-red-200', desc: 'Problème urgent (ex: document manquant critique ou erreur système).' },
            ].map((item) => (
              <div key={item.label} className={`flex items-center gap-3 p-4 ${item.bg} border ${item.border} rounded-xl`}>
                <span className={`w-3.5 h-3.5 rounded-full ${item.color} shrink-0`} />
                <div>
                  <p className={`font-bold ${item.labelColor}`}>{item.label}</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
