import { Send, User, Shield, Info, Lock } from 'lucide-react';
import { useState } from 'react';
import { UserData } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useMessaging } from '../../hooks/useMessaging';

interface MessagingProps {
  userData: UserData;
  targetClientId?: string; // Optionnel : Utilisé par l'admin pour spécifier le client
}

export function Messaging({ userData, targetClientId }: MessagingProps) {
  const [input, setInput] = useState('');
  const { messages, sendMessage, loading } = useMessaging(userData, targetClientId);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-10rem)] p-0 relative overflow-hidden" glow="sapphire">
      <div className="px-8 py-6 border-b border-white/5 bg-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-lg ${userData.isAdmin ? 'bg-sapphire/20 text-sapphire-light border border-sapphire/30' : 'bg-gold/20 text-gold border border-gold/30'}`}>
            <User size={24} />
          </div>
          <div>
            <h3 className="font-serif font-medium text-silver text-lg tracking-tight italic">
              {userData.isAdmin ? 'Canal Communication Clients' : 'Expert CPA Dédié'}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
               <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.5)]"></span>
               <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Opérationnel</span>
            </div>
          </div>
        </div>
        <Badge variant="info" className="gap-1.5 py-1 px-3"><Lock size={12}/> Chiffré AES-256</Badge>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 flex flex-col-reverse custom-scrollbar bg-midnight/30">
        {loading && <div className="text-center text-slate-500 animate-pulse text-sm">Synchronisation des échanges sécurisés...</div>}
        <div className="space-y-8 flex flex-col">
          {messages.map((msg) => {
            const isSystem = msg.sender === 'system';
            const isMe = userData.isAdmin ? msg.sender === 'cpa' : msg.sender === 'client';

            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center">
                  <div className="bg-gold/5 border border-gold/20 text-gold text-xs px-6 py-3 rounded-2xl max-w-lg text-center flex gap-3 items-center">
                    <Info size={14} className="shrink-0" />
                    <p className="font-light italic">{msg.text}</p>
                  </div>
                </div>
              );
            }

            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {userData.isAdmin && msg.clientName && !isMe && (
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter ml-1 mb-2">{msg.clientName}</span>
                )}
                <div className={`px-5 py-3 rounded-2xl max-w-md shadow-2xl transition-all hover:scale-[1.01] ${
                  isMe ? 
                  (userData.isAdmin ? 'bg-sapphire text-white rounded-tr-sm' : 'bg-gold text-midnight rounded-tr-sm font-medium') 
                  : 'bg-white/5 border border-white/5 text-silver rounded-tl-sm'
                }`}>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
                <span className="text-[9px] text-slate-600 font-bold uppercase mt-2 mx-1 tracking-widest">{msg.timestamp}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-6 border-t border-white/5 bg-obsidian/50 shrink-0">
        <div className="flex items-center gap-4">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Échange sécurisé avec votre cabinet..." 
            className="flex-1 bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm outline-none text-silver placeholder:text-slate-600 focus:ring-1 focus:ring-gold/30 transition-all shadow-inner"
            disabled={loading || (!userData.isAdmin && !userData.id) || (userData.isAdmin && !targetClientId)}
          />
          <Button 
            variant={userData.isAdmin ? 'primary' : 'gold'}
            className="w-14 h-14 rounded-2xl shrink-0 p-0"
            onClick={handleSend}
            disabled={loading || (!userData.isAdmin && !userData.id) || (userData.isAdmin && !targetClientId)}
          >
            <Send size={20} />
          </Button>
        </div>
      </div>
    </Card>
  );
}
