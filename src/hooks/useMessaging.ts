import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Message, UserData } from '../types';

export function useMessaging(userData: UserData | null, targetClientId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const effectiveUserId = userData?.isAdmin && targetClientId ? targetClientId : userData?.id;

  const mapMessage = (d: any): Message => ({
    id: d.id,
    sender: d.sender === 'accountant' ? 'cpa' : d.sender,
    text: d.body || d.text || '',
    timestamp: new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    clientName: userData?.displayName || 'Utilisateur',
  });

  useEffect(() => {
    if (!effectiveUserId) { setLoading(false); return; }

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('user_id', effectiveUserId)
          .order('created_at', { ascending: true });

        if (!error && data) {
          setMessages(data.map(mapMessage));
        }
      } catch (err) {
        console.warn("Récupération des messages échouée:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    const channel = supabase
      .channel(`messages_${effectiveUserId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `user_id=eq.${effectiveUserId}` },
        (payload) => setMessages(prev => [...prev, mapMessage(payload.new)])
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [effectiveUserId]);

  const sendMessage = async (text: string) => {
    if (!effectiveUserId || !userData) return;

    const optimistic: Message = {
      id: Date.now().toString(),
      sender: userData.isAdmin ? 'cpa' : 'client',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      clientName: userData.displayName || 'Utilisateur',
    };

    setMessages(prev => [...prev, optimistic]);

    try {
      const { error } = await supabase.from('messages').insert({
        user_id: effectiveUserId,
        sender: userData.isAdmin ? 'accountant' : 'client',
        body: text,
      });

      if (error) throw error;
    } catch (err) {
      console.error("Erreur envoi message:", err);
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
    }
  };

  return { messages, sendMessage, loading };
}
