import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Message, UserData } from '../types';

const SEED_MESSAGES: Record<string, Omit<Message, 'timestamp'>[]> = {
  mock_client_1: [
    { id: 'seed_1_1', sender: 'system', text: 'Établissement du canal chiffré sécurisé de bout en bout.', clientName: 'Système' },
    { id: 'seed_1_2', sender: 'client', text: "Bonjour, j'ai téléversé mes relevés bancaires BMO pour mai. Tout est en ordre ?", clientName: 'Samuel Tremblay' },
    { id: 'seed_1_3', sender: 'cpa', text: "Bonjour Samuel, oui bien reçu. J'ai lancé l'analyse par notre robot IA et les transactions sont réconciliées à 98%. Je finalise la validation demain.", clientName: 'Auditeur Suprême' }
  ],
  mock_client_2: [
    { id: 'seed_2_1', sender: 'system', text: 'Établissement du canal chiffré sécurisé de bout en bout.', clientName: 'Système' },
    { id: 'seed_2_2', sender: 'client', text: "Bonjour, j'ai une question sur les déclarations de TPS/TVQ pour le trimestre.", clientName: 'Valérie Roy' },
    { id: 'seed_2_3', sender: 'cpa', text: "Bonjour Valérie. Vos rapports trimestriels sont prêts dans l'onglet Documents. Vous pouvez les signer électroniquement.", clientName: 'Auditeur Suprême' }
  ],
  mock_client_3: [
    { id: 'seed_3_1', sender: 'system', text: 'Établissement du canal chiffré sécurisé de bout en bout.', clientName: 'Système' },
    { id: 'seed_3_2', sender: 'client', text: "Bonjour, quand est-ce que ma déclaration T2 sera envoyée à l'ARC ?", clientName: 'Marc-André Gagnon' },
    { id: 'seed_3_3', sender: 'cpa', text: "Bonjour Marc-André. Il nous manque les pièces de salaires du dernier mois pour clore le dossier. Veuillez les téléverser dans le coffre-fort.", clientName: 'Auditeur Suprême' }
  ]
};

const getDefaultSeed = (name: string) => [
  { id: 'seed_def_1', sender: 'system', text: 'Établissement du canal chiffré sécurisé de bout en bout.', clientName: 'Système' },
  { id: 'seed_def_2', sender: 'cpa', text: `Bonjour ${name}! Je suis ravi de vous accompagner dans votre gestion comptable. N'hésitez pas à me poser vos questions ici ou à déposer vos pièces de comptabilité.`, clientName: 'Auditeur Suprême' }
];

export function useMessaging(userData: UserData | null, targetClientId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // Détermine de quel dossier on charge les messages
  const effectiveUserId = userData?.isAdmin && targetClientId ? targetClientId : userData?.id;

  useEffect(() => {
    if (!effectiveUserId) return;

    let isMock = false;
    const localSession = localStorage.getItem('comptaflow_mock_session');
    if (localSession) {
      isMock = true;
    } else {
      isMock = effectiveUserId.startsWith('mock_');
    }

    if (isMock) {
      setLoading(true);
      const localKey = `comptaflow_mock_messages_${effectiveUserId}`;
      const savedMessages = localStorage.getItem(localKey);
      
      if (savedMessages) {
        try {
          setMessages(JSON.parse(savedMessages));
        } catch (e) {
          localStorage.removeItem(localKey);
        }
      } else {
        // Initialiser avec les données simulées (seed)
        const seedSource = SEED_MESSAGES[effectiveUserId] || getDefaultSeed(userData?.displayName || 'Client');
        const formattedSeed: Message[] = seedSource.map((msg, index) => ({
          ...msg,
          timestamp: new Date(Date.now() - (seedSource.length - index) * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })).reverse(); // Afficher les plus récents en premier
        
        localStorage.setItem(localKey, JSON.stringify(formattedSeed));
        setMessages(formattedSeed);
      }
      setLoading(false);
      return;
    }

    const fetchMessages = async () => {
      setLoading(true);
      try {
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
      } catch (err) {
        console.warn("Échec récupération des messages réels (offline ?)");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Inscription aux événements Realtime
    let channel: any;
    try {
      channel = supabase
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
    } catch (e) {
      console.warn("Realtime channel subscription bypassed.");
    }

    return () => {
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch (e) {}
      }
    };
  }, [effectiveUserId]);

  const sendMessage = async (text: string) => {
    if (!effectiveUserId || !userData) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: userData.isAdmin ? 'cpa' : 'client',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      clientName: userData.displayName || 'Cabinet'
    };

    let isMock = false;
    const localSession = localStorage.getItem('comptaflow_mock_session');
    if (localSession) {
      isMock = true;
    } else {
      isMock = effectiveUserId.startsWith('mock_');
    }

    if (isMock) {
      const localKey = `comptaflow_mock_messages_${effectiveUserId}`;
      const savedMessages = localStorage.getItem(localKey);
      let list: Message[] = [];
      if (savedMessages) {
        try {
          list = JSON.parse(savedMessages);
        } catch (e) {}
      }
      const updated = [newMessage, ...list];
      localStorage.setItem(localKey, JSON.stringify(updated));
      setMessages(updated);

      // Simulation de réponse automatique de l'IA après 1.5s
      if (!userData.isAdmin) {
        setTimeout(() => {
          const reply: Message = {
            id: (Date.now() + 1).toString(),
            sender: 'cpa',
            text: `[IA Comptaflow] J'ai bien reçu votre message : "${text}". Notre équipe comptable l'analyse et y donnera suite dans les meilleurs délais.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            clientName: 'Expert Comptable'
          };
          const savedMessagesLater = localStorage.getItem(localKey);
          let currentList: Message[] = [];
          if (savedMessagesLater) {
            try {
              currentList = JSON.parse(savedMessagesLater);
            } catch (e) {}
          }
          const finalUpdated = [reply, ...currentList];
          localStorage.setItem(localKey, JSON.stringify(finalUpdated));
          setMessages(finalUpdated);
        }, 1500);
      }
      return;
    }

    // Optimistic UI update
    const tempId = Date.now().toString();
    setMessages(prev => [newMessage, ...prev]);

    try {
      const { error } = await supabase.from('messages').insert([{
        user_id: effectiveUserId,
        sender: newMessage.sender,
        text: newMessage.text,
        client_name: newMessage.clientName
      }]);
      
      if (error) throw error;
    } catch (error) {
      console.error("Message send error:", error);
      // Rollback optimistic update
      setMessages(prev => prev.filter(m => m.id !== tempId));
    }
  };

  return { messages, sendMessage, loading };
}
