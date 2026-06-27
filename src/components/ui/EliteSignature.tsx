import { PenTool, CheckCircle2, ShieldCheck, Lock, Download, FileText } from 'lucide-react';
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { toast } from 'sonner';

export function EliteSignature({ contract, onComplete }: { contract: { title: string, content: string }, onComplete: (signatureData?: string) => void }) {
  const [step, setStatus] = useState<'review' | 'signing' | 'certified'>('review');
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const startSigning = () => setStatus('signing');

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      setSignatureData(null);
    }
  };

  const finalize = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL();
      setSignatureData(dataUrl);
      setStatus('certified');
      toast.success("Mandat certifié numériquement.");
      setTimeout(() => onComplete(dataUrl), 3000);
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;
    if ('touches' in e) {
      if (e.touches.length === 0) return;
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.nativeEvent.offsetX;
      y = e.nativeEvent.offsetY;
    }

    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setSignatureData('signing');
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;
    if ('touches' in e) {
      if (e.touches.length === 0) return;
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.nativeEvent.offsetX;
      y = e.nativeEvent.offsetY;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    setSignatureData('signed');
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-noir/95 backdrop-blur-2xl flex items-center justify-center p-6">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-4xl w-full">
        <Card className="premium-border-gold overflow-hidden" glow="gold">
          <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
             <div className="flex items-center gap-4">
                <div className="p-2 bg-gold/10 rounded-lg"><PenTool size={20} className="text-gold" /></div>
                <h2 className="text-2xl font-serif font-bold text-ivoire italic">{contract.title}</h2>
             </div>
             <Badge variant="gold" className="font-black uppercase tracking-[0.2em]">{step === 'certified' ? 'Scellé' : 'Action Requise'}</Badge>
          </div>

          <div className="p-10 max-h-[60vh] overflow-y-auto custom-scrollbar bg-noir/40">
             <AnimatePresence mode="wait">
                {step === 'review' && (
                  <motion.div key="review" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                     <div className="text-slate-400 font-medium leading-relaxed whitespace-pre-line text-sm border-l-2 border-gold/20 pl-8">
                        {contract.content}
                     </div>
                     <div className="pt-10 flex justify-end">
                        <Button variant="gold" className="px-12 h-14 shadow-glow font-black uppercase text-xs tracking-widest rounded-2xl" onClick={startSigning}>
                           Accepter & Signer
                        </Button>
                     </div>
                  </motion.div>
                )}

                {step === 'signing' && (
                  <motion.div key="signing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center space-y-8">
                     <p className="text-ivoire font-serif text-xl italic text-center">Apposez votre signature manuscrite dans le cadre ci-dessous</p>
                     <div className="w-full h-64 bg-noir/80 border-2 border-dashed border-gold/20 rounded-[2rem] relative overflow-hidden cursor-crosshair">
                        <canvas 
                          ref={canvasRef}
                          width={800}
                          height={256}
                          className="w-full h-full block bg-transparent"
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={stopDrawing}
                        />
                     </div>
                     <div className="flex gap-6 w-full">
                        <Button variant="ghost" className="flex-1 h-14 uppercase font-black text-[10px]" onClick={clearCanvas}>Effacer</Button>
                        <Button variant="gold" className="flex-[2] h-14 shadow-glow uppercase font-black text-[10px]" onClick={finalize} disabled={!signatureData || signatureData === 'signing'}>Certifier le Mandat</Button>
                     </div>
                  </motion.div>
                )}

                {step === 'certified' && (
                  <motion.div key="certified" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center space-y-8 py-20">
                     <div className="relative">
                        <div className="absolute inset-0 border-4 border-gold/20 rounded-full animate-[ping_2s_linear_infinite]" />
                        <div className="w-32 h-32 bg-green-500/20 border border-green-500/50 rounded-full flex items-center justify-center text-green-400">
                           <ShieldCheck size={64} />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <h3 className="text-3xl font-serif font-bold text-ivoire">Authentification Réussie.</h3>
                        <p className="text-slate-500 uppercase tracking-widest text-[10px] font-black">Empreinte Digitale Scellée : SHA-256 / AES-256</p>
                     </div>
                     <div className="flex gap-4">
                        <Badge variant="info" className="bg-white/5 border-white/10 text-silver py-2 px-6">ID: {Math.random().toString(36).substring(7).toUpperCase()}</Badge>
                        <Badge variant="info" className="bg-white/5 border-white/10 text-silver py-2 px-6">IP: 204.18.2.1</Badge>
                     </div>
                  </motion.div>
                )}
             </AnimatePresence>
          </div>

          <div className="p-6 bg-gold text-midnight flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.3em]">
             <Lock size={14} /> Sécurisé par le Protocole ComptaFlow Souverain
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
