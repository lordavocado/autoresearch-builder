import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Conversation {
  id: string;
  title: string;
  platform: string;
  gpu_type: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export interface Experiment {
  id: string;
  conversation_id: string;
  commit_hash: string;
  val_bpb: number;
  memory_gb: number;
  status: 'keep' | 'discard' | 'crash';
  description: string;
  created_at: string;
}
