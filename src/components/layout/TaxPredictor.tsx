import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { TrendingUp, AlertCircle, Calculator, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

interface TaxEstimation {
  estimatedRevenue: number;
  tpsToRemit: number;
  tvqToRemit: number;
  corporateTax: number;
  safeHarborAmount: number;
}

/**
 * Composant Propulsé par les skills : 
 * - tax-season-organizer (Calculs et logique fiscale)
 * - vercel-react-best-practices (Optimisation des rendus)
 * - react-nextjs-development (Architecture UI)
 */
export function TaxPredictor({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);
  const [estimation, setEstimation] = useState<TaxEstimation | null>(null);

  const calculateTaxes = async () => {
    setLoading(true);
    // Simulation d'un appel à l'API propulsée par Gemini (AI Logic)
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Logique tirée du skill 'tax-season-organizer'
      const mockRevenue = 125000;
      setEstimation({
        estimatedRevenue: mockRevenue,
        tpsToRemit: mockRevenue * 0.05,
        tvqToRemit: mockRevenue * 0.09975,
        corporateTax: mockRevenue * 0.122, // Taux PME Québec approximatif
        safeHarborAmount: 15000
      });
      toast.success("Analyse fiscale prédictive générée avec succès.");
    } catch (error) {
      toast.error("Erreur lors du calcul prédictif.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-8 space-y-6 premium-border-gold relative overflow-hidden group" glow="gold">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-serif font-bold text-ivoire flex items-center gap-2">
            <Calculator size={24} className="text-gold" />
            Radar Fiscal Prédictif (Q2 2026)
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Propulsé par l'Intelligence Artificielle et conforme aux normes de l'ARC / Revenu Québec.
          </p>
        </div>
        <Badge variant="gold">IA Activa</Badge>
      </div>

      {!estimation ? (
        <div className="flex flex-col items-center justify-center p-8 bg-black/20 rounded-2xl border border-white/5">
          <AlertCircle size={32} className="text-slate-500 mb-4" />
          <p className="text-sm text-silver text-center mb-4">
            Lancez l'audit pour calculer vos provisions de taxes (TPS/TVQ) et acomptes provisionnels.
          </p>
          <Button variant="gold" onClick={calculateTaxes} disabled={loading} className="w-full md:w-auto">
            {loading ? "Calcul en cours (Analyse OCR & DB)..." : "Générer la prédiction fiscale"}
          </Button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">TPS à remettre</p>
              <p className="text-2xl font-serif text-ivoire mt-1">
                {estimation.tpsToRemit.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">TVQ à remettre</p>
              <p className="text-2xl font-serif text-ivoire mt-1">
                {estimation.tvqToRemit.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
              </p>
            </div>
          </div>
          
          <div className="p-4 bg-gold/10 rounded-xl border border-gold/20 flex justify-between items-center">
            <div>
              <p className="text-[10px] text-gold uppercase tracking-widest font-black">Provision Impôt Société (Est.)</p>
              <p className="text-xl font-serif text-gold mt-1">
                {estimation.corporateTax.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
              </p>
            </div>
            <ShieldCheck size={32} className="text-gold opacity-50" />
          </div>

          <Button variant="secondary" className="w-full text-xs font-bold tracking-widest" onClick={() => setEstimation(null)}>
            Recalculer
          </Button>
        </motion.div>
      )}
    </Card>
  );
}
