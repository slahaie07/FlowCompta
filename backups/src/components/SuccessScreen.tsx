import { motion } from 'motion/react';
import { CheckCircle2, Shield, ArrowRight, Server, Search, UserCheck, FileText, Clock } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

interface SuccessScreenProps {
  onContinue: () => void;
}

export function SuccessScreen({ onContinue }: SuccessScreenProps) {
  const steps = [
    { icon: UserCheck, label: 'Identité Vérifiée', delay: 0.5 },
    { icon: Server, label: 'Coffre-fort AES-256 Initialisé', delay: 1.2 },
    { icon: Search, label: 'Analyse Fiscale Automatisée', delay: 2.0 },
    { icon: Shield, label: 'Liaison CPA Activée', delay: 2.8 },
  ];

  return (
    <div className="min-h-screen bg-midnight flex items-center justify-center p-6 overflow-hidden relative">
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-sapphire/10 rounded-full blur-[160px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gold/5 rounded-full blur-[140px]" />

      <div className="max-w-3xl w-full text-center space-y-12 z-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 bg-gradient-to-tr from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-green-500/20"
        >
          <CheckCircle2 size={40} className="text-white" />
        </motion.div>

        <div className="space-y-4">
          <h1 className="text-5xl font-serif text-silver tracking-tight animated-gradient-text font-bold">Paiement <span className="italic">Confirmé.</span></h1>
          <p className="text-slate-400 text-lg font-light leading-relaxed max-w-xl mx-auto">Votre demande de service a été traitée. Votre espace de travail est prêt.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {steps.map((s, i) => (
            <Card key={i} className="p-6 flex items-center gap-4 bg-white/5 border-white/5 overflow-hidden">
               <motion.div 
                 initial={{ x: -20, opacity: 0 }} 
                 animate={{ x: 0, opacity: 1 }} 
                 transition={{ delay: s.delay }}
                 className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold"
               >
                 <s.icon size={20} />
               </motion.div>
               <div className="text-left">
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{s.label}</p>
                 <p className="text-[9px] text-green-500 font-bold uppercase mt-0.5">Actif</p>
               </div>
            </Card>
          ))}
        </div>

        <Card className="p-8 bg-gold/[0.03] border-gold/20 space-y-6" glow="gold" withAurora>
           <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3 text-gold">
                 <FileText size={20} />
                 <span className="text-sm font-bold uppercase tracking-widest">Reçu de Transaction</span>
              </div>
              <Badge variant="success">Payé</Badge>
           </div>
           <div className="flex justify-between text-silver">
              <div className="text-left space-y-1">
                 <p className="text-xs font-bold text-slate-500">Service ComptaFlow</p>
                 <p className="text-lg font-serif italic font-medium tracking-tight">Frais de démarrage & Premier mois</p>
              </div>
              <div className="text-right">
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Total Débité</p>
                 <p className="text-3xl font-serif text-gold font-bold">Inclus $</p>
              </div>
           </div>
           <div className="p-5 bg-white/5 rounded-2xl flex gap-4 items-center">
              <Clock className="text-gold shrink-0" size={24} />
              <p className="text-[11px] text-slate-400 text-left leading-relaxed font-medium italic">
                <strong className="text-silver not-italic">Note Importante :</strong> Votre dossier est en cours de création. Veuillez allouer jusqu'à <span className="text-gold">48 heures ouvrables</span> pour l'ouverture complète de votre portail et l'application des services sélectionnés.
              </p>
           </div>
        </Card>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.5 }}>
          <Button variant="gold" size="lg" className="gap-3 px-12 h-16 text-lg rounded-2xl group shadow-glow" onClick={onContinue}>
             Accéder à mon Portail <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
