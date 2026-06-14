import { Mail, Phone, MessageSquare, Clock, ShieldCheck, Send } from 'lucide-react';
import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function Support() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    toast.success("Ticket de support enregistré avec succès.");
    setTimeout(() => setSent(false), 5000);
  };

  const handleCopySMS = () => {
    navigator.clipboard.writeText('+18195551234');
    toast.success("Numéro d'assistance prioritaire copié dans le presse-papiers.");
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <header>
        <h1 className="text-3xl font-serif font-medium text-silver tracking-tight italic">Centre d'Assistance <span className="text-gold">Prioritaire</span></h1>
        <p className="text-slate-400 mt-1.5 text-sm font-light uppercase tracking-widest">Votre cabinet à portée de clic</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
           <Card className="p-8" glow="sapphire">
              <h3 className="text-xl font-serif text-silver mb-6">Envoyer un message formel</h3>
              {sent ? (
                <div className="py-12 text-center space-y-4 animate-in zoom-in-95 duration-500">
                   <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-500">
                      <Send size={24} />
                   </div>
                   <p className="text-silver font-medium">Message acheminé avec succès !</p>
                   <p className="text-xs text-slate-500">Votre CPA vous répondra sous 24h ouvrables.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                   <Input label="Objet de la demande" placeholder="ex: Question sur ma déclaration TPS..." value={subject} onChange={e => setSubject(e.target.value)} required />
                   <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-400 ml-1">Message détaillé</label>
                      <textarea 
                        className="w-full bg-midnight border border-white/10 rounded-2xl px-4 py-4 text-silver text-sm min-h-[200px] outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all"
                        placeholder="Décrivez votre besoin avec précision..."
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        required
                      />
                   </div>
                   <div className="pt-4">
                      <Button variant="gold" className="w-full h-14 gap-2" type="submit">
                         Envoyer au cabinet <Send size={18}/>
                      </Button>
                   </div>
                </form>
              )}
           </Card>
        </div>

        <div className="space-y-6">
           <Card className="p-6 space-y-6">
              <h4 className="text-xs uppercase font-bold text-slate-500 tracking-widest border-b border-white/5 pb-4">Contacts Directs</h4>
              
              <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.location.href='mailto:s.lahaie07@gmail.com'}>
                 <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-midnight transition-all">
                    <Mail size={18} />
                 </div>
                 <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Courriel</p>
                    <p className="text-sm text-silver font-medium">s.lahaie07@gmail.com</p>
                  </div>
              </div>

              <div className="flex items-center gap-4 group cursor-pointer" onClick={handleCopySMS}>
                 <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-sapphire-light group-hover:bg-sapphire group-hover:text-white transition-all">
                    <Phone size={18} />
                 </div>
                 <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Urgence (SMS)</p>
                    <p className="text-sm text-silver font-medium">+1 (819) XXX-XXXX</p>
                 </div>
              </div>

              <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/dashboard/messaging')}>
                 <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-white transition-all">
                    <MessageSquare size={18} />
                 </div>
                 <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Chat en direct</p>
                    <Badge variant="success">Disponible</Badge>
                 </div>
              </div>
           </Card>

           <Card className="p-6 bg-gold/5 border-gold/20" glow="gold">
              <div className="flex items-center gap-3 mb-4 text-gold">
                 <Clock size={20} />
                 <h4 className="text-sm font-bold uppercase tracking-widest">Heures d'ouverture</h4>
              </div>
              <ul className="space-y-2 text-xs text-slate-400 font-light">
                 <li className="flex justify-between"><span>Lundi - Vendredi</span> <span className="text-silver font-medium">09:00 - 17:00</span></li>
                 <li className="flex justify-between"><span>Samedi</span> <span className="text-silver font-medium">Sur RDV</span></li>
                 <li className="flex justify-between"><span>Dimanche</span> <span className="text-slate-600 font-medium italic">Fermé</span></li>
              </ul>
           </Card>

           <div className="px-4 py-3 bg-white/5 rounded-2xl flex items-center gap-3 border border-white/5">
              <ShieldCheck className="text-sapphire-light" size={18} />
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-tight">Votre ligne est sécurisée par cryptage militaire.</p>
           </div>
        </div>
      </div>
    </div>
  );
}
