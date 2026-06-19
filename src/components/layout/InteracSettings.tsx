import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Mail, HelpCircle, CheckSquare, Square, Shield, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const FEE_OPTIONS = [
  { value: 'interac', label: 'Interac e-Transfert', desc: 'Aucun frais (0%)', rate: 0, flat: 0 },
  { value: 'stripe',  label: 'Stripe',              desc: '2.9% + 0.30$ par transaction', rate: 0.029, flat: 0.30 },
  { value: 'paypal',  label: 'PayPal',              desc: '3.49% + 0.49$ par transaction', rate: 0.0349, flat: 0.49 },
  { value: 'custom',  label: 'Personnalisé',        desc: 'Définissez votre propre taux', rate: 0, flat: 0 },
];

interface InteracSettingsProps {
  userData: any;
}

export function InteracSettings({ userData }: InteracSettingsProps) {
  const [interacEmail, setInteracEmail] = useState('');
  const [interacQuestion, setInteracQuestion] = useState('');
  const [interacAutodepot, setInteracAutodepot] = useState(true);
  const [feeType, setFeeType] = useState('interac');
  const [customFeeRate, setCustomFeeRate] = useState('0');
  const [customFeeFlat, setCustomFeeFlat] = useState('0');
  const [loading, setLoading] = useState(false);

  // Charger les paramètres actuels du sub_admin
  useEffect(() => {
    async function loadSettings() {
      if (!userData || !userData.id) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('interac_email, interac_question, interac_autodepot')
          .eq('id', userData.id)
          .single();

        if (error) throw error;
        if (data) {
          setInteracEmail(data.interac_email || '');
          setInteracQuestion(data.interac_question || '');
          setInteracAutodepot(data.interac_autodepot !== false);
          setFeeType(data.fee_type || 'interac');
          setCustomFeeRate(String(data.fee_rate || 0));
          setCustomFeeFlat(String(data.fee_flat || 0));
        }
      } catch (err) {
        console.error("Erreur de chargement des paramètres Interac :", err);
      }
    }
    loadSettings();
  }, [userData]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const selectedFee = FEE_OPTIONS.find(f => f.value === feeType);
      const finalRate = feeType === 'custom' ? parseFloat(customFeeRate) / 100 : (selectedFee?.rate ?? 0);
      const finalFlat = feeType === 'custom' ? parseFloat(customFeeFlat) : (selectedFee?.flat ?? 0);

      const { error } = await supabase
        .from('profiles')
        .update({
          interac_email: interacEmail.toLowerCase().trim(),
          interac_question: interacAutodepot ? null : interacQuestion,
          interac_autodepot: interacAutodepot,
          fee_type: feeType,
          fee_rate: finalRate,
          fee_flat: finalFlat,
        })
        .eq('id', userData.id);

      if (error) throw error;
      toast.success("Vos paramètres de facturation Interac ont été sauvegardés.");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erreur de sauvegarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-5xl font-serif font-bold text-ivoire tracking-tight leading-tight">
          Paramètres <span className="animated-gradient-text italic">Interac.</span>
        </h1>
        <div className="flex items-center gap-3 mt-3">
          <span className="w-8 h-[1px] bg-gold/50"></span>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Configuration des encaissements par virements Interac pour votre cabinet</p>
        </div>
      </header>

      <Card className="p-8 max-w-2xl premium-border-gold relative overflow-hidden" glow="gold">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl rounded-full -mr-16 -mt-16" />
        
        <h2 className="text-2xl font-serif text-ivoire mb-2 font-bold flex items-center gap-2">
          <Shield className="text-gold" size={22} /> Vos Coordonnées de Paiement
        </h2>
        <p className="text-xs text-slate-500 mb-8 leading-relaxed">
          Saisissez l'adresse courriel à laquelle vos clients doivent envoyer les virements de factures.
          Si vous n'avez pas activé le dépôt automatique, configurez une question de sécurité et fournissez la réponse à vos clients.
        </p>

        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 block">
              Adresse courriel de dépôt Interac
            </label>
            <Input
              type="email"
              placeholder="virement@moncabinet.ca"
              icon={<Mail size={18} className="text-gold/40" />}
              value={interacEmail}
              onChange={(e) => setInteracEmail(e.target.value)}
              required
              className="bg-noir border-white/10 focus:border-gold/50"
            />
          </div>

          <div className="flex items-center gap-3 py-2 cursor-pointer select-none" onClick={() => setInteracAutodepot(!interacAutodepot)}>
            <div className="text-gold">
              {interacAutodepot ? <CheckSquare size={22} /> : <Square size={22} />}
            </div>
            <div>
              <p className="text-sm font-semibold text-ivoire">Dépôt Automatique (Auto-dépot) activé</p>
              <p className="text-[10px] text-slate-500">Cochez si vos virements Interac s'encaissent sans question de sécurité.</p>
            </div>
          </div>

          {!interacAutodepot && (
            <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 block">
                  Question de sécurité standard
                </label>
                <Input
                  type="text"
                  placeholder="Exemple: Quel outil utilisez-vous?"
                  icon={<HelpCircle size={18} className="text-gold/40" />}
                  value={interacQuestion}
                  onChange={(e) => setInteracQuestion(e.target.value)}
                  required={!interacAutodepot}
                  className="bg-noir border-white/10 focus:border-gold/50"
                />
              </div>
              <div className="text-xs text-amber-500 bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl leading-relaxed">
                ℹ️ Les clients verront cette question et devront utiliser le mot de passe convenu avec vous (par exemple, votre nom de cabinet en minuscules) pour compléter le virement.
              </div>
            </div>
          )}

          {/* Section frais de traitement */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 block mb-1 flex items-center gap-2">
                <DollarSign size={12} className="text-gold" /> Mode de paiement des clients
              </label>
              <p className="text-[10px] text-slate-600 mb-4 leading-relaxed">
                Sélectionnez comment vos clients paient. Les frais seront automatiquement déduits du revenu net dans le Grand Livre.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {FEE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFeeType(opt.value)}
                    className={`p-4 rounded-2xl text-left border transition-all duration-300 ${
                      feeType === opt.value ? 'border-gold bg-gold/10 text-gold' : 'border-white/10 bg-white/5 text-slate-400 hover:border-gold/30'
                    }`}
                  >
                    <p className="text-sm font-bold">{opt.label}</p>
                    <p className="text-[10px] mt-1 opacity-70">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {feeType === 'custom' && (
              <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-4 duration-300">
                <Input
                  label="Taux (%)"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="Ex: 2.90"
                  value={customFeeRate}
                  onChange={e => setCustomFeeRate(e.target.value)}
                  className="bg-noir border-white/10"
                />
                <Input
                  label="Frais fixe ($)"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ex: 0.30"
                  value={customFeeFlat}
                  onChange={e => setCustomFeeFlat(e.target.value)}
                  className="bg-noir border-white/10"
                />
              </div>
            )}
          </div>

          <Button
            type="submit"
            variant="gold"
            className="px-12 h-14 uppercase tracking-widest font-black text-xs mt-4 w-full"
            isLoading={loading}
          >
            Sauvegarder les Paramètres
          </Button>
        </form>
      </Card>
    </div>
  );
}
