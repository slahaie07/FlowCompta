import { useState } from 'react';
import { BarChart3, Users, Clock, TrendingUp, ArrowUpRight, Activity, Send, AlertTriangle, Calculator, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UserData, ClientRecord } from '../../../types';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { useAdminHub } from '../../../hooks/useAdminHub';
import { toast } from 'sonner';
import { OrganicLoader } from '../../../components/ui/OrganicLoader';
import { useLanguage } from '../../../hooks/useLanguage';
import { getPortalPath } from '../../config/paths';

interface AdminOverviewProps {
  userData?: UserData;
}

export function AdminOverview({ userData }: AdminOverviewProps) {
  const { t, lang } = useLanguage();
  const { stats, loading } = useAdminHub();

  // Eya's currency/tax region toggle
  const [taxRegion, setTaxRegion] = useState<'CA' | 'TN'>('CA');

  // Calculator states
  const [calcService, setCalcService] = useState<'student' | 'individual' | 'autonomous' | 'bookkeeping'>('autonomous');
  const [calcProvince, setCalcProvince] = useState<string>('QC');
  const [calcCatchUpHours, setCalcCatchUpHours] = useState<number>(0);
  const [calcSoftwareSetup, setCalcSoftwareSetup] = useState<boolean>(false);
  const [calcPayroll, setCalcPayroll] = useState<boolean>(false);

  const isEya = userData?.email === 'eya-cpa@outlook.com' || userData?.fullName?.includes('Eya') || userData?.displayName?.includes('Eya');

  // Exchange rate: 1 CAD = 2.25 TND
  const exchangeRate = 2.25;
  const currencySymbol = taxRegion === 'TN' ? ' TND' : ' $';

  const formatMoney = (val: number) => {
    const converted = taxRegion === 'TN' ? val * exchangeRate : val;
    return converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + currencySymbol;
  };

  const getCalcResults = () => {
    let base = 0;
    if (calcService === 'student') base = 49.99;
    else if (calcService === 'individual') base = 89.99;
    else if (calcService === 'autonomous') base = 199.99;
    else if (calcService === 'bookkeeping') base = 249.99;

    let addons = 0;
    addons += calcCatchUpHours * 60.00;
    if (calcSoftwareSetup) addons += 225.00;
    if (calcPayroll) addons += 65.00;

    const ht = base + addons;

    // Tax calculation based on province
    let tpsRate = 0.05;
    let tvqRate = 0;
    let tvhRate = 0;

    if (calcProvince === 'QC') {
      tvqRate = 0.09975;
    } else if (['ON', 'NB', 'NL', 'NS', 'PE'].includes(calcProvince)) {
      tpsRate = 0;
      tvhRate = calcProvince === 'ON' ? 0.13 : 0.15;
    } else if (['BC', 'MB', 'SK'].includes(calcProvince)) {
      tvqRate = calcProvince === 'BC' ? 0.07 : calcProvince === 'MB' ? 0.07 : 0.06;
    } else {
      tpsRate = 0.05;
    }

    const tps = ht * tpsRate;
    const tvq = ht * tvqRate;
    const tvh = ht * tvhRate;
    const total = ht + tps + tvq + tvh;

    return {
      base,
      addons,
      ht,
      tps,
      tvq,
      tvh,
      total,
      tpsRate,
      tvqRate,
      tvhRate
    };
  };

  const calc = getCalcResults();

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-8">
      <OrganicLoader label="HUB" size="sm" />
      <p className="text-slate-500 font-serif italic text-lg animate-pulse">{t('adminHub.loading')}</p>
    </div>
  );

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-serif font-bold text-ivoire tracking-tight leading-tight">
            Bienvenue <span className="animated-gradient-text italic">{userData?.displayName || userData?.fullName || 'Admin'}</span>
          </h1>
          <div className="flex items-center gap-3 mt-3">
            <span className="w-8 h-[1px] bg-gold/50"></span>
            <p className="text-slate-500 text-xs font-black uppercase tracking-[0.4em]">{t('adminHub.subtitle')}</p>
          </div>
        </div>
        <Badge variant="gold" className="bg-gold/10 text-gold border-gold/20 py-2 px-6 text-xs font-black uppercase tracking-[0.3em] mb-2">{t('adminHub.badge')}</Badge>
      </header>

      {/* Bouton Bascule "Canada / Tunisie" (Spécifique pour Eya) */}
      {isEya && (
        <div className="flex items-center justify-between gap-6 rounded-2xl border border-gold/20 bg-gold/[0.02] p-6 max-w-xl shadow-[0_0_30px_rgba(212,175,55,0.05)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-2xl">
              {taxRegion === 'CA' ? '🇨🇦' : '🇹🇳'}
            </div>
            <div>
              <p className="font-bold text-ivoire uppercase tracking-wider text-sm">Zone Fiscale Active (Eya)</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Basculez instantanément les normes comptables, les taxes et la devise de référence.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-black uppercase tracking-widest ${taxRegion === 'CA' ? 'text-gold' : 'text-slate-500'}`}>Canada</span>
            <button
              type="button"
              onClick={() => {
                setTaxRegion(prev => prev === 'CA' ? 'TN' : 'CA');
                toast.info(taxRegion === 'CA' ? "Passage aux normes comptables tunisiennes (TND)" : "Retour aux normes canadiennes (CAD)");
              }}
              className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gold/30 bg-gold/20"
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-gold shadow ring-0 transition duration-200 ease-in-out ${
                  taxRegion === 'TN' ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-[10px] font-black uppercase tracking-widest ${taxRegion === 'TN' ? 'text-gold' : 'text-slate-500'}`}>Tunisie</span>
          </div>
        </div>
      )}

      {stats.pendingInteracValidations > 0 && (
        <Link
          to={getPortalPath('sub_admin', 'invoices')}
          className="flex items-center justify-between gap-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-6 py-4 text-amber-200 transition hover:bg-amber-500/15"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-amber-400 shrink-0" />
            <div>
              <p className="font-bold text-sm">
                {stats.pendingInteracValidations} virement{stats.pendingInteracValidations > 1 ? 's' : ''} Interac à confirmer
              </p>
              <p className="text-xs text-amber-200/80 mt-0.5">
                Ouvrez Factures, vérifiez votre banque et saisissez la référence — aucun n8n requis.
              </p>
            </div>
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-amber-400">Voir →</span>
        </Link>
      )}

      <Link
        to={getPortalPath('sub_admin', 'quote')}
        className="flex items-center justify-between gap-4 rounded-2xl border border-gold/30 bg-gold/5 px-6 py-5 transition hover:bg-gold/10 group"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold group-hover:scale-105 transition-transform">
            <Calculator size={22} />
          </div>
          <div>
            <p className="font-bold text-ivoire">{t('adminHub.calculatorTitle')}</p>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-xl">{t('adminHub.calculatorDesc')}</p>
          </div>
        </div>
        <span className="text-xs font-black uppercase tracking-widest text-gold shrink-0">
          {t('adminHub.openCalculator')} →
        </span>
      </Link>

      {/* Admin Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
        <Card className="p-8 space-y-6 premium-border-gold relative overflow-hidden group" glow="gold">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-gold/10 transition-colors" />
          <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] relative z-10">
            <TrendingUp size={16} className="text-gold" /> {taxRegion === 'TN' ? "Chiffre d'affaires brut" : t('adminHub.grossRevenue')}
          </div>
          <p className="text-3xl font-serif font-bold text-ivoire relative z-10">{formatMoney(stats.totalRevenue || 0)}</p>
          <div className="flex items-center gap-2 relative z-10">
            <Badge variant="success" className="bg-green-500/10 text-green-400 border-green-500/20 font-black">+12.4%</Badge>
            <span className="text-xs text-slate-600 font-bold uppercase tracking-widest">{t('adminHub.vsLastMonth')}</span>
          </div>
        </Card>

        <Card className="p-8 space-y-6 glass-card relative overflow-hidden group" glow="gold">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-gold/10 transition-colors" />
          <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] relative z-10">
            <TrendingUp size={16} className="text-amber-500" /> {taxRegion === 'TN' ? "Impôt estimé (15 %)" : t('adminHub.networkFees')}
          </div>
          <p className="text-3xl font-serif font-bold text-amber-500 relative z-10">{formatMoney((stats.totalRevenue || 0) * (taxRegion === 'TN' ? 0.15 : 0.05))}</p>
          <div className="flex items-center gap-2 relative z-10">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">{taxRegion === 'TN' ? "Taux impôt Tunisie" : t('adminHub.networkRoyalty')}</span>
          </div>
        </Card>

        <Card className="p-8 space-y-6 glass-card relative overflow-hidden group" glow="sapphire">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sapphire/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-sapphire/10 transition-colors" />
          <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] relative z-10">
            <TrendingUp size={16} className="text-sapphire-light" /> {taxRegion === 'TN' ? "Revenu net estimé" : t('adminHub.netRevenue')}
          </div>
          <p className="text-3xl font-serif font-bold text-gold relative z-10">{formatMoney((stats.totalRevenue || 0) * (taxRegion === 'TN' ? 0.85 : 0.95))}</p>
          <div className="flex items-center gap-2 relative z-10">
            <Badge variant="info" className="bg-sapphire/10 text-sapphire-light border-sapphire/20 font-black">{taxRegion === 'TN' ? "Net disponible" : t('adminHub.netCollected')}</Badge>
          </div>
        </Card>
        
        <Card className="p-8 space-y-6 glass-card relative overflow-hidden group">
          <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
            <Users size={16} className="text-slate-400" /> {t('adminHub.clientPortfolio')}
          </div>
          <p className="text-3xl font-serif font-bold text-ivoire">{stats.activeClients}</p>
          <p className="text-xs text-slate-500 font-black uppercase tracking-widest">{t('adminHub.compliantFiles')}</p>
        </Card>

        <Card className="p-8 space-y-6 glass-card relative overflow-hidden group">
          <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
            <Clock size={16} className="text-red-400" /> {t('adminHub.workflow')}
          </div>
          <p className="text-3xl font-serif font-bold text-ivoire">{stats.pendingTasks}</p>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
            <span className="text-xs text-red-500/70 font-black uppercase tracking-widest italic">{t('adminHub.criticalPriority')}</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Recent Global Activity */}
        <Card className="lg:col-span-2 p-0 overflow-hidden glass-card">
          <div className="p-8 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
             <h3 className="text-xs font-black text-silver uppercase tracking-[0.3em]">{t('adminHub.activityFeed')}</h3>
             <Button variant="ghost" size="sm" className="text-xs font-black uppercase tracking-widest hover:text-gold">{t('adminHub.globalArchives')}</Button>
          </div>
          <div className="divide-y divide-white/5">
             {stats.globalTransactions.length === 0 && (
                <div className="p-20 text-center text-slate-600 italic font-serif text-xl opacity-40">{t('adminHub.noActivity')}</div>
             )}
             {stats.globalTransactions.map((log, i) => (
               <div key={i} className="p-8 flex items-center justify-between hover:bg-white/[0.03] transition-all duration-500 group cursor-pointer">
                  <div className="flex items-center gap-6">
                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-white/5 ${log.type === 'sale' ? 'bg-green-500/10 text-green-400' : 'bg-gold/10 text-gold'}`}>
                        {log.type === 'sale' ? <ArrowUpRight size={20}/> : <TrendingUp size={20}/>}
                     </div>
                     <div>
                        <p className="text-base font-black text-ivoire group-hover:text-gold transition-colors">{log.profiles?.display_name || t('adminHub.anonymousMandate')}</p>
                        <p className="text-xs text-slate-500 font-medium mt-1">{log.description}</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <Badge variant={log.status === 'reconciled' ? 'success' : 'default'} className="font-black uppercase text-[9px] tracking-widest">{log.status}</Badge>
                     <p className="text-[10px] text-slate-600 mt-2 font-black uppercase tracking-tighter">{new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
               </div>
             ))}
          </div>
        </Card>

        {/* Integration Status Box */}
        <Card className="p-10 space-y-8 premium-border-gold relative overflow-hidden" glow="gold">
           <div className="absolute bottom-0 right-0 w-64 h-64 bg-gold/5 blur-3xl rounded-full -mb-32 -mr-32" />
           <div className="flex items-center gap-4 text-gold relative z-10">
              <div className="p-3 bg-gold/10 rounded-2xl border border-gold/20 shadow-glow-sm">
                <BarChart3 size={28} />
              </div>
              <h3 className="font-serif text-2xl font-bold italic text-ivoire">{t('adminHub.intelligenceTitle')}</h3>
           </div>
           <p className="text-sm text-slate-500 leading-relaxed font-medium relative z-10">{t('adminHub.intelligenceDesc')}</p>
           
           <div className="space-y-6 relative z-10">
              {[
                { label: 'Cloud Sync Engine', status: t('adminHub.statusActive'), color: 'text-green-500' },
                { label: 'Gemini Tax Logic', status: t('adminHub.statusOnline'), color: 'text-green-500' },
                { label: 'n8n Batch Processor', status: t('adminHub.statusStandby'), color: 'text-gold' }
              ].map((it, idx) => (
                <div key={idx} className="flex items-center justify-between">
                   <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">{it.label}</span>
                   <span className={`${it.color} text-[10px] font-black uppercase tracking-tighter px-3 py-1 bg-white/5 rounded-full`}>{it.status}</span>
                </div>
              ))}
           </div>
           
           <div className="space-y-4 pt-6 relative z-10">
              <Button 
                variant="gold" 
                className="w-full gap-3 h-16 shadow-glow font-black uppercase tracking-[0.2em] text-xs"
                onClick={async () => {
                  toast.success(t('adminHub.reportsGenerated'));
                }}
              >
                {t('adminHub.generateReports')} <Send size={16}/>
              </Button>
              <Button variant="ghost" className="w-full gap-2 h-14 glass-button rounded-2xl text-xs font-black uppercase tracking-widest">{t('adminHub.cloudConnectors')}</Button>
           </div>
        </Card>
      </div>

      {/* 🧮 WIDGET CALCULATEUR D'AIDE TARIF COMPTAFLOW */}
      <section className="space-y-6 mt-10">
        <h2 className="text-xl font-serif font-bold text-ivoire flex items-center gap-2">
          <span>🧮</span> {lang === 'en' ? 'COMPTAFLOW HELP QUOTE & TAX CALCULATOR' : 'CALCULATEUR D\'AIDE TARIF & TAXES COMPTAFLOW'}
        </h2>
        <Card className="p-8 premium-border-gold relative overflow-hidden" glow="gold">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-3xl rounded-full -mt-32 -mr-32" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
            {/* Form Inputs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="calc-service" className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-2">Forfait / Service</label>
                  <select
                    id="calc-service"
                    value={calcService}
                    onChange={(e) => setCalcService(e.target.value as any)}
                    className="w-full bg-noir border border-white/10 rounded-xl px-4 py-3 text-ivoire outline-none focus-ring text-sm appearance-none"
                  >
                    <option value="student">Étudiants (49.99 $)</option>
                    <option value="individual">Particuliers (89.99 $)</option>
                    <option value="autonomous">Travailleurs Autonomes (199.99 $)</option>
                    <option value="bookkeeping">Tenue de livres & Taxes (249.99 $/mois)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="calc-province" className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-2">Province Fiscale</label>
                  <select
                    id="calc-province"
                    value={calcProvince}
                    onChange={(e) => setCalcProvince(e.target.value)}
                    className="w-full bg-noir border border-white/10 rounded-xl px-4 py-3 text-ivoire outline-none focus-ring text-sm appearance-none"
                  >
                    <option value="QC">Québec (TPS 5% + TVQ 9.975%)</option>
                    <option value="ON">Ontario (TVH 13%)</option>
                    <option value="BC">Colombie-Britannique (TPS 5% + TVP 7%)</option>
                    <option value="AB">Alberta (TPS 5%)</option>
                    <option value="MB">Manitoba (TPS 5% + TVP 7%)</option>
                    <option value="NB">Nouveau-Brunswick (TVH 15%)</option>
                    <option value="NL">Terre-Neuve (TVH 15%)</option>
                    <option value="NS">Nouvelle-Écosse (TVH 15%)</option>
                    <option value="PE">Île-du-Prince-Édouard (TVH 15%)</option>
                    <option value="SK">Saskatchewan (TPS 5% + TVP 6%)</option>
                    <option value="YT">Yukon (TPS 5%)</option>
                    <option value="NT">Territoires du Nord-Ouest (TPS 5%)</option>
                    <option value="NU">Nunavut (TPS 5%)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Options complémentaires</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-xl hover:border-gold/20 transition-all">
                    <input
                      type="checkbox"
                      id="calcSoftwareSetup"
                      checked={calcSoftwareSetup}
                      onChange={(e) => setCalcSoftwareSetup(e.target.checked)}
                      className="accent-gold h-4 w-4 rounded border-white/10"
                    />
                    <label htmlFor="calcSoftwareSetup" className="text-xs font-semibold text-ivoire cursor-pointer select-none">
                      Config. Logiciel (+225.00 $)
                    </label>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-xl hover:border-gold/20 transition-all">
                    <input
                      type="checkbox"
                      id="calcPayroll"
                      checked={calcPayroll}
                      onChange={(e) => setCalcPayroll(e.target.checked)}
                      className="accent-gold h-4 w-4 rounded border-white/10"
                    />
                    <label htmlFor="calcPayroll" className="text-xs font-semibold text-ivoire cursor-pointer select-none">
                      Traitement Paie (+65.00 $)
                    </label>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/5 rounded-xl hover:border-gold/20 transition-all space-y-2">
                    <label htmlFor="calcCatchUpHours" className="text-xs font-semibold text-ivoire block select-none">
                      Heures de retard (60 $/h)
                    </label>
                    <input
                      type="number"
                      id="calcCatchUpHours"
                      min="0"
                      value={calcCatchUpHours || ''}
                      onChange={(e) => setCalcCatchUpHours(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-noir border border-white/10 rounded-lg px-2 py-1 text-ivoire text-xs"
                      placeholder="0 heures"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Calculations Result */}
            <div className="lg:col-span-5 bg-white/[0.02] border border-white/5 p-6 rounded-2xl flex flex-col justify-between">
              <div className="space-y-4">
                <p className="text-xs font-black uppercase tracking-widest text-gold">Détail des Calculs</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tarif de base :</span>
                    <span className="font-mono text-ivoire">{calc.base.toFixed(2)} $</span>
                  </div>
                  {calc.addons > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Options / Heures de retard :</span>
                      <span className="font-mono text-ivoire">+{calc.addons.toFixed(2)} $</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-white/5 pt-2 font-semibold">
                    <span className="text-ivoire">Total Hors Taxes (H.T.) :</span>
                    <span className="font-mono text-ivoire">{calc.ht.toFixed(2)} $</span>
                  </div>
                  <div className="space-y-1 pl-4 border-l border-white/10 text-slate-500">
                    {calc.tpsRate > 0 && (
                      <div className="flex justify-between">
                        <span>TPS (5 %) :</span>
                        <span className="font-mono">{calc.tps.toFixed(2)} $</span>
                      </div>
                    )}
                    {calc.tvqRate > 0 && (
                      <div className="flex justify-between">
                        <span>{calcProvince === 'QC' ? 'TVQ (9.975 %)' : 'TVP / TVH'} :</span>
                        <span className="font-mono">{calc.tvq.toFixed(2)} $</span>
                      </div>
                    )}
                    {calc.tvhRate > 0 && (
                      <div className="flex justify-between">
                        <span>TVH ({calc.tvhRate * 100} %) :</span>
                        <span className="font-mono">{calc.tvh.toFixed(2)} $</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4 mt-6">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-sm font-black uppercase tracking-wider text-ivoire">Total Estimé :</span>
                  <span className="text-3xl font-serif font-bold text-gold">{calc.total.toFixed(2)} $</span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono">TPS/TVH/TVQ calculées selon les normes de la province {calcProvince}.</p>
              </div>
            </div>
          </div>
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
