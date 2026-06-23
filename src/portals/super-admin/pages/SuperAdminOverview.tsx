import { Card } from '../../../components/ui/Card';
import { Users, Shield, FileText, DollarSign, Clock, MapPin, Tags, Calculator } from 'lucide-react';
import { Link } from 'react-router-dom';
import { OrganicLoader } from '../../../components/ui/OrganicLoader';
import { useLanguage } from '../../../hooks/useLanguage';
import { useSuperAdminLiveStats } from '../../../hooks/useSuperAdminLiveStats';
import { getPortalPath } from '../../config/paths';

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

      {/* 🏛️ PROTOCOLE DE COLLABORATION CABINET */}
      <section className="space-y-6 mt-12">
        <h2 className="text-xl font-serif font-bold text-ivoire flex items-center gap-2">
          <span>🏛️</span> PROTOCOLE DE COLLABORATION CABINET (MMXXVI)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card className="p-6 space-y-4 glass-card relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-gold font-bold text-xs uppercase tracking-widest">Étape 1</span>
              <span className="text-slate-500 text-xs font-mono">Accueil</span>
            </div>
            <h3 className="font-serif font-bold text-lg text-ivoire">1. L'Accueil (Intake)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dès qu'un client dit « Je veux vos services ». Ouvrez le dossier informatique, ajoutez le client dans Excel, envoyez le contrat et la liste des documents requis.
            </p>
            <div className="text-[11px] bg-white/5 p-3 rounded-lg text-slate-400 border border-white/5">
              <strong>Action d'équipe :</strong> Inscrivez votre nom sous « Pris en charge par » et passez le statut à <span className="text-amber-400 font-bold">En attente de documents</span>.
            </div>
          </Card>

          <Card className="p-6 space-y-4 glass-card relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-gold font-bold text-xs uppercase tracking-widest">Étape 2</span>
              <span className="text-slate-500 text-xs font-mono">Attente</span>
            </div>
            <h3 className="font-serif font-bold text-lg text-ivoire">2. La Récolte (Documents)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              En attente des documents. Si des fichiers sont téléversés, mettez Excel à jour. Après une semaine sans nouvelles, envoyez un rappel amical par courriel.
            </p>
            <div className="text-[11px] bg-white/5 p-3 rounded-lg text-slate-400 border border-white/5">
              <strong>Action d'équipe :</strong> Dès que tous les documents sont reçus, passez le statut à <span className="text-sky-400 font-bold">Prêt à traiter</span> (lancement de la production).
            </div>
          </Card>

          <Card className="p-6 space-y-4 glass-card relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-gold font-bold text-xs uppercase tracking-widest">Étape 3</span>
              <span className="text-slate-500 text-xs font-mono">Production</span>
            </div>
            <h3 className="font-serif font-bold text-lg text-ivoire">3. L'Action (Chiffres)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Toi ou Sylvie débutez la production dans le logiciel comptable (Sage/Quickbooks/Impôt). Regroupez toutes vos questions en un seul envoi pour limiter le dérangement.
            </p>
            <div className="text-[11px] bg-white/5 p-3 rounded-lg text-slate-400 border border-white/5">
              <strong>Action d'équipe :</strong> Inscrivez votre nom sous « Pris en charge par » et passez le statut à <span className="text-sky-400 font-bold">En cours de production</span>.
            </div>
          </Card>

          <Card className="p-6 space-y-4 glass-card relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-gold font-bold text-xs uppercase tracking-widest">Étape 4</span>
              <span className="text-slate-500 text-xs font-mono">Clôture</span>
            </div>
            <h3 className="font-serif font-bold text-lg text-ivoire">4. La Finale (Facture & Envoi)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Production complétée. Envoyez le brouillon pour signature électronique (DocuSign) et la facture de services (Interac). Ne transmettez rien avant approbation et paiement.
            </p>
            <div className="text-[11px] bg-white/5 p-3 rounded-lg text-slate-400 border border-white/5">
              <strong>Action d'équipe :</strong> Statut <span className="text-amber-400 font-bold">En attente de paiement/signature</span>. Une fois payé et transmis : <span className="text-green-400 font-bold">Terminé</span>.
            </div>
          </Card>
        </div>

        {/* Code de couleurs visuel */}
        <Card className="p-8 premium-border-gold relative overflow-hidden" glow="gold">
          <h3 className="font-serif font-bold text-lg text-ivoire mb-4">🎨 Code Couleur de Suivi des Statuts (Excel)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <span className="w-3.5 h-3.5 rounded-full bg-amber-500 shrink-0" />
              <div>
                <p className="font-bold text-amber-200">Jaune : En Attente</p>
                <p className="text-slate-500 text-[11px] mt-0.5">Le ballon est dans le camp du client (documents manquants, signatures, paiement).</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-sky-500/10 border border-sky-500/20 rounded-xl">
              <span className="w-3.5 h-3.5 rounded-full bg-sky-500 shrink-0" />
              <div>
                <p className="font-bold text-sky-200">Bleu : Prêt / En Cours</p>
                <p className="text-slate-500 text-[11px] mt-0.5">Le ballon est chez ComptaFlow (traitement, saisie et révision comptable).</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
              <span className="w-3.5 h-3.5 rounded-full bg-green-500 shrink-0" />
              <div>
                <p className="font-bold text-green-200">Vert : Terminé</p>
                <p className="text-slate-500 text-[11px] mt-0.5">Dossier officiellement fermé, déclarations transmises aux gouvernements.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <span className="w-3.5 h-3.5 rounded-full bg-red-500 shrink-0" />
              <div>
                <p className="font-bold text-red-200">Rouge : Bloqué</p>
                <p className="text-slate-500 text-[11px] mt-0.5">Problème urgent (ex: document manquant critique ou erreur système).</p>
              </div>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
