/*
  # Create Autoresearch Assistant Schema

  1. New Tables
    - `conversations`
      - `id` (uuid, primary key)
      - `title` (text) - conversation title
      - `platform` (text) - user's platform (mac/windows/linux)
      - `gpu_type` (text) - user's GPU info
      - `created_at` (timestamptz)
    - `messages`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, foreign key)
      - `role` (text) - 'user' or 'assistant'
      - `content` (text) - message content
      - `created_at` (timestamptz)
    - `experiments`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, foreign key)
      - `commit_hash` (text) - short git commit hash
      - `val_bpb` (numeric) - validation bits per byte score
      - `memory_gb` (numeric) - peak VRAM in GB
      - `status` (text) - keep/discard/crash
      - `description` (text) - what this experiment tried
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for anonymous access (personal tool, no auth required)
      using a session-based approach with conversation_id
*/

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'New Session',
  platform text DEFAULT '',
  gpu_type text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read conversations"
  ON conversations FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert conversations"
  ON conversations FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update conversations"
  ON conversations FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read messages"
  ON messages FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert messages"
  ON messages FOR INSERT
  TO anon
  WITH CHECK (true);

-- Experiments table
CREATE TABLE IF NOT EXISTS experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  commit_hash text NOT NULL DEFAULT '',
  val_bpb numeric NOT NULL DEFAULT 0,
  memory_gb numeric NOT NULL DEFAULT 0,
  status text NOT NULL CHECK (status IN ('keep', 'discard', 'crash')) DEFAULT 'keep',
  description text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read experiments"
  ON experiments FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert experiments"
  ON experiments FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete experiments"
  ON experiments FOR DELETE
  TO anon
  USING (true);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_experiments_conversation_id ON experiments(conversation_id, created_at);
