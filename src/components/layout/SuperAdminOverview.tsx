import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Card } from '../ui/Card';
import { Users, Shield, FileText, DollarSign, ArrowUpRight } from 'lucide-react';
import { OrganicLoader } from '../ui/OrganicLoader';

export function SuperAdminOverview() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    subAdminsCount: 0,
    clientsCount: 0,
    totalInvoices: 0,
    totalRevenue: 0
  });
  const [subAdmins, setSubAdmins] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // 1. Lire tous les profils pour compter sub_admins et clients
        const { data: profiles, error: pError } = await supabase
          .from('profiles')
          .select('id, role, full_name, email, created_at');
        if (pError) throw pError;

        const subAdminsList = (profiles || []).filter((p: any) => p.role === 'sub_admin');
        const clientsList = (profiles || []).filter((p: any) => p.role === 'client');

        // 2. Lire toutes les factures pour compter les factures et revenus
        const { data: invoices, error: invError } = await supabase
          .from('invoices')
          .select('montant_total, statut, sub_admin_id');
        if (invError) throw invError;

        const totalInvs = invoices?.length || 0;
        const totalRev = (invoices || [])
          .filter((i: any) => i.statut === 'payee')
          .reduce((sum: number, i: any) => sum + parseFloat(i.montant_total || 0), 0);

        setStats({
          subAdminsCount: subAdminsList.length,
          clientsCount: clientsList.length,
          totalInvoices: totalInvs,
          totalRevenue: totalRev
        });

        // 3. Associer le nombre de clients et le chiffre d'affaires à chaque sub_admin
        const mappedSubAdmins = subAdminsList.map((sa: any) => {
          const saClients = clientsList.filter((c: any) => c.sub_admin_id === sa.id).length;
          const saRevenue = (invoices || [])
            .filter((i: any) => i.sub_admin_id === sa.id && i.statut === 'payee')
            .reduce((sum: number, i: any) => sum + parseFloat(i.montant_total || 0), 0);

          return {
            ...sa,
            clientsCount: saClients,
            revenue: saRevenue
          };
        });

        setSubAdmins(mappedSubAdmins);
      } catch (err) {
        console.error("Erreur de chargement des stats SuperAdmin :", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-8">
        <OrganicLoader label="SUP" size="sm" />
        <p className="text-slate-500 font-serif italic text-lg animate-pulse">Chargement de la console Super Admin...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-serif font-bold text-ivoire tracking-tight leading-tight">
            Console <span className="animated-gradient-text italic">Super Admin.</span>
          </h1>
          <div className="flex items-center gap-3 mt-3">
            <span className="w-8 h-[1px] bg-gold/50"></span>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Propriétaire Comptaflow & Analytics globaux</p>
          </div>
        </div>
      </header>

      {/* Grid de Stats Globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <Card className="p-8 space-y-4 premium-border-gold relative overflow-hidden group" glow="gold">
          <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
            <Shield size={16} className="text-gold" /> Comptables (SubAdmins)
          </div>
          <div className="text-4xl font-serif font-bold text-ivoire">
            {stats.subAdminsCount}
          </div>
        </Card>

        <Card className="p-8 space-y-4 glass-card relative overflow-hidden group">
          <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
            <Users size={16} className="text-gold" /> Clients Rattachés
          </div>
          <div className="text-4xl font-serif font-bold text-ivoire">
            {stats.clientsCount}
          </div>
        </Card>

        <Card className="p-8 space-y-4 glass-card relative overflow-hidden group">
          <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
            <FileText size={16} className="text-gold" /> Factures Totales
          </div>
          <div className="text-4xl font-serif font-bold text-ivoire">
            {stats.totalInvoices}
          </div>
        </Card>

        <Card className="p-8 space-y-4 premium-border-gold relative overflow-hidden group" glow="gold">
          <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
            <DollarSign size={16} className="text-gold" /> Chiffre d'Affaires Payé
          </div>
          <div className="text-4xl font-serif font-bold text-gold">
            {stats.totalRevenue.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
          </div>
        </Card>
      </div>

      {/* Liste des cabinets comptables */}
      <section className="space-y-6">
        <h2 className="text-xl font-serif font-bold text-ivoire flex items-center gap-2">
          <span>💼</span> Cabinets Comptables Partenaires
        </h2>
        <Card className="p-0 overflow-hidden glass-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.03] text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 border-b border-white/5">
              <tr>
                <th className="px-8 py-6">Comptable Partenaire</th>
                <th className="px-8 py-6">Adresse Courriel</th>
                <th className="px-8 py-6 text-center">Nombre Clients</th>
                <th className="px-8 py-6 text-right">Chiffre d'Affaires Encaissé</th>
                <th className="px-8 py-6 text-right">Date d'Enregistrement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {subAdmins.length > 0 ? (
                subAdmins.map((sa) => (
                  <tr key={sa.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-8 py-6 font-serif font-bold text-ivoire text-base">{sa.full_name || 'Sans Nom'}</td>
                    <td className="px-8 py-6 text-slate-400 font-mono text-xs">{sa.email}</td>
                    <td className="px-8 py-6 text-center text-ivoire font-bold">{sa.clientsCount}</td>
                    <td className="px-8 py-6 text-right font-serif font-bold text-gold">
                      {sa.revenue.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                    </td>
                    <td className="px-8 py-6 text-right text-slate-500 text-xs">
                      {new Date(sa.created_at).toLocaleDateString('fr-CA')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-slate-500 italic">
                    Aucun comptable partenaire enregistré pour le moment.
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
