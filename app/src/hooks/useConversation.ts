import { useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { sendMessage, saveMessage, loadMessages } from '../lib/chat';
import type { Conversation, Message, Experiment } from '../lib/supabase';

export function useConversation() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const activeRef = useRef<Conversation | null>(null);
  const messagesRef = useRef<Message[]>([]);

  activeRef.current = activeConversation;
  messagesRef.current = messages;

  const fetchConversations = useCallback(async () => {
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setConversations(data);
  }, []);

  const createConversation = useCallback(async (platform?: string) => {
    const { data, error } = await supabase
      .from('conversations')
      .insert({ title: 'New Session', platform: platform || '' })
      .select()
      .maybeSingle();
    if (error || !data) return null;
    setConversations(prev => [data, ...prev]);
    setActiveConversation(data);
    setMessages([]);
    setExperiments([]);
    activeRef.current = data;
    return data;
  }, []);

  const selectConversation = useCallback(async (conv: Conversation) => {
    setActiveConversation(conv);
    activeRef.current = conv;
    try {
      const msgs = await loadMessages(conv.id);
      setMessages(msgs);
      messagesRef.current = msgs;
      const { data: exps } = await supabase
        .from('experiments')
        .select('*')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: true });
      if (exps) setExperiments(exps);
    } catch {
      setMessages([]);
      setExperiments([]);
    }
  }, []);

  const send = useCallback(async (content: string, conversationOverride?: Conversation) => {
    const conv = conversationOverride || activeRef.current;
    if (!conv || !content.trim()) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      conversation_id: conv.id,
      role: 'user',
      content: content.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      await saveMessage(conv.id, 'user', content.trim());

      const historyForApi = [...messagesRef.current, userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const reply = await sendMessage(historyForApi);

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        conversation_id: conv.id,
        role: 'assistant',
        content: reply,
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMsg]);
      await saveMessage(conv.id, 'assistant', reply);

      if (messagesRef.current.length === 0) {
        const title = content.trim().slice(0, 50) || 'New Session';
        await supabase
          .from('conversations')
          .update({ title })
          .eq('id', conv.id);
        setConversations(prev =>
          prev.map(c => c.id === conv.id ? { ...c, title } : c)
        );
      }
    } catch (err) {
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        conversation_id: conv.id,
        role: 'assistant',
        content: `Error: ${err instanceof Error ? err.message : 'Something went wrong'}. Please check that your API key (GEMINI_API_KEY or OPENAI_API_KEY) is configured as an Edge Function secret.`,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addExperiment = useCallback(async (exp: Omit<Experiment, 'id' | 'created_at'>) => {
    const { data } = await supabase
      .from('experiments')
      .insert(exp)
      .select()
      .maybeSingle();
    if (data) setExperiments(prev => [...prev, data]);
  }, []);

  const importExperiments = useCallback(async (tsv: string, conversationId: string) => {
    const lines = tsv.trim().split('\n');
    const hasHeader = lines[0]?.includes('commit') || lines[0]?.includes('val_bpb');
    const dataLines = hasHeader ? lines.slice(1) : lines;

    const parsed: Omit<Experiment, 'id' | 'created_at'>[] = dataLines
      .filter(line => line.trim())
      .map(line => {
        const parts = line.split('\t');
        return {
          conversation_id: conversationId,
          commit_hash: parts[0]?.trim() || '',
          val_bpb: parseFloat(parts[1]) || 0,
          memory_gb: parseFloat(parts[2]) || 0,
          status: (['keep', 'discard', 'crash'].includes(parts[3]?.trim()) ? parts[3].trim() : 'keep') as 'keep' | 'discard' | 'crash',
          description: parts[4]?.trim() || '',
        };
      });

    if (parsed.length === 0) return 0;

    const { data } = await supabase
      .from('experiments')
      .insert(parsed)
      .select();
    if (data) setExperiments(prev => [...prev, ...data]);
    return data?.length || 0;
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
    importExperiments,
  };
}
