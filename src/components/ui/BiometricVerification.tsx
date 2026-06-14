import { ShieldCheck, Fingerprint, Scan, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../ui/Card';

export function BiometricVerification({ onVerified }: { onVerified: () => void }) {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success'>('idle');

  const startScan = () => {
    setStatus('scanning');
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => {
        onVerified();
      }, 1000);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-noir/90 backdrop-blur-xl">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full p-1">
        <Card className="p-12 text-center space-y-8 premium-border-gold" glow="gold">
           <div className="relative mx-auto w-32 h-32">
              <AnimatePresence mode="wait">
                {status === 'idle' && (
                  <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={startScan} className="cursor-pointer">
                    <Fingerprint size={80} className="mx-auto text-gold/40 hover:text-gold transition-colors duration-500" />
                  </motion.div>
                )}
                {status === 'scanning' && (
                  <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative">
                    <Scan size={80} className="mx-auto text-gold" />
                    <motion.div 
                      className="absolute inset-0 border-t-2 border-gold"
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                  </motion.div>
                )}
                {status === 'success' && (
                  <motion.div key="success" initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-green-500/20 rounded-full p-6 border border-green-500/50">
                    <ShieldCheck size={80} className="text-green-400" />
                  </motion.div>
                )}
              </AnimatePresence>
           </div>
           
           <div className="space-y-2">
              <h3 className="text-2xl font-serif font-bold text-ivoire">Authentification <span className="text-gold">Souveraine.</span></h3>
              <p className="text-xs text-slate-500 font-black uppercase tracking-[0.3em]">Signature Biométrique Requise pour le Vault</p>
           </div>

           <p className="text-sm text-slate-400 font-medium">Placez votre identité au centre du scanneur pour déverrouiller vos archives confidentielles.</p>

           <div className="pt-4 flex items-center justify-center gap-2 text-gold/60 text-[9px] font-black uppercase tracking-widest">
              <Lock size={12} /> Sécurisé par le protocole ComptaFlow
           </div>
        </Card>
      </motion.div>
    </div>
  );
}
