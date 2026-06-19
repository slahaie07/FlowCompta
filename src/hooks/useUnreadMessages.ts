import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useUnreadMessages(userId?: string, isAdmin?: boolean) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    const key = `cf_msg_seen_global_${userId}`;
    const lastSeen = parseInt(localStorage.getItem(key) || '0', 10);
    const lastSeenISO = new Date(lastSeen || Date.now() - 7 * 24 * 3600 * 1000).toISOString();

    const senderFilter = isAdmin ? 'client' : 'accountant';

    const fetchUnread = async () => {
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('sender', senderFilter)
        .gt('created_at', lastSeenISO);

      setUnreadCount(count || 0);
    };

    fetchUnread();

    const channel = supabase
      .channel(`unread_${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        if (payload.new.sender === senderFilter) {
          setUnreadCount(prev => prev + 1);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId, isAdmin]);

  const markAllRead = () => {
    if (!userId) return;
    localStorage.setItem(`cf_msg_seen_global_${userId}`, Date.now().toString());
    setUnreadCount(0);
  };

  return { unreadCount, markAllRead };
}
