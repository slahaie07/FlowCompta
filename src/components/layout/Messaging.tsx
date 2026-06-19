import { Send, User, Info, Lock, MessageSquare, ChevronLeft, Users } from 'lucide-react';
import { useState } from 'react';
import { UserData } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useMessaging } from '../../hooks/useMessaging';
import { useAdminClients } from '../../hooks/useAdminClients';

interface MessagingProps {
  userData: UserData;
  targetClientId?: string;
}

export function Messaging({ userData, targetClientId }: MessagingProps) {
  const [input, setInput] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(targetClientId);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const { clients } = useAdminClients(!!userData.isAdmin);

  const activeClientId = userData.isAdmin ? selectedClientId : userData.id;
  const { messages, sendMessage, loading, markAsRead } = useMessaging(userData, activeClientId);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  const selectedClient = clients.find(c => c.id === selectedClientId);

  const handleSelectClient = (clientId: string) => {
    setSelectedClientId(clientId);
    setShowMobileChat(true);
    markAsRead();
  };

  if (userData.isAdmin) {
    return (
      <div className="flex flex-col md:flex-row gap-8 h-[calc(100vh-10rem)]">

        {/* Mobile: Client list OR chat depending on state */}
        {/* Desktop: always show both side by side */}

        {/* Client list — always visible on desktop, visible on mobile when not in chat */}
        <Card className={`w-full md:w-80 p-0 overflow-hidden flex flex-col shrink-0 border-white/5 ${showMobileChat ? 'hidden md:flex' : 'flex'}`} glow="gold">
          <div className="px-6 py-5 border-b border-white/5 bg-white/5 shrink-0 flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-ivoire text-base">Canaux Clients</h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 font-black">Conversations actives</p>
            </div>
            <Badge variant="gold" className="text-[8px] py-1 px-2.5 font-black">{clients.length} Actifs</Badge>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar bg-black/20">
            {clients.length === 0 && (
              <div className="p-8 text-center text-slate-600 italic font-serif text-sm opacity-50">
                Aucun client assigné.
              </div>
            )}
            {clients.map(client => (
              <button
                key={client.id}
                onClick={() => handleSelectClient(client.id)}
                className={`w-full p-4 rounded-2xl text-left border transition-all duration-500 group relative overflow-hidden ${
                  selectedClientId === client.id
                    ? 'bg-gold/10 border-gold shadow-glow-sm'
                    : 'bg-white/5 border-white/5 hover:border-gold/30'
                }`}
              >
                <div className="flex justify-between items-start">
                  <p className="text-sm font-bold text-ivoire group-hover:text-gold transition-colors">{client.displayName}</p>
                  {client.status === 'En attente' && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />}
                </div>
                <p className="text-[10px] text-slate-500 truncate mt-1.5 font-bold uppercase tracking-tighter">{client.companyName || 'Particulier'}</p>
              </button>
            ))}
          </div>
        </Card>

        {/* Chat viewport — always on desktop, shown on mobile when client selected */}
        <Card className={`flex-1 flex flex-col p-0 relative overflow-hidden border-white/5 ${showMobileChat ? 'flex' : 'hidden md:flex'}`} glow="sapphire">
          {selectedClientId ? (
            <>
              <div className="px-6 md:px-8 py-5 md:py-6 border-b border-white/5 bg-white/5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3 md:gap-4">
                  {/* Back button on mobile */}
                  <button
                    className="md:hidden p-2 text-slate-400 hover:text-gold transition-colors rounded-xl bg-white/5"
                    onClick={() => setShowMobileChat(false)}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-sapphire/20 text-sapphire-light border border-sapphire/30 flex items-center justify-center font-bold shadow-lg">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="font-serif font-medium text-silver text-base md:text-lg tracking-tight italic">
                      {selectedClient?.displayName}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.5)]"></span>
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest hidden sm:inline">Canal Direct Sécurisé</span>
                    </div>
                  </div>
                </div>
                <Badge variant="info" className="gap-1.5 py-1 px-2 md:px-3 text-[9px]"><Lock size={10}/> AES-256</Badge>
              </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 md:space-y-8 flex flex-col-reverse custom-scrollbar bg-midnight/30">
                {loading && <div className="text-center text-slate-500 animate-pulse text-sm">Synchronisation...</div>}
                <div className="space-y-4 md:space-y-8 flex flex-col">
                  {messages.map((msg) => {
                    const isSystem = msg.sender === 'system';
                    const isMe = msg.sender === 'cpa';
                    if (isSystem) {
                      return (
                        <div key={msg.id} className="flex justify-center">
                          <div className="bg-gold/5 border border-gold/20 text-gold text-xs px-4 py-2 rounded-2xl max-w-sm text-center flex gap-2 items-center">
                            <Info size={12} className="shrink-0" />
                            <p className="font-light italic">{msg.text}</p>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className={`px-4 py-3 rounded-2xl max-w-[80%] md:max-w-md shadow-2xl transition-all hover:scale-[1.01] ${
                          isMe ? 'bg-sapphire text-white rounded-tr-sm' : 'bg-white/5 border border-white/5 text-silver rounded-tl-sm'
                        }`}>
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                        </div>
                        <span className="text-[9px] text-slate-600 font-bold uppercase mt-1.5 mx-1 tracking-widest">{msg.timestamp}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 md:p-6 border-t border-white/5 bg-obsidian/50 shrink-0">
                <div className="flex items-center gap-3 md:gap-4">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Échange sécurisé avec le client..."
                    className="flex-1 bg-white/5 border border-white/5 rounded-2xl px-4 md:px-6 py-3 md:py-4 text-sm outline-none text-silver placeholder:text-slate-600 focus:ring-1 focus:ring-gold/30 transition-all shadow-inner"
                    disabled={loading}
                  />
                  <Button
                    variant="primary"
                    className="w-12 h-12 md:w-14 md:h-14 rounded-2xl shrink-0 p-0"
                    onClick={handleSend}
                    disabled={loading}
                  >
                    <Send size={18} />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 md:p-12 space-y-6">
              <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center text-slate-600 animate-pulse">
                <MessageSquare size={36} />
              </div>
              <div className="space-y-2">
                <p className="text-silver font-serif text-2xl italic">Aucun Dossier Sélectionné</p>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
                  Sélectionnez un client pour charger la conversation.
                </p>
              </div>
              {/* Mobile shortcut to client list */}
              <Button
                variant="ghost"
                className="md:hidden gap-2 text-xs font-bold uppercase tracking-widest"
                onClick={() => setShowMobileChat(false)}
              >
                <Users size={14} /> Voir la liste des clients
              </Button>
            </div>
          )}
        </Card>
      </div>
    );
  }

  // ── Vue Client ──
  return (
    <Card className="flex flex-col h-[calc(100vh-10rem)] p-0 relative overflow-hidden border-white/5" glow="sapphire">
      <div className="px-6 md:px-8 py-5 md:py-6 border-b border-white/5 bg-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gold/20 text-gold border border-gold/30 flex items-center justify-center font-bold shadow-lg">
            <User size={20} />
          </div>
          <div>
            <h3 className="font-serif font-medium text-silver text-base md:text-lg tracking-tight italic">
              Comptable Professionnel Dédié
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.5)]"></span>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">En ligne</span>
            </div>
          </div>
        </div>
        <Badge variant="info" className="gap-1.5 py-1 px-2 md:px-3 text-[9px]"><Lock size={10}/> AES-256</Badge>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col-reverse custom-scrollbar bg-midnight/30">
        {loading && <div className="text-center text-slate-500 animate-pulse text-sm py-4">Synchronisation des échanges sécurisés...</div>}
        <div className="space-y-4 md:space-y-8 flex flex-col">
          {messages.map((msg) => {
            const isSystem = msg.sender === 'system';
            const isMe = msg.sender === 'client';
            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center">
                  <div className="bg-gold/5 border border-gold/20 text-gold text-xs px-4 py-2 rounded-2xl max-w-sm text-center flex gap-2 items-center">
                    <Info size={12} className="shrink-0" />
                    <p className="font-light italic">{msg.text}</p>
                  </div>
                </div>
              );
            }
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-3 rounded-2xl max-w-[80%] md:max-w-md shadow-2xl transition-all hover:scale-[1.01] ${
                  isMe ? 'bg-gold text-midnight rounded-tr-sm font-medium' : 'bg-white/5 border border-white/5 text-silver rounded-tl-sm'
                }`}>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
                <span className="text-[9px] text-slate-600 font-bold uppercase mt-1.5 mx-1 tracking-widest">{msg.timestamp}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4 md:p-6 border-t border-white/5 bg-obsidian/50 shrink-0">
        <div className="flex items-center gap-3 md:gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Échange sécurisé avec votre cabinet..."
            className="flex-1 bg-white/5 border border-white/5 rounded-2xl px-4 md:px-6 py-3 md:py-4 text-sm outline-none text-silver placeholder:text-slate-600 focus:ring-1 focus:ring-gold/30 transition-all shadow-inner"
            disabled={loading}
          />
          <Button
            variant="gold"
            className="w-12 h-12 md:w-14 md:h-14 rounded-2xl shrink-0 p-0"
            onClick={handleSend}
            disabled={loading}
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
    </Card>
  );
}
