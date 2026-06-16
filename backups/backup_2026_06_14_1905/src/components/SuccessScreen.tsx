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
    { icon: Server, label: 'Coffre-fort chiffré initialisé', delay: 1.2 },
    { icon: Search, label: 'Analyse fiscale démarrée', delay: 2.0 },
    { icon: Shield, label: 'Liaison CPA active', delay: 2.8 },
  ];

  return (
    <div className="min-h-screen bg-noir flex items-center justify-center p-6 overflow-hidden relative font-sans">
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-gold/5 rounded-full blur-[160px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gold/5 rounded-full blur-[140px]" />

      <div className="max-w-3xl w-full text-center space-y-12 z-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 bg-gradient-to-tr from-gold to-gold-light rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-gold/20"
        >
          <CheckCircle2 size={40} className="text-noir" />
        </motion.div>

        <div className="space-y-4">
          <h1 className="text-5xl font-serif text-ivoire tracking-tight italic font-bold">Bienvenue chez <span className="text-gold">Comptaflow.</span></h1>
          <p className="text-silver text-lg font-light leading-relaxed max-w-xl mx-auto">Votre demande de service a été enregistrée. Votre espace de travail sécurisé est prêt.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {steps.map((s, i) => (
            <Card key={i} className="p-6 flex items-center gap-4 bg-surface border-white/5 overflow-hidden">
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
                 <p className="text-[9px] text-gold font-bold uppercase mt-0.5 tracking-tighter">Opérationnel</p>
               </div>
            </Card>
          ))}
        </div>

        <Card className="p-10 bg-surface border-gold/20 space-y-8" glow="gold">
           <div className="flex items-center justify-between border-b border-white/5 pb-6">
              <div className="flex items-center gap-3 text-gold">
                 <FileText size={22} />
                 <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Reçu de transaction</span>
              </div>
              <Badge variant="gold" className="uppercase tracking-widest">Enregistré</Badge>
           </div>
           <div className="flex justify-between text-ivoire">
              <div className="text-left space-y-1">
                 <p className="text-xs font-bold text-slate-500 uppercase">Service Comptaflow</p>
                 <p className="text-xl font-serif italic">Frais d'ouverture & Mandats</p>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Statut</p>
                 <p className="text-3xl font-serif text-gold font-bold">Inclus</p>
              </div>
           </div>
           <div className="p-6 bg-noir/50 border border-white/5 rounded-2xl flex gap-5 items-center">
              <Clock className="text-gold shrink-0" size={28} />
              <p className="text-[11px] text-silver text-left leading-relaxed font-medium italic opacity-70">
                <strong className="text-ivoire not-italic">Note :</strong> Votre dossier est en cours de configuration. Veuillez allouer jusqu'à <span className="text-gold">24 h ouvrables</span> pour la validation finale de vos documents par votre comptable.
              </p>
           </div>
        </Card>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.5 }}>
          <Button variant="gold" size="lg" className="gap-3 px-16 h-18 text-xl rounded-2xl group shadow-gold/20" onClick={onContinue}>
             Accéder à mon portail <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
