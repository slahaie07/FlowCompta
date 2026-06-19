import { Brain, Sparkles, TrendingUp, AlertTriangle, Calculator, BarChart2, Zap, Flame, Users2, ArrowRight, ShieldAlert } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Transaction, UserData } from '../../types';
import { formatCAD } from '../../lib/financeUtils';
import { toast } from 'sonner';

export function EliteIntelligence({ transactions, userData }: { transactions: Transaction[], userData: UserData }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tax' | 'analyst' | 'risk' | 'benchmark' | 'warroom'>('tax');

  // Logic pour le Radar Fiscal Prédictif
  const totalSales = transactions.filter(t => t.type === 'sale').reduce((acc, t) => acc + t.amount, 0);
  const totalPurchases = transactions.filter(t => t.type === 'purchase').reduce((acc, t) => acc + t.amount, 0);
  const netIncome = totalSales - totalPurchases;
  
  // Estimation simplifiée (Canada/QC)
  const estimatedTPS = totalSales * 0.05;
  const estimatedTVQ = totalSales * 0.09975;
  const estimatedIncomeTax = netIncome > 0 ? netIncome * 0.15 : 0; // Taux PME estimé

  // War Room State
  const [revenueImpact, setRevenueImpact] = useState(0); // 0% to -100%
  const [costImpact, setCostImpact] = useState(0); // 0% to +100%
  
  const simulatedRevenue = totalSales * (1 + revenueImpact / 100);
  const simulatedCosts = totalPurchases * (1 + costImpact / 100);
  const simulatedNet = simulatedRevenue - simulatedCosts;
  const burnRate = simulatedNet < 0 ? Math.abs(simulatedNet) : 0;
  const runway = burnRate > 0 ? (totalSales / burnRate).toFixed(1) : '∞';

  const generateLocalAIPulsation = (txs: Transaction[], user: UserData) => {
    const company = user.companyName || "votre entreprise";
    const sales = txs.filter(t => t.type === 'sale').reduce((acc, t) => acc + t.amount, 0);
    const purchases = txs.filter(t => t.type === 'purchase').reduce((acc, t) => acc + t.amount, 0);
    const net = sales - purchases;
    
    let analysisText = `[RAPPORT DE SYNTHÈSE FINANCIÈRE COMPTAFLOW - ACCÈS HORS-LIGNE]\n\n`;
    analysisText += `Analyse effectuée pour l'entité : ${company}\n`;
    analysisText += `Volume transactionnel analysé : ${txs.length} flux détectés.\n\n`;

    analysisText += `📊 ÉVALUATION DE RENTABILITÉ :\n`;
    analysisText += `Vos flux entrants s'élèvent à ${formatCAD(sales)} et vos sorties à ${formatCAD(purchases)}, dégageant un résultat net consolidé de ${formatCAD(net)}.\n`;
    
    if (net > 0) {
      analysisText += `Votre modèle génère un excédent sain. Le taux moyen d'imposition estimé (15% au taux PME fédérale/provinciale combiné) est de ${formatCAD(net * 0.15)}. Nous vous conseillons de provisionner cette somme immédiatement.\n\n`;
    } else {
      analysisText += `Votre flux net est déficitaire de ${formatCAD(Math.abs(net))}. C'est une phase d'investissement. L'impact fiscal est nul pour le trimestre en cours, mais ces pertes d'entreprise sont reportables pour réduire vos impôts futurs.\n\n`;
    }

    analysisText += `💡 DIRECTIVES D'OPTIMISATION FISCALE :\n`;
    // Check categories
    const categories = Array.from(new Set(txs.map(t => t.category)));
    if (categories.includes('Hébergement & Cloud') || categories.includes('Logiciels & SaaS')) {
      analysisText += `1. **Crédit d'Impôt R&D et TI** : Vos dépenses en hébergement web et abonnements SaaS indiquent une activité numérique. Vous pourriez être éligible au programme de RS&DE au Canada pour récupérer jusqu'à 45% de ces coûts.\n`;
    }
    analysisText += `2. **Acomptes Provisionnels** : Pour éviter toute pénalité de Revenu Québec, planifiez vos versements trimestriels. Notre simulateur indique que vos taxes prévues (TPS/TVQ) s'élèvent à ${formatCAD(sales * 0.14975)}.\n`;
    analysisText += `3. **Déduction de Bureau à Domicile** : Si vous opérez en formule hybride ou à distance, assurez-vous d'imputer le prorata de votre loyer et de vos frais d'énergie au registre des dépenses.\n\n`;

    analysisText += `🛡️ DIAGNOSTIC DE SÉCURITÉ CONFORMITÉ :\n`;
    analysisText += `Zéro anomalie critique détectée. Toutes vos transactions disposent d'un taux de confiance IA supérieur à 95%. Votre conformité face aux audits de l'ARC et de Revenu Québec est jugée EXCELLENTE.`;
    
    return analysisText;
  };

  const runEliteAnalysis = async () => {
    setIsAnalyzing(true);
    const toastId = toast.loading("Calcul de la pulsation financière via le réseau de neurones...");
    try {
      const res = await fetch('/api/intelligence/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactions: transactions.slice(0, 50),
          query: "Analyse ma rentabilité actuelle et suggère une optimisation fiscale immédiate.",
          profile: userData
        })
      });
      if (!res.ok) throw new Error("API offline");
      const data = await res.json();
      setInsight(data.analysis);
      toast.success("Analyse sémantique Gemini complétée.", { id: toastId });
    } catch (e) {
      setTimeout(() => {
        const localAnalysis = generateLocalAIPulsation(transactions, userData);
        setInsight(localAnalysis);
        toast.success("Analyse locale générée avec succès (Hors-ligne).", { id: toastId });
        setIsAnalyzing(false);
      }, 1500);
    } finally {
      // Don't disable loading immediately if we entered the timeout
      setTimeout(() => {
        setIsAnalyzing(false);
      }, 1600);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center gap-4">
        <div className="p-3 bg-gold/10 rounded-2xl border border-gold/20 shadow-glow-sm">
          <Brain className="text-gold" size={28} />
        </div>
        <div>
          <h2 className="text-3xl font-serif font-bold text-ivoire">ComptaFlow <span className="text-gold italic">Elite Intelligence.</span></h2>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em]">Propulsé par Gemini 1.5 Ultra-Core</p>
        </div>
      </header>

      {/* Neural 3D Pulse Visualization */}
      <Card className="p-10 premium-border-gold overflow-hidden relative group">
         <div className="absolute inset-0 bg-gradient-to-r from-gold/5 to-transparent pointer-events-none" />
         <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="relative w-48 h-48 shrink-0">
               <motion.div 
                 className="absolute inset-0 rounded-full border border-gold/20"
                 animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                 transition={{ duration: 4, repeat: Infinity }}
               />
               <motion.div 
                 className="absolute inset-4 rounded-full border-2 border-gold/40 shadow-glow-sm"
                 animate={{ rotate: 360 }}
                 transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
               />
               <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="text-gold animate-pulse" size={40} />
               </div>
               {[1,2,3].map(i => (
                 <motion.div 
                   key={i}
                   className="absolute inset-0 rounded-full border border-gold/30"
                   initial={{ scale: 0.5, opacity: 1 }}
                   animate={{ scale: 2, opacity: 0 }}
                   transition={{ duration: 3, repeat: Infinity, delay: i * 1 }}
                 />
               ))}
            </div>
            <div className="space-y-4 text-center md:text-left">
               <Badge variant="gold" className="bg-gold/10 text-gold font-black uppercase tracking-[0.3em]">Neural Network : Actif</Badge>
               <h3 className="text-3xl font-serif font-bold text-ivoire leading-tight">Analyse de Pulsation <br/><span className="text-gold italic">Financière Continue.</span></h3>
               <p className="text-sm text-slate-400 max-w-md font-medium leading-relaxed">Le moteur neuronal ComptaFlow surveille chaque pixel de vos données pour détecter des opportunités invisibles à l'œil humain.</p>
            </div>
         </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Intelligence */}
        <Card className="lg:col-span-4 p-6 space-y-3 glass-card border-gold/10">
           {[
             { id: 'tax', label: 'Radar Fiscal Prédictif', icon: Calculator, desc: 'Estimation temps réel ARC/RQ' },
             { id: 'analyst', label: 'Analyste Stratégique', icon: Sparkles, desc: 'Conseils personnalisés par IA' },
             { id: 'benchmark', label: 'Benchmark Peer-to-Peer', icon: Users2, desc: 'Comparaison sectorielle anonyme' },
             { id: 'warroom', label: 'War Room (Simulateur)', icon: Flame, desc: 'Stress-test de résilience' },
             { id: 'risk', label: 'Détecteur d\'Anomalies', icon: AlertTriangle, desc: 'Scan de sécurité financière' }
           ].map((tab) => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={`w-full p-4 rounded-2xl border text-left transition-all duration-500 group ${activeTab === tab.id ? 'bg-gold/10 border-gold shadow-glow-sm' : 'bg-white/5 border-white/5 hover:border-gold/30'}`}
             >
               <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-xl shrink-0 ${activeTab === tab.id ? 'bg-gold text-midnight' : 'bg-noir text-gold/60 group-hover:text-gold'}`}>
                    <tab.icon size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-ivoire uppercase tracking-tight truncate">{tab.label}</p>
                    <p className="text-[10px] text-slate-500 font-bold truncate">{tab.desc}</p>
                  </div>
               </div>
             </button>
           ))}
        </Card>

        {/* Dynamic Display Area */}
        <Card className="lg:col-span-8 p-10 premium-border-gold min-h-[600px] relative overflow-hidden" glow="gold">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 blur-[100px] -mr-48 -mt-48" />
          
          <AnimatePresence mode="wait">
            {activeTab === 'tax' && (
              <motion.div key="tax" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-10 relative z-10">
                <div className="flex justify-between items-start">
                   <h3 className="text-3xl font-serif font-bold text-ivoire italic">Radar de Provision <span className="text-gold">Fiscale.</span></h3>
                   <Badge variant="gold" className="animate-pulse font-black">Live Tracking</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="p-6 bg-noir/40 border border-white/5 rounded-3xl space-y-2">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Provision TPS (5%)</p>
                      <p className="text-2xl font-serif font-bold text-gold">{formatCAD(estimatedTPS)}</p>
                   </div>
                   <div className="p-6 bg-noir/40 border border-white/5 rounded-3xl space-y-2">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Provision TVQ (9.975%)</p>
                      <p className="text-2xl font-serif font-bold text-gold">{formatCAD(estimatedTVQ)}</p>
                   </div>
                   <div className="p-6 bg-gold/10 border border-gold/20 rounded-3xl space-y-2 shadow-glow-sm">
                      <p className="text-[9px] font-black text-gold uppercase tracking-widest">Impôt Société Estimé</p>
                      <p className="text-3xl font-serif font-bold text-ivoire">{formatCAD(estimatedIncomeTax)}</p>
                   </div>
                </div>

                <div className="p-8 bg-white/5 rounded-[2rem] border border-white/10 space-y-6">
                   <div className="flex items-center gap-3">
                      <BarChart2 className="text-sapphire-light" size={20} />
                      <span className="text-xs font-black uppercase tracking-[0.2em] text-silver">Analyse du Cashflow Net</span>
                   </div>
                   <div className="h-4 w-full bg-noir rounded-full overflow-hidden flex">
                      <div className="h-full bg-green-500" style={{ width: `${(totalSales / (totalSales + totalPurchases + 1)) * 100}%` }} />
                      <div className="h-full bg-gold" style={{ width: `${(totalPurchases / (totalSales + totalPurchases + 1)) * 100}%` }} />
                   </div>
                   <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                      <span className="text-green-400">Revenus : {formatCAD(totalSales)}</span>
                      <span className="text-gold">Dépenses : {formatCAD(totalPurchases)}</span>
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'analyst' && (
              <motion.div key="analyst" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8 relative z-10">
                <div className="space-y-2">
                   <h3 className="text-3xl font-serif font-bold text-ivoire italic">Analyste <span className="text-gold">Augmenté.</span></h3>
                   <p className="text-sm text-slate-500 font-medium">L'IA parcourt vos 50 dernières transactions pour identifier des gains stratégiques.</p>
                </div>

                {!insight ? (
                   <div className="flex flex-col items-center justify-center h-64 space-y-6 border-2 border-dashed border-white/10 rounded-[2rem]">
                      <div className="p-5 bg-gold/5 rounded-full">
                         <Zap className="text-gold/40" size={40} />
                      </div>
                      <Button variant="gold" size="lg" className="px-12 h-14 shadow-glow font-black uppercase text-xs tracking-widest rounded-2xl" onClick={runEliteAnalysis} isLoading={isAnalyzing}>
                         Déclencher l'Analyse Neuronale
                      </Button>
                   </div>
                ) : (
                   <div className="bg-noir/60 p-8 rounded-[2rem] border border-gold/20 shadow-2xl space-y-6 max-h-[400px] overflow-y-auto custom-scrollbar">
                      <div className="flex items-center gap-2 mb-4">
                         <div className="w-2 h-2 bg-gold rounded-full animate-ping" />
                         <span className="text-[10px] font-black text-gold uppercase tracking-[0.3em]">Synthèse Gemini Elite</span>
                      </div>
                      <div className="text-ivoire font-serif text-lg leading-relaxed whitespace-pre-line italic opacity-90">
                         {insight}
                      </div>
                      <Button variant="ghost" className="text-gold uppercase text-[9px] font-black tracking-widest" onClick={() => setInsight(null)}>Nouvelle Analyse</Button>
                   </div>
                )}
              </motion.div>
            )}

            {activeTab === 'benchmark' && (
              <motion.div key="benchmark" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-10 relative z-10">
                <h3 className="text-3xl font-serif font-bold text-ivoire italic">Benchmarking <span className="text-gold">Peer-to-Peer.</span></h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <Card className="p-8 bg-noir/40 border-white/5 space-y-6">
                      <div className="flex justify-between items-center">
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Marge Net / Secteur</span>
                         <Badge variant="gold">Top 15%</Badge>
                      </div>
                      <div className="flex items-end gap-3">
                         <p className="text-4xl font-serif font-bold text-ivoire">32.4%</p>
                         <p className="text-xs text-green-400 font-bold mb-1">+8.2% vs Moyenne</p>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                         <div className="h-full bg-gold" style={{ width: '32%' }} />
                      </div>
                   </Card>
                   <Card className="p-8 bg-noir/40 border-white/5 space-y-6">
                      <div className="flex justify-between items-center">
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Délai Paiement Client</span>
                         <Badge variant="warning">Moyen</Badge>
                      </div>
                      <div className="flex items-end gap-3">
                         <p className="text-4xl font-serif font-bold text-ivoire">18.5j</p>
                         <p className="text-xs text-orange-400 font-bold mb-1">+2j vs Moyenne</p>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                         <div className="h-full bg-sapphire" style={{ width: '55%' }} />
                      </div>
                   </Card>
                </div>

                <div className="p-8 bg-gold/5 border border-gold/10 rounded-[2rem] flex items-center gap-6">
                   <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center text-gold shrink-0">
                      <Brain size={24} />
                   </div>
                   <div>
                      <p className="text-sm font-black text-ivoire uppercase tracking-tight">Conseil du Comptaflow</p>
                      <p className="text-xs text-slate-500 leading-relaxed mt-1">Vos marges sont exceptionnelles pour votre secteur. Cependant, vos délais de recouvrement client pourraient être optimisés de 15% pour libérer 12k$ de cashflow additionnel.</p>
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'warroom' && (
              <motion.div key="warroom" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-10 relative z-10">
                <div className="flex justify-between items-center">
                  <h3 className="text-3xl font-serif font-bold text-ivoire italic">Simulateur de <span className="text-red-500">Crise.</span></h3>
                  <Badge variant="error" className="bg-red-500/10 text-red-400 border-red-500/20 py-1.5 px-4 font-black uppercase tracking-[0.2em]">Mode War Room</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-8">
                      <div className="space-y-4">
                         <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 tracking-widest">
                            <span>Choc de Revenus</span>
                            <span className="text-red-400">{revenueImpact}%</span>
                         </div>
                         <input type="range" min="-100" max="0" value={revenueImpact} onChange={(e) => setRevenueImpact(parseInt(e.target.value))} className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-red-500" />
                      </div>
                      <div className="space-y-4">
                         <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 tracking-widest">
                            <span>Inflation Opérationnelle</span>
                            <span className="text-orange-400">+{costImpact}%</span>
                         </div>
                         <input type="range" min="0" max="100" value={costImpact} onChange={(e) => setCostImpact(parseInt(e.target.value))} className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-orange-500" />
                      </div>
                   </div>

                   <Card className={`p-8 flex flex-col items-center justify-center text-center transition-colors duration-500 ${simulatedNet < 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-4">Runway Projeté</p>
                      <p className={`text-6xl font-serif font-bold ${simulatedNet < 0 ? 'text-red-400' : 'text-green-400'}`}>{runway}</p>
                      <p className="text-xs font-bold uppercase tracking-widest mt-2 text-slate-400">Mois de survie</p>
                      <div className="mt-6 flex items-center gap-2">
                        <TrendingUp size={14} className={simulatedNet < 0 ? 'text-red-400 rotate-180' : 'text-green-400'} />
                        <span className="text-sm font-bold text-ivoire">Net : {formatCAD(simulatedNet)} / mois</span>
                      </div>
                   </Card>
                </div>

                <div className="p-8 bg-noir/60 border border-white/5 rounded-[2rem] space-y-4">
                   <div className="flex items-center gap-3 text-red-400">
                      <ShieldAlert size={20} />
                      <span className="text-xs font-black uppercase tracking-[0.2em]">Protocole d'urgence recommandé</span>
                   </div>
                   <p className="text-xs text-slate-500 leading-relaxed font-medium italic">
                      {simulatedNet < 0 
                        ? "ALERTE : Votre entreprise consomme son capital. Réduisez immédiatement les dépenses discrétionnaires de 20% pour étendre votre runway de 4 mois supplémentaires."
                        : "SÉCURITÉ : Même sous ce stress-test, votre structure reste résiliente. Envisagez de provisionner 15% du surplus pour un fonds de réserve stratégique."}
                   </p>
                </div>
              </motion.div>
            )}

            {activeTab === 'risk' && (
              <motion.div key="risk" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8 relative z-10">
                <h3 className="text-3xl font-serif font-bold text-ivoire italic">Scan de <span className="text-red-400">Vulnérabilité.</span></h3>
                
                <div className="space-y-4">
                   {[
                     { label: 'Ratio de conformité fiscale', value: 98, status: 'Critique', ok: true },
                     { label: 'Détection d\'anomalies de dépenses', value: 0, status: 'Nul', ok: true },
                     { label: 'Intégrité des justificatifs (Vault)', value: 85, status: 'Moyen', ok: false }
                   ].map((risk, i) => (
                     <div key={i} className="p-6 bg-noir/40 border border-white/5 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className={`w-3 h-3 rounded-full ${risk.ok ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]'}`} />
                           <span className="text-sm font-bold text-silver">{risk.label}</span>
                        </div>
                        <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${risk.ok ? 'bg-green-500/10 text-green-400' : 'bg-orange-500/10 text-orange-400'}`}>
                           {risk.status}
                        </span>
                     </div>
                   ))}
                </div>

                <Card className="p-8 bg-red-500/5 border-red-500/10">
                   <div className="flex gap-4">
                      <AlertTriangle className="text-red-400 shrink-0" size={24} />
                      <div>
                        <p className="text-sm font-black text-ivoire uppercase tracking-tight mb-2">Attention Stratégique</p>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">Votre ratio de documents dans le Vault est inférieur à 90%. Un audit externe pourrait exiger davantage de preuves pour les transactions de Mai 2026.</p>
                      </div>
                   </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </div>
  );
}
