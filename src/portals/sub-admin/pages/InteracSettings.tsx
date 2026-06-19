import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Mail, HelpCircle, CheckSquare, Square, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface InteracSettingsProps {
  userData: any;
}

export function InteracSettings({ userData }: InteracSettingsProps) {
  const [interacEmail, setInteracEmail] = useState('');
  const [interacQuestion, setInteracQuestion] = useState('');
  const [interacAutodepot, setInteracAutodepot] = useState(true);
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
      const { error } = await supabase
        .from('profiles')
        .update({
          interac_email: interacEmail.toLowerCase().trim(),
          interac_question: interacAutodepot ? null : interacQuestion,
          interac_autodepot: interacAutodepot
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

          <Button
            type="submit"
            variant="gold"
            className="px-12 h-14 uppercase tracking-widest font-black text-xs mt-4"
            isLoading={loading}
          >
            Sauvegarder les Paramètres
          </Button>
        </form>
      </Card>
    </div>
  );
}
