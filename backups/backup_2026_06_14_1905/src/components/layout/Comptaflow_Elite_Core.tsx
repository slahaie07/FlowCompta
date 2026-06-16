import { Activity, Shield, Cpu, Network, Database, Globe, Lock, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export function Comptaflow_Elite_Core() {
  const systems = [
    { name: "Neural Vision OCR", status: "Online", load: "12%", icon: Cpu },
    { name: "Predictive Tax Engine", status: "Active", load: "45%", icon: Activity },
    { name: "Biometric Protocol", status: "Secured", load: "0%", icon: Lock },
    { name: "Global Sync Node", status: "Synced", load: "8%", icon: Globe },
    { name: "AES-256 Vault Core", status: "Encrypted", load: "100%", icon: Shield },
    { name: "Gemini 1.5 Ultra", status: "Deep Learning", load: "32%", icon: Zap }
  ];

  return (
    <div className="space-y-12">
      <header className="text-center space-y-4">
        <Badge variant="gold" className="px-6 py-2 font-black uppercase tracking-[0.4em] animate-pulse">Infrastructure Souveraine</Badge>
        <h1 className="text-6xl font-serif font-bold text-ivoire tracking-tighter">
          Comptaflow <span className="animated-gradient-text italic">Elite Core™</span>
        </h1>
        <p className="text-slate-500 font-medium max-w-2xl mx-auto uppercase tracking-widest text-[10px]">
          Surveillance en temps réel des sous-systèmes de l'empire ComptaFlow
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {systems.map((sys, idx) => (
          <Card key={idx} className="p-8 premium-border-gold group relative overflow-hidden" glow="gold">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 blur-2xl rounded-full -mr-12 -mt-12 group-hover:bg-gold/10 transition-colors" />
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gold/5 border border-gold/10 flex items-center justify-center text-gold group-hover:scale-110 transition-transform duration-500">
                <sys.icon size={32} />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{sys.name}</p>
                <p className="text-xl font-serif font-bold text-ivoire italic">{sys.status}</p>
              </div>
            </div>
            <div className="mt-8 space-y-2">
              <div className="flex justify-between text-[9px] font-black text-slate-600 uppercase tracking-tighter">
                 <span>Charge Système</span>
                 <span>{sys.load}</span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                 <motion.div 
                   initial={{ width: 0 }} 
                   animate={{ width: sys.load }} 
                   transition={{ duration: 2, delay: idx * 0.2 }}
                   className="h-full bg-gold"
                 />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-12 glass-panel border-gold/20 relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none" />
         <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
            <div className="space-y-6 text-center lg:text-left">
               <h2 className="text-4xl font-serif font-bold text-ivoire">Réseau de Calcul <br/><span className="text-gold italic">Décentralisé Elite.</span></h2>
               <p className="text-slate-400 max-w-lg font-medium leading-relaxed">Votre instance ComptaFlow utilise un cluster de calcul privé pour garantir une latence de réponse IA inférieure à 50ms, même lors d'analyses fiscales massives.</p>
               <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                  <Badge variant="info" className="bg-sapphire/10 text-sapphire-light border-sapphire/20 font-black">NODE: MONTREAL-01</Badge>
                  <Badge variant="info" className="bg-sapphire/10 text-sapphire-light border-sapphire/20 font-black">NODE: PARIS-ELITE-04</Badge>
                  <Badge variant="gold" className="font-black">LATENCY: 22MS</Badge>
               </div>
            </div>
            <div className="w-64 h-64 relative shrink-0">
               <div className="absolute inset-0 border-4 border-gold/10 rounded-full animate-[ping_3s_linear_infinite]" />
               <div className="absolute inset-4 border-2 border-gold/20 rounded-full animate-[spin_10s_linear_infinite]" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <Network size={80} className="text-gold/50" />
               </div>
            </div>
         </div>
      </Card>
    </div>
  );
}
