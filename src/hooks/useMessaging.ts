import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Message, UserData } from '../types';

export function useMessaging(userData: UserData | null, targetClientId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // Détermine de quel dossier on charge les messages
  const effectiveUserId = userData?.isAdmin && targetClientId ? targetClientId : userData?.id;

  useEffect(() => {
    if (!effectiveUserId) return;

    const fetchMessages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', effectiveUserId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setMessages(
          data.map(d => ({
            id: d.id,
            sender: d.sender,
            text: d.text,
            timestamp: new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            clientName: d.client_name
          }))
        );
      }
      setLoading(false);
    };

    fetchMessages();

    // Inscription aux événements Realtime
    const channel = supabase
      .channel(`messages_${effectiveUserId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `user_id=eq.${effectiveUserId}` },
        (payload) => {
          const newMsg = payload.new;
          setMessages(prev => [{
            id: newMsg.id,
            sender: newMsg.sender,
            text: newMsg.text,
            timestamp: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            clientName: newMsg.client_name
          }, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [effectiveUserId]);

  const sendMessage = async (text: string) => {
    if (!effectiveUserId || !userData) return;

    const newMessage = {
      user_id: effectiveUserId,
      sender: userData.isAdmin ? 'cpa' : 'client',
      text,
      client_name: userData.displayName
    };

    // Optimistic UI update
    const tempId = Date.now().toString();
    setMessages(prev => [{
      id: tempId,
      ...newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } as Message, ...prev]);

    const { error } = await supabase.from('messages').insert([newMessage]);
    if (error) {
      console.error("Message send error:", error);
      // Rollback optimistic update
      setMessages(prev => prev.filter(m => m.id !== tempId));
    }
  };

  return { messages, sendMessage, loading };
}
