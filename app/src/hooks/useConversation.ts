import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { sendMessage, saveMessage, loadMessages } from '../lib/chat';
import type { Conversation, Message, Experiment } from '../lib/supabase';

export function useConversation() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchConversations = useCallback(async () => {
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setConversations(data);
  }, []);

  const createConversation = useCallback(async () => {
    const { data, error } = await supabase
      .from('conversations')
      .insert({ title: 'New Session' })
      .select()
      .maybeSingle();
    if (error || !data) return null;
    setConversations(prev => [data, ...prev]);
    setActiveConversation(data);
    setMessages([]);
    setExperiments([]);
    return data;
  }, []);

  const selectConversation = useCallback(async (conv: Conversation) => {
    setActiveConversation(conv);
    const msgs = await loadMessages(conv.id);
    setMessages(msgs);
    const { data: exps } = await supabase
      .from('experiments')
      .select('*')
      .eq('conversation_id', conv.id)
      .order('created_at', { ascending: true });
    if (exps) setExperiments(exps);
  }, []);

  const send = useCallback(async (content: string) => {
    if (!activeConversation || !content.trim()) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      conversation_id: activeConversation.id,
      role: 'user',
      content: content.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      await saveMessage(activeConversation.id, 'user', content.trim());

      const historyForApi = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const reply = await sendMessage(historyForApi);

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        conversation_id: activeConversation.id,
        role: 'assistant',
        content: reply,
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMsg]);
      await saveMessage(activeConversation.id, 'assistant', reply);

      if (messages.length === 0) {
        const title = content.trim().slice(0, 50) || 'New Session';
        await supabase
          .from('conversations')
          .update({ title })
          .eq('id', activeConversation.id);
        setConversations(prev =>
          prev.map(c => c.id === activeConversation.id ? { ...c, title } : c)
        );
      }
    } catch (err) {
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        conversation_id: activeConversation.id,
        role: 'assistant',
        content: `Error: ${err instanceof Error ? err.message : 'Something went wrong'}. Please check that your API key (GEMINI_API_KEY or OPENAI_API_KEY) is configured as an Edge Function secret.`,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [activeConversation, messages]);

  const addExperiment = useCallback(async (exp: Omit<Experiment, 'id' | 'created_at'>) => {
    const { data } = await supabase
      .from('experiments')
      .insert(exp)
      .select()
      .maybeSingle();
    if (data) setExperiments(prev => [...prev, data]);
  }, []);

  return {
    conversations,
    activeConversation,
    messages,
    experiments,
    isLoading,
    fetchConversations,
    createConversation,
    selectConversation,
    send,
    addExperiment,
  };
}
