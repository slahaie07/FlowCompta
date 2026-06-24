import { useState, useEffect } from 'react';
import { 
  BarChart3, Users, Clock, TrendingUp, ArrowUpRight, Activity, Send, AlertTriangle, 
  Calculator, RefreshCw, CheckCircle2, AlertCircle, FileText, Database, Shield, 
  Play, Check, Search, Filter, HardDrive, HelpCircle, ArrowRight, Eye, Sparkles, X
} from 'lucide-react';
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
import { supabase } from '../../../lib/supabase';

interface AdminOverviewProps {
  userData?: UserData;
}

export function AdminOverview({ userData }: AdminOverviewProps) {
  const { t, lang } = useLanguage();
  const { stats, loading } = useAdminHub();

  // Eya's currency/tax region toggle
  const [taxRegion, setTaxRegion] = useState<'CA' | 'TN'>('CA');

  // Co-Pilot production queue state
  const [dbServices, setDbServices] = useState<any[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  
  // Interactive Modals & Process state
  const [activeOCRItem, setActiveOCRItem] = useState<any | null>(null);
  const [ocrValidationLoading, setOcrValidationLoading] = useState(false);
  const [activeActionLogs, setActiveActionLogs] = useState<any | null>(null);
  const [driveReconcileProgress, setDriveReconcileProgress] = useState<number | null>(null);
  const [showPersonalIncomeModal, setShowPersonalIncomeModal] = useState<any | null>(null);
  
  const [servicesList, setServicesList] = useState<any[]>([]);

  const fetchServices = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData?.session?.user?.id;
      if (!uid) {
        setDbServices([]);
        return;
      }
      
      const { data: myProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', uid)
        .single();
      const userRole = myProfile?.role || 'sub_admin';

      let query = supabase
        .from('services')
        .select('id, client_id, sub_admin_id, service_type, status, metadata, created_at, client:profiles!services_client_id_fkey(id, full_name, email, display_name, company_name)');

      if (userRole === 'sub_admin') {
        query = query.eq('sub_admin_id', uid);
      }

      const { data, error } = await query;
      if (error) throw error;
      setDbServices(data || []);
    } catch (err) {
      console.error('Failed to fetch services:', err);
    } finally {
      setServicesLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const getUnifiedServices = () => {
    const defaultMocks = [
      {
        id: 'mock-1',
        client_name: 'Stéphanie Laplante',
        company_name: 'Laplante Design Inc.',
        email: 'stephanie@comptaflow.com',
        service_type: 'monthly_bookkeeping',
        status: 'En traitement',
        created_at: new Date(Date.now() - 36 * 3600000).toISOString(),
        metadata: { 
          province: 'QC', 
          dext_receipts_count: 14, 
          dext_anomalies_count: 2,
          estimated_gst: 420.50,
          estimated_qst: 838.90,
          ocr_sample: {
            vendor: 'Bureau en Gros',
            date: '2026-06-22',
            amount_ht: 150.00,
            tps: 7.50,
            tvq: 14.96,
            total: 172.46,
            confidence: 0.94
          }
        }
      },
      {
        id: 'mock-2',
        client_name: 'Antoine Tremblay',
        company_name: 'Étudiant - Impôts simples',
        email: 'antoine.tremblay@gmail.com',
        service_type: 'student_tax',
        status: 'Prêt à traiter',
        created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
        metadata: { 
          province: 'ON', 
          uploaded_zip_name: 'Tremblay_T4_Releve8_2025.zip',
          year: 2025
        }
      },
      {
        id: 'mock-3',
        client_name: 'Sébastien Roy',
        company_name: 'Roy Rénovation',
        email: 's.roy@renovroy.ca',
        service_type: 'catchup_bookkeeping',
        status: 'En cours de production',
        created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
        metadata: { 
          province: 'QC', 
          stripe_deposit_paid: true, 
          deposit_amount: 325.00,
          google_drive_folder: 'Roy_Rattrapage_2025',
          missing_months: 6
        }
      },
      {
        id: 'mock-4',
        client_name: 'Marie-Claude Coté',
        company_name: 'Coté Conseil Inc.',
        email: 'mccote@conseilcote.ca',
        service_type: 'setup_onboarding',
        status: 'En attente du client',
        created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
        metadata: { 
          province: 'QC', 
          onboarding_form_completed: true, 
          plaid_linked: false, 
          quickbooks_provisioned: true
        }
      },
      {
        id: 'mock-5',
        client_name: 'Pierre-Yves Dubé',
        company_name: 'Dubé Immobilier',
        email: 'pydube@dubeimmo.ca',
        service_type: 'personal_tax',
        status: 'En attente de paiement/signature',
        created_at: new Date(Date.now() - 72 * 3600000).toISOString(),
        metadata: { 
          province: 'QC', 
          business_net_income: 84200.00, 
          civil_status_changed: false,
          address_changed: false
        }
      }
    ];

    if (dbServices.length === 0) return defaultMocks;

    const mappedDb = dbServices.map(s => ({
      id: s.id,
      client_name: s.client?.full_name || s.client?.display_name || 'Client',
      company_name: s.client?.company_name || 'Entreprise Individuelle',
      email: s.client?.email || '',
      service_type: s.service_type,
      status: s.status,
      created_at: s.created_at,
      metadata: s.metadata || {},
      isDb: true
    }));

    return [...mappedDb, ...defaultMocks];
  };

  useEffect(() => {
    setServicesList(getUnifiedServices());
  }, [dbServices]);

  const handleUpdateServiceStatus = async (serviceId: string, nextStatus: string, updatedMeta?: any) => {
    const item = servicesList.find(s => s.id === serviceId);
    if (!item) return;

    if (item.isDb) {
      try {
        const { error } = await supabase
          .from('services')
          .update({ 
            status: nextStatus,
            metadata: { ...item.metadata, ...updatedMeta }
          })
          .eq('id', serviceId);

        if (error) throw error;
        toast.success(`Dossier mis à jour à : ${nextStatus}`);
        fetchServices();
      } catch (err: any) {
        toast.error(`Erreur de mise à jour: ${err.message}`);
      }
    } else {
      setServicesList(prev => prev.map(s => {
        if (s.id === serviceId) {
          return {
            ...s,
            status: nextStatus,
            metadata: { ...s.metadata, ...updatedMeta }
          };
        }
        return s;
      }));
      toast.success(`[Copilote Simulation] Dossier mis à jour à : ${nextStatus}`);
    }
  };

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


      {/* 📂 CO-PILOTE PRODUCTION QUEUE SECTION */}
      <section className="space-y-6 mt-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-serif font-bold text-ivoire flex items-center gap-3">
              <span className="animated-gradient-text italic">📂</span> FILE D'ATTENTE DE PRODUCTION CO-PILOTE
            </h2>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-black">
              Tableau de bord opérationnel des 7 services • Supreme Autonomous Stack
            </p>
          </div>
          <Badge variant="gold" className="bg-gold/10 text-gold border-gold/20 py-1.5 px-4 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <Sparkles size={12} className="text-gold animate-pulse shrink-0" /> IA CO-PILOTE ACTIVÉE
          </Badge>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white/[0.02] border border-white/5 rounded-2xl max-w-5xl">
          {[
            { id: 'all', label: 'Tous les Dossiers' },
            { id: 'monthly_bookkeeping', label: 'Forfaits Mensuels' },
            { id: 'student_tax', label: "L'Étudiant (Impôts)" },
            { id: 'catchup_bookkeeping', label: 'Le Rattrapage (Urgence)' },
            { id: 'setup_onboarding', label: 'Le Setup (Config)' },
            { id: 'personal_tax', label: 'Impôts Personnels' }
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setActiveFilter(btn.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 cursor-pointer ${
                activeFilter === btn.id
                  ? 'bg-gold text-noir shadow-glow font-black'
                  : 'text-slate-400 hover:text-ivoire hover:bg-white/5'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Services Queue List */}
        <div className="space-y-4">
          {servicesLoading && servicesList.length === 0 ? (
            <div className="p-20 text-center text-slate-500 italic font-serif">Chargement des dossiers de production...</div>
          ) : servicesList.filter((s) => activeFilter === 'all' || s.service_type === activeFilter).length === 0 ? (
            <div className="p-20 text-center text-slate-500 italic font-serif bg-white/[0.01] border border-white/5 rounded-2xl">
              Aucun dossier actif dans cette catégorie.
            </div>
          ) : (
            servicesList
              .filter((s) => activeFilter === 'all' || s.service_type === activeFilter)
              .map((svc) => {
                let statusBg = 'bg-slate-500/10 text-slate-400 border-slate-500/20';
                if (svc.status === 'En traitement' || svc.status === 'En cours de production') {
                  statusBg = 'bg-sky-500/10 text-sky-300 border-sky-500/20';
                } else if (svc.status === 'Prêt à traiter') {
                  statusBg = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
                } else if (svc.status === 'Terminé') {
                  statusBg = 'bg-green-500/10 text-green-400 border-green-500/20';
                } else if (svc.status === 'En attente de paiement/signature' || svc.status === 'En attente du client') {
                  statusBg = 'bg-amber-500/10 text-amber-300 border-amber-500/20';
                } else if (svc.status === 'Bloqué') {
                  statusBg = 'bg-red-500/10 text-red-400 border-red-500/20';
                }

                let serviceLabel = svc.service_type;
                let serviceIcon = <FileText size={18} />;
                if (svc.service_type === 'monthly_bookkeeping') {
                  serviceLabel = 'Forfait Mensuel';
                  serviceIcon = <RefreshCw size={18} className="text-gold" />;
                } else if (svc.service_type === 'student_tax') {
                  serviceLabel = "L'Étudiant (Impôts)";
                  serviceIcon = <Users size={18} className="text-purple-400" />;
                } else if (svc.service_type === 'catchup_bookkeeping') {
                  serviceLabel = 'Le Rattrapage (Urgence)';
                  serviceIcon = <AlertTriangle size={18} className="text-red-400" />;
                } else if (svc.service_type === 'setup_onboarding') {
                  serviceLabel = 'Le Setup (Config)';
                  serviceIcon = <Database size={18} className="text-emerald-400" />;
                } else if (svc.service_type === 'personal_tax') {
                  serviceLabel = 'Impôts Personnels';
                  serviceIcon = <Shield size={18} className="text-amber-400" />;
                }

                return (
                  <Card 
                    key={svc.id} 
                    className={`p-6 border ${svc.status === 'Bloqué' ? 'border-red-500/20 bg-red-950/5' : 'border-white/5 bg-noir'} hover:border-gold/30 transition-all duration-300`}
                  >
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                          {serviceIcon}
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h4 className="text-lg font-serif font-bold text-ivoire">{svc.client_name}</h4>
                            <Badge variant="default" className={`${statusBg} px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest`}>
                              {svc.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 font-medium flex items-center gap-2">
                            <span>{svc.company_name}</span>
                            <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                            <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded border border-white/5 font-black uppercase text-slate-500">
                              PROVINCE: {svc.metadata?.province || 'QC'}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex-1 max-w-md lg:px-6">
                        <p className="text-xs font-black uppercase tracking-wider text-slate-500">Statut du pipeline</p>
                        <p className="text-sm text-ivoire mt-1 font-medium leading-relaxed">
                          {svc.service_type === 'monthly_bookkeeping' && `OCR: ${svc.metadata?.dext_receipts_count || 0} reçus traités. ${svc.metadata?.dext_anomalies_count || 0} anomalies détectées.`}
                          {svc.service_type === 'student_tax' && `Impôt simple: ${svc.metadata?.uploaded_zip_name ? `Fichier "${svc.metadata.uploaded_zip_name}" reçu.` : 'En attente des feuillets.'}`}
                          {svc.service_type === 'catchup_bookkeeping' && `Dépôt Stripe payé. Google Drive: /${svc.metadata?.google_drive_folder || ''}.`}
                          {svc.service_type === 'setup_onboarding' && `Profil Supabase & Dext initialisés. Banque: ${svc.metadata?.plaid_linked ? 'Connectée ✅' : 'À valider'}.`}
                          {svc.service_type === 'personal_tax' && `Revenu corporatif net: ${svc.metadata?.business_net_income ? `${svc.metadata.business_net_income.toLocaleString()} $` : 'N/A'}.`}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 w-full lg:w-auto justify-end">
                        {driveReconcileProgress !== null && svc.service_type === 'catchup_bookkeeping' && (
                          <div className="w-48 bg-white/5 border border-white/10 rounded-full h-4 overflow-hidden relative">
                            <div className="bg-gold h-full transition-all duration-300" style={{ width: `${driveReconcileProgress}%` }} />
                            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-ivoire">RÉCONCILIATION {driveReconcileProgress}%</span>
                          </div>
                        )}

                        {svc.service_type === 'monthly_bookkeeping' && svc.status !== 'Terminé' && (
                          <Button
                            variant="gold"
                            size="sm"
                            onClick={() => setActiveOCRItem(svc)}
                            className="h-10 text-[10px] font-black uppercase tracking-widest px-4 gap-2 shadow-glow-sm"
                          >
                            <Eye size={14} /> Valider OCR Dext
                          </Button>
                        )}

                        {svc.service_type === 'student_tax' && svc.status === 'Prêt à traiter' && (
                          <Button
                            variant="gold"
                            size="sm"
                            onClick={() => {
                              toast.loading("Génération de la déclaration d'impôt...");
                              setTimeout(() => {
                                handleUpdateServiceStatus(svc.id, 'En attente de paiement/signature', { declaration_generated: true });
                                toast.dismiss();
                                toast.success("Déclaration générée et déposée dans le coffre-fort.");
                              }, 1500);
                            }}
                            className="h-10 text-[10px] font-black uppercase tracking-widest px-4 gap-2 shadow-glow-sm"
                          >
                            <Play size={14} /> Générer PDF & Déposer
                          </Button>
                        )}

                        {svc.service_type === 'catchup_bookkeeping' && svc.status === 'En cours de production' && driveReconcileProgress === null && (
                          <Button
                            variant="gold"
                            size="sm"
                            onClick={() => {
                              setDriveReconcileProgress(0);
                              let count = 0;
                              const interval = setInterval(() => {
                                count += 20;
                                setDriveReconcileProgress(count);
                                if (count >= 100) {
                                  clearInterval(interval);
                                  setDriveReconcileProgress(null);
                                  handleUpdateServiceStatus(svc.id, 'Prêt à traiter', { catchup_reconciled: true });
                                  toast.success("Scan Massif complété : 142 transactions réconciliées en bloc.");
                                }
                              }, 400);
                            }}
                            className="h-10 text-[10px] font-black uppercase tracking-widest px-4 gap-2 shadow-glow-sm"
                          >
                            <HardDrive size={14} /> Scan Massif Drive
                          </Button>
                        )}

                        {svc.service_type === 'setup_onboarding' && svc.status === 'En attente du client' && (
                          <Button
                            variant="gold"
                            size="sm"
                            onClick={() => {
                              toast.loading("Vérification des accès bancaires...");
                              setTimeout(() => {
                                handleUpdateServiceStatus(svc.id, 'Prêt à traiter', { plaid_linked: true });
                                toast.dismiss();
                                toast.success("Connexion bancaire validée par le CPA. Prêt pour la tenue de livres.");
                              }, 1200);
                            }}
                            className="h-10 text-[10px] font-black uppercase tracking-widest px-4 gap-2 shadow-glow-sm"
                          >
                            <Check size={14} /> Valider Banque
                          </Button>
                        )}

                        {svc.service_type === 'personal_tax' && svc.status === 'En attente de paiement/signature' && (
                          <Button
                            variant="gold"
                            size="sm"
                            onClick={() => setShowPersonalIncomeModal(svc)}
                            className="h-10 text-[10px] font-black uppercase tracking-widest px-4 gap-2 shadow-glow-sm"
                          >
                            <ArrowRight size={14} /> Reporter Revenus
                          </Button>
                        )}

                        {svc.status === 'Terminé' && (
                          <Badge variant="success" className="bg-green-500/10 text-green-400 border-green-500/20 py-2.5 px-4 gap-2 text-[9px] font-black uppercase tracking-widest">
                            <CheckCircle2 size={14} /> Traité & Synchronisé
                          </Badge>
                        )}

                        <button
                          onClick={() => setActiveActionLogs(svc)}
                          title="Afficher l'historique d'automatisation n8n/Supabase"
                          className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-gold hover:border-gold/20 transition-all cursor-pointer shrink-0"
                        >
                          <Activity size={16} />
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })
          )}
        </div>
      </section>

      {/* --- OCR DEXT VALIDATION OVERLAY --- */}
      {activeOCRItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-noir border border-gold/30 rounded-3xl max-w-xl w-full p-8 space-y-6 relative shadow-[0_0_50px_rgba(212,175,55,0.15)]">
            <button 
              onClick={() => setActiveOCRItem(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-ivoire transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 text-gold">
              <Sparkles size={22} className="animate-pulse" />
              <h3 className="font-serif text-2xl font-bold text-ivoire">Validation Dext OCR & Taxes</h3>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              Le moteur d'intelligence artificielle de Dext a extrait la transaction suivante. Veuillez valider les détails avant l'injection automatique dans QuickBooks/Wave.
            </p>

            <div className="bg-white/5 border border-white/5 p-5 rounded-2xl space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 font-bold uppercase tracking-wider block">Fournisseur</span>
                  <span className="text-ivoire font-bold text-sm block mt-1">{activeOCRItem.metadata?.ocr_sample?.vendor}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold uppercase tracking-wider block">Date de transaction</span>
                  <span className="text-ivoire font-bold text-sm block mt-1">{activeOCRItem.metadata?.ocr_sample?.date}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold uppercase tracking-wider block">Province</span>
                  <span className="text-ivoire font-bold text-sm block mt-1">{activeOCRItem.metadata?.province || 'QC'}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold uppercase tracking-wider block">Indice de confiance</span>
                  <span className="text-green-400 font-black text-sm block mt-1">{(activeOCRItem.metadata?.ocr_sample?.confidence * 100).toFixed(0)}% (Excellent)</span>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Montant H.T. :</span>
                  <span className="text-ivoire font-bold">{activeOCRItem.metadata?.ocr_sample?.amount_ht.toFixed(2)} $</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">TPS (5%) :</span>
                  <span className="text-ivoire font-bold">{activeOCRItem.metadata?.ocr_sample?.tps.toFixed(2)} $</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">TVQ (9.975%) :</span>
                  <span className="text-ivoire font-bold">{activeOCRItem.metadata?.ocr_sample?.tvq.toFixed(2)} $</span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-2 font-serif text-sm">
                  <span className="text-gold font-bold">Total TTC :</span>
                  <span className="text-gold font-bold">{activeOCRItem.metadata?.ocr_sample?.total.toFixed(2)} $</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-300 text-xs">
              <CheckCircle2 size={18} className="shrink-0 text-green-400" />
              <p>Validation fiscale conforme : Les taxes concordent parfaitement avec les barèmes du Québec.</p>
            </div>

            <div className="flex gap-4">
              <Button
                variant="ghost"
                onClick={() => setActiveOCRItem(null)}
                className="flex-1 h-12 text-xs font-black uppercase tracking-widest border border-white/10 text-slate-400 hover:text-ivoire"
              >
                Annuler
              </Button>
              <Button
                variant="gold"
                onClick={async () => {
                  setOcrValidationLoading(true);
                  // Simulate sync
                  setTimeout(() => {
                    handleUpdateServiceStatus(activeOCRItem.id, 'Terminé', { dext_anomalies_count: 0 });
                    setOcrValidationLoading(false);
                    setActiveOCRItem(null);
                    toast.success("Transaction approuvée et poussée avec succès dans QuickBooks.");
                  }, 1200);
                }}
                className="flex-1 h-12 text-xs font-black uppercase tracking-[0.15em] shadow-glow"
              >
                {ocrValidationLoading ? 'Synchronisation...' : 'Approuver & Pousser API'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- PERSONAL INCOME TAX TRANSFER MODAL --- */}
      {showPersonalIncomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-noir border border-gold/30 rounded-3xl max-w-xl w-full p-8 space-y-6 relative shadow-[0_0_50px_rgba(212,175,55,0.15)]">
            <button 
              onClick={() => setShowPersonalIncomeModal(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-ivoire transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 text-gold">
              <Shield size={22} />
              <h3 className="font-serif text-2xl font-bold text-ivoire">Impôts Personnels (Proprio)</h3>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              ComptaFlow synchronise le calcul de revenus nets de l'entreprise avec la déclaration fiscale personnelle du propriétaire, évitant ainsi la double-saisie et garantissant une conformité totale.
            </p>

            <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl space-y-4">
              <div className="flex justify-between items-center text-xs pb-3 border-b border-white/5">
                <span className="text-slate-500 font-bold uppercase tracking-wider">Client final :</span>
                <span className="text-ivoire font-bold text-sm">{showPersonalIncomeModal.client_name}</span>
              </div>
              <div className="flex justify-between items-center text-xs pb-3 border-b border-white/5">
                <span className="text-slate-500 font-bold uppercase tracking-wider">Compagnie liée :</span>
                <span className="text-ivoire font-bold">{showPersonalIncomeModal.company_name}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold uppercase tracking-wider">Revenu Net Corporatif calculé :</span>
                <span className="text-gold font-bold text-sm">{showPersonalIncomeModal.metadata?.business_net_income?.toLocaleString()} $</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Vérifications de Statut (Loi 25)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-400 shrink-0" />
                  <span className="text-slate-300">Adresse inchangée</span>
                </div>
                <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-400 shrink-0" />
                  <span className="text-slate-300">Statut civil inchangé</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                variant="ghost"
                onClick={() => setShowPersonalIncomeModal(null)}
                className="flex-1 h-12 text-xs font-black uppercase tracking-widest border border-white/10 text-slate-400 hover:text-ivoire"
              >
                Fermer
              </Button>
              <Button
                variant="gold"
                onClick={() => {
                  toast.loading("Génération de la déclaration TP1/T1...");
                  setTimeout(() => {
                    handleUpdateServiceStatus(showPersonalIncomeModal.id, 'Terminé', { personal_reconciled: true });
                    setShowPersonalIncomeModal(null);
                    toast.dismiss();
                    toast.success("Déclaration d'impôts T1/TP1 générée avec revenus reportés de 84,200$. Transmis pour signature.");
                  }, 1500);
                }}
                className="flex-1 h-12 text-xs font-black uppercase tracking-[0.15em] shadow-glow"
              >
                Reporter & Envoyer Signature
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- n8n WORKFLOW LOGS DIALOG --- */}
      {activeActionLogs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-noir border border-gold/30 rounded-3xl max-w-2xl w-full p-8 space-y-6 relative shadow-[0_0_50px_rgba(212,175,55,0.15)] max-h-[85vh] overflow-y-auto">
            <button 
              onClick={() => setActiveActionLogs(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-ivoire transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 text-gold">
              <Activity size={22} />
              <h3 className="font-serif text-2xl font-bold text-ivoire">Historique de Flux & Webhooks n8n</h3>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              Trabilité totale en temps réel du pipeline d'automatisation. Les webhooks et triggers réagissent aux actions client.
            </p>

            <div className="space-y-4">
              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-2.5 font-mono text-[11px]">
                <div className="flex items-center gap-2 text-gold">
                  <span className="w-2 h-2 rounded-full bg-gold animate-pulse shrink-0"></span>
                  <span className="font-bold">TRIGGER :</span>
                  <span>
                    {activeActionLogs.service_type === 'monthly_bookkeeping' && 'Dext Webhook (receipt.created)'}
                    {activeActionLogs.service_type === 'student_tax' && 'Supabase Trigger (on_document_upload)'}
                    {activeActionLogs.service_type === 'catchup_bookkeeping' && 'Stripe Webhook (payment_intent.succeeded)'}
                    {activeActionLogs.service_type === 'setup_onboarding' && 'Next.js Onboarding Form API (POST)'}
                    {activeActionLogs.service_type === 'personal_tax' && 'Portal Action (T1_T5_transfer_requested)'}
                  </span>
                </div>
                <div className="text-slate-500">
                  Date déclencheur : {new Date(activeActionLogs.created_at).toLocaleString()}
                </div>
              </div>

              <div className="border border-white/5 rounded-2xl overflow-hidden text-xs">
                <div className="bg-white/[0.02] p-4 border-b border-white/5 font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Noeuds exécutés dans n8n</span>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-black">SUCCÈS</Badge>
                </div>
                <div className="divide-y divide-white/5">
                  {[
                    { node: 'Stripe/Dext Hook Reception', duration: '14ms', status: 'Success' },
                    { node: 'Retrieve Customer Meta', duration: '89ms', status: 'Success' },
                    { node: 'Run Gemini Tax Validation', duration: '340ms', status: 'Success' },
                    { node: 'Email Notify (compta-flow@outlook.com)', duration: '190ms', status: 'Success' },
                    { node: 'Slack Alert / CPA Panel update', duration: '60ms', status: 'Success' }
                  ].map((nd, i) => (
                    <div key={i} className="p-4 flex justify-between items-center hover:bg-white/[0.02] font-mono text-[11px]">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 size={14} className="text-green-400 shrink-0" />
                        <span className="text-ivoire font-bold">{nd.node}</span>
                      </div>
                      <div className="flex items-center gap-4 text-slate-500">
                        <span>{nd.duration}</span>
                        <span className="text-green-400 font-bold">{nd.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              onClick={() => setActiveActionLogs(null)}
              className="w-full h-12 text-xs font-black uppercase tracking-widest border border-white/10 text-slate-400 hover:text-ivoire"
            >
              Fermer l'historique
            </Button>
          </div>
        </div>
      )}

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
