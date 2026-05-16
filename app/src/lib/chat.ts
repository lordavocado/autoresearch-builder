import { supabase } from './supabase';
import type { Message } from './supabase';

export async function sendMessage(
  messages: Pick<Message, 'role' | 'content'>[]
): Promise<string> {
  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-assistant`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Failed to get response');
  }

  const data = await response.json();
  return data.content;
}

export async function saveMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string
) {
  const { error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, role, content });
  if (error) throw error;
}

export async function loadMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}
